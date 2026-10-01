/**
 * Hromadný výběr řádků DataGrid.
 * Vlastní: řízený i vlastní režim výběru a výběr klíčů, vyřazení klíčů neexistujících řádků,
 * výběr všech viditelných, oznámení vybraných řádků rodiči.
 * Nesmí: zužovat výběr na stránku nebo okno virtualizace – vybrané řádky se berou z celé `rows`.
 */
import { useEffect, useMemo, useRef, useState } from "react";

import { resolveSelectedRows, toggleVisibleSelection } from "./grid-selection";

/** Vstup hooku výběru. */
export interface DataGridSelectionOptions<Row> {
  /** Všechny řádky gridu. */
  rows: Row[];
  /** Řádky po hledání a filtrech (výběr všech je bere jako viditelné). */
  visibleRows: Row[];
  /** Klíč řádku. */
  rowKey: (row: Row) => string;
  /** Řízený režim výběru. */
  selectMode?: boolean | undefined;
  /** Řízené klíče výběru. */
  selectedKeys?: string[] | undefined;
  /** Změna klíčů výběru. */
  onSelectedKeysChange?: ((keys: string[]) => void) | undefined;
  /** Oznámení vybraných řádků. */
  onSelectedRowsChange?: ((rows: Row[]) => void) | undefined;
}

/** Stav a obsluhy výběru řádků. */
export function useDataGridSelection<Row>({
  rows,
  visibleRows,
  rowKey,
  selectMode: controlledSelectMode,
  selectedKeys: controlledSelectedKeys,
  onSelectedKeysChange,
  onSelectedRowsChange,
}: DataGridSelectionOptions<Row>) {
  const [ownSelectMode, setOwnSelectMode] = useState(false);
  const selectMode = controlledSelectMode ?? ownSelectMode;
  const [ownKeys, setOwnKeys] = useState<Set<string>>(new Set());
  const keySet = useMemo(
    () => (controlledSelectedKeys ? new Set(controlledSelectedKeys) : ownKeys),
    [controlledSelectedKeys, ownKeys],
  );
  const selectedRows = useMemo(
    () => resolveSelectedRows(rows, keySet, rowKey),
    // rowKey bývá vložená funkce; výběr se mění jen s řádky a klíči.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, keySet],
  );
  const selectedRowsChangeRef = useRef(onSelectedRowsChange);
  selectedRowsChangeRef.current = onSelectedRowsChange;
  // Oznámení rodiči je synchronizace s vnějškem (callback z props), ne odvozený stav.
  useEffect(() => {
    selectedRowsChangeRef.current?.(selectedRows);
  }, [selectedRows]);
  const update = (next: Set<string>) => {
    // Klíče řádků, které už v `rows` nejsou, vyřadíme (skryté filtrem zůstávají).
    const existing = new Set(rows.map((r) => rowKey(r)));
    const pruned = new Set([...next].filter((key) => existing.has(key)));
    if (!controlledSelectedKeys) setOwnKeys(pruned);
    onSelectedKeysChange?.([...pruned]);
  };
  useEffect(() => {
    if (!selectMode && !controlledSelectedKeys) setOwnKeys(new Set());
    // Výběr se vyprázdní jen při opuštění režimu výběru.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectMode]);
  const clear = () => update(new Set());
  const toggleKey = (key: string) => {
    const next = new Set(keySet);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    update(next);
  };
  const visibleKeys = visibleRows.map((r) => rowKey(r));
  const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => keySet.has(key));
  return {
    selectMode,
    keySet,
    selectedRows,
    allSelected,
    clear,
    toggleKey,
    toggleAll: () => update(toggleVisibleSelection(keySet, visibleKeys)),
    enter: () => setOwnSelectMode(true),
    exit: () => {
      setOwnSelectMode(false);
      clear();
    },
  };
}
