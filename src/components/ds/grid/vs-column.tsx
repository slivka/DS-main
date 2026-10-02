/**
 * Sloupec variabilního symbolu pro DataGrid.
 * Vlastní: levé zarovnání a tabulkové číslice.
 * Nesmí: měnit nebo validovat hodnotu.
 */
import type { DataGridColumn } from "./data-grid-types";

/** Vytvoří jednotný sloupec VS zarovnaný vlevo. */
export function vsColumn<Row>(
  value: (row: Row) => string | null | undefined,
  options: Partial<DataGridColumn<Row>> = {},
): DataGridColumn<Row> {
  return {
    id: "vs",
    label: "VS",
    fitContent: true,
    align: "left",
    className: "font-mono tabular-nums text-left",
    value,
    ...options,
  };
}