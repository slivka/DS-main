import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

/** Typ dat při přetahování záhlaví sloupce (změna pořadí). */
const COLUMN_MIME = "application/x-grid-column";
import {
  Table,
  TableBody,
  TableFooter,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { GridSearch } from "./grid-search";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";

import { GridPagination, useGridPagination } from "./grid-pagination";
import { SortHead, useGridSort, useSortedRows } from "./grid-sort";
import { GridBody, GridErrorRow } from "./grid-states";
import { GridExport, type GridExportData, type GridExtraExport } from "./grid-export";
import { gridPrintParams, type GridPrintParam } from "./grid-print";
import type { PrintContext } from "../print/report-pdf";
import { GridZoomContext, ZoomControl, ZoomGrid, useGridZoom, useWheelZoom } from "./grid-zoom";
import { usePageLayoutVariant } from "../layout/page-layout";
import { useGridColumns } from "./grid-columns";
import { ColumnResizeHandle } from "./grid-column-resize";
import { ColumnPicker } from "./column-picker";
import { GridFilterPanel, GridFilterToggle } from "./grid-filters";
import { ColumnFilter } from "./ColumnFilter";
import {
  GroupBar,
  GroupControl,
  GroupHeaderRow,
  detectDateColumns,
  groupDragProps,
  useGridGrouping,
  useGroupedRows,
} from "./grid-grouping";
import { insertGroupTotalRows, isInteractiveTarget, resolveSelectedRows, toggleVisibleSelection } from "./grid-selection";
import { GridTitleBar } from "./grid-title";
import { GridAction, GridActions } from "./grid-action";
import { Pencil, Trash2 } from "lucide-react";
import { GridSelectionToggle } from "./grid-selection-toggle";
import { GridRefreshButton } from "./grid-refresh";
import { ViewModeToggle, type GridViewMode } from "./view-mode-toggle";
import { FilterChips } from "./filter-chips";
import { GridMoreMenu, type GridMoreItem } from "./grid-more-menu";
import {
  AsOfDateToggle,
  GridAddActions, GridToolbarCollapsible,
  GridExpandControls,
  GridToolbar,
  GridToolbarSeparator,
  type AsOfDateConfig,
  type GridAddAction,
} from "./grid-toolbar";
import { fmtAmount } from "../../../lib/format";
import {
  formatUserDate,
  formatUserDateTime,
  useDateTimePreferences,
} from "../../../lib/date-time-preferences";
import { IcoLink } from "../form/ico-link";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { resolveGridTexts, type GridTexts } from "./grid-texts";
import type { ExcelColumnType, ExcelExportMeta } from "../../../lib/excel-export";
import { createGridBookColumn, GridContextBar, GRID_BOOK_COLUMN_ID, placeGridBookColumnFirst, type GridBookConfig, type GridPeriodConfig } from "./grid-context-bar";
import { gridPeriodLabel } from "./grid-period";
import { cn } from "../../../lib/utils";

/** Sloupec pobočky řídí explicitně branchVisibility; zobrazuje se jen v režimu „Všechny pobočky“, vždy jako první. */
const isBranchColumn = (c: { branchVisibility?: "auto" | "always" }) =>
  c.branchVisibility !== undefined;

/** Pevná minimální šířka sloupce pobočky — kódy poboček jsou krátké, proto zabírá co nejméně místa. */
const BRANCH_COLUMN_WIDTH = 78;

/** Sloupce připnuté vlevo – vždy na prvním místě, minimální šířka s místem pro filtr. */
const PINNED_COLUMN_IDS = new Set(["status", "is_active", "is_system", "source"]);
const PINNED_COLUMN_WIDTH = 84;
export const isPinnedColumn = (id: string) => PINNED_COLUMN_IDS.has(id);
const pinnedColumnWidth = (id: string) => (id === "is_system" ? 118 : PINNED_COLUMN_WIDTH);

/**
 * Účetní identifikátory a krátké systémové hodnoty mají v gridu vždy jen
 * šířku nutnou pro záhlaví, filtr a nejdelší zobrazenou hodnotu.
 */
const COMPACT_COLUMN_IDS = new Set([
  "status",
  "state",
  "documentstatus",
  "date",
  "documentdate",
  "document",
  "documentnumber",
  "number",
  "variabilesymbol",
  "variablesymbol",
  "symbol",
  "vs",
  "md",
  "dal",
  "debit",
  "credit",
  "debitaccount",
  "creditaccount",
]);

const compactColumnKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLocaleLowerCase("cs");

const isCompactColumn = <Row,>(column: DataGridColumn<Row>) =>
  column.fitContent === true ||
  column.exportType === "date" ||
  column.exportType === "datetime" ||
  COMPACT_COLUMN_IDS.has(compactColumnKey(column.id)) ||
  COMPACT_COLUMN_IDS.has(compactColumnKey(column.label));

export type DataGridColumn<Row> = {
  /** Jednoznačný klíč sloupce. */
  id: string;
  label: string;
  align?: "left" | "right" | "center" | undefined;
  /** Hodnota použitá pro hledání, radene aj export. */
  value?: ((row: Row) => string | number | null | undefined) | undefined;
  /** Oddějená hodnota použitá pouze pro řazení, například neformátované číslo účtu. */
  sortValue?: ((row: Row) => string | number | null | undefined) | undefined;
  /** Vlastní vykreslení buňky. */
  render?: ((row: Row) => ReactNode) | undefined;
  /** Editor buňky (např. GridAmountEditor) – jen u vybraných řádků v režimu výběru; jinak render / value. */
  editor?: ((row: Row) => ReactNode) | undefined;
  /** Číselný sloupec – zarovnání vpravo a oddělování tisícov. */
  numeric?: boolean | undefined;
  decimals?: number | undefined;
  /** Explicitní datový typ pro Excel export; bez hodnoty se použije numeric/text. */
  exportType?: ExcelColumnType | undefined;
  /** Vestavěné zobrazení hodnoty; `ico` přidá ověřený odkaz do českého registru. */
  format?: "ico" | undefined;
  /**
   * Součtový riadok: „sum" (predvojené pri číselných sloupcích), „avg", „count",
   * „sumSelected" (jen vybrané řádky; v exportu bez součtu),
   * "none" pro vypnutí alebo vlastní funkcia nad filtrovanými řádky.
   */
  total?: "sum" | "sumSelected" | "avg" | "count" | "none" | ((rows: Row[]) => ReactNode) | undefined;
  /** Vypnúť radene sloupce. */
  sortable?: boolean | undefined;
  /** Sloupec sa nedá skryť. */
  locked?: boolean | undefined;
  /** Ve výchozím stavu skrytý sloupec. */
  defaultVisible?: boolean | undefined;
  /** Pevná šířka sloupce v px – použije se ako minimum i maximum. */
  width?: number | undefined;
  /** Minimální šířka podle obsahu (nezalamovat, sloupec sa zúží na nejmenší možnou šířku). */
  fitContent?: boolean | undefined;
  /** Ukotvit sloupec k pravému okraju pri horizontálnom posouvání. */
  pinRight?: boolean | undefined;
  /** Sekcia sloupce (spojené záhlavie, napr. „Zmluva“). */
  section?: string | undefined;
  /** Sloupec pobočky: „auto" skryje pri jednej pobočke, „always" zobrazí vždy. */
  branchVisibility?: "auto" | "always" | undefined;
  className?: string | undefined;
  /** Vlastný filter v záhlaví sloupce (nahrádza automatický autofilter). */
  filter?: ReactNode | undefined;
  /** Příznak aktivního vlastního filtra (pro indikaci a tlačítko Vymazat filtry). */
  filterActive?: boolean | undefined;
  /** Text vlastního filtru pro přehled aktivních filtrování. */
  filterLabel?: string | undefined;
  /**
   * Více hodnot řádku pre autofilter (napr. složený riadok skupiny, ktorý
   * zastupuje i skryté pohyby). Ponuka aj porovnane použije tieto hodnoty.
   */
  filterValues?: ((row: Row) => string[]) | undefined;
  /** Interní systémový sloupec se neukládá do nastavení. */
  transient?: boolean | undefined;
};

export type DataGridFilterChip = { id: string; label: string; onRemove?: () => void };

export type DataGridProps<Row> = {
  /** Klíč pro uložení nastavení gridu v prohlížeči. */
  storageKey: string;
  /** Svislá výška gridu; v PageLayout list je výchozí fill, jinak auto. */
  height?: "fill" | "auto";
  /** Nadpis gridu (může být ReactNode s vlastní hlavičkou). Když chybí, hlavička se nezobrazí. */
  title?: ReactNode;
  /** Zobrazí nadpis nad lištou. Výchozí je false; title se dál používá pro export. */
  showTitle?: boolean;
  /** Skryje ozdobný pruh pred nadpisom (napr. pri vlastnej hlavičke s mesiacom). */
  hideTitleMark?: boolean;
  /** Textový nadpis použitý v exportech (PDF/Excel). Ak ne je zadaný, použije se string hodnota title. */
  exportTitle?: string;
  rows: Row[];
  columns: DataGridColumn<Row>[];
  rowKey: (row: Row) => string;
  loading?: boolean | undefined;
  error?: unknown;
  onRetry?: (() => void) | undefined;
  /** Ruční obnovení dat; po dobu Promise se tlačítko samo deaktivuje. */
  onRefresh?: (() => void | Promise<unknown>) | undefined;
  /** Řízený stav probíhajícího obnovení. */
  refreshing?: boolean | undefined;
  onRowClick?: ((row: Row) => void) | undefined;
  /** Hlavné akcie vpravo v lište (napr. „Přidat záznam“). */
  actions?: ReactNode | undefined;
  /** Vlastní ovládací prvky vlevo v lište (přepínače, datum a pod.). */
  toolbarLeft?: ReactNode | undefined;
  /** Účetní období v kontextovém řádku nad akcemi. */
  period?: GridPeriodConfig | undefined;
  /** Kniha v kontextovém řádku; při hodnotě all se zobrazí první systémový sloupec Kniha. */
  book?: GridBookConfig<Row> | undefined;
  /** Volitelný obsah vpravo v kontextovém řádku. */
  contextRight?: ReactNode | undefined;
  /** Obsah rozbalitelného panelu filtrov. */
  filters?: ReactNode | undefined;
  /** Otevře panel filtrů při prvním zobrazení. */
  defaultFiltersOpen?: boolean | undefined;
  /** Popisy aktívnych filtrov pre tooltip a chipy. */
  filterChips?: DataGridFilterChip[] | undefined;
  onClearFilters?: (() => void) | undefined;
  /** Popisy filtrů aktivních ve výchozím stavu. */
  defaultFilters?: string[] | undefined;
  /** Přepínač tabulkového a stromového zobrazení. */
  viewMode?: GridViewMode | undefined;
  onViewModeChange?: ((mode: GridViewMode) => void) | undefined;
  /** Společný klíč zoomu pro tabulkové a stromové zobrazení stejného obsahu. */
  viewZoomKey?: string | undefined;
  /** Volitelný režim „Stav k datu“. */
  asOf?: AsOfDateConfig | undefined;
  /** Primární akce vždy vlevo na začátku lišty. */
  addAction?: GridAddAction | GridAddAction[] | undefined;
  /** Vedlejší akce v nabídce ⋯. */
  moreActions?: GridMoreItem[] | undefined;
  /** Vlastní PDF sestava místo standardního PDF gridu. */
  pdfExport?: (() => Promise<void>) | undefined;
  /** Kontext firemní tiskové sestavy; bez něj se v menu Stáhnout nezobrazí „Tisk (PDF)…“. */
  printContext?: PrintContext | undefined;
  /** Nadpis tiskové sestavy (výchozí titulek exportu). */
  printTitle?: string | undefined;
  /** Další parametry záhlaví; připojí se za automatické z kontextového řádku. */
  printParams?: GridPrintParam[] | undefined;
  /** Další položky ve společné nabídce exportu. */
  extraExports?: GridExtraExport[] | undefined;
  emptyTitle?: string | undefined;
  emptyDescription?: string | undefined;
  emptyActionLabel?: string | undefined;
  onEmptyAction?: (() => void) | undefined;
  /** Název súboru exportu (bez prípony). */
  exportName?: string | undefined;
  /** Volitelné údaje v hlavičce Excel sestavy. */
  exportMeta?: ExcelExportMeta | undefined;
  defaultSort?: string | undefined;
  /** Úprava řádku – ikona v ukotveném sloupci akcií vpravo. */
  onEditRow?: ((row: Row) => void) | undefined;
  /** Odstranění řádku – ikona v ukotveném sloupci akcií vpravo. */
  onDeleteRow?: ((row: Row) => void) | undefined;
  /** Text potvrdenia pred odstránením řádku. */
  deleteConfirm?: ((row: Row) => string) | undefined;
  /** Ďalšie akcie řádku (pred úpravou a odstránením). */
  rowActions?: ((row: Row) => ReactNode) | undefined;
  /** Popis sloupce akcií v hlavičke (ve výchozím stavu bez textu). */
  actionsLabel?: string | undefined;
  /** Skryje filtre priamo v záhlaviach sloupců. */
  columnFilters?: boolean | undefined;
  /** Povolí seskupování řádků podle sloupců. */
  groupable?: boolean | undefined;
  /** Výchozí sloupec seskupení, pokud uživatel nemá uložené vlastní nastavení. */
  defaultGroupBy?: string | undefined;
  /** Skryje spodnú lištu so stránkovaním. */
  paginated?: boolean | undefined;
  /** Zjednodušený vzhled bez modrého akcentu vlevo a so zaobleným vrchom – pro vnořené gridy bez nadpisu. */
  plain?: boolean | undefined;
  /** Skryje ovládaciu lištu pri gridoch vložených priamo do rozbajeného řádku. */
  hideToolbar?: boolean | undefined;
  /** Skryje predvojené tlačidlá Upravit / Odstranit. Dvojklik na řádku stále funguje, ak je onEditRow. */
  hideDefaultActions?: boolean | undefined;
  /** Povojení úpravy pro konkrétní řádek (ikona se jinak nezobrazí). */
  canEditRow?: ((row: Row) => boolean) | undefined;
  /** Důvod zakázané úpravy; akce zůstane viditelná a zešedne. */
  editDisabledReason?: ((row: Row) => string | undefined) | undefined;
  /** Povojení odstranění pro konkrétní řádek (ikona se jinak nezobrazí). */
  canDeleteRow?: ((row: Row) => boolean) | undefined;
  /** Důvod zakázaného odstranění; akce zůstane viditelná a zešedne. */
  deleteDisabledReason?: ((row: Row) => string | undefined) | undefined;
  /** Povolí režim hromadného výběru řádků (tlačítko v liště gridu). */
  selectable?: boolean | undefined;
  /** Hromadné akce v liště – dostanou vybrané řádky a funkci pro zrušení výběru. */
  selectionActions?: ((rows: Row[], clear: () => void) => ReactNode) | undefined;
  /** Řízený režim výběru pro více vnořených gridů s jednou společnou lištou. */
  selectMode?: boolean | undefined;
  /** Oznámi nadradenému stromu vybrané řádky. */
  onSelectedRowsChange?: ((rows: Row[]) => void) | undefined;
  /** Řízený výběr – klíče vybraných řádků; grid výběr jen zobrazuje a změny hlásí přes onSelectedKeysChange. */
  selectedKeys?: string[] | undefined;
  /** Změna výběru (řízený i neřízený režim). */
  onSelectedKeysChange?: ((keys: string[]) => void) | undefined;
  /** Obsah pruhu pod tabulkou v režimu výběru – dostane vybrané řádky z celé množiny `rows`. */
  selectionSummary?: ((rows: Row[]) => ReactNode) | undefined;
  /** Součty skupiny: „header“ v záhlaví skupiny (výchozí), „row“ jako řádek pod sloupci za skupinou. */
  groupTotals?: "header" | "row" | undefined;
  /** Skryje místní tlačítko, pokud výběr ovládá nadřazená lišta. */
  hideSelectionToggle?: boolean | undefined;
  /** Obsah bočného panelu patriaceho ku gridu. */
  sidePanel?: ReactNode | undefined;
  /** Klíč řádku, ke kterému je otevřený boční panel. */
  activeRowKey?: string | null | undefined;
  /** Zobrazí spodný súčtový riadok (ve výchozím stavu true). */
  showTotalRow?: boolean | undefined;
  /** Oznámi zmenu sloupcůých filtrov (id sloupce → vybrané hodnoty). */
  onColumnFiltersChange?: ((filters: Record<string, string[]>) => void) | undefined;
  /** Změna textového hledání (např. pro rozpad seskupených řádků). */
  onSearchChange?: ((search: string) => void) | undefined;
  /** Dodatočná CSS trieda pre vonkajší obal gridu. */
  className?: string | undefined;
  /** Přepis výchozích českých textů, například pro slovenskou verzi aplikace. */
  texts?: Partial<GridTexts>;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
const DATE_FILTER_PREFIX = "__date:";

type DateFilterParts = { year: number; month: number };

const dateFilterParts = (value: unknown): DateFilterParts | null => {
  if (typeof value !== "string") return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]) };
  const local = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(value.trim());
  if (!local) return null;
  return { year: Number(local[3]), month: Number(local[2]) };
};

