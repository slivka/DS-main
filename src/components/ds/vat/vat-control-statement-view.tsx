/** Kontrolní hlášení · vlastní oddíly a tabulky · nesmí rozdělovat doklady do oddílů. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { PageTabs } from "../layout/page-tabs";
import { TabsContent } from "../../ui/tabs";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { StatusBadge } from "../data-display/status-badge";
import { useDsTexts } from "../../../ds-texts";
import { formatDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import type {
  VatControlDocument,
  VatControlSection,
  VatControlSectionData,
  VatRateAmounts,
  VatReportStateProps,
} from "./vat-report-types";
import { VatReportState, vatExportTitle } from "./vat-report-state";
const SECTIONS: VatControlSection[] = ["A1", "A2", "A4", "A5", "B1", "B2", "B3"];
/** Sazby sloupců dokladů včetně třetí sazby 10 %. */
const RATES = [21, 12, 10];
/** Parametry kontrolního hlášení. */
export interface VatControlStatementViewProps
  extends ComponentPropsWithoutRef<"div">, VatReportStateProps {
  /** Oddíly rozdělené APP. */ sections: Partial<Record<VatControlSection, VatControlSectionData>>;
  /** Aktivní oddíl; bez něj místní výběr. */ activeSection?: VatControlSection;
  /** Změna oddílu. */ onSectionChange?: (section: VatControlSection) => void;
  /** Otevření dokladu. */ onDocumentOpen?: (id: string) => void;
  /** Změna po podání. */ changed?: boolean;
  /** Měna. */ currency: string;
  /** Klíč nastavení. */ storageKey?: string;
  /** Skryje sloupce sazeb, které v aktivním oddílu nemají žádnou hodnotu. */
  hideEmptyColumns?: boolean;
}
/** Oddíly KH, prázdné zůstávají dostupné a ztlumené. */
export const VatControlStatementView = forwardRef<HTMLDivElement, VatControlStatementViewProps>(
  function VatControlStatementView(
    {
      sections,
      activeSection,
      onSectionChange,
      onDocumentOpen,
      changed,
      currency,
      storageKey = "vat-control",
      hideEmptyColumns = false,
      loading,
      error,
      exportMeta,
      className,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().vatReports;
    const [local, setLocal] = useState<VatControlSection>("A1");
    const columns: DataGridColumn<VatControlDocument>[] = [
      { id: "dic", label: t.dic, value: (r) => r.dic },
      { id: "number", label: t.number, value: (r) => r.number },
      { id: "date", label: t.date, value: (r) => r.date, render: (r) => formatDate(r.date) },
      ...[21, 12].flatMap((rate) =>
        (["base", "tax"] as const).map((field) => ({
          id: `${field}${rate}`,
          label: `${t[field]} ${rate} % · ${currency}`,
          numeric: true,
          decimals: 2,
          value: (r: VatControlDocument) =>
            r.rates.find((item) => item.rate === rate)?.[field] ?? null,
        })),
      ),
      { id: "regime", label: t.regime, value: (r) => r.regime },
      { id: "subject", label: t.subject, value: (r) => r.subjectCode },
      {
        id: "changed",
        label: t.changed,
        value: (r) => (r.changed ? t.changed : ""),
        render: (r) =>
          r.changed ? (
            <StatusBadge
              status="changed"
              config={{ changed: { label: t.changed, tone: "warning" } }}
            />
          ) : null,
      },
    ];
    const summaryColumns: DataGridColumn<VatRateAmounts>[] = [
      { id: "rate", label: t.rate, value: (r) => `${r.rate} %` },
      {
        id: "base",
        label: `${t.base} · ${currency}`,
        numeric: true,
        decimals: 2,
        value: (r) => r.base,
      },
      {
        id: "tax",
        label: `${t.tax} · ${currency}`,
        numeric: true,
        decimals: 2,
        value: (r) => r.tax,
      },
    ];
    return (
      <div ref={ref} {...props} className={cn("min-w-0 space-y-2", className)}>
        {changed ? (
          <StatusBadge
            status="changed"
            config={{ changed: { label: t.changed, tone: "warning" } }}
          />
        ) : null}
        <div className="overflow-x-auto">
          <PageTabs
            listLabel={t.tabs}
            value={activeSection ?? local}
            onValueChange={(value) => {
              const section = SECTIONS.find((s) => s === value);
              if (!section) return;
              setLocal(section);
              onSectionChange?.(section);
            }}
            items={SECTIONS.map((value) => ({
              value,
              label: (
                <span
                  className={cn(
                    !(sections[value]?.documents?.length || sections[value]?.summary?.length) &&
                      "text-muted-foreground",
                  )}
                >
                  {value}
                </span>
              ),
            }))}
          >
            {SECTIONS.map((section) => (
              <TabsContent value={section} key={section}>
                {section === "A5" || section === "B3" ? (
                  <DataGrid
                    title={`${t.controlTitle} · ${section}`}
                    storageKey={`${storageKey}:${section}`}
                    rows={sections[section]?.summary ?? []}
                    columns={summaryColumns}
                    rowKey={(r) => String(r.rate)}
                    paginated={false}
                  />
                ) : (
                  <DataGrid
                    title={`${t.controlTitle} · ${section}`}
                    storageKey={`${storageKey}:${section}`}
                    rows={sections[section]?.documents ?? []}
                    columns={columns.filter(
                      (c) => c.id !== "subject" || section === "A1" || section === "B1",
                    )}
                    rowKey={(r) => r.id}
                    onRowOpen={(r) => onDocumentOpen?.(r.id)}
                  />
                )}
              </TabsContent>
            ))}
          </PageTabs>
        </div>
      </div>
    );
  },
);
