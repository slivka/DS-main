/**
 * Sdílený datový grid aplikace.
 * Vlastní: skládání rámu, záhlaví a těla; hledání, autofiltry, řazení, stránkování, seskupení,
 * součty, export a tisk; virtualizaci řádků bez stránkování v režimu fill.
 * Nesmí: znát doménová id sloupců – připnuté a kompaktní sloupce dostává přes
 * `pinnedColumnIds` / `compactColumnIds` (výchozí sady v grid-column-presets.ts).
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { Table, TableBody } from "../../ui/table";
import { fmtAmount } from "../../../lib/format";
import { useDateTimePreferences } from "../../../lib/date-time-preferences";
import { cn } from "../../../lib/utils";
import { usePageLayoutVariant } from "../layout/page-layout";
import { GridPagination, useGridPagination } from "./grid-pagination";
import { useGridSort, useSortedRows } from "./grid-sort";
import { GridBody, GridErrorRow } from "./grid-states";
import { GridExport } from "./grid-export";
import { gridPrintParams } from "./grid-print";
import { GridZoomContext, ZoomGrid, useGridZoom, useWheelZoom } from "./grid-zoom";
import { useGridColumns } from "./grid-columns";
import {
  GroupBar,
  GroupControl,
  detectDateColumns,
  useGridGrouping,
  useGroupedRows,
} from "./grid-grouping";
import { insertGroupTotalRows } from "./grid-selection";
import { GridTitleBar } from "./grid-title";
import { GridExpandControls } from "./grid-toolbar";
import { GridSelectionToggle } from "./grid-selection-toggle";
import { useResolvedGridTexts } from "./grid-texts";
import {
  createGridBookColumn,
  GRID_BOOK_COLUMN_ID,
  placeGridBookColumnFirst,
} from "./grid-context-bar";
import { gridPeriodLabel } from "./grid-period";
import { requiredGridWidthAt100, useAutoGridZoom } from "./grid-auto-zoom";
import { useGridVirtual } from "./grid-virtual";
import {
  DEFAULT_COMPACT_COLUMNS,
  DEFAULT_PINNED_COLUMNS,
  isBranchColumn,
  isCompactColumn,
} from "./grid-column-presets";
import { GridFrame } from "./GridFrame";
import { useRowActions } from "./useRowActions";
import { useDataGridSelection } from "./useDataGridSelection";
import { useColumnDrag } from "./useColumnDrag";
import { useDataGridFilters } from "./useDataGridFilters";
import { DataGridColGroup, DataGridHead, type DataGridLayout } from "./DataGridHead";
import { DataGridRows, DataGridTotals } from "./DataGridBody";
import { buildExportData, totalCells as computeTotalCells } from "./data-grid-model";
import type { DataGridColumn, DataGridProps } from "./data-grid-types";

export type { DataGridColumn, DataGridFilterChip, DataGridProps } from "./data-grid-types";
export {
  DEFAULT_COMPACT_COLUMNS,
  DEFAULT_PINNED_COLUMNS,
  isPinnedColumn,
} from "./grid-column-presets";

/**
 * Sdílený grid celé aplikace – jednotná hlavička a lišta nástrojů
 * (hledání, filtry, export, výběr sloupců, seskupování, zoom a hustota),
 * řazení, stránkování a jednotné prázdné i chybové stavy.
 */
