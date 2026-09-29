import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeAll, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({ useLayoutEffect: React.useLayoutEffect }));
if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { act, cleanup, fireEvent, render } = await import("@testing-library/react");
const { DocumentForm, documentIdentityVariantForType } = await import("../../src/components/ds/accounting/document-form");

const accounts = [{ code: "311001", name: "Odběratelé" }, { code: "311100", name: "Odběratelé tuzemsko" }];
const currencies = [{ code: "CZK", symbol: "Kč" }, { code: "EUR", symbol: "€" }];
const base = { bookId: "fv", number: "FV1", accountingDate: "2026-09-29", issueDate: "2026-09-29", currency: "CZK", rate: 1, amountTotal: 1000, totalMode: "entered" as const, mainAccountId: "311001" };
const identity = { variant: "invoice" as const, book: "FV - Vydané faktury", period: "2026", account: { side: "MD" as const, label: "311.001 - Odběratelé", editable: true }, number: "FV1" };

function Form(props: Record<string, unknown> = {}) {
  const [value, setValue] = React.useState(base);
  return <DocumentForm title="Vydaná faktura" status="draft" documentType="FV" identity={identity} value={value} onChange={setValue} lines={[]} onLinesChange={() => {}} books={[]} accounts={accounts} mainAccountOptions={accounts} currencies={currencies} homeCurrency="CZK" homeCurrencySymbol="Kč" mainSide="MD" {...props} />;
}

