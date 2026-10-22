/**
 * Sdílený datový grid aplikace.
 * Vlastní: skládání rámu, záhlaví a těla; hledání, autofiltry, řazení, stránkování, seskupení,
 * součty, export a tisk; virtualizaci řádků bez stránkování v režimu fill.
 * Nesmí: znát doménová id sloupců – připnuté a kompaktní sloupce dostává přes
 * `pinnedColumnIds` / `compactColumnIds` (výchozí sady v grid-column-presets.ts).
 */

import { Table, TableBody } from "../../ui/table";

import { cn } from "../../../lib/utils";

import { GridPagination } from "./grid-pagination";

import { GridBody, GridErrorRow } from "./grid-states";

import { GridZoomContext, ZoomGrid } from "./grid-zoom";

import { GridTitleBar } from "./grid-title";

import { DataGridColGroup, DataGridHead } from "./DataGridHead";
import { DataGridRows, DataGridSidePanel, DataGridSummary, DataGridTotals } from "./DataGridBody";

import type { DataGridProps } from "./data-grid-types";

export type { DataGridColumn, DataGridFilterChip, DataGridProps } from "./data-grid-types";
export {
  DEFAULT_COMPACT_COLUMNS,
  DEFAULT_PINNED_COLUMNS,
  isPinnedColumn,
} from "./grid-column-presets";

import { useDataGridModel } from "./use-data-grid-model";
import { DataGridToolbar } from "./data-grid-toolbar";
/** Sdílený grid skládá jediný model, nástroje a tělo. */
export function DataGrid<Row>(props: DataGridProps<Row>) {
  const model = useDataGridModel(props);
  const {
    autoZoom,
    resolvedHeight,
    title,
    showTitle,
    rowKey,
    loading,
    error,
    onRowClick,
    filterChips,
    onEditRow,
    paginated,
    groupTotals,
    plain,
    hideToolbar,
    showTotalRow,
    className,
    texts,
    zoom,
    setZoom,
    density,
    blockRef,
    sort,
    filter,
    sorted,
    pagination,
    selection,
    selectMode,
    rowActions,
    grouping,
    displayItems,
    virtual,
    clearAll,
    drag,
    totals,
    hasTotals,
    groupTotalLabelIndex,
    layout,
    colSpan,
  } = model;
  return (
    <GridZoomContext.Provider value={{ zoom, setZoom, density }}>
      <div
        ref={blockRef}
        data-slot="data-grid"
        data-grid-height={resolvedHeight}
        className={cn(
          "@container flex w-full min-w-0 flex-col",
          resolvedHeight === "fill" && "min-h-0 flex-1",
          // Automatická výška se ve sloupcovém flexu (AppShell) nesmí smrštit pod obsah.
          resolvedHeight === "auto" && "shrink-0",
          plain
            ? "max-w-full overflow-hidden"
            : "grid-connected-block overflow-hidden rounded-lg border shadow-panel",
        )}
      >
        {showTitle && title ? (
          <GridTitleBar title={title} zoom={zoom} hideMark={props.hideTitleMark} />
        ) : null}
        <DataGridToolbar props={props} model={model} />
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
                      onIndicatorClick={props.onIndicatorClick}
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
                      openInSelectMode={Boolean(props.onRowOpen)}
                      onRowOpen={
                        props.onRowOpen || onEditRow || onRowClick
                          ? (row) => {
                              if (props.onRowOpen) props.onRowOpen(row);
                              else if (onEditRow && rowActions.canEdit(row)) onEditRow(row);
                              else onRowClick?.(row);
                            }
                          : undefined
                      }
                      clickable={Boolean(props.onRowOpen || onEditRow || onRowClick || selectMode)}
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
          <DataGridSidePanel label={texts.sidePanelLabel}>{props.sidePanel}</DataGridSidePanel>
        </div>
        {selectMode && props.selectionSummary ? (
          <DataGridSummary>{props.selectionSummary(selection.selectedRows)}</DataGridSummary>
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