export function DataGrid<Row>(props: DataGridProps<Row>) {
  const {
    storageKey,
    height,
    title,
    showTitle = false,
    exportTitle,
    rows,
    columns,
    rowKey,
    loading,
    error,
    onRowClick,
    period,
    book,
    contextRight,
    filterChips = [],
    viewMode,
    exportName,
    exportMeta,
    defaultSort,
    onEditRow,
    groupable = true,
    defaultGroupBy,
    paginated = true,
    selectable,
    groupTotals = "header",
    plain,
    hideToolbar,
    showTotalRow = true,
    className,
    pinnedColumnIds = DEFAULT_PINNED_COLUMNS,
    compactColumnIds = DEFAULT_COMPACT_COLUMNS,
  } = props;
  const pageVariant = usePageLayoutVariant();
  const resolvedHeight = height ?? (pageVariant === "list" ? "fill" : "auto");
  const texts = useResolvedGridTexts(props.texts);
  useDateTimePreferences();
  const [filtersOpen, setFiltersOpen] = useState(props.defaultFiltersOpen ?? false);
  const [groupExpandDepth, setGroupExpandDepth] = useState<number | null>(null);
  const zoomKey =
    props.viewZoomKey ??
    (viewMode ? `view:${exportName ?? exportTitle ?? title ?? storageKey}` : storageKey);
  const autoZoom = (props.autoZoom ?? pageVariant === "form") && resolvedHeight === "auto";
  const zoomState = useGridZoom(zoomKey, { auto: autoZoom });
  const { zoom, setZoom, setAutoZoom, density } = zoomState;
  const blockRef = useRef<HTMLDivElement>(null);
  useWheelZoom(blockRef, setZoom, zoom);
  const pinned = useMemo(() => new Set(pinnedColumnIds), [pinnedColumnIds]);

  const effectiveColumns = useMemo<DataGridColumn<Row>[]>(
    () =>
      book?.value === "all" && book.getRowBookId
        ? [createGridBookColumn(book), ...columns]
        : columns,
    [book, columns],
  );
  const colDefs = useMemo(
    () =>
      effectiveColumns.map((c) => ({
        id: c.id,
        label: c.label,
        // Sloupec akcí se nesmí dát skrýt; sloupec pobočky řídí přepínač poboček.
        locked:
          pinned.has(c.id) || c.id === "actions" || c.label === "Akcie" || isBranchColumn(c)
            ? true
            : c.locked,
        ...(c.defaultVisible !== undefined ? { defaultVisible: c.defaultVisible } : {}),
        ...(c.section !== undefined ? { section: c.section } : {}),
        ...(c.branchVisibility !== undefined ? { branchVisibility: c.branchVisibility } : {}),
        ...(c.transient !== undefined ? { transient: c.transient } : {}),
        ...(c.disableToggleReason !== undefined
          ? { disableToggleReason: c.disableToggleReason }
          : {}),
        align: (c.align ?? (c.numeric ? "right" : "left")) as "left" | "right" | "center",
      })),
    [effectiveColumns, pinned],
  );
  const cols = useGridColumns(storageKey, colDefs);
  const byId = useMemo(() => new Map(effectiveColumns.map((c) => [c.id, c])), [effectiveColumns]);
  /** Sloupce v uloženém pořadí a jen viditelné; pobočka, připnuté, ostatní, vpravo ukotvené. */
  const shown = useMemo(() => {
    const list = cols.columns
      .filter((c) => cols.visible[c.id] || isBranchColumn(c))
      .flatMap((c) => byId.get(c.id) ?? []);
    const books = list.filter((c) => c.id === GRID_BOOK_COLUMN_ID);
    const branch = list.filter((c) => isBranchColumn(c));
    const rest = list.filter((c) => !isBranchColumn(c) && c.id !== GRID_BOOK_COLUMN_ID);
    const pinnedCols = rest.filter((c) => pinned.has(c.id));
    const middle = rest.filter((c) => !pinned.has(c.id) && !c.pinRight);
    const pinnedRight = rest.filter((c) => !pinned.has(c.id) && c.pinRight);
    return placeGridBookColumnFirst([
      ...books,
      ...branch,
      ...pinnedCols,
      ...middle,
      ...pinnedRight,
    ]);
  }, [cols.columns, cols.visible, byId, pinned]);
  const compact = useMemo(
    () => new Set(shown.filter((c) => isCompactColumn(c, compactColumnIds)).map((c) => c.id)),
    [shown, compactColumnIds],
  );

  const sort = useGridSort<string>(
    storageKey,
    defaultSort === null ? null : (defaultSort ?? effectiveColumns[0]?.id ?? null),
  );
  const valueOf = (row: Row, id: string) => {
    const col = byId.get(id);
    if (!col) return null;
    return col.sortValue ? col.sortValue(row) : col.value ? col.value(row) : null;
  };
  const filter = useDataGridFilters({
    rows,
    columns: effectiveColumns,
    shown,
    byId,
    texts,
    onSearchChange: props.onSearchChange,
    onColumnFiltersChange: props.onColumnFiltersChange,
  });
  const sorted = useSortedRows(filter.filtered, sort, valueOf);
  const pagination = useGridPagination(storageKey, sorted, { defaultPageSize: 50 });
  /** Bez stránkování zobrazujeme (a seskupujeme) všechny filtrované řádky. */
  const pageRows = paginated ? pagination.rows : sorted;
  const selection = useDataGridSelection({
    rows,
    visibleRows: sorted,
    rowKey,
    selectMode: props.selectMode,
    selectedKeys: props.selectedKeys,
    onSelectedKeysChange: props.onSelectedKeysChange,
    onSelectedRowsChange: props.onSelectedRowsChange,
  });
  const selectMode = selection.selectMode;
  const rowActions = useRowActions(props, texts, selectMode);
  const hasRowActions = rowActions.visible;

  const requiredWidthAt100 = useMemo(() => {
    const visible = cols.columns
      .filter((c) => cols.visible[c.id] && c.id !== "actions")
      .flatMap((c) => byId.get(c.id) ?? []);
    return requiredGridWidthAt100(
      visible.map((c) => ({
        label: typeof c.label === "string" ? c.label : c.id,
        width: cols.widths[c.id] ?? c.width,
      })),
      { select: selectMode, actions: hasRowActions },
    );
  }, [byId, cols.columns, cols.visible, cols.widths, selectMode, hasRowActions]);
  useAutoGridZoom(blockRef, autoZoom, requiredWidthAt100, setAutoZoom, zoom, [
    cols.visible,
    cols.order,
    cols.widths,
    selectMode,
    hasRowActions,
  ]);
  const defaultGroups = useMemo(
    () => (defaultGroupBy ? [{ id: defaultGroupBy, granularity: "month" as const }] : []),
    [defaultGroupBy],
  );
  const grouping = useGridGrouping(storageKey, { disabled: !groupable, defaultGroups });
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && groupTotals === "row" && paginated) {
      console.warn(
        'DataGrid: groupTotals="row" patří k paginated={false}; se stránkováním jsou součty skupin jen za aktuální stránku.',
      );
    }
  }, [groupTotals, paginated]);

  /** Seskupovací sloupec může být skrytý; jeho popisek proto bereme z úplné definice. */
  const allGroupColumns = useMemo(
    () => effectiveColumns.map((c) => ({ id: c.id, label: c.label })),
    [effectiveColumns],
  );
  /** Součty skupin jen nad viditelnými sloupci; aktivní skrytý sloupec kvůli popisku. */
  const groupColumns = useMemo(
    () => [
      ...shown.map((c) => ({ id: c.id, label: c.label })),
      ...grouping.groups
        .filter((group) => !shown.some((column) => column.id === group.id))
        .map(
          (group) =>
            allGroupColumns.find((column) => column.id === group.id) ?? {
              id: group.id,
              label: group.id,
            },
        ),
    ],
    [shown, grouping.groups, allGroupColumns],
  );
  const dateColumns = useMemo(
    () => detectDateColumns(pageRows, groupColumns, valueOf),
    // valueOf je odvozená z byId, který se mění se sloupci (groupColumns).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pageRows, groupColumns],
  );
  const grouped = useGroupedRows(pageRows, grouping, groupColumns, valueOf, texts);
  const displayItems = useMemo(
    () => (groupTotals === "row" && grouping.active ? insertGroupTotalRows(grouped) : grouped),
    [grouped, groupTotals, grouping.active],
  );
  const groupKeys = grouped.flatMap((item) => (item.type === "group" ? [item.key] : []));
  const exportGrouped = useGroupedRows(
    sorted,
    { ...grouping, collapsed: [] },
    groupColumns,
    valueOf,
    texts,
  );
  const printGrouped = useGroupedRows(sorted, grouping, groupColumns, valueOf, texts);
  const exportData = (forPrint = false) =>
    buildExportData(
      shown,
      grouping.active
        ? forPrint
          ? printGrouped
          : exportGrouped
        : sorted.map((row) => ({ type: "row" as const, row })),
      grouping.active ? grouping.groups.length : null,
      forPrint,
    );
  // Virtualizace jen bez stránkování; v režimu auto ji hook sám vypne.
  const virtual = useGridVirtual(displayItems.length, {
    zoom,
    density,
    height: paginated ? "auto" : resolvedHeight,
  });

  const activeFilterLabels = [
    ...filterChips.map((c) => c.label),
    ...filter.columnFilterLabels,
    ...shown.flatMap((c) => (c.filterActive && c.filterLabel ? [c.filterLabel] : [])),
  ];
  const exportFilterLabels = [
    ...(exportMeta?.filters ?? []),
    ...(period ? [gridPeriodLabel(period.value)] : []),
    ...(filter.search.trim() ? [texts.exportSearch(filter.search.trim())] : []),
    ...activeFilterLabels,
  ];
  const printConfig = props.printContext
    ? {
        context: props.printContext,
        title:
          props.printTitle ??
          exportTitle ??
          (typeof title === "string" && title ? title : (exportName ?? storageKey)),
        params: gridPrintParams({
          book,
          period: period?.value,
          search: filter.search,
          filters: [...(exportMeta?.filters ?? []), ...activeFilterLabels],
          asOf: props.asOf ? { enabled: props.asOf.enabled, value: props.asOf.value } : undefined,
          extra: props.printParams,
        }),
      }
    : undefined;
  const clearAll = () => {
    filter.clear();
    props.onClearFilters?.();
  };
  const drag = useColumnDrag(cols.reorder, grouping.enabled);

  /** Součty počítáme ze všech filtrovaných řádků, nejen z aktuální strany. */
  const totals = useMemo(
    () => computeTotalCells(shown, sorted, selection.selectedRows),
    [shown, sorted, selection.selectedRows],
  );
  const hasTotals = totals.some((v) => v !== null && v !== undefined && v !== "");
  const groupTotalLabelIndex = Math.max(
    0,
    shown.findIndex((c) => !c.numeric && (c.total ?? "none") === "none"),
  );
  const layout: DataGridLayout<Row> = { shown, cols, pinned, compact, selectMode, hasRowActions };
  const colSpan = shown.length + (hasRowActions ? 1 : 0) + (selectMode ? 1 : 0);
  const expandLevel = (depth: number) => {
    setGroupExpandDepth(depth);
    if (depth > grouping.groups.length) grouping.expandAll();
  };
  const collapseGroups = () => {
    setGroupExpandDepth(0);
    grouping.collapseAll(groupKeys);
  };
  const levels = grouping.groups.map((group, index) => ({
    id: group.id,
    label: texts.expandLevel(
      index + 1,
      allGroupColumns.find((column) => column.id === group.id)?.label ?? group.id,
    ),
    depth: index + 1,
  }));
  const hasHeaderAbove = Boolean((showTitle && title) || period || book || contextRight);

  return (
    <GridZoomContext.Provider value={{ zoom, setZoom, density }}>
      <div
        ref={blockRef}
        data-slot="data-grid"
        data-grid-height={resolvedHeight}
        className={cn(
          "@container flex w-full min-w-0 flex-col",
          resolvedHeight === "fill" && "min-h-0 flex-1",
          plain
            ? "max-w-full overflow-hidden"
            : "grid-connected-block overflow-hidden rounded-lg border shadow-panel",
        )}
      >
        {showTitle && title ? (
          <GridTitleBar title={title} zoom={zoom} hideMark={props.hideTitleMark} />
        ) : null}
        <GridFrame
          zoom={zoomState}
          texts={texts}
          context={{
            period,
            book,
            right: contextRight,
            className: cn("border-t-0", !showTitle || !title ? "rounded-t-lg" : "rounded-t-none"),
          }}
          hideToolbar={hideToolbar}
          toolbarClassName={`border-b-0 ${
            hasHeaderAbove
              ? plain
                ? "rounded-t-lg shadow-none"
                : "rounded-t-none border-t-0 shadow-none"
              : plain
                ? "rounded-t-lg shadow-none"
                : "rounded-t-lg shadow-panel"
          }`}
          addAction={props.addAction}
          view={
            viewMode && props.onViewModeChange
              ? { mode: viewMode, onChange: props.onViewModeChange }
              : undefined
          }
          expand={
            grouping.active
              ? {
                  separator: true,
                  wide: (
                    <GridExpandControls
                      levels={[
                        ...levels,
                        ...(grouping.groups.length > 1
                          ? [{ id: "all", label: texts.all, depth: grouping.groups.length + 1 }]
                          : []),
                      ]}
                      activeDepth={groupExpandDepth}
                      disabled={Boolean(filter.search)}
                      onExpand={(depth) => {
                        expandLevel(depth);
                        if (depth <= grouping.groups.length)
                          grouping.collapseAll(
                            grouped.flatMap((item) =>
                              item.type === "group" && item.level >= depth ? [item.key] : [],
                            ),
                          );
                      }}
                      onCollapse={collapseGroups}
                      expandLabel={texts.expand}
                      collapseLabel={texts.collapse}
                    />
                  ),
                  compact: (
                    <GridExpandControls
                      levels={levels}
                      activeDepth={groupExpandDepth}
                      disabled={Boolean(filter.search)}
                      onExpand={expandLevel}
                      onCollapse={collapseGroups}
                    />
                  ),
                }
              : undefined
          }
          asOf={props.asOf}
          toolbarLeft={props.toolbarLeft}
          search={{ value: filter.search, onChange: filter.setSearch }}
          {...(props.filters
            ? {
                filters: {
                  content: props.filters,
                  open: filtersOpen,
                  onOpenChange: setFiltersOpen,
                  onClear: props.onClearFilters,
                  activeCount: filterChips.length + filter.columnFilterCount,
                  activeLabels: activeFilterLabels,
                  defaultLabels: props.defaultFilters ?? [],
                },
              }
            : {})}
          filtersOpen={filtersOpen}
          filterChips={filterChips}
          onClearFilters={props.onClearFilters}
          groupControl={groupable ? <GroupControl grouping={grouping} texts={texts} /> : null}
          columnPicker={{
            columns: cols.columns
              .filter((c) => !c.transient)
              .map((c) => ({
                id: c.id,
                label: c.label,
                ...(c.locked !== undefined ? { locked: c.locked } : {}),
                ...(c.disableToggleReason !== undefined
                  ? { disableToggleReason: c.disableToggleReason }
                  : {}),
                ...(pinned.has(c.id) ? { pinned: true } : {}),
                ...(c.section !== undefined ? { section: c.section } : {}),
              })),
            visible: cols.columnVisible,
            onToggle: cols.toggle,
            onReorder: cols.reorder,
            onReset: cols.reset,
            onSaveDefault: cols.saveDefault,
            onClearDefault: cols.clearDefault,
            hasCustomDefault: cols.hasCustomDefault,
            hiddenSections: cols.hiddenSections,
            onToggleSection: cols.toggleSection,
            views: cols.views,
            title: texts.columnsTitle,
          }}
          dataGroup={
            <>
              {selectable && !props.hideSelectionToggle ? (
                <GridSelectionToggle
                  active={selectMode}
                  count={selection.selectedRows.length}
                  zoom={zoom}
                  texts={texts}
                  onToggle={(next) => (next ? selection.enter() : selection.exit())}
                />
              ) : null}
              {props.actions}
              <GridExport
                getData={() => exportData()}
                getPrintData={() => exportData(true)}
                print={printConfig}
                fileName={exportName ?? storageKey}
                title={exportTitle ?? (typeof title === "string" ? title : "")}
                zoom={zoom}
                texts={texts}
                meta={{
                  ...exportMeta,
                  ...(exportFilterLabels.length ? { filters: exportFilterLabels } : {}),
                }}
                pdfExport={props.pdfExport}
                extraExports={props.extraExports ?? []}
              />
            </>
          }
          moreActions={props.moreActions ?? []}
          {...(props.onRefresh
            ? { refresh: { onRefresh: props.onRefresh, refreshing: props.refreshing } }
            : {})}
          selection={
            selectMode
              ? {
                  count: fmtAmount(selection.selectedRows.length, 0),
                  actions: props.selectionActions?.(selection.selectedRows, selection.clear),
                  className:
                    "flex flex-wrap border border-t-0 border-l-4 border-l-primary bg-secondary/50",
                }
              : null
          }
        />
        {groupable ? (
          <GroupBar
            grouping={grouping}
            columns={allGroupColumns}
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
            scrollRef={virtual.scrollRef}
            overflowFallback={autoZoom && zoom <= 0.75}
            className={`grid-table-surface min-w-0 max-w-full flex-1 ${hideToolbar ? "rounded-none border-t-0 !shadow-none" : "rounded-t-none border-t-0"} ${plain ? "rounded-b-lg !shadow-none" : paginated ? "rounded-b-none! border-b-0" : "rounded-b-none!"} ${className ?? ""}`}
            {...(loading !== undefined ? { loading } : {})}
          >
            <Table className="w-full">
              <DataGridColGroup layout={layout} />
              <DataGridHead
                layout={layout}
                texts={texts}
                zoom={zoom}
                sort={sort}
                columnFilters={props.columnFilters ?? true}
                filterOptions={filter.filterOptions}
                colFilters={filter.colFilters}
                onColFilterChange={filter.setColFilter}
                drag={drag}
                allSelected={selection.allSelected}
                onToggleAll={selection.toggleAll}
                actionsLabel={props.actionsLabel}
                plain={plain}
              />
              <TableBody>
                {error ? (
                  <GridErrorRow
                    colSpan={colSpan}
                    error={error}
                    onRetry={props.onRetry}
                    texts={texts}
                  />
                ) : (
                  <GridBody
                    loading={loading}
                    empty={sorted.length === 0}
                    cols={colSpan}
                    title={
                      filter.search
                        ? texts.searchEmptyTitle
                        : (props.emptyTitle ?? texts.emptyTitle)
                    }
                    description={filter.search ? undefined : props.emptyDescription}
                    filtered={
                      Boolean(filter.search) ||
                      filterChips.length > 0 ||
                      filter.columnFilterCount > 0
                    }
                    onClearFilter={clearAll}
                    actionLabel={props.emptyActionLabel}
                    onAction={props.onEmptyAction}
                    texts={texts}
                  >
                    <DataGridRows
                      layout={layout}
                      items={displayItems}
                      virtual={virtual}
                      texts={texts}
                      rowKey={rowKey}
                      keySet={selection.keySet}
                      onToggleKey={selection.toggleKey}
                      groupTotals={groupTotals}
                      groupTotalLabelIndex={groupTotalLabelIndex}
                      onToggleGroup={grouping.toggleKey}
                      onRowClick={onRowClick}
                      onRowOpen={
                        onEditRow || onRowClick
                          ? (row) => {
                              if (onEditRow && rowActions.canEdit(row)) onEditRow(row);
                              else onRowClick?.(row);
                            }
                          : undefined
                      }
                      clickable={Boolean(onEditRow || onRowClick || selectMode)}
                      activeRowKey={props.activeRowKey}
                      rowClassName={props.rowClassName}
                      renderActions={rowActions.render}
                    />
                  </GridBody>
                )}
              </TableBody>
              {showTotalRow && hasTotals && !error && sorted.length > 0 ? (
                <DataGridTotals
                  layout={layout}
                  cells={totals}
                  labelIndex={totals.findIndex((v) => v === null)}
                  label={texts.total}
                />
              ) : null}
            </Table>
          </ZoomGrid>
          {props.sidePanel ? (
            <aside
              data-grid-side-panel
              className="w-[24rem] shrink-0 overflow-y-auto border border-l-0 border-t-0 bg-card p-4"
              aria-label={texts.sidePanelLabel}
            >
              {props.sidePanel}
            </aside>
          ) : null}
        </div>

        {selectMode && props.selectionSummary ? (
          <div
            data-slot="grid-selection-summary"
            className="flex flex-wrap items-center gap-2 border border-t-0 bg-secondary/50 px-2 py-1.5 text-sm"
          >
            {props.selectionSummary(selection.selectedRows)}
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
        {rowActions.confirmDialog}
      </div>
    </GridZoomContext.Provider>
  );
}