beforeAll(() => { if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" }); });
afterEach(() => cleanup());
afterAll(async () => { if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister(); });

describe("DocumentForm 2.68 – jednotná identita", () => {
  it("odvodí tři varianty včetně nových typů", () => {
    expect(documentIdentityVariantForType("PO")).toBe("cashBank");
    expect(documentIdentityVariantForType("DDPZ")).toBe("invoice");
    expect(documentIdentityVariantForType("KR")).toBe("internal");
  });

  it("řadí položky cashBank, invoice a internal a invoice bez účtu nemá štítek", () => {
    const view = render(<Form identity={{ variant: "cashBank", book: "PO - Pokladna", period: "2026", account: { side: "MD", label: "211.001 - Pokladna" }, number: "PO1" }} directionBadge="in" value={{ ...base, currency: "EUR" }} />);
    const cash = view.container.querySelector("[data-slot=document-identity]")?.textContent ?? "";
    expect(cash.indexOf("PO - Pokladna")).toBeLessThan(cash.indexOf("2026"));
    expect(cash.indexOf("2026")).toBeLessThan(cash.indexOf("€"));
    expect(cash.indexOf("€")).toBeLessThan(cash.indexOf("211.001 - Pokladna"));
    view.rerender(<Form identity={{ variant: "invoice", book: "ZFV - Zálohy", period: "2026", number: "ZFV1" }} />);
    const invoice = view.container.querySelector("[data-slot=document-identity]")?.textContent ?? "";
    expect(invoice).toContain("ZFV - Zálohy");
    expect(invoice).not.toContain("MD");
    view.rerender(<Form identity={{ variant: "internal", book: "ID - Interní doklady", period: "2026", number: "ID1" }} documentType="ID" />);
    const internal = view.container.querySelector("[data-slot=document-identity]")?.textContent ?? "";
    expect(internal.indexOf("ID - Interní doklady")).toBeLessThan(internal.indexOf("2026"));
  });

  it("ukáže tužku jen pro editovatelný účet a respektuje zámky", () => {
    const view = render(<Form />);
    expect(view.getByRole("button", { name: "Změnit účet" })).toBeTruthy();
    view.rerender(<Form identity={{ ...identity, account: { ...identity.account, editable: false } }} />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
    view.rerender(<Form mainAccountLocked />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
    view.rerender(<Form identity={{ ...identity, account: { ...identity.account, disabledReason: "Doklad je spárovaný" } }} />);
    expect(view.getByRole("button", { name: "Změnit účet" }).hasAttribute("disabled")).toBe(true);
  });

  it("Escape vrátí text a fokus; výběr aktualizuje value i popisek", async () => {
    let last = base;
    function Tracked() {
      const [value, setValue] = React.useState(base);
      return <Form value={value} onChange={(next: typeof base) => { last = next; setValue(next); }} />;
    }
    const view = render(<Tracked />);
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    expect(view.getByRole("combobox", { name: "Hlavní účet" })).toBeTruthy();
    const search = await view.findByPlaceholderText("Hledat účet nebo číslo…");
    await act(async () => { fireEvent.keyDown(search, { key: "Escape" }); });
    expect(view.getByText("311.001 - Odběratelé")).toBeTruthy();
    expect(document.activeElement).toBe(view.getByRole("button", { name: "Změnit účet" }));
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    await act(async () => fireEvent.click(await view.findByRole("option", { name: /311\.100/ })));
    expect(last.mainAccountId).toBe("311100");
    expect(view.getByText("311.100 - Odběratelé tuzemsko")).toBeTruthy();
    expect(document.activeElement).toBe(view.getByRole("button", { name: "Změnit účet" }));
  });

  it("nemá dolní Hlavní účet, měnu řadí za Celkem a kurz jen u cizí měny", () => {
    const view = render(<Form />);
    expect(view.queryByText("Hlavní účet")).toBeNull();
    const group = view.container.querySelector("[data-slot=document-amount-currency]")?.textContent ?? "";
    expect(group.indexOf("Celkem za doklad")).toBeLessThan(group.indexOf("Měna"));
    expect(view.container.querySelector("#document-rate")).toBeNull();
    view.rerender(<Form value={{ ...base, currency: "EUR", rate: 24.3 }} />);
    expect(view.container.querySelector("#document-rate")).toBeTruthy();
    view.rerender(<Form documentType="PO" identity={{ variant: "cashBank", book: "PO", period: "2026", account: { side: "MD", label: "211.001" } }} />);
    expect(view.container.querySelector("[data-slot=document-amount-currency] #document-currency")).toBeNull();
  });

  it("skryje tužku při readOnly, bez oprávnění, u cashBank a bez mainAccountOptions", () => {
    const view = render(<Form readOnly />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
    view.rerender(<Form editableFields={["description"]} />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
    view.rerender(<Form documentType="PO" identity={{ ...identity, variant: "cashBank" }} />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
    view.rerender(<Form mainAccountOptions={[]} />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
    view.rerender(<Form mainAccountOptions={undefined} />);
    expect(view.queryByRole("button", { name: "Změnit účet" })).toBeNull();
  });

  it("nabídka obsahuje jen mainAccountOptions", async () => {
    const view = render(<Form accounts={[...accounts, { code: "604001", name: "Tržby za zboží" }]} mainAccountOptions={[accounts[0]]} />);
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    await view.findByPlaceholderText("Hledat účet nebo číslo…");
    const options = view.getAllByRole("option").map((item) => item.textContent ?? "");
    expect(options.length).toBe(1);
    expect(options.join(" ")).not.toContain("604");
  });

  it("popisek po vrácení value, u jiného dokladu i po novém popisku bere z identity", async () => {
    function Host({ docValue, accountLabel = identity.account.label }: { docValue: typeof base; accountLabel?: string }) {
      const [value, setValue] = React.useState(docValue);
      React.useEffect(() => setValue(docValue), [docValue]);
      return <Form identity={{ ...identity, account: { ...identity.account, label: accountLabel } }} value={value} onChange={setValue} />;
    }
    const view = render(<Host docValue={base} />);
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    await act(async () => fireEvent.click(await view.findByRole("option", { name: /311\.100/ })));
    expect(view.getByText("311.100 - Odběratelé tuzemsko")).toBeTruthy();
    view.rerender(<Host docValue={{ ...base }} />);
    expect(view.queryByText("311.100 - Odběratelé tuzemsko")).toBeNull();
    expect(view.getByText("311.001 - Odběratelé")).toBeTruthy();
    view.rerender(<Host docValue={{ ...base, number: "FV2" }} />);
    expect(view.getByText("311.001 - Odběratelé")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    await act(async () => fireEvent.click(await view.findByRole("option", { name: /311\.100/ })));
    expect(view.getByText("311.100 - Odběratelé tuzemsko")).toBeTruthy();
    view.rerender(<Host docValue={{ ...base, number: "FV2", mainAccountId: "311100" }} accountLabel="311.100 - Závazný popisek aplikace" />);
    expect(view.queryByText("311.100 - Odběratelé tuzemsko")).toBeNull();
    expect(view.getByText("311.100 - Závazný popisek aplikace")).toBeTruthy();
  });

  it("kliknutí mimo zavře nabídku a vrátí fokus", async () => {
    const view = render(<Form />);
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    await view.findByPlaceholderText("Hledat účet nebo číslo…");
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 20)); });
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    await act(async () => {
      outside.dispatchEvent(new window.PointerEvent("pointerdown", { bubbles: true, button: 0, pointerType: "mouse" }));
      outside.dispatchEvent(new window.PointerEvent("pointerup", { bubbles: true, button: 0, pointerType: "mouse" }));
      outside.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    });
    outside.remove();
    expect(view.queryByPlaceholderText("Hledat účet nebo číslo…") === null).toBe(true);
    expect(view.getByText("311.001 - Odběratelé")).toBeTruthy();
    expect(document.activeElement).toBe(view.getByRole("button", { name: "Změnit účet" }));
  });

  it("zakázaná tužka s důvodem jde zaměřit klávesnicí", () => {
    const view = render(<Form identity={{ ...identity, account: { ...identity.account, disabledReason: "Doklad je spárovaný" } }} />);
    const wrapper = view.container.querySelector<HTMLElement>("[data-slot=document-identity-account-locked]");
    expect(wrapper?.getAttribute("tabindex")).toBe("0");
    expect(wrapper?.getAttribute("aria-label")).toContain("Doklad je spárovaný");
  });

  it("currencyLocked ukáže měnu jako text vedle Celkem, currencyDisabledReason zakázaný výběr s tooltipem", () => {
    const view = render(<Form currencyLocked />);
    const group = view.container.querySelector("[data-slot=document-amount-currency]");
    const read = group?.querySelector("#document-currency");
    expect(read?.getAttribute("aria-readonly")).toBe("true");
    expect(read?.textContent).toBe("CZK");
    view.rerender(<Form currencyDisabledReason="Doklad je spárovaný" />);
    const wrap = view.container.querySelector("[data-slot=document-amount-currency] [aria-label='Doklad je spárovaný']");
    expect(wrap?.getAttribute("tabindex")).toBe("0");
    expect(wrap?.querySelector("button")?.hasAttribute("disabled")).toBe(true);
  });

  it("výběr měny: ve spouštěči kód, v nabídce kód - název", async () => {
    const view = render(<Form currencies={[{ code: "CZK", label: "Česká koruna", symbol: "Kč" }, { code: "EUR", label: "Euro", symbol: "€" }]} />);
    const trigger = view.container.querySelector("#document-currency");
    expect(trigger?.textContent).toContain("CZK");
    expect(trigger?.textContent).not.toContain("Česká koruna");
    fireEvent.click(trigger as HTMLElement);
    expect(await view.findByRole("option", { name: "CZK - Česká koruna" })).toBeTruthy();
    expect(view.getByRole("option", { name: "EUR - Euro" })).toBeTruthy();
  });

  it("Celkem má minimální šířku, nezalamovaný popisek a nápovědu pod polem jen v režimu součtu", () => {
    const view = render(<Form value={{ ...base, amountTotal: 1234567.89 }} />);
    const amount = view.container.querySelector("[data-slot=document-amount-total]");
    expect(amount?.className).toContain("min-w-[11.5rem]");
    expect(amount?.querySelector("label span")?.className).toContain("whitespace-nowrap");
    expect(view.container.querySelector("[data-slot=document-amount-currency]")?.className).toContain("flex-wrap");
    expect(view.queryByText("Sčítá se z rozpisu", { selector: "p" })).toBeNull();
    view.rerender(<Form value={{ ...base, amountTotal: 1234567.89, totalMode: "sum" }} lines={[{ id: "1", amount: 1234567.89 }]} />);
    const hint = view.getByText("Sčítá se z rozpisu", { selector: "p" });
    expect(hint.className).toContain("whitespace-nowrap");
    expect(view.container.querySelector("[data-slot=document-amount-total] label")?.textContent).not.toContain("Sčítá se z rozpisu");
  });

  it("internal má měnu vedle Celkem a nikdy nevykreslí účet", () => {
    const view = render(<Form documentType="ID" identity={{ variant: "internal", book: "ID - Interní", period: "2026", account: { side: "MD", label: "395.001 - Vnitřní zúčtování", editable: true }, number: "ID1" }} />);
    const text = view.container.querySelector("[data-slot=document-identity]")?.textContent ?? "";
    expect(text).not.toContain("395.001");
    expect(text).not.toContain("MD");
    expect(view.container.querySelector("[data-slot=document-amount-currency] #document-currency")).toBeTruthy();
  });

  it("invoice bez účtu nemá koncový oddělovač", () => {
    const view = render(<Form identity={{ variant: "invoice", book: "ZFV - Zálohy", period: "2026", number: "ZFV1" }} />);
    const row = view.container.querySelector("[data-slot=document-identity] > div > div");
    const separators = row?.querySelectorAll("[aria-hidden=true].w-px") ?? [];
    expect(separators.length).toBe(1);
    expect(row?.lastElementChild?.lastElementChild?.textContent).toBe("2026");
  });

  it("document-form.tsx neobsahuje pevné Kč ani CZK", async () => {
    const source = await Bun.file(new URL("../../src/components/ds/accounting/document-form.tsx", import.meta.url)).text();
    expect(source).not.toContain("Kč");
    expect(source).not.toContain("CZK");
  });
});
