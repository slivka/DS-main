/** Ukázky DE-4 až DE-6 pro neplátce i plátce DPH; data preview, výpočty vlastní APP. */
import { useState } from "react";
import {
  TaxBookView,
  TaxAssetCard,
  TaxInternalMovementFields,
  TransportAllowanceGrid,
  TaxYearCloseWizard,
  TaxReturnOutput,
  TaxYearCarryForward,
  OptionSelect,
  type TaxBookEntry,
  type TaxInternalMovementValue,
  type TransportAllowanceCell,
} from "@/components/ds";
const items = [
  { id: "i1", label: "Tržby za služby", displayCode: "SL" },
  { id: "i2", label: "Materiál" },
  { id: "i3", label: "Pohonné hmoty" },
  { id: "t1", label: "Technický účet", technical: true },
];
const base: TaxBookEntry = {
  id: "",
  date: "2026-11-02",
  paymentDocumentId: "ba10",
  paymentDocument: "BA2026010",
  item: "Tržby za služby",
  treatment: "taxable",
  amount: 0,
  currency: "CZK",
  movementAmount: 0,
  vat: 0,
};
function bookRows(payer: boolean): TaxBookEntry[] {
  const row = (id: string, kind: TaxBookEntry["kind"], total: number, invoice: string) => ({
    ...base,
    id,
    kind,
    invoiceId: invoice,
    invoice,
    amount: total,
    movementAmount: total,
    ...(payer ? { base: Math.round((total / 1.21) * 100) / 100, vat: Math.round((total - total / 1.21) * 100) / 100 } : {}),
  });
  return [
    row("a1", "advance", 12100, "ZL2026001"),
    ...(payer ? [row("a2", "advance_tax_document", 12100, "DD2026001")] : []),
    row("a3", "advance_deduction", -12100, "FV2026015"),
    row("a4", "payment", 24200, "FV2026015"),
  ];
}
export function TaxYearShowcase() {
  const [payer, setPayer] = useState(false);
  const [event, setEvent] = useState("");
  const [movement, setMovement] = useState<TaxInternalMovementValue>({
    kind: "transfer",
    fromItemId: "i2",
    toItemId: "i3",
    amount: "1500",
    reason: "Oprava zařazení",
  });
  const [cells, setCells] = useState<TransportAllowanceCell[]>([
    { monthId: "01", vehicleId: "v1", count: 1, amount: 5000, documentId: "id1" },
    { monthId: "02", vehicleId: "v1", count: 1, amount: 5000 },
    { monthId: "02", vehicleId: "v2", count: 1, amount: 4000 },
  ]);
  return (
    <div data-testid="tax-year-showcase" className="space-y-8">
      <OptionSelect
        ariaLabel="Plátce DPH"
        value={payer ? "payer" : "non"}
        allowEmpty={false}
        options={[
          { value: "non", label: "DE firma – neplátce DPH" },
          { value: "payer", label: "DE firma – plátce DPH" },
        ]}
        onChange={(v) => setPayer(v === "payer")}
      />
      <output data-testid="tax-year-event" aria-live="polite">
        {event}
      </output>
      <TaxBookView
        rows={bookRows(payer)}
        homeCurrency="CZK"
        onDocumentOpen={setEvent}
        storageKey={`tax-year-book-${payer ? "payer" : "non"}`}
      />
      <TaxAssetCard
        currency="CZK"
        asset={{
          name: "Dodávka Ford Transit",
          inventoryNumber: "M-2025-01",
          acquisitionDate: "2025-03-10",
          acquisitionPrice: 600000,
          depreciationGroup: "2",
          method: "straight",
          series: [
            { year: 2025, depreciation: 66000, residualValue: 534000, posted: true },
            { year: 2026, depreciation: 133500, residualValue: 400500 },
          ],
        }}
        onYearOpen={(r) => setEvent(`Odpis ${r.year}`)}
      />
      <TaxAssetCard
        currency="CZK"
        asset={{ name: "Notebook", acquisitionPrice: 42000, lowValue: true, series: [] }}
      />
      <TaxInternalMovementFields value={movement} onChange={setMovement} items={items} currency="CZK" />
      <TransportAllowanceGrid
        currency="CZK"
        months={[
          { id: "01", label: "Leden" },
          { id: "02", label: "Únor" },
        ]}
        vehicles={[
          { id: "v1", label: "Škoda Octavia" },
          { id: "v2", label: "Ford Transit (smíšené)" },
        ]}
        cells={cells}
        onCountChange={(m, v, count) =>
          setCells((all) => [...all.filter((c) => c.monthId !== m || c.vehicleId !== v), { monthId: m, vehicleId: v, count, amount: count ? 5000 : null }])
        }
        onCreateDocuments={() => setEvent("Interní doklady paušálu")}
        onDocumentOpen={setEvent}
      />
      <TransportAllowanceGrid
        currency="CZK"
        months={[{ id: "01", label: "Leden" }]}
        vehicles={[{ id: "v1", label: "Škoda Octavia" }]}
        cells={[]}
        disabledReason="Paušál na dopravu nelze uplatnit při výdajích procentem (§ 7)."
      />
      <TaxYearCloseWizard
        year={2026}
        checks={[
          { id: "u", title: "Nezařazené úhrady: 1", severity: "blocking", actionLabel: "Otevřít", onAction: () => setEvent("Nezařazené") },
          { id: "r", title: "Neuhrazené pohledávky k 31. 12.: 2", severity: "info" },
          { id: "c", title: "Kontrola peněz bez rozdílů", severity: "ok" },
        ]}
        onCloseYear={() => setEvent("Uzavřít rok")}
      />
      <TaxReturnOutput
        year={2026}
        currency="CZK"
        rows={[
          { id: "l101", line: "101", label: "Příjmy dle § 7", amount: 1250000 },
          { id: "l102", line: "102", label: "Výdaje dle § 7", amount: 412300 },
        ]}
        onLineOpen={(r) => setEvent(`Řádek ${r.line}`)}
      />
      <TaxYearCarryForward fromYear={2026} status="ready" onCarryForward={() => setEvent("Převod")} />
    </div>
  );
}
