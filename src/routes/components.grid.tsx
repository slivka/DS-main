import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ShowcaseLayout } from "@/components/showcase/ShowcaseLayout";
import {
  AccountCode,
  DataGrid,
  DocumentStatusBadge,
  FiscalPeriodSelect,
  debitCreditColumns,
  type DataGridColumn,
} from "@/components/ds";
import { MOCK_JOURNAL, MOCK_PERIODS, type JournalEntry } from "@/lib/mock/accounting";
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

  const columns = useMemo<DataGridColumn<JournalEntry>[]>(
    () => [
      {
        id: "date",
        label: "Datum",
        width: 110,
        value: (r) => r.date,
        render: (r) => formatDate(r.date),
      },
      { id: "document", label: "Doklad", width: 130, value: (r) => r.document },
      {
        id: "debitAccount",
        label: "Účet MD",
        width: 150,
        value: (r) => r.debitAccount,
        render: (r) => <AccountCode code={r.debitAccount} />,
      },
      {
        id: "creditAccount",
        label: "Účet Dal",
        width: 150,
        value: (r) => r.creditAccount,
        render: (r) => <AccountCode code={r.creditAccount} />,
      },
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
        width: 130,
        value: (r) => DOCUMENT_STATUS_CONFIG[r.status].label,
        render: (r) => <DocumentStatusBadge status={r.status} />,
      },
    ],
    [],
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
