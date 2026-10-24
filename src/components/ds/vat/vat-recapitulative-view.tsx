/** SH a OSS · vlastní tabulkovou prezentaci · nesmí převádět měny ani počítat daně. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { OssReturnRow, VatRecapitulativeRow } from "./vat-report-types";
/** Parametry společného přehledu SH/OSS. */
export interface VatRecapitulativeViewProps extends ComponentPropsWithoutRef<"div"> {
  /** Varianta sestavy. */ variant?: "recapitulative" | "oss";
  /** Hotová data SH. */ rows?: VatRecapitulativeRow[];
  /** Hotová data OSS včetně oprav. */ ossRows?: OssReturnRow[];
  /** Měna z APP. */ currency: string;
  /** Otevření podkladů. */ onRowOpen?: (id: string) => void;
  /** Klíč nastavení. */ storageKey?: string;
}
/** Souhrnné hlášení nebo přehled OSS se součty. */
export const VatRecapitulativeView = forwardRef<HTMLDivElement, VatRecapitulativeViewProps>(
  function VatRecapitulativeView(
    {
      variant = "recapitulative",
      rows = [],
      ossRows = [],
      currency,
      onRowOpen,
      storageKey = "vat-recapitulative",
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().vatReports;
    const columns: DataGridColumn<VatRecapitulativeRow>[] = [
      { id: "country", label: t.country, value: (r) => r.country },
      { id: "dic", label: t.dic, value: (r) => r.dic },
      { id: "supply", label: t.supply, value: (r) => r.supplyCode, total: "none" },
      { id: "amount", label: `${t.amount} · ${currency}`, value: (r) => r.amount, numeric: true },
    ];
    const ossColumns: DataGridColumn<OssReturnRow>[] = [
      { id: "country", label: t.country, value: (r) => r.country },
      { id: "supply", label: t.supply, value: (r) => r.supplyLabel },
      { id: "period", label: t.period, value: (r) => r.correctionPeriod },
      { id: "rate", label: t.rate, value: (r) => `${r.rate} %` },
      { id: "base", label: `${t.base} · ${currency}`, value: (r) => r.base, numeric: true },
      { id: "tax", label: `${t.tax} · ${currency}`, value: (r) => r.tax, numeric: true },
    ];
    return (
      <div ref={ref} {...props} className={cn("min-w-0", className)}>
        {variant === "oss" ? (
          <DataGrid
            title={t.ossTitle}
            rows={ossRows}
            columns={ossColumns}
            storageKey={`${storageKey}:oss`}
            rowKey={(r) => r.id}
            onRowOpen={(r) => onRowOpen?.(r.id)}
          />
        ) : (
          <DataGrid
            title={t.recapitulativeTitle}
            rows={rows}
            columns={columns}
            storageKey={storageKey}
            rowKey={(r) => r.id}
            onRowOpen={(r) => onRowOpen?.(r.id)}
          />
        )}
      </div>
    );
  },
);
