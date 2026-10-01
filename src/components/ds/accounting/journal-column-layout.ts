/**
 * Rozložení sloupců editoru řádků podle šířky panelu.
 * Vlastní: výchozí šířky, kaskádu skrývání sloupců, auto zoom (nejvýš na 0,75) a šířky <col>.
 * Nesmí: měřit DOM ani držet stav – měření dělá useJournalLayout.
 */
import { calculateAutoGridZoom } from "../grid/grid-auto-zoom";
import type { ColumnId, JournalAccountColumnId } from "./journal-lines-model";

/** Režim editoru: interní doklad (MD i DAL) nebo kniha s hlavním účtem (jen protiúčet). */
export type JournalLinesMode = "internal" | "mainAccount";

/** Výchozí šířky sloupců v rem při zoomu 100 %. */
export const JOURNAL_COLUMN_WIDTHS: Record<ColumnId, number> = {
  row: 4.25,
  text: 15,
  quantity: 7,
  unitId: 5,
  unitPrice: 8,
  amount: 11,
  homeAmount: 10,
  counterAccount: 6,
  counterAccountName: 13,
  debitAccount: 6,
  debitAccountName: 13,
  creditAccount: 6,
  creditAccountName: 13,
  dimensionId: 11,
  vs: 8,
  partnerId: 13,
  debitDimensionId: 11,
  creditDimensionId: 11,
  debitVs: 8,
  creditVs: 8,
  debitPartnerId: 13,
  creditPartnerId: 13,
  nonTax: 7,
  currency: 6,
  foreignAmount: 10,
  rate: 8,
  actions: 5,
  vatCodeId: 7,
  vatRate: 5,
  vatAmount: 9,
  grossAmount: 10,
  vatDeduction: 0,
  vatDeductionShare: 0,
  pdpSubjectCode: 0,
};
const TEXT_MIN_WIDTH_REM = 12;
const TEXT_SHRUNK_MIN_WIDTH_REM = 6;
/** Šířka zkrácené rozšířené formy účtu (jen číslo). */
export const COMPACT_ACCOUNT_WIDTH_REM = 6;
const QUANTITY_COLUMNS = new Set<ColumnId>(["quantity", "unitId", "unitPrice"]);

/** Opraví i staré výchozí nastavení a uložené pohledy tak, aby každá strana měla alespoň jednu formu účtu. */
export function normalizeJournalAccountVisibility<T extends Record<string, boolean>>(
  visible: T,
  mode: JournalLinesMode,
): T {
  const next: Record<string, boolean> = { ...visible };
  const pairs: [JournalAccountColumnId, JournalAccountColumnId][] =
    mode === "mainAccount"
      ? [["counterAccount", "counterAccountName"]]
      : [
          ["debitAccount", "debitAccountName"],
          ["creditAccount", "creditAccountName"],
        ];
  for (const [shortId, nameId] of pairs) if (!next[shortId] && !next[nameId]) next[shortId] = true;
  return next as T;
}

/** Vstup kaskády sloupců. */
export type JournalColumnLayoutInput = {
  availableWidthRem: number;
  mode: JournalLinesMode;
  visibleColumnIds: ColumnId[];
  widths?: Partial<Record<ColumnId, number>>;
  protectedColumnIds?: ColumnId[];
  sharedSideFields?: boolean;
  /** Zoom gridu – šířky sloupců v rem se jím násobí. Výchozí 1. */
  zoom?: number;
};

/** Výsledek kaskády sloupců. */
export type JournalColumnLayout = {
  hiddenColumnIds: ColumnId[];
  /** True, pokud se zkrátila alespoň jedna rozšířená forma účtu. */
  compactAccounts: boolean;
  /** Rozšířené formy účtu zobrazené zkráceně (jen strany bez viditelné krátké formy). */
  compactAccountIds: ColumnId[];
  /** Potřebná šířka v rem po započtení zoomu (porovnatelná s availableWidthRem). */
  requiredWidthRem: number;
  /** Minimální šířka sloupce Text (rem před zoomem); zužuje se jako poslední krok. */
  textMinRem: number;
  /** False, pokud se ruční šířky kvůli místu dočasně nepoužily. */
  customWidthsApplied: boolean;
};

