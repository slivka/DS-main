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
import { formatCodeName } from "@/lib/code-format";
import { formatAccountCode } from "@/components/ds/accounting/account-code";

import {
  BANK_ACCOUNT_OPTIONS,
  COMPANY_BANK_ACCOUNT_OPTIONS,
  CONSTANT_SYMBOL_OPTIONS,
  CURRENCIES,
  DocumentHeaderScenarios,
  HIDDEN_GROUP_COLUMNS,
  HIDDEN_GROUP_ROWS,
  INVOICE_HEADER,
  INVOICE_LINES,
  PAYMENT_METHOD_OPTIONS,
  PURCHASE_INVOICE_HEADER,
  PURCHASE_INVOICE_LINES,
  SCHEDULE,
  USERS,
} from "./document-form-showcase-data";

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
  const [fvEur, setFvEur] = useState<DocumentHeaderValue>({
    ...fvCzk,
    number: "FV2026000421",
    currency: "EUR",
    rate: 24.38,
    amountTotal: 1000,
    companyBankAccountId: "company-eur",
  });
  const [counterpartyPrint, setCounterpartyPrint] = useState<DocumentCounterpartyValue>({
    name: "Beta služby s.r.o.",
    ico: "27074358",
    dic: "CZ27074358",
    street: "Hlavní",
    house_number: "12",
    zip: "11000",
    city: "Praha",
    country: "CZ",
    email: "fakturace@example.cz",
  });
  const [printData, setPrintData] = useState<DocumentPrintValue>({
    options: {
      showHeader: true,
      showFooter: true,
      showVatRecap: true,
      showNote: true,
      showColumnHeadings: true,
      showTotalsRow: true,
      showPaymentSchedule: false,
    },
    headerText: "Děkujeme za objednávku.",
    footerText: "Splatnost dle dohody.",
    note: "Poznámka pro odběratele",
    issuedByName: "Jana Nováková",
    issuedByPhone: "+420 123 456 789",
    issuedByEmail: "jana@example.cz",
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
            book: formatCodeName("PO", "Pokladna"),
            period: "2026",
            account: { side: "DAL", label: formatCodeName("211.001", "Pokladna CZK") },
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
            book: formatCodeName("PO", "Pokladna"),
            period: "2026",
            account: { side: "MD", label: formatCodeName("211.001", "Pokladna CZK") },
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
          constantSymbolOptions={CONSTANT_SYMBOL_OPTIONS}
          paymentMethodOptions={PAYMENT_METHOD_OPTIONS}
          companyBankAccountOptions={COMPANY_BANK_ACCOUNT_OPTIONS}
          vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
          vat={{ visible: true }}
          counterpartyTab={{
            value: counterpartyPrint,
            onChange: setCounterpartyPrint,
            onReloadFromPartner: () => toast.success("Údaje odběratele obnoveny"),
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
          vatPartnerStatus={{ status: "payer", checkedAt: "24.09.2026" }}
          counterpartyTab={{ value: counterpartyPrint, onChange: setCounterpartyPrint }}
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
          onAddBankAccount={() => toast.success("Otevřeno založení účtu partnera")}
          constantSymbolOptions={CONSTANT_SYMBOL_OPTIONS}
          paymentMethodOptions={PAYMENT_METHOD_OPTIONS}
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
