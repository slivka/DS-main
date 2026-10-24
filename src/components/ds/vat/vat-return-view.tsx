/** Přiznání DPH · vlastní strom a porovnání · nesmí počítat daňovou povinnost. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { TreeGrid } from "../grid/TreeGrid";
import type { TreeGridColumn } from "../grid/tree-grid-types";
import { AmountCell } from "../accounting/amount";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { VatReturnRow } from "./vat-report-types";
import { vatRowDifference } from "./vat-report-model";
/** Parametry přehledu přiznání. */
export interface VatReturnViewProps extends ComponentPropsWithoutRef<"div"> {
  /** Řádky APP. */ rows: VatReturnRow[];
  /** Otevření podkladů řádku. */ onRowOpen?: (row: VatReturnRow) => void;
  /** Podaný snímek. */ compare?: Record<string, { base?: number; tax?: number }>;
  /** Hotová povinnost a odpočet od APP. */ summary: { liability?: number | null; excess?: number | null };
  /** Měna z dat APP. */ currency: string;
  /** Oddělené nastavení přehledu. */ storageKey?: string;
}
/** Strom řádků přiznání s rozdíly proti podanému snímku. */
export const VatReturnView = forwardRef<HTMLDivElement, VatReturnViewProps>(function VatReturnView(
  { rows, onRowOpen, compare, summary, currency, storageKey = "vat-return", className, ...props }, ref,
) {
  const t = useDsTexts().vatReports;
  const tree = Object.entries(t.sections).flatMap(([section, label]) => [
    { id: `section:${section}`, label },
    ...rows.filter(row => row.section === section).map(row => ({ ...row, id: row.key, parentId: `section:${section}` })),
  ]);
  type DisplayRow = (typeof tree)[number];
  const columns: TreeGridColumn<DisplayRow>[] = [
    { id: "label", label: t.row, value: row => "key" in row ? `${row.key} · ${row.label}` : row.label },
    ...(["base", "tax"] as const).map(field => ({ id: field, label: `${t[field]} · ${currency}`, numeric: true, total: "none" as const,
      value: (row: DisplayRow) => "key" in row ? row[field] : null,
      render: (row: DisplayRow) => {
        if (!("key" in row)) return null;
        const delta = vatRowDifference(row, compare?.[row.key])[field];
        return <div className={cn(delta && "bg-warning/15")}><AmountCell value={row[field]} />
          {delta !== undefined && delta !== 0 ? <span className="text-xs text-warning-foreground">{t.difference}: <AmountCell value={delta} /></span> : null}</div>;
      },
    })),
    { id: "count", label: t.documents, numeric: true, decimals: 0, total: "none", value: row => "key" in row ? row.documentCount : null },
  ];
  return <div ref={ref} {...props} className={cn("min-w-0 space-y-3", className)}>
    <TreeGrid title={t.returnTitle} rows={tree} columns={columns} storageKey={storageKey}
      onRowOpen={row => { if ("key" in row) onRowOpen?.(row); }} />
    <dl className="flex flex-wrap justify-end gap-6 border-t py-3 text-sm">
      <div><dt>{t.liability} · {currency}</dt><dd className="font-semibold"><AmountCell value={summary.liability} /></dd></div>
      <div><dt>{t.excess} · {currency}</dt><dd className="font-semibold"><AmountCell value={summary.excess} /></dd></div>
    </dl>
  </div>;
});
