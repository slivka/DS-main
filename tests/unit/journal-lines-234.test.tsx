import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import {
  calculateLineAmount,
  DEFAULT_JOURNAL_LINES_TEXTS,
  formatJournalAccountDisplay,
  JournalLinesEditor,
  journalAmountLabels,
  normalizeJournalAccountVisibility,
  orderJournalLines,
  reorderJournalLines,
  roundingSuggestion,
} from "../../src/components/ds/accounting/journal-lines-editor";
import type { JournalLine } from "../../src/components/ds/accounting/journal-lines";
import { TooltipProvider } from "../../src/components/ui/tooltip";

const squashSrc = (s: string) => s.replace(/\s+/g, " ");

describe("JournalLinesEditor 2.34.0", () => {
  it("navrhne vyrovnání z rozdílu jen v limitu", () => {
    expect(
      roundingSuggestion({
        totalMode: "entered",
        expectedAmount: 100,
        linesTotal: 99.6,
        limit: 0.5,
      }),
    ).toBe(0.4);
    expect(
      roundingSuggestion({ totalMode: "entered", expectedAmount: 100, linesTotal: 90, limit: 0.5 }),
    ).toBe(0);
  });
  it("při součtu zaokrouhlí rozpis na celé jednotky", () => {
    expect(roundingSuggestion({ totalMode: "computed", linesTotal: 99.6 })).toBe(0.4);
  });
  it("počítá množství krát cenu na dvě desetinná místa", () => {
    expect(calculateLineAmount(3, 14.9)).toBe(44.7);
  });
  it("při přesunu ponechá připnuté řádky na konci ve správném pořadí", () => {
    const lines: JournalLine[] = [
      { id: "a", amount: 1 },
      { id: "r", amount: 0.1, isRounding: true },
      { id: "b", amount: 2 },
      { id: "fx", amount: -0.01, isFxRounding: true },
    ];
    expect(orderJournalLines(lines).map((line) => line.id)).toEqual(["a", "b", "fx", "r"]);
    expect(reorderJournalLines(lines, "a", "b").map((line) => line.id)).toEqual([
      "b",
      "a",
      "fx",
      "r",
    ]);
  });
});
describe("JournalLinesEditor 2.48", () => {
  it("má veřejné props pro prázdný řádek a úplný přístupný název tlačítka", () => {
    const source = squashSrc(
      readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8"),
    );
    expect(source).toContain("initialEmptyLine?: boolean");
    expect(source).toContain("showAllErrors?: boolean");
    expect(source).toContain("isBlank: true");
    expect(source).toContain("(Ctrl+Enter)");
  });
});

describe("JournalLinesEditor 2.49", () => {
  it("zobrazuje účet výchozí zkráceně a na přání včetně názvu", () => {
    expect(formatJournalAccountDisplay("501100", "Spotřeba materiálu")).toBe("501.100");
    expect(formatJournalAccountDisplay("501100", "Spotřeba materiálu", true)).toBe(
      "501.100 - Spotřeba materiálu",
    );
  });
  it("ve sdíleném režimu zobrazí společné sloupce a obnoví jejich validaci", () => {
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <JournalLinesEditor
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
        />
      </TooltipProvider>,
    );
    expect(html).toContain('data-auto-hidden="partnerId,vs,dimensionId"');
    expect(html).not.toContain(">MD zakázka<");
    expect(html).not.toContain("Počet chyb:");
  });
  it("má Zakázku výchozí viditelnou a množstevní sloupce řídí prop", () => {
    const source = squashSrc(
      readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8"),
    );
    expect(source).toContain("showQuantityColumns?: boolean");
    expect(source).toContain('{ id: "dimensionId", label: t.dimension }');
    expect(source).toContain("defaultVisible: showQuantityColumns");
  });
});

describe("JournalLinesEditor 2.54", () => {
  it("rezervuje pro Ř. 4,75 rem a místo pro trojciferné číslo", () => {
    const source = squashSrc(
      readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8"),
    );
    expect(source).toContain("row: 4.75");
    expect(source).toContain("min-w-[3ch] text-right tabular-nums");
    expect(source).toContain("journal-row-cell");
  });

  it("u EUR používá Částka a domácí popisek Částka v Kč", () => {
    expect(journalAmountLabels(DEFAULT_JOURNAL_LINES_TEXTS, "€", "Kč")).toEqual({
      amount: "Částka",
      homeAmount: "Částka v Kč",
      foreignAmount: "Částka v €",
    });
    const html = renderToStaticMarkup(
      <TooltipProvider>
        <JournalLinesEditor
          lines={[
            {
              id: "1",
              debitAccount: "311000",
              creditAccount: "395000",
              foreignAmount: 10,
              amount: 250,
            },
          ]}
          onChange={() => {}}
          accounts={[]}
          documentCurrency="EUR"
          documentCurrencySymbol="€"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          texts={{ showDetail: "Detail", hideDetail: "Skrýt" }}
        />
      </TooltipProvider>,
    );
    expect(html).toContain(">Částka<");
    expect(html).not.toContain("Částka v €");
  });

  it("skládá dvě detailní pole do jednoho pružného řádku", () => {
    const source = squashSrc(
      readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8"),
    );
    expect(source).toContain("journal-line-detail-grid flex flex-wrap items-end gap-3");
    expect(source).not.toContain("journal-detail-columns-");
    expect(source).toContain("<VsField");
  });

  it("předává viditelné chyby přes onValidationChange", () => {
    const source = squashSrc(
      readFileSync("src/components/ds/accounting/journal-lines-editor.tsx", "utf8"),
    );
    expect(source).toContain("onValidationChange?: (count: number, errors:");
    expect(source).toContain(
      "validationChangeRef.current?.(validationErrors.length, validationErrors)",
    );
    expect(source).not.toContain("`${t.errors}: ${errorCount}`");
  });
});

describe("JournalLinesEditor 2.66", () => {
  it("obnoví krátkou formu, pokud uložené rozložení skryje obě formy strany", () => {
    expect(
      normalizeJournalAccountVisibility(
        {
          debitAccount: false,
          debitAccountName: false,
          creditAccount: false,
          creditAccountName: true,
        },
        "internal",
      ),
    ).toEqual({
      debitAccount: true,
      debitAccountName: false,
      creditAccount: false,
      creditAccountName: true,
    });
    expect(
      normalizeJournalAccountVisibility(
        { counterAccount: false, counterAccountName: false },
        "mainAccount",
      ),
    ).toEqual({ counterAccount: true, counterAccountName: false });
  });

  // Výchozí viditelnost, nadpisy, ochrana poslední formy, editace a rekapitulace: journal-accounts-render-266.test.tsx.
});
