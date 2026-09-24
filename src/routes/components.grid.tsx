import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Archive, Building2 } from "lucide-react";

import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import {
  DataGrid,
  DocumentStatusBadge,
  FiscalPeriodSelect,
  GridToggleButton,
  accountColumns,
  debitCreditColumns,
  type DataGridColumn,
} from "@/components/ds";
import { MOCK_ACCOUNTS, MOCK_JOURNAL, MOCK_PERIODS, type JournalEntry } from "@/lib/mock/accounting";
import { DOCUMENT_STATUS_CONFIG } from "@/components/ds/accounting/document-status-badge";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/components/grid")({
  head: () => ({
    meta: [
      { title: "Datová mřížka – Slivka Design System" },
      {
        name: "description",
        content: "Plně funkční mřížka účetního deníku: filtry, seskupení, součty a export.",
      },
      { property: "og:title", content: "Datová mřížka – Slivka Design System" },
      {
        property: "og:description",
        content: "Plně funkční mřížka účetního deníku: filtry, seskupení, součty a export.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GridPage,
});

function GridPage() {
  const [periodId, setPeriodId] = useState(MOCK_PERIODS[0].id);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");
  const [asOfEnabled, setAsOfEnabled] = useState(true);
  const [asOfDate, setAsOfDate] = useState("2026-09-24");
  const [analytic, setAnalytic] = useState(true);
  const [byPartner, setByPartner] = useState(true);
  const [activeFilter, setActiveFilter] = useState(true);
  const accountNames = useMemo(
    () => new Map(MOCK_ACCOUNTS.map((account) => [account.code, account.name])),
    [],
  );

  const columns = useMemo<DataGridColumn<JournalEntry>[]>(
    () => [
      {
        id: "date",
        label: "Datum",
        exportType: "date",
        width: 110,
        value: (r) => r.date,
        render: (r) => formatDate(r.date),
      },
      { id: "document", label: "Doklad", width: 130, value: (r) => r.document },
      ...accountColumns<JournalEntry>({
        debit: (r) => r.debitAccount,
        credit: (r) => r.creditAccount,
        accountName: (code) => accountNames.get(code),
        section: "Zaúčtování",
      }),
      ...debitCreditColumns<JournalEntry>({
        debit: (r) => r.debit,
        credit: (r) => r.credit,
      }),
      { id: "symbol", label: "VS", width: 110, value: (r) => r.symbol },
      { id: "partner", label: "Partner", width: 200, value: (r) => r.partner },
      { id: "text", label: "Popis", width: 200, value: (r) => r.text },
      {
        id: "status",
        label: "Stav",
        value: (r) => DOCUMENT_STATUS_CONFIG[r.status].label,
        render: (r) => <DocumentStatusBadge status={r.status} />,
      },
    ],
    [accountNames],
  );

  return (
    <ShowcaseLayout
      breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Datová mřížka" }]}
    >
      <DataGrid<JournalEntry>
        storageKey="ds-showcase-journal"
        title="Účetní deník"
        exportName="ucetni-denik"
        rows={MOCK_JOURNAL}
        columns={columns}
        rowKey={(r) => r.id}
        defaultSort="date"
        columnFilters
        groupable
        paginated
        selectable
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        asOf={{ enabled: asOfEnabled, onEnabledChange: setAsOfEnabled, value: asOfDate, onChange: setAsOfDate, defaultDate: "2026-09-24" }}
        filters={<span className="text-sm text-muted-foreground">Pomocné filtry účetního deníku</span>}
        defaultFilters={["Rok 2026"]}
        filterChips={activeFilter ? [{ id: "posted", label: "Stav: Zaúčtován", onRemove: () => setActiveFilter(false) }] : []}
        onClearFilters={() => setActiveFilter(false)}
        refreshing={refreshing}
        onRefresh={async () => {
          setRefreshing(true);
          await new Promise((resolve) => window.setTimeout(resolve, 1500));
          setRefreshing(false);
          toast.success("Data byla obnovena");
        }}
        showTotalRow
        moreActions={[{ label: "Archivovat uzavřené", icon: <Archive className="size-4" />, onSelect: () => { toast.info("Archivace"); } }]}
        addAction={{ label: "Přidat doklad", onClick: () => { toast.info("Nový doklad"); } }}
        pdfExport={async () => { toast.success("Vlastní PDF sestava byla připravena"); return; }}
        extraExports={[{ label: "Kontrolní sestava", kind: "pdf", onExport: async () => { toast.info("Kontrolní sestava"); } }]}
        toolbarLeft={
          <>
            <FiscalPeriodSelect periods={MOCK_PERIODS} value={periodId} onChange={setPeriodId} className="w-[280px]" />
            <GridToggleButton pressed={analytic} tone="mode" icon={<Building2 className="size-4" />} onClick={() => setAnalytic((value) => !value)}>Analytické účty</GridToggleButton>
            <GridToggleButton pressed={byPartner} tone="grouping" onClick={() => setByPartner((value) => !value)}>Podle partnera</GridToggleButton>
          </>
        }
        onEditRow={(r) => toast.info(`Otevřít doklad ${r.document}`)}
        onDeleteRow={(r) => toast.success(`Doklad ${r.document} odstraněn`)}
        deleteConfirm={(r) => `Odstranit doklad ${r.document}?`}
      />
    </ShowcaseLayout>
  );
}
