/** Zálohy ve společném formuláři: slot, štítky, příjem/výdaj a ZL bez kopií. */
import { afterEach, describe, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { JournalLinesEditor } from "../../src/components/ds/accounting/journal-lines-editor";
import { DocumentPostingGrid } from "../../src/components/ds/accounting/document-posting-grid";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { advanceListVariant } from "../../src/components/ds/accounting/advance-list-variant";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DsTextsProvider, DS_TEXTS_CS, DS_TEXTS_SK } from "../../src/ds-texts";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";
const header: DocumentHeaderValue = {
  bookId: "b",
  number: "2026001",
  mainAccountId: "321001",
  issueDate: "2026-10-20",
  accountingDate: "2026-10-20",
  variableSymbol: "2026001",
  currency: "EUR",
  rate: 1,
  totalAmount: 2000,
  totalMode: "computed",
};
afterEach(cleanup);
describe("Advance integration", () => {
  it("slot se vykreslí pod gridem a před patičkou bez zápisu", () => {
    let calls = 0;
    const view = render(
      <TooltipProvider>
        <JournalLinesEditor
          accounts={[]}
          lines={[{ id: "a", amount: 2000, text: "Platba" }]}
          onChange={() => {
            calls++;
          }}
          mode="internal"
          storageKey="slot-unit"
          advanceDeduction={1500}
          afterVatRecap={<div data-testid="deductions-slot">Odečty APP</div>}
        />
      </TooltipProvider>,
    );
    const slot = screen.getByTestId("deductions-slot");
    const grid = view.container.querySelector('[role="grid"]');
    expect(
      Boolean(grid && grid.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true);
    expect(calls).toBe(0);
  });
  for (const type of ["FV", "FP", "DDPZ", "DDPOZ", "BA", "PO"] as const)
    it(`${type} předá stejný slot APP`, () => {
      render(
        <DocumentForm
          title={type}
          documentType={type}
          status="draft"
          value={header}
          onChange={() => {}}
          lines={[]}
          onLinesChange={() => {}}
          accounts={[]}
          books={[{ id: "b", code: "B", name: "Kniha" }]}
          homeCurrency="EUR"
          linesEditorProps={{ afterVatRecap: <div data-testid="advance-slot">APP</div> }}
        />,
      );
      expect(screen.getAllByTestId("advance-slot").length).toBe(1);
    });
  for (const type of ["ZFV", "ZFP"] as const)
    it(`${type} nepředaný slot nevykreslí`, () => {
      const variant = advanceListVariant({ type, vatPayer: true });
      const view = render(
        <DocumentForm
          title={type}
          documentType={type}
          status="draft"
          value={header}
          onChange={() => {}}
          lines={[]}
          onLinesChange={() => {}}
          accounts={[]}
          books={[{ id: "b", code: "B", name: "Kniha" }]}
          homeCurrency="EUR"
          fields={variant.fields}
          vat={variant.vat}
          linesEditorProps={{ withoutAccounts: true }}
        />,
      );
      expect(view.container.querySelector('[data-testid="advance-slot"]')).toBeNull();
    });
  for (const [texts, fx] of [
    [DS_TEXTS_CS, "Kurzové vyrovnání zálohy"],
    [DS_TEXTS_SK, "Kurzové vyrovnanie zálohy"],
  ] as const)
    it(`oba automatické druhy se zobrazí v řádcích a Zaúčtování: ${fx}`, () => {
      render(
        <DsTextsProvider texts={texts}>
          <TooltipProvider>
            <JournalLinesEditor
              accounts={[]}
              lines={[
                { id: "a", text: "A", amount: 1000, autoKind: "advance" },
                { id: "b", text: "B", amount: 12.5, autoKind: "advance_fx" },
              ]}
              onChange={() => {}}
              mode="internal"
              storageKey={`auto-${fx}`}
            />
            <DocumentPostingGrid
              accounts={[]}
              entries={[
                { id: "a", amount: 1000, auto: "advance" },
                { id: "b", amount: 12.5, auto: "advance_fx" },
              ]}
            />
          </TooltipProvider>
        </DsTextsProvider>,
      );
      expect(screen.getAllByText("Záloha").length).toBe(2);
      expect(screen.getAllByText(fx).length).toBe(2);
    });
});
