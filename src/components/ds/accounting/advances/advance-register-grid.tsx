/** Evidence záloh · vlastní preset DataGridu · nesmí počítat historické zůstatky ani lhůty. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../../ds-texts";
import { cn } from "../../../../lib/utils";
import { formatDate } from "../../../../lib/format";
import { DataGrid, type DataGridColumn, type DataGridProps } from "../../grid/DataGrid";
import { StatusBadge } from "../../data-display/status-badge";
import { Button } from "../../../ui/button";
import type { AdvanceRegisterRow } from "./advance-types";
/** Řízené filtry evidence. */
export interface AdvanceRegisterFilters {
  /** Položky po lhůtě. */ overdue: boolean;
  /** Položky bez DD. */ withoutDD: boolean;
}
/** Evidence s daty filtrovanými a vypočtenými v APP. */
export interface AdvanceRegisterGridProps extends ComponentPropsWithoutRef<"div"> {
  /** Zmapované řádky z APP. */ rows: AdvanceRegisterRow[];
  /** Klíč gridu. */ storageKey: string;
  /** Filtry z APP. */ filters: AdvanceRegisterFilters;
  /** APP přepočítá řádky. */ onFiltersChange: (filters: AdvanceRegisterFilters) => void;
  /** Sdílený řízený řez k datu; žádný výpočet zůstatků v DS. */ asOf: NonNullable<
    DataGridProps<AdvanceRegisterRow>["asOf"]
  >;
  /** Otevření platby. */ onOpen?: (row: AdvanceRegisterRow) => void;
  /** Načítání. */ loading?: boolean;
  /** Chyba APP. */ error?: string;
}
/** Preset evidence, zachovává lištu, zoom, exporty a filtry DataGridu. */
export const AdvanceRegisterGrid = forwardRef<HTMLDivElement, AdvanceRegisterGridProps>(
  function AdvanceRegisterGrid(
    {
      rows,
      storageKey,
      filters,
      onFiltersChange,
      asOf,
      onOpen,
      loading,
      error,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().advances;
    const columns: DataGridColumn<AdvanceRegisterRow>[] = [
      { id: "partner", label: t.partner, value: (row) => row.partner },
      { id: "vs", label: t.vs, value: (row) => row.vs, format: "vs" },
      {
        id: "paidAt",
        label: t.paidAt,
        value: (row) => row.paidAt,
        render: (row) => formatDate(row.paidAt),
        exportType: "date",
      },
      { id: "currency", label: t.currency, value: (row) => row.currency },
      ...(["amount", "paidList", "coveredTaxDocument", "deducted", "remaining"] as const).map(
        (id) => ({
          id,
          label: t[id],
          numeric: true,
          value: (row: AdvanceRegisterRow) => row[id],
          total: "none" as const,
        }),
      ),
      {
        id: "taxStatus",
        label: t.taxStatus,
        value: (row) => t[row.taxStatus],
        render: (row) => (
          <StatusBadge
            status={row.taxStatus}
            config={{
              missing: { label: t.missing, tone: "warning" },
              partial: { label: t.partial, tone: "warning" },
              issued: { label: t.issued, tone: "success" },
              notIssued: { label: t.notIssued, tone: "neutral" },
            }}
          />
        ),
      },
      {
        id: "deadline",
        label: t.deadline,
        value: (row) => row.deadline,
        render: (row) => formatDate(row.deadline),
        exportType: "date",
      },
    ];
    return (
      <div ref={ref} className={cn("min-w-0", className)} {...props}>
        <DataGrid
          storageKey={storageKey}
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          title={t.register}
          asOf={asOf}
          loading={loading}
          error={error}
          onRowClick={onOpen}
          toolbarLeft={
            <>
              <Button
                variant="outline"
                aria-pressed={filters.overdue}
                onClick={() => onFiltersChange({ ...filters, overdue: !filters.overdue })}
              >
                {t.overdue}
              </Button>
              <Button
                variant="outline"
                aria-pressed={filters.withoutDD}
                onClick={() => onFiltersChange({ ...filters, withoutDD: !filters.withoutDD })}
              >
                {t.withoutDD}
              </Button>
            </>
          }
          filterChips={(["overdue", "withoutDD"] as const)
            .filter((key) => filters[key])
            .map((key) => ({
              id: key,
              label: t[key],
              onRemove: () => onFiltersChange({ ...filters, [key]: false }),
            }))}
          onClearFilters={() => onFiltersChange({ overdue: false, withoutDD: false })}
          rowClassName={(row) => (row.overdue ? "text-warning-foreground" : undefined)}
        />
      </div>
    );
  },
);
