/** Ukázky schválených kurzů a způsobu platby; drží pouze náhledový stav. */
import { useState } from "react";
import { CheckboxField, DocumentForm, type DocumentHeaderValue } from "../ds";
import { useFormDesignTwoTexts } from "../../ds-texts/form-design-two-showcase";
import { ShowcaseSection } from "./ShowcaseLayout";
const currencies = [
  { code: "CZK", symbol: "Kč", label: "Koruna" },
  { code: "EUR", symbol: "€", label: "Euro" },
];
const initial: DocumentHeaderValue = {
  bookId: "fv",
  number: "FV20260015",
  accountingDate: "2026-10-10",
  issueDate: "2026-10-10",
  taxDate: "2026-10-09",
  vatDate: "2026-10-09",
  currency: "EUR",
  rate: 25,
  suggestedRate: 25,
  suggestedRateInfo: "ČNB 9. 10. 2026",
  amountTotal: 1210,
  totalMode: "entered",
  paymentMethodId: "transfer",
  companyBankAccountId: "bank",
};
export function FormDesignTwoShowcase() {
  const t = useFormDesignTwoTexts();
  const [value, setValue] = useState(initial);
  const [same, setSame] = useState(false);
  const [vatRate, setVatRate] = useState<number | null>(25.1);
  const [manual, setManual] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  return (
    <ShowcaseSection title={t.title}>
      <div data-testid="form-design-two" className="max-w-full">
        <CheckboxField
          label={t.same}
          checked={same}
          onCheckedChange={(checked) => setSame(Boolean(checked))}
        />
        <DocumentForm
          title={t.issued}
          documentType="FV"
          status="draft"
          value={value}
          onChange={setValue}
          books={[]}
          accounts={[]}
          lines={[]}
          onLinesChange={() => {}}
          currencies={currencies}
          homeCurrency={currencies[0].code}
          homeCurrencySymbol={currencies[0].symbol}
          paymentMethodOptions={[
            { value: "transfer", label: t.transfer },
            { value: "cash", label: t.cash },
          ]}
          companyBankAccountOptions={[
            { id: "bank", label: t.account, account: "2001234567/2010", currency: "EUR" },
          ]}
          companyBankAccountDisabledReason={value.paymentMethodId === "cash" ? t.locked : undefined}
          vat={{ visible: true }}
          vatRateField={{
            value: vatRate,
            sameAsDocument: same,
            suggestedRate: 25.1,
            suggestedInfo: "ČNB 8. 10. 2026",
            manual,
            note,
            onChange: (next) => {
              if (next.rate !== undefined) setVatRate(next.rate);
              if (next.manual !== undefined) setManual(next.manual);
              if (next.note !== undefined) setNote(next.note);
            },
          }}
          linesEditorProps={{ recap: { open: false }, storageKey: "form-design-two" }}
        />
      </div>
    </ShowcaseSection>
  );
}
