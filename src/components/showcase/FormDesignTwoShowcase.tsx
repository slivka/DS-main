/** Ukázky schválených kurzů a způsobu platby; drží pouze náhledový stav. */
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
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
  dueDate: "2026-10-24",
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
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const t = useFormDesignTwoTexts();
  const [received, setReceived] = useState<DocumentHeaderValue>({
    ...initial,
    currency: "CZK",
    rate: 1,
    partnerId: "supplier",
    partnerBankAccountId: "bank",
    externalNumber: "FP20260015",
    description: "",
    constantSymbol: "0008",
    specificSymbol: "99",
  });
  const [payByOrder, setPayByOrder] = useState(true);
  const [value, setValue] = useState(initial);
  const [same, setSame] = useState(false);
  const [vatRate, setVatRate] = useState<number | null>(25.1);
  const [manual, setManual] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  return (
    <ShowcaseSection title={t.title}>
      <div
        data-testid="form-design-two"
        data-ready={ready ? "true" : "false"}
        className="max-w-full"
      >
        <CheckboxField
          label={t.same}
          checked={same}
          onCheckedChange={(checked) => setSame(Boolean(checked))}
        />
        <CheckboxField
          label={t.attention}
          checked={!!value.rateSourceAttention}
          onCheckedChange={(checked) => setValue({ ...value, rateSourceAttention: !!checked })}
        />
        <DocumentForm
          settings={{ onOpen: () => {} }}
          moreActions={[
            {
              id: "settings-example",
              label: t.settings,
              icon: Settings,
              onClick: () => {},
            },
          ]}
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
      <div
        data-testid="edit-document-eleven-received"
        data-ready={ready ? "true" : "false"}
        className="max-w-full"
      >
        <DocumentForm
          title={t.received}
          documentType="FP"
          status="draft"
          value={received}
          onChange={setReceived}
          books={[]}
          accounts={[]}
          lines={[]}
          onLinesChange={() => {}}
          currencies={currencies}
          homeCurrency="CZK"
          homeCurrencySymbol={currencies[0].symbol}
          partners={[{ id: "supplier", name: t.supplier, ico: "12345678", dic: "CZ12345678" }]}
          bankAccountOptions={[{ id: "bank", number: "2001234567", bankCode: "2010" }]}
          paymentMethodOptions={[
            { value: "transfer", label: t.transfer },
            { value: "cash", label: t.cash },
          ]}
          paymentOrderEnabled={payByOrder}
          onPaymentOrderEnabledChange={setPayByOrder}
          receivedAccountDisabledReason={received.paymentMethodId === "cash" ? t.locked : undefined}
          constantSymbolOptions={[{ value: "0008", label: "0008" }]}
          accountingDateLink={{ locked: false, onToggle: () => {} }}
          dateWarnings={{ accountingDate: t.dateWarning, vatDate: t.dateWarning }}
          vat={{ visible: true, dateLink: { locked: false, onToggle: () => {} } }}
          linesEditorProps={{ recap: { open: false }, storageKey: "edit-eleven" }}
        />
      </div>
      <div data-testid="document-readonly" data-ready={ready ? "true" : "false"}>
        <DocumentForm
          title={t.received}
          documentType="FP"
          status="locked"
          readOnly
          value={{ ...received, currency: "EUR", description: t.supplier }}
          onChange={() => {}}
          books={[]}
          accounts={[]}
          lines={[]}
          onLinesChange={() => {}}
          currencies={currencies}
          homeCurrency={currencies[0].code}
          homeCurrencySymbol={currencies[0].symbol}
          bankAccountOptions={[{ id: "bank", iban: "CZ6508000000192000145399" }]}
          paymentMethodOptions={[{ value: "transfer", label: t.transfer }]}
          receivedAccountDisabledReason={t.locked}
          vat={{ visible: true, dateLink: { locked: true, onToggle: () => {} } }}
          linesEditorProps={{ recap: { open: false }, storageKey: "readonly-fields" }}
        />
      </div>
    </ShowcaseSection>
  );
}
