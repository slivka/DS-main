/** Ukázka formátu sloupců · fiktivní faktury · pouze náhled knihovny. */
import { useEffect, useState } from "react";
import { DataGrid } from "../ds/grid/DataGrid";
import { SectionHeading } from "../ds/layout/section-heading";
import { useCellStatusTooltip } from "../ds/grid/cell-status-tooltip";
import { fmtAmount } from "../../lib/format";
import { useDsTexts } from "../../ds-texts";

const rows = [
  {
    id: "1",
    document: "FV-2026-001",
    partner: "Alfa servis s.r.o.",
    total: 12540,
    remaining: 6540,
  },
  { id: "2", document: "FV-2026-002", partner: "Beta obchod a.s.", total: -2420, remaining: -2420 },
  {
    id: "3",
    document: "FV-2026-003",
    partner: "Gama výroba s.r.o.",
    total: 18500,
    remaining: 18500,
  },
];
function Remaining({ row }: { row: (typeof rows)[number] }) {
  const t = useDsTexts().columnPicker;
  const { triggerProps, tooltip } = useCellStatusTooltip({
    error: row.id === "3" ? t.demoError : undefined,
  });
  return (
    <span
      {...triggerProps}
      data-invalid={row.id === "3" ? "true" : undefined}
      className={row.remaining < 0 ? "text-destructive" : undefined}
    >
      {fmtAmount(row.remaining, 2)}
      {tooltip}
    </span>
  );
}
/** Faktury s výchozím formátem a výběrem přes podklad. */
export function ColumnFormatShowcase() {
  const t = useDsTexts().columnPicker;
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [selected, setSelected] = useState(["1"]);
  return (
    <section
      data-ready={ready}
      data-testid="column-format-showcase"
      className="mb-6"
      aria-label={t.demoTitle}
    >
      <SectionHeading>{t.demoTitle}</SectionHeading>
      <DataGrid
        storageKey="column-format-demo"
        title={t.demoTitle}
        exportName="column-format"
        rows={rows}
        rowKey={(row) => row.id}
        selectable
        selectMode
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        paginated={false}
        groupable={false}
        defaultSort={null}
        columns={[
          { id: "document", label: t.demoDocument, value: (row) => row.document },
          { id: "partner", label: t.demoPartner, value: (row) => row.partner },
          {
            id: "total",
            label: t.demoTotal,
            value: (row) => row.total,
            numeric: true,
            decimals: 2,
            defaultStyle: { bold: true },
          },
          {
            id: "remaining",
            label: t.demoRemaining,
            value: (row) => row.remaining,
            render: (row) => <Remaining row={row} />,
            numeric: true,
            decimals: 2,
            defaultStyle: { bold: true, tone: "blue-soft" },
          },
        ]}
      />
    </section>
  );
}
