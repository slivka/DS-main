import { useState } from "react";
import { toast } from "sonner";

import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  DataGrid,
  DocumentForm,
  DocumentSettingsDialog,
  NoticeBar,
  PaymentScheduleEditor,
  StatusBadge,
  type DataGridColumn,
  type DocumentSettingsValue,
  type DocumentHeaderValue,
  type DocumentIdentity,
  SegmentedField,
  type JournalLine,
  type PaymentScheduleItem,
  type DocumentCounterpartyValue,
  type DocumentPrintValue,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";

const CURRENCIES = [
  { code: "CZK", label: "Česká koruna", symbol: "Kč" },
  { code: "EUR", label: "Euro", symbol: "€" },
];
const USERS = [
  { id: "u1", name: "Petr Slivka" },
  { id: "u2", name: "Jana Nováková" },
  { id: "u3", name: "Tomáš Dvořák" },
];
const INVOICE_HEADER: DocumentHeaderValue = {
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
const INVOICE_LINES: JournalLine[] = [
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
const PURCHASE_INVOICE_HEADER: DocumentHeaderValue = { ...INVOICE_HEADER, mainAccountId: "321001" };
const PURCHASE_INVOICE_LINES: JournalLine[] = INVOICE_LINES.map((line) => ({
  ...line,
  debitAccount: line.creditAccount,
  creditAccount: "321001",
}));
const SCHEDULE: PaymentScheduleItem[] = [
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
const HIDDEN_GROUP_ROWS: HiddenGroupRow[] = [
  { id: "hg1", source: "Párování P-2026-014", document: "KR2026000041", amount: 0.24 },
  { id: "hg2", source: "Párování P-2026-014", document: "KR2026000042", amount: -0.11 },
];
const HIDDEN_GROUP_COLUMNS: DataGridColumn<HiddenGroupRow>[] = [
  { id: "source", label: "Zdroj párování", defaultVisible: false, value: (row) => row.source },
  { id: "document", label: "Doklad", value: (row) => row.document },
  { id: "amount", label: "Částka", numeric: true, decimals: 2, value: (row) => row.amount },
];

const BASE: DocumentHeaderValue = {
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
      book: "PO - Pokladna",
      period: "2026",
      account: { side: "MD", label: "211.001 - Pokladna" },
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
      book: "BA - Banka EUR",
      period: "2026",
      account: { side: "DAL", label: "221.002 - Běžný účet EUR" },
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
      book: "FV - Vydané faktury",
      period: "2026",
      account: { side: "MD", label: "311.001 - Odběratelé", editable: true },
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
      book: "FV - Vydané faktury",
      period: "2026",
      account: { side: "MD", label: "311.001 - Odběratelé", editable: true },
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
      book: "FV - Vydané faktury",
      period: "2026",
      account: {
        side: "MD",
        label: "311.001 - Odběratelé",
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
      book: "FP - Přijaté faktury",
      period: "2026",
      account: { side: "DAL", label: "321.001 - Dodavatelé" },
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
      book: "ZFV - Zálohové faktury vydané",
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
      book: "ID - Interní doklady",
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
const MAIN_ACCOUNT_OPTIONS = MOCK_ACCOUNTS.filter((account) => account.code.startsWith("311"));
const BANK_ACCOUNT_OPTIONS = [
  {
    number: "19-2000145399",
    bankCode: "0800",
    label: "Provozní účet",
    currency: "CZK",
    default: true,
  },
  { number: "123456789", bankCode: "0100", label: "Eurový účet", currency: "EUR" },
];
const CONSTANT_SYMBOL_OPTIONS = [
  { value: "0308", label: "0308 – Platby za služby" },
  { value: "0558", label: "0558 – Ostatní platby" },
];
const PAYMENT_METHOD_OPTIONS = [
  { value: "transfer", label: "Bankovní převod" },
  { value: "cash", label: "Hotově" },
];
const COMPANY_BANK_ACCOUNT_OPTIONS = [
  { id: "company-czk", label: "Hlavní účet", account: "123456789/0100", currency: "CZK", isDefault: true },
  { id: "company-eur", label: "Eurový účet", account: "987654321/0100", currency: "EUR" },
];

/** Identitu skládá aplikace z aktuální hodnoty dokladu – popisek účtu podle value.mainAccountId. */
function identityFromValue(
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
        ? `${selected.code.slice(0, 3)}.${selected.code.slice(3)} - ${selected.name}`
        : account.label,
    },
  };
}

function DocumentHeaderScenarios() {
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

/** Ukázky DocumentForm 2.7 a PaymentScheduleEditor na stránce Účetní formuláře. */
export function DocumentFormShowcase() {
  const [cashDateLocked, setCashDateLocked] = useState(true);
  const [courierVatRelevant, setCourierVatRelevant] = useState(true);
  const [invoiceVatRelevant, setInvoiceVatRelevant] = useState(true);
  const [handedSuggestions, setHandedSuggestions] = useState(true);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState(true);
  const suggestNames = async (query: string) =>
    ["Jan Veselý", "Jana Nováková", "Petr Svoboda"].filter((item) =>
      item.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs")),
    );
  const suggestDescriptions = async (query: string) =>
    ["Doprava zásilky", "Nákup kancelářských potřeb", "Úhrada faktury v hotovosti"].filter((item) =>
      item.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs")),
    );
  const [invoice, setInvoice] = useState(PURCHASE_INVOICE_HEADER);
  const [invoiceLines, setInvoiceLines] = useState(PURCHASE_INVOICE_LINES);
  const [schedule, setSchedule] = useState(SCHEDULE);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [formError, setFormError] = useState(true);
  const [lineValidationError, setLineValidationError] = useState<string>();
  const [documentSettings, setDocumentSettings] = useState<DocumentSettingsValue>({
    suggestDescription: true,
    descriptionScope: "book",
    suggestCounterparty: true,
    counterpartyScope: "documentType",
    amountFromLines: "book",
    showQuantityColumns: true,
    offerPrintAfterSave: true,
    printTwoPerPage: false,
    printDocumentNumber: true,
    copies: 1,
  });

  const [posted, setPosted] = useState<DocumentHeaderValue>({
    ...INVOICE_HEADER,
    number: "FP2026000655",
    amountTotal: 12100,
  });
  const [postedLines, setPostedLines] = useState(INVOICE_LINES);
  const [postedSchedule, setPostedSchedule] = useState<PaymentScheduleItem[]>([
    { id: "p1", kind: "installment", dueDate: "2026-06-30", amount: 10890, description: "Úhrada" },
    {
      id: "p2",
      kind: "retention",
      dueDate: "2026-09-01",
      amount: 1210,
      description: "Pozastávka",
      responsibleUserId: "u1",
      releasedDate: "2026-09-02",
      releasedBy: "u1",
    },
  ]);

  const [cash, setCash] = useState<DocumentHeaderValue>({
    bookId: "b-pd",
    number: "",
    direction: "in",
    accountingDate: "2026-09-23",
    issueDate: "2026-09-23",
    taxDate: "2026-09-23",
    vatDate: "2026-09-01",
    partnerId: "p2",
    counterpartyIco: "27074358",
    counterpartyDic: "CZ27074358",
    handedOverBy: "Jana Nováková",
    description: "Nákup kancelářských potřeb",
    currency: "CZK",
    rate: 1,
    amountTotal: 1250,
    totalMode: "entered",
    roundingAmount: 0.4,
    mainAccountId: "211001",
  });
  const [cashLines, setCashLines] = useState<JournalLine[]>([
    {
      id: "c1",
      debitAccount: "518001",
      creditAccount: "211001",
      amount: 1249.6,
      text: "Kancelářské potřeby",
      debitDimensionId: "d-rezie",
    },
    {
      id: "c2",
      debitAccount: "548001",
      creditAccount: "211001",
      amount: 0.4,
      text: "Zaokrouhlení",
      isRounding: true,
    },
  ]);

  const [internal, setInternal] = useState<DocumentHeaderValue>({
    bookId: "b-id",
    number: "ID2026000031",
    accountingDate: "2026-09-30",
    issueDate: "2026-09-30",
    description: "Přeúčtování nákladů na zakázky",
    currency: "CZK",
    rate: 1,
    amountTotal: 0,
    totalMode: "sum",
  });
  const [internalLines, setInternalLines] = useState<JournalLine[]>([
    {
      id: "i1",
      debitAccount: "511001",
      creditAccount: "321001",
      amount: 12500,
      text: "Oprava haly",
      debitDimensionId: "d-cz-1",
      creditVs: "2026000601",
      creditPartnerId: "p1",
    },
    {
      id: "i2",
      debitAccount: "513001",
      creditAccount: "211001",
      amount: 1900,
      text: "Reprezentace",
      nonTax: true,
    },
  ]);

  const [courierLines, setCourierLines] = useState<JournalLine[]>([]);
  const [courier, setCourier] = useState<DocumentHeaderValue>({
    bookId: "b-pd",
    number: "",
    direction: "out",
    accountingDate: "2026-09-24",
    issueDate: "2026-09-24",
    taxDate: "2026-09-24",
    vatDate: "2026-09-01",
    counterpartyName: "Kurýr – Jan Veselý",
    counterpartyIco: "12345678",
    counterpartyDic: "CZ12345678",
    handedOverBy: "Jan Veselý",
    partnerId: null,
    description: "Doprava zásilky",
    currency: "CZK",
    rate: 1,
    amountTotal: 350,
    totalMode: "entered",
    mainAccountId: "211001",
  });
  const [cashIn, setCashIn] = useState<DocumentHeaderValue>({
    bookId: "b-pd",
    number: "PD2026000118",
    direction: "in",
    accountingDate: "2026-09-24",
    issueDate: "2026-09-24",
    partnerId: "p1",
    counterpartyName: MOCK_PARTNERS.find((p) => p.id === "p1")?.name ?? null,
    counterpartyIco: "27182818",
    counterpartyDic: "CZ27182818",
    handedOverBy: "Petr Svoboda",
    description: "Úhrada faktury v hotovosti",
    currency: "CZK",
    rate: 1,
    amountTotal: 5000,
    totalMode: "entered",
    mainAccountId: "211001",
  });
  const [cashEur, setCashEur] = useState<DocumentHeaderValue>({
    bookId: "b-pd",
    number: "",
    direction: "out",
    accountingDate: "2026-09-24",
    issueDate: "2026-09-24",
    counterpartyName: "Hotel Alpenhof",
    partnerId: null,
    description: "Ubytování – služební cesta",
    currency: "EUR",
    rate: 24.38,
    rateInfo: "Ruční kurz",
    rateManual: true,
    rateNote: "Kurz dle bankovního výpisu",
    suggestedRate: 24.72,
    suggestedRateInfo: "ČNB 24. 9. 2026",
    amountTotal: 180,
    totalMode: "entered",
    mainAccountId: "211001",
  });
  const [fvCzk, setFvCzk] = useState<DocumentHeaderValue>({
    bookId: "b-fv",
    number: "FV2026000420",
    accountingDate: "2026-09-24",
    issueDate: "2026-09-24",
    taxDate: "2026-09-24",
    dueDate: "2026-10-08",
    partnerId: "p2",
    counterpartyName: MOCK_PARTNERS.find((p) => p.id === "p2")?.name ?? null,
    variableSymbol: "2026000420",
    description: "Konzultační služby",
    currency: "CZK",
    rate: 1,
    amountTotal: 24200,
    totalMode: "entered",
    mainAccountId: "311001",
    companyBankAccountId: "company-czk",
    paymentMethodId: "transfer",
  });
  const [counterpartyPrint, setCounterpartyPrint] = useState<DocumentCounterpartyValue>({
    name: "Beta služby s.r.o.", ico: "27074358", dic: "CZ27074358", street: "Hlavní", house_number: "12", zip: "11000", city: "Praha", country: "CZ", email: "fakturace@example.cz",
  });
  const [printData, setPrintData] = useState<DocumentPrintValue>({
    options: { showHeader: true, showFooter: true, showVatRecap: true, showNote: true, showColumnHeadings: true, showTotalsRow: true, showPaymentSchedule: false },
    headerText: "Děkujeme za objednávku.", footerText: "Splatnost dle dohody.", note: "Poznámka pro odběratele", issuedByName: "Jana Nováková", issuedByPhone: "+420 123 456 789", issuedByEmail: "jana@example.cz",
  });
  const [fpNonPayer, setFpNonPayer] = useState<DocumentHeaderValue>({
    ...PURCHASE_INVOICE_HEADER,
    number: "FP2026000713",
    vatRelevant: false,
  });
  const [idCp, setIdCp] = useState<DocumentHeaderValue>({
    bookId: "b-id",
    number: "ID2026000032",
    accountingDate: "2026-09-30",
    issueDate: "2026-09-30",
    counterpartyName: "Finanční úřad pro Prahu 1",
    partnerId: null,
    description: "Předpis daně z nemovitostí",
    currency: "CZK",
    rate: 1,
    amountTotal: 0,
    totalMode: "sum",
  });
  const [exchangeDifference, setExchangeDifference] = useState<DocumentHeaderValue>({
    bookId: "b-id",
    number: "KR2026000041",
    accountingDate: "2026-09-30",
    issueDate: "2026-09-30",
    description: "Kurzový rozdíl z párování",
    currency: "CZK",
    rate: 1,
    amountTotal: 0.24,
    totalMode: "entered",
  });
  const common = {
    accounts: MOCK_ACCOUNTS,
    partners: MOCK_PARTNERS,
    dimensions: MOCK_DIMENSIONS,
    homeCurrency: "CZK",
    homeCurrencySymbol: "Kč",
    onLinesChange: () => {},
  };
  const units = [
    { id: "hour", code: "hod", name: "hodina", isActive: true },
    { id: "piece", code: "ks", name: "kus", isActive: true },
  ];

  return (
    <>
      <DocumentHeaderScenarios />
      <ShowcaseSection
        title="Pokladna – výdej kurýrovi bez partnera"
        description="Protistrana je jen text; ručně zadané IČO a DIČ zůstávají editovatelné a chybné české IČO se jen zvýrazní."
      >
        <DocumentForm
          title="Pokladní doklad – výdej"
          identity={{
            variant: "cashBank",
            book: "PO - Pokladna",
            period: "2026",
            account: { side: "DAL", label: "211.001 - Pokladna CZK" },
            number: courier.number,
          }}
          currencies={CURRENCIES}
          directionBadge="out"
          value={{ ...courier, vatRelevant: courierVatRelevant }}
          onChange={(next) => {
            setCourier(next);
            setCourierVatRelevant(next.vatRelevant !== false);
          }}
          lines={courierLines}
          {...common}
          onLinesChange={setCourierLines}
          books={MOCK_BOOKS.filter((b) => b.id === "b-pd")}
          documentType="PO"
          isNew
          mainSide="D"
          mainAccountLocked
          status="draft"
          settings={{ onOpen: () => setSettingsOpen(true) }}
          error={
            lineValidationError
              ? { message: lineValidationError, onClose: () => setLineValidationError(undefined) }
              : formError
                ? {
                    message: "Doplňte účet a částku na řádku dokladu.",
                    onClose: () => setFormError(false),
                  }
                : undefined
          }
          linesEditorProps={{
            initialEmptyLine: true,
            showQuantityColumns: documentSettings.showQuantityColumns,
            storageKey: "showcase-doc-new-po",
            onValidationChange: (_count, errors) =>
              setLineValidationError(
                errors[0] ? `Řádek ${errors[0].line}: ${errors[0].message}` : undefined,
              ),
          }}
          accountingDateLink={{
            locked: cashDateLocked,
            onToggle: (locked) => {
              setCashDateLocked(locked);
              if (locked)
                setCourier((current) => ({ ...current, accountingDate: current.issueDate }));
            },
          }}
          vat={{
            visible: true,
            dateLink: { locked: true, onToggle: () => {} },
            dateLockReadOnly: true,
          }}
          handedOverBySuggest={{
            enabled: handedSuggestions,
            onEnabledChange: setHandedSuggestions,
            load: suggestNames,
          }}
          descriptionSuggest={{
            enabled: descriptionSuggestions,
            onEnabledChange: setDescriptionSuggestions,
            load: suggestDescriptions,
          }}
          onCreatePartner={(seed) => toast.info(`Nový partner: ${seed.name || seed.ico}`)}
        />
        <DocumentSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          value={documentSettings}
          onSave={(next) => {
            setDocumentSettings(next);
            setSettingsOpen(false);
            toast.success("Nastavení uloženo");
          }}
          documentTypeLabel="Pokladní doklad – výdej"
          allowCounterpartySuggestions
          showVatCalcMode
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Pokladna – příjem s propojeným partnerem"
        description="Propojený partner má štítek „Partner“ a ✕ Zrušit propojení; pod polem IČO a DIČ."
      >
        <DocumentForm
          title="Pokladní doklad – příjem"
          identity={{
            variant: "cashBank",
            book: "PO - Pokladna",
            period: "2026",
            account: { side: "MD", label: "211.001 - Pokladna CZK" },
            number: cashIn.number,
          }}
          currencies={CURRENCIES}
          directionBadge="in"
          value={cashIn}
          onChange={setCashIn}
          lines={[]}
          {...common}
          books={MOCK_BOOKS.filter((b) => b.id === "b-pd")}
          documentType="PO"
          mainSide="MD"
          mainAccountLocked
          status="filed"
          constantSymbolOptions={CONSTANT_SYMBOL_OPTIONS}
          paymentMethodOptions={PAYMENT_METHOD_OPTIONS}
          companyBankAccountOptions={COMPANY_BANK_ACCOUNT_OPTIONS}
          vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
          counterpartyTab={{ value: counterpartyPrint, onChange: setCounterpartyPrint, onReloadFromPartner: () => toast.success("Údaje odběratele obnoveny") }}
          printTab={{ value: printData, onChange: setPrintData }}
        />
      </ShowcaseSection>
      <ShowcaseSection
        title="Pokladna v EUR"
        description="Měna zamčená (text), kurz viditelný se zdrojem."
      >
        <DocumentForm
          title="Bankovní doklad EUR"
          identity={{
            variant: "cashBank",
            book: "BV - Banka EUR",
            period: "2026",
            account: { side: "DAL", label: "221.002 - Běžný účet EUR" },
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
        title="Neplátce – vydaná faktura v CZK"
        description="Firma není plátce, proto se nezobrazuje přepínač, DUZP ani Datum DPH."
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
      <ShowcaseSection
        title="Faktura přijatá s platebním kalendářem"
        description="Hlavní účet 321 na straně DAL, číslo a kurz jen ke čtení, částka zadaná v hlavičce. Platební kalendář je druhá záložka: 3 splátky a pozastávka."
      >
        <DocumentForm
          title="Přijatá faktura"
          value={{ ...invoice, vatRelevant: invoiceVatRelevant }}
          onChange={(next) => {
            setInvoice(next);
            setInvoiceVatRelevant(next.vatRelevant !== false);
          }}
          lines={invoiceLines}
          onLinesChange={setInvoiceLines}
          books={MOCK_BOOKS}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          currencies={CURRENCIES}
          bankAccountOptions={BANK_ACCOUNT_OPTIONS}
          bankCodes={["0100", "0800"]}
          documentType="FP"
          rateAmount={1}
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          vat={{ visible: true, periodLabel: "KH srpen 2026 · DPH 3.Q 2026" }}
          dateWarnings={{ taxDate: "DUZP a zaúčtování jsou v různých letech" }}
          mainSide="D"
          linesEditorProps={{ dimensionRequired: true, storageKey: "showcase-doc-fp", units }}
          status="filed"
          tabs={[
            {
              id: "schedule",
              label: "Platební kalendář",
              badge: schedule.length,
              content: (
                <PaymentScheduleEditor
                  items={schedule}
                  onChange={setSchedule}
                  totalToPay={invoice.amountTotal}
                  currencySymbol="Kč"
                  paid={3630}
                  remaining={invoice.amountTotal - 3630}
                  users={USERS}
                  canRelease
                  canUnrelease
                />
              ),
            },
          ]}
          saveAction={{ onSave: () => toast.success("Doklad uložen"), dirty: true }}
          primaryAction={{ label: "Zaúčtovat", onClick: () => toast.success("Doklad zaúčtován") }}
          moreActions={[
            {
              id: "duplicate",
              label: "Duplikovat",
              onClick: () => toast.info("Doklad zduplikován"),
            },
          ]}
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Přijatá faktura – neplátce"
        description="Číslo dodavatele má obecný popisek a pole DPH zůstávají skrytá."
      >
        <DocumentForm
          title="Přijatá faktura"
          value={fpNonPayer}
          onChange={setFpNonPayer}
          lines={[]}
          {...common}
          currencies={CURRENCIES}
          bankAccountOptions={BANK_ACCOUNT_OPTIONS}
          bankCodes={["0100", "0800"]}
          books={MOCK_BOOKS}
          documentType="FP"
          mainSide="D"
          status="draft"
          vat={{ visible: false }}
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Vydaná faktura – odběratel s IČO a DIČ"
        description="editableFields povolí pouze popis a platební údaje; řádky mění jen popisné údaje. Uvolněná pozastávka je jen ke čtení."
      >
        <DocumentForm
          title="Vydaná faktura"
          value={{ ...posted, mainAccountId: "311001" }}
          onChange={setPosted}
          lines={postedLines}
          onLinesChange={setPostedLines}
          books={MOCK_BOOKS}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          documentType="FV"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          mainSide="MD"
          editableFields={[
            "mainAccountId",
            "description",
            "dueDate",
            "variableSymbol",
            "constantSymbol",
            "specificSymbol",
            "bankAccount",
            "excludeFromPaymentOrders",
          ]}
          linesEditorProps={{
            editableFields: [
              "text",
              "debitVs",
              "creditVs",
              "debitPartnerId",
              "creditPartnerId",
              "debitDimensionId",
              "creditDimensionId",
              "nonTax",
            ],
            storageKey: "showcase-doc-posted",
          }}
          status="posted"
          approved
          titleBadges={
            <StatusBadge
              status="partial"
              config={{ partial: { label: "Částečně uhrazeno", tone: "warning" } }}
            />
          }
          notices={
            <NoticeBar
              tone="info"
              title="Otevřený přeplatek"
              actions={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => toast.success("VS 1001 byl použit")}
                >
                  Použít VS
                </Button>
              }
            >
              Partner ALFA servis s.r.o. má na 311.001 otevřený přeplatek 200,00 Kč (VS 1001).
            </NoticeBar>
          }
          changedBy="Jana Nováková"
          changedAt="12.09.2026 14:05"
          tabs={[
            {
              id: "schedule",
              label: "Platební kalendář",
              content: (
                <PaymentScheduleEditor
                  items={postedSchedule}
                  onChange={setPostedSchedule}
                  totalToPay={12100}
                  currencySymbol="Kč"
                  paid={10890}
                  remaining={1210}
                  users={USERS}
                  canUnrelease
                />
              ),
            },
          ]}
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Pokladna – příjem se zamčeným účtem"
        description="Jediná kniha a účet pokladny jsou zobrazené jako text. Směr je jen ke čtení a číslo se přidělí při zařazení."
      >
        <DocumentForm
          title="Pokladní doklad – příjem"
          value={cash}
          onChange={setCash}
          lines={cashLines}
          onLinesChange={setCashLines}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          documentType="PO"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          books={MOCK_BOOKS.filter((book) => book.id === "b-pd")}
          isNew
          mainSide="MD"
          mainAccountLocked
          linesEditorProps={{ storageKey: "showcase-doc-cash" }}
          status="draft"
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Interní doklad"
        description="Bez hlavního účtu; částka celkem je součet řádků a nejde přepsat."
      >
        <DocumentForm
          title="Interní doklad"
          value={internal}
          onChange={setInternal}
          lines={internalLines}
          onLinesChange={setInternalLines}
          books={MOCK_BOOKS}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          documentType="ID"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          linesEditorProps={{ storageKey: "showcase-doc-internal" }}
          status="filed"
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Kurzový rozdíl vzniklý párováním"
        description="Doklad je jen pro čtení a navádí zpět na původní párování."
      >
        <DocumentForm
          title="Doklad kurzových rozdílů"
          value={exchangeDifference}
          onChange={setExchangeDifference}
          lines={[]}
          onLinesChange={() => {}}
          books={MOCK_BOOKS}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          documentType="ID"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          status="posted"
          readOnly
          readOnlyTitle="Vznikl párováním"
          readOnlyReason="Ruší se zrušením párování."
          readOnlyActions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => toast.info("Otevřeno párování P-2026-014")}
            >
              Otevřít párování
            </Button>
          }
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Seskupení podle skrytého sloupce"
        description="Skrytý sloupec Zdroj párování zůstává pojmenovaný v čipu i záhlaví skupiny."
      >
        <DataGrid
          storageKey="showcase-hidden-group-label-260"
          rows={HIDDEN_GROUP_ROWS}
          columns={HIDDEN_GROUP_COLUMNS}
          rowKey={(row) => row.id}
          defaultGroupBy="source"
          paginated={false}
        />
      </ShowcaseSection>
    </>
  );
}
