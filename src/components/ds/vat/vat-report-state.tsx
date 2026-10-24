/** Stav přehledů DPH · vlastní kostru a pruh chyby · nesmí načítat data. */
import type { ReactNode } from "react";
import { NoticeBar } from "../feedback/notice-bar";
import { useDsTexts } from "../../../ds-texts";
import type { VatReportExportMeta } from "./vat-report-types";

/** Kostra načítání přehledu (tři řádky). */
export function VatReportSkeleton() {
  const t = useDsTexts().vatReports;
  return (
    <div role="status" aria-label={t.loading} aria-busy="true" className="space-y-2">
      <span className="sr-only">{t.loading}</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-8 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

/** Pruh chyby přehledu se zprávou od APP. */
export function VatReportError({ message }: { message: string }) {
  return (
    <NoticeBar tone="danger" role="alert">
      {message}
    </NoticeBar>
  );
}

/** Titul exportu se záhlavím (období, firma, druh podání) od APP. */
export function vatExportTitle(title: string, meta?: VatReportExportMeta): string {
  if (!meta) return title;
  const parts = [meta.period, meta.company, meta.filingKind].filter(Boolean);
  return parts.length ? `${title} · ${parts.join(" · ")}` : title;
}

/** Obal obsahu přehledu: kostra při načítání, jinak pruh chyby nad obsahem. */
export function VatReportState({
  loading,
  error,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  children: ReactNode;
}) {
  if (loading) return <VatReportSkeleton />;
  return (
    <>
      {error ? <VatReportError message={error} /> : null}
      {children}
    </>
  );
}
