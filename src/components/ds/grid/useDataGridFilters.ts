/**
 * Hledání a autofiltry DataGrid.
 * Vlastní: text hledání, vybrané hodnoty autofiltrů po sloupcích, filtrované řádky, nabídky
 * hodnot (každá nad řádky filtrovanými ostatními sloupci) a popisky aktivních filtrů.
 * Nesmí: řadit ani stránkovat – vrací filtrované řádky v původním pořadí.
 */
import { useEffect, useMemo, useState } from "react";

import { fmtAmount } from "../../../lib/format";
import type { GridTexts } from "./grid-texts";
import {
  cellText,
  columnFilterOptions,
  dateFilterKeys,
  dateFilterParts,
  type FilterOption,
} from "./data-grid-model";
import type { DataGridColumn } from "./data-grid-types";

/** Vstup hooku filtrů. */
export interface DataGridFilterOptions<Row> {
  /** Všechny řádky. */
  rows: Row[];
  /** Všechny sloupce (hledá se i ve skrytých). */
  columns: DataGridColumn<Row>[];
  /** Zobrazené sloupce (autofiltry). */
  shown: DataGridColumn<Row>[];
  /** Sloupce podle id. */
  byId: Map<string, DataGridColumn<Row>>;
  /** Texty gridu. */
  texts: GridTexts;
  /** Oznámení změny hledání. */
  onSearchChange?: ((search: string) => void) | undefined;
  /** Oznámení změny autofiltrů. */
  onColumnFiltersChange?: ((filters: Record<string, string[]>) => void) | undefined;
}

/** Stav hledání a autofiltrů a filtrované řádky. */
export function useDataGridFilters<Row>({
  rows,
  columns,
  shown,
  byId,
  texts,
  onSearchChange,
  onColumnFiltersChange,
}: DataGridFilterOptions<Row>) {
  const [search, setSearch] = useState("");
  const [colFilters, setColFilters] = useState<Record<string, string[]>>({});
  // Oznámení rodiči je synchronizace s vnějškem; callback z props se nesleduje.
  useEffect(() => {
    onSearchChange?.(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callback z props se nesleduje
  }, [search]);
  useEffect(() => {
    onColumnFiltersChange?.(colFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- callback z props se nesleduje
  }, [colFilters]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((c) => {
        // Skupinový řádek zastupuje i své skryté položky.
        const many = c.filterValues?.(row);
        if (many && many.length) return many.some((v) => String(v).toLowerCase().includes(q));
        return cellText(c.value?.(row)).toLowerCase().includes(q);
      }),
    );
  }, [rows, columns, search]);

  const textOf = (row: Row, id: string) => {
    const c = byId.get(id);
    const v = c?.value?.(row);
    return c?.numeric && typeof v === "number" ? fmtAmount(v, c.decimals ?? 0) : cellText(v);
  };
  /** Všechny hodnoty řádku ve sloupci (skupinový řádek může zastupovat více hodnot). */
  const valuesOf = (row: Row, id: string) => {
    const many = byId.get(id)?.filterValues?.(row);
    return many && many.length ? many : [textOf(row, id)];
  };
  const filterKeysOf = (row: Row, id: string) => {
    const column = byId.get(id);
    const values = valuesOf(row, id);
    if (column?.exportType !== "date" && column?.exportType !== "datetime") return values;
    return values.flatMap((value) => {
      const parts = dateFilterParts(value);
      return parts ? [value, ...dateFilterKeys(parts)] : [value];
    });
  };
  /** Řádky profiltrované všemi autofiltry kromě zadaného. */
  const rowsExcept = (skipId: string | null) => {
    const entries = Object.entries(colFilters).filter(([id]) => id !== skipId);
    if (!entries.length) return searched;
    return searched.filter((row) =>
      entries.every(([id, vals]) => filterKeysOf(row, id).some((v) => vals.includes(v))),
    );
  };
  const filtered = useMemo(
    () => rowsExcept(null),
    // rowsExcept čte jen searched a colFilters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, colFilters],
  );
  /** Nabídka hodnot pro autofiltr v záhlaví každého sloupce. */
  const filterOptions = useMemo(() => {
    const map = new Map<string, FilterOption[]>();
    for (const c of shown) {
      const values = new Set<string>();
      for (const row of rowsExcept(c.id)) for (const v of valuesOf(row, c.id)) values.add(v);
      const isDate = c.exportType === "date" || c.exportType === "datetime";
      map.set(c.id, columnFilterOptions(values, isDate, texts));
    }
    return map;
    // Nabídky se mění se zobrazenými sloupci, hledáním a filtry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, searched, colFilters]);

  const columnFilterLabels = Object.entries(colFilters).map(([id, vals]) => {
    const options = filterOptions.get(id) ?? [];
    const labels = vals.map(
      (value) => options.find((option) => option.value === value)?.label ?? value,
    );
    return `${byId.get(id)?.label ?? id}: ${labels.join(", ")}`;
  });
  return {
    search,
    setSearch,
    colFilters,
    setColFilter: (id: string, next: Set<string>) =>
      setColFilters((cur) => {
        const copy = { ...cur };
        if (next.size === 0) delete copy[id];
        else copy[id] = [...next];
        return copy;
      }),
    filtered,
    filterOptions,
    columnFilterLabels,
    columnFilterCount: Object.keys(colFilters).length,
    clear: () => {
      setSearch("");
      setColFilters({});
    },
  };
}
