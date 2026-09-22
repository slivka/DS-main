import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import {
  DataGrid,
  DocumentStatusBadge,
  FiscalPeriodSelect,
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
        showTotalRow
        toolbarLeft={
          <FiscalPeriodSelect
            periods={MOCK_PERIODS}
            value={periodId}
            onChange={setPeriodId}
            className="w-[280px]"
          />
        }
        onEditRow={(r) => toast.info(`Otevřít doklad ${r.document}`)}
        onDeleteRow={(r) => toast.success(`Doklad ${r.document} odstraněn`)}
        deleteConfirm={(r) => `Odstranit doklad ${r.document}?`}
      />
    </ShowcaseLayout>
  );
}
