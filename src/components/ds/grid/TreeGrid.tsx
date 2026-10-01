/**
 * Stromový grid.
 * Vlastní: skládání rámu a tabulky stromu; stav rozbalení (řízená i vlastní úroveň),
 * zvýraznění uzlu, hledání se zachováním cesty, výběr uzlů, součty za uzel a export
 * se souhrnem pod dětmi (SUBTOTAL).
 * Nesmí: duplikovat lištu ani akce řádku – používá GridFrame a useRowActions.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "../../ui/table";
import { Checkbox } from "../../ui/checkbox";
import { useDsTexts } from "../../../ds-texts";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { usePageLayoutVariant } from "../layout/page-layout";
import { GridExport } from "./grid-export";
import { gridPrintParams } from "./grid-print";
import { useGridColumns } from "./grid-columns";
import { ZoomGrid, useGridZoom, useWheelZoom } from "./grid-zoom";
import { GridSelectionToggle } from "./grid-selection-toggle";
import { GridExpandControls } from "./grid-toolbar";
import { useResolvedGridTexts } from "./grid-texts";
import { createGridBookColumn, placeGridBookColumnFirst } from "./grid-context-bar";
import { gridPeriodLabel } from "./grid-period";
import { requiredGridWidthAt100, useAutoGridZoom } from "./grid-auto-zoom";
import { GridFrame } from "./GridFrame";
import { useRowActions } from "./useRowActions";
import {
  buildTree,
  buildTreeExport,
  flattenTree,
  matchTree,
  treeNodeTotals,
} from "./tree-grid-model";
import { TreeGridRows, TreeGridTotals, treeAlignClass } from "./TreeGridBody";
import {
  DEFAULT_TREE_GRID_TEXTS,
  type TreeGridColumn,
  type TreeGridProps,
  type TreeGridRow,
} from "./tree-grid-types";

export * from "./tree-grid-types";

/**
 * Stromová varianta datové mřížky – úrovně rozbalení, zvýraznění uzlu, součty za uzel,
 * hledání se zachováním cesty, výběr sloupců, zoom a export do Excelu
 * se souhrnným řádkem pod dětmi (vzorce SUBTOTAL). Pro osnovu, výkazy a zakázky.
 */
