/**
 * Součty a předběžná daň editoru řádků.
 * Vlastní: náhled řádků daně (dokud je doklad editovatelný), součty MD/Dal, rozdíl k celku,
 *   návrh zaokrouhlení a hlášení součtů rodiči.
 * Nesmí: vytvářet skutečné řádky daně – ty vytváří databáze; DS je jen zobrazuje.
 */
import * as React from "react";

import type { JournalLinesEditorProps } from "./journal-editor-types";
import type { JournalLine, VatCodeOption } from "./journal-lines";
import { roundJournalAmount, roundingSuggestion } from "./journal-lines-model";
import {
  buildVatPreviewLines,
  computeJournalTotals,
  mergeFxRoundingPreview,
  summarizeVat,
  type VatPreviewConfig,
} from "./journal-vat";
import type { JournalEditorTexts } from "../../../ds-texts";

/** Vstup výpočtu součtů. */
export interface JournalTotalsInput {
  /** Props editoru (řádky, celek, zaokrouhlení, kurz). */
  props: JournalLinesEditorProps;
  /** Texty. */
  t: JournalEditorTexts;
  /** Běžné řádky základu. */
  regularLines: JournalLine[];
  /** DPH zapnuto. */
  vatOn: boolean;
  /** DPH jen ke čtení (zaúčtovaný doklad). */
  vatReadOnly: boolean;
  /** Konfigurace náhledu daně. */
  vatConfig: VatPreviewConfig;
  /** Kódy DPH podle id. */
  vatCodeMap: Map<string, VatCodeOption>;
  /** Hlavní účet knihy. */
  mainAccount?: { accountId: string; side: "MD" | "D" };
  /** Doklad v cizí měně. */
  foreign: boolean;
}

/** Řádky daně: z DB u zaúčtovaného dokladu, jinak předběžný náhled. */
function taxLinesFor(input: JournalTotalsInput, previewLines: JournalLine[]) {
  const { props, vatOn, vatReadOnly, mainAccount, vatCodeMap } = input;
  if (!vatOn) return [];
  if (!vatReadOnly) return previewLines;
  return props.lines
    .filter((line) => line.isVatLine)
    .map((line) => ({
      ...line,
      excludeFromTotal:
        line.excludeFromTotal ??
        (mainAccount
          ? line.debitAccount !== mainAccount.accountId &&
            line.creditAccount !== mainAccount.accountId
          : Boolean(vatCodeMap.get(line.vatCodeId ?? "")?.selfAssessment)),
    }));
}

/** Součty editoru a předběžná daň. */
export function useJournalTotals(input: JournalTotalsInput) {
  const { props, t, vatOn, vatReadOnly, vatConfig, mainAccount, foreign } = input;
  const { lines, rounding, totalAmount, totalMode = "computed" } = props;
  const rateAmount = props.rateAmount ?? 1;
  // Dokud je doklad editovatelný, daň se počítá vždy předběžně z aktuálních řádků základu (řádky daně z DB se ignorují).
  const vatPreview =
    vatOn && !vatReadOnly
      ? buildVatPreviewLines(input.regularLines, vatConfig, {
          mainAccount: mainAccount?.accountId,
          mainSide: mainAccount?.side,
        })
      : { lines: [] as JournalLine[], missingAccounts: [] as { lineId: string; code: string }[] };
  const taxLines = taxLinesFor(input, vatPreview.lines);
  const fxPreviewLine = vatPreview.lines.find((line) => line.isFxRounding);
  const gridSource = mergeFxRoundingPreview(lines, vatPreview.lines, t.fxRoundingPreview);
  const missingVatAccounts = new Map(
    vatPreview.missingAccounts.map((item) => [item.lineId, item.code]),
  );
  const journalTotals = computeJournalTotals(lines, {
    vat: vatOn
      ? {
          enabled: true,
          codes: vatConfig.codes,
          calcMode: vatConfig.calcMode,
          vatRate: vatConfig.vatRate,
          vatRateAmount: vatConfig.vatRateAmount,
        }
      : null,
    readOnly: vatReadOnly,
    mainAccount: mainAccount?.accountId,
    mainSide: mainAccount?.side,
    foreign,
    rate: props.rate === undefined ? 1 : props.rate,
    rateAmount,
  });
  const linesTotal = journalTotals.grossHome;
  const documentLinesTotal = journalTotals.gross;
  const totalsKey = `${journalTotals.baseHome}|${journalTotals.base}|${journalTotals.vat}|${journalTotals.grossHome}|${journalTotals.gross}|${journalTotals.visibleLineCount}`;
  const onTotalsChangeRef = React.useRef(props.onTotalsChange);
  onTotalsChangeRef.current = props.onTotalsChange;
  React.useEffect(() => {
    onTotalsChangeRef.current?.(journalTotals);
  }, [totalsKey]); // eslint-disable-line react-hooks/exhaustive-deps -- hlásí jen změnu hodnot součtů
  const roundingLine = lines.find((line) => line.isRounding);
  const roundingValue = roundingLine ? Number(roundingLine.amount) || 0 : (rounding?.value ?? 0);
  const total = roundJournalAmount(
    linesTotal +
      roundingValue +
      (fxPreviewLine
        ? 0
        : lines
            .filter((line) => line.isFxRounding)
            .reduce((sum, line) => sum + (Number(line.amount) || 0), 0)),
  );
  const difference =
    totalAmount === undefined
      ? 0
      : roundJournalAmount(totalAmount - (foreign ? documentLinesTotal : total));
  const vatSummary = vatOn ? summarizeVat(input.regularLines, vatConfig) : [];
  return {
    gridSource,
    taxLines,
    missingVatAccounts,
    baseTotal: journalTotals.baseHome,
    documentBaseTotal: journalTotals.base,
    documentLinesTotal,
    total,
    difference,
    showRemaining: totalMode === "entered" && totalAmount !== undefined,
    roundingExists: Boolean(roundingLine || rounding?.value),
    suggestion: roundingSuggestion({
      totalMode,
      expectedAmount: totalAmount,
      linesTotal: foreign ? documentLinesTotal : linesTotal,
      currentRounding: roundingValue,
      limit: rounding?.limit,
    }),
    vatSummary,
    documentVatTotal: roundJournalAmount(vatSummary.reduce((sum, row) => sum + row.vat, 0)),
    documentGrossTotal: foreign ? documentLinesTotal : total,
  };
}

/** Výsledek `useJournalTotals`. */
export type JournalTotalsState = ReturnType<typeof useJournalTotals>;
