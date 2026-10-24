/** Ukázky výkazů · pouze preview data a callbacky · nesmí být součástí knihovny. */
import { useState } from "react";
import {
  FinancialStatementView,
  SavedStatementList,
  StatementSaveDialog,
  StatementTemplateEditor,
  Button,
  type SavedStatement,
  type StatementRow,
  type StatementSaveValue,
  type StatementTemplateRow,
} from "../ds";

const v = (full: Record<string, number>, thousands: Record<string, number>) => ({
  full,
  thousands,
});

const balanceRows: StatementRow[] = [
  {
    id: "A",
    mark: "",
    label: "AKTIVA CELKEM",
    kind: "sum",
    values: v(
      { b: 5_430_000, k: 1_210_500.4, n: 4_219_499.6, p: 3_980_200 },
      { b: 5_430, k: 1_211, n: 4_219, p: 3_980 },
    ),
  },
  {
    id: "B",
    parentId: "A",
    mark: "B.",
    label: "Stálá aktiva",
    kind: "sum",
    values: v(
      { b: 3_200_000, k: 1_210_500.4, n: 1_989_499.6, p: 2_100_000 },
      { b: 3_200, k: 1_211, n: 1_989, p: 2_100 },
    ),
    rounded: true,
  },
  {
    id: "B.II",
    parentId: "B",
    mark: "B.II.",
    label: "Dlouhodobý hmotný majetek",
    kind: "mapped",
    values: v(
      { b: 3_200_000, k: 1_210_500.4, n: 1_989_499.6, p: 2_100_000 },
      { b: 3_200, k: 1_211, n: 1_989, p: 2_100 },
    ),
  },
  {
    id: "C",
    parentId: "A",
    mark: "C.",
    label: "Oběžná aktiva",
    kind: "sum",
    values: v(
      { b: 2_230_000, k: 0, n: 2_230_000, p: 1_880_200 },
      { b: 2_230, k: 0, n: 2_230, p: 1_880 },
    ),
  },
  {
    id: "C.IV",
    parentId: "C",
    mark: "C.IV.",
    label: "Peněžní prostředky",
    kind: "mapped",
    values: v(
      { b: 2_230_000, k: 0, n: 2_230_000, p: 1_880_200 },
      { b: 2_230, k: 0, n: 2_230, p: 1_880 },
    ),
  },
];

const incomeRowsInitial: StatementRow[] = [
  {
    id: "I",
    mark: "I.",
    label: "Tržby z prodeje výrobků a služeb",
    kind: "mapped",
    values: v({ c: 8_120_400, p: 7_400_000 }, { c: 8_120, p: 7_400 }),
  },
  {
    id: "A",
    mark: "A.",
    label: "Výkonová spotřeba",
    kind: "mapped",
    values: v({ c: -5_210_300, p: -4_900_000 }, { c: -5_210, p: -4_900 }),
  },
  {
    id: "*",
    mark: "*",
    label: "Výsledek hospodaření za účetní období",
    kind: "sum",
    values: v({ c: 2_910_100, p: 2_500_000 }, { c: 2_910, p: 2_500 }),
    rounded: true,
  },
];

const saved: SavedStatement[] = [
  {
    id: "1",
    name: "Rozvaha 2025 – audit",
    kind: "balance",
    period: "2025",
    unit: "thousands",
    savedBy: "Petra Nováková",
    savedAt: "2026-03-12T10:24:00",
  },
  {
    id: "2",
    name: "Výsledovka 2025",
    kind: "income",
    period: "2025",
    unit: "full",
    savedBy: "Jan Dvořák",
    savedAt: "2026-03-10T08:05:00",
  },
];

