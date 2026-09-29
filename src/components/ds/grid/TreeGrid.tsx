import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Checkbox } from "../../ui/checkbox";
import { GridSearch } from "./grid-search";
import { GridExport, type GridExtraExport } from "./grid-export";
import { gridPrintParams, type GridPrintParam } from "./grid-print";
import type { PrintContext } from "../print/report-pdf";
import { ColumnPicker } from "./column-picker";
import { useDsTexts } from "../../../ds-texts";
import { useGridColumns } from "./grid-columns";
import { ZoomControl, ZoomGrid, useGridZoom, useWheelZoom } from "./grid-zoom";
import { GridRefreshButton } from "./grid-refresh";
import { GridSelectionToggle } from "./grid-selection-toggle";
import { GridFilterPanel, GridFilterToggle } from "./grid-filters";
import { FilterChips, type FilterChip } from "./filter-chips";
import { ViewModeToggle, type GridViewMode } from "./view-mode-toggle";
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
import { useResolvedGridTexts, type GridTexts } from "./grid-texts";
import { amountClass, formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { usePageLayoutVariant } from "../layout/page-layout";
import type { ExcelColumnType, ExcelExportMeta, ExportCell, GridExportData } from "../../../lib/excel-export";
import { createGridBookColumn, GridContextBar, GRID_BOOK_COLUMN_ID, placeGridBookColumnFirst, type GridBookConfig, type GridPeriodConfig } from "./grid-context-bar";
import { gridPeriodLabel } from "./grid-period";
import { GridAction, GridActions } from "./grid-action";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { useAutoGridZoom } from "./grid-auto-zoom";

export type TreeGridRow = { id: string; parentId?: string | null };

export type TreeGridColumn<Row extends TreeGridRow> = {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Číselný sloupec – vpravo, tisíce mezerou, se součtem za uzel. */
  numeric?: boolean;
  decimals?: number;
  /** Souhrn za uzel a za celou tabulku; u číselných sloupců výchozí „sum“. */
  total?: "sum" | "none";
  /** Hodnota pro zobrazení, hledání i export. */
  value?: (row: Row) => string | number | null | undefined;
  /** Vlastní vykresjení buňky; `total` je souhrn za uzel včetně potomků. */
  render?: (row: Row, total: number | null) => ReactNode;
  exportType?: ExcelColumnType;
  width?: number;
  /** Sloupec je ve výchozím stavu skrytý (lze zapnout ve výběru sloupců). */
  hiddenByDefault?: boolean;
  locked?: boolean;
  fitContent?: boolean;
  transient?: boolean;
};

/** Úroveň rozbajení – `depth` = počet rozbajených úrovní (0 = jen kořeny). */
export type TreeGridExpandLevel = { id: string; label: string; depth: number };

export type TreeGridTexts = {
  searchPlaceholder: string;
  expandAll: string;
  collapseAll: string;
  expandNode: string;
  collapseNode: string;
  levelsLabel: string;
  emptyLabel: string;
  totalLabel: string;
  exportLabel: string;
  columnsTitle: string;
};

export const DEFAULT_TREE_GRID_TEXTS: TreeGridTexts = {
  searchPlaceholder: "Hledat…",
  expandAll: "Rozbalit vše",
  collapseAll: "Sbalit vše",
  expandNode: "Rozbalit",
  collapseNode: "Sbalit",
  levelsLabel: "Úroveň rozbajení",
  emptyLabel: "Zatím zde nejsou žádné položky",
  totalLabel: "Celkem",
  exportLabel: "Export do Excelu",
  columnsTitle: "Sloupce",
};

export interface TreeGridProps<Row extends TreeGridRow> {
  rows: Row[];
  columns: TreeGridColumn<Row>[];
  title: string;
  /** Zobrazí nadpis v liště. Výchozí je false; title se dál používá pro export a nastavení. */
  showTitle?: boolean;
  /** Klíč pro uložení zoomu a viditelnosti sloupců (výchozí z `exportName` / `title`). */
  storageKey?: string;
  /** Svislá výška gridu; v PageLayout list je výchozí fill, jinak auto. */
  height?: "fill" | "auto";
  /** Základ názvu souboru exportu; bez něj se tlačítko exportu nezobrazí. */
  exportName?: string;
  exportMeta?: ExcelExportMeta;
  defaultCollapsed?: boolean;
  /** Tlačítka úrovní rozbajení v liště, např. Třídy · Skupiny · Účty · Vše. */
  expandLevels?: TreeGridExpandLevel[];
  /** Řízená úroveň rozbajení (hloubka). */
  expandDepth?: number;
  onExpandDepthChange?: (depth: number) => void;
  /** Zvýrazněný uzel; bez zadání se zvýrazní naposledy rozbajený / vybraný uzel. */
  highlightedRowId?: string | null;
  /** Klik na řádek (výběr). */
  onRowClick?: (row: Row) => void;
  onRowOpen?: (row: Row) => void;
  /** Akce „Nový“ a další – v liště vpravo od zoomu. */
  actions?: ReactNode;
  toolbarLeft?: ReactNode;
  period?: GridPeriodConfig;
  book?: GridBookConfig<Row>;
  /** Volitelný obsah vpravo v kontextovém řádku. */
  contextRight?: ReactNode;
  filters?: ReactNode;
  /** Otevře panel filtrů při prvním zobrazení. */
  defaultFiltersOpen?: boolean;
  filterChips?: FilterChip[];
  onClearFilters?: () => void;
  defaultFilters?: string[];
  viewMode?: GridViewMode;
  onViewModeChange?: (mode: GridViewMode) => void;
  /** Společný klíč zoomu pro tabulkové a stromové zobrazení stejného obsahu. */
  viewZoomKey?: string;
  asOf?: AsOfDateConfig;
  addAction?: GridAddAction | GridAddAction[];
  moreActions?: GridMoreItem[];
  pdfExport?: () => Promise<void>;
  /** Kontext firemní tiskové sestavy; bez něj se v menu Stáhnout nezobrazí „Tisk (PDF)…“. */
  printContext?: PrintContext;
  /** Nadpis tiskové sestavy (výchozí titulek exportu). */
  printTitle?: string;
  /** Další parametry záhlaví; připojí se za automatické z kontextového řádku. */
  printParams?: GridPrintParam[];
  extraExports?: GridExtraExport[];
  /** Ruční obnovení dat; po dobu Promise se tlačítko samo deaktivuje. */
  onRefresh?: () => void | Promise<unknown>;
  /** Řízený stav probíhajícího obnovení. */
  refreshing?: boolean;
  onEditRow?: (row: Row) => void;
  onDeleteRow?: (row: Row) => void;
  deleteConfirm?: (row: Row) => string;
  rowActions?: (row: Row) => ReactNode;
  canEditRow?: (row: Row) => boolean;
  canDeleteRow?: (row: Row) => boolean;
  editDisabledReason?: (row: Row) => string | undefined;
  deleteDisabledReason?: (row: Row) => string | undefined;
  actionsLabel?: string;
  hideDefaultActions?: boolean;
  /** Povolí hromadný výběr řádků. */
  selectable?: boolean;
  selectionActions?: (rows: Row[], clear: () => void) => ReactNode;
  onSelectedRowsChange?: (rows: Row[]) => void;
  gridTexts?: Partial<GridTexts>;
  texts?: Partial<TreeGridTexts>;
  loading?: boolean;
  className?: string;
}

const cellText = <Row extends TreeGridRow>(column: TreeGridColumn<Row>, row: Row) => {
  const raw = column.value?.(row);
  if (raw === null || raw === undefined) return "";
  return typeof raw === "number" ? formatAmount(raw, column.decimals ?? 2) : String(raw);
};

const numericValue = <Row extends TreeGridRow>(column: TreeGridColumn<Row>, row: Row) => {
  const raw = column.value?.(row);
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
};

/**
 * Stromová varianta datové mřížky – úrovně rozbajení, zvýraznění uzlu, součty za uzel,
 * hledání se zachováním cesty, výběr sloupců, zoom a export do Excelu
 * se souhrnným řádkem pod dětmi (vzorce SUBTOTAL). Pro osnovu, výkazy a zakázky.
 */
export function TreeGrid<Row extends TreeGridRow>({
  rows,
  columns,
  title,
  showTitle = false,
  storageKey,
  height,
  exportName,
  exportMeta,
  defaultCollapsed = false,
  expandLevels,
  expandDepth,
  onExpandDepthChange,
  highlightedRowId,
  onRowClick,
  onRowOpen,
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
  printContext,
  printTitle,
  printParams,
  extraExports = [],
  onRefresh,
  refreshing,
  onEditRow,
  onDeleteRow,
  deleteConfirm,
  rowActions,
  canEditRow,
  canDeleteRow,
  editDisabledReason,
  deleteDisabledReason,
  actionsLabel,
  hideDefaultActions,
  selectable,
  selectionActions,
  onSelectedRowsChange,
  gridTexts,
  texts,
  loading,
  className,
}: TreeGridProps<Row>) {
  const dsTexts = useDsTexts();
  const pageVariant = usePageLayoutVariant();
  const resolvedHeight = height ?? (pageVariant === "list" ? "fill" : "auto");
  const t = { ...DEFAULT_TREE_GRID_TEXTS, searchPlaceholder: dsTexts.grid.searchPlaceholder, expandAll: dsTexts.grid.expand, collapseAll: dsTexts.grid.collapse, columnsTitle: dsTexts.grid.columnsTitle, totalLabel: dsTexts.grid.total, ...texts };
  const sharedTexts = useResolvedGridTexts(gridTexts);
  const { confirm, confirmDialog } = useConfirmDialog();
  const key = storageKey ?? `tree:${exportName ?? title}`;
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(defaultFiltersOpen);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [ownDepth, setOwnDepth] = useState<number | null>(null);
  const [autoHighlight, setAutoHighlight] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hasRowActions = Boolean((onEditRow && !hideDefaultActions) || (onDeleteRow && !hideDefaultActions) || rowActions) && !selectMode;
  const zoomKey = viewZoomKey ?? (viewMode ? `view:${exportName ?? title}` : key);
  const autoZoom = pageVariant === "form" && resolvedHeight === "auto";
  const { zoom, setZoom, setAutoZoom, density, setDensity } = useGridZoom(zoomKey, { auto: autoZoom });
  const blockRef = useRef<HTMLDivElement>(null);
  useWheelZoom(blockRef, setZoom, zoom);
  const applyAutoZoom = useCallback((next: number) => setAutoZoom(next), [setAutoZoom]);

  const effectiveColumns = useMemo<TreeGridColumn<Row>[]>(() => book?.value === "all" && book.getRowBookId ? [createGridBookColumn(book), ...columns] : columns, [book, columns]);
  const hierarchyColumnId = columns[0]?.id;
  const colDefs = useMemo(
    () =>
      effectiveColumns.map((column) => ({
        id: column.id,
        label: column.label,
        ...(column.id === hierarchyColumnId || column.locked ? { locked: true } : {}),
        ...(column.hiddenByDefault ? { defaultVisible: false } : {}),
        ...(column.transient ? { transient: true } : {}),
      })),
    [effectiveColumns, hierarchyColumnId],
  );
  const cols = useGridColumns(key, colDefs);
  useAutoGridZoom(blockRef, autoZoom, zoom, applyAutoZoom, [cols.visible, cols.order, cols.widths, selectMode, hasRowActions]);
  const byColumnId = useMemo(() => new Map(effectiveColumns.map((c) => [c.id, c])), [effectiveColumns]);
  const shown = useMemo(
    () => {
      const visible = cols.columns.filter((c) => cols.visible[c.id]).map((c) => byColumnId.get(c.id)!).filter(Boolean);
      return placeGridBookColumnFirst(visible);
    },
    [cols.columns, cols.visible, byColumnId],
  );

  const { childrenOf, roots, byId, levelOf } = useMemo(() => {
    const map = new Map<string, Row>();
    const children = new Map<string, Row[]>();
    const rootRows: Row[] = [];
    for (const row of rows) map.set(row.id, row);
    for (const row of rows) {
      const parent = row.parentId ? map.get(row.parentId) : null;
      if (parent && parent.id !== row.id) {
        const list = children.get(parent.id) ?? [];
        list.push(row);
        children.set(parent.id, list);
      } else rootRows.push(row);
    }
    const levels = new Map<string, number>();
    const walk = (list: Row[], level: number) => {
      for (const row of list) {
        levels.set(row.id, level);
        walk(children.get(row.id) ?? [], level + 1);
      }
    };
    walk(rootRows, 0);
    return { childrenOf: children, roots: rootRows, byId: map, levelOf: levels };
  }, [rows]);

  const applyDepth = (depth: number) => {
    setCollapsed(Object.fromEntries(rows.map((row) => [row.id, (levelOf.get(row.id) ?? 0) >= depth])));
  };

  useEffect(() => {
    if (expandDepth !== undefined) applyDepth(expandDepth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandDepth, levelOf]);

  const activeDepth = expandDepth ?? ownDepth;
  const selectDepth = (depth: number) => {
    setOwnDepth(depth);
    if (expandDepth === undefined) applyDepth(depth);
    onExpandDepthChange?.(depth);
  };

  /** Součty za uzel včetně všech potomků. */
  const totals = useMemo(() => {
    const result = new Map<string, Map<string, number>>();
    const visit = (row: Row): Map<string, number> => {
      const own = new Map<string, number>();
      for (const column of columns) {
        if (column.total === "none" || !column.numeric) continue;
        own.set(column.id, numericValue(column, row));
      }
      for (const child of childrenOf.get(row.id) ?? []) {
        for (const [id, value] of visit(child)) own.set(id, (own.get(id) ?? 0) + value);
      }
      result.set(row.id, own);
      return own;
    };
    for (const root of roots) visit(root);
    return result;
  }, [columns, childrenOf, roots]);

  /** Hledání zachová cestu – zobrazí nalezené uzly i všechny jejich předky. */
  const matched = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("cs");
    if (!needle) return null;
    const keep = new Set<string>();
    for (const row of rows) {
      const hit = columns.some((column) => cellText(column, row).toLocaleLowerCase("cs").includes(needle));
      if (!hit) continue;
      keep.add(row.id);
      let parentId = row.parentId ?? null;
      let guard = 0;
      while (parentId && guard++ < 50) {
        keep.add(parentId);
        parentId = byId.get(parentId)?.parentId ?? null;
      }
    }
    return keep;
  }, [byId, columns, query, rows]);

  const isCollapsed = (id: string) => (matched ? false : (collapsed[id] ?? defaultCollapsed) === true);

  const toggleNode = (id: string) => {
    const willExpand = isCollapsed(id);
    setCollapsed({ ...collapsed, [id]: !willExpand });
    setOwnDepth(null);
    if (willExpand) setAutoHighlight(id);
  };

  const flatten = (list: Row[], level: number): { row: Row; level: number }[] =>
    list
      .filter((row) => !matched || matched.has(row.id))
      .flatMap((row) => [
        { row, level },
        ...(isCollapsed(row.id) ? [] : flatten(childrenOf.get(row.id) ?? [], level + 1)),
      ]);

  const visible = flatten(roots, 0);
  const maxDepth = Math.max(0, ...levelOf.values());
  const availableLevels = expandLevels?.length
    ? expandLevels
    : Array.from({ length: Math.max(1, maxDepth) }, (_, index) => ({
        id: `level-${index + 1}`,
        label: dsTexts.grid.expandLevel(index + 1, ""),
        depth: index + 1,
      })).concat(maxDepth > 1 ? [{ id: "all", label: dsTexts.grid.all, depth: maxDepth + 1 }] : []);
  const highlighted = highlightedRowId !== undefined ? highlightedRowId : autoHighlight;
  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.has(row.id)), [rows, selectedIds]);
  const selectedRowsChangeRef = useRef(onSelectedRowsChange);
  selectedRowsChangeRef.current = onSelectedRowsChange;
  useEffect(() => selectedRowsChangeRef.current?.(selectedRows), [selectedRows]);
  useEffect(() => { if (!selectMode) setSelectedIds(new Set()); }, [selectMode]);
  const clearSelection = () => setSelectedIds(new Set());
  const allSelected = visible.length > 0 && visible.every(({ row }) => selectedIds.has(row.id));
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(visible.map(({ row }) => row.id)));
  const toggleRow = (id: string) => setSelectedIds((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const grandTotals = new Map<string, number>();
  for (const root of roots) {
    if (matched && !matched.has(root.id)) continue;
    for (const [id, value] of totals.get(root.id) ?? []) grandTotals.set(id, (grandTotals.get(id) ?? 0) + value);
  }

  const hasTotals = shown.some((column) => column.numeric && column.total !== "none");
  const nodeTotal = (column: TreeGridColumn<Row>, row: Row) =>
    column.numeric && column.total !== "none" ? (totals.get(row.id)?.get(column.id) ?? null) : null;

  /** Export: děti nad rodičem (summaryBelow), rodič = SUBTOTAL z rozsahu potomků. */
  const exportData = (onlyExpanded = false): GridExportData => {
    const out: { row: Row; level: number }[] = [];
    const subtotalRows: { row: number; from: number; to: number }[] = [];
    const visit = (row: Row, level: number) => {
      const start = out.length;
      const children = onlyExpanded && isCollapsed(row.id) ? [] : (childrenOf.get(row.id) ?? []).filter((child) => !matched || matched.has(child.id));
      for (const child of children) visit(child, level + 1);
      if (out.length > start || (onlyExpanded && (childrenOf.get(row.id)?.length ?? 0) > 0)) subtotalRows.push({ row: out.length, from: start, to: out.length - 1 });
      out.push({ row, level });
    };
    for (const root of roots) if (!matched || matched.has(root.id)) visit(root, 0);
    return {
      columns: shown.map((column) => column.label),
      rows: out.map(({ row, level }) =>
        shown.map((column, index): ExportCell => {
          if (column.id === hierarchyColumnId) return `${"    ".repeat(level)}${cellText(column, row)}`;
          const total = nodeTotal(column, row);
          if (total !== null) return total;
          const raw = column.value?.(row);
          return raw === undefined ? null : raw;
        }),
      ),
      rowLevels: out.map(({ level }) => level),
      outlineSummaryBelow: true,
      subtotalRows,
      columnMeta: shown.map((column) => ({
        type: column.exportType ?? (column.numeric ? "number" : "text"),
        align: column.align ?? (column.numeric ? "right" : "left"),
        total: column.numeric && column.total !== "none" ? "sum" : "none",
      })),
    };
  };

  const printConfig = printContext ? {
    context: printContext,
    title: printTitle ?? title ?? exportName ?? "",
    params: gridPrintParams({ book, period: period?.value, search: query, filters: exportMeta?.filters ?? [], asOf: asOf ? { enabled: asOf.enabled, value: asOf.value } : undefined, extra: printParams }),
  } : undefined;

  const alignClass = (column: TreeGridColumn<Row>) =>
    cn(
      column.align === "center" && "text-center",
      (column.align === "right" || (column.numeric && !column.align)) && "text-right tabular-nums",
    );

  return (
    <div ref={blockRef} className={cn("grid-connected-block @container flex min-w-0 flex-col overflow-hidden rounded-lg border shadow-panel", resolvedHeight === "fill" && "min-h-0 flex-1", className)} data-slot="tree-grid" data-grid-height={resolvedHeight}>
      {showTitle ? <div className="rounded-t-lg border bg-card px-3 py-2 font-semibold">{title}</div> : null}
      {period || book || contextRight ? <GridContextBar period={period} book={book} contextRight={contextRight} zoom={zoom} density={density} className={cn("border-t-0", showTitle ? "rounded-t-none" : "rounded-t-lg")} /> : null}
      <GridToolbar
        zoom={zoom}
        density={density}
        className={cn("rounded-t-lg border-b-0 bg-card shadow-panel", (showTitle || period || book || contextRight) && "rounded-t-none border-t-0 shadow-none")}
        left={<>
          {addAction ? <GridAddActions actions={addAction} /> : null}
            <GridToolbarCollapsible>
          {addAction && (viewMode || rows.length || asOf || toolbarLeft) ? <GridToolbarSeparator density={density} /> : null}
          {viewMode && onViewModeChange ? <ViewModeToggle mode={viewMode} onChange={onViewModeChange} texts={sharedTexts} /> : null}
          <GridExpandControls
            levels={availableLevels}
            activeDepth={activeDepth}
            disabled={Boolean(matched)}
            onExpand={selectDepth}
            onCollapse={() => selectDepth(0)}
            expandLabel={t.expandAll}
            collapseLabel={t.collapseAll}
          />
          {(asOf || toolbarLeft) ? <span className="grid-toolbar-optional contents"><span className="hidden @min-[640px]:contents"><GridToolbarSeparator density={density} /></span>{asOf ? <AsOfDateToggle {...asOf} /> : null}{asOf && toolbarLeft ? <GridToolbarSeparator density={density} /> : null}{toolbarLeft}</span> : null}
          </GridToolbarCollapsible>
        </>}
        right={<>
          <span data-toolbar-measure="find" data-toolbar-group="find" className="flex shrink-0 items-center gap-2"><GridSearch value={query} onChange={setQuery} placeholder={t.searchPlaceholder} zoom={zoom} />
          {filters ? (
            <GridFilterToggle
              open={filtersOpen}
              onOpenChange={setFiltersOpen}
              onClear={onClearFilters}
              activeCount={filterChips.length}
              activeFilters={filterChips.map((chip) => chip.value ? `${chip.label}: ${chip.value}` : chip.label)}
              defaultFilters={defaultFilters}
              zoom={zoom}
              texts={sharedTexts}
            />
          ) : null}</span>
          <div className="grid-toolbar-wide hidden @min-[640px]:contents">
            <span data-toolbar-measure="display" data-toolbar-group="display" className="grid-toolbar-display-group inline-flex shrink-0 items-center gap-2"><GridToolbarSeparator density={density} />
            <ColumnPicker columns={cols.columns.filter((c) => !c.transient).map((c) => ({ id: c.id, label: c.label, ...(c.locked ? { locked: true } : {}) }))} visible={cols.columnVisible} onToggle={cols.toggle} onReorder={cols.reorder} onReset={cols.reset} zoom={zoom} title={t.columnsTitle} texts={sharedTexts} />
            <ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} auto={autoZoom} /></span>
            {(selectable || actions || exportName) ? <span data-toolbar-measure="data" data-toolbar-group="data" className="grid-toolbar-data-group inline-flex shrink-0 items-center gap-2"><GridToolbarSeparator density={density} />{selectable ? <GridSelectionToggle active={selectMode} count={selectedRows.length} zoom={zoom} texts={sharedTexts} onToggle={setSelectMode} /> : null}{actions}{exportName ? <GridExport getData={() => exportData()} getPrintData={() => exportData(true)} print={printConfig} fijename={exportName} title={title} meta={{ ...exportMeta, filters: [...(exportMeta?.filters ?? []), ...(period ? [gridPeriodLabel(period.value)] : []), ...(query.trim() ? [sharedTexts.exportSearch(query.trim())] : [])] }} zoom={zoom} texts={sharedTexts} pdfExport={pdfExport} extraExports={extraExports} /> : null}</span> : null}
          </div>
          <span data-toolbar-measure="menu" data-toolbar-group="menu" className="contents"><GridMoreMenu responsiveOverflow items={moreActions} zoom={zoom} texts={sharedTexts} compact={<>{viewMode && onViewModeChange ? <ViewModeToggle mode={viewMode} onChange={onViewModeChange} texts={sharedTexts} /> : null}<GridExpandControls levels={availableLevels} activeDepth={activeDepth} disabled={Boolean(matched)} onExpand={selectDepth} onCollapse={() => selectDepth(0)} expandLabel={t.expandAll} collapseLabel={t.collapseAll} />{asOf ? <AsOfDateToggle {...asOf} /> : null}{toolbarLeft}</>} tools={<><ColumnPicker columns={cols.columns.filter((c) => !c.transient).map((c) => ({ id: c.id, label: c.label, ...(c.locked ? { locked: true } : {}) }))} visible={cols.columnVisible} onToggle={cols.toggle} onReorder={cols.reorder} onReset={cols.reset} zoom={zoom} title={t.columnsTitle} /><ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} /></>} secondary={(selectable || actions || exportName) ? <>{selectable ? <GridSelectionToggle active={selectMode} count={selectedRows.length} zoom={zoom} texts={sharedTexts} onToggle={setSelectMode} /> : null}{actions}{exportName ? <GridExport getData={() => exportData()} getPrintData={() => exportData(true)} print={printConfig} fijename={exportName} title={title} meta={{ ...exportMeta, filters: [...(exportMeta?.filters ?? []), ...(period ? [gridPeriodLabel(period.value)] : []), ...(query.trim() ? [sharedTexts.exportSearch(query.trim())] : [])] }} zoom={zoom} texts={sharedTexts} pdfExport={pdfExport} extraExports={extraExports} /> : null}</> : null} className="grid-toolbar-overflow-menu" /></span>
          {onRefresh ? <span data-toolbar-measure="refresh" data-toolbar-group="refresh" className="grid-toolbar-refresh-group inline-flex shrink-0 items-center gap-2"><GridToolbarSeparator density={density} /><GridRefreshButton onRefresh={onRefresh} refreshing={refreshing} zoom={zoom} texts={sharedTexts} /></span> : null}
        </>}
      />
      {filters ? <GridFilterPanel open={filtersOpen} zoom={zoom} density={density}>{filters}</GridFilterPanel> : null}
      {!filtersOpen && filterChips.length ? <div className="border border-t-0 bg-card px-2 py-1.5"><FilterChips chips={filterChips} onClearAll={onClearFilters} size="sm" texts={{ clearAll: sharedTexts.clearAll, removeLabel: sharedTexts.removeFilter }} /></div> : null}

      {selectMode ? <div className="flex items-center gap-2 border-b border-l-4 border-l-primary bg-secondary/50 px-2 py-1.5 text-sm"><span className="text-muted-foreground">{sharedTexts.selectedRecords(formatAmount(selectedRows.length, 0))}</span><div className="ml-auto flex items-center gap-2">{selectionActions?.(selectedRows, clearSelection)}</div></div> : null}

      <ZoomGrid zoom={zoom} setZoom={setZoom} density={density} loading={loading} height={resolvedHeight} className="rounded-t-none border-t-0">
        <Table className={cn(density === "compact" && "[&_td]:py-1 [&_th]:h-8")}>
          <TableHeader>
            <TableRow>
              {selectMode ? <TableHead className="w-10 text-center"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label={sharedTexts.selectAllRows} /></TableHead> : null}
              {shown.map((column) => (
                <TableHead
                  key={column.id}
                   style={column.width ? { width: `${column.width / 16}rem` } : undefined}
                  className={alignClass(column)}
                >
                  {column.label}
                </TableHead>
              ))}
              {hasRowActions ? <TableHead className="grid-actions-header sticky right-0 z-20 w-px whitespace-nowrap border-l px-2 py-0 text-center" aria-label={actionsLabel ?? sharedTexts.actions}>{actionsLabel ?? sharedTexts.actions}</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={shown.length + (selectMode ? 1 : 0) + (hasRowActions ? 1 : 0)} className="py-8 text-center text-muted-foreground">
                  {t.emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              visible.map(({ row, level }) => {
                const canExpand = (childrenOf.get(row.id)?.length ?? 0) > 0;
                const isHighlighted = highlighted === row.id;
                return (
                  <TableRow
                    key={row.id}
                    data-row-id={row.id}
                    data-highlighted={isHighlighted || undefined}
                    aria-selected={isHighlighted}
                    onClick={() => {
                      setAutoHighlight(row.id);
                      onRowClick?.(row);
                    }}
                    onDoubleClick={() => {
                      if (onRowOpen) onRowOpen(row);
                      else if (onEditRow && !editDisabledReason?.(row) && (canEditRow?.(row) ?? true)) onEditRow(row);
                    }}
                    className={cn(canExpand && "font-medium", isHighlighted && "bg-primary/10 hover:bg-primary/15")}
                  >
                    {selectMode ? <TableCell className="w-10 text-center"><Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => toggleRow(row.id)} aria-label={sharedTexts.selectRow} onClick={(event) => event.stopPropagation()} /></TableCell> : null}
                    {shown.map((column) => {
                      const total = nodeTotal(column, row);
                      const numericShown = column.numeric ? (total ?? numericValue(column, row)) : null;
                      return (
                        <TableCell
                          key={column.id}
                          className={cn("whitespace-nowrap", alignClass(column), column.numeric && amountClass(numericShown))}
                          style={column.id === hierarchyColumnId ? { paddingLeft: `${level * 1.5 + 0.9}em` } : undefined}
                        >
                          {column.id === hierarchyColumnId ? (
                            <span className="flex items-center gap-1">
                              {canExpand ? (
                                <button
                                  type="button"
                                  aria-label={isCollapsed(row.id) ? t.expandNode : t.collapseNode}
                                  aria-expanded={!isCollapsed(row.id)}
                                  className="flex size-5 shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleNode(row.id);
                                  }}
                                >
                                  {isCollapsed(row.id) ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                                </button>
                              ) : (
                                <span className="size-5 shrink-0" />
                              )}
                              {column.render ? column.render(row, total) : cellText(column, row)}
                            </span>
                          ) : column.render ? (
                            column.render(row, total)
                          ) : column.numeric ? (
                            formatAmount(numericShown ?? 0, column.decimals ?? 2)
                          ) : (
                            cellText(column, row)
                          )}
                        </TableCell>
                      );
                    })}
                    {hasRowActions ? <TableCell className="sticky right-0 z-[1] !min-w-0 whitespace-nowrap border-l bg-card px-0.5 py-0"><GridActions>
                      {rowActions?.(row)}
                      {!hideDefaultActions && onEditRow && ((canEditRow?.(row) ?? true) || editDisabledReason?.(row)) ? <GridAction title={sharedTexts.edit} aria-label={sharedTexts.edit} disabled={Boolean(editDisabledReason?.(row))} disabledReason={editDisabledReason?.(row)} onClick={(event) => { event.stopPropagation(); onEditRow(row); }}><Pencil className="size-3.5" /></GridAction> : null}
                      {!hideDefaultActions && onDeleteRow && ((canDeleteRow?.(row) ?? true) || deleteDisabledReason?.(row)) ? <GridAction tone="destructive" title={sharedTexts.remove} aria-label={sharedTexts.remove} disabled={Boolean(deleteDisabledReason?.(row))} disabledReason={deleteDisabledReason?.(row)} onClick={(event) => { event.stopPropagation(); confirm({ title: deleteConfirm?.(row) ?? sharedTexts.removeConfirm, confirmLabel: sharedTexts.remove, destructive: true, onConfirm: () => onDeleteRow(row) }); }}><Trash2 className="size-3.5" /></GridAction> : null}
                    </GridActions></TableCell> : null}
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {hasTotals && visible.length > 0 ? (
            <TableFooter>
              <TableRow>
                {selectMode ? <TableCell /> : null}
                {shown.map((column) => (
                  <TableCell key={column.id} className={cn("whitespace-nowrap font-semibold", column.numeric && "text-right tabular-nums")}>
                    {column.id === hierarchyColumnId
                      ? t.totalLabel
                      : column.numeric && column.total !== "none"
                        ? formatAmount(grandTotals.get(column.id) ?? 0, column.decimals ?? 2)
                        : null}
                  </TableCell>
                ))}
                {hasRowActions ? <TableCell className="grid-actions-footer sticky right-0 z-[9] !min-w-0 whitespace-nowrap border-l px-0.5 py-2" /> : null}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </ZoomGrid>
      {confirmDialog}
    </div>
  );
}
