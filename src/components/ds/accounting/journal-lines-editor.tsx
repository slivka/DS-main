import * as React from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, Copy, GripVertical, Pencil, Pin, Plus, ReceiptText, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { formatAccountCode } from "./account-code";
import { AccountSelect, type AccountOption } from "./account-select";
import { DimensionSelect, type DimensionOption } from "./dimension-select";
import { PartnerSelect, type PartnerOption } from "./partner-select";
import { VatCodeSelect } from "./vat-code-select";
import { UnitSelect, type UnitOption } from "./unit-select";
import { VsField } from "./vs-field";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { SegmentedField } from "../form/segmented-field";
import { GridSegmentedToggle } from "../grid/grid-segmented-toggle";
import { fillInitialVatCode, mergeFxRoundingPreview, applyVatCalcMode, baseFromGross, buildVatPreviewLines, resolveLineVat, summarizeVat, computeJournalTotals, type JournalTotals, type VatPreviewConfig } from "./journal-vat";
import { ColumnResizeHandle } from "../grid/grid-column-resize";
import { ColumnPicker } from "../grid/column-picker";
import { GridAction, GridActions } from "../grid/grid-action";
import { useGridColumns, type GridColumn } from "../grid/grid-columns";
import { GridSearch } from "../grid/grid-search";
import { GridToolbar, GridToolbarSeparator } from "../grid/grid-toolbar";
import { GridZoomContext, ZoomControl, ZoomGrid, useGridZoom } from "../grid/grid-zoom";
import { JournalLinesRecap, type JournalRecapTab } from "./journal-lines-recap";
import { formatAmount } from "../../../lib/format";
import { useIsActivePane } from "../panes/pane-context";
import { cn } from "../../../lib/utils";
import { isResultAccountType, sideFieldRules as defaultSideFieldRules, type JournalLine, type JournalLineColumn, type JournalSharedSide, type SideFieldRulesFn, type VatCalcMode, type VatCodeOption, type VatDeduction, type VatPdpSubject } from "./journal-lines";

export type { JournalLine, JournalLineColumn, JournalRow, JournalSharedSide, SideFieldRules, SideFieldRulesFn, VatCalcMode, VatCodeOption, VatDeduction, VatLineKind, VatPdpSubject } from "./journal-lines";
export { fromJournalRow, toJournalRow, toJournalRows, sideFieldRules } from "./journal-lines";
/** DPH v editoru řádků – bez propu (nebo s enabled=false) se nic z DPH nezobrazí. */
export interface JournalLinesVat {
  /** „Vstupuje do DPH“ a firma je plátce. */
  enabled: boolean;
  /** Jen kódy použitelné pro doklad (směr, aktivní, platné k Datu DPH) – filtruje aplikace. */
  codes: VatCodeOption[];
  calcMode: VatCalcMode;
  onCalcModeChange?: (mode: VatCalcMode) => void;
  /** Kód pro nový řádek; jinak kód z předchozího řádku. */
  defaultCodeId?: string | null;
  pdpSubjects?: VatPdpSubject[];
  /** Kurz DPH (cizí měna) – bez něj kurz dokladu. */
  vatRate?: number | null;
  vatRateAmount?: number;
  /** Zaúčtovaný doklad – DPH údaje jen ke čtení, součty z řádků daně z DB. */
  readOnly?: boolean;
  /** Výchozí true; aplikace vrátí false u výjimek (např. řádek s účtem DPH). */
  isCodeRequired?: (line: JournalLine) => boolean;
}
export type JournalLineDefaults = Partial<Omit<JournalLine, "id">>;
export type JournalLinesMode = "internal" | "mainAccount";
export type JournalAccountDisplay = "number" | "numberName";
export type JournalMainSide = "MD" | "D";
export type JournalLineErrors = Partial<Record<JournalLineColumn, string>>;
export interface JournalLinesRounding { value: number; onChange?: (value: number) => void; readOnly?: boolean; label?: string; limit?: number }
export interface JournalLinesRecapState { open?: boolean; onOpenChange?: (open: boolean) => void; tab?: string; onTabChange?: (tab: string) => void }
export interface JournalLinesEditorTexts {
  row: string; debitAccount: string; creditAccount: string; counterAccount: string; amount: string; homeAmount: string; foreignAmount: string; text: string;
  quantity: string; unit: string; unitPrice: string; dimension: string; vs: string; partner: string; debitDimension: string; creditDimension: string;
  debitVs: string; creditVs: string; debitPartner: string; creditPartner: string; nonTax: string; nonTaxOn: string; nonTaxOff: string;
  rounding: string; fxRounding: string; fxRoundingPreview: string; fxRoundingHint: string; detail: string; showDetail: string; hideDetail: string; sideDebit: string; sideCredit: string;
  actions: string; addLine: string; duplicateLine: string; removeLine: string; undo: string; removed: string; total: string; remaining: string;
  balanced: string; roundingExists: string; /** @deprecated Počet chyb předejte přes onValidationChange. */ errors: string; empty: string; debitRequired: string; creditRequired: string; amountRequired: string;
  missingVs: string; missingDimension: string; search: string; searchResult: string; clearSearch: string; quantityPriceHint: string;
  vatCode: string; vatRate: string; vatAmount: string; grossAmount: string; vatMode: string; vatModeNet: string; vatModeGross: string; vatManual: string; resetVat: string;
  vatDeduction: string; deductionFull: string; deductionNone: string; deductionPartial: string; deductionShare: string; pdpSubject: string; vatBaseHome: string; vatHome: string;
  vatCodeRequired: string; vatDeviation: string; pdpRequired: string; deductionShareRange: string; vatMissingAccounts: string;
}
export const DEFAULT_JOURNAL_LINES_TEXTS: JournalLinesEditorTexts = {
  row: "Ř.", debitAccount: "MD účet", creditAccount: "DAL účet", counterAccount: "Protiúčet", amount: "Částka", homeAmount: "Částka v {symbol}", foreignAmount: "Částka v {symbol}",
  text: "Text", quantity: "Množství", unit: "MJ", unitPrice: "Cena za MJ", dimension: "Zakázka", vs: "VS", partner: "Partner",
  debitDimension: "MD zakázka", creditDimension: "DAL zakázka", debitVs: "MD VS", creditVs: "DAL VS", debitPartner: "MD partner", creditPartner: "DAL partner",
  nonTax: "Nedaňový", nonTaxOn: "Nedaňový", nonTaxOff: "Daňový – klikněte pro nedaňový", rounding: "Zaokrouhlení",
  fxRounding: "Kurzové zaokrouhlení", fxRoundingPreview: "Kurzové zaokrouhlení – dopočítá se při uložení", fxRoundingHint: "Rozdíl mezi přepočtem celého dokladu a řádků – vytváří databáze", detail: "Detail řádku",
  showDetail: "Zobrazit detail řádku (Alt+↓)", hideDetail: "Skrýt detail řádku (Alt+↓)", sideDebit: "MD", sideCredit: "DAL", actions: "Akce",
  addLine: "Přidat řádek", duplicateLine: "Duplikovat řádek", removeLine: "Odebrat řádek", undo: "Zpět", removed: "Řádek byl odebrán",
  total: "Celkem", remaining: "Zbývá rozepsat", balanced: "Rozepsáno", roundingExists: "Zaokrouhlení už na dokladu je", errors: "Počet chyb",
  empty: "Zatím zde nejsou žádné řádky", debitRequired: "Vyberte účet MD", creditRequired: "Vyberte účet DAL", amountRequired: "Částka musí být nenulová",
  missingVs: "Chybí VS na straně {side}", missingDimension: "Chybí zakázka na straně {side}", search: "Hledat v řádcích…",
  searchResult: "Zobrazeno {shown} z {total} řádků", clearSearch: "Zrušit hledání", quantityPriceHint: "Množství × cena za MJ",
  vatCode: "Kód DPH", vatRate: "Sazba", vatAmount: "DPH", grossAmount: "Celkem s DPH", vatMode: "Zadání částky", vatModeNet: "Bez DPH", vatModeGross: "S DPH", vatManual: "Daň zadaná ručně", resetVat: "Vrátit vypočtenou daň",
  vatDeduction: "Nárok na odpočet", deductionFull: "Plný", deductionNone: "Bez nároku", deductionPartial: "Poměrný", deductionShare: "Poměr %", pdpSubject: "Předmět plnění PDP", vatBaseHome: "Základ pro DPH ({symbol})", vatHome: "DPH ({symbol})",
  vatCodeRequired: "Vyberte kód DPH", vatDeviation: "Ruční daň se liší od vypočtené o {amount}", pdpRequired: "Vyberte předmět plnění PDP", deductionShareRange: "Poměrný nárok musí být 1–99 %", vatMissingAccounts: "Chybí účty kódu {code} – daň se nezaúčtuje",
};
const SHARED_COLUMNS: JournalLineColumn[] = ["dimensionId", "vs", "partnerId"];
const SPLIT_COLUMNS: JournalLineColumn[] = ["debitVs", "creditVs", "debitPartnerId", "creditPartnerId", "debitDimensionId", "creditDimensionId"];
const ALL_EDITABLE: JournalLineColumn[] = ["counterAccount", "debitAccount", "creditAccount", "amount", "foreignAmount", "text", "quantity", "unitId", "unitPrice", "nonTax", ...SHARED_COLUMNS, ...SPLIT_COLUMNS];
const ACCOUNT_COLUMNS = new Set<JournalLineColumn>(["counterAccount", "debitAccount", "creditAccount"]);
const DIMENSION_COLUMNS = new Set<JournalLineColumn>(["dimensionId", "debitDimensionId", "creditDimensionId"]);
const PARTNER_COLUMNS = new Set<JournalLineColumn>(["partnerId", "debitPartnerId", "creditPartnerId"]);
const VS_COLUMNS = new Set<JournalLineColumn>(["vs", "debitVs", "creditVs"]);
const VAT_COLUMNS = new Set<JournalLineColumn>(["vatCodeId", "vatRate", "vatAmount", "grossAmount", "vatDeduction", "vatDeductionShare", "pdpSubjectCode"]);
const VAT_NUMERIC = new Set<JournalLineColumn>(["vatAmount", "grossAmount"]);
const isGridLine = (line: JournalLine) => !line.isVatLine && !line.isVatPreview;
type ColumnId = JournalLineColumn | "row" | "homeAmount" | "actions";
type EditState = { rowId: string; column: JournalLineColumn; seed?: string; original: JournalLine };
const newId = () => `line-${Math.random().toString(36).slice(2, 10)}`;
export const roundJournalAmount = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
export const formatJournalAccountDisplay = (code: string, name: string | undefined, display: JournalAccountDisplay, compact = false) => `${formatAccountCode(code)}${name && display === "numberName" && !compact ? ` - ${name}` : ""}`;
export const calculateLineAmount = (quantity?: number, unitPrice?: number) => quantity != null && unitPrice != null ? roundJournalAmount(quantity * unitPrice) : undefined;
export const journalAmountLabels = (texts: Pick<JournalLinesEditorTexts, "amount" | "homeAmount" | "foreignAmount">, documentSymbol: string, homeSymbol: string) => ({
  amount: texts.amount,
  homeAmount: texts.homeAmount.replace("{symbol}", homeSymbol),
  foreignAmount: texts.foreignAmount.replace("{symbol}", documentSymbol),
});
export const roundingSuggestion = ({ totalMode, expectedAmount, linesTotal, currentRounding = 0, limit = 0.5 }: { totalMode: "entered" | "computed"; expectedAmount?: number; linesTotal: number; currentRounding?: number; limit?: number }) => {
  if (totalMode === "computed") return roundJournalAmount(Math.round(linesTotal) - linesTotal);
  if (expectedAmount === undefined) return 0;
  const difference = roundJournalAmount(expectedAmount - linesTotal - currentRounding);
  return Math.abs(difference) <= limit ? difference : 0;
};
/** Pořadí řádků gridu: řádky základu, Kurzové zaokrouhlení, Zaokrouhlení. Řádky daně (isVatLine) se do gridu nezařazují. */
export const orderJournalLines = (lines: JournalLine[]) => { const grid = lines.filter(isGridLine); return [...grid.filter((line) => !line.isRounding && !line.isFxRounding), ...grid.filter((line) => line.isFxRounding), ...grid.filter((line) => line.isRounding)]; };
export const reorderJournalLines = (lines: JournalLine[], activeId: string, overId: string) => {
  const movable = lines.filter((line) => isGridLine(line) && !line.isRounding && !line.isFxRounding);
  const from = movable.findIndex((line) => line.id === activeId); const to = movable.findIndex((line) => line.id === overId);
  if (from < 0 || to < 0 || from === to) return orderJournalLines(lines);
  return [...arrayMove(movable, from, to), ...lines.filter((line) => isGridLine(line) && line.isFxRounding), ...lines.filter((line) => isGridLine(line) && line.isRounding)];
};
const WIDTHS: Record<ColumnId, number> = { row: 4.75, text: 15, quantity: 7, unitId: 5, unitPrice: 8, amount: 11, homeAmount: 10, counterAccount: 13, debitAccount: 13, creditAccount: 13, dimensionId: 11, vs: 8, partnerId: 13, debitDimensionId: 11, creditDimensionId: 11, debitVs: 8, creditVs: 8, debitPartnerId: 13, creditPartnerId: 13, nonTax: 7, currency: 6, foreignAmount: 10, rate: 8, actions: 5, vatCodeId: 7, vatRate: 5, vatAmount: 9, grossAmount: 10, vatDeduction: 0, vatDeductionShare: 0, pdpSubjectCode: 0 };
const TEXT_MIN_WIDTH_REM = 12;
const TEXT_SHRUNK_MIN_WIDTH_REM = 6;
const COMPACT_ACCOUNT_WIDTH_REM = 6;
const QUANTITY_COLUMNS = new Set<ColumnId>(["quantity", "unitId", "unitPrice"]);
const ACCOUNT_COLUMN_IDS = new Set<ColumnId>(["counterAccount", "debitAccount", "creditAccount"]);

