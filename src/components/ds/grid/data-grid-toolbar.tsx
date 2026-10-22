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
import { GroupBar, GroupControl } from "./grid-grouping";
import { GridTitleBar } from "./grid-title";
import { GridSelectionToggle } from "./grid-selection-toggle";
import { useResolvedGridTexts } from "./grid-texts";
import { gridPeriodLabel } from "./grid-period";
import { requiredGridWidthAt100, useAutoGridZoom } from "./grid-auto-zoom";
import { useGridVirtual } from "./grid-virtual";
import { DEFAULT_COMPACT_COLUMNS, DEFAULT_PINNED_COLUMNS } from "./grid-column-presets";
import { useDataGridColumns } from "./useDataGridColumns";
import { useDataGridGroups } from "./useDataGridGroups";
import { GridFrame } from "./GridFrame";
import { useRowActions } from "./useRowActions";
import { useDataGridSelection } from "./useDataGridSelection";
import { useColumnDrag } from "./useColumnDrag";
import { useDataGridFilters } from "./useDataGridFilters";
import { DataGridColGroup, DataGridHead, type DataGridLayout } from "./DataGridHead";
import { DataGridRows, DataGridSidePanel, DataGridSummary, DataGridTotals } from "./DataGridBody";
import { buildExportData, totalCells as computeTotalCells } from "./data-grid-model";
import type { DataGridColumn, DataGridProps } from "./data-grid-types";

import type { useDataGridModel } from "./use-data-grid-model";
/** Vnitřní nástroje používají jediný odvozený model gridu. */
export function DataGridToolbar<Row>({props, model}: {props: DataGridProps<Row>; model: ReturnType<typeof useDataGridModel<Row>>}) {
 const { storageKey, resolvedHeight, title, showTitle, exportTitle, rows, rowKey, loading, error, onRowClick, period, book, contextRight, filterChips, viewMode, exportName, exportMeta, onEditRow, groupable, paginated, selectable, groupTotals, plain, hideToolbar, showTotalRow, className, texts, filtersOpen, setFiltersOpen, zoomState, zoom, setZoom, density, blockRef, cols, shown, compact, pinned, sort, filter, sorted, pagination, selection, selectMode, rowActions, groups, grouping, displayItems, exportData, virtual, activeFilterLabels, exportFilterLabels, printConfig, clearAll, drag, totals, hasTotals, groupTotalLabelIndex, layout, colSpan, hasHeaderAbove } = model;
 return <>
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
          expand={groups.expand}
          asOf={props.asOf}
          toolbarLeft={props.toolbarLeft}
          panelToggle={props.panelToggle}
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
            columns={groups.allGroupColumns}
            dateColumns={groups.dateColumns}
            zoom={zoom}
            texts={texts}
          />
        ) : null}

 </>;
}
