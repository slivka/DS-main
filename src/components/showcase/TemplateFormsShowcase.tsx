/** Ukázka společného pruhu vzoru ve faktuře a ZL; jen lokální ukázkový stav. */
import { useState } from "react";
import { DocumentForm } from "../ds/accounting/document-form";
import { advanceListVariant } from "../ds/accounting/advance-list-variant";
import type { DocumentTypeCode } from "../ds/accounting/document-fields";
import { useDsTexts } from "../../ds-texts";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_PARTNERS } from "../../lib/mock/accounting";
import { INVOICE_HEADER, INVOICE_LINES, CURRENCIES } from "./document-form-showcase-data";
import { ShowcaseSection } from "./ShowcaseLayout";
function TemplateForm({ type }: { type: DocumentTypeCode }) {
  const [value, setValue] = useState({ ...INVOICE_HEADER, recordKey: type });
  const [lines, setLines] = useState(INVOICE_LINES);
  const [editing, setEditing] = useState(true);
  const t = useDsTexts();
  const advance =
    type === "ZFV" || type === "ZFP"
      ? advanceListVariant({ type, vatPayer: true, recapNote: t.vatFive.notTaxDocument })
      : undefined;
  return (
    <DocumentForm
      title={`${type} – Nájem kanceláře`}
      documentType={type}
      homeCurrency={CURRENCIES[0]?.code ?? INVOICE_HEADER.currency}
      status="draft"
      value={value}
      onChange={(next) => setValue({ ...next, recordKey: type })}
      lines={lines}
      onLinesChange={setLines}
      books={MOCK_BOOKS}
      accounts={MOCK_ACCOUNTS}
      partners={MOCK_PARTNERS}
      currencies={CURRENCIES}
      vat={advance?.vat}
      fields={advance?.fields}
      linesEditorProps={advance ? { withoutAccounts: true } : undefined}
      templateEdit={
        editing
          ? {
              name: "Nájem kanceláře",
              onSave: () => setEditing(false),
              onDiscard: () => {
                setValue({ ...INVOICE_HEADER, recordKey: type });
                setLines(INVOICE_LINES);
                setEditing(false);
              },
            }
          : undefined
      }
    />
  );
}
export function TemplateFormsShowcase() {
  return (
    <ShowcaseSection title="Vzory – faktura i zálohový list">
      <div className="space-y-8">
        {(["FV", "FP", "ZFV", "ZFP"] as const).map((type) => (
          <TemplateForm key={type} type={type} />
        ))}
      </div>
    </ShowcaseSection>
  );
}
