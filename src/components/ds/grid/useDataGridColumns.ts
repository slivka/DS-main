/**
 * Sloupce DataGrid.
 * Vlastní: sloupec Kniha, definice pro uložení (zamčené připnuté, akce a pobočka), pořadí
 * zobrazených sloupců (kniha, pobočka, připnuté, ostatní, vpravo ukotvené) a kompaktní sloupce.
 * Nesmí: znát doménová id – sady připnutých a kompaktních sloupců dostává.
 */
import { useMemo } from "react";

import { useGridColumns } from "./grid-columns";
import {
  createGridBookColumn,
  GRID_BOOK_COLUMN_ID,
  placeGridBookColumnFirst,
  type GridBookConfig,
} from "./grid-context-bar";
import { isBranchColumn, isCompactColumn } from "./grid-column-presets";
import type { DataGridColumn } from "./data-grid-types";

/** Stav sloupců DataGrid nad `useGridColumns`. */
export function useDataGridColumns<Row>(
  storageKey: string,
  columns: DataGridColumn<Row>[],
  book: GridBookConfig<Row> | undefined,
  pinnedIds: readonly string[],
  compactIds: readonly string[],
) {
  const pinned = useMemo(() => new Set(pinnedIds), [pinnedIds]);
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
  const shown = useMemo(() => {
    const list = cols.columns
      .filter((c) => cols.visible[c.id] || isBranchColumn(c))
      .flatMap((c) => byId.get(c.id) ?? []);
    const books = list.filter((c) => c.id === GRID_BOOK_COLUMN_ID);
    const branch = list.filter((c) => isBranchColumn(c));
    const rest = list.filter((c) => !isBranchColumn(c) && c.id !== GRID_BOOK_COLUMN_ID);
    const pinnedCols = rest.filter((c) => pinned.has(c.id));
    const middle = rest.filter((c) => !pinned.has(c.id) && !c.pinRight);
    const right = rest.filter((c) => !pinned.has(c.id) && c.pinRight);
    return placeGridBookColumnFirst([...books, ...branch, ...pinnedCols, ...middle, ...right]);
  }, [cols.columns, cols.visible, byId, pinned]);
  const compact = useMemo(
    () => new Set(shown.filter((c) => isCompactColumn(c, compactIds)).map((c) => c.id)),
    [shown, compactIds],
  );
  return { effectiveColumns, cols, byId, shown, compact, pinned };
}