const dateFilterKeys = (parts: DateFilterParts) => {
  const month = String(parts.month).padStart(2, "0");
  const quarter = Math.ceil(parts.month / 3);
  return [
    `${DATE_FILTER_PREFIX}year:${parts.year}`,
    `${DATE_FILTER_PREFIX}quarter:${parts.year}-Q${quarter}`,
    `${DATE_FILTER_PREFIX}month:${parts.year}-${month}`,
  ];
};

/** Textová podoba buňky – datumy vždy podle centrálního nastavenia firmy. */
const cellText = (v: unknown) => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return formatUserDateTime(v);
  if (typeof v === "string") {
    if (ISO_DATE.test(v)) return formatUserDate(v);
    if (ISO_DATE_TIME.test(v)) return formatUserDateTime(v);
  }
  return String(v);
};

/**
 * Sdílený grid celej aplikácie – jednotná hlavička a lišta nástrojov
 * (hledání, filtry, export, výběr sloupců, seskupování, zoom a hustota),
 * řazení, stránkování a jednotné prázdné i chybové stavy.
 */
export function DataGrid<Row>({
  storageKey,
  height,
  title,
  showTitle = false,
  hideTitleMark,
  exportTitle,
  rows,
  columns,
  rowKey,
  loading,
  error,
  onRetry,
  onRefresh,
  refreshing,
  onRowClick,
  actions,
  toolbarLeft,
  period,
  book,
  contextRight,
  filters,
  defaultFiltersOpen = false,
  filterChips = [],
  onClearFilters,
  defaultFilters = [],
  viewMode,
  onViewModeChange,
  viewZoomKey,
  asOf,
  addAction,
  moreActions = [],
  pdfExport,
  extraExports = [],
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  exportName,
  printContext,
  printTitle,
  printParams,
  exportMeta,
  defaultSort,
  onEditRow,
  onDeleteRow,
  deleteConfirm,
  rowActions,
  actionsLabel,
  columnFilters = true,
  groupable = true,
  defaultGroupBy,
  paginated = true,
  hideDefaultActions,
  canEditRow,
  editDisabledReason,
  canDeleteRow,
  deleteDisabledReason,
  selectable,
  selectionActions,
  selectMode: controlledSelectMode,
  onSelectedRowsChange,
  selectedKeys: controlledSelectedKeys,
  onSelectedKeysChange,
  selectionSummary,
  groupTotals = "header",
  hideSelectionToggle,
  sidePanel,
  activeRowKey,
  plain,
  hideToolbar,
  showTotalRow = true,
  onColumnFiltersChange,
  onSearchChange,
  className,
  texts: textOverrides,
}: DataGridProps<Row>) {
  const pageVariant = usePageLayoutVariant();
  const resolvedHeight = height ?? (pageVariant === "list" ? "fill" : "auto");
  const texts = useMemo(() => resolveGridTexts(textOverrides), [textOverrides]);
  const { confirm, confirmDialog } = useConfirmDialog();
  const [ownSelectMode, setOwnSelectMode] = useState(false);
  const selectMode = controlledSelectMode ?? ownSelectMode;
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const hasRowActions =
    Boolean(
      (onEditRow && !hideDefaultActions) ||
        (onDeleteRow && !hideDefaultActions) ||
        rowActions,
    ) && !selectMode;
  useDateTimePreferences();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(defaultFiltersOpen);
  const [groupExpandDepth, setGroupExpandDepth] = useState<number | null>(null);
  const zoomKey = viewZoomKey ?? (viewMode ? `view:${exportName ?? exportTitle ?? title ?? storageKey}` : storageKey);
  const { zoom, setZoom, density, setDensity } = useGridZoom(zoomKey);
  const blockRef = useRef<HTMLDivElement>(null);
  useWheelZoom(blockRef, setZoom, zoom);

  const allBranches = true;
  const effectiveColumns = useMemo<DataGridColumn<Row>[]>(() => book?.value === "all" && book.getRowBookId ? [createGridBookColumn(book), ...columns] : columns, [book, columns]);

  const colDefs = useMemo(
    () =>
      effectiveColumns
        // Sloupec pobočky se při výběru jedné pobočky automaticky skryje.
        .filter((c) => allBranches || !isBranchColumn(c) || c.branchVisibility === "always")
        .map((c) => ({
          id: c.id,
          label: c.label,
          // Sloupec akcií sa nikdy nesmie dať skryť; sloupec pobočky riadi přepínač pobočiek.
          locked:
            isPinnedColumn(c.id) || c.id === "actions" || c.label === "Akcie" || isBranchColumn(c)
              ? true
              : c.locked,
          ...(c.defaultVisible !== undefined ? { defaultVisible: c.defaultVisible } : {}),
          ...(c.section !== undefined ? { section: c.section } : {}),
          ...(c.branchVisibility !== undefined ? { branchVisibility: c.branchVisibility } : {}),
          ...(c.transient !== undefined ? { transient: c.transient } : {}),
          align: (c.align ?? (c.numeric ? "right" : "left")) as "left" | "right" | "center",
        })),
    [effectiveColumns, allBranches],
  );

  const cols = useGridColumns(storageKey, colDefs);
  const defaultGroups = useMemo(
    () => (defaultGroupBy ? [{ id: defaultGroupBy, granularity: "month" as const }] : []),
    [defaultGroupBy],
  );
  const grouping = useGridGrouping(storageKey, { disabled: !groupable, defaultGroups });

  // Při výběru jedné pobočky nemá seskupení podle pobočky význam – odstraníme ho.
  const branchColIds = useMemo(
    () => effectiveColumns.filter(isBranchColumn).map((c) => c.id),
    [effectiveColumns],
  );
  useEffect(() => {
    if (allBranches) return;
    const present = grouping.groups.find((g) => branchColIds.includes(g.id));
    if (present) grouping.remove(present.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBranches, branchColIds, grouping.groups]);


  const byId = useMemo(() => new Map(effectiveColumns.map((c) => [c.id, c])), [effectiveColumns]);
  /** Sloupce v uloženém pořadí a jen viditelné. */
  const shown = useMemo(() => {
    const list = cols.columns
      .filter((c) => cols.visible[c.id] || isBranchColumn(c))
      .map((c) => byId.get(c.id)!);
    // Sloupec pobočky je při „Všechny pobočky“ vždy viditelný a úplně vlevo.
    const books = list.filter((c) => c.id === GRID_BOOK_COLUMN_ID);
    const branch = list.filter((c) => isBranchColumn(c));
    const rest = list.filter((c) => !isBranchColumn(c) && c.id !== GRID_BOOK_COLUMN_ID);
    // Připnuté sloupce držíme hned za sloupcem pobočky.
    const pinned = rest.filter((c) => isPinnedColumn(c.id));
    const middle = rest.filter((c) => !isPinnedColumn(c.id) && !c.pinRight);
    const pinnedRight = rest.filter((c) => !isPinnedColumn(c.id) && c.pinRight);
    return placeGridBookColumnFirst([...books, ...branch, ...pinned, ...middle, ...pinnedRight]);
  }, [cols.columns, cols.visible, byId]);

  const sort = useGridSort<string>(storageKey, defaultSort ?? effectiveColumns[0]?.id ?? null);

  const valueOf = (row: Row, id: string) => {
    const col = byId.get(id);
    if (!col) return null;
    return col.sortValue ? col.sortValue(row) : col.value ? col.value(row) : null;
  };

  useEffect(() => {
    onSearchChange?.(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);


  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      effectiveColumns.some((c) => {
        // Skupinový riadok zastupuje aj svoje skryté položky.
        const many = c.filterValues?.(row);
        if (many && many.length) return many.some((v) => String(v).toLowerCase().includes(q));
        return cellText(c.value?.(row)).toLowerCase().includes(q);
      }),
    );
  }, [rows, effectiveColumns, search]);

  // --- filtre jednotlivých sloupců (autofilter v záhlaví) -----------------
  const [colFilters, setColFilters] = useState<Record<string, string[]>>({});
  const setColFilter = (id: string, next: Set<string>) =>
    setColFilters((cur) => {
      const copy = { ...cur };
      if (next.size === 0) delete copy[id];
      else copy[id] = [...next];
      return copy;
    });
  useEffect(() => {
    onColumnFiltersChange?.(colFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colFilters]);
  const textOf = (row: Row, id: string) => {
    const c = byId.get(id);
    const v = c?.value?.(row);
    return c?.numeric && typeof v === "number" ? fmtAmount(v, c.decimals ?? 0) : cellText(v);
  };
  /** Všechny hodnoty řádku ve sloupci (skupinový řádek může zastupovat více hodnot). */
  const valuesOf = (row: Row, id: string) => {
    const c = byId.get(id);
    const many = c?.filterValues?.(row);
    return many && many.length ? many : [textOf(row, id)];
  };
  const filterKeysOf = (row: Row, id: string) => {
    const column = byId.get(id);
    const values = valuesOf(row, id);
    if (column?.exportType !== "date" && column?.exportType !== "datetime") return values;
    return values.flatMap((value) => {
      const parts = dateFilterParts(value);
      return parts ? [value, ...dateFilterKeys(parts)] : [value];
    });
  };
  /** Riadky prefiltrované všetkými sloupcůými filtrami okrem zadaného. */
  const rowsExcept = (skipId: string | null) => {
    const entries = Object.entries(colFilters).filter(([id]) => id !== skipId);
    if (!entries.length) return searched;
    return searched.filter((row) =>
      entries.every(([id, vals]) => filterKeysOf(row, id).some((v) => vals.includes(v))),
    );
  };
  const filtered = useMemo(
    () => rowsExcept(null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, colFilters],
  );
  const columnFilterCount = Object.keys(colFilters).length;

  const sorted = useSortedRows(filtered, sort, valueOf);
  const pagination = useGridPagination(storageKey, sorted, { defaultPageSize: 50 });
  /** Bez stránkování zobrazujeme (a seskupujeme) všechny filtrované řádky. */
  const pageRows = paginated ? pagination.rows : sorted;

  // --- hromadný výběr řádků ----------------------------------------------
  const keySet = useMemo(
    () => (controlledSelectedKeys ? new Set(controlledSelectedKeys) : selectedKeys),
    [controlledSelectedKeys, selectedKeys],
  );
  const selectedRows = useMemo(
    () => resolveSelectedRows(rows, keySet, rowKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, keySet],
  );
  const selectedRowsChangeRef = useRef(onSelectedRowsChange);
  selectedRowsChangeRef.current = onSelectedRowsChange;
  useEffect(() => selectedRowsChangeRef.current?.(selectedRows), [selectedRows]);
  const updateSelection = (next: Set<string>) => {
    if (!controlledSelectedKeys) setSelectedKeys(next);
    onSelectedKeysChange?.([...next]);
  };
  useEffect(() => {
    if (!selectMode && !controlledSelectedKeys) setSelectedKeys(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectMode]);
  const clearSelection = () => updateSelection(new Set());
  const toggleRowKey = (key: string) => {
    const next = new Set(keySet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateSelection(next);
  };
  const visibleKeys = sorted.map((r) => rowKey(r));
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => keySet.has(key));
  const toggleAll = () => updateSelection(toggleVisibleSelection(keySet, visibleKeys));
  const exitSelectMode = () => {
    setOwnSelectMode(false);
    clearSelection();
  };
  const selectColSpan = selectMode ? 1 : 0;

  const groupColumns = useMemo(() => shown.map((c) => ({ id: c.id, label: c.label })), [shown]);
  const dateColumns = useMemo(
    () => detectDateColumns(pageRows, groupColumns, valueOf),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageRows, groupColumns],
  );
  const grouped = useGroupedRows(pageRows, grouping, groupColumns, valueOf);
  const displayItems = useMemo(
    () => (groupTotals === "row" && grouping.active ? insertGroupTotalRows(grouped) : grouped),
    [grouped, groupTotals, grouping.active],
  );
  const groupKeys = grouped.flatMap((item) => item.type === "group" ? [item.key] : []);
  const exportGrouped = useGroupedRows(
    sorted,
    { ...grouping, collapsed: [] },
    groupColumns,
    valueOf,
  );

  const printGrouped = useGroupedRows(sorted, grouping, groupColumns, valueOf);
  const exportData = (forPrint = false): GridExportData => {
    const hasSections = shown.some((column) => column.section);
    const exportItems = grouping.active
      ? (forPrint ? printGrouped : exportGrouped)
      : sorted.map((row) => ({ type: "row" as const, row }));
    return {
      columns: shown.map((column) => column.label),
      ...(hasSections
        ? { headerRows: [shown.map((column) => column.section ?? ""), shown.map((column) => column.label)] }
        : {}),
      rows: exportItems.map((item) => {
        if (item.type === "group") {
          return shown.map((column, index) => index === 0 ? `${item.column}: ${item.label}` : forPrint ? (item.sums.find((sum) => sum.id === column.id)?.total ?? null) : null);
        }
        return shown.map((column) => {
          const value = column.value?.(item.row) ?? null;
          if (typeof value === "number") return value;
          return value === null || value === undefined ? "" : String(value);
        });
      }),
      ...(grouping.active
        ? {
            rowLevels: exportItems.map((item) =>
              item.type === "group" ? item.level : grouping.groups.length,
            ),
          }
        : {}),
      columnMeta: shown.map((column) => {
        const type = column.exportType ?? (column.numeric ? "number" : "text");
        const total = column.total ?? (column.numeric ? "sum" : "none");
        return {
          type,
          align: column.align ?? (column.numeric ? "right" : "left"),
          total: total === "sum" || total === "count" ? total : "none",
        };
      }),
    };
  };

  /** Ponuka hodnot pre autofilter v záhlaví každého sloupce. */
  const filterOptions = useMemo(() => {
    const map = new Map<string, { value: string; label: string; section?: string }[]>();
    for (const c of shown) {
      const values = new Set<string>();
      for (const row of rowsExcept(c.id)) for (const v of valuesOf(row, c.id)) values.add(v);
      const isDate = c.exportType === "date" || c.exportType === "datetime";
      const dateParts = isDate
        ? [...values].map((value) => dateFilterParts(value)).filter((part): part is DateFilterParts => part !== null)
        : [];
      const years = [...new Set(dateParts.map((part) => part.year))].sort((a, b) => b - a);
      const quarters = [...new Set(dateParts.map((part) => `${part.year}-Q${Math.ceil(part.month / 3)}`))]
        .sort((a, b) => b.localeCompare(a, texts.locale));
      const months = [...new Set(dateParts.map((part) => `${part.year}-${String(part.month).padStart(2, "0")}`))]
        .sort((a, b) => b.localeCompare(a, texts.locale));
      const groupedOptions = isDate
        ? [
            ...years.map((year) => ({
              value: `${DATE_FILTER_PREFIX}year:${year}`,
              label: String(year),
              section: texts.dateFilterYears,
            })),
            ...quarters.map((key) => {
              const [year, quarter] = key.split("-Q").map(Number);
              return {
                value: `${DATE_FILTER_PREFIX}quarter:${key}`,
                label: texts.dateFilterQuarter(quarter ?? 1, year ?? 0),
                section: texts.dateFilterQuarters,
              };
            }),
            ...months.map((key) => {
              const [year, month] = key.split("-").map(Number);
              return {
                value: `${DATE_FILTER_PREFIX}month:${key}`,
                label: new Intl.DateTimeFormat(texts.locale, { month: "long", year: "numeric" }).format(
                  new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, 1)),
                ),
                section: texts.dateFilterMonths,
              };
            }),
          ]
        : [];
      map.set(
        c.id,
        [
          ...groupedOptions,
          ...[...values]
            .sort((a, b) => a.localeCompare(b, texts.locale))
            .map((v) => ({
              value: v,
              label: v === "" ? texts.emptyValue : v,
              ...(isDate ? { section: texts.dateFilterDates } : {}),
            })),
        ],
      );
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, searched, colFilters]);

  const columnFilterLabels = Object.entries(colFilters).map(([id, vals]) => {
    const options = filterOptions.get(id) ?? [];
    const labels = vals.map((value) => options.find((option) => option.value === value)?.label ?? value);
    return `${byId.get(id)?.label ?? id}: ${labels.join(", ")}`;
  });
  const activeFilterLabels = [
    ...filterChips.map((c) => c.label),
    ...columnFilterLabels,
    ...shown.filter((c) => c.filterActive && c.filterLabel).map((c) => c.filterLabel!),
  ];
  const exportFilterLabels = [
    ...(exportMeta?.filters ?? []),
    ...(period ? [gridPeriodLabel(period.value)] : []),
    ...(search.trim() ? [`Hledání: ${search.trim()}`] : []),
    ...activeFilterLabels,
  ];
  const printConfig = printContext ? {
    context: printContext,
    title: printTitle ?? exportTitle ?? (typeof title === "string" && title ? title : exportName ?? storageKey),
    params: gridPrintParams({ book, period: period?.value, search, filters: [...(exportMeta?.filters ?? []), ...activeFilterLabels], asOf: asOf ? { enabled: asOf.enabled, value: asOf.value } : undefined, extra: printParams }),
  } : undefined;
  const clearAll = () => {
    setSearch("");
    setColFilters({});
    onClearFilters?.();
  };

  // --- presun sloupců myšou v záhlaví ------------------------------------
  const dragId = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const sideOf = (e: React.DragEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return e.clientX > rect.left + rect.width / 2;
  };
  const headerDragProps = (id: string) => {
    const group = groupDragProps(id, grouping.enabled) as {
      onDragStart?: (e: React.DragEvent<HTMLElement>) => void;
    };
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent<HTMLElement>) => {
        group.onDragStart?.(e);
        dragId.current = id;
        e.dataTransfer.setData(COLUMN_MIME, id);
        e.dataTransfer.effectAllowed = "copyMove";
      },
      onDragEnd: () => {
        dragId.current = null;
        setDropTarget(null);
      },
      onDragOver: (e: React.DragEvent<HTMLElement>) => {
        if (!dragId.current || dragId.current === id) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        const after = sideOf(e);
        setDropTarget((cur) => (cur && cur.id === id && cur.after === after ? cur : { id, after }));
      },
      onDragLeave: () => setDropTarget((cur) => (cur?.id === id ? null : cur)),
      onDrop: (e: React.DragEvent<HTMLElement>) => {
        const dragged = dragId.current;
        if (!dragged) return;
        e.preventDefault();
        e.stopPropagation();
        cols.reorder(dragged, id, sideOf(e) ? "after" : "before");
        dragId.current = null;
        setDropTarget(null);
      },
    };
  };
  const dropClass = (id: string) =>
    dropTarget?.id === id
      ? dropTarget.after
        ? "border-r-2 border-r-primary"
        : "border-l-2 border-l-primary"
      : "";

  // --- ukotvený riadok so súčtami ----------------------------------------
  /** Součty počítáme ze všech filtrovaných řádků, nejen z aktuální strany. */
  const totalCells = useMemo(
    () =>
      shown.map((c) => {
        const mode = c.total ?? (c.numeric ? "sum" : "none");
        if (mode === "none") return null;
        if (typeof mode === "function") return mode(sorted);
        if (mode === "count") return fmtAmount(sorted.length, 0);
        const nums: number[] = [];
        // „sumSelected“ sčítá vybrané řádky včetně těch skrytých filtrem.
        for (const row of mode === "sumSelected" ? selectedRows : sorted) {
          const v = c.value?.(row);
          if (typeof v === "number" && Number.isFinite(v)) nums.push(v);
        }
        if (!nums.length) return mode === "sumSelected" ? fmtAmount(0, c.decimals ?? 2) : null;
        const sum = nums.reduce((a, b) => a + b, 0);
        const value = mode === "avg" ? sum / nums.length : sum;
        return fmtAmount(value, c.decimals ?? 2);

      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shown, sorted, selectedRows],
  );
  const hasTotals = totalCells.some((v) => v !== null && v !== undefined && v !== "");
  /** První sloupec bez součtu – sem umístíme popis „Celkem“. */
  const totalLabelIndex = totalCells.findIndex((v) => v === null);
  /** První textový sloupec – popisek „Celkem {skupina}“ v řádku součtů skupiny. */
  const groupTotalLabelIndex = Math.max(0, shown.findIndex((c) => !c.numeric && (c.total ?? "none") === "none"));

  return (
    <GridZoomContext.Provider value={{ zoom, setZoom, density }}>
      <div ref={blockRef} data-slot="data-grid" data-grid-height={resolvedHeight} className={cn("@container flex w-full min-w-0 flex-col", resolvedHeight === "fill" && "min-h-0 flex-1", plain ? "max-w-full overflow-hidden" : "grid-connected-block overflow-hidden rounded-lg border shadow-panel")}>
        {showTitle && title ? (
          <GridTitleBar title={title} zoom={zoom} hideMark={hideTitleMark} />
        ) : null}
        {period || book || contextRight ? <GridContextBar period={period} book={book} contextRight={contextRight} zoom={zoom} density={density} className={cn("border-t-0", !showTitle || !title ? "rounded-t-lg" : "rounded-t-none")} /> : null}
        {!hideToolbar ? <GridToolbar
          zoom={zoom}
          density={density}
          className={`border-b-0 ${
            showTitle && title || period || book || contextRight
              ? plain
                ? "rounded-t-lg shadow-none"
                : "rounded-t-none border-t-0 shadow-none"
              : plain
                ? "rounded-t-lg shadow-none"
                : "rounded-t-lg shadow-panel"
          }`}
          left={<>
            {addAction ? <GridAddActions actions={addAction} /> : null}
            <GridToolbarCollapsible>
            {addAction && (viewMode || grouping.active || asOf || toolbarLeft) ? <GridToolbarSeparator density={density} /> : null}
            {viewMode && onViewModeChange ? <ViewModeToggle mode={viewMode} onChange={onViewModeChange} texts={texts} /> : null}
            {grouping.active ? (
              <GridExpandControls
                levels={[
                  ...grouping.groups.map((group, index) => ({ id: group.id, label: `Úroveň ${index + 1} – ${groupColumns.find((column) => column.id === group.id)?.label ?? group.id}`, depth: index + 1 })),
                  ...(grouping.groups.length > 1 ? [{ id: "all", label: "Vše", depth: grouping.groups.length + 1 }] : []),
                ]}
                activeDepth={groupExpandDepth}
                disabled={Boolean(search)}
                onExpand={(depth) => {
                  setGroupExpandDepth(depth);
                  if (depth > grouping.groups.length) grouping.expandAll();
                  else grouping.collapseAll(grouped.flatMap((item) => item.type === "group" && item.level >= depth ? [item.key] : []));
                }}
                onCollapse={() => {
                  setGroupExpandDepth(0);
                  grouping.collapseAll(groupKeys);
                }}
              />
            ) : null}
            {(asOf || toolbarLeft) ? <span className="grid-toolbar-optional contents"><span className="hidden @min-[640px]:contents">{grouping.active ? <GridToolbarSeparator density={density} /> : null}</span>{asOf ? <AsOfDateToggle {...asOf} /> : null}{asOf && toolbarLeft ? <GridToolbarSeparator density={density} /> : null}{toolbarLeft}</span> : null}
          </GridToolbarCollapsible>
          </>}
          right={<>
             <span data-toolbar-measure="find" data-toolbar-group="find" className="flex shrink-0 items-center gap-2"><GridSearch value={search} onChange={setSearch} zoom={zoom} texts={texts} />
            {filters ? (
              <GridFilterToggle
                open={filtersOpen}
                onOpenChange={setFiltersOpen}
                {...(onClearFilters ? { onClear: onClearFilters } : {})}
                activeCount={filterChips.length + columnFilterCount}
                activeFilters={activeFilterLabels}
                defaultFilters={defaultFilters}
                zoom={zoom}
                texts={texts}
              />
            ) : null}</span>

            <div className="grid-toolbar-wide hidden @min-[640px]:contents">
               <span data-toolbar-measure="display" data-toolbar-group="display" className="grid-toolbar-display-group inline-flex shrink-0 items-center gap-2"><GridToolbarSeparator density={density} />
              {groupable ? <GroupControl grouping={grouping} texts={texts} /> : null}
              <ColumnPicker columns={cols.columns.filter((c) => !c.transient).map((c) => ({ id: c.id, label: c.label, ...(c.locked !== undefined ? { locked: c.locked } : {}), ...(isPinnedColumn(c.id) ? { pinned: true } : {}), ...(c.section !== undefined ? { section: c.section } : {}) }))} visible={cols.columnVisible} onToggle={cols.toggle} onReorder={cols.reorder} onReset={cols.reset} onSaveDefault={cols.saveDefault} onClearDefault={cols.clearDefault} hasCustomDefault={cols.hasCustomDefault} hiddenSections={cols.hiddenSections} onToggleSection={cols.toggleSection} views={cols.views} zoom={zoom} title={texts.columnsTitle} texts={texts} />
              <ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} texts={texts} /></span>
               <span data-toolbar-measure="data" data-toolbar-group="data" className="grid-toolbar-data-group inline-flex shrink-0 items-center gap-2"><GridToolbarSeparator density={density} />
              {selectable && !hideSelectionToggle ? <GridSelectionToggle active={selectMode} count={selectedRows.length} zoom={zoom} texts={texts} onToggle={(next) => next ? setOwnSelectMode(true) : exitSelectMode()} /> : null}
              {actions}
              <GridExport getData={() => exportData()} getPrintData={() => exportData(true)} print={printConfig} fijename={exportName ?? storageKey} title={exportTitle ?? (typeof title === "string" ? title : "")} zoom={zoom} texts={texts} meta={{ ...exportMeta, ...(exportFilterLabels.length ? { filters: exportFilterLabels } : {}) }} pdfExport={pdfExport} extraExports={extraExports} />
              </span>
            </div>
             <span data-toolbar-measure="menu" data-toolbar-group="menu" className="contents"><GridMoreMenu responsiveOverflow items={moreActions} zoom={zoom} texts={texts} compact={<>{viewMode && onViewModeChange ? <ViewModeToggle mode={viewMode} onChange={onViewModeChange} texts={texts} /> : null}{grouping.active ? <GridExpandControls levels={grouping.groups.map((group, index) => ({ id: group.id, label: `Úroveň ${index + 1}`, depth: index + 1 }))} activeDepth={groupExpandDepth} disabled={Boolean(search)} onExpand={(depth) => { setGroupExpandDepth(depth); if (depth > grouping.groups.length) grouping.expandAll(); }} onCollapse={() => { setGroupExpandDepth(0); grouping.collapseAll(groupKeys); }} /> : null}{asOf ? <AsOfDateToggle {...asOf} /> : null}{toolbarLeft}</>} tools={<>{groupable ? <GroupControl grouping={grouping} texts={texts} /> : null}<ColumnPicker columns={cols.columns.filter((c) => !c.transient).map((c) => ({ id: c.id, label: c.label, ...(c.locked !== undefined ? { locked: c.locked } : {}), ...(isPinnedColumn(c.id) ? { pinned: true } : {}), ...(c.section !== undefined ? { section: c.section } : {}) }))} visible={cols.columnVisible} onToggle={cols.toggle} onReorder={cols.reorder} onReset={cols.reset} zoom={zoom} title={texts.columnsTitle} texts={texts} /><ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} texts={texts} /></>} secondary={<>{selectable && !hideSelectionToggle ? <GridSelectionToggle active={selectMode} count={selectedRows.length} zoom={zoom} texts={texts} onToggle={(next) => next ? setOwnSelectMode(true) : exitSelectMode()} /> : null}{actions}<GridExport getData={() => exportData()} getPrintData={() => exportData(true)} print={printConfig} fijename={exportName ?? storageKey} title={exportTitle ?? (typeof title === "string" ? title : "")} zoom={zoom} texts={texts} meta={{ ...exportMeta, ...(exportFilterLabels.length ? { filters: exportFilterLabels } : {}) }} pdfExport={pdfExport} extraExports={extraExports} /></>} className="grid-toolbar-overflow-menu" /></span>
             {onRefresh ? <span data-toolbar-measure="refresh" data-toolbar-group="refresh" className="grid-toolbar-refresh-group inline-flex shrink-0 items-center gap-2"><GridToolbarSeparator density={density} /><GridRefreshButton onRefresh={onRefresh} refreshing={refreshing} zoom={zoom} texts={texts} /></span> : null}
          </>}
        /> : null}

        {filters ? <GridFilterPanel open={filtersOpen} zoom={zoom} density={density}>{filters}</GridFilterPanel> : null}
        {!filtersOpen && filterChips.length ? (
          <div className="border border-t-0 bg-card px-2 py-1.5">
            <FilterChips chips={filterChips} onClearAll={onClearFilters} size="sm" />
          </div>
        ) : null}

        {selectMode ? (
          <div className="flex flex-wrap items-center gap-2 border border-t-0 border-l-4 border-l-primary bg-secondary/50 px-2 py-1.5 text-sm">
            <span className="text-muted-foreground">
              {texts.selectedRecords(fmtAmount(selectedRows.length, 0))}
            </span>
            <div className="ml-auto flex items-center gap-2">
              {selectionActions?.(selectedRows, clearSelection)}
            </div>
          </div>
        ) : null}

        {groupable ? (
          <GroupBar
            grouping={grouping}
            columns={groupColumns}
            dateColumns={dateColumns}
            zoom={zoom}
            texts={texts}
          />
        ) : null}

        <div className="flex min-h-0 w-full min-w-0 max-w-full items-stretch">
          <ZoomGrid
            zoom={zoom}
            setZoom={setZoom}
            density={density}
            height={resolvedHeight}
              className={`grid-table-surface min-w-0 max-w-full flex-1 ${hideToolbar ? "rounded-none border-t-0 !shadow-none" : "rounded-t-none border-t-0"} ${plain ? "rounded-b-lg !shadow-none" : paginated ? "rounded-b-none! border-b-0" : "rounded-b-none!"} ${className ?? ""}`}
            {...(loading !== undefined ? { loading } : {})}
          >
            <Table className="w-full">
              <colgroup>
                {selectMode ? <col style={{ width: "40px" }} /> : null}
                {shown.map((c) => {
                  const compact = isCompactColumn(c);
                  const w = isBranchColumn(c)
                    ? BRANCH_COLUMN_WIDTH
                    : compact
                      ? 1
                    : isPinnedColumn(c.id)
                      ? pinnedColumnWidth(c.id)
                      : (cols.widths[c.id] ?? c.width);
                   return compact ? (
                    <col key={c.id} style={{ width: "1px", whiteSpace: "nowrap" }} />
                  ) : (
                    <col key={c.id} {...(w ? { style: { width: `${w}px` } } : {})} />
                  );
                })}
                {hasRowActions ? <col style={{ width: "auto", whiteSpace: "nowrap" }} /> : null}
              </colgroup>
              <TableHeader className={`grid-column-header sticky top-0 z-10 ${plain ? "[&_th]:border-t-0" : ""}`}>
                {cols.groups.some((g) => g.section) && (
                  <TableRow>
                    {selectMode ? <TableHead className="w-10" /> : null}
                    {cols.groups.map((g, i) => (
                      <TableHead
                        key={`${g.section}-${i}`}
                        colSpan={g.span}
                        className="border-l text-center font-semibold text-muted-foreground first:border-l-0"
                      >
                        {g.section}
                      </TableHead>
                    ))}
                    {hasRowActions ? (
                      <TableHead className="grid-actions-header sticky right-0 z-20 w-px border-l px-px py-0" />
                    ) : null}
                  </TableRow>
                )}
                <TableRow>
                  {selectMode ? (
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => toggleAll()}
                        aria-label={texts.selectAllRows}
                      />
                    </TableHead>
                  ) : null}
                  {shown.map((c) => {
                    const isPinned = isPinnedColumn(c.id);
                    const isBook = c.id === GRID_BOOK_COLUMN_ID;
                    const isBranch = isBranchColumn(c);
                    const compact = isCompactColumn(c);
                    const width = isBranch
                      ? BRANCH_COLUMN_WIDTH
                      : compact
                        ? 1
                      : isPinned
                        ? pinnedColumnWidth(c.id)
                        : (cols.widths[c.id] ?? c.width);
                    const headStyle = compact
                      ? { width: "1px", whiteSpace: "nowrap" as const }
                      : width
                        ? {
                            width: `${width}px`,
                            maxWidth: `${width}px`,
                            minWidth: `${width}px`,
                            boxSizing: "border-box" as const,
                          }
                        : undefined;
                    const resize =
                      isPinned || isBranch || isBook || compact ? null : (
                        <ColumnResizeHandle
                          onResize={(w) => cols.setWidth(c.id, w)}
                          onReset={() => cols.clearWidth(c.id)}
                        />
                      );
                    const headClass = `relative ${isPinned ? (c.align === "left" ? "" : "text-center") : c.align === "center" ? "text-center" : "cursor-grab"} select-none ${dropClass(c.id)} ${c.className ?? ""}`;
                    const filter = c.filter ?? (
                      <ColumnFilter
                        options={filterOptions.get(c.id) ?? []}
                        selected={new Set(colFilters[c.id] ?? [])}
                        onChange={(next) => setColFilter(c.id, next)}
                        label={c.label}
                        texts={texts}
                      />
                    );
                    return c.sortable === false ? (
                      <TableHead
                        key={c.id}
                        data-pin-right={c.pinRight || undefined}
                        className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right" : c.align === "center" ? "text-center" : ""} ${headClass}`}
                        {...(headStyle ? { style: headStyle } : {})}
                          {...(isPinned || isBook ? {} : headerDragProps(c.id))}
                      >
                        <span
                          className={
                            c.align === "right" || (c.numeric && !c.align)
                              ? "flex w-full items-center justify-end"
                              : c.align === "center"
                                ? "flex w-full items-center justify-center"
                                : "inline-flex items-center gap-1"
                          }
                        >
                          {c.label}
                          {columnFilters ? filter : null}
                        </span>
                        {resize}
                      </TableHead>
                    ) : (
                      <SortHead
                        key={c.id}
                        id={c.id}
                        label={c.label}
                        sort={sort}
                        align={c.align ?? (c.numeric ? "right" : "left")}
                        className={headClass}
                        pinRight={c.pinRight}
                        {...(headStyle ? { style: headStyle } : {})}
                        dragProps={isPinned ? {} : headerDragProps(c.id)}
                        texts={texts}
                      >
                        {columnFilters ? filter : null}
                        {resize}
                      </SortHead>
                    );
                  })}
                  {hasRowActions ? (
                    <TableHead
                      className="grid-actions-header sticky right-0 z-20 w-px whitespace-nowrap border-l px-2 py-0 text-center"
                      aria-label={actionsLabel ?? texts.actions}
                      title={actionsLabel ?? texts.actions}
                    >{actionsLabel ?? texts.actions}</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {error ? (
                  <GridErrorRow
                    colSpan={shown.length + (hasRowActions ? 1 : 0) + selectColSpan}
                    error={error}
                    onRetry={onRetry}
                    texts={texts}
                  />
                ) : (
                  <GridBody
                    loading={loading}
                    empty={sorted.length === 0}
                    cols={shown.length + (hasRowActions ? 1 : 0) + selectColSpan}
                    title={search ? texts.searchEmptyTitle : (emptyTitle ?? texts.emptyTitle)}
                    description={search ? undefined : emptyDescription}
                    filtered={Boolean(search) || filterChips.length > 0 || columnFilterCount > 0}
                    onClearFilter={clearAll}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                    texts={texts}
                  >
                    {displayItems.map((item, i) =>
                      item.type === "groupTotal" ? (
                        <TableRow key={`gt-${item.key}-${i}`} data-slot="grid-group-total" className="bg-muted/30 font-semibold hover:bg-muted/30">
                          {selectMode ? <TableCell /> : null}
                          {shown.map((c, index) => {
                            const mode = c.total ?? (c.numeric ? "sum" : "none");
                            const sum = mode === "sum" ? item.sums.find((s) => s.id === c.id) : undefined;
                            return (
                              <TableCell key={c.id} className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right num" : c.align === "center" ? "text-center" : "text-left"} whitespace-nowrap ${cols.sectionSeparators.has(c.id) ? "border-l" : ""}`}>
                                {sum ? fmtAmount(sum.total, c.decimals ?? 2) : index === groupTotalLabelIndex ? texts.groupTotal(item.label) : null}
                              </TableCell>
                            );
                          })}
                          {hasRowActions ? <TableCell className="sticky right-0 z-[1] border-l bg-card" /> : null}
                        </TableRow>
                      ) : item.type === "group" ? (
                        <GroupHeaderRow
                          key={`g-${item.key}-${i}`}
                          item={groupTotals === "row" ? { ...item, sums: [] } : item}
                          colSpan={shown.length + (hasRowActions ? 1 : 0) + selectColSpan}
                          onToggle={grouping.toggleKey}
                        />
                      ) : (
                        <TableRow
                          key={rowKey(item.row)}
                          onDoubleClick={
                            !selectMode && (onEditRow || onRowClick)
                              ? () => {
                                   if (onEditRow && !editDisabledReason?.(item.row) && (canEditRow?.(item.row) ?? true))
                                    onEditRow(item.row);
                                  else onRowClick?.(item.row);
                                }
                              : undefined
                          }
                          onClick={
                            selectMode
                              ? (event) => {
                                  if (isInteractiveTarget(event.target as HTMLElement, event.currentTarget)) return;
                                  toggleRowKey(rowKey(item.row));
                                }
                              : onRowClick
                                ? () => onRowClick(item.row)
                                : undefined
                          }
                          data-state={
                            selectMode && keySet.has(rowKey(item.row))
                              ? "selected"
                              : undefined
                          }
                          aria-current={activeRowKey === rowKey(item.row) ? "true" : undefined}
                          className={`group/row ${onEditRow || onRowClick || selectMode ? "cursor-pointer" : ""} ${
                            activeRowKey === rowKey(item.row)
                              ? "border-l-2 border-l-primary/60 bg-primary/[0.04] [&>td]:bg-primary/[0.02]"
                              : ""
                          }`}
                        >
                          {selectMode ? (
                            <TableCell className="text-center">
                              <Checkbox
                                checked={keySet.has(rowKey(item.row))}
                                onCheckedChange={() => toggleRowKey(rowKey(item.row))}
                                onClick={(e) => e.stopPropagation()}
                                aria-label={texts.selectRow}
                              />
                            </TableCell>
                          ) : null}
                          {shown.map((c) => {
                            const v = c.value?.(item.row);
                            const compact = isCompactColumn(c);
                            const cellStyle = compact
                              ? { whiteSpace: "nowrap" as const }
                              : c.width
                                ? {
                                    width: `${c.width}px`,
                                    maxWidth: `${c.width}px`,
                                    minWidth: `${c.width}px`,
                                    boxSizing: "border-box" as const,
                                  }
                                : undefined;
                            return (
                              <TableCell
                                key={c.id}
                                data-pin-right={c.pinRight || undefined}
                                className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right num" : c.align === "center" ? "text-center" : "text-left"} [&:has([data-slot=badge])]:text-left ${
                                  isPinnedColumn(c.id)
                                    ? c.align === "left"
                                      ? "text-left"
                                      : "text-center"
                                    : ""
                                } ${cols.sectionSeparators.has(c.id) ? "border-l" : ""} ${c.className ?? ""}`}
                                {...(cellStyle ? { style: cellStyle } : {})}
                              >
                                {selectMode && c.editor && keySet.has(rowKey(item.row)) ? (
                                  c.editor(item.row)
                                ) : c.render ? (
                                  c.render(item.row)
                                ) : (c.format === "ico" || c.id === "ico") &&
                                  v !== null &&
                                  v !== undefined &&
                                  cellText(v).trim() !== "" ? (
                                  <IcoLink value={cellText(v)} />
                                ) : c.numeric && typeof v === "number" ? (
                                  fmtAmount(v, c.decimals ?? 0)
                                ) : (
                                  cellText(v)
                                )}
                              </TableCell>
                            );
                          })}
                          {hasRowActions ? (
                            <TableCell className="sticky right-0 z-[1] !min-w-0 whitespace-nowrap border-l bg-card px-0.5 py-0">
                              <GridActions>
                                {rowActions?.(item.row)}
                                {!hideDefaultActions && onEditRow && ((canEditRow?.(item.row) ?? true) || editDisabledReason?.(item.row)) ? (
                                  <GridAction
                                    title={texts.edit}
                                    aria-label={texts.edit}
                                    disabled={Boolean(editDisabledReason?.(item.row))}
                                    disabledReason={editDisabledReason?.(item.row)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditRow(item.row);
                                    }}
                                  >
                                    <Pencil className="size-3.5" />
                                  </GridAction>
                                ) : null}
                                {!hideDefaultActions && onDeleteRow && ((canDeleteRow?.(item.row) ?? true) || deleteDisabledReason?.(item.row)) ? (
                                  <GridAction
                                    tone="destructive"
                                    title={texts.remove}
                                    aria-label={texts.remove}
                                    disabled={Boolean(deleteDisabledReason?.(item.row))}
                                    disabledReason={deleteDisabledReason?.(item.row)}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const msg =
                                        deleteConfirm?.(item.row) ??
                                        texts.removeConfirm;
                                      confirm({
                                        title: msg,
                                        confirmLabel: texts.remove,
                                        destructive: true,
                                        onConfirm: () => onDeleteRow(item.row),
                                      });
                                    }}
                                  >
                                    <Trash2 className="size-3.5" />
                                  </GridAction>
                                ) : null}
                              </GridActions>
                            </TableCell>
                          ) : null}
                        </TableRow>
                      ),
                    )}
                  </GridBody>
                )}
              </TableBody>
              {showTotalRow && hasTotals && !error && sorted.length > 0 ? (
                <TableFooter className="sticky bottom-0 z-10 font-semibold backdrop-blur">
                  <TableRow className="hover:bg-transparent">
                    {selectMode ? <TableCell /> : null}
                    {shown.map((c, i) => (
                      <TableCell
                        key={c.id}
                        data-pin-right={c.pinRight || undefined}
                        className={`${c.align === "right" || (c.numeric && !c.align) ? "text-right num" : c.align === "center" ? "text-center" : ""} ${
                          cols.sectionSeparators.has(c.id) ? "border-l" : ""
                        } ${c.className ?? ""}`}
                      >
                        {totalCells[i] ??
                          (i === totalLabelIndex ? (
                            <span className="text-muted-foreground">
                               {texts.total}
                            </span>
                          ) : null)}
                      </TableCell>
                    ))}
                    {hasRowActions ? (
                      <TableCell className="grid-actions-footer sticky right-0 z-[9] !min-w-0 whitespace-nowrap border-l px-0.5 py-2" />
                    ) : null}
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          </ZoomGrid>
          {sidePanel ? (
            <aside
              data-grid-side-panel
              className="w-[24rem] shrink-0 overflow-y-auto border border-l-0 border-t-0 bg-card p-4"
              aria-label={texts.sidePanelLabel}
            >
              {sidePanel}
            </aside>
          ) : null}
        </div>

        {selectMode && selectionSummary ? (
          <div data-slot="grid-selection-summary" className="flex flex-wrap items-center gap-2 border border-t-0 bg-secondary/50 px-2 py-1.5 text-sm">
            {selectionSummary(selectedRows)}
          </div>
        ) : null}

        {paginated ? (
          <GridPagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            pageSize={pagination.pageSize}
            total={pagination.total}
            setPage={pagination.setPage}
            setPageSize={pagination.setPageSize}
            zoom={zoom}
            texts={texts}
          />
        ) : null}
        {confirmDialog}
      </div>
    </GridZoomContext.Provider>
  );
}
