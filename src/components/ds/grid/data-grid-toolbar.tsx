/**
 * Sdílený datový grid aplikace.
 * Vlastní: skládání rámu, záhlaví a těla; hledání, autofiltry, řazení, stránkování, seskupení,
 * součty, export a tisk; virtualizaci řádků bez stránkování v režimu fill.
 * Nesmí: znát doménová id sloupců – připnuté a kompaktní sloupce dostává přes
 * `pinnedColumnIds` / `compactColumnIds` (výchozí sady v grid-column-presets.ts).
 */

import { fmtAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { GridExport } from "./grid-export";
import { GroupBar, GroupControl } from "./grid-grouping";
import { GridSelectionToggle } from "./grid-selection-toggle";
import { GridFrame } from "./GridFrame";
import type { DataGridProps } from "./data-grid-types";
import type { useDataGridModel } from "./use-data-grid-model";
/** Vnitřní nástroje používají jediný odvozený model gridu. */
export function DataGridToolbar<Row>({
  props,
  model,
}: {
  props: DataGridProps<Row>;
  model: ReturnType<typeof useDataGridModel<Row>>;
}) {
  const {
    storageKey,
    title,
    showTitle,
    exportTitle,
    period,
    book,
    contextRight,
    filterChips,
    viewMode,
    exportName,
    exportMeta,
    groupable,
    selectable,
    plain,
    hideToolbar,
    texts,
    filtersOpen,
    setFiltersOpen,
    zoomState,
    zoom,
    cols,
    pinned,
    filter,
    selection,
    selectMode,
    groups,
    grouping,
    exportData,
    activeFilterLabels,
    exportFilterLabels,
    printConfig,
    hasHeaderAbove,
  } = model;
  return (
    <>
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
              styleable: c.styleable,
              ...(c.locked !== undefined ? { locked: c.locked } : {}),
              ...(c.disableToggleReason !== undefined
                ? { disableToggleReason: c.disableToggleReason }
                : {}),
              ...(pinned.has(c.id) ? { pinned: true } : {}),
              ...(c.section !== undefined ? { section: c.section } : {}),
            })),
          styles: cols.styles,
          onColumnStyleChange: cols.setColumnStyle,
          onClearColumnStyles: cols.clearColumnStyles,
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
    </>
  );
}
