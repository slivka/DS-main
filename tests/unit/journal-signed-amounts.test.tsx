/** Znaménko dobropisu · převod, skupiny DPH, součty, rozdíl a zadání v editoru. */
import { describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { fireEvent, render, renderHook } from "@testing-library/react";
import { toJournalRow, fromJournalRow, sideFieldRules, type JournalLine, type VatCodeOption } from "../../src/components/ds/accounting/journal-lines";
import { computeVatGroups, applyVatAllocation } from "../../src/components/ds/accounting/journal-vat-groups";
import { summarizeVat, computeJournalTotals, buildVatPreviewLines } from "../../src/components/ds/accounting/journal-vat";
import { roundingSuggestion } from "../../src/components/ds/accounting/journal-lines-model";
import { validateJournalLines } from "../../src/components/ds/accounting/journal-lines-validation";
import { useJournalTotals } from "../../src/components/ds/accounting/useJournalTotals";
import { JournalLinesEditor } from "../../src/components/ds/accounting/journal-lines-editor";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DS_TEXTS_CS } from "../../src/ds-texts";

const code: VatCodeOption = { id: "v21", code: "Z", name: "Tuzemsko", rate: 21,
  direction: "in", hasTax: true, selfAssessment: false, requiresPdpSubject: false,
  taxInAccount: "343021" };
const codes = [code];
const negative: JournalLine = { id: "credit-note", amount: -1000, text: "Dobropis",
  debitAccount: "518001", creditAccount: "321001", vatCodeId: "v21" };
const config = { codes, calcMode: "net" as const };

describe("záporné částky dokladů", () => {
  it("převod tam a zpět zachová −1 000 na stejných stranách", () => {
    const row = toJournalRow(negative, { vat: { calcMode: "net" } });
    expect(row.amount).toBe(-1000);
    expect(fromJournalRow(row, negative.id)).toMatchObject(negative);
  });
  it("rekapitulace základu −1 000 při 21 % má daň −210", () => {
    const groups = computeVatGroups([negative], undefined, codes);
    expect(groups.groups[0]).toMatchObject({ base: -1000, tax: -210, gross: -1210 });
    expect(summarizeVat(applyVatAllocation([negative], groups), config)[0])
      .toMatchObject({ base: -1000, vat: -210, gross: -1210, deductible: -210 });
    const preview = buildVatPreviewLines([negative], config).lines[0];
    expect(preview).toMatchObject({ amount: -210, debitAccount: "343021", creditAccount: "321001" });
  });
  it("Rozdíl proti zápornému Celkem počítá se znaménkem", () => {
    const { result } = renderHook(() => useJournalTotals({
      props: { lines: [negative], onChange: () => {}, accounts: [], documentCurrency: "CZK",
        homeCurrency: "CZK", totalMode: "entered", totalAmount: -1210 },
      t: DS_TEXTS_CS.journalEditor, regularLines: [negative], vatOn: true,
      vatReadOnly: false, vatConfig: config, vatCodeMap: new Map([[code.id, code]]), foreign: false,
    }));
    expect(result.current.total).toBe(-1210);
    expect(result.current.difference).toBe(0);
  });
  it("kladné a záporné řádky se odečítají včetně rozpočtu DPH", () => {
    const lines = [{ ...negative, id: "positive", amount: 2000 }, negative];
    const groups = computeVatGroups(lines, undefined, codes);
    expect(groups.groups[0].lines.map((item) => item.tax)).toEqual([420, -210]);
    expect(computeJournalTotals(applyVatAllocation(lines, groups), { vat: { enabled: true, codes } }))
      .toMatchObject({ base: 1000, vat: 210, gross: 1210 });
  });
  it("zaokrouhlení záporného dokladu je správně orientované", () => {
    expect(roundingSuggestion({ totalMode: "entered", expectedAmount: -1210,
      linesTotal: -1209.6 })).toBe(-0.4);
    expect(roundingSuggestion({ totalMode: "computed", linesTotal: -1209.6 })).toBe(-0.4);
  });
  it("nula zůstává neplatná a záporná nenulová částka je platná", () => {
    const errors = validateJournalLines([negative, { ...negative, id: "zero", amount: 0 }], {
      texts: DS_TEXTS_CS.journalEditor, accountByCode: new Map(), sideFields: "shared",
      sharedSide: "both", sideFieldRules, dimensionRequired: false, vatActive: false,
      vatCodeMap: new Map(), calcMode: "net", foreign: false, documentMark: "CZK",
      missingVatAccounts: new Map(),
    }, { showAllErrors: true, touched: new Set() });
    expect(errors.get(negative.id)?.amount).toBeUndefined();
    expect(errors.get("zero")?.amount).toBe(DS_TEXTS_CS.journalEditor.amountRequired);
  });
  it("editor přijme zápornou částku a uloží ji se znaménkem", () => {
    const change = mock();
    function Editor() {
      const [lines, setLines] = React.useState([negative]);
      return <JournalLinesEditor lines={lines} onChange={(next) => { setLines(next); change(next); }}
        accounts={[]} withoutAccounts documentCurrency="CZK" homeCurrency="CZK"
        storageKey="signed-amount-test" />;
    }
    const view = render(<TooltipProvider><Editor /></TooltipProvider>);
    const cell = view.container.querySelector('[data-cell-key="credit-note:amount"]');
    if (!cell) throw new Error("Chybí buňka částky");
    expect(cell.textContent).toContain("-1 000,00");
    fireEvent.click(cell);
    const input = view.getByRole("textbox", { name: "Částka" });
    fireEvent.change(input, { target: { value: "-2 500,50" } });
    fireEvent.blur(input);
    expect(change.mock.calls.at(-1)?.[0][0].amount).toBe(-2500.5);
    expect(cell.textContent).toContain("-2 500,50");
  });
});