import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { calculateLineAmount, formatJournalAccountDisplay, JournalLinesEditor, orderJournalLines, reorderJournalLines, roundingSuggestion } from "../../src/components/ds/accounting/journal-lines-editor";
import type { JournalLine } from "../../src/components/ds/accounting/journal-lines";
import { TooltipProvider } from "../../src/components/ui/tooltip";

describe("JournalLinesEditor 2.34.0", () => {
  it("navrhne vyrovnání z rozdílu jen v limitu", () => {
    expect(roundingSuggestion({ totalMode: "entered", expectedAmount: 100, linesTotal: 99.6, limit: 0.5 })).toBe(0.4);
    expect(roundingSuggestion({ totalMode: "entered", expectedAmount: 100, linesTotal: 90, limit: 0.5 })).toBe(0);
  });
  it("při součtu zaokrouhlí rozpis na celé jednotky", () => {
    expect(roundingSuggestion({ totalMode: "computed", linesTotal: 99.6 })).toBe(0.4);
  });
  it("počítá množství krát cenu na dvě desetinná místa", () => {
    expect(calculateLineAmount(3, 14.9)).toBe(44.7);
  });
  it("při přesunu ponechá připnuté řádky na konci ve správném pořadí", () => {
    const lines: JournalLine[] = [
      { id: "a", amount: 1 }, { id: "r", amount: 0.1, isRounding: true },
      { id: "b", amount: 2 }, { id: "fx", amount: -0.01, isFxRounding: true },
    ];
    expect(orderJournalLines(lines).map((line) => line.id)).toEqual(["a", "b", "fx", "r"]);
    expect(reorderJournalLines(lines, "a", "b").map((line) => line.id)).toEqual(["b", "a", "fx", "r"]);
  });
});
describe("JournalLinesEditor 2.48", () => {
  it("má veřejné props pro prázdný řádek a úplný přístupný název tlačítka", () => {
    const source = readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8");
    expect(source).toContain("initialEmptyLine?: boolean");
    expect(source).toContain("showAllErrors?: boolean");
    expect(source).toContain("isBlank: true");
    expect(source).toContain("(Ctrl+Enter)");
  });
});

describe("JournalLinesEditor 2.49", () => {
  it("zobrazuje účet výchozí zkráceně a na přání včetně názvu", () => {
    expect(formatJournalAccountDisplay("501100", "Spotřeba materiálu", "number")).toBe("501.100");
    expect(formatJournalAccountDisplay("501100", "Spotřeba materiálu", "numberName")).toBe("501.100 - Spotřeba materiálu");
  });
  it("ve sdíleném režimu zobrazí společné sloupce a obnoví jejich validaci", () => {
    const html = renderToStaticMarkup(<TooltipProvider><JournalLinesEditor
      lines={[{ id: "1", debitAccount: "311000", creditAccount: "395000", amount: 100 }]}
      onChange={() => {}}
      accounts={[
        { code: "311000", name: "Odběratelé", category: "zavazky" },
        { code: "395000", name: "Vnitřní zúčtování", category: "bilance" },
      ]}
      documentCurrency="CZK"
      homeCurrency="CZK"
      sideFields="shared"
      dimensionRequired
    /></TooltipProvider>);
    expect(html).toContain('data-auto-hidden="partnerId,vs,dimensionId"');
    expect(html).not.toContain(">MD zakázka<");
    expect(html).toContain("Počet chyb: 2");
  });
  it("má Zakázku výchozí viditelnou a množstevní sloupce řídí prop", () => {
    const source = readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8");
    expect(source).toContain("showQuantityColumns?: boolean");
    expect(source).toContain('{ id: "dimensionId", label: t.dimension }');
    expect(source).toContain("defaultVisible: showQuantityColumns");
  });
});
