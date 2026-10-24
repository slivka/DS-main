/** Kniha je pouze čtený přehled hotových zápisů APP, nikoli druhý deník. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import { OptionSelect } from "../form/option-select";
import { TooltipProvider } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { filterTaxBook } from "./tax-record-model";
import { taxBookColumns } from "./tax-book-columns";
import type { TaxBookEntry, TaxBookFilters } from "./tax-record-types";
export interface TaxBookViewProps extends ComponentPropsWithoutRef<"div"> {
  rows: TaxBookEntry[];
  homeCurrency: string;
  filters?: TaxBookFilters;
  onFiltersChange?: (filters: TaxBookFilters) => void;
  periods?: { id: string; label: string; from: string; to: string }[];
  onDocumentOpen?: (id: string) => void;
  onUnassignedOpen?: (row: TaxBookEntry) => void;
  storageKey?: string;
}
export const TaxBookView = forwardRef<HTMLDivElement, TaxBookViewProps>(function TaxBookView(
  {
    rows,
    homeCurrency,
    filters,
    onFiltersChange,
    periods = [],
    onDocumentOpen,
    onUnassignedOpen,
    storageKey = "tax-book",
    className,
    ...props
  },
  ref,
) {
  const texts = useDsTexts();
  const t = texts.taxRecords;
  const showKind = rows.some((r) => r.kind);
  const showBase = rows.some((r) => r.base != null);
  const [local, setLocal] = useState<TaxBookFilters>({});
  const current = filters ?? local;
  const change = (next: TaxBookFilters) => {
    if (filters === undefined) setLocal(next);
    onFiltersChange?.(next);
  };
  const distinct = (key: "itemId" | "categoryId", label: "item" | "category") =>
    Array.from(
      new Map(
        rows
          .filter((r) => r[key])
          .map((r) => [r[key], { value: r[key] ?? "", label: r[label] ?? "" }]),
      ).values(),
    );
  return (
    <TooltipProvider>
      <div ref={ref} {...props} className={cn("min-w-0 space-y-3", className)}>
        <div className="flex flex-wrap items-center gap-3">
          {periods.length ? (
            <OptionSelect
              searchable
              ariaLabel={t.period}
              value={periods.find((p) => p.from === current.from && p.to === current.to)?.id}
              emptyLabel={t.all}
              options={periods.map((p) => ({ value: p.id, label: p.label }))}
              onChange={(id) => {
                const p = periods.find((p) => p.id === id);
                change({ ...current, from: p?.from, to: p?.to });
              }}
            />
          ) : null}
          <OptionSelect
            searchable
            ariaLabel={t.item}
            value={current.itemId}
            emptyLabel={t.all}
            options={distinct("itemId", "item")}
            onChange={(itemId) => change({ ...current, itemId: itemId || undefined })}
          />
          <OptionSelect
            searchable
            ariaLabel={t.treatment}
            value={current.treatment}
            emptyLabel={t.all}
            options={Object.entries(t.treatments).map(([value, label]) => ({ value, label }))}
            onChange={(value) => {
              if (value === "" || value === "taxable" || value === "non_tax" || value === "transit")
                change({ ...current, treatment: value || undefined });
            }}
          />
          <OptionSelect
            searchable
            ariaLabel={t.category}
            value={current.categoryId}
            emptyLabel={t.all}
            options={distinct("categoryId", "category")}
            onChange={(categoryId) => change({ ...current, categoryId: categoryId || undefined })}
          />
        </div>
        <DataGrid
          title={t.title}
          exportName="tax-book"
          storageKey={storageKey}
          rows={filterTaxBook(rows, current)}
          columns={taxBookColumns(t, homeCurrency, onDocumentOpen, onUnassignedOpen, {
            y: texts.taxYear,
            showKind,
            showBase,
          })}
          rowKey={(r) => r.id}
          onRowOpen={(r) =>
            r.unassigned && onUnassignedOpen
              ? onUnassignedOpen(r)
              : onDocumentOpen?.(r.paymentDocumentId)
          }
          rowClassName={(r) => (r.unassigned ? "bg-warning-soft" : undefined)}
          showTotalRow
        />
      </div>
    </TooltipProvider>
  );
});
