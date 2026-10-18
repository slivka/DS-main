/** Ukázka dvou primárních akcí lišty · vlastní náhledová data · nesmí být součástí knihovny. */
import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { DataGrid, type DataGridColumn, type GridAddAction } from "../ds";
import { formatAmount } from "../../lib/format";
import { ShowcaseSection } from "./ShowcaseLayout";

interface Movement {
  id: string;
  text: string;
  amount: number;
}
const ROWS: Movement[] = [
  { id: "1", text: "Úhrada faktury FV2026000420", amount: 5000 },
  { id: "2", text: "Nájem kanceláře", amount: -2500 },
];

/** Pohyby výpisu / pokladny s akcemi příjem a výdaj; sdílené i v ukázce výpisu. */
export function MovementsGrid({
  storageKey,
  onAction,
  outDisabledReason,
}: {
  storageKey: string;
  onAction?: (kind: "in" | "out") => void;
  /** Ukázka zablokované akce Výdaj s důvodem. */
  outDisabledReason?: string;
}) {
  const columns = useMemo<DataGridColumn<Movement>[]>(
    () => [
      { id: "text", label: "Popis", width: 220, value: (row) => row.text },
      {
        id: "amount",
        label: "Částka",
        width: 120,
        align: "right",
        value: (row) => row.amount,
        render: (row) => formatAmount(row.amount),
      },
    ],
    [],
  );
  const actions: GridAddAction[] = [
    {
      label: "Nový příjem",
      shortLabel: "Příjem",
      icon: ArrowDownLeft,
      onClick: () => onAction?.("in"),
    },
    {
      label: "Nový výdaj",
      shortLabel: "Výdaj",
      icon: ArrowUpRight,
      onClick: () => onAction?.("out"),
      disabled: Boolean(outDisabledReason),
      disabledReason: outDisabledReason,
    },
  ];
  return (
    <DataGrid<Movement>
      storageKey={storageKey}
      rows={ROWS}
      columns={columns}
      rowKey={(row) => row.id}
      addAction={actions}
      paginated={false}
    />
  );
}

const LOCKED = "Pokladna je uzavřená – výdaj nelze přidat";

/** Výpis a pokladna ve třech šířkách: plné texty, zkrácené texty, sloučená nabídka. */
export function PrimaryActionsShowcase() {
  const [last, setLast] = useState("–");
  return (
    <ShowcaseSection
      title="Dvě primární akce lišty gridu"
      description="Široká: plné texty · užší: zkrácené texty · nejužší: jedno tlačítko + ▾ s nabídkou."
    >
      <p data-testid="primary-actions-last" className="mb-2 text-sm">
        Poslední akce: {last}
      </p>
      {[
        { key: "wide", width: "w-[60rem]", title: "Pohyby výpisu" },
        { key: "short", width: "w-[17rem]", title: "Pokladna" },
        { key: "menu", width: "w-[13rem]", title: "Pokladna – úzký panel" },
        { key: "locked", width: "w-[60rem]", title: "Uzavřené období", reason: LOCKED },
        { key: "locked-menu", width: "w-[13rem]", title: "Uzavřené – úzký", reason: LOCKED },
      ].map((item: { key: string; width: string; title: string; reason?: string }) => (
        <div
          key={item.key}
          data-testid={`primary-actions-${item.key}`}
          className={`${item.width} mb-4 max-w-none`}
        >
          <MovementsGrid
            storageKey={`primary-actions-${item.key}`}
            outDisabledReason={item.reason}
            onAction={(kind) => setLast(`${item.title}: ${kind === "in" ? "příjem" : "výdaj"}`)}
          />
        </div>
      ))}
    </ShowcaseSection>
  );
}
