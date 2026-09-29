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
    expect(cash.indexOf("2026")).toBeLessThan(cash.indexOf("Kč"));
    expect(cash.indexOf("Kč")).toBeLessThan(cash.indexOf("211.001 - Pokladna"));
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

  it("Escape vrátí text a výběr změní stejnou hodnotu i popisek v identitě", async () => {
    let last = base;
    const view = render(<Form onChange={(next: typeof base) => { last = next; }} />);
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    const search = await view.findByPlaceholderText("Hledat účet nebo číslo…");
    fireEvent.keyDown(search, { key: "Escape" });
    expect(view.getByText("311.001 - Odběratelé")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Změnit účet" }));
    await act(async () => fireEvent.click(await view.findByRole("option", { name: /311\.100/ })));
    expect(last.mainAccountId).toBe("311100");
    expect(view.getByText("311.100 - Odběratelé tuzemsko")).toBeTruthy();
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
});