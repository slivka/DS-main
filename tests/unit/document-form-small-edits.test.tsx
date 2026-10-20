/** Formulář dokladu · pořadí plateb FV, neověřený dodavatel, reference pohybu a Ctrl+Enter. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { DocumentForm } = await import("../../src/components/ds/accounting/document-form");

afterEach(cleanup);

const base = {
  bookId: "fp",
  number: "FP1",
  accountingDate: "2026-09-29",
  issueDate: "2026-09-29",
  dueDate: "2026-10-10",
  variableSymbol: "20260123",
  constantSymbol: "0308",
  specificSymbol: "77",
  currency: "CZK",
  rate: 1,
  amountTotal: 1000,
  totalMode: "entered" as const,
  mainAccountId: "321001",
  partnerId: "p1",
};

function Form({
  initial = base,
  ...props
}: { initial?: Record<string, unknown> } & Record<string, unknown>) {
  const [value, setValue] = React.useState(initial);
  return (
    <DocumentForm
      title="Doklad"
      status="draft"
      documentType="FP"
      value={value}
      onChange={setValue}
      lines={[]}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      currencies={[{ code: "CZK", label: "Koruna", symbol: "Kč" }]}
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      mainSide="D"
      partners={[{ id: "p1", code: "P1", name: "Dodavatel" }]}
      {...props}
    />
  );
}

const follows = (a: Element | null, b: Element | null) =>
  Boolean(a && b && a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe("DocumentForm – drobné úpravy", () => {
  it("vydaná faktura: Uhradit na bankovní účet stojí před Způsobem platby", () => {
    const view = render(
      <Form
        documentType="FV"
        companyBankAccountOptions={[
          { id: "a", label: "Hlavní", account: "1/0100", currency: "CZK" },
        ]}
        paymentMethodOptions={[{ value: "bank", label: "Převodem" }]}
      />,
    );
    const account = view.container.querySelector("#document-companyBankAccountId");
    const method = view.container.querySelector("#document-paymentMethodId");
    expect(follows(account, method)).toBe(true);
  });

  it("ručně zadaný dodavatel má štítek i při vypnutém Vstupuje do DPH", () => {
    const view = render(
      <Form
        counterpartyInput="manual"
        vat={{ visible: true }}
        initial={{ ...base, vatRelevant: false }}
      />,
    );
    expect(view.getByText("Neověřený dodavatel")).toBeTruthy();
    cleanup();
    const hidden = render(<Form counterpartyInput="manual" vat={{ visible: false }} />);
    expect(hidden.getByText("Neověřený dodavatel")).toBeTruthy();
  });

  it("dodavatel z adresáře štítek nemá", () => {
    const view = render(<Form counterpartyInput="partner" vat={{ visible: true }} />);
    expect(view.queryByText("Neověřený dodavatel")).toBeNull();
  });

  it("bankovní pohyb s IBAN nahradí KS a SS polem Reference, VS zůstává", () => {
    const change = mock();
    const view = render(
      <Form
        documentType="BA"
        initial={{ ...base, bankAccountKind: "iban", paymentReference: "E2E-1" }}
        onChange={change}
      />,
    );
    const reference = view.container.querySelector<HTMLInputElement>("#document-paymentReference");
    expect(reference?.value).toBe("E2E-1");
    expect(view.container.querySelector("#document-constantSymbol")).toBeNull();
    expect(view.container.querySelector("#document-specificSymbol")).toBeNull();
    expect(view.container.querySelector("#document-variableSymbol")).not.toBeNull();
    if (!reference) throw new Error("Chybí reference");
    fireEvent.change(reference, { target: { value: "E2E-2" } });
    expect(change.mock.calls.at(-1)?.[0]).toMatchObject({ paymentReference: "E2E-2" });
  });

  it("tuzemský bankovní pohyb má KS a SS a žádnou referenci", () => {
    const view = render(
      <Form documentType="BA" initial={{ ...base, bankAccountKind: "domestic" }} />,
    );
    expect(view.container.querySelector("#document-paymentReference")).toBeNull();
    expect(view.container.querySelector("#document-specificSymbol")).not.toBeNull();
  });

  it("Ctrl+Enter zavolá Uložit a zavřít jen při povoleném uložení", () => {
    const close = mock();
    const save = mock();
    const view = render(<Form saveAction={{ onSave: save, dirty: true }} onSaveAndClose={close} />);
    const root = view.container.querySelector("#document-variableSymbol") ?? view.container;
    fireEvent.keyDown(root, { key: "Enter", ctrlKey: true });
    expect(close).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
    fireEvent.keyDown(root, { key: "s", metaKey: true });
    expect(save).toHaveBeenCalledTimes(1);
    cleanup();
    const blocked = mock();
    const locked = render(
      <Form saveAction={{ onSave: save, dirty: true, disabled: true }} onSaveAndClose={blocked} />,
    );
    fireEvent.keyDown(
      locked.container.querySelector("#document-variableSymbol") ?? locked.container,
      {
        key: "Enter",
        ctrlKey: true,
      },
    );
    expect(blocked).not.toHaveBeenCalled();
  });
});
