import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, describe, expect, it } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { BankAccountField } = await import("../../src/components/ds/accounting/bank-account-field");
const { DocumentForm, vsFromDocumentNumber } = await import("../../src/components/ds/accounting/document-form");

const base = { bookId: "fp", number: "FP1", accountingDate: "2026-09-29", issueDate: "2026-09-29", dueDate: "2026-10-10", taxDate: "2026-09-29", vatDate: "2026-09-01", externalNumber: "FA-2026/0123", variableSymbol: "20260123", bankAccount: "19-2000145399/0800", currency: "EUR", rate: 24.3, amountTotal: 1000, totalMode: "entered" as const, mainAccountId: "321001" };

function Form({ initial = base, ...props }: { initial?: typeof base } & Record<string, unknown>) {
  const [value, setValue] = React.useState(initial);
  return <DocumentForm title="Přijatá faktura" status="draft" documentType="FP" value={value} onChange={setValue} lines={[]} onLinesChange={() => {}} books={[]} accounts={[]} currencies={[{ code: "EUR", label: "Euro", symbol: "€" }]} homeCurrency="CZK" homeCurrencySymbol="Kč" mainSide="D" {...props} />;
}

afterEach(() => cleanup());
afterAll(async () => { if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister(); });

describe("DocumentForm 2.73", () => {
  it("odvodí VS jen z 1 až 10 číslic", () => {
    expect(vsFromDocumentNumber("FA-2026/0123")).toBe("20260123");
    expect(vsFromDocumentNumber("0012")).toBe("0012");
    expect(vsFromDocumentNumber(" 20 26 / 01 ")).toBe("202601");
    expect(vsFromDocumentNumber("bez číslic")).toBeNull();
    expect(vsFromDocumentNumber("12345678901")).toBeNull();
  });

  it("změna čísla obnoví automatický VS, ale nepřepíše ruční", () => {
    const auto = render(<Form />);
    fireEvent.change(auto.container.querySelector("#document-externalNumber") as HTMLInputElement, { target: { value: "FA-2026/0456" } });
    expect((auto.container.querySelector("#document-variableSymbol") as HTMLInputElement).value).toBe("20260456");
    cleanup();
    const manual = render(<Form initial={{ ...base, variableSymbol: "777" }} />);
    fireEvent.change(manual.container.querySelector("#document-externalNumber") as HTMLInputElement, { target: { value: "FA-2026/0456" } });
    expect((manual.container.querySelector("#document-variableSymbol") as HTMLInputElement).value).toBe("777");
  });

  it("přijatý doklad řadí Platební údaje před Částku a má číslo span 6", () => {
    const view = render(<Form />);
    const text = view.container.textContent ?? "";
    expect(text.indexOf("Platební údaje")).toBeLessThan(text.indexOf("Částka"));
    expect(view.container.querySelector("#document-externalNumber")?.closest(".col-span-20")?.className).toContain("col-span-6");
    expect(view.container.querySelector("[data-slot=document-payment-section] #document-bankAccount")).toBeNull();
  });

  it("mění popisek čísla podle viditelné DPH", () => {
    const payer = render(<Form vat={{ visible: true }} />);
    expect(payer.getByText("Číslo daňového dokladu")).toBeTruthy();
    cleanup();
    const nonPayer = render(<Form vat={{ visible: false }} />);
    expect(nonPayer.getByText("Číslo dokladu dodavatele")).toBeTruthy();
  });

  it("dlouhé číslo ponechá VS a ukáže nápovědu", () => {
    const view = render(<Form />);
    fireEvent.change(view.container.querySelector("#document-externalNumber") as HTMLInputElement, { target: { value: "12345678901" } });
    expect((view.container.querySelector("#document-variableSymbol") as HTMLInputElement).value).toBe("20260123");
    expect(view.getByText("Číslo má víc než 10 číslic – VS doplňte ručně")).toBeTruthy();
  });

  it("živé datumové varování je v pruhu a po odebrání zmizí", () => {
    const view = render(<Form dateWarnings={{ taxDate: "DUZP je mimo období" }} vat={{ visible: true }} />);
    expect(view.container.querySelector("[data-slot=document-form-notices]")?.textContent).toContain("DUZP je mimo období");
    expect(view.container.querySelector("#document-taxDate")?.className).toContain("border-warning");
    view.rerender(<Form dateWarnings={{}} vat={{ visible: true }} />);
    expect(view.container.querySelector("[data-slot=document-form-notices]")?.textContent ?? "").not.toContain("DUZP je mimo období");
  });
});

describe("BankAccountField 2.73", () => {
  it("nemění prázdnou hodnotu podle výchozí možnosti", () => {
    let value = "";
    render(<BankAccountField value={value} onChange={(next) => { value = next; }} options={[{ number: "19-2000145399", bankCode: "0800", default: true }]} />);
    expect(value).toBe("");
  });

  it("ověří modulo 11 a předaný kód banky", () => {
    const view = render(<BankAccountField value="123456789/9999" onChange={() => {}} bankCodes={["0800"]} invalidAccountText="Neplatný účet" invalidBankCodeText="Neplatná banka" />);
    expect(view.getByRole("alert").textContent).toBe("Neplatná banka");
    view.rerender(<BankAccountField value="123456789/0800" onChange={() => {}} bankCodes={["0800"]} invalidAccountText="Neplatný účet" invalidBankCodeText="Neplatná banka" />);
    expect(view.getByRole("alert").textContent).toBe("Neplatný účet");
    view.rerender(<BankAccountField value="19-2000145399/0800" onChange={() => {}} bankCodes={["0800"]} invalidAccountText="Neplatný účet" invalidBankCodeText="Neplatná banka" />);
    expect(view.queryByRole("alert")).toBeNull();
  });
});