/** Skutečný editor pro měření · vlastní ukázková data · nesmí přepisovat výšku ovládání. */
import { useState } from "react";
import { JournalLinesEditor } from "@/components/ds/accounting/journal-lines-editor";
import type { JournalLine } from "@/components/ds/accounting/journal-lines";
import { MOCK_ACCOUNTS, MOCK_PARTNERS, MOCK_VAT_CODES_IN } from "@/lib/mock/accounting";

/** Editor se skutečnou validací poměrného nároku. */
export function JournalHeightShowcase() {
  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: "height-row",
      text: "Licence",
      debitAccount: "518001",
      creditAccount: "321001",
      amount: 1000,
      quantity: 2,
      unitPrice: 500,
      unitId: "ks",
      vs: "2026000901",
      partnerId: "p2",
      vatCodeId: "p21",
      vatDeduction: "partial",
      vatDeductionShare: 0,
    },
  ]);
  return (
    <section data-slot="real-journal-height">
      <JournalLinesEditor
        storageKey="real-journal-height"
        lines={lines}
        onChange={setLines}
        accounts={MOCK_ACCOUNTS}
        partners={MOCK_PARTNERS}
        units={[{ id: "ks", code: "ks", name: "kus", isActive: true }]}
        mode="mainAccount"
        mainAccount="321001"
        mainSide="D"
        documentCurrency="CZK"
        homeCurrency="CZK"
        vat={{ enabled: true, codes: MOCK_VAT_CODES_IN, calcMode: "net" }}
      />
    </section>
  );
}
