/**
 * Sdílený datový grid aplikace.
 * Vlastní: skládání rámu, záhlaví a těla; hledání, autofiltry, řazení, stránkování, seskupení,
 * součty, export a tisk; virtualizaci řádků bez stránkování v režimu fill.
 * Nesmí: znát doménová id sloupců – připnuté a kompaktní sloupce dostává přes
 * `pinnedColumnIds` / `compactColumnIds` (výchozí sady v grid-column-presets.ts).
 */
import { useMemo, useRef, useState } from "react";
import { useDateTimePreferences } from "../../../lib/date-time-preferences";
import { usePageLayoutVariant } from "../layout/page-layout";
import { useGridPagination } from "./grid-pagination";
import { sortWithinSegments, useGridSort, useSortedRows } from "./grid-sort";
import { gridPrintParams } from "./grid-print";
import { useGridZoom, useWheelZoom } from "./grid-zoom";
import { useResolvedGridTexts } from "./grid-texts";
import { gridPeriodLabel } from "./grid-period";
import { requiredGridWidthAt100, useAutoGridZoom } from "./grid-auto-zoom";
import { useGridVirtual } from "./grid-virtual";
import { DEFAULT_COMPACT_COLUMNS, DEFAULT_PINNED_COLUMNS } from "./grid-column-presets";
import { useDataGridColumns } from "./useDataGridColumns";
import { useDataGridGroups } from "./useDataGridGroups";
import { useRowActions } from "./useRowActions";
import { useDataGridSelection } from "./useDataGridSelection";
import { useColumnDrag } from "./useColumnDrag";
import { useDataGridFilters } from "./useDataGridFilters";
import { type DataGridLayout } from "./DataGridHead";
import { cellText, buildExportData, totalCells as computeTotalCells } from "./data-grid-model";
import type { DataGridProps } from "./data-grid-types";

/** Odvodí sdílený model gridu bez změny řízení jeho stavu. */
export function useDataGridModel<Row>(props: DataGridProps<Row>) {
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
  const zoomKey =
    props.viewZoomKey ??
    (viewMode ? `view:${exportName ?? exportTitle ?? title ?? storageKey}` : storageKey);
  const autoZoom = (props.autoZoom ?? pageVariant === "form") && resolvedHeight === "auto";
  const zoomState = useGridZoom(zoomKey, { auto: autoZoom });
  const { zoom, setZoom, setAutoZoom, density } = zoomState;
  const blockRef = useRef<HTMLDivElement>(null);
  useWheelZoom(blockRef, setZoom, zoom);
  const { effectiveColumns, cols, byId, shown, compact, pinned } = useDataGridColumns(
    storageKey,
    columns,
    book,
    pinnedColumnIds,
    compactColumnIds,
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
  const sortedAll = useSortedRows(filter.filtered, sort, valueOf);
  const sortSegment = props.sortSegment;
  const sorted = useMemo(
    () =>
      sortSegment && sort.key
        ? sortWithinSegments(filter.filtered, sortedAll, sortSegment)
        : sortedAll,
    [filter.filtered, sortedAll, sortSegment, sort.key],
  );
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
        bold: cols.styles[c.id]?.bold,
        sample: rows.slice(0, 100).map((row) => cellText(c.value?.(row))),
      })),
      { select: selectMode, actions: hasRowActions },
    );
  }, [byId, cols.columns, cols.visible, cols.widths, cols.styles, rows, selectMode, hasRowActions]);
  useAutoGridZoom(blockRef, autoZoom, requiredWidthAt100, setAutoZoom, zoom, [
    cols.visible,
    cols.order,
    cols.widths,
    cols.styles,
    selectMode,
    hasRowActions,
  ]);
  const groups = useDataGridGroups({
    storageKey,
    groupable,
    defaultGroupBy,
    groupTotals,
    paginated,
    effectiveColumns,
    shown,
    pageRows,
    sorted,
    valueOf,
    texts,
    searching: Boolean(filter.search),
  });
  const { grouping, displayItems } = groups;
  const exportData = (forPrint = false) => {
    const data = buildExportData(
      shown,
      groups.exportItems(forPrint),
      grouping.active ? grouping.groups.length : null,
      forPrint,
      cols.styles,
    );
    return data;
  };

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
  const hasHeaderAbove = Boolean((showTitle && title) || period || book || contextRight);

  return {
    autoZoom,
    storageKey,
    resolvedHeight,
    title,
    showTitle,
    exportTitle,
    rows,
    rowKey,
    loading,
    error,
    onRowClick,
    period,
    book,
    contextRight,
    filterChips,
    viewMode,
    exportName,
    exportMeta,
    onEditRow,
    groupable,
    paginated,
    selectable,
    groupTotals,
    plain,
    hideToolbar,
    showTotalRow,
    className,
    texts,
    filtersOpen,
    setFiltersOpen,
    zoomState,
    zoom,
    setZoom,
    density,
    blockRef,
    cols,
    shown,
    compact,
    pinned,
    sort,
    filter,
    sorted,
    pagination,
    selection,
    selectMode,
    rowActions,
    groups,
    grouping,
    displayItems,
    exportData,
    virtual,
    activeFilterLabels,
    exportFilterLabels,
    printConfig,
    clearAll,
    drag,
    totals,
    hasTotals,
    groupTotalLabelIndex,
    layout,
    colSpan,
    hasHeaderAbove,
  };
}
