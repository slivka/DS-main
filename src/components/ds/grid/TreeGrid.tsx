import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

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
import { ColumnPicker } from "./column-picker";
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
  GridAddActions,
  GridExpandControls,
  GridToolbar,
  GridToolbarSeparator,
  type AsOfDateConfig,
  type GridAddAction,
} from "./grid-toolbar";
import { resolveGridTexts, type GridTexts } from "./grid-texts";
import { amountClass, formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import type { ExcelColumnType, ExcelExportMeta, ExportCell, GridExportData } from "../../../lib/excel-export";

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
  /** Vlastní vykreslení buňky; `total` je souhrn za uzel včetně potomků. */
  render?: (row: Row, total: number | null) => ReactNode;
  exportType?: ExcelColumnType;
  width?: number;
  /** Sloupec je ve výchozím stavu skrytý (lze zapnout ve výběru sloupců). */
  hiddenByDefault?: boolean;
};

/** Úroveň rozbalení – `depth` = počet rozbalených úrovní (0 = jen kořeny). */
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
  levelsLabel: "Úroveň rozbalení",
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
  /** Základ názvu souboru exportu; bez něj se tlačítko exportu nezobrazí. */
  exportName?: string;
  exportMeta?: ExcelExportMeta;
  defaultCollapsed?: boolean;
  /** Tlačítka úrovní rozbalení v liště, např. Třídy · Skupiny · Účty · Vše. */
  expandLevels?: TreeGridExpandLevel[];
  /** Řízená úroveň rozbalení (hloubka). */
  expandDepth?: number;
  onExpandDepthChange?: (depth: number) => void;
  /** Zvýrazněný uzel; bez zadání se zvýrazní naposledy rozbalený / vybraný uzel. */
  highlightedRowId?: string | null;
  /** Klik na řádek (výběr). */
  onRowClick?: (row: Row) => void;
  onRowOpen?: (row: Row) => void;
  /** Akce „Nový“ a další – v liště vpravo od zoomu. */
  actions?: ReactNode;
  toolbarLeft?: ReactNode;
  filters?: ReactNode;
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
  extraExports?: GridExtraExport[];
  /** Ruční obnovení dat; po dobu Promise se tlačítko samo deaktivuje. */
  onRefresh?: () => void | Promise<unknown>;
  /** Řízený stav probíhajícího obnovení. */
  refreshing?: boolean;
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
 * Stromová varianta datové mřížky – úrovně rozbalení, zvýraznění uzlu, součty za uzel,
 * hledání se zachováním cesty, výběr sloupců, zoom a export do Excelu
 * se souhrnným řádkem pod dětmi (vzorce SUBTOTAL). Pro osnovu, výkazy a zakázky.
 */