/** Přesune méně důležité sloupce do detailu podle jejich skutečné potřebné šířky. */
export function resolveJournalColumnLayout({
  availableWidthRem: availableRaw,
  mode,
  visibleColumnIds,
  widths = {},
  protectedColumnIds = [],
  sharedSideFields = false,
  zoom = 1,
}: JournalColumnLayoutInput): JournalColumnLayout {
  // Šířky sloupců jsou v rem násobených zoomem gridu – porovnáváme v jednotkách před zoomem.
  const scale = zoom > 0 ? zoom : 1;
  const availableWidthRem = availableRaw / scale;
  let textMin = TEXT_MIN_WIDTH_REM;
  let useCustomWidths = true;
  const hidden = new Set<ColumnId>();
  const protectedIds = new Set(protectedColumnIds);
  const compact = new Set<ColumnId>();
  const sideColumns: ColumnId[] =
    mode === "mainAccount"
      ? ["dimensionId"]
      : sharedSideFields
        ? ["partnerId", "vs", "dimensionId"]
        : ["debitDimensionId", "creditDimensionId"];
  const widthFor = (id: ColumnId) => {
    if (id === "text") return textMin;
    if (compact.has(id)) return COMPACT_ACCOUNT_WIDTH_REM;
    return (useCustomWidths ? widths[id] : undefined) ?? JOURNAL_COLUMN_WIDTHS[id];
  };
  const required = () =>
    visibleColumnIds.reduce((sum, id) => sum + (hidden.has(id) ? 0 : widthFor(id)), 0);
  const hideGroup = (ids: readonly ColumnId[]) => {
    if (required() <= availableWidthRem) return;
    ids.forEach((id) => {
      if (visibleColumnIds.includes(id) && !protectedIds.has(id)) hidden.add(id);
    });
  };

  hideGroup([...QUANTITY_COLUMNS]);
  hideGroup(["vatRate", "grossAmount"]);
  // Účty po stranách: má-li strana viditelnou krátkou formu, rozšířená se přesune do detailu
  // (jinak by vznikly dva sloupce „MD“); bez krátké formy se rozšířená jen zkrátí na číslo.
  const accountPairs: [ColumnId, ColumnId][] =
    mode === "mainAccount"
      ? [["counterAccount", "counterAccountName"]]
      : [
          ["debitAccount", "debitAccountName"],
          ["creditAccount", "creditAccountName"],
        ];
  for (const [shortId, nameId] of accountPairs) {
    if (required() <= availableWidthRem || !visibleColumnIds.includes(nameId) || hidden.has(nameId))
      continue;
    if (visibleColumnIds.includes(shortId) && !hidden.has(shortId)) hidden.add(nameId);
    else compact.add(nameId);
  }
  hideGroup(sideColumns);
  // Ručně rozšířené sloupce se při nedostatku místa vrátí na výchozí šířku.
  if (required() > availableWidthRem) useCustomWidths = false;
  // Poslední krok: zúžit Text (obsah se zkrátí se třemi tečkami a celý je v tooltipu).
  if (required() > availableWidthRem && visibleColumnIds.includes("text")) {
    textMin = Math.max(
      TEXT_SHRUNK_MIN_WIDTH_REM,
      TEXT_MIN_WIDTH_REM - (required() - availableWidthRem),
    );
  }

  return {
    hiddenColumnIds: [...hidden],
    compactAccounts: compact.size > 0,
    compactAccountIds: [...compact],
    requiredWidthRem: required() * scale,
    textMinRem: textMin,
    customWidthsApplied: useCustomWidths,
  };
}