export type JournalColumnLayoutInput = {
  availableWidthRem: number;
  mode: JournalLinesMode;
  visibleColumnIds: ColumnId[];
  widths?: Partial<Record<ColumnId, number>>;
  accountDisplay?: JournalAccountDisplay;
  protectedColumnIds?: ColumnId[];
  sharedSideFields?: boolean;
  /** Zoom gridu – šířky sloupců v rem se jím násobí. Výchozí 1. */
  zoom?: number;
};

export type JournalColumnLayout = {
  hiddenColumnIds: ColumnId[];
  compactAccounts: boolean;
  /** Potřebná šířka v rem po započtení zoomu (porovnatelná s availableWidthRem). */
  requiredWidthRem: number;
  /** Minimální šířka sloupce Text (rem před zoomem); zužuje se jako poslední krok. */
  textMinRem: number;
  /** False, pokud se ruční šířky kvůli místu dočasně nepoužily. */
  customWidthsApplied: boolean;
};

/** Přesune méně důležité sloupce do detailu podle jejich skutečné potřebné šířky. */
export function resolveJournalColumnLayout({ availableWidthRem: availableRaw, mode, visibleColumnIds, widths = {}, accountDisplay = "number", protectedColumnIds = [], sharedSideFields = false, zoom = 1 }: JournalColumnLayoutInput): JournalColumnLayout {
  // Šířky sloupců jsou v rem násobených zoomem gridu – porovnáváme v jednotkách před zoomem.
  const scale = zoom > 0 ? zoom : 1;
  const availableWidthRem = availableRaw / scale;
  let textMin = TEXT_MIN_WIDTH_REM;
  let useCustomWidths = true;
  const hidden = new Set<ColumnId>();
  const protectedIds = new Set(protectedColumnIds);
  let compactAccounts = accountDisplay === "number";
  const sideColumns: ColumnId[] = mode === "mainAccount" ? ["dimensionId"] : sharedSideFields ? ["partnerId", "vs", "dimensionId"] : ["debitDimensionId", "creditDimensionId"];
  const widthFor = (id: ColumnId) => {
    if (id === "text") return textMin;
    if (compactAccounts && ACCOUNT_COLUMN_IDS.has(id)) return COMPACT_ACCOUNT_WIDTH_REM;
    return (useCustomWidths ? widths[id] : undefined) ?? WIDTHS[id];
  };
  const required = () => visibleColumnIds.reduce((sum, id) => sum + (hidden.has(id) ? 0 : widthFor(id)), 0);
  const hideGroup = (ids: readonly ColumnId[]) => {
    if (required() <= availableWidthRem) return;
    ids.forEach((id) => { if (visibleColumnIds.includes(id) && !protectedIds.has(id)) hidden.add(id); });
  };

  hideGroup([...QUANTITY_COLUMNS]);
  hideGroup(["vatRate", "grossAmount"]);
  if (accountDisplay === "numberName" && required() > availableWidthRem && visibleColumnIds.some((id) => ACCOUNT_COLUMN_IDS.has(id))) compactAccounts = true;
  hideGroup(sideColumns);
  // Ručně rozšířené sloupce se při nedostatku místa vrátí na výchozí šířku.
  if (required() > availableWidthRem) useCustomWidths = false;
  // Poslední krok: zúžit Text (obsah se zkrátí se třemi tečkami a celý je v tooltipu).
  if (required() > availableWidthRem && visibleColumnIds.includes("text")) {
    textMin = Math.max(TEXT_SHRUNK_MIN_WIDTH_REM, TEXT_MIN_WIDTH_REM - (required() - availableWidthRem));
  }

  return { hiddenColumnIds: [...hidden], compactAccounts, requiredWidthRem: required() * scale, textMinRem: textMin, customWidthsApplied: useCustomWidths };
}

export interface JournalLinesEditorProps {
  lines: JournalLine[]; onChange: (lines: JournalLine[]) => void; accounts: AccountOption[]; dimensions?: DimensionOption[]; partners?: PartnerOption[];
  units?: UnitOption[]; onCreateUnit?: (code: string) => Promise<UnitOption>; documentCurrency: string; documentCurrencySymbol?: string; homeCurrency: string; homeCurrencySymbol?: string; rate?: number | null; rateAmount?: number;
  sideFields?: "shared" | "split"; sharedSide?: JournalSharedSide; mode?: JournalLinesMode; mainSide?: JournalMainSide; mainAccount?: string | null;
  sideFieldRules?: SideFieldRulesFn; dimensionRequired?: boolean; isNonTaxAllowed?: (line: JournalLine) => boolean; editableFields?: JournalLineColumn[];
  totalAmount?: number; totalMode?: "entered" | "computed"; rounding?: JournalLinesRounding; defaults?: JournalLineDefaults; validate?: (line: JournalLine) => JournalLineErrors;
  /** Celek řádků (stejný výpočet jako patička a „Celkem …“ v liště); volá se jen při změně hodnot. */
  onTotalsChange?: (totals: JournalTotals) => void;
  onValidationChange?: (count: number, errors: { line: number; field: string; message: string }[]) => void;
  reorderable?: boolean; initialEmptyLine?: boolean; showAllErrors?: boolean; showQuantityColumns?: boolean; accountDisplay?: JournalAccountDisplay; storageKey?: string; recap?: JournalLinesRecapState; recapTabs?: JournalRecapTab[]; texts?: Partial<JournalLinesEditorTexts>; className?: string;
  /** DPH na řádcích – bez propu se editor chová jako dřív. */
  vat?: JournalLinesVat;
}

