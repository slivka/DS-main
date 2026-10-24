/** Karta majetku DE: jen daňová řada; účty a účetní odpisy se nezobrazí. Hodnoty dodává APP. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { Field, FieldGrid } from "../layout/form-field-layout";
import { FieldValue } from "../form/field-value";
import { NoticeBar } from "../feedback/notice-bar";
import { useDsTexts } from "../../../ds-texts";
import { formatAmount, formatDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import type { TaxAsset, TaxAssetYear } from "./tax-record-types";
export interface TaxAssetCardProps extends ComponentPropsWithoutRef<"div"> {
  asset: TaxAsset;
  currency: string;
  onYearOpen?: (row: TaxAssetYear) => void;
  storageKey?: string;
}
export const TaxAssetCard = forwardRef<HTMLDivElement, TaxAssetCardProps>(function TaxAssetCard(
  { asset, currency, onYearOpen, storageKey = "tax-asset-series", className, ...props },
  ref,
) {
  const t = useDsTexts().taxYear;
  const columns: DataGridColumn<TaxAssetYear>[] = [
    { id: "year", label: t.year, value: (r) => String(r.year) },
    ...(["depreciation", "residualValue"] as const).map((id) => ({
      id,
      label: `${t[id]} · ${currency}`,
      value: (r: TaxAssetYear) => r[id],
      numeric: true,
      decimals: 2,
      total: id === "depreciation" ? ("sum" as const) : ("none" as const),
    })),
    { id: "posted", label: t.posted, value: (r) => (r.posted ? t.posted : "") },
  ];
  return (
    <div ref={ref} {...props} className={cn("min-w-0 space-y-4", className)}>
      <FieldGrid cols={3} title={t.assetCard}>
        <Field label={t.assetName}>
          <FieldValue>{asset.name}</FieldValue>
        </Field>
        <Field label={t.inventoryNumber}>
          <FieldValue>{asset.inventoryNumber ?? ""}</FieldValue>
        </Field>
        <Field label={t.acquisitionDate}>
          <FieldValue>{formatDate(asset.acquisitionDate)}</FieldValue>
        </Field>
        <Field label={`${t.acquisitionPrice} · ${currency}`}>
          <FieldValue className="justify-end tabular-nums">
            {formatAmount(asset.acquisitionPrice, 2)}
          </FieldValue>
        </Field>
        {asset.lowValue ? null : (
          <>
            <Field label={t.depreciationGroup}>
              <FieldValue>{asset.depreciationGroup ?? ""}</FieldValue>
            </Field>
            <Field label={t.depreciationMethod}>
              <FieldValue>{asset.method ? t.methods[asset.method] : ""}</FieldValue>
            </Field>
          </>
        )}
      </FieldGrid>
      {asset.lowValue ? (
        <NoticeBar tone="info" title={t.lowValue}>
          {t.lowValueNote}
        </NoticeBar>
      ) : (
        <DataGrid
          title={t.taxSeries}
          rows={asset.series}
          columns={columns}
          rowKey={(r) => String(r.year)}
          storageKey={storageKey}
          onRowOpen={onYearOpen}
          showTotalRow
        />
      )}
    </div>
  );
});
