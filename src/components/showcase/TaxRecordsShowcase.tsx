/** Trvalé ukázky DE s daty preview; zdroje účetních zápisů vlastní APP. */
import { useState } from "react";
import { TaxYearShowcase } from "./TaxYearShowcase";
import {
  JournalLinesEditor,
  TaxBookView,
  TaxCategorySummary,
  CashCheckPanel,
  TaxBookEntriesPanel,
  BookkeepingModeSelect,
  BookkeepingSettingsFields,
  type JournalLine,
  type TaxBookEntry,
  type BookkeepingMode,
  type TaxMovementKind,
} from "../ds";
import { useDsTexts } from "../../ds-texts";
const taxItems = [
  {
    code: "602001",
    name: "Tržby za služby",
    displayCode: "SL",
    category: "ekonomicka_kategorie",
    accountType: "vynosovy",
  },
  { code: "501001", name: "Materiál", category: "ekonomicka_kategorie", accountType: "nakladovy" },
  { code: "211001", name: "Technická pokladna", technical: true },
];
const rows: TaxBookEntry[] = [
  {
    id: "p1",
    date: "2026-10-10",
    paymentDocumentId: "po1",
    paymentDocument: "PO2026001",
    invoiceId: "fv1",
    invoice: "FV2026001",
    itemId: "602001",
    item: "Tržby za služby",
    treatment: "taxable",
    taxCategoryId: "s7",
    taxCategory: "§ 7 – Služby",
    categoryId: "c1",
    category: "Provoz",
    amount: 12000,
    currency: "CZK",
    movementAmount: 12000,
    vat: 0,
  },
  {
    id: "p2",
    date: "2026-10-12",
    paymentDocumentId: "ba1",
    paymentDocument: "BA2026001",
    itemId: "501001",
    item: "Materiál",
    treatment: "taxable",
    taxCategory: "§ 7 – Výdaje",
    amount: -2400,
    currency: "EUR",
    movementAmount: -100,
    vat: 0,
  },
  {
    id: "p3",
    date: "2026-10-13",
    paymentDocumentId: "ba2",
    paymentDocument: "BA2026002",
    item: "",
    treatment: "taxable",
    amount: 3000,
    currency: "CZK",
    movementAmount: 3000,
    vat: 0,
    unassigned: true,
  },
];
export function TaxRecordsShowcase() {
  const t = useDsTexts().taxRecords;
  const [mode, setMode] = useState<BookkeepingMode>("tax_records");
  const [movement, setMovement] = useState<TaxMovementKind>("non_cash_income");
  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: "line1",
      text: "Služby říjen",
      amount: 12000,
      debitAccount: "211001",
      creditAccount: "602001",
      counterAccount: "602001",
    },
  ]);
  const [internal, setInternal] = useState<JournalLine[]>([
    {
      id: "id1",
      text: "Nepeněžní pohyb",
      amount: 1000,
      debitAccount: "602001",
      creditAccount: "211001",
    },
  ]);
  const [event, setEvent] = useState("");
  const [rounding, setRounding] = useState<{ income?: string | null; expense?: string | null }>({
    income: "602001",
    expense: "501001",
  });
  return (
    <div data-testid="tax-records-showcase" className="space-y-8">
      <BookkeepingModeSelect value={mode} onChange={setMode} />
      <output data-testid="tax-event" aria-live="polite">
        {event}
      </output>
      <section data-testid="tax-lines">
        <h2 className="mb-3 text-lg font-semibold">{t.item}</h2>
        <JournalLinesEditor
          bookkeepingMode={mode}
          mode="mainAccount"
          mainSide="MD"
          mainAccount="211001"
          accounts={taxItems}
          categoriesEnabled={false}
          lines={lines}
          onChange={setLines}
          homeCurrency="CZK"
          documentCurrency="CZK"
          storageKey="tax-showcase-lines"
        />
        <output className="sr-only" data-testid="tax-line-value">
          {lines[0]?.creditAccount}
        </output>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">{t.movement}</h2>
        <JournalLinesEditor
          bookkeepingMode="tax_records"
          mode="internal"
          taxMovementKind={movement}
          onTaxMovementKindChange={setMovement}
          accounts={taxItems}
          categoriesEnabled={false}
          lines={internal}
          onChange={setInternal}
          homeCurrency="CZK"
          documentCurrency="CZK"
          storageKey="tax-showcase-internal"
        />
      </section>
      <section data-testid="tax-book">
        <h2 className="mb-3 text-lg font-semibold">{t.title}</h2>
        <TaxBookView
          rows={rows}
          homeCurrency="CZK"
          periods={[{ id: "oct", label: "Říjen 2026", from: "2026-10-01", to: "2026-10-31" }]}
          onDocumentOpen={setEvent}
          onUnassignedOpen={(r) => setEvent(`Úhrada ${r.id}`)}
          storageKey="tax-showcase-book"
        />
      </section>
      <TaxCategorySummary
        currency="CZK"
        rows={[
          {
            id: "s7",
            label: "Služby",
            paragraph: "7",
            income: 12000,
            expense: 2400,
            percentage: 60,
            cap: 1200000,
            calculatedExpense: 7200,
          },
        ]}
        unassignedAmount={3000}
        onCategoryOpen={setEvent}
        onUnassignedOpen={() => setEvent("Nezařazené úhrady")}
      />
      <CashCheckPanel
        rows={[
          {
            id: "cash",
            label: "Pokladna",
            currency: "CZK",
            opening: 5000,
            movements: 12000,
            closing: 17000,
            difference: 0,
          },
          {
            id: "bank",
            label: "Banka",
            currency: "CZK",
            opening: 20000,
            movements: 600,
            closing: 20500,
            difference: 100,
          },
        ]}
        onAccountOpen={setEvent}
      />
      <TaxBookEntriesPanel entries={rows} currency="CZK" onEntryOpen={(r) => setEvent(r.id)} />
      <BookkeepingSettingsFields
        bookkeepingMode={mode}
        items={taxItems}
        value={rounding}
        onValueChange={setRounding}
      />
      <TaxYearShowcase />
    </div>
  );
}
