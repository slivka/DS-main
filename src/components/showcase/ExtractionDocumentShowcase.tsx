/** Ukázka návrhů FP · vlastní demo data a odstranění návrhu · nesmí se distribuovat APP. */
import { useState } from "react";
import {
  DocumentForm, SuggestionSummary,
  type DocumentHeaderValue, type FieldSuggestion, type JournalLine,
} from "../ds";
import type { JournalRowSuggestions } from "../ds/accounting/journal-suggestions";

const SOURCE = "Faktura-2026-0142.pdf";
const INITIAL: DocumentHeaderValue = {
  id: "extraction-fp", number: "FP20260142", currency: "CZK", rate: 1,
  mainAccountId: "321001", partnerId: "supplier", externalNumber: "2026/0142",
  issueDate: "2026-10-23", accountingDate: "2026-10-23", taxDate: "2026-10-23",
  vatDate: "2026-10-23", dueDate: "2026-11-06", description: "Kancelářské potřeby",
  amountTotal: 1210, totalMode: "entered", variableSymbolLinked: false, variableSymbol: "20260142",
};

/** Přijatá faktura sdílí návrhy a F8 s ostatními variantami DocumentForm. */
export function ExtractionDocumentShowcase() {
  const [value, setValue] = useState(INITIAL);
  const [lines, setLines] = useState<JournalLine[]>([{
    id: "extraction-row", debitAccount: "518001", creditAccount: "321001",
    amount: 1000, text: "Kancelářské potřeby", vatCodeId: "input21",
  }]);
  const [fields, setFields] = useState<Partial<Record<string, FieldSuggestion>>>({
    partnerId: { source: SOURCE },
    externalNumber: { source: SOURCE },
    dueDate: { source: SOURCE, uncertain: true },
    amountTotal: { source: SOURCE, uncertain: true },
  });
  const [rows, setRows] = useState<JournalRowSuggestions>({
    "extraction-row": { amount: { source: SOURCE, uncertain: true } },
  });
  const uncertainCount = [
    ...Object.values(fields), ...Object.values(rows).flatMap(Object.values),
  ].filter((suggestion) => suggestion?.uncertain).length;
  const clear = (key: string, rowId?: string) => {
    if (rowId) setRows((previous) => ({
      ...previous, [rowId]: Object.fromEntries(Object.entries(previous[rowId] ?? {})
        .filter(([name]) => name !== key)),
    }));
    else setFields((previous) => Object.fromEntries(Object.entries(previous)
      .filter(([name]) => name !== key)));
  };
  return (
    <div data-testid="extraction-document">
      <DocumentForm
        title="Přijatá faktura ze souboru" documentType="FP" status="draft"
        value={value} onChange={setValue} lines={lines} onLinesChange={setLines}
        books={[]} accounts={[
          { code: "321001", name: "Dodavatelé" },
          { code: "518001", name: "Služby" },
          { code: "343021", name: "DPH" },
        ]}
        partners={[{ id: "supplier", name: "Kancelářské potřeby s.r.o." }]}
        mainSide="D" homeCurrency="CZK" homeCurrencySymbol="Kč"
        currencies={[{ code: "CZK", label: "Koruna", symbol: "Kč" }]}
        fieldSuggestions={fields} rowSuggestions={rows} onSuggestionCleared={clear}
        vat={{ visible: true }}
        linesEditorProps={{ storageKey: "extraction-document-lines", vat: {
          enabled: true, codes: [{ id: "input21", code: "Z", name: "Tuzemsko",
            direction: "in", rate: 21, hasTax: true, selfAssessment: false,
            requiresPdpSubject: false, taxInAccount: "343021" }],
        } }}
        notices={<SuggestionSummary method="AI návrh" uncertainCount={uncertainCount}
          onDiscard={() => { setFields({}); setRows({}); }} />}
      />
    </div>
  );
}