import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Archive, Building2 } from "lucide-react";

import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import {
  DataGrid,
  TreeGrid,
  DocumentStatusBadge,
  GridContextBar,
  GridSegmentedToggle,
  GRID_DIRECTION_OPTIONS,
  filterByDirection,
  GridToggleButton,
  gridPeriodRange,
  accountColumns,
  debitCreditColumns,
  type DataGridColumn,
} from "@/components/ds";
import { MOCK_ACCOUNTS, MOCK_JOURNAL, type JournalEntry } from "@/lib/mock/accounting";
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
  const [period, setPeriod] = useState(() => gridPeriodRange("2026-07-01", "2027-06-30", "all"));
  const [bookId, setBookId] = useState<string | "all">("all");
  const [cashBookId, setCashBookId] = useState<string | "all">("all");
  const [singleBookPeriod, setSingleBookPeriod] = useState(() => gridPeriodRange("2026-07-01", "2027-06-30", "month", 0));
  const [direction, setDirection] = useState<"all" | "in" | "out">("all");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");
  const [asOfEnabled, setAsOfEnabled] = useState(true);
  const [asOfDate, setAsOfDate] = useState("2026-09-24");
  const [analytic, setAnalytic] = useState(true);
  const [byPartner, setByPartner] = useState(true);
  const [activeFilter, setActiveFilter] = useState(true);
  const books = useMemo(() => [
    { id: "pczk", code: "PCZK", name: "Pokladna CZK" },
    { id: "peur", code: "PEUR", name: "Pokladna EUR" },
    { id: "csob", code: "CSOB", name: "Banka ČSOB" },
  ], []);
  const rowBookId = (row: JournalEntry) => books[Math.abs(Number(row.id.replace(/\D/g, "")) || 0) % books.length]?.id ?? books[0]?.id;
  const cashRows = useMemo(() => filterByDirection(MOCK_JOURNAL.slice(0, 12), direction, (row) => Number(row.id.replace(/\D/g, "")) % 2 ? "in" : "out"), [direction]);
  const directionToggle = <GridSegmentedToggle options={GRID_DIRECTION_OPTIONS} value={direction} onChange={(value) => { if (value === "all" || value === "in" || value === "out") setDirection(value); }} defaultValue="all" ariaLabel="Směr pokladního dokladu" />;
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
        viewZoomKey="ds-showcase-journal-view"
        period={{ fiscalFrom: "2026-07-01", fiscalTo: "2027-06-30", value: period, onChange: setPeriod, today: "2026-09-24" }}
        book={{ books, value: bookId, onChange: setBookId, getRowBookId: rowBookId }}
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
        addAction={{ label: "Nový doklad", onClick: () => { toast.info("Nový doklad"); } }}
        pdfExport={async () => { toast.success("Vlastní PDF sestava byla připravena"); return; }}
        extraExports={[{ label: "Kontrolní sestava", kind: "pdf", onExport: async () => { toast.info("Kontrolní sestava"); } }]}
        toolbarLeft={
          <>
            <GridToggleButton pressed={analytic} tone="mode" icon={<Building2 className="size-4" />} onClick={() => setAnalytic((value) => !value)}>Analytické účty</GridToggleButton>
            <GridToggleButton pressed={byPartner} tone="grouping" onClick={() => setByPartner((value) => !value)}>Podle partnera</GridToggleButton>
          </>
        }
        onEditRow={(r) => toast.info(`Otevřít doklad ${r.document}`)}
        onDeleteRow={(r) => toast.success(`Doklad ${r.document} odstraněn`)}
        deleteConfirm={(r) => `Odstranit doklad ${r.document}?`}
        deleteDisabledReason={(r) => r.status === "posted" ? "Zaúčtovaný doklad nelze odstranit – nejdřív ho odúčtujte." : undefined}
      />
      <div className="mt-8">
        <TreeGrid<JournalEntry>
          title="Účetní deník – strom"
          exportName="ucetni-denik-strom"
          rows={MOCK_JOURNAL}
          columns={columns.map((column) => ({ ...column, render: column.render ? (row: JournalEntry) => column.render?.(row) : undefined }))}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          viewZoomKey="ds-showcase-journal-view"
          addAction={{ label: "Nový doklad", onClick: () => toast.info("Nový doklad") }}
          onEditRow={(row) => toast.info(`Otevřít doklad ${row.document}`)}
          onDeleteRow={(row) => toast.success(`Doklad ${row.document} odstraněn`)}
          deleteDisabledReason={(row) => row.status === "posted" ? "Zaúčtovaný doklad nelze odstranit – nejdřív ho odúčtujte." : undefined}
          onRefresh={() => toast.success("Data byla obnovena")}
        />
      </div>
      <div className="mt-8 w-[39rem] max-w-full">
        <DataGrid<JournalEntry>
          storageKey="ds-showcase-narrow-grid"
          title="Úzký panel"
          rows={MOCK_JOURNAL.slice(0, 5)}
          columns={columns}
          rowKey={(row) => row.id}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          addAction={{ label: "Nový doklad", onClick: () => toast.info("Nový doklad") }}
          filters={<span className="text-muted-foreground">Filtry</span>}
          onRefresh={() => toast.success("Data byla obnovena")}
        />
      </div>
      <div className="mt-8">
        <DataGrid<JournalEntry>
          storageKey="ds-showcase-cash-direction"
          title="Pokladna"
          rows={cashRows}
          columns={columns}
          rowKey={(row) => row.id}
          period={{ fiscalFrom: "2026-07-01", fiscalTo: "2027-06-30", value: singleBookPeriod, onChange: setSingleBookPeriod, today: "2026-09-24" }}
          book={{ books: books.slice(0, 2), value: cashBookId, onChange: setCashBookId, getRowBookId: rowBookId }}
          contextRight={directionToggle}
          showTotalRow
        />
      </div>
      <div className="mt-8">
        <DataGrid<JournalEntry>
          storageKey="ds-showcase-single-book-direction"
          title="Pokladna CZK"
          rows={cashRows.slice(0, 4)}
          columns={columns}
          rowKey={(row) => row.id}
          period={{ fiscalFrom: "2026-07-01", fiscalTo: "2027-06-30", value: singleBookPeriod, onChange: setSingleBookPeriod, today: "2026-09-24" }}
          book={{ books: books.slice(0, 1), value: "pczk", onChange: () => {} }}
          contextRight={directionToggle}
          showTotalRow
        />
      </div>
      <div className="mt-8 max-w-3xl">
        <GridContextBar
          period={{ fiscalFrom: "2026-07-01", fiscalTo: "2027-06-30", value: period, onChange: setPeriod, today: "2026-09-24" }}
          book={{ books, value: bookId, onChange: setBookId }}
          contextRight={directionToggle}
          className="rounded-t-lg border"
        />
      </div>
      <div className="mt-8 max-w-3xl">
        <GridContextBar
          period={{ fiscalFrom: "2026-07-01", fiscalTo: "2027-06-30", value: period, onChange: setPeriod, today: "2026-09-24" }}
          className="rounded-t-lg border"
        />
      </div>
      <div className="mt-8 max-w-3xl">
        <GridContextBar
          book={{ books, value: "csob", readOnly: true }}
          className="rounded-t-lg border"
        />
      </div>
    </ShowcaseLayout>
  );
}
