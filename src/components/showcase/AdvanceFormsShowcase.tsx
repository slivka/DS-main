/** Formuláře záloh · vlastní ukázku sdíleného slotu · APP u ZL odečty nepředává. */
import { useState } from "react";
import { toast } from "sonner";
import { DocumentForm } from "../ds/accounting/document-form";
import { DocumentPostingGrid } from "../ds/accounting/document-posting-grid";
import { AdvanceDeductionsSection } from "../ds/accounting/advances/advance-deductions-section";
import { advanceListVariant } from "../ds/accounting/advance-list-variant";
import { useDsTexts } from "../../ds-texts";
import {
  MOCK_ACCOUNTS,
  MOCK_BOOKS,
  MOCK_PARTNERS,
  MOCK_VAT_CODES_OUT,
  MOCK_VAT_CODES_IN,
} from "../../lib/mock/accounting";
import { INVOICE_HEADER, INVOICE_LINES, CURRENCIES } from "./document-form-showcase-data";
import { ADVANCE_DEDUCTIONS, ADVANCE_CURRENCY } from "./advance-showcase-data";
import { ShowcaseSection } from "./ShowcaseLayout";
function AdvanceForm({ type }: { type: "FV" | "FP" | "ZFV" | "ZFP" }) {
  const t = useDsTexts();
  const [value, setValue] = useState({ ...INVOICE_HEADER, recordKey: type });
  const [lines, setLines] = useState(INVOICE_LINES);
  const zl =
    type === "ZFV" || type === "ZFP"
      ? advanceListVariant({ type, vatPayer: true, recapNote: t.vatFive.notTaxDocument })
      : undefined;
  return (
    <DocumentForm
      title={type}
      status="draft"
      documentType={type}
      value={value}
      onChange={(next) => setValue({ ...next, recordKey: type })}
      lines={lines}
      onLinesChange={setLines}
      books={MOCK_BOOKS}
      accounts={MOCK_ACCOUNTS}
      partners={MOCK_PARTNERS}
      currencies={CURRENCIES}
      homeCurrency={ADVANCE_CURRENCY.code}
      fields={zl?.fields}
      vat={zl?.vat ?? { visible: true }}
      linesEditorProps={{
        withoutAccounts: Boolean(zl),
        vat: {
          enabled: true,
          defaultDirection: type === "FP" || type === "ZFP" ? "in" : "out",
          codes: type === "FP" || type === "ZFP" ? MOCK_VAT_CODES_IN : MOCK_VAT_CODES_OUT,
        },
        advanceDeduction: zl ? undefined : 1500,
        afterVatRecap: zl ? undefined : (
          <AdvanceDeductionsSection
            rows={ADVANCE_DEDUCTIONS}
            storageKey={`advance-deductions-${type}`}
            addAction={{ can: true, onClick: () => toast(t.advances.addAdvance) }}
            manualAction={{ can: true, onClick: () => toast(t.advances.manualDeduction) }}
            onAction={(action) => toast(t.advances[action])}
            onOpenTaxDocument={(row) => toast(row.taxDocument)}
          />
        ),
      }}
    />
  );
}
export function AdvanceFormsShowcase() {
  const t = useDsTexts();
  return (
    <ShowcaseSection title={t.advances.deductions}>
      <div className="space-y-6">
        {(["FV", "FP", "ZFV", "ZFP"] as const).map((type) => (
          <AdvanceForm key={type} type={type} />
        ))}
      </div>
      <DocumentPostingGrid
        accounts={MOCK_ACCOUNTS}
        entries={[
          { id: "advance", text: "Odečet", amount: 1000, auto: "advance" },
          { id: "fx", text: "Vyrovnání", amount: 12.5, auto: "advance_fx" },
        ]}
      />
    </ShowcaseSection>
  );
}
