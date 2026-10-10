/**
 * Ověřovací scénáře vzhledu formulářových polí.
 * Vlastní: ukázkový stav účtu, měny a vzoru formátu.
 * Nesmí: zavádět vlastní varianty ovládání ani produkční data.
 */
import { useState } from "react";
import { CheckboxField, DocumentForm, Field, OptionSelect, type DocumentHeaderValue } from "../ds";
import { Input } from "../ui/input";
import { useDsTexts } from "../../ds-texts";
import { ShowcaseSection } from "./ShowcaseLayout";
import { useFormDesignShowcaseTexts } from "./form-design-texts";
import { FormDesignNarrowFields } from "./form-design-narrow";

const currencies = [{ code: "CZK", label: "Česká koruna", symbol: "Kč" }];
const initial: DocumentHeaderValue = {
  bookId: "fp",
  number: "FP202600001",
  accountingDate: "2026-10-10",
  issueDate: "2026-10-10",
  dueDate: "2026-10-24",
  currency: currencies[0].code,
  rate: 1,
  amountTotal: 12345.67,
  totalMode: "entered",
  externalNumber: "FA-2026/123",
};
const partners = [{ id: "supplier", name: "Dodavatel s.r.o.", ico: "12345678", dic: "CZ12345678" }];
const accounts = [{ id: "account", number: "19-2000145399", bankCode: "0800" }];
const options = [{ value: "0008", label: "0008 – Platby za zboží", selectedLabel: "0008" }];

/** Porovnání obou režimů formuláře a hledatelných výběrů. */
export function FormDesignShowcase() {
  const texts = useDsTexts();
  const showcase = useFormDesignShowcaseTexts();
  const [without, setWithout] = useState(initial);
  const [withSupplier, setWithSupplier] = useState({ ...initial, partnerId: "supplier" });
  const [symbol, setSymbol] = useState("0008");
  const [empty, setEmpty] = useState("");
  const [standard, setStandard] = useState("");
  const [pattern, setPattern] = useState("");
  const [locked, setLocked] = useState(false);
  const form = (
    value: DocumentHeaderValue,
    onChange: (v: DocumentHeaderValue) => void,
    currencyLocked: boolean,
  ) => (
    <DocumentForm
      title={showcase.receivedDocument}
      documentType="FP"
      status="draft"
      value={value}
      onChange={onChange}
      lines={[]}
      onLinesChange={() => {}}
      accounts={[]}
      books={[]}
      partners={partners}
      bankAccountOptions={accounts}
      currencies={currencies}
      homeCurrency={currencies[0].code}
      homeCurrencySymbol={currencies[0].symbol}
      currencyLocked={currencyLocked}
      paymentOrderEnabled
      onPaymentOrderEnabledChange={() => {}}
    />
  );
  return (
    <ShowcaseSection title={showcase.title}>
      <div data-testid="form-design-showcase" className="space-y-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section data-testid="form-without-supplier">{form(without, setWithout, true)}</section>
          <section data-testid="form-with-supplier">
            {form(
              withSupplier,
              (v) => setWithSupplier({ ...v, partnerId: v.partnerId ?? "" }),
              locked,
            )}
          </section>
        </div>
        <CheckboxField
          checked={locked}
          onCheckedChange={(checked) => setLocked(Boolean(checked))}
          label={texts.documentForm.currencyDisabled}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3" data-testid="selection-comparison">
          <Field label={showcase.constantSymbol} htmlFor="symbol-selected">
            <OptionSelect
              id="symbol-selected"
              value={symbol}
              onChange={setSymbol}
              options={options}
              searchable
              allowEmpty
            />
          </Field>
          <Field label={showcase.constantSymbol} htmlFor="symbol-empty">
            <OptionSelect
              id="symbol-empty"
              value={empty}
              onChange={setEmpty}
              options={options}
              searchable
              allowEmpty
            />
          </Field>
          <Field label={showcase.constantSymbol} htmlFor="symbol-standard">
            <OptionSelect
              id="symbol-standard"
              value={standard}
              onChange={setStandard}
              options={options}
            />
          </Field>
        </div>
        <FormDesignNarrowFields />
        <Field label={texts.documentForm.manualAccountNumber} htmlFor="account-pattern">
          <Input
            id="account-pattern"
            value={pattern}
            onChange={(event) => setPattern(event.target.value)}
            formatPattern={showcase.accountNumberPattern}
          />
        </Field>
      </div>
    </ShowcaseSection>
  );
}
