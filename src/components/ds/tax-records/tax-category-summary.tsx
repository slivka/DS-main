/** Hotový přehled § 7–10; výdaje procentem a stropy vypočítává APP. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { TaxCategoryRow } from "./tax-record-types";
export interface TaxCategorySummaryProps extends ComponentPropsWithoutRef<"div"> {
  rows: TaxCategoryRow[];
  currency: string;
  unassignedAmount?: number;
  onCategoryOpen?: (id: string) => void;
  onUnassignedOpen?: () => void;
  storageKey?: string;
}
export const TaxCategorySummary = forwardRef<HTMLDivElement, TaxCategorySummaryProps>(
  function TaxCategorySummary(
    {
      rows,
      currency,
      unassignedAmount = 0,
      onCategoryOpen,
      onUnassignedOpen,
      storageKey = "tax-category-summary",
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().taxRecords;
    const columns: DataGridColumn<TaxCategoryRow>[] = [
      { id: "paragraph", label: "§", value: (r) => r.paragraph },
      { id: "label", label: t.taxCategory, value: (r) => r.label },
      ...(["income", "expense", "cap", "calculatedExpense"] as const).map((id) => ({
        id,
        label: `${t[id]} · ${currency}`,
        value: (r: TaxCategoryRow) => r[id],
        numeric: true,
        decimals: 2,
        total: id === "cap" ? ("none" as const) : ("sum" as const),
      })),
      {
        id: "percentage",
        label: t.percentage,
        value: (r) => (r.percentage == null ? "" : `${r.percentage} %`),
        total: "none",
      },
    ];
    const unassigned: TaxCategoryRow = {
      id: "__unassigned__",
      label: t.unassigned,
      paragraph: "7",
      income: unassignedAmount,
      expense: 0,
    };
    const shown = unassignedAmount !== 0 ? [...rows, unassigned] : rows;
    return (
      <div ref={ref} {...props} className={cn("min-w-0", className)}>
        <DataGrid
          title={t.summary}
          rows={shown}
          columns={columns}
          rowKey={(r) => r.id}
          storageKey={storageKey}
          rowClassName={(r) => (r === unassigned ? "bg-warning-soft" : undefined)}
          onRowOpen={(r) => (r === unassigned ? onUnassignedOpen?.() : onCategoryOpen?.(r.id))}
          showTotalRow
        />
      </div>
    );
  },
);
