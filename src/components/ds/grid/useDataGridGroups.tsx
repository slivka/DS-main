/**
 * Seskupení řádků DataGrid.
 * Vlastní: stav seskupení, sloupce skupin, datumové sloupce, seskupené položky (se součty skupin
 * jako řádkem), položky pro export a tisk a ovládání úrovní rozbalení v liště.
 * Nesmí: zužovat součty skupin na okno virtualizace – skupiny se počítají nad všemi řádky stránky.
 */
import { useEffect, useMemo, useState } from "react";

import { detectDateColumns, useGridGrouping, useGroupedRows } from "./grid-grouping";
import { insertGroupTotalRows } from "./grid-selection";
import type { GridTexts } from "./grid-texts";
import { GridExpandControls } from "./grid-toolbar";
import type { DataGridColumn } from "./data-grid-types";

/** Vstup hooku seskupení. */
export interface DataGridGroupsOptions<Row> {
  storageKey: string;
  groupable: boolean;
  defaultGroupBy?: string | undefined;
  groupTotals: "header" | "row";
  paginated: boolean;
  effectiveColumns: DataGridColumn<Row>[];
  shown: DataGridColumn<Row>[];
  /** Řádky aktuální stránky (bez stránkování všechny). */
  pageRows: Row[];
  /** Všechny seřazené řádky (export, tisk). */
  sorted: Row[];
  valueOf: (row: Row, id: string) => unknown;
  texts: GridTexts;
  /** Probíhá hledání – úrovně rozbalení jsou zakázané. */
  searching: boolean;
}

/** Stav a položky seskupení DataGrid. */
export function useDataGridGroups<Row>(o: DataGridGroupsOptions<Row>) {
  const { texts, shown, groupTotals, paginated } = o;
  const [depth, setDepth] = useState<number | null>(null);
  const defaultGroups = useMemo(
    () => (o.defaultGroupBy ? [{ id: o.defaultGroupBy, granularity: "month" as const }] : []),
    [o.defaultGroupBy],
  );
  const grouping = useGridGrouping(o.storageKey, { disabled: !o.groupable, defaultGroups });
  // Vývojové varování je vedlejší efekt mimo React (konzole).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && groupTotals === "row" && paginated) {
      console.warn(
        'DataGrid: groupTotals="row" patří k paginated={false}; se stránkováním jsou součty skupin jen za aktuální stránku.',
      );
    }
  }, [groupTotals, paginated]);
  /** Seskupovací sloupec může být skrytý; jeho popisek proto bereme z úplné definice. */
  const allGroupColumns = useMemo(
    () => o.effectiveColumns.map((c) => ({ id: c.id, label: c.label })),
    [o.effectiveColumns],
  );
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
    () => detectDateColumns(o.pageRows, groupColumns, o.valueOf),
    // valueOf se mění se sloupci (groupColumns).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [o.pageRows, groupColumns],
  );
  const grouped = useGroupedRows(o.pageRows, grouping, groupColumns, o.valueOf, texts);
  const displayItems = useMemo(
    () => (groupTotals === "row" && grouping.active ? insertGroupTotalRows(grouped) : grouped),
    [grouped, groupTotals, grouping.active],
  );
  const groupKeys = grouped.flatMap((item) => (item.type === "group" ? [item.key] : []));
  const exportGrouped = useGroupedRows(
    o.sorted,
    { ...grouping, collapsed: [] },
    groupColumns,
    o.valueOf,
    texts,
  );
  const printGrouped = useGroupedRows(o.sorted, grouping, groupColumns, o.valueOf, texts);
  const exportItems = (forPrint: boolean) =>
    grouping.active
      ? forPrint
        ? printGrouped
        : exportGrouped
      : o.sorted.map((row) => ({ type: "row" as const, row }));

  const expandLevel = (next: number) => {
    setDepth(next);
    if (next > grouping.groups.length) grouping.expandAll();
  };
  const collapse = () => {
    setDepth(0);
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
  const expand = grouping.active
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
            activeDepth={depth}
            disabled={o.searching}
            onExpand={(next) => {
              expandLevel(next);
              if (next <= grouping.groups.length)
                grouping.collapseAll(
                  grouped.flatMap((item) =>
                    item.type === "group" && item.level >= next ? [item.key] : [],
                  ),
                );
            }}
            onCollapse={collapse}
            expandLabel={texts.expand}
            collapseLabel={texts.collapse}
          />
        ),
        compact: (
          <GridExpandControls
            levels={levels}
            activeDepth={depth}
            disabled={o.searching}
            onExpand={expandLevel}
            onCollapse={collapse}
          />
        ),
      }
    : undefined;
  return { grouping, allGroupColumns, dateColumns, displayItems, exportItems, expand };
}
