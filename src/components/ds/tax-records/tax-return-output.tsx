/** Výstup pro přiznání DE: řádky tiskopisu a částky z APP; export přes DataGrid. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { TaxReturnLine } from "./tax-record-types";
export interface TaxReturnOutputProps extends ComponentPropsWithoutRef<"div"> {
  rows: TaxReturnLine[];
  currency: string;
  year: number;
  onLineOpen?: (row: TaxReturnLine) => void;
  storageKey?: string;
}
export const TaxReturnOutput = forwardRef<HTMLDivElement, TaxReturnOutputProps>(
  function TaxReturnOutput(
    { rows, currency, year, onLineOpen, storageKey = "tax-return-output", className, ...props },
    ref,
  ) {
    const t = useDsTexts().taxYear;
    const columns: DataGridColumn<TaxReturnLine>[] = [
      { id: "line", label: t.returnLine, value: (r) => r.line },
      { id: "label", label: t.description, value: (r) => r.label },
      {
        id: "amount",
        label: `${t.amount} · ${currency}`,
        value: (r) => r.amount,
        numeric: true,
        decimals: 2,
        total: "none",
      },
    ];
    const title = `${t.returnOutput} ${year}`;
    return (
      <div ref={ref} {...props} className={cn("min-w-0", className)}>
        <DataGrid
          title={title}
          exportTitle={title}
          rows={rows}
          columns={columns}
          rowKey={(r) => r.id}
          storageKey={storageKey}
          onRowOpen={onLineOpen}
        />
      </div>
    );
  },
);
