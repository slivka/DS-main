/** Formulář dokladu · pořadí plateb FV, neověřený dodavatel, reference pohybu a Ctrl+Enter. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
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
  for (const modifier of ["ctrlKey", "metaKey"]) {
    it(`${modifier}+Enter z data uloží a zavře, samotný Enter jen potvrdí datum`, () => {
      const close = mock();
      const view = render(
        <Form saveAction={{ onSave: mock(), dirty: true }} onSaveAndClose={close} />,
      );
      const input = view.container.querySelector<HTMLInputElement>("#document-issueDate");
      if (!input) throw new Error("Chybí datum vystavení");
      input.focus();
      expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
      expect(close).not.toHaveBeenCalled();
      fireEvent.keyDown(input, { key: "Enter", [modifier]: true });
      expect(close).toHaveBeenCalledTimes(1);
    });

    it(`${modifier}+Enter z hledání uloží a zavře bez změny vybrané hodnoty`, async () => {
      const close = mock();
      const change = mock();
      const view = render(
        <Form
          saveAction={{ onSave: mock(), dirty: true }}
          onSaveAndClose={close}
          onChange={change}
          constantSymbolOptions={[
            { value: "0308", label: "0308 – Služby" },
            { value: "0008", label: "0008 – Zboží" },
          ]}
        />,
      );
      const trigger = view.container.querySelector("#document-constantSymbol");
      if (!trigger) throw new Error("Chybí KS");
      fireEvent.keyDown(trigger, { key: "0" });
      const input = await waitFor(() => {
        const node = view.container.querySelector<HTMLInputElement>("[cmdk-input]");
        if (!node) throw new Error("Hledání se neotevřelo");
        return node;
      });
      change.mockClear();
      fireEvent.keyDown(input, { key: "Enter", [modifier]: true });
      expect(close).toHaveBeenCalledTimes(1);
      expect(change).not.toHaveBeenCalled();
    });
  }
  it("Ctrl+Enter z částky formuláře uloží a zavře", () => {
    const close = mock();
    const view = render(
      <Form saveAction={{ onSave: mock(), dirty: true }} onSaveAndClose={close} />,
    );
    const input = view.container.querySelector("#document-amountTotal");
    if (!input) throw new Error("Chybí celková částka");
    fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
    expect(close).toHaveBeenCalledTimes(1);
  });

  for (const column of ["text", "amount"]) {
    it(`Ctrl+Enter v editoru ${column} uloží a zavře bez přidání řádku`, () => {
      const close = mock();
      const linesChange = mock();
      const view = render(
        <Form
          saveAction={{ onSave: mock(), dirty: true }}
          onSaveAndClose={close}
          lines={[{ id: "l1", text: "Služby", amount: 1000 }]}
          onLinesChange={linesChange}
        />,
      );
      const cell = view.container.querySelector(`[data-cell-key="l1:${column}"]`);
      if (!cell) throw new Error("Chybí buňka");
      fireEvent.keyDown(cell, { key: "F2" });
      const input = cell.querySelector("input");
      if (!input) throw new Error("Chybí editor buňky");
      linesChange.mockClear();
      fireEvent.keyDown(input, { key: "Enter", ctrlKey: true });
      expect(close).toHaveBeenCalledTimes(1);
      expect(linesChange).not.toHaveBeenCalled();
    });
  }

  for (const documentType of ["ZFV", "ZFP"]) {
    it(`${documentType}: Cmd+Enter z data používá stejnou zkratku jako faktura`, () => {
      const close = mock();
      const view = render(
        <Form
          documentType={documentType}
          saveAction={{ onSave: mock(), dirty: true }}
          onSaveAndClose={close}
        />,
      );
      const input = view.container.querySelector("#document-issueDate");
      if (!input) throw new Error("Chybí datum vystavení");
      fireEvent.keyDown(input, { key: "Enter", metaKey: true });
      expect(close).toHaveBeenCalledTimes(1);
    });
  }
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