/**
 * Pořadí výpočtu: základní auto zoom podle šířky panelu → kaskáda sloupců → po jejím
 * vyčerpání zmenšení gridu nejvýš na 75 % se započtením zoomu aplikace → rolování.
 * `availableWidthRem` je vnitřní clientWidth gridu v px / 16; jeden pixel zůstává jako rezerva zaokrouhlení.
 */
export function resolveJournalZoomLayout(
  input: Omit<JournalColumnLayoutInput, "zoom"> & { manualZoom?: number | null; appZoom?: number },
) {
  const { manualZoom = null, appZoom: rawAppZoom = 1, ...layoutInput } = input;
  const appZoom = rawAppZoom > 0 ? rawAppZoom : 1;
  const full = resolveJournalColumnLayout({
    ...layoutInput,
    availableWidthRem: Number.MAX_SAFE_INTEGER,
    zoom: 1,
  });
  const reservedAvailable = Math.max(0, layoutInput.availableWidthRem - 1 / 16);
  const widthZoom = calculateAutoGridZoom(reservedAvailable, full.requiredWidthRem) ?? 1;
  const cascadeZoom = manualZoom ?? widthZoom;
  const cascadeLayout = resolveJournalColumnLayout({
    ...layoutInput,
    availableWidthRem: reservedAvailable,
    zoom: cascadeZoom * appZoom,
  });
  const cascadeBaseWidth = cascadeLayout.requiredWidthRem / (cascadeZoom * appZoom);
  const fitZoom =
    manualZoom == null
      ? (calculateAutoGridZoom(reservedAvailable, cascadeBaseWidth, appZoom) ?? widthZoom)
      : manualZoom;
  const autoZoom = Math.min(widthZoom, fitZoom);
  const zoom = manualZoom ?? autoZoom;
  const requiredWidthRem = cascadeBaseWidth * zoom * appZoom;
  const layout = { ...cascadeLayout, requiredWidthRem };
  return {
    autoZoom,
    zoom,
    fullRequiredWidthRem: full.requiredWidthRem,
    layout,
    scroll: layoutInput.availableWidthRem > 0 && requiredWidthRem > reservedAvailable,
  };
}

/** Vstup výpočtu šířek `<col>` v rem. */
export interface JournalColumnWidthsInput {
  /** Viditelné sloupce v pořadí zobrazení. */
  columnIds: ColumnId[];
  /** Uložené šířky v px při zoomu 100 %. */
  savedWidths: Partial<Record<string, number>>;
  /** Zkrácené rozšířené formy účtu. */
  compactAccountIds: ReadonlySet<ColumnId>;
  /** Výsledek kaskády. */
  layout: Pick<JournalColumnLayout, "customWidthsApplied" | "textMinRem">;
  /** Efektivní zoom gridu. */
  zoom: number;
  /** Vnitřní šířka gridu v rem. */
  effectiveWidthRem: number;
}

/**
 * Šířky sloupců v rem včetně zoomu. Uložené šířky jsou v px při zoomu 100 % (úchyt ukládá šířku ÷ zoom),
 * proto se zoom násobí jen jednou. Text dostane explicitní zbytek šířky, nejméně textMinRem –
 * minWidth na <col> prohlížeče ignorují, s table-fixed platí jen width.
 */
export function journalColumnWidthsRem(input: JournalColumnWidthsInput) {
  const { zoom, layout } = input;
  const result: Record<string, number> = {};
  let fixed = 0;
  for (const id of input.columnIds) {
    if (id === "text") continue;
    const savedWidth = input.savedWidths[id];
    const base = input.compactAccountIds.has(id)
      ? COMPACT_ACCOUNT_WIDTH_REM
      : typeof savedWidth === "number" && layout.customWidthsApplied
        ? savedWidth / 16
        : JOURNAL_COLUMN_WIDTHS[id];
    result[id] = base * zoom;
    fixed += base * zoom;
  }
  result.text = Math.max(layout.textMinRem * zoom, input.effectiveWidthRem - fixed - 0.25);
  return result;
}