export function TreeGrid<Row extends TreeGridRow>(props: TreeGridProps<Row>) {
  const {
    rows,
    columns,
    title,
    showTitle = false,
    exportName,
    exportMeta,
    defaultCollapsed = false,
    expandDepth,
    period,
    book,
    contextRight,
    filterChips = [],
    viewMode,
    selectable,
    actions,
  } = props;
  const dsTexts = useDsTexts();
  const pageVariant = usePageLayoutVariant();
  const resolvedHeight = props.height ?? (pageVariant === "list" ? "fill" : "auto");
  const t = {
    ...DEFAULT_TREE_GRID_TEXTS,
    searchPlaceholder: dsTexts.grid.searchPlaceholder,
    expandAll: dsTexts.grid.expand,
    collapseAll: dsTexts.grid.collapse,
    columnsTitle: dsTexts.grid.columnsTitle,
    totalLabel: dsTexts.grid.total,
    ...props.texts,
  };
  const sharedTexts = useResolvedGridTexts(props.gridTexts);
  const key = props.storageKey ?? `tree:${exportName ?? title}`;
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(props.defaultFiltersOpen ?? false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [ownDepth, setOwnDepth] = useState<number | null>(null);
  const [autoHighlight, setAutoHighlight] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const rowActions = useRowActions(props, sharedTexts, selectMode);
  const hasRowActions = rowActions.visible;
  const zoomKey = props.viewZoomKey ?? (viewMode ? `view:${exportName ?? title}` : key);
  const autoZoom = pageVariant === "form" && resolvedHeight === "auto";
  const zoomState = useGridZoom(zoomKey, { auto: autoZoom });
  const { zoom, setZoom, setAutoZoom, density } = zoomState;
  const blockRef = useRef<HTMLDivElement>(null);
  useWheelZoom(blockRef, setZoom, zoom);

  const effectiveColumns = useMemo<TreeGridColumn<Row>[]>(
    () =>
      book?.value === "all" && book.getRowBookId
        ? [createGridBookColumn(book), ...columns]
        : columns,
    [book, columns],
  );
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
  const byColumnId = useMemo(
    () => new Map(effectiveColumns.map((c) => [c.id, c])),
    [effectiveColumns],
  );
  const requiredWidthAt100 = useMemo(() => {
    const visible = cols.columns
      .filter((c) => cols.visible[c.id] && c.id !== "actions")
      .flatMap((c) => byColumnId.get(c.id) ?? []);
    return requiredGridWidthAt100(
      visible.map((c) => ({
        label: typeof c.label === "string" ? c.label : c.id,
        width: cols.widths[c.id] ?? c.width,
      })),
      { select: selectMode, actions: hasRowActions },
    );
  }, [byColumnId, cols.columns, cols.visible, cols.widths, selectMode, hasRowActions]);
  useAutoGridZoom(blockRef, autoZoom, requiredWidthAt100, setAutoZoom, zoom, [
    cols.visible,
    cols.order,
    cols.widths,
    selectMode,
    hasRowActions,
  ]);
  const shown = useMemo(
    () =>
      placeGridBookColumnFirst(
        cols.columns.filter((c) => cols.visible[c.id]).flatMap((c) => byColumnId.get(c.id) ?? []),
      ),
    [cols.columns, cols.visible, byColumnId],
  );

  const tree = useMemo(() => buildTree(rows), [rows]);
  const applyDepth = (depth: number) =>
    setCollapsed(
      Object.fromEntries(rows.map((row) => [row.id, (tree.levelOf.get(row.id) ?? 0) >= depth])),
    );
  useEffect(() => {
    if (expandDepth !== undefined) applyDepth(expandDepth);
    // Řízená úroveň se přenese do stavu uzlů jen při změně úrovně nebo stromu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandDepth, tree.levelOf]);
  const activeDepth = expandDepth ?? ownDepth;
  const selectDepth = (depth: number) => {
    setOwnDepth(depth);
    if (expandDepth === undefined) applyDepth(depth);
    props.onExpandDepthChange?.(depth);
  };
  const totals = useMemo(() => treeNodeTotals(columns, tree), [columns, tree]);
  const matched = useMemo(
    () => matchTree(rows, columns, tree.byId, query),
    [tree.byId, columns, query, rows],
  );
  const isCollapsed = (id: string) =>
    matched ? false : (collapsed[id] ?? defaultCollapsed) === true;
  const toggleNode = (id: string) => {
    const willExpand = isCollapsed(id);
    setCollapsed({ ...collapsed, [id]: !willExpand });
    setOwnDepth(null);
    if (willExpand) setAutoHighlight(id);
  };
  const visible = flattenTree(tree.roots, tree.childrenOf, isCollapsed, matched);
  const maxDepth = Math.max(0, ...tree.levelOf.values());
  const availableLevels = props.expandLevels?.length
    ? props.expandLevels
    : Array.from({ length: Math.max(1, maxDepth) }, (_, index) => ({
        id: `level-${index + 1}`,
        label: dsTexts.grid.expandLevel(index + 1, ""),
        depth: index + 1,
      })).concat(maxDepth > 1 ? [{ id: "all", label: dsTexts.grid.all, depth: maxDepth + 1 }] : []);
  const highlighted = props.highlightedRowId !== undefined ? props.highlightedRowId : autoHighlight;
  const selectedRows = useMemo(
    () => rows.filter((row) => selectedIds.has(row.id)),
    [rows, selectedIds],
  );
  const selectedRowsChangeRef = useRef(props.onSelectedRowsChange);
  selectedRowsChangeRef.current = props.onSelectedRowsChange;
  // Oznámení rodiči je synchronizace s vnějškem (callback z props).
  useEffect(() => {
    selectedRowsChangeRef.current?.(selectedRows);
  }, [selectedRows]);
  useEffect(() => {
    if (!selectMode) setSelectedIds(new Set());
  }, [selectMode]);
  const clearSelection = () => setSelectedIds(new Set());
  const allSelected = visible.length > 0 && visible.every(({ row }) => selectedIds.has(row.id));
  const toggleAll = () =>
    setSelectedIds(allSelected ? new Set() : new Set(visible.map(({ row }) => row.id)));
  const toggleRow = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const grandTotals = new Map<string, number>();
  for (const root of tree.roots) {
    if (matched && !matched.has(root.id)) continue;
    for (const [id, value] of totals.get(root.id) ?? [])
      grandTotals.set(id, (grandTotals.get(id) ?? 0) + value);
  }
  const hasTotals = shown.some((column) => column.numeric && column.total !== "none");
  const nodeTotal = (column: TreeGridColumn<Row>, row: Row) =>
    column.numeric && column.total !== "none" ? (totals.get(row.id)?.get(column.id) ?? null) : null;
  const exportData = (onlyExpanded = false) =>
    buildTreeExport({
      tree,
      shown,
      hierarchyColumnId,
      matched,
      isCollapsed,
      nodeTotal,
      onlyExpanded,
    });
  const printConfig = props.printContext
    ? {
        context: props.printContext,
        title: props.printTitle ?? title ?? exportName ?? "",
        params: gridPrintParams({
          book,
          period: period?.value,
          search: query,
          filters: exportMeta?.filters ?? [],
          asOf: props.asOf ? { enabled: props.asOf.enabled, value: props.asOf.value } : undefined,
          extra: props.printParams,
        }),
      }
    : undefined;
  const expandControls = (
    <GridExpandControls
      levels={availableLevels}
      activeDepth={activeDepth}
      disabled={Boolean(matched)}
      onExpand={selectDepth}
      onCollapse={() => selectDepth(0)}
      expandLabel={t.expandAll}
      collapseLabel={t.collapseAll}
    />
  );

  return (
    <div
      ref={blockRef}
      className={cn(
        "grid-connected-block @container flex min-w-0 flex-col overflow-hidden rounded-lg border shadow-panel",
        resolvedHeight === "fill" && "min-h-0 flex-1",
        props.className,
      )}
      data-slot="tree-grid"
      data-grid-height={resolvedHeight}
    >
      {showTitle ? (
        <div className="rounded-t-lg border bg-card px-3 py-2 font-semibold">{title}</div>
      ) : null}
      <GridFrame
        zoom={zoomState}
        texts={sharedTexts}
        context={{
          period,
          book,
          right: contextRight,
          className: cn("border-t-0", showTitle ? "rounded-t-none" : "rounded-t-lg"),
        }}
        toolbarClassName={cn(
          "rounded-t-lg border-b-0 bg-card shadow-panel",
          (showTitle || period || book || contextRight) && "rounded-t-none border-t-0 shadow-none",
        )}
        addAction={props.addAction}
        view={
          viewMode && props.onViewModeChange
            ? { mode: viewMode, onChange: props.onViewModeChange }
            : undefined
        }
        expand={{ wide: expandControls, compact: expandControls, separator: rows.length > 0 }}
        asOf={props.asOf}
        toolbarLeft={props.toolbarLeft}
        search={{ value: query, onChange: setQuery, placeholder: t.searchPlaceholder }}
        {...(props.filters
          ? {
              filters: {
                content: props.filters,
                open: filtersOpen,
                onOpenChange: setFiltersOpen,
                onClear: props.onClearFilters,
                activeCount: filterChips.length,
                activeLabels: filterChips.map((chip) =>
                  chip.value ? `${chip.label}: ${chip.value}` : chip.label,
                ),
                defaultLabels: props.defaultFilters ?? [],
              },
            }
          : {})}
        filtersOpen={filtersOpen}
        filterChips={filterChips}
        onClearFilters={props.onClearFilters}
        columnPicker={{
          columns: cols.columns
            .filter((c) => !c.transient)
            .map((c) => ({ id: c.id, label: c.label, ...(c.locked ? { locked: true } : {}) })),
          visible: cols.columnVisible,
          onToggle: cols.toggle,
          onReorder: cols.reorder,
          onReset: cols.reset,
          title: t.columnsTitle,
        }}
        dataGroup={
          selectable || actions || exportName ? (
            <>
              {selectable ? (
                <GridSelectionToggle
                  active={selectMode}
                  count={selectedRows.length}
                  zoom={zoom}
                  texts={sharedTexts}
                  onToggle={setSelectMode}
                />
              ) : null}
              {actions}
              {exportName ? (
                <GridExport
                  getData={() => exportData()}
                  getPrintData={() => exportData(true)}
                  print={printConfig}
                  fileName={exportName}
                  title={title}
                  meta={{
                    ...exportMeta,
                    filters: [
                      ...(exportMeta?.filters ?? []),
                      ...(period ? [gridPeriodLabel(period.value)] : []),
                      ...(query.trim() ? [sharedTexts.exportSearch(query.trim())] : []),
                    ],
                  }}
                  zoom={zoom}
                  texts={sharedTexts}
                  pdfExport={props.pdfExport}
                  extraExports={props.extraExports ?? []}
                />
              ) : null}
            </>
          ) : null
        }
        moreActions={props.moreActions ?? []}
        {...(props.onRefresh
          ? { refresh: { onRefresh: props.onRefresh, refreshing: props.refreshing } }
          : {})}
        selection={
          selectMode
            ? {
                count: formatAmount(selectedRows.length, 0),
                actions: props.selectionActions?.(selectedRows, clearSelection),
                className: "flex border-b border-l-4 border-l-primary bg-secondary/50",
              }
            : null
        }
      />
      <ZoomGrid
        zoom={zoom}
        setZoom={setZoom}
        density={density}
        loading={props.loading}
        height={resolvedHeight}
        className="rounded-t-none border-t-0"
      >
        <Table className={cn(density === "compact" && "[&_td]:py-1 [&_th]:h-8")}>
          <TableHeader>
            <TableRow>
              {selectMode ? (
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={toggleAll}
                    aria-label={sharedTexts.selectAllRows}
                  />
                </TableHead>
              ) : null}
              {shown.map((column) => (
                <TableHead
                  key={column.id}
                  style={
                    column.width
                      ? { width: `calc(${column.width / 16}rem * var(--grid-zoom, 1))` }
                      : undefined
                  }
                  className={treeAlignClass(column)}
                >
                  {column.label}
                </TableHead>
              ))}
              {hasRowActions ? (
                <TableHead
                  className="grid-actions-header sticky right-0 z-20 w-px whitespace-nowrap border-l px-2 py-0 text-center"
                  aria-label={props.actionsLabel ?? sharedTexts.actions}
                >
                  {props.actionsLabel ?? sharedTexts.actions}
                </TableHead>
              ) : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TreeGridRows
              visible={visible}
              shown={shown}
              hierarchyColumnId={hierarchyColumnId}
              childrenOf={tree.childrenOf}
              isCollapsed={isCollapsed}
              onToggleNode={toggleNode}
              nodeTotal={nodeTotal}
              highlighted={highlighted}
              onRowClick={(row) => {
                setAutoHighlight(row.id);
                props.onRowClick?.(row);
              }}
              onRowDoubleClick={(row) => {
                if (props.onRowOpen) props.onRowOpen(row);
                else if (props.onEditRow && rowActions.canEdit(row)) props.onEditRow(row);
              }}
              selectMode={selectMode}
              selectedIds={selectedIds}
              onToggleRow={toggleRow}
              hasRowActions={hasRowActions}
              renderActions={rowActions.render}
              emptyLabel={t.emptyLabel}
              selectRowLabel={sharedTexts.selectRow}
              nodeLabels={{ expand: t.expandNode, collapse: t.collapseNode }}
            />
          </TableBody>
          {hasTotals && visible.length > 0 ? (
            <TreeGridTotals
              shown={shown}
              hierarchyColumnId={hierarchyColumnId}
              totals={grandTotals}
              label={t.totalLabel}
              selectMode={selectMode}
              hasRowActions={hasRowActions}
            />
          ) : null}
        </Table>
      </ZoomGrid>
      {rowActions.confirmDialog}
    </div>
  );
}
