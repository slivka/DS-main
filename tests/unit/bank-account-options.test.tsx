/** Účty z adresáře · vlastní testy zápisu a hledání · nesmí testovat zdrojové řetězce. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  BankAccountField,
  type BankAccountOption,
} from "../../src/components/ds/accounting/bank-account-field";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { ReceivedBankAccountField } from "../../src/components/ds/accounting/received-bank-account-field";
import { DS_TEXTS_CS } from "../../src/ds-texts";
afterEach(cleanup);
const iban = "CZ6508000000192000145399";
const formatted = "CZ65 0800 0000 1920 0014 5399";
const options: BankAccountOption[] = [
  { id: "iban", iban, label: "Zahraniční" },
  { id: "both", number: "2000145399", bankCode: "0800", iban },
  { id: "number", number: "2000145399", bankCode: "0800" },
];
describe("BankAccountField", () => {
  for (const option of options)
    it(`zobrazí účet ${option.id} bez chybějících částí`, () => {
      const view = render(
        <BankAccountField
          value={option.id ?? ""}
          options={options}
          onChange={() => {}}
          selectionOnly
        />,
      );
      expect(view.getByRole("combobox").textContent).toBe(
        option.id === "iban" ? formatted : "2000145399/0800",
      );
    });
  it("najde IBAN i u účtu s tuzemským číslem a vybere stabilní ID", () => {
    const change = mock();
    const view = render(
      <BankAccountField value="" options={options} onChange={change} selectionOnly />,
    );
    fireEvent.click(view.getByRole("combobox"));
    const search = view.getAllByRole("combobox").find((element) => element.tagName === "INPUT");
    if (!search) throw new Error("Chybí hledání účtů");
    fireEvent.change(search, { target: { value: iban } });
    expect(view.getAllByRole("option")).toHaveLength(2);
    fireEvent.click(view.getAllByRole("option")[0] as HTMLElement);
    expect(change).toHaveBeenCalledWith("iban");
  });
  it("IBAN bez ID má stabilní neformátovanou hodnotu", () => {
    const view = render(
      <BankAccountField value={iban} options={[{ iban }]} onChange={() => {}} selectionOnly />,
    );
    expect(view.getByRole("combobox").textContent).toBe(formatted);
  });
  it("najde formátovaný začátek IBAN i u tuzemského účtu", () => {
    const view = render(
      <BankAccountField value="" options={options} onChange={() => {}} selectionOnly />,
    );
    fireEvent.click(view.getByRole("combobox"));
    const search = view.getAllByRole("combobox").find((element) => element.tagName === "INPUT");
    if (!search) throw new Error("Chybí hledání účtů");
    fireEvent.change(search, { target: { value: "CZ65 0800" } });
    expect(view.getAllByRole("option")).toHaveLength(2);
  });
  it("za běhu vyřadí neúplné účty i s vybraným ID", () => {
    const data = JSON.parse('[{"id":"missing"},{"id":"partial","number":"123"}]');
    const view = render(
      <BankAccountField
        value="missing"
        options={[...options, ...data]}
        onChange={() => {}}
        selectionOnly
      />,
    );
    expect(view.getByRole("combobox").textContent).toContain(
      DS_TEXTS_CS.documentForm.bankAccountMissing,
    );
    fireEvent.click(view.getByRole("combobox"));
    expect(view.getAllByRole("option")).toHaveLength(4);
    expect(view.queryByText("123")).toBeNull();
  });
  it("přijatý doklad ukáže IBAN uvnitř pole platebního příkazu", () => {
    const view = render(
      <DocumentForm
        title="FP"
        documentType="FP"
        status="draft"
        value={{ partnerId: "partner", partnerBankAccountId: "iban", currency: "EUR" }}
        onChange={() => {}}
        lines={[]}
        onLinesChange={() => {}}
        books={[]}
        accounts={[]}
        bankAccountOptions={options}
        paymentOrderEnabled
      />,
    );
    expect(
      view.container.querySelector('[data-slot="payment-order-account"] [role="combobox"]')
        ?.textContent,
    ).toBe(formatted);
  });
});
describe("ReceivedBankAccountField", () => {
  it("ruční přijatý účet zachová IBAN bez čísla", () => {
    const t = DS_TEXTS_CS.documentForm;
    const view = render(
      <ReceivedBankAccountField
        value={{ text: "", iban, swift: "GIBACZPX" }}
        onChange={() => {}}
        isHomeCurrency={false}
        texts={{
          accountLabel: t.manualAccountNumber,
          accountWithoutIbanLabel: t.manualAccountWithoutIban,
          validation: {
            account: t.bankAccountInvalid,
            bankCode: t.bankCodeInvalid,
            bankCodeRequired: t.bankCodeRequired,
            iban: t.invalidIban,
            swift: t.invalidSwift,
            swiftRequired: t.swiftRequired,
            accountRequired: t.accountRequired,
            accountOrIban: t.accountOrIban,
          },
        }}
      />,
    );
    expect(view.getByLabelText("IBAN").getAttribute("value")).toBe(iban);
    expect(view.queryByText(t.accountRequired)).toBeNull();
  });
});
