/** Vedlejší ukázky dokladu · vlastní složení · nesmí být součástí spotřebitelské knihovny. */
import { toast } from "sonner";
import { DocumentForm } from "../ds";
import { ShowcaseSection } from "./ShowcaseLayout";
import { MOCK_BOOKS } from "../../lib/mock/accounting";
import { formatCodeName } from "../../lib/code-format";
import {
  CURRENCIES,
  CONSTANT_SYMBOL_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  COMPANY_BANK_ACCOUNT_OPTIONS,
} from "./document-form-showcase-data";
import type { useDocumentFormShowcaseState } from "./use-document-form-showcase-state";
export interface DocumentFormSecondaryShowcaseProps {
  state: ReturnType<typeof useDocumentFormShowcaseState>;
}
export function DocumentFormSecondaryShowcase({ state }: DocumentFormSecondaryShowcaseProps) {
  const {
    cashEur,
    setCashEur,
    fvCzk,
    setFvCzk,
    fvEur,
    setFvEur,
    idCp,
    setIdCp,
    common,
    counterpartyPrint,
    setCounterpartyPrint,
    printData,
    setPrintData,
  } = state;
  return (
    <>
      <ShowcaseSection
        title="Pokladna v EUR"
        description="Měna zamčená (text), kurz viditelný se zdrojem."
      >
        <DocumentForm
          title="Bankovní doklad EUR"
          identity={{
            variant: "cashBank",
            book: formatCodeName("BV", "Banka EUR"),
            period: "2026",
            account: { side: "DAL", label: formatCodeName("221.002", "Běžný účet EUR") },
            number: cashEur.number,
          }}
          directionBadge="out"
          value={cashEur}
          onChange={setCashEur}
          lines={[]}
          {...common}
          currencies={CURRENCIES}
          currencyLocked
          books={MOCK_BOOKS.filter((b) => b.id === "b-bv")}
          documentType="BA"
          isNew
          mainSide="D"
          mainAccountLocked
          status="draft"
          vatRateField={{ value: cashEur.rate ?? null, onChange: () => {}, sameAsDocument: true }}
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Plátce – vydaná faktura v CZK"
        description="Zapnuté DPH zobrazuje stav partnera, DUZP i Datum DPH."
      >
        <DocumentForm
          title="Vydaná faktura"
          value={fvCzk}
          onChange={setFvCzk}
          lines={[]}
          {...common}
          currencies={CURRENCIES}
          books={MOCK_BOOKS}
          documentType="FV"
          mainSide="MD"
          status="filed"
          constantSymbolOptions={CONSTANT_SYMBOL_OPTIONS}
          paymentMethodOptions={PAYMENT_METHOD_OPTIONS}
          companyBankAccountOptions={COMPANY_BANK_ACCOUNT_OPTIONS}
          counterpartyInput="partner"
          onCounterpartyInputChange={(mode) => toast.info(`Režim protistrany: ${mode}`)}
          vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
          vat={{ visible: true }}
          counterpartyTab={{
            value: counterpartyPrint,
            onChange: setCounterpartyPrint,
            onRefreshCounterparty: () => toast.success("Údaje odběratele obnoveny"),
            refreshCounterpartyWarning: "Aktualizovat ruční změny údaji partnera?",
            counterpartyManualFields: ["email", "street"],
          }}
          printTab={{ value: printData, onChange: setPrintData }}
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Vydaná faktura v EUR"
        description="Firemní eurový účet je přes celou šířku; platební údaje používají číselníky."
      >
        <DocumentForm
          title="Vydaná faktura EUR"
          value={fvEur}
          onChange={setFvEur}
          lines={[]}
          {...common}
          currencies={CURRENCIES}
          books={MOCK_BOOKS}
          documentType="FV"
          mainSide="MD"
          status="draft"
          constantSymbolOptions={CONSTANT_SYMBOL_OPTIONS}
          paymentMethodOptions={PAYMENT_METHOD_OPTIONS}
          companyBankAccountOptions={COMPANY_BANK_ACCOUNT_OPTIONS}
          counterpartyInput="manual"
          onCounterpartyInputChange={(mode) => toast.info(`Režim protistrany: ${mode}`)}
          vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
          vat={{ visible: true }}
          counterpartyTab={{
            value: counterpartyPrint,
            onChange: setCounterpartyPrint,
            counterpartyLocked: true,
            counterpartyLockedReason: "Doklad je zařazen",
            counterpartyFrozenAt: "24. 9. 2026",
          }}
          printTab={{ value: printData, onChange: setPrintData }}
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Interní doklad"
        description="ID bez partnera skládá popis do sekce Data."
      >
        <DocumentForm
          title="Interní doklad"
          value={idCp}
          onChange={setIdCp}
          lines={[]}
          {...common}
          books={MOCK_BOOKS}
          documentType="ID"
          status="filed"
          vat={{ visible: false }}
        />
      </ShowcaseSection>
    </>
  );
}
