/** Přiznání DPH · vlastní strom a porovnání · nesmí počítat daňovou povinnost. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { TreeGrid } from "../grid/TreeGrid";
import type { TreeGridColumn } from "../grid/tree-grid-types";
import { AmountCell } from "../accounting/amount";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { VatReturnRow, VatReportExportMeta } from "./vat-report-types";
import { vatRowDifference } from "./vat-report-model";
import { VatReportState, vatExportTitle } from "./vat-report-state";
/** Parametry přehledu přiznání. */
export interface VatReturnViewProps extends ComponentPropsWithoutRef<"div"> {
  /** Řádky APP. */ rows: VatReturnRow[];
  /** Načítání – místo obsahu kostra. */ loading?: boolean;
  /** Zpráva chyby – pruh nad obsahem. */ error?: string | null;
  /** Záhlaví exportu (období, firma, druh podání). */ exportMeta?: VatReportExportMeta;
  /** Otevření podkladů řádku. */ onRowOpen?: (row: VatReturnRow) => void;
  /** Podaný snímek. */ compare?: Record<string, { base?: number; tax?: number }>;
  /** Hotová povinnost a odpočet od APP. */ summary: {
    liability?: number | null;
    excess?: number | null;
  };
  /** Měna z dat APP. */ currency: string;
  /** Oddělené nastavení přehledu. */ storageKey?: string;
}
/** Strom řádků přiznání s rozdíly proti podanému snímku. */
export const VatReturnView = forwardRef<HTMLDivElement, VatReturnViewProps>(function VatReturnView(
  {
    rows,
    onRowOpen,
    compare,
    summary,
    currency,
    storageKey = "vat-return",
    loading,
    error,
    exportMeta,
    className,
    ...props
  },
  ref,
) {
  const t = useDsTexts().vatReports;
  const tree = Object.entries(t.sections).flatMap(([section, label]) => [
    { id: `section:${section}`, label },
    ...rows
      .filter((row) => row.section === section)
      .map((row) => ({ ...row, id: row.key, parentId: `section:${section}` })),
  ]);
  type DisplayRow = (typeof tree)[number];
  const columns: TreeGridColumn<DisplayRow>[] = [
    {
      id: "label",
      label: t.row,
      value: (row) => ("key" in row ? `${row.key} · ${row.label}` : row.label),
    },
    ...(["base", "tax"] as const).map((field) => ({
      id: field,
      label: `${t[field]} · ${currency}`,
      numeric: true,
      total: "none" as const,
      value: (row: DisplayRow) => ("key" in row ? row[field] : null),
      render: (row: DisplayRow) => {
        if (!("key" in row)) return null;
        const delta = vatRowDifference(row, compare?.[row.key])[field];
        if (delta === undefined || delta === 0) return <AmountCell value={row[field]} />;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  tabIndex={0}
                  className="bg-warning/15 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <AmountCell value={row[field]} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {t.difference}: <AmountCell value={delta} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    })),
    ...(["fullDeduction", "reducedDeduction"] as const).map((field) => ({
      id: field,
      label: `${t[field]} · ${currency}`,
      numeric: true,
      total: "none" as const,
      value: (row: DisplayRow) => ("key" in row ? (row[field] ?? null) : null),
      render: (row: DisplayRow) =>
        "key" in row ? <AmountCell value={row[field] ?? null} /> : null,
    })),
    {
      id: "count",
      label: t.documents,
      numeric: true,
      decimals: 0,
      total: "none",
      value: (row) => ("key" in row ? row.documentCount : null),
    },
  ];
  return (
    <div ref={ref} {...props} className={cn("min-w-0 space-y-3", className)}>
      <VatReportState loading={loading} error={error}>
        <TreeGrid
          title={vatExportTitle(t.returnTitle, exportMeta)}
          rows={tree}
          columns={columns}
          storageKey={storageKey}
          onRowClick={(row) => {
            if ("key" in row) onRowOpen?.(row);
          }}
          onRowOpen={(row) => {
            if ("key" in row) onRowOpen?.(row);
          }}
        />
        <dl className="flex flex-wrap justify-end gap-6 border-t py-3 text-sm">
          <div>
            <dt>
              {t.liability} · {currency}
            </dt>
            <dd className="font-semibold">
              <AmountCell value={summary.liability} />
            </dd>
          </div>
          <div>
            <dt>
              {t.excess} · {currency}
            </dt>
            <dd className="font-semibold">
              <AmountCell value={summary.excess} />
            </dd>
          </div>
        </dl>
      </VatReportState>
    </div>
  );
});
