/** Navazující scénáře ukázky účetních formulářů. */
import { Button } from "@/components/ui/button";
import {
  DataGrid,
  DocumentForm,
  NoticeBar,
  PaymentScheduleEditor,
  StatusBadge,
} from "@/components/ds";
import { ShowcaseSection } from "./ShowcaseLayout";
import { toast } from "sonner";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";
import {
  BANK_ACCOUNT_OPTIONS,
  CONSTANT_SYMBOL_OPTIONS,
  CURRENCIES,
  HIDDEN_GROUP_COLUMNS,
  HIDDEN_GROUP_ROWS,
  PAYMENT_METHOD_OPTIONS,
  USERS,
} from "./document-form-showcase-data";
import type { ReturnTypeOfDocumentShowcaseState } from "./use-document-form-showcase-state";

/** Vykreslí scénáře přijatých, pokladních a interních dokladů. */
export function DocumentFormSecondaryScenarios({
  state,
}: {
  state: ReturnTypeOfDocumentShowcaseState;
}) {
  const {
    invoiceVatRelevant,
    setInvoiceVatRelevant,
    invoice,
    setInvoice,
    invoiceLines,
    setInvoiceLines,
    schedule,
    setSchedule,
    posted,
    setPosted,
    postedLines,
    setPostedLines,
    postedSchedule,
    setPostedSchedule,
    cash,
    setCash,
    cashLines,
    setCashLines,
    internal,
    setInternal,
    internalLines,
    setInternalLines,
    fpNonPayer,
    setFpNonPayer,
    exchangeDifference,
    setExchangeDifference,
    common,
    units,
  } = state;
  return (
    <>
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
          counterpartyInput="partner"
          onCounterpartyInputChange={(mode) => toast.info(`Režim protistrany: ${mode}`)}
          paymentOrderEnabled
          onPaymentOrderEnabledChange={(enabled) =>
            toast.info(enabled ? "Platit příkazem" : "Neplatit příkazem")
          }
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
          counterpartyInput="manual"
          onCounterpartyInputChange={(mode) => toast.info(`Režim protistrany: ${mode}`)}
          paymentOrderEnabled={false}
          onPaymentOrderEnabledChange={(enabled) =>
            toast.info(enabled ? "Platit příkazem" : "Neplatit příkazem")
          }
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
