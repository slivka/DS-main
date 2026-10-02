/**
 * Sloupec variabilního symbolu pro DataGrid.
 * Vlastní: levé zarovnání a tabulkové číslice.
 * Nesmí: měnit nebo validovat hodnotu.
 */
import type { DataGridColumn } from "./data-grid-types";

/**
 * Vytvoří jednotný sloupec VS zarovnaný vlevo.
 * Popisek předává aplikace (typicky `useDsTexts().documentForm.vsColumn`).
 */
export function vsColumn<Row>(
  value: (row: Row) => string | null | undefined,
  label: string,
  options: Partial<DataGridColumn<Row>> = {},
): DataGridColumn<Row> {
  return {
    id: "vs",
    label,
    fitContent: true,
    align: "left",
    format: "vs",
    className: "font-mono tabular-nums text-left",
    value,
    ...options,
  };
}
