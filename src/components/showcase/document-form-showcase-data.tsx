/**
 * Data a hlavičkové scénáře ukázky formulářů dokladu.
 * Vlastní: vzorová data, identitu a ovládání ukázek hlavičky.
 * Nesmí: ukládat aplikační data ani měnit veřejné API formuláře.
 */
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataGrid, type DataGridColumn } from "@/components/ds/grid/DataGrid";
import { SegmentedField } from "@/components/ds/form/segmented-field";
import { ShowcaseSection } from "./ShowcaseLayout";
import {
  DocumentForm,
  type DocumentHeaderValue,
  type DocumentIdentity,
} from "@/components/ds/accounting/document-form";
import type { JournalLine } from "@/components/ds/accounting/journal-lines";
import type { PaymentScheduleItem } from "@/components/ds/accounting/payment-schedule";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";
import { formatCodeName } from "@/lib/code-format";
import { formatAccountCode } from "@/components/ds/accounting/account-code";

export const CURRENCIES = [
  { code: "CZK", label: "Česká koruna", symbol: "Kč" },
  { code: "EUR", label: "Euro", symbol: "€" },
];
export const USERS = [
  { id: "u1", name: "Petr Slivka" },
  { id: "u2", name: "Jana Nováková" },
  { id: "u3", name: "Tomáš Dvořák" },
];
export const INVOICE_HEADER: DocumentHeaderValue = {
  bookId: "b-fp",
  number: "FP2026000712",
  accountingDate: "2026-09-10",
  issueDate: "2026-09-08",
  taxDate: "2026-09-08",
  dueDate: "2026-10-08",
  externalNumber: "FA-2026/0123",
  partnerId: "p1",
  counterpartyIco: "27182818",
  counterpartyDic: "CZ27182818",
  variableSymbol: "20260123",
  constantSymbol: "0308",
  bankAccount: "19-2000145399/0800",
  description: "Výkony a materiál",
  currency: "EUR",
  rate: 24.285,
  rateInfo: "Ruční kurz",
  rateManual: true,
  vatDate: "2026-08-01",
  rateNote: "Kurz podle dodavatelského dokladu",
  suggestedRate: 24.72,
  suggestedRateInfo: "ČNB 10. 9. 2026",
  amountTotal: 174.7,
  totalMode: "sum",
  roundingAmount: 0,
  mainAccountId: "311001",
};
export const INVOICE_LINES: JournalLine[] = [
  {
    id: "f1",
    debitAccount: "311001",
    creditAccount: "602001",
    amount: 995.69,
    foreignAmount: 41,
    quantity: 2,
    unitId: "hour",
    unitPrice: 20.5,
    text: "Konzultace",
    creditDimensionId: "d-cz-1",
  },
  {
    id: "f2",
    debitAccount: "311001",
    creditAccount: "602001",
    amount: 1085.54,
    foreignAmount: 44.7,
    quantity: 3,
    unitId: "hour",
    unitPrice: 14.9,
    text: "Implementace",
  },
  {
    id: "f3",
    debitAccount: "311001",
    creditAccount: "604001",
    amount: 2161.37,
    foreignAmount: 89,
    quantity: 1,
    unitId: "piece",
    unitPrice: 89,
    text: "Materiál",
  },
  {
    id: "fx1",
    debitAccount: "311001",
    creditAccount: "663001",
    amount: -0.01,
    text: "Kurzové zaokrouhlení",
    isFxRounding: true,
  },
];
export const PURCHASE_INVOICE_HEADER: DocumentHeaderValue = {
  ...INVOICE_HEADER,
  mainAccountId: "321001",
};
export const PURCHASE_INVOICE_LINES: JournalLine[] = INVOICE_LINES.map((line) => ({
  ...line,
  debitAccount: line.creditAccount,
  creditAccount: "321001",
}));
export const SCHEDULE: PaymentScheduleItem[] = [
  {
    id: "s1",
    kind: "installment",
    dueDate: "2026-10-08",
    amount: 3630,
    description: "Splátka 1/3",
  },
  {
    id: "s2",
    kind: "installment",
    dueDate: "2026-11-08",
    amount: 3630,
    description: "Splátka 2/3",
  },
  {
    id: "s3",
    kind: "installment",
    dueDate: "2026-12-08",
    amount: 3630,
    description: "Splátka 3/3",
  },
  {
    id: "s4",
    kind: "retention",
    dueDate: "2027-09-08",
    amount: 1210,
    description: "Pozastávka 10 %",
    responsibleUserId: "u2",
  },
];

type HiddenGroupRow = { id: string; source: string; document: string; amount: number };
export const HIDDEN_GROUP_ROWS: HiddenGroupRow[] = [
  { id: "hg1", source: "Párování P-2026-014", document: "KR2026000041", amount: 0.24 },
  { id: "hg2", source: "Párování P-2026-014", document: "KR2026000042", amount: -0.11 },
];
export const HIDDEN_GROUP_COLUMNS: DataGridColumn<HiddenGroupRow>[] = [
  { id: "source", label: "Zdroj párování", defaultVisible: false, value: (row) => row.source },
  { id: "document", label: "Doklad", value: (row) => row.document },
  { id: "amount", label: "Částka", numeric: true, decimals: 2, value: (row) => row.amount },
];