function SortableRow({ id, disabled, children }: { id: string; disabled: boolean; children: (handle: React.ReactNode, style: React.CSSProperties, setNodeRef: (node: HTMLElement | null) => void) => React.ReactNode }) {
  const sortable = useSortable({ id, disabled });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition, opacity: sortable.isDragging ? 0.65 : 1 };
  const handle = disabled ? null : <button type="button" aria-label="Přesunout řádek" className="cursor-grab text-muted-foreground active:cursor-grabbing" {...sortable.attributes} {...sortable.listeners}><GripVertical className="size-[1em]" /></button>;
  return <>{children(handle, style, sortable.setNodeRef)}</>;
}

/** Editovatelná mřížka předkontací s jednotnou měnou dokladu, řazením a rekapitulací. */
export const JournalLinesEditor = React.forwardRef<HTMLDivElement, JournalLinesEditorProps>(function JournalLinesEditor({
  lines, onChange, accounts, dimensions = [], partners = [], units = [], onCreateUnit, documentCurrency, documentCurrencySymbol, homeCurrency, homeCurrencySymbol, rate = 1, rateAmount = 1,
  sideFields = "split", sharedSide = "both", mode = "internal", mainSide, mainAccount: mainAccountId, sideFieldRules = defaultSideFieldRules, dimensionRequired = false,
  isNonTaxAllowed, editableFields, totalAmount, totalMode = "computed", rounding, defaults, validate, onValidationChange, onTotalsChange, reorderable, initialEmptyLine = false, showAllErrors = false, showQuantityColumns = false, accountDisplay = "number", storageKey = "journal-lines", recap = {}, recapTabs = [], texts, className, vat,
}, forwardedRef) {
  const paneActive = useIsActivePane(); const t = React.useMemo(() => ({ ...DEFAULT_JOURNAL_LINES_TEXTS, ...texts }), [texts]); const rootRef = React.useRef<HTMLDivElement | null>(null);
  const { zoom, setZoom, density, setDensity } = useGridZoom(storageKey); const editable = React.useMemo(() => new Set(editableFields ?? ALL_EDITABLE), [editableFields]);
  const [active, setActive] = React.useState<{ rowId: string; column: JournalLineColumn } | null>(null); const [editing, setEditing] = React.useState<EditState | null>(null);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({}); const [search, setSearch] = React.useState("");
  const [containerWidth, setContainerWidth] = React.useState(0);
  const touchedRows = React.useRef(new Set<string>());
  const initializedEmptyLine = React.useRef(false);
  const [rootRemPx, setRootRemPx] = React.useState(16);
  const setRootRef = React.useCallback((node: HTMLDivElement | null) => { rootRef.current = node; if (typeof forwardedRef === "function") forwardedRef(node); else if (forwardedRef) forwardedRef.current = node; }, [forwardedRef]);
  React.useEffect(() => { const node = rootRef.current; if (!node) return; const update = () => { setContainerWidth(node.getBoundingClientRect().width); setRootRemPx(Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16); }; update(); const observer = new ResizeObserver(update); observer.observe(node); observer.observe(document.documentElement); window.addEventListener("resize", update); return () => { observer.disconnect(); window.removeEventListener("resize", update); }; }, []);
  const foreign = documentCurrency !== homeCurrency; const canReorder = (reorderable ?? editable.size > 0) && !search;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const accountByCode = React.useMemo(() => new Map(accounts.map((account) => [account.code, account])), [accounts]);
  const mainAccount = mode === "mainAccount" && mainAccountId && mainSide ? { accountId: mainAccountId, side: mainSide } : undefined;
  const mainOption = mainAccount ? accountByCode.get(mainAccount.accountId) : undefined;
  const counterColumn: "debitAccount" | "creditAccount" | null = mainAccount ? mainAccount.side === "MD" ? "creditAccount" : "debitAccount" : null;
  const documentMark = documentCurrencySymbol ?? documentCurrency; const homeMark = homeCurrencySymbol ?? homeCurrency;
  const amountLabels = journalAmountLabels(t, documentMark, homeMark);
  const homeAmountLabel = amountLabels.homeAmount;
  const foreignAmountLabel = amountLabels.foreignAmount;
  const labels: Record<JournalLineColumn, string> = { counterAccount: t.counterAccount, debitAccount: t.debitAccount, creditAccount: t.creditAccount, amount: t.amount, foreignAmount: foreignAmountLabel, text: t.text, quantity: t.quantity, unitId: t.unit, unitPrice: t.unitPrice, dimensionId: t.dimension, vs: t.vs, partnerId: t.partner, debitDimensionId: t.debitDimension, creditDimensionId: t.creditDimension, debitVs: t.debitVs, creditVs: t.creditVs, debitPartnerId: t.debitPartner, creditPartnerId: t.creditPartner, nonTax: t.nonTax, currency: documentCurrency, rate: "Kurz", vatCodeId: t.vatCode, vatRate: t.vatRate, vatAmount: t.vatAmount, grossAmount: t.grossAmount, vatDeduction: t.vatDeduction, vatDeductionShare: t.deductionShare, pdpSubjectCode: t.pdpSubject };
  const vatOn = Boolean(vat?.enabled); const vatCodes = React.useMemo(() => vat?.codes ?? [], [vat?.codes]); const vatCodeMap = React.useMemo(() => new Map(vatCodes.map((code) => [code.id, code])), [vatCodes]); const calcMode: VatCalcMode = vatOn ? vat?.calcMode ?? "net" : "net";
  const vatColumnDefs: GridColumn<ColumnId>[] = vatOn ? [{ id: "vatCodeId", label: t.vatCode }, { id: "vatRate", label: t.vatRate, align: "right" }, { id: "vatAmount", label: t.vatAmount, align: "right" }, { id: "grossAmount", label: t.grossAmount, align: "right" }] : [];
  const hasValue = (column: JournalLineColumn) => lines.some((line) => line[column] !== undefined && line[column] !== null && line[column] !== "");
  const columnDefs = React.useMemo<GridColumn<ColumnId>[]>(() => mode === "mainAccount" ? [
    { id: "row", label: t.row, locked: true }, { id: "text", label: t.text, locked: true }, { id: "counterAccount", label: counterColumn === "creditAccount" ? t.creditAccount : t.debitAccount, locked: true },
    { id: "quantity", label: t.quantity, defaultVisible: showQuantityColumns }, { id: "unitId", label: t.unit, defaultVisible: showQuantityColumns }, { id: "unitPrice", label: t.unitPrice, defaultVisible: showQuantityColumns, align: "right" },
    { id: "amount", label: t.amount, locked: true, align: "right" }, ...vatColumnDefs,
    ...(foreign ? [{ id: "homeAmount" as const, label: homeAmountLabel, defaultVisible: false, align: "right" as const }] : []),
    { id: "dimensionId", label: t.dimension }, { id: "vs", label: t.vs, defaultVisible: false }, { id: "partnerId", label: t.partner, defaultVisible: false }, { id: "actions", label: t.actions, locked: true, align: "right" },
  ] : [
    { id: "row", label: t.row, locked: true }, { id: "text", label: t.text, locked: true }, { id: "debitAccount", label: t.debitAccount, locked: true }, { id: "creditAccount", label: t.creditAccount, locked: true },
    { id: "quantity", label: t.quantity, defaultVisible: showQuantityColumns }, { id: "unitId", label: t.unit, defaultVisible: showQuantityColumns }, { id: "unitPrice", label: t.unitPrice, defaultVisible: showQuantityColumns, align: "right" },
    { id: "amount", label: t.amount, locked: true, align: "right" }, ...vatColumnDefs, ...(foreign ? [{ id: "homeAmount" as const, label: homeAmountLabel, defaultVisible: false, align: "right" as const }] : []),
    ...(sideFields === "shared"
      ? SHARED_COLUMNS.map((id) => ({ id, label: labels[id] }))
      : SPLIT_COLUMNS.map((id) => ({ id, label: labels[id], defaultVisible: hasValue(id) }))),
    { id: "actions", label: t.actions, locked: true, align: "right" },
  // Text overrides and current values intentionally rebuild the complete column model.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [mode, foreign, homeAmountLabel, lines, sideFields, showQuantityColumns, t, counterColumn, vatOn]);
  const columns = useGridColumns(`${storageKey}:v3`, columnDefs);
  const protectedColumns = columns.columns.filter((column) => columns.visible[column.id] && (column.defaultVisible === false || columns.explicitVisibility.includes(column.id) || (calcMode === "gross" && column.id === "grossAmount"))).map((column) => column.id);
  const effectiveWidthRem = containerWidth / rootRemPx;
  const requestedColumnIds = columns.columns.filter((column) => columns.visible[column.id]).map((column) => column.id);
  const columnLayout = React.useMemo(() => resolveJournalColumnLayout({ availableWidthRem: effectiveWidthRem, zoom, mode, visibleColumnIds: requestedColumnIds, accountDisplay, protectedColumnIds: protectedColumns, sharedSideFields: sideFields === "shared", widths: Object.fromEntries(Object.entries(columns.widths).map(([id, width]) => [id, typeof width === "number" ? width / rootRemPx : undefined])) }), [effectiveWidthRem, zoom, mode, requestedColumnIds, accountDisplay, protectedColumns, sideFields, columns.widths, rootRemPx]);
  const autoHidden = new Set<ColumnId>(columnLayout.hiddenColumnIds);
  const compactAccounts = columnLayout.compactAccounts;
  const visibleColumns = columns.columns.filter((column) => columns.visible[column.id] && !autoHidden.has(column.id)).sort((a, b) => a.id === "actions" ? 1 : b.id === "actions" ? -1 : 0);
  // Šířky sloupců v rem včetně zoomu. Uložené šířky jsou v px při zoomu 100 % (úchyt ukládá šířku ÷ zoom),
  // proto se zoom násobí jen jednou. Text dostane explicitní zbytek šířky, nejméně textMinRem –
  // minWidth na <col> prohlížeče ignorují, s table-fixed platí jen width.
  const colWidthsRem = React.useMemo(() => {
    const result: Record<string, number> = {};
    let fixed = 0;
    for (const column of visibleColumns) {
      if (column.id === "text") continue;
      const savedWidth = columns.widths[column.id];
      const base = compactAccounts && ACCOUNT_COLUMN_IDS.has(column.id) ? COMPACT_ACCOUNT_WIDTH_REM : typeof savedWidth === "number" && columnLayout.customWidthsApplied ? savedWidth / rootRemPx : WIDTHS[column.id];
      result[column.id] = base * zoom;
      fixed += base * zoom;
    }
    result.text = Math.max(columnLayout.textMinRem * zoom, effectiveWidthRem - fixed - 0.25);
    return result;
  }, [visibleColumns, columns.widths, compactAccounts, columnLayout.customWidthsApplied, columnLayout.textMinRem, rootRemPx, zoom, effectiveWidthRem]);
  const regularLines = lines.filter((line) => isGridLine(line) && !line.isRounding && !line.isFxRounding);
  const vatConfig: VatPreviewConfig = { codes: vatCodes, calcMode, rate, rateAmount, vatRate: vat?.vatRate, vatRateAmount: vat?.vatRateAmount, foreign };
  const vatReadOnly = vatOn && (Boolean(vat?.readOnly) || editable.size === 0);
  // Dokud je doklad editovatelný, daň se počítá vždy předběžně z aktuálních řádků základu (řádky daně z DB se ignorují).
  const vatPreview = vatOn && !vatReadOnly ? buildVatPreviewLines(regularLines, vatConfig, { mainAccount: mainAccount?.accountId, mainSide: mainAccount?.side }) : { lines: [] as JournalLine[], missingAccounts: [] as { lineId: string; code: string }[] };
  const taxLines: JournalLine[] = !vatOn ? [] : vatReadOnly ? lines.filter((line) => line.isVatLine).map((line) => ({ ...line, excludeFromTotal: line.excludeFromTotal ?? (mainAccount ? line.debitAccount !== mainAccount.accountId && line.creditAccount !== mainAccount.accountId : Boolean(vatCodeMap.get(line.vatCodeId ?? "")?.selfAssessment)) })) : vatPreview.lines;
  const fxPreviewLine = vatPreview.lines.find((line) => line.isFxRounding);
  const gridSource = mergeFxRoundingPreview(lines, vatPreview.lines, t.fxRoundingPreview);
  const normalizedLines = React.useMemo(() => orderJournalLines(gridSource), [gridSource]); // eslint-disable-line react-hooks/exhaustive-deps
  const displayedLines = React.useMemo(() => { const query = search.trim().toLocaleLowerCase("cs"); if (!query) return normalizedLines; return normalizedLines.filter((line) => [line.text, line.debitAccount, line.creditAccount, line.counterAccount, line.vs, line.partnerId, line.dimensionId, line.amount, line.foreignAmount, line.quantity, line.unitPrice].some((value) => String(value ?? "").toLocaleLowerCase("cs").includes(query))); }, [normalizedLines, search]);
  const missingVatAccounts = new Map(vatPreview.missingAccounts.map((item) => [item.lineId, item.code]));
  const journalTotals = computeJournalTotals(lines, { vat: vatOn ? { enabled: true, codes: vatCodes, calcMode, vatRate: vat?.vatRate, vatRateAmount: vat?.vatRateAmount } : null, readOnly: vatReadOnly, mainAccount: mainAccount?.accountId, mainSide: mainAccount?.side, foreign, rate, rateAmount });
  const baseTotal = journalTotals.baseHome; const documentBaseTotal = journalTotals.base; const linesTotal = journalTotals.grossHome; const documentLinesTotal = journalTotals.gross;
  const totalsKey = `${journalTotals.baseHome}|${journalTotals.base}|${journalTotals.vat}|${journalTotals.grossHome}|${journalTotals.gross}|${journalTotals.visibleLineCount}`;
  const onTotalsChangeRef = React.useRef(onTotalsChange); onTotalsChangeRef.current = onTotalsChange;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => { onTotalsChangeRef.current?.(journalTotals); }, [totalsKey]);
  const roundingLine = lines.find((line) => line.isRounding); const roundingValue = roundingLine ? Number(roundingLine.amount) || 0 : rounding?.value ?? 0;
  const total = roundJournalAmount(linesTotal + roundingValue + (fxPreviewLine ? 0 : lines.filter((line) => line.isFxRounding).reduce((sum, line) => sum + (Number(line.amount) || 0), 0)));
  const difference = totalAmount === undefined ? 0 : roundJournalAmount(totalAmount - (foreign ? documentLinesTotal : total)); const showRemaining = totalMode === "entered" && totalAmount !== undefined;
  const roundingExists = Boolean(roundingLine || rounding?.value); const suggestion = roundingSuggestion({ totalMode, expectedAmount: totalAmount, linesTotal: foreign ? documentLinesTotal : linesTotal, currentRounding: roundingValue, limit: rounding?.limit });
  const patch = (id: string, values: Partial<JournalLine>) => { touchedRows.current.add(id); onChange(lines.map((line) => line.id === id ? { ...line, ...values, isBlank: false } : line)); };
  const makeLine = (): JournalLine => ({ ...(vatOn ? { vatCodeId: vat?.defaultCodeId ?? regularLines[regularLines.length - 1]?.vatCodeId ?? null } : {}), id: newId(), debitAccount: mainAccount?.side === "MD" ? mainAccount.accountId : null, creditAccount: mainAccount?.side === "D" ? mainAccount.accountId : null, counterAccount: null, amount: undefined, nonTax: defaults?.nonTax ?? false, text: defaults?.text, dimensionId: defaults?.dimensionId, vs: defaults?.vs, partnerId: defaults?.partnerId, debitDimensionId: defaults?.debitDimensionId, creditDimensionId: defaults?.creditDimensionId, isBlank: true });
  // Výchozí kód DPH, který přijde až po prvním vykreslení, doplní jen do neupraveného počátečního řádku bez kódu.
  const defaultCodeApplied = React.useRef(false);
  React.useEffect(() => {
    const codeId = vat?.defaultCodeId; if (!vatOn || !initialEmptyLine || !codeId || defaultCodeApplied.current) return;
    if (lines.length && !lines[0]?.isBlank) { defaultCodeApplied.current = true; return; }
    const next = fillInitialVatCode(lines, codeId, vatCodes, touchedRows.current); if (!next) return;
    defaultCodeApplied.current = true; onChange(next);
  }, [vat?.defaultCodeId, lines]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => { if (!initialEmptyLine || initializedEmptyLine.current || lines.length) return; initializedEmptyLine.current = true; onChange([makeLine()]); }, [initialEmptyLine, lines.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const firstEditableColumn = () => visibleColumns.map((column) => column.id).find((id): id is JournalLineColumn => id !== "row" && id !== "homeAmount" && id !== "actions" && editable.has(id));
  const addLine = (focus = false) => { setSearch(""); const next = makeLine(); onChange([...regularLines, next, ...lines.filter((line) => line.isFxRounding || line.isRounding || line.isVatLine)]); if (focus) requestAnimationFrame(() => { const column = firstEditableColumn(); if (column) rootRef.current?.querySelector<HTMLElement>(`[data-cell-key="${next.id}:${column}"]`)?.focus(); }); return next; };
  const duplicate = (line: JournalLine) => { const next = [...regularLines]; const index = next.findIndex((item) => item.id === line.id); next.splice(index + 1, 0, { ...line, id: newId(), vatManual: false, vatAmount: undefined, vatAmountHome: undefined, vatBaseHome: undefined, vatParentLineId: undefined }); onChange([...next, ...lines.filter((item) => item.isFxRounding || item.isRounding || item.isVatLine)]); };
  const remove = (line: JournalLine) => { if (line.isRounding) { rounding?.onChange?.(0); onChange(lines.filter((item) => item.id !== line.id)); return; } const index = lines.findIndex((item) => item.id === line.id); const remaining = lines.filter((item) => item.id !== line.id); onChange(remaining); toast(t.removed, { action: { label: t.undo, onClick: () => onChange([...remaining.slice(0, index), line, ...remaining.slice(index)]) } }); };
  const moveRow = (id: string, delta: number) => { if (!canReorder) return; const movable = normalizedLines.filter((line) => !line.isRounding && !line.isFxRounding); const index = movable.findIndex((line) => line.id === id); const target = movable[index + delta]; if (target) onChange(reorderJournalLines(lines, id, target.id)); };
  const onDragEnd = ({ active: dragged, over }: DragEndEvent) => { if (canReorder && over) onChange(reorderJournalLines(lines, String(dragged.id), String(over.id))); };
  const accountFor = (line: JournalLine, column: JournalLineColumn) => column === "counterAccount" ? line.counterAccount ?? (counterColumn ? line[counterColumn] : null) : line[column as "debitAccount" | "creditAccount"];
  const updateCalculated = (line: JournalLine, values: Partial<JournalLine>) => { const next = { ...line, ...values }; const calculated = calculateLineAmount(next.quantity, next.unitPrice); if (calculated !== undefined) { if (foreign) { next.foreignAmount = calculated; next.amount = roundJournalAmount(calculated * (rate || 0) / rateAmount); } else next.amount = calculated; } patch(line.id, next); };
  const patchVat = (line: JournalLine, values: Partial<JournalLine>) => { const next = { ...line, ...values }; if (calcMode === "gross") Object.assign(next, baseFromGross(next, vatCodes, { foreign, rate, rateAmount })); patch(line.id, next); };
  const changeVatCode = (line: JournalLine, codeId: string) => { const code = vatCodeMap.get(codeId); patchVat(line, { vatCodeId: codeId || null, vatRate: code?.rate ?? null, vatManual: false, vatAmount: undefined, vatDeduction: (code?.direction === "in" || code?.selfAssessment) && code?.hasTax ? line.vatDeduction ?? "full" : undefined, vatDeductionShare: code?.direction === "in" || code?.selfAssessment ? line.vatDeductionShare : undefined, pdpSubjectCode: code?.requiresPdpSubject ? line.pdpSubjectCode : null }); };
  const changeCalcMode = (next: VatCalcMode) => { if (next === calcMode) return; if (next === "gross") onChange(applyVatCalcMode(lines, "gross", vatConfig)); vat?.onCalcModeChange?.(next); };
  const canEditCell = (line: JournalLine, column: JournalLineColumn) => { if (line.isFxRounding) return false; if (line.isRounding) return column === "amount" && Boolean(rounding?.onChange) && rounding?.readOnly !== true; if (VAT_COLUMNS.has(column)) { if (!vatOn || vatReadOnly || column === "vatRate") return false; if (column === "grossAmount") return calcMode === "gross"; if (column === "vatAmount") return Boolean(vatCodeMap.get(line.vatCodeId ?? "")?.hasTax); return true; } if (column === "amount" && vatOn && calcMode === "gross") return false; if (!editable.has(column)) return false; if (column === "amount" && calculateLineAmount(line.quantity, line.unitPrice) !== undefined) return false; return true; };
  const sideIssues = (line: JournalLine): JournalLineErrors => {
    const issues: JournalLineErrors = {};
    (["debit", "credit"] as const).forEach((side) => {
      if (sideFields === "shared" && sharedSide !== "both" && sharedSide !== side) return;
      const code = side === "debit" ? line.debitAccount : line.creditAccount;
      const account = code ? accountByCode.get(code) : undefined;
      if (!account) return;
      const rules = sideFieldRules(account, { dimensionRequired });
      const sideLabel = side === "debit" ? t.sideDebit : t.sideCredit;
      const vsValue = sideFields === "shared" ? line.vs : side === "debit" ? line.debitVs : line.creditVs;
      const dimensionValue = sideFields === "shared" ? line.dimensionId : side === "debit" ? line.debitDimensionId : line.creditDimensionId;
      if (rules.vsRequired && !vsValue) {
        const column = sideFields === "shared" ? "vs" : side === "debit" ? "debitVs" : "creditVs";
        issues[column] = t.missingVs.replace("{side}", sideLabel);
      }
      if (rules.dimensionRequired && !dimensionValue) {
        const column = sideFields === "shared" ? "dimensionId" : side === "debit" ? "debitDimensionId" : "creditDimensionId";
        issues[column] = t.missingDimension.replace("{side}", sideLabel);
      }
    });
    return issues;
  };
  const vatIssues = (line: JournalLine) => {
    const errors: JournalLineErrors = {}; const warnings: JournalLineErrors = {};
    if (!vatOn || vatReadOnly) return { errors, warnings };
    const code = line.vatCodeId ? vatCodeMap.get(line.vatCodeId) : undefined;
    if (!code) { if (vat?.isCodeRequired?.(line) ?? true) errors.vatCodeId = t.vatCodeRequired; return { errors, warnings }; }
    const resolved = resolveLineVat(line, vatCodeMap, { calcMode, foreign });
    const deviation = Math.abs(resolved.deviation);
    const message = t.vatDeviation.replace("{amount}", `${formatAmount(deviation, 2)} ${documentMark}`);
    if (deviation > 1) errors.vatAmount = message; else if (deviation > 0) warnings.vatAmount = message;
    if (code.requiresPdpSubject && !line.pdpSubjectCode) errors.pdpSubjectCode = t.pdpRequired;
    if ((code.direction === "in" || code.selfAssessment) && code.hasTax && line.vatDeduction === "partial") { const share = Number(line.vatDeductionShare); if (!(share >= 1 && share <= 99)) errors.vatDeductionShare = t.deductionShareRange; }
    const missing = missingVatAccounts.get(line.id); if (missing) warnings.vatCodeId = t.vatMissingAccounts.replace("{code}", missing);
    return { errors, warnings };
  };
  const validations = new Map(lines.map((line) => { const errors: JournalLineErrors = {}; const validateLine = showAllErrors || !line.isBlank || touchedRows.current.has(line.id); const validatesRegularLine = validateLine && isGridLine(line) && !line.isRounding && !line.isFxRounding; if (validatesRegularLine) { if (!line.debitAccount) errors.debitAccount = t.debitRequired; if (!line.creditAccount) errors.creditAccount = t.creditRequired; if (!Number(line.amount)) errors.amount = t.amountRequired; Object.assign(errors, sideIssues(line)); Object.assign(errors, vatIssues(line).errors); } return [line.id, validatesRegularLine ? { ...errors, ...validate?.(line) } : {}]; }));
  const vatWarnings = new Map(regularLines.map((line) => [line.id, vatIssues(line).warnings]));
  const validationErrors = lines.flatMap((line, lineIndex) => Object.entries(validations.get(line.id) ?? {}).flatMap(([field, message]) => message ? [{ line: lineIndex + 1, field, message }] : []));
  const validationSignature = JSON.stringify(validationErrors);
  const validationChangeRef = React.useRef(onValidationChange);
  React.useEffect(() => { validationChangeRef.current = onValidationChange; }, [onValidationChange]);
  React.useEffect(() => { validationChangeRef.current?.(validationErrors.length, validationErrors); }, [validationSignature]); // eslint-disable-line react-hooks/exhaustive-deps
  const displayValue = (line: JournalLine, column: JournalLineColumn | "homeAmount") => { if (VAT_COLUMNS.has(column as JournalLineColumn)) { const resolved = resolveLineVat(line, vatCodeMap, { calcMode, foreign }); if (column === "vatCodeId") return resolved.code?.code ?? ""; if (column === "vatRate") return resolved.code ? resolved.rate == null ? "—" : `${new Intl.NumberFormat("cs-CZ").format(resolved.rate)} %` : ""; if (column === "vatAmount") return resolved.code?.hasTax ? formatAmount(resolved.vat, 2) : resolved.code ? "—" : ""; if (column === "grossAmount") return resolved.code || line.grossAmount != null ? formatAmount(resolved.gross, 2) : ""; if (column === "pdpSubjectCode") return line.pdpSubjectCode ?? ""; return ""; } if (column === "counterAccount") { const code = accountFor(line, column); const account = code ? accountByCode.get(code) : undefined; return code ? formatJournalAccountDisplay(code, account?.name, accountDisplay, compactAccounts) : ""; } if (ACCOUNT_COLUMNS.has(column as JournalLineColumn)) { const code = line[column as "debitAccount" | "creditAccount"]; const account = code ? accountByCode.get(code) : undefined; return code ? formatJournalAccountDisplay(code, account?.name, accountDisplay, compactAccounts) : ""; } if (DIMENSION_COLUMNS.has(column as JournalLineColumn)) return dimensions.find((item) => item.id === line[column as "dimensionId"])?.name ?? ""; if (PARTNER_COLUMNS.has(column as JournalLineColumn)) return partners.find((item) => item.id === line[column as "partnerId"])?.name ?? ""; if (column === "unitId") return units.find((item) => item.id === line.unitId)?.code ?? ""; if (column === "homeAmount") return line.amount == null && line.foreignAmount == null ? "" : formatAmount(Number(line.amount) || roundJournalAmount((line.foreignAmount || 0) * (rate || 0) / rateAmount), 2); if (column === "amount") { const amount = foreign ? line.foreignAmount : line.amount; return amount == null ? "" : formatAmount(Number(amount), 2); } if (column === "quantity") return line.quantity == null ? "" : new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 4 }).format(line.quantity); if (column === "unitPrice") return line.unitPrice == null ? "" : new Intl.NumberFormat("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(line.unitPrice); return String(line[column as JournalLineColumn] ?? ""); };
  const finish = () => setEditing(null); const cancel = () => { if (editing) onChange(lines.map((line) => line.id === editing.rowId ? editing.original : line)); setEditing(null); };
  const focusRelative = (rowId: string, column: JournalLineColumn, delta: number) => requestAnimationFrame(() => { const cells = [...(rootRef.current?.querySelectorAll<HTMLElement>("[data-cell-key][tabindex='0']") ?? [])]; const index = cells.findIndex((cell) => cell.dataset.cellKey === `${rowId}:${column}`); const target = cells[index + delta]; if (target) target.focus(); else if (delta > 0 && index === cells.length - 1) addLine(true); });
  const renderEditor = (line: JournalLine, column: JournalLineColumn) => {
    const navigate = (event: React.KeyboardEvent) => { if (event.key === "Tab" || event.key === "Enter") focusRelative(line.id, column, event.shiftKey ? -1 : 1); };
    const commonKey = (event: React.KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); cancel(); return; }
      if (event.key === "Enter" || event.key === "Tab") { event.preventDefault(); finish(); navigate(event); }
    };
    const selectKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== "Tab" && event.key !== "Enter") return;
      event.preventDefault();
      const selected = event.currentTarget.closest("[cmdk-root]")?.querySelector<HTMLElement>('[cmdk-item][aria-selected="true"]');
      selected?.click();
      finish();
      focusRelative(line.id, column, event.shiftKey ? -1 : 1);
    };
    const closeSelect = (open: boolean) => { if (!open) finish(); };
    if (ACCOUNT_COLUMNS.has(column)) return <AccountSelect defaultOpen accounts={mainAccount && column === "counterAccount" && mainOption?.category ? accounts.filter((account) => account.category !== mainOption.category) : accounts} value={accountFor(line, column)} initialSearch={editing?.seed} onKeyDown={selectKey} onChange={(value) => { const selected = accountByCode.get(value); const allowed = isResultAccountType(selected, value); const values = column === "counterAccount" && counterColumn ? { counterAccount: value, [counterColumn]: value, nonTax: allowed ? !!selected?.nonTaxDefault : false } : { [column]: value, nonTax: allowed ? !!selected?.nonTaxDefault : false }; patch(line.id, values); finish(); }} onOpenChange={closeSelect} className="journal-cell-editor" />;
    if (DIMENSION_COLUMNS.has(column)) return <DimensionSelect defaultOpen initialSearch={editing?.seed} options={dimensions} value={line[column as "dimensionId"]} onKeyDown={selectKey} onChange={(value) => { patch(line.id, { [column]: value }); finish(); }} onOpenChange={closeSelect} className="journal-cell-editor" />;
    if (PARTNER_COLUMNS.has(column)) return <PartnerSelect defaultOpen initialSearch={editing?.seed} partners={partners} value={line[column as "partnerId"]} onKeyDown={selectKey} onChange={(value) => { patch(line.id, { [column]: value }); finish(); }} onOpenChange={closeSelect} className="journal-cell-editor" />;
    if (column === "unitId") return <UnitSelect defaultOpen initialSearch={editing?.seed} options={units} value={line.unitId} onKeyDown={selectKey} onChange={(value) => { patch(line.id, { unitId: value }); finish(); }} onOpenChange={closeSelect} onCreateUnit={onCreateUnit} className="journal-cell-editor" />;
    if (column === "vatCodeId") return <VatCodeSelect defaultOpen codes={vatCodes} value={line.vatCodeId} initialSearch={editing?.seed} onKeyDown={selectKey} onChange={(value) => { changeVatCode(line, value); finish(); }} onOpenChange={closeSelect} className="journal-cell-editor" />;
    if (VAT_NUMERIC.has(column)) { const resolved = resolveLineVat(line, vatCodeMap, { calcMode, foreign }); return <DecimalInput autoFocus aria-label={labels[column]} value={column === "vatAmount" ? resolved.vat : resolved.gross} seed={editing?.seed} decimals={2} className="journal-cell-editor" onKeyDown={commonKey} onBlur={finish} onChange={(value) => { if (editing?.seed !== undefined) setEditing({ ...editing, seed: undefined }); const numeric = value === "" ? undefined : Number(value); if (column === "vatAmount") patchVat(line, numeric == null ? { vatManual: false, vatAmount: undefined } : { vatManual: true, vatAmount: numeric }); else patchVat(line, { grossAmount: numeric }); }} />; }
    if (["amount", "quantity", "unitPrice"].includes(column)) { const current = column === "amount" && foreign ? line.foreignAmount : line[column as "amount" | "quantity" | "unitPrice"]; return <DecimalInput autoFocus aria-label={labels[column]} value={current} seed={editing?.seed} decimals={column === "quantity" ? 4 : column === "unitPrice" ? 4 : 2} displayDecimals={column === "unitPrice" ? 2 : undefined} className="journal-cell-editor" onKeyDown={commonKey} onBlur={finish} onChange={(value) => { if (editing?.seed !== undefined) setEditing({ ...editing, seed: undefined }); const numeric = value === "" ? undefined : Number(value); if (line.isRounding) { rounding?.onChange?.(numeric ?? 0); return; } if (column === "amount") { if (foreign) patch(line.id, { foreignAmount: numeric, amount: numeric == null ? undefined : roundJournalAmount(numeric * (rate || 0) / rateAmount) }); else patch(line.id, { amount: numeric }); } else updateCalculated(line, { [column]: numeric }); }} />; }
    return <Input autoFocus aria-label={labels[column]} value={editing?.seed ?? String(line[column] ?? "")} className="journal-cell-editor" onKeyDown={commonKey} onBlur={finish} onChange={(event) => { if (editing?.seed !== undefined) setEditing({ ...editing, seed: undefined }); patch(line.id, { [column]: VS_COLUMNS.has(column) ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value }); }} />;
  };
  const renderCell = (line: JournalLine, rowIndex: number, column: JournalLineColumn) => { const canEdit = canEditCell(line, column); const content = editing?.rowId === line.id && editing.column === column ? renderEditor(line, column) : displayValue(line, column); const calculated = column === "amount" && calculateLineAmount(line.quantity, line.unitPrice) !== undefined; const taxAccount = mode === "mainAccount" ? accountByCode.get(accountFor(line, "counterAccount") ?? "") : [line.debitAccount, line.creditAccount].map((code) => accountByCode.get(code ?? "")).find((account) => isResultAccountType(account)); const nonTaxAllowed = isNonTaxAllowed?.(line) ?? isResultAccountType(taxAccount); const toggleNonTax = () => patch(line.id, { nonTax: nonTaxAllowed ? !line.nonTax : false }); const accountCode = ACCOUNT_COLUMNS.has(column) ? accountFor(line, column) : null; const accountTitle = accountCode && (accountDisplay === "number" || compactAccounts) ? accountByCode.get(accountCode)?.name : undefined; const errorMessage = validations.get(line.id)?.[column]; const warningMessage = vatWarnings.get(line.id)?.[column]; const node = <div tabIndex={canEdit ? 0 : -1} role="gridcell" data-cell-key={`${line.id}:${column}`} aria-label={`${labels[column]} ${rowIndex + 1}`} data-invalid={errorMessage ? true : undefined} data-warning={warningMessage ? true : undefined} title={errorMessage ?? warningMessage} className={cn("journal-grid-cell flex min-h-[1.8em] items-center truncate rounded-sm px-1 outline-none", canEdit && "cursor-cell")} onFocus={() => setActive({ rowId: line.id, column })} onClick={() => canEdit && !editing && setEditing({ rowId: line.id, column, original: { ...line } })} onDoubleClick={() => canEdit && setEditing({ rowId: line.id, column, original: { ...line } })} onKeyDown={(event) => { if (column === "amount" && event.altKey && event.key.toLowerCase() === "n" && nonTaxAllowed) { event.preventDefault(); toggleNonTax(); return; } if (event.altKey && event.key === "ArrowUp") { event.preventDefault(); moveRow(line.id, -1); return; } if (event.altKey && event.key === "ArrowDown") { event.preventDefault(); moveRow(line.id, 1); return; } if (!canEdit || editing) return; if (event.key === "F2" || event.key === "Enter") { event.preventDefault(); setEditing({ rowId: line.id, column, original: { ...line } }); } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) { event.preventDefault(); const seed = VS_COLUMNS.has(column) ? event.key.replace(/\D/g, "") : event.key; if (["amount", "quantity", "unitPrice"].includes(column) && /^\d$/.test(seed)) { const numeric = Number(seed); if (column === "amount") { if (foreign) patch(line.id, { foreignAmount: numeric, amount: roundJournalAmount(numeric * (rate || 0) / rateAmount) }); else patch(line.id, { amount: numeric }); } else updateCalculated(line, { [column]: numeric }); } else if (!VAT_COLUMNS.has(column) && !ACCOUNT_COLUMNS.has(column) && !DIMENSION_COLUMNS.has(column) && !PARTNER_COLUMNS.has(column) && column !== "unitId" && !["amount", "quantity", "unitPrice"].includes(column)) patch(line.id, { [column]: seed }); setEditing({ rowId: line.id, column, seed, original: { ...line } }); } }}>{column === "vatAmount" && line.vatManual && editing?.rowId !== line.id ? <Pencil aria-label={t.vatManual} className="mr-1 size-[0.85em] shrink-0 text-muted-foreground" /> : null}<span className="min-w-0 flex-1 truncate">{content}</span>{column === "amount" && nonTaxAllowed && editing?.rowId !== line.id ? <Tooltip><TooltipTrigger asChild><button type="button" tabIndex={-1} aria-pressed={!!line.nonTax} aria-label={line.nonTax ? t.nonTaxOn : t.nonTaxOff} onClick={(event) => { event.stopPropagation(); toggleNonTax(); }} className={cn("order-first mr-1 inline-flex h-6 min-w-6 items-center justify-center rounded px-1 text-[0.65rem] font-bold", line.nonTax ? "bg-warning-soft text-warning-strong" : "text-muted-foreground hover:bg-muted")} >{line.nonTax ? "ND" : <ReceiptText className="size-3.5" />}</button></TooltipTrigger><TooltipContent>{line.nonTax ? t.nonTaxOn : t.nonTaxOff}</TooltipContent></Tooltip> : null}</div>; if (accountTitle) return <Tooltip><TooltipTrigger asChild>{node}</TooltipTrigger><TooltipContent>{accountTitle}</TooltipContent></Tooltip>; return calculated ? <Tooltip><TooltipTrigger asChild>{node}</TooltipTrigger><TooltipContent>{t.quantityPriceHint}</TooltipContent></Tooltip> : node; };
  const renderVatDetail = (line: JournalLine, shown: Set<ColumnId>) => {
    const code = line.vatCodeId ? vatCodeMap.get(line.vatCodeId) : undefined; const resolved = resolveLineVat(line, vatCodeMap, { calcMode, foreign }); const readOnly = vatReadOnly;
    const conversion = (vat?.vatRate || rate || 0) / ((vat?.vatRate ? vat?.vatRateAmount : rateAmount) || 1);
    const field = (key: string, label: string, width: string, child: React.ReactNode, error?: string) => <div key={key} className={cn("flex min-w-0 flex-col gap-1", width)}><Label title={label} className="text-xs text-muted-foreground">{label}</Label>{child}{error ? <span role="alert" className="truncate text-xs text-destructive" title={error}>{error}</span> : null}</div>;
    const errors = validations.get(line.id) ?? {};
    const nodes: React.ReactNode[] = [];
    if (!shown.has("vatRate") && code) nodes.push(field("vatRate", t.vatRate, "flex-none w-[6rem]", <Input readOnly value={displayValue(line, "vatRate")} className="text-right tabular-nums" />));
    if (!shown.has("grossAmount") && code) nodes.push(field("grossAmount", t.grossAmount, "flex-none w-[9.5rem]", <DecimalInput value={resolved.gross} decimals={2} disabled={!canEditCell(line, "grossAmount")} onChange={(value) => patchVat(line, { grossAmount: value === "" ? undefined : Number(value) })} />));
    if ((code?.direction === "in" || code?.selfAssessment) && code?.hasTax) {
      nodes.push(field("vatDeduction", t.vatDeduction, "flex-none w-max", <SegmentedField ariaLabel={t.vatDeduction} disabled={readOnly} options={[{ value: "full", label: t.deductionFull }, { value: "none", label: t.deductionNone }, { value: "partial", label: t.deductionPartial }]} value={line.vatDeduction ?? "full"} onChange={(value) => patch(line.id, { vatDeduction: value as VatDeduction, vatDeductionShare: value === "partial" ? line.vatDeductionShare : undefined })} />));
      if (line.vatDeduction === "partial") nodes.push(field("vatDeductionShare", t.deductionShare, "flex-none w-[6rem]", <DecimalInput value={line.vatDeductionShare} decimals={0} disabled={readOnly} onChange={(value) => patch(line.id, { vatDeductionShare: value === "" ? undefined : Number(value) })} />, errors.vatDeductionShare));
    }
    if (code?.requiresPdpSubject) nodes.push(field("pdpSubjectCode", t.pdpSubject, "min-w-[12rem] flex-1 basis-[14rem]", <OptionSelect value={line.pdpSubjectCode} disabled={readOnly} options={(vat?.pdpSubjects ?? []).map((item) => ({ value: item.code, label: `${item.code} – ${item.name}` }))} onChange={(value) => patch(line.id, { pdpSubjectCode: value || null })} />, errors.pdpSubjectCode));
    if (foreign && code?.hasTax) {
      nodes.push(field("vatBaseHome", t.vatBaseHome.replace("{symbol}", homeMark), "flex-none w-[9.5rem]", <Input readOnly value={formatAmount(line.vatBaseHome ?? roundJournalAmount(resolved.base * conversion), 2)} className="text-right tabular-nums" />));
      nodes.push(field("vatHome", t.vatHome.replace("{symbol}", homeMark), "flex-none w-[9.5rem]", <Input readOnly value={formatAmount(line.vatAmountHome ?? roundJournalAmount(resolved.vat * conversion), 2)} className="text-right tabular-nums" />));
    }
    return nodes;
  };
  const renderDetail = (line: JournalLine) => { const shown = new Set(visibleColumns.map((column) => column.id)); const candidates = mode === "mainAccount" ? (["quantity", "unitId", "unitPrice", "vs", "partnerId", "dimensionId"] as JournalLineColumn[]) : (["quantity", "unitId", "unitPrice", ...(sideFields === "split" ? SPLIT_COLUMNS : SHARED_COLUMNS)] as JournalLineColumn[]); const fields = candidates.filter((id) => !shown.has(id)); const detailFieldCount = fields.length + (foreign && !shown.has("homeAmount") ? 1 : 0); const widthClass = (id: JournalLineColumn) => VS_COLUMNS.has(id) ? "flex-none w-[10rem]" : id === "quantity" ? "flex-none w-[7rem]" : id === "unitId" ? "flex-none w-[6rem]" : id === "unitPrice" ? "flex-none w-[8rem]" : PARTNER_COLUMNS.has(id) || DIMENSION_COLUMNS.has(id) ? "min-w-[12rem] flex-1 basis-[14rem]" : "flex-none w-auto"; return <div data-slot="journal-line-detail-fields" data-field-count={detailFieldCount} className="journal-line-detail-grid flex flex-wrap items-end gap-3 bg-muted/30 p-3">{fields.map((id) => <div key={id} className={cn("flex min-w-0 flex-col gap-1", widthClass(id))}><Label title={labels[id]} className="text-xs text-muted-foreground">{labels[id]}</Label>{DIMENSION_COLUMNS.has(id) ? <DimensionSelect options={dimensions} value={line[id as "dimensionId"]} disabled={!canEditCell(line, id)} onChange={(value) => patch(line.id, { [id]: value })} /> : PARTNER_COLUMNS.has(id) ? <PartnerSelect partners={partners} value={line[id as "partnerId"]} disabled={!canEditCell(line, id)} onChange={(value) => patch(line.id, { [id]: value })} /> : id === "unitId" ? <UnitSelect options={units} value={line.unitId} disabled={!canEditCell(line, id)} onChange={(value) => patch(line.id, { unitId: value })} onCreateUnit={onCreateUnit} /> : ["quantity", "unitPrice"].includes(id) ? <DecimalInput value={line[id as "quantity" | "unitPrice"]} disabled={!canEditCell(line, id)} onChange={(value) => updateCalculated(line, { [id]: value === "" ? undefined : Number(value) })} /> : VS_COLUMNS.has(id) ? <VsField value={String(line[id] ?? "")} disabled={!canEditCell(line, id)} onChange={(value) => patch(line.id, { [id]: value })} /> : <Input value={String(line[id] ?? "")} disabled={!canEditCell(line, id)} onChange={(event) => patch(line.id, { [id]: event.target.value })} />}</div>)}{vatOn ? renderVatDetail(line, shown) : null}{foreign && !shown.has("homeAmount") ? <div className="flex w-[9.5rem] flex-none flex-col gap-1"><Label title={homeAmountLabel} className="text-xs text-muted-foreground">{homeAmountLabel}</Label><Input readOnly value={displayValue(line, "homeAmount")} className="text-right tabular-nums" /></div> : null}</div>; };
  const onRootKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => { if (!paneActive || editing || (!event.ctrlKey && !event.metaKey)) return; if (event.key === "Enter") { event.preventDefault(); addLine(true); return; } if (!active) return; const line = lines.find((item) => item.id === active.rowId); if (!line || line.isRounding || line.isFxRounding) return; const key = event.key.toLocaleLowerCase("cs"); if (key === "d") { event.preventDefault(); duplicate(line); } if (event.key === "Delete") { event.preventDefault(); remove(line); } };
  const grossHidden = vatOn && (!columns.visible.grossAmount || autoHidden.has("grossAmount"));
  const vatSummary = vatOn ? summarizeVat(regularLines, vatConfig) : [];
  const documentVatTotal = roundJournalAmount(vatSummary.reduce((sum, row) => sum + row.vat, 0));
  const documentGrossTotal = foreign ? documentLinesTotal : total;
  const grossColumnVisible = visibleColumns.some((column) => column.id === "grossAmount");
  const handleRounding = () => { const changeRounding = rounding?.onChange; if (!changeRounding || rounding?.readOnly || roundingExists) return; changeRounding(suggestion); };
  const dragIds = displayedLines.filter((line) => !line.isRounding && !line.isFxRounding).map((line) => line.id); const span = visibleColumns.length;
  return <GridZoomContext.Provider value={{ zoom, setZoom, density }}><div ref={setRootRef} className={cn("@container overflow-clip rounded-lg border bg-card", className)} onKeyDown={onRootKeyDown}>
    <GridToolbar zoom={zoom} density={density} left={<><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" onClick={() => addLine(true)} disabled={editable.size === 0} aria-label={`${t.addLine} (Ctrl+Enter)`} className="grid-toolbar-control grid-toolbar-primary shrink-0"><Plus className="size-[1.2em]" /></Button></TooltipTrigger><TooltipContent>{`${t.addLine} (Ctrl+Enter)`}</TooltipContent></Tooltip>{rounding ? <Tooltip><TooltipTrigger asChild><Button data-slot="journal-lines-rounding" data-limit={rounding.limit} type="button" variant="outline" disabled={rounding.readOnly || !rounding.onChange || roundingExists} onClick={handleRounding} className="grid-toolbar-control">± {rounding.label ?? t.rounding}</Button></TooltipTrigger><TooltipContent>{roundingExists ? t.roundingExists : `${formatAmount(suggestion, 2)} ${documentMark}`}</TooltipContent></Tooltip> : null}{vatOn ? <GridSegmentedToggle disabled={vatReadOnly || editable.size === 0} ariaLabel={t.vatMode} options={[{ value: "net", label: t.vatModeNet }, { value: "gross", label: t.vatModeGross }]} value={calcMode} defaultValue={calcMode} onChange={(value) => changeCalcMode(value as VatCalcMode)} className={cn(vatReadOnly && "pointer-events-none opacity-60")} aria-disabled={vatReadOnly || undefined} /> : null}{showRemaining ? <><GridToolbarSeparator density={density} /><span data-slot="journal-lines-remaining" className={cn("inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold", difference === 0 ? "bg-success-soft text-success-strong" : "bg-destructive-soft text-destructive-strong")}>{difference === 0 ? `✓ ${t.balanced}` : `${t.remaining} ${formatAmount(difference, 2)}`}</span>{vatOn && !grossColumnVisible ? <span data-slot="journal-lines-toolbar-total" className="inline-flex h-8 items-center whitespace-nowrap px-2 text-xs font-semibold tabular-nums">{`${t.total} ${formatAmount(documentGrossTotal, 2)} ${documentMark}`}</span> : null}</> : null}</>} right={<><GridSearch value={search} onChange={setSearch} zoom={zoom} placeholder={t.search} /><ColumnPicker columns={columns.columns.map((column) => ({ id: column.id, label: column.label, locked: column.locked, pinned: column.id === "actions" ? "end" as const : undefined }))} visible={columns.columnVisible} onToggle={columns.toggle} onReset={columns.reset} onReorder={columns.reorder} zoom={zoom} /><ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} /></>} />
    {search ? <div className="flex items-center justify-between border-b bg-filter-active/10 px-3 py-1 text-xs text-filter-active"><span>{t.searchResult.replace("{shown}", String(displayedLines.length)).replace("{total}", String(normalizedLines.length))}</span><Button type="button" variant="ghost" size="icon" aria-label={t.clearSearch} onClick={() => setSearch("")} className="size-7 text-filter-active"><X /></Button></div> : null}
    <ZoomGrid zoom={zoom} setZoom={setZoom} density={density} height="auto" stickyHeader="pane" className="journal-lines-grid" overflowFallback={effectiveWidthRem > 0 && columnLayout.requiredWidthRem > effectiveWidthRem + 0.25}><DndContext id={`journal-lines-${storageKey}`} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}><SortableContext items={dragIds} strategy={verticalListSortingStrategy}><Table role="grid" data-auto-hidden={columnLayout.hiddenColumnIds.join(",")} data-compact-accounts={compactAccounts || undefined} className="w-full table-fixed"><colgroup>{visibleColumns.map((column) => <col key={column.id} style={{ width: `${colWidthsRem[column.id]}rem` }} />)}</colgroup><TableHeader className="grid-column-header"><TableRow>{visibleColumns.map((column) => <TableHead key={column.id} data-pin-right={column.id === "actions" || undefined} title={compactAccounts && ["counterAccount", "debitAccount", "creditAccount"].includes(column.id) ? "Název účtu je dostupný v buňce" : undefined} className={cn("relative", column.id === "row" && "journal-row-cell", column.align === "right" && "text-right", column.id === "actions" && "grid-actions-header sticky right-0 z-20 bg-muted")}><span>{column.label}</span>{column.id !== "row" && column.id !== "actions" ? <ColumnResizeHandle onResize={(width) => columns.setWidth(column.id, Math.round(width / zoom))} onReset={() => columns.clearWidth(column.id)} /> : null}</TableHead>)}</TableRow></TableHeader><TableBody>{displayedLines.length === 0 ? <TableRow><TableCell colSpan={span} className="py-8 text-center text-muted-foreground">{t.empty}</TableCell></TableRow> : displayedLines.flatMap((line, rowIndex) => { const pinned = Boolean(line.isRounding || line.isFxRounding); return [<SortableRow key={line.id} id={line.id} disabled={!canReorder || pinned}>{(handle, style, setNodeRef) => <TableRow ref={setNodeRef} style={style} data-grid-row data-rounding={line.isRounding ? "" : undefined} data-fx-rounding={line.isFxRounding ? "" : undefined} className={cn("group/row", pinned && "bg-muted/40 text-muted-foreground")}>{visibleColumns.map((column) => { if (column.id === "row") return <TableCell key="row" className="journal-row-cell text-muted-foreground"><div className="flex items-center justify-start gap-[0.25em]">{pinned ? <Tooltip><TooltipTrigger asChild><span><Pin className="size-[1em]" /></span></TooltipTrigger><TooltipContent>{line.isFxRounding ? t.fxRoundingHint : rounding?.label ?? t.rounding}</TooltipContent></Tooltip> : handle}<span className="min-w-[3ch] text-right tabular-nums">{pinned ? "" : rowIndex + 1}</span>{!pinned ? <button type="button" aria-label={expanded[line.id] ? t.hideDetail : t.showDetail} onClick={() => setExpanded((state) => ({ ...state, [line.id]: !state[line.id] }))}>{expanded[line.id] ? <ChevronDown className="size-[0.95em]" /> : <ChevronRight className="size-[0.95em]" />}</button> : null}</div></TableCell>; if (column.id === "actions") return <TableCell key="actions" data-pin-right className="grid-actions-cell sticky right-0 z-10 bg-card text-right group-hover/row:bg-muted/50">{line.isFxRounding ? null : line.isRounding ? rounding?.onChange && !rounding.readOnly ? <GridAction tone="destructive" aria-label={t.removeLine} onClick={() => remove(line)}><Trash2 /></GridAction> : null : editable.size ? <GridActions>{vatOn && !vatReadOnly && line.vatManual ? <GridAction aria-label={t.resetVat} onClick={() => patchVat(line, { vatManual: false, vatAmount: undefined })}><RotateCcw /></GridAction> : null}<GridAction aria-label={t.duplicateLine} onClick={() => duplicate(line)}><Copy /></GridAction><GridAction tone="destructive" aria-label={t.removeLine} onClick={() => remove(line)}><Trash2 /></GridAction></GridActions> : null}</TableCell>; if (column.id === "homeAmount") return <TableCell key="homeAmount" className="amount-cell text-right tabular-nums">{displayValue(line, "homeAmount")}</TableCell>; const id = column.id as JournalLineColumn; return <TableCell key={id} className={cn(["amount", "quantity", "unitPrice", "vatRate", "vatAmount", "grossAmount"].includes(id) && "amount-cell text-right tabular-nums")}>{id === "text" && pinned ? (line.isFxRounding ? (line.isVatPreview ? t.fxRoundingPreview : t.fxRounding) : rounding?.label ?? t.rounding) : renderCell(line, rowIndex, id)}</TableCell>; })}</TableRow>}</SortableRow>, ...(!pinned && expanded[line.id] ? [<TableRow key={`${line.id}-detail`}><TableCell colSpan={span} className="p-0">{renderDetail(line)}</TableCell></TableRow>] : [])]; })}</TableBody><TableFooter><TableRow>{visibleColumns.map((column) => <TableCell key={column.id} data-slot={column.id === "amount" ? "journal-lines-total-base" : column.id === "homeAmount" ? "journal-lines-total-base-home" : column.id === "vatAmount" ? "journal-lines-total-vat" : column.id === "grossAmount" ? "journal-lines-total-gross" : undefined} data-pin-right={column.id === "actions" || undefined} className={cn(column.id === "row" && "journal-row-cell", column.align === "right" && "text-right", column.id === "actions" && "grid-actions-footer sticky right-0 z-10 bg-muted")}>{column.id === "row" ? t.total : column.id === "amount" ? formatAmount(vatOn ? documentBaseTotal : foreign ? documentLinesTotal : total, 2) : column.id === "homeAmount" ? formatAmount(vatOn ? baseTotal : total, 2) : column.id === "vatAmount" ? formatAmount(documentVatTotal, 2) : column.id === "grossAmount" ? formatAmount(documentGrossTotal, 2) : null}</TableCell>)}</TableRow></TableFooter></Table></SortableContext></DndContext></ZoomGrid>
    <JournalLinesRecap lines={vatOn ? [...gridSource.filter((line) => !line.isVatLine && !(line.isFxRounding && line.isVatPreview)), ...taxLines.map((line) => line.isFxRounding ? { ...line, text: t.fxRoundingPreview } : line)] : lines} vatSummary={vatOn ? vatSummary : undefined} accounts={accounts} dimensions={dimensions} documentCurrency={documentCurrency} documentCurrencySymbol={documentCurrencySymbol} homeCurrency={homeCurrency} homeCurrencySymbol={homeCurrencySymbol} open={recap.open} onOpenChange={recap.onOpenChange} tab={recap.tab} onTabChange={recap.onTabChange} recapTabs={recapTabs} zoom={zoom} texts={{ rounding: t.rounding, fxRounding: t.fxRounding, total: t.total }} />
  </div></GridZoomContext.Provider>;
});
