/** Ukázka živého pruhu · vlastní náhledové položky ze „serveru“ · nesmí do knihovny. */
import { useState } from "react";
import { DocumentForm, type DocumentHeaderValue } from "../ds";
import type { FormIssue } from "../../lib/form-issues";
import { Button } from "../ui/button";
import { ShowcaseSection } from "./ShowcaseLayout";

const SERVER: FormIssue[] = [
  {
    fieldId: "document-taxDate",
    label: "DUZP",
    message: "Chybí DUZP",
    severity: "error",
    source: "server",
    code: "vat_date_required",
  },
  {
    fieldId: "journal-l1-amount",
    rowId: "l1",
    columnId: "amount",
    label: "Řádek 1",
    message: "Chybí částka",
    severity: "error",
    source: "client",
  },
];

/** Chyba z DB na DUZP + klientská chyba řádku; oprava DUZP odebere položku, titulek 2 → 1 → nic. */
export function LiveIssuesShowcase() {
  const [value, setValue] = useState<DocumentHeaderValue>({
    bookId: "fv",
    number: "FV1",
    accountingDate: "2026-10-10",
    issueDate: "2026-10-10",
    taxDate: null,
    currency: "CZK",
    amountTotal: 0,
    totalMode: "sum",
  });
  const [issues, setIssues] = useState<FormIssue[]>(SERVER);
  return (
    <ShowcaseSection
      title="Živý pruh – chyba z DB na DUZP"
      description="Vyplňte DUZP: položka zmizí a počet klesne; po opravě řádku pruh zmizí sám."
    >
      <div data-testid="live-issues-showcase" className="space-y-2">
        <Button
          variant="outline"
          onClick={() => setIssues((all) => all.filter((issue) => issue.rowId !== "l1"))}
        >
          Opravit řádek
        </Button>
        <Button variant="outline" onClick={() => setIssues(SERVER)}>
          Obnovit
        </Button>
        <DocumentForm
          title="Faktura vydaná"
          documentType="FV"
          status="draft"
          value={value}
          onChange={setValue}
          lines={[]}
          onLinesChange={() => {}}
          books={[]}
          accounts={[]}
          currencies={[{ code: "CZK", symbol: "Kč" }]}
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          mainSide="D"
          vat={{ visible: true }}
          issues={issues}
          validationActive
          saveFailed
          onFieldChange={(fieldId) => console.info("FIELD", fieldId) ||
            setIssues((all) => all.filter((issue) => issue.fieldId !== fieldId))
          }
        />
      </div>
    </ShowcaseSection>
  );
}