const templateInitial: StatementTemplateRow[] = [
  { id: "t1", mark: "A.", label: "Stálá aktiva", kind: "sum", mapping: [] },
  {
    id: "t2",
    parentId: "t1",
    mark: "A.I.",
    label: "Dlouhodobý nehmotný majetek",
    kind: "mapped",
    mapping: ["01"],
  },
  {
    id: "t3",
    parentId: "t1",
    mark: "A.II.",
    label: "Dlouhodobý hmotný majetek",
    kind: "mapped",
    mapping: [],
  },
];

export function StatementsShowcase() {
  const [income, setIncome] = useState(incomeRowsInitial);
  const [items, setItems] = useState(saved);
  const [dialog, setDialog] = useState(false);
  const [save, setSave] = useState<StatementSaveValue>({
    name: "",
    kind: "balance",
    period: "2026",
    unit: "thousands",
  });
  const [template, setTemplate] = useState(templateInitial);
  const [opened, setOpened] = useState("");
  return (
    <div className="space-y-10" data-testid="statements-showcase">
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Rozvaha</h2>
        <FinancialStatementView
          kind="balance"
          currency="Kč"
          defaultUnit="thousands"
          rows={balanceRows}
          columns={[
            { id: "b", label: "Brutto" },
            { id: "k", label: "Korekce" },
            { id: "n", label: "Netto" },
            { id: "p", label: "Minulé období" },
          ]}
          checks={[
            { kind: "balance", ok: true },
            { kind: "profit", ok: true },
          ]}
          onRowOpen={(row) => setOpened(`${row.mark} ${row.label}`)}
        />
        {opened ? <p className="text-sm text-muted-foreground">Rozpis účtů: {opened}</p> : null}
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Uložená výsledovka v úpravách</h2>
        <FinancialStatementView
          kind="income"
          currency="Kč"
          storageKey="statement:income-edit"
          rows={income}
          editable
          columns={[
            { id: "c", label: "Běžné období" },
            { id: "p", label: "Minulé období" },
          ]}
          checks={[{ kind: "profit", ok: false, difference: 1 }]}
          onValuesChange={(patch) =>
            setIncome((rows) =>
              rows.map((row) =>
                row.id === patch.rowId
                  ? {
                      ...row,
                      values: {
                        ...row.values,
                        [patch.unit]: { ...row.values[patch.unit], [patch.columnId]: patch.value },
                      },
                    }
                  : row,
              ),
            )
          }
        />
      </section>
      <section className="space-y-2">
        <SavedStatementList
          items={items}
          currency="Kč"
          onOpen={(item) => setOpened(item.name)}
          onDuplicate={(item) =>
            setItems((list) => [
              ...list,
              { ...item, id: `${item.id}-k`, name: `${item.name} (kopie)` },
            ])
          }
          onRename={(item) => setOpened(`Přejmenovat: ${item.name}`)}
          onDelete={(item) => setItems((list) => list.filter((row) => row.id !== item.id))}
          onCreateFromLedger={() => setDialog(true)}
        />
        <Button variant="outline" onClick={() => setDialog(true)}>
          Uložit výkaz
        </Button>
        <StatementSaveDialog
          open={dialog}
          onOpenChange={setDialog}
          value={save}
          onChange={setSave}
          currency="Kč"
          periods={[
            { value: "2026", label: "2026" },
            { value: "2025", label: "2025" },
          ]}
          onSubmit={() => setDialog(false)}
        />
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Šablona výkazu</h2>
        <StatementTemplateEditor
          rows={template}
          onChange={setTemplate}
          mappingOptions={[
            { value: "01", label: "01 – DNM" },
            { value: "02", label: "02 – DHM odpisovaný" },
            { value: "03", label: "03 – DHM neodpisovaný" },
          ]}
          issues={
            template.some((row) => row.kind === "mapped" && !row.mapping.length)
              ? Object.fromEntries(
                  template
                    .filter((row) => row.kind === "mapped" && !row.mapping.length)
                    .map((row) => [row.id, "Mapovaný řádek musí mít alespoň jeden účet"]),
                )
              : undefined
          }
        />
      </section>
    </div>
  );
}