export const BASE: DocumentHeaderValue = {
  bookId: "b-fv",
  number: "FV2026000420",
  accountingDate: "2026-09-29",
  issueDate: "2026-09-29",
  taxDate: "2026-09-29",
  dueDate: "2026-10-13",
  currency: "CZK",
  rate: 1,
  amountTotal: 24200,
  totalMode: "entered",
  mainAccountId: "311001",
  partnerId: "p1",
  description: "Konzultační služby",
};

interface ShowcaseScenario {
  id: string;
  title: string;
  type: string;
  identity: DocumentIdentity;
  value: DocumentHeaderValue;
  directionBadge?: "in" | "out";
  mainSide?: "MD" | "D";
  mainAccountLocked?: boolean;
  currencyDisabledReason?: string;
  currencyLocked?: boolean;
}

const SCENARIOS: ShowcaseScenario[] = [
  {
    id: "po",
    title: "PO CZK – příjem",
    type: "PO",
    identity: {
      variant: "cashBank",
      book: formatCodeName("PO", "Pokladna"),
      period: "2026",
      account: { side: "MD", label: formatCodeName("211.001", "Pokladna") },
      number: "PO2026000118",
    },
    value: {
      ...BASE,
      bookId: "b-pd",
      number: "PO2026000118",
      direction: "in",
      mainAccountId: "211001",
    },
    directionBadge: "in",
    mainSide: "MD",
    mainAccountLocked: true,
  },
  {
    id: "ba",
    title: "BA EUR – výdej",
    type: "BA",
    identity: {
      variant: "cashBank",
      book: formatCodeName("BA", "Banka EUR"),
      period: "2026",
      account: { side: "DAL", label: formatCodeName("221.002", "Běžný účet EUR") },
      number: "BA2026000091",
    },
    value: {
      ...BASE,
      bookId: "b-bv",
      number: "BA2026000091",
      direction: "out",
      currency: "EUR",
      rate: 24.38,
      rateManual: true,
      rateNote: "Kurz dle výpisu",
      amountTotal: 180,
      mainAccountId: "221002",
    },
    directionBadge: "out",
    mainSide: "D",
    mainAccountLocked: true,
  },
  {
    id: "fv",
    title: "FV CZK – účet lze změnit",
    type: "FV",
    identity: {
      variant: "invoice",
      book: formatCodeName("FV", "Vydané faktury"),
      period: "2026",
      account: { side: "MD", label: formatCodeName("311.001", "Odběratelé"), editable: true },
      number: "FV2026000420",
    },
    value: BASE,
    mainSide: "MD",
  },
  {
    id: "fv-eur",
    title: "FV EUR – kurz a přepočet",
    type: "FV",
    identity: {
      variant: "invoice",
      book: formatCodeName("FV", "Vydané faktury"),
      period: "2026",
      account: { side: "MD", label: formatCodeName("311.001", "Odběratelé"), editable: true },
      number: "FV2026000421",
    },
    value: {
      ...BASE,
      number: "FV2026000421",
      currency: "EUR",
      rate: 24.285,
      rateManual: true,
      rateNote: "Kurz dle smlouvy",
      amountTotal: 174.7,
    },
    mainSide: "MD",
  },
  {
    id: "paired",
    title: "FV spárovaná – účet i měna zamčené",
    type: "FV",
    identity: {
      variant: "invoice",
      book: formatCodeName("FV", "Vydané faktury"),
      period: "2026",
      account: {
        side: "MD",
        label: formatCodeName("311.001", "Odběratelé"),
        editable: true,
        disabledReason: "Doklad je spárovaný, nejdřív zrušte párování",
      },
      number: "FV2026000419",
    },
    value: { ...BASE, number: "FV2026000419" },
    mainSide: "MD",
    currencyDisabledReason: "Doklad je spárovaný, nejdřív zrušte párování",
  },
  {
    id: "fp",
    title: "FP – pevný účet, měna jako text",
    type: "FP",
    identity: {
      variant: "invoice",
      book: formatCodeName("FP", "Přijaté faktury"),
      period: "2026",
      account: { side: "DAL", label: formatCodeName("321.001", "Dodavatelé") },
      number: "FP2026000712",
    },
    value: { ...BASE, bookId: "b-fp", number: "FP2026000712", mainAccountId: "321001" },
    mainSide: "D",
    mainAccountLocked: true,
    currencyLocked: true,
  },
  {
    id: "zfv",
    title: "ZFV – bez hlavního účtu",
    type: "ZFV",
    identity: {
      variant: "invoice",
      book: formatCodeName("ZFV", "Zálohové faktury vydané"),
      period: "2026",
      number: "ZFV2026000018",
    },
    value: { ...BASE, number: "ZFV2026000018", mainAccountId: null },
    mainSide: "MD",
  },
  {
    id: "id",
    title: "ID – interní doklad",
    type: "ID",
    identity: {
      variant: "internal",
      book: formatCodeName("ID", "Interní doklady"),
      period: "2026",
      number: "ID2026000031",
    },
    value: {
      ...BASE,
      bookId: "b-id",
      number: "ID2026000031",
      mainAccountId: null,
      amountTotal: 0,
      totalMode: "sum",
    },
  },
];

