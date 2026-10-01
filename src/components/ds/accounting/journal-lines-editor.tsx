/**
 * Veřejný vstup editoru řádků dokladu (zachovaná importní cesta).
 * Vlastní: re-export komponenty, typů a čistých funkcí z rozdělených souborů.
 * Nesmí: obsahovat implementaci – patří do JournalLinesEditor.tsx, hooků a modelu.
 */
import { DS_TEXTS_CS } from "../../../ds-texts";
import type { JournalLinesEditorTexts } from "./journal-editor-types";

export type {
  JournalLine,
  JournalLineColumn,
  JournalRow,
  JournalSharedSide,
  SideFieldRules,
  SideFieldRulesFn,
  VatCalcMode,
  VatCodeOption,
  VatDeduction,
  VatLineKind,
  VatPdpSubject,
} from "./journal-lines";
export { fromJournalRow, toJournalRow, toJournalRows, sideFieldRules } from "./journal-lines";
export type {
  JournalLineDefaults,
  JournalLineErrors,
  JournalLinesEditorProps,
  JournalLinesEditorTexts,
  JournalLinesMode,
  JournalLinesRecapState,
  JournalLinesRounding,
  JournalLinesVat,
  JournalMainSide,
} from "./journal-editor-types";
export {
  calculateLineAmount,
  formatJournalAccountDisplay,
  journalAmountLabels,
  orderJournalLines,
  reorderJournalLines,
  roundJournalAmount,
  roundingSuggestion,
} from "./journal-lines-model";
export {
  normalizeJournalAccountVisibility,
  resolveJournalColumnLayout,
  resolveJournalZoomLayout,
  type JournalColumnLayout,
  type JournalColumnLayoutInput,
} from "./journal-column-layout";
export { JournalLinesEditor } from "./JournalLinesEditor";

/**
 * České výchozí texty editoru.
 * @deprecated Od 2.83.0; použijte `DS_TEXTS_CS.journalEditor` nebo `useDsTexts().journalEditor`.
 * Odstraní se ve 3.0.0.
 */
export const DEFAULT_JOURNAL_LINES_TEXTS: JournalLinesEditorTexts = DS_TEXTS_CS.journalEditor;