export function TreeGrid<Row extends TreeGridRow>({
  rows,
  columns,
  title,
  showTitle = false,
  storageKey,
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
  filters,
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
  onRefresh,
  refreshing,
  selectable,
  selectionActions,
  onSelectedRowsChange,
  gridTexts,
  texts,
  loading,
  className,
}: TreeGridProps<Row>) {
  const t = { ...DEFAULT_TREE_GRID_TEXTS, ...texts };
  const sharedTexts = resolveGridTexts(gridTexts);
  const key = storageKey ?? `tree:${exportName ?? title}`;
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [ownDepth, setOwnDepth] = useState<number | null>(null);
  const [autoHighlight, setAutoHighlight] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const zoomKey = viewZoomKey ?? (viewMode ? `view:${exportName ?? title}` : key);
  const { zoom, setZoom, density, setDensity } = useGridZoom(zoomKey);
  const blockRef = useRef<HTMLDivElement>(null);
  useWheelZoom(blockRef, setZoom, zoom);

  const colDefs = useMemo(
    () =>
      columns.map((column, index) => ({
        id: column.id,
        label: column.label,
        ...(index === 0 ? { locked: true } : {}),
        ...(column.hiddenByDefault ? { defaultVisible: false } : {}),
      })),
    [columns],
  );
  const cols = useGridColumns(key, colDefs);
  const byColumnId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
  const shown = useMemo(
    () => cols.columns.filter((c) => cols.visible[c.id]).map((c) => byColumnId.get(c.id)!).filter(Boolean),
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
        label: `Úroveň ${index + 1}`,
        depth: index + 1,
      })).concat(maxDepth > 1 ? [{ id: "all", label: "Vše", depth: maxDepth + 1 }] : []);
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
  const exportData = (): GridExportData => {
    const out: { row: Row; level: number }[] = [];
    const subtotalRows: { row: number; from: number; to: number }[] = [];
    const visit = (row: Row, level: number) => {
      const start = out.length;
      const children = (childrenOf.get(row.id) ?? []).filter((child) => !matched || matched.has(child.id));
      for (const child of children) visit(child, level + 1);
      if (out.length > start) subtotalRows.push({ row: out.length, from: start, to: out.length - 1 });
      out.push({ row, level });
    };
    for (const root of roots) if (!matched || matched.has(root.id)) visit(root, 0);
    return {
      columns: shown.map((column) => column.label),
      rows: out.map(({ row, level }) =>
        shown.map((column, index): ExportCell => {
          if (index === 0) return `${"    ".repeat(level)}${cellText(column, row)}`;
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

  const alignClass = (column: TreeGridColumn<Row>) =>
    cn(
      column.align === "center" && "text-center",
      (column.align === "right" || (column.numeric && !column.align)) && "text-right tabular-nums",
    );

  return (
    <div ref={blockRef} className={cn("@container flex min-w-0 flex-col", className)} data-slot="tree-grid">
      {showTitle ? <div className="rounded-t-lg border bg-card px-3 py-2 font-semibold">{title}</div> : null}
      <GridToolbar
        zoom={zoom}
        density={density}
        className={cn("rounded-t-lg border-b-0 bg-card shadow-panel", showTitle && "rounded-t-none border-t-0 shadow-none")}
        left={<>
          {viewMode && onViewModeChange ? <ViewModeToggle mode={viewMode} onChange={onViewModeChange} texts={sharedTexts} /> : null}
          {viewMode && onViewModeChange ? <GridToolbarSeparator density={density} /> : null}
          <GridExpandControls
            levels={availableLevels}
            activeDepth={activeDepth}
            disabled={Boolean(matched)}
            onExpand={selectDepth}
            onCollapse={() => selectDepth(0)}
            expandLabel={t.expandAll}
            collapseLabel={t.collapseAll}
          />
          <GridToolbarSeparator density={density} />
          {asOf ? <AsOfDateToggle {...asOf} /> : null}
          {asOf ? <GridToolbarSeparator density={density} /> : null}
          {toolbarLeft}
        </>}
        right={<>
          <GridSearch value={query} onChange={setQuery} placeholder={t.searchPlaceholder} zoom={zoom} />
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
          ) : null}
          {onRefresh ? <GridRefreshButton onRefresh={onRefresh} refreshing={refreshing} zoom={zoom} texts={sharedTexts} /> : null}
          {exportName ? (
            <GridExport
              getData={exportData}
              filename={exportName}
              title={title}
              meta={{ ...exportMeta, ...(query.trim() ? { filters: [...(exportMeta?.filters ?? []), `Hledání: ${query.trim()}`] } : {}) }}
              zoom={zoom}
              texts={sharedTexts}
              pdfExport={pdfExport}
              extraExports={extraExports}
            />
          ) : null}
          <ColumnPicker
            columns={cols.columns.map((c) => ({ id: c.id, label: c.label, ...(c.locked ? { locked: true } : {}) }))}
            visible={cols.columnVisible}
            onToggle={cols.toggle}
            onReorder={cols.reorder}
            onReset={cols.reset}
            zoom={zoom}
            title={t.columnsTitle}
          />
          <ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} />
          {selectable ? <GridSelectionToggle active={selectMode} count={selectedRows.length} zoom={zoom} texts={sharedTexts} onToggle={setSelectMode} /> : null}
          {actions}
          {moreActions.length ? <GridMoreMenu items={moreActions} zoom={zoom} texts={sharedTexts} /> : null}
          {addAction ? <GridAddActions actions={addAction} /> : null}
        </>}
      />
      {filters ? <GridFilterPanel open={filtersOpen}>{filters}</GridFilterPanel> : null}
      {!filtersOpen && filterChips.length ? <div className="border border-t-0 bg-card px-2 py-1.5"><FilterChips chips={filterChips} onClearAll={onClearFilters} size="sm" /></div> : null}

      {selectMode ? <div className="flex items-center gap-2 border-b border-l-4 border-l-primary bg-secondary/50 px-2 py-1.5 text-sm"><span className="text-muted-foreground">{sharedTexts.selectedRecords(formatAmount(selectedRows.length, 0))}</span><div className="ml-auto flex items-center gap-2">{selectionActions?.(selectedRows, clearSelection)}</div></div> : null}

      <ZoomGrid zoom={zoom} setZoom={setZoom} density={density} loading={loading} noFit className="rounded-t-none border-t-0">
        <Table className={cn(density === "compact" && "[&_td]:py-1 [&_th]:h-8")}>
          <TableHeader>
            <TableRow>
              {selectMode ? <TableHead className="w-10 text-center"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label={sharedTexts.selectAllRows} /></TableHead> : null}
              {shown.map((column) => (
                <TableHead
                  key={column.id}
                  style={column.width ? { width: `${column.width / 13}em` } : undefined}
                  className={alignClass(column)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={shown.length + (selectMode ? 1 : 0)} className="py-8 text-center text-muted-foreground">
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
                    onDoubleClick={() => onRowOpen?.(row)}
                    className={cn(canExpand && "font-medium", isHighlighted && "bg-primary/10 hover:bg-primary/15")}
                  >
                    {selectMode ? <TableCell className="w-10 text-center"><Checkbox checked={selectedIds.has(row.id)} onCheckedChange={() => toggleRow(row.id)} aria-label={sharedTexts.selectRow} onClick={(event) => event.stopPropagation()} /></TableCell> : null}
                    {shown.map((column, index) => {
                      const total = nodeTotal(column, row);
                      const numericShown = column.numeric ? (total ?? numericValue(column, row)) : null;
                      return (
                        <TableCell
                          key={column.id}
                          className={cn("whitespace-nowrap", alignClass(column), column.numeric && amountClass(numericShown))}
                          style={index === 0 ? { paddingLeft: `${level * 1.5 + 0.9}em` } : undefined}
                        >
                          {index === 0 ? (
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
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {hasTotals && visible.length > 0 ? (
            <TableFooter>
              <TableRow>
                {selectMode ? <TableCell /> : null}
                {shown.map((column, index) => (
                  <TableCell key={column.id} className={cn("whitespace-nowrap font-semibold", column.numeric && "text-right tabular-nums")}>
                    {index === 0
                      ? t.totalLabel
                      : column.numeric && column.total !== "none"
                        ? formatAmount(grandTotals.get(column.id) ?? 0, column.decimals ?? 2)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </ZoomGrid>
    </div>
  );
}