/** Povolené hlavní účty faktury – aplikace je omezuje nastavením knihy a období. */
export const MAIN_ACCOUNT_OPTIONS = MOCK_ACCOUNTS.filter((account) =>
  account.code.startsWith("311"),
);
export const BANK_ACCOUNT_OPTIONS = [
  {
    number: "19-2000145399",
    bankCode: "0800",
    label: "Provozní účet",
    currency: "CZK",
    default: true,
  },
  { number: "123456789", bankCode: "0100", label: "Eurový účet", currency: "EUR" },
];
export const CONSTANT_SYMBOL_OPTIONS = [
  { value: "0308", label: "0308 – Platby za služby" },
  { value: "0558", label: "0558 – Ostatní platby" },
];
export const PAYMENT_METHOD_OPTIONS = [
  { value: "transfer", label: "Bankovní převod" },
  { value: "cash", label: "Hotově" },
];
export const COMPANY_BANK_ACCOUNT_OPTIONS = [
  {
    id: "company-czk",
    label: "Hlavní účet",
    account: "123456789/0100",
    currency: "CZK",
    isDefault: true,
  },
  { id: "company-eur", label: "Eurový účet", account: "987654321/0100", currency: "EUR" },
];

/** Identitu skládá aplikace z aktuální hodnoty dokladu – popisek účtu podle value.mainAccountId. */
export function identityFromValue(
  scenario: ShowcaseScenario,
  value: DocumentHeaderValue,
): DocumentIdentity {
  const account = scenario.identity.account;
  if (!account || !value.mainAccountId) return scenario.identity;
  const selected = MOCK_ACCOUNTS.find((item) => item.code === value.mainAccountId);
  return {
    ...scenario.identity,
    account: {
      ...account,
      label: selected
        ? formatCodeName(formatAccountCode(selected.code), selected.name)
        : account.label,
    },
  };
}

export function DocumentHeaderScenarios() {
  const [fontSize, setFontSize] = useState<"0.8" | "1" | "1.25">("1");
  const [narrow, setNarrow] = useState(false);
  const [values, setValues] = useState<Record<string, DocumentHeaderValue>>(() =>
    Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, scenario.value])),
  );
  const common = {
    books: MOCK_BOOKS,
    accounts: MOCK_ACCOUNTS,
    partners: MOCK_PARTNERS,
    dimensions: MOCK_DIMENSIONS,
    currencies: CURRENCIES,
    homeCurrency: "CZK",
    homeCurrencySymbol: "Kč",
    lines: [],
    onLinesChange: () => {},
  };

  return (
    <ShowcaseSection
      title="Jednotný identifikační řádek dokladů"
      description="Osm stavů hlavičky při běžné i úzké šířce. Velikost písma se mění jen uvnitř této ukázky; změna účtu nabízí jen povolené účty 311."
    >
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-[18rem]">
          <SegmentedField
            ariaLabel="Velikost písma"
            label="Velikost písma"
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: "0.8", label: "80 %" },
              { value: "1", label: "100 %" },
              { value: "1.25", label: "125 %" },
            ]}
          />
        </div>
        <Button
          type="button"
          variant={narrow ? "default" : "outline"}
          onClick={() => setNarrow((current) => !current)}
        >
          Úzká šířka
        </Button>
      </div>
      <div
        data-slot="showcase-font-scale"
        style={{ zoom: Number(fontSize) }}
        className={narrow ? "grid grid-cols-1 gap-6 xl:grid-cols-3" : "space-y-8"}
      >
        {SCENARIOS.map((scenario) => (
          <DocumentForm
            key={scenario.id}
            {...common}
            title={scenario.title}
            status="draft"
            documentType={scenario.type}
            identity={identityFromValue(scenario, values[scenario.id] ?? scenario.value)}
            mainAccountOptions={
              scenario.identity.account?.editable ? MAIN_ACCOUNT_OPTIONS : undefined
            }
            currencyLocked={scenario.currencyLocked}
            directionBadge={scenario.directionBadge}
            mainSide={scenario.mainSide}
            mainAccountLocked={scenario.mainAccountLocked}
            currencyDisabledReason={scenario.currencyDisabledReason}
            value={values[scenario.id] ?? scenario.value}
            onChange={(next) => setValues((current) => ({ ...current, [scenario.id]: next }))}
          />
        ))}
      </div>
    </ShowcaseSection>
  );
}
