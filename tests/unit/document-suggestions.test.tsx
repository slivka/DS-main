/** Návrhy dokumentu · hlavička, buňky, první ruční změna, přednost chyby a F8. */
import { describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { act, render, fireEvent } from "@testing-library/react";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { JournalLinesEditor } from "../../src/components/ds/accounting/journal-lines-editor";
import { SuggestionSummary } from "../../src/components/ds/extraction/suggestion-summary";
import type {
  DocumentFormProps,
  DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
import type { JournalLinesEditorProps } from "../../src/components/ds/accounting/journal-editor-types";
import type { JournalRowSuggestions } from "../../src/components/ds/accounting/journal-suggestions";

import { TooltipProvider } from "../../src/components/ui/tooltip";

const suggestion = { source: "f.pdf", uncertain: true };
const base: DocumentHeaderValue = {
  id: "existing",
  number: "FP1",
  externalNumber: "123",
  currency: "CZK",
  amountTotal: 1000,
  totalMode: "entered",
  partnerId: "p1",
  mainAccountId: "321001",
  issueDate: "2026-10-23",
  accountingDate: "2026-10-23",
  dueDate: "2026-11-06",
  taxDate: "2026-10-23",
  vatDate: "2026-10-23",
};
function Form(props: Partial<DocumentFormProps>) {
  const [value, setValue] = React.useState(base);
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
      homeCurrency="CZK"
      partners={[{ id: "p1", name: "Dodavatel" }]}
      vat={{ visible: true }}
      {...props}
    />
  );
}
function field(view: ReturnType<typeof render>, id: string) {
  const input = view.container.querySelector(`#${id}`);
  if (!input) throw new Error(`Chybí pole ${id}`);
  return input.closest('[data-slot="field"]');
}
function Editor(props: Partial<JournalLinesEditorProps>) {
  const [lines, setLines] = React.useState([{ id: "r1", amount: 1000, text: "Služby" }]);
  return (
    <TooltipProvider>
      <JournalLinesEditor
        lines={lines}
        onChange={setLines}
        accounts={[]}
        documentCurrency="CZK"
        homeCurrency="CZK"
        withoutAccounts
        storageKey="suggestions-test"
        {...props}
      />
    </TooltipProvider>
  );
}

describe("DocumentForm návrhy hlavičky", () => {
  for (const documentType of ["FV", "FP", "ZFV", "ZFP", "PO", "BA", "ID"]) {
    it(`${documentType}: společná částka a přepínač DPH nesou návrh`, () => {
      const view = render(
        <Form
          documentType={documentType}
          fieldSuggestions={{ amountTotal: suggestion, vatRelevant: suggestion }}
        />,
      );
      expect(field(view, "document-amountTotal")?.getAttribute("data-suggestion")).toBe(
        "uncertain",
      );
      expect(field(view, "document-vatRelevant")?.getAttribute("data-suggestion")).toBe(
        "uncertain",
      );
    });
  }
  it("výběr partnera, jeho účtu, datum a text dostávají návrh", () => {
    const view = render(
      <Form
        bankAccountOptions={[{ id: "b1", account: "123/0100", label: "Hlavní" }]}
        fieldSuggestions={{
          partnerId: suggestion,
          partnerBankAccountId: suggestion,
          dueDate: suggestion,
          description: suggestion,
        }}
      />,
    );
    for (const id of [
      "document-partner",
      "document-bankAccount",
      "document-dueDate",
      "document-description",
    ])
      expect(field(view, id)?.getAttribute("data-suggestion")).toBe("uncertain");
  });
  it("ruční změna hlásí správný klíč pouze jednou, samotné otevření nic nehlásí", () => {
    const cleared = mock();
    const view = render(
      <Form fieldSuggestions={{ externalNumber: suggestion }} onSuggestionCleared={cleared} />,
    );
    expect(cleared).not.toHaveBeenCalled();
    const input = view.container.querySelector("#document-externalNumber");
    if (!input) throw new Error("Chybí číslo");
    fireEvent.change(input, { target: { value: "456" } });
    fireEvent.change(input, { target: { value: "789" } });
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(cleared).toHaveBeenCalledWith("externalNumber");
  });
  it("chyba hlavičky překryje návrh", () => {
    const view = render(
      <Form
        fieldSuggestions={{ amountTotal: suggestion }}
        fieldErrors={{ amountTotal: "Neplatná částka" }}
      />,
    );
    expect(field(view, "document-amountTotal")?.hasAttribute("data-suggestion")).toBe(false);
    expect(
      view.container.querySelector("#document-amountTotal")?.getAttribute("aria-invalid"),
    ).toBe("true");
  });
  it("BA v režimu IBAN přiřazuje návrhy bankIban a bankSwift", () => {
    const view = render(
      <Form
        documentType="BA"
        value={{
          ...base,
          bankAccountKind: "iban",
          bankIban: "DE89370400440532013000",
          bankSwift: "COBADEFF",
        }}
        fieldSuggestions={{ bankIban: suggestion, bankSwift: suggestion }}
      />,
    );
    expect(field(view, "document-movement-account")?.getAttribute("data-suggestion")).toBe(
      "uncertain",
    );
    expect(field(view, "document-bank-code")?.getAttribute("data-suggestion")).toBe("uncertain");
  });
  it("FV předá návrh firemnímu účtu i způsobu platby", () => {
    const view = render(
      <Form
        documentType="FV"
        companyBankAccountOptions={[
          { id: "c1", label: "Hlavní", account: "123/0100", currency: "CZK" },
        ]}
        paymentMethodOptions={[{ value: "bank", label: "Převod" }]}
        fieldSuggestions={{ companyBankAccountId: suggestion, paymentMethodId: suggestion }}
      />,
    );
    expect(field(view, "document-companyBankAccountId")?.getAttribute("data-suggestion")).toBe(
      "uncertain",
    );
    expect(field(view, "document-paymentMethodId")?.getAttribute("data-suggestion")).toBe(
      "uncertain",
    );
  });
  it("ruční jméno partnera a přepínač DPH hlásí své klíče", () => {
    const cleared = mock();
    const view = render(
      <Form
        counterpartyInput="manual"
        fieldSuggestions={{ counterpartyName: suggestion, vatRelevant: suggestion }}
        onSuggestionCleared={cleared}
      />,
    );
    const input = view.container.querySelector("#document-partner");
    if (!input) throw new Error("Chybí ruční partner");
    fireEvent.change(input, { target: { value: "Ruční dodavatel" } });
    fireEvent.click(view.getByRole("switch", { name: "Vstupuje do DPH" }));
    expect(cleared).toHaveBeenCalledWith("counterpartyName");
    expect(cleared).toHaveBeenCalledWith("vatRelevant");
  });
  it("F8 cyklicky prochází hlavičku i buňku řádku", () => {
    const view = render(
      <Form
        fieldSuggestions={{ amountTotal: suggestion }}
        lines={[{ id: "r1", amount: 1000, text: "Služby" }]}
        rowSuggestions={{ r1: { text: suggestion } }}
        linesEditorProps={{ withoutAccounts: true }}
        notices={<SuggestionSummary method="AI" uncertainCount={2} onDiscard={() => {}} />}
      />,
    );
    const amount = view.container.querySelector<HTMLElement>("#document-amountTotal");
    const cell = view.container.querySelector<HTMLElement>('[data-cell-key="r1:text"]');
    if (!amount || !cell) throw new Error("Chybí pole návrhu");
    act(() => amount.focus());
    fireEvent.keyDown(window, { key: "F8" });
    expect(document.activeElement).toBe(cell);
    fireEvent.keyDown(window, { key: "F8" });
    expect(document.activeElement).toBe(amount);
  });
});

describe("návrhy buněk řádků", () => {
  it("účty, zakázka a kód DPH mají společné klíče návrhu", () => {
    const view = render(
      <Editor
        withoutAccounts={false}
        dimensions={[]}
        sideFields="shared"
        lines={[
          {
            id: "r1",
            amount: 1000,
            text: "Služby",
            debitAccount: "518001",
            creditAccount: "321001",
          },
        ]}
        rowSuggestions={{ r1: { account: suggestion, dimension: suggestion, vatCode: suggestion } }}
        vat={{ enabled: true, codes: [] }}
      />,
    );
    for (const key of ["debitAccount", "creditAccount", "dimensionId", "vatCodeId"]) {
      const cell = view.container.querySelector(`[data-cell-key="r1:${key}"]`);
      expect(cell).not.toBeNull();
      expect(cell?.getAttribute("data-suggestion")).toBe("uncertain");
    }
  });
  it("ruční změna částky oznamuje amount a id řádku jen jednou", () => {
    const cleared = mock();
    const view = render(
      <Editor rowSuggestions={{ r1: { amount: suggestion } }} onSuggestionCleared={cleared} />,
    );
    const cell = view.container.querySelector('[data-cell-key="r1:amount"]');
    if (!cell) throw new Error("Chybí částka");
    expect(cell.getAttribute("data-suggestion")).toBe("uncertain");
    fireEvent.click(cell);
    expect(cleared).not.toHaveBeenCalled();
    const input = view.getByRole("textbox", { name: "Částka" });
    fireEvent.change(input, { target: { value: "1001" } });
    fireEvent.change(input, { target: { value: "1002" } });
    expect(cleared).toHaveBeenCalledTimes(1);
    expect(cleared).toHaveBeenCalledWith("amount", "r1");
  });
  it("rodič po změně odebere návrh buňky", () => {
    function Controlled() {
      const [rows, setRows] = React.useState<JournalRowSuggestions>({ r1: { text: suggestion } });
      return <Editor rowSuggestions={rows} onSuggestionCleared={() => setRows({})} />;
    }
    const view = render(<Controlled />);
    const cell = view.container.querySelector('[data-cell-key="r1:text"]');
    if (!cell) throw new Error("Chybí text");
    fireEvent.click(cell);
    fireEvent.change(view.getByRole("textbox", { name: "Popis" }), { target: { value: "Ručně" } });
    expect(cell.hasAttribute("data-suggestion")).toBe(false);
  });
  it("chyba buňky má přednost a F8 ji nepovažuje za návrh", () => {
    const view = render(
      <Editor
        rowSuggestions={{ r1: { amount: suggestion } }}
        cellIssues={[{ rowId: "r1", columnId: "amount", severity: "error", message: "Chyba" }]}
      />,
    );
    const cell = view.container.querySelector('[data-cell-key="r1:amount"]');
    expect(cell?.hasAttribute("data-suggestion")).toBe(false);
    expect(cell?.getAttribute("aria-invalid")).toBe("true");
  });
});
