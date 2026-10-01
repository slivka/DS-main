/**
 * Malá tabulka zarovnaná na dvanáctisloupcovou mřížku formuláře.
 * Vlastní: hlavičku, řádky, responzivní kartové zobrazení a přístupné role.
 * Nesmí: načítat data, řešit stránkování ani nahrazovat DataGrid.
 */
import type { ReactNode } from "react";

import { cn } from "../../../lib/utils";

const SPAN_CLASSES = {
  1: "@min-[40rem]:col-span-1",
  2: "@min-[40rem]:col-span-2",
  3: "@min-[40rem]:col-span-3",
  4: "@min-[40rem]:col-span-4",
  5: "@min-[40rem]:col-span-5",
  6: "@min-[40rem]:col-span-6",
  7: "@min-[40rem]:col-span-7",
  8: "@min-[40rem]:col-span-8",
  9: "@min-[40rem]:col-span-9",
  10: "@min-[40rem]:col-span-10",
  11: "@min-[40rem]:col-span-11",
  12: "@min-[40rem]:col-span-12",
} as const;

/** Sloupec malé formulářové tabulky. */
export interface FieldTableColumn {
  /** Stabilní klíč propojující sloupec s buňkami. */
  key: string;
  /** Popisek zobrazený v hlavičce a na úzkém zobrazení u buňky. */
  label: ReactNode;
  /** Šířka sloupce v dvanáctisloupcové mřížce. */
  span: keyof typeof SPAN_CLASSES;
  /** Vodorovné zarovnání obsahu. */
  align?: "start" | "end";
}

/** Řádek malé formulářové tabulky. */
export interface FieldTableRow {
  /** Stabilní klíč řádku. */
  key: string;
  /** Obsah buněk podle klíčů sloupců. */
  cells: Record<string, ReactNode>;
}

/** Vlastnosti malé formulářové tabulky. */
export interface FieldTableProps {
  /** Přístupný název tabulky. */
  ariaLabel: string;
  /** Definice sloupců v pořadí zobrazení. */
  columns: FieldTableColumn[];
  /** Datové řádky tabulky. */
  rows: FieldTableRow[];
  /** Doplňující třídy kořenového prvku. */
  className?: string;
}

/** Malá editovatelná tabulka v dialogu se shodnými svislicemi jako FieldGrid. */
export function FieldTable({ ariaLabel, columns, rows, className }: FieldTableProps) {
  return (
    <div role="table" aria-label={ariaLabel} className={cn("@container space-y-2", className)}>
      <div role="rowgroup" className="hidden @min-[40rem]:block">
        <div role="row" className="grid grid-cols-12 gap-3">
          {columns.map((column) => (
            <div
              key={column.key}
              role="columnheader"
              className={cn(
                "text-[0.75rem] font-semibold leading-none text-foreground",
                SPAN_CLASSES[column.span],
                column.align === "end" && "text-right",
              )}
            >
              {column.label}
            </div>
          ))}
        </div>
      </div>
      <div role="rowgroup" className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            role="row"
            className="grid grid-cols-1 gap-2 rounded-md border p-3 @min-[40rem]:min-h-[var(--control-h)] @min-[40rem]:grid-cols-12 @min-[40rem]:gap-3 @min-[40rem]:rounded-none @min-[40rem]:border-0 @min-[40rem]:p-0"
          >
            {columns.map((column) => (
              <div
                key={column.key}
                role="cell"
                aria-label={typeof column.label === "string" ? column.label : undefined}
                className={cn(
                  "grid min-w-0 grid-cols-[minmax(0,8rem)_minmax(0,1fr)] items-center gap-2 @min-[40rem]:flex @min-[40rem]:h-[var(--control-h)]",
                  SPAN_CLASSES[column.span],
                  column.align === "end" && "@min-[40rem]:justify-end @min-[40rem]:text-right",
                )}
              >
                <span className="text-[0.75rem] font-semibold leading-none text-muted-foreground @min-[40rem]:hidden">
                  {column.label}
                </span>
                <div className="min-w-0 flex-1">{row.cells[column.key]}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
