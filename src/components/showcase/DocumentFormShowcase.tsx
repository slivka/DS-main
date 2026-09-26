import { useState } from "react";
import { toast } from "sonner";

import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  DocumentForm,
  PaymentScheduleEditor,
  type DocumentHeaderValue,
  type JournalLine,
  type PaymentScheduleItem,
} from "@/components/ds";
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
const VAT_PERIODS = [
  { value: "2026-08-01", label: "08/2026 · KH srpen 2026 / DPH 3.Q 2026", filed: true },
  { value: "2026-09-01", label: "09/2026 · KH září 2026 / DPH 3.Q 2026" },
];

const INVOICE_HEADER: DocumentHeaderValue = {
  bookId: "b-fp", number: "FP2026000712", accountingDate: "2026-09-10", issueDate: "2026-09-08",
    taxDate: "2026-09-08", dueDate: "2026-10-08", externalNumber: "2026-0451", partnerId: "p1", counterpartyIco: "27182818", counterpartyDic: "CZ27182818",
  variableSymbol: "20260451", constantSymbol: "0308", bankAccount: "123456789/0100",
     description: "Výkony a materiál", currency: "EUR", rate: 24.285, rateInfo: "Ruční kurz", rateManual: true, vatDate: "2026-08-01",
   rateNote: "Kurz podle dodavatelského dokladu", suggestedRate: 24.72, suggestedRateInfo: "ČNB 10. 9. 2026",
  amountTotal: 174.7, totalMode: "sum", roundingAmount: 0, mainAccountId: "311001",
};
const INVOICE_LINES: JournalLine[] = [
  { id: "f1", debitAccount: "311001", creditAccount: "602001", amount: 995.69, foreignAmount: 41, quantity: 2, unitId: "hour", unitPrice: 20.5, text: "Konzultace", creditDimensionId: "d-cz-1" },
  { id: "f2", debitAccount: "311001", creditAccount: "602001", amount: 1085.54, foreignAmount: 44.7, quantity: 3, unitId: "hour", unitPrice: 14.9, text: "Implementace" },
  { id: "f3", debitAccount: "311001", creditAccount: "604001", amount: 2161.37, foreignAmount: 89, quantity: 1, unitId: "piece", unitPrice: 89, text: "Materiál" },
  { id: "fx1", debitAccount: "311001", creditAccount: "663001", amount: -0.01, text: "Kurzové zaokrouhlení", isFxRounding: true },
];
const SCHEDULE: PaymentScheduleItem[] = [
  { id: "s1", kind: "installment", dueDate: "2026-10-08", amount: 3630, description: "Splátka 1/3" },
  { id: "s2", kind: "installment", dueDate: "2026-11-08", amount: 3630, description: "Splátka 2/3" },
  { id: "s3", kind: "installment", dueDate: "2026-12-08", amount: 3630, description: "Splátka 3/3" },
  { id: "s4", kind: "retention", dueDate: "2027-09-08", amount: 1210, description: "Pozastávka 10 %", responsibleUserId: "u2" },
];

/** Ukázky DocumentForm 2.7 a PaymentScheduleEditor na stránce Účetní formuláře. */
export function DocumentFormShowcase() {
  const [cashDateLocked, setCashDateLocked] = useState(true);
  const [courierVatRelevant, setCourierVatRelevant] = useState(true);
  const [invoiceVatRelevant, setInvoiceVatRelevant] = useState(false);
  const [handedSuggestions, setHandedSuggestions] = useState(true);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState(true);
  const suggestNames = async (query: string) => ["Jan Veselý", "Jana Nováková", "Petr Svoboda"].filter((item) => item.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs")));
  const suggestDescriptions = async (query: string) => ["Doprava zásilky", "Nákup kancelářských potřeb", "Úhrada faktury v hotovosti"].filter((item) => item.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs")));
  const [invoice, setInvoice] = useState(INVOICE_HEADER);
  const [invoiceLines, setInvoiceLines] = useState(INVOICE_LINES);
  const [schedule, setSchedule] = useState(SCHEDULE);

  const [posted, setPosted] = useState<DocumentHeaderValue>({ ...INVOICE_HEADER, number: "FP2026000655", amountTotal: 12100 });
  const [postedLines, setPostedLines] = useState(INVOICE_LINES);
  const [postedSchedule, setPostedSchedule] = useState<PaymentScheduleItem[]>([
    { id: "p1", kind: "installment", dueDate: "2026-06-30", amount: 10890, description: "Úhrada" },
    { id: "p2", kind: "retention", dueDate: "2026-09-01", amount: 1210, description: "Pozastávka", responsibleUserId: "u1", releasedDate: "2026-09-02", releasedBy: "u1" },
  ]);

  const [cash, setCash] = useState<DocumentHeaderValue>({
    bookId: "b-pd", number: "", direction: "in", accountingDate: "2026-09-23", issueDate: "2026-09-23",
    taxDate: "2026-09-23", vatDate: "2026-09-01", partnerId: "p2", counterpartyIco: "27074358", counterpartyDic: "CZ27074358", handedOverBy: "Jana Nováková", description: "Nákup kancelářských potřeb", currency: "CZK", rate: 1,
    amountTotal: 1250, totalMode: "entered", roundingAmount: 0.4, mainAccountId: "211001",
  });
  const [cashLines, setCashLines] = useState<JournalLine[]>([
    { id: "c1", debitAccount: "518001", creditAccount: "211001", amount: 1249.6, text: "Kancelářské potřeby", debitDimensionId: "d-rezie" },
    { id: "c2", debitAccount: "548001", creditAccount: "211001", amount: 0.4, text: "Zaokrouhlení", isRounding: true },
  ]);

  const [internal, setInternal] = useState<DocumentHeaderValue>({
    bookId: "b-id", number: "ID2026000031", accountingDate: "2026-09-30", issueDate: "2026-09-30",
    description: "Přeúčtování nákladů na zakázky", currency: "CZK", rate: 1, amountTotal: 0, totalMode: "sum",
  });
  const [internalLines, setInternalLines] = useState<JournalLine[]>([
    { id: "i1", debitAccount: "511001", creditAccount: "321001", amount: 12500, text: "Oprava haly", debitDimensionId: "d-cz-1", creditVs: "2026000601", creditPartnerId: "p1" },
    { id: "i2", debitAccount: "513001", creditAccount: "211001", amount: 1900, text: "Reprezentace", nonTax: true },
  ]);

  const [courier, setCourier] = useState<DocumentHeaderValue>({
    bookId: "b-pd", number: "", direction: "out", accountingDate: "2026-09-24", issueDate: "2026-09-24",
    taxDate: "2026-09-24", vatDate: "2026-09-01", counterpartyName: "Kurýr – Jan Veselý", counterpartyIco: "12345678", counterpartyDic: "CZ12345678", handedOverBy: "Jan Veselý", partnerId: null, description: "Doprava zásilky", currency: "CZK", rate: 1,
    amountTotal: 350, totalMode: "entered", mainAccountId: "211001",
  });
  const [cashIn, setCashIn] = useState<DocumentHeaderValue>({
    bookId: "b-pd", number: "PD2026000118", direction: "in", accountingDate: "2026-09-24", issueDate: "2026-09-24",
    partnerId: "p1", counterpartyName: MOCK_PARTNERS.find((p) => p.id === "p1")?.name ?? null, counterpartyIco: "27182818", counterpartyDic: "CZ27182818", handedOverBy: "Petr Svoboda",
    description: "Úhrada faktury v hotovosti", currency: "CZK", rate: 1, amountTotal: 5000, totalMode: "entered", mainAccountId: "211001",
  });
  const [cashEur, setCashEur] = useState<DocumentHeaderValue>({
    bookId: "b-pd", number: "", direction: "out", accountingDate: "2026-09-24", issueDate: "2026-09-24",
    counterpartyName: "Hotel Alpenhof", partnerId: null, description: "Ubytování – služební cesta", currency: "EUR", rate: 24.38,
    rateInfo: "Ruční kurz", rateManual: true, rateNote: "Kurz dle bankovního výpisu", suggestedRate: 24.72,
    suggestedRateInfo: "ČNB 24. 9. 2026", amountTotal: 180, totalMode: "entered", mainAccountId: "211001",
  });
  const [fvCzk, setFvCzk] = useState<DocumentHeaderValue>({
    bookId: "b-fv", number: "FV2026000420", accountingDate: "2026-09-24", issueDate: "2026-09-24", taxDate: "2026-09-24",
    dueDate: "2026-10-08", partnerId: "p2", counterpartyName: MOCK_PARTNERS.find((p) => p.id === "p2")?.name ?? null,
    variableSymbol: "2026000420", description: "Konzultační služby", currency: "CZK", rate: 1, amountTotal: 24200, totalMode: "entered", mainAccountId: "311001",
  });
  const [idCp, setIdCp] = useState<DocumentHeaderValue>({
    bookId: "b-id", number: "ID2026000032", accountingDate: "2026-09-30", issueDate: "2026-09-30",
    counterpartyName: "Finanční úřad pro Prahu 1", partnerId: null, description: "Předpis daně z nemovitostí", currency: "CZK", rate: 1, amountTotal: 0, totalMode: "sum",
  });
  const common = { accounts: MOCK_ACCOUNTS, partners: MOCK_PARTNERS, dimensions: MOCK_DIMENSIONS, periodLabel: "Rok 2026", homeCurrency: "CZK", homeCurrencySymbol: "Kč", onLinesChange: () => {} };
  const units = [{ id: "hour", code: "hod", name: "hodina", isActive: true }, { id: "piece", code: "ks", name: "kus", isActive: true }];

  return (
    <>
      <ShowcaseSection title="Pokladna – výdej kurýrovi bez partnera" description="Protistrana je jen text; ručně zadané IČ a DIČ zůstávají editovatelné a chybné české IČ se jen zvýrazní.">
        <DocumentForm title="Pokladní doklad – výdej" identity={{ items: ["PO - Pokladna", "CZK", "2026", { side: "DAL", text: "211.001 - Pokladna CZK" }], number: courier.number }} directionBadge="out" value={{ ...courier, vatRelevant: courierVatRelevant }} onChange={(next) => { setCourier(next); setCourierVatRelevant(next.vatRelevant !== false); }} lines={[]} {...common}
          books={MOCK_BOOKS.filter((b) => b.id === "b-pd")} documentType="PO" isNew mainSide="D" mainAccountLocked status="draft"
          accountingDateLink={{ locked: cashDateLocked, onToggle: (locked) => { setCashDateLocked(locked); if (locked) setCourier((current) => ({ ...current, accountingDate: current.issueDate })); } }} vat={{ visible: true, dateLink: { locked: true, onToggle: () => {} }, dateLockReadOnly: true, periodLabel: VAT_PERIODS[1].label }}
          handedOverBySuggest={{ enabled: handedSuggestions, onEnabledChange: setHandedSuggestions, load: suggestNames }} descriptionSuggest={{ enabled: descriptionSuggestions, onEnabledChange: setDescriptionSuggestions, load: suggestDescriptions }}
          onCreatePartner={(seed) => toast.info(`Nový partner: ${seed.name || seed.ico}`)} />
      </ShowcaseSection>
      <ShowcaseSection title="Pokladna – příjem s propojeným partnerem" description="Propojený partner má štítek „Partner“ a ✕ Zrušit propojení; pod polem IČ a DIČ.">
        <DocumentForm title="Pokladní doklad – příjem" identity={{ items: ["PO - Pokladna", "CZK", "2026", { side: "MD", text: "211.001 - Pokladna CZK" }], number: cashIn.number }} directionBadge="in" value={cashIn} onChange={setCashIn} lines={[]} {...common}
          books={MOCK_BOOKS.filter((b) => b.id === "b-pd")} documentType="PO" mainSide="MD" mainAccountLocked status="filed" />
      </ShowcaseSection>
      <ShowcaseSection title="Pokladna v EUR" description="Měna zamčená (text), kurz viditelný se zdrojem.">
        <DocumentForm title="Bankovní doklad EUR" identity={{ items: ["BV - Banka EUR", "EUR", "2026", <span className="font-mono">221.002 - Běžný účet EUR <span className="font-sans">DAL</span></span>], number: cashEur.number }} directionBadge="out" value={cashEur} onChange={setCashEur} lines={[]} {...common} currencies={CURRENCIES} currencyLocked
          books={MOCK_BOOKS.filter((b) => b.id === "b-bv")} documentType="BA" isNew mainSide="D" mainAccountLocked status="draft" />
      </ShowcaseSection>
      <ShowcaseSection title="Neplátce – vydaná faktura v CZK" description="Firma není plátce, proto se nezobrazuje přepínač, DUZP ani Období DPH.">
        <DocumentForm title="Vydaná faktura" value={fvCzk} onChange={setFvCzk} lines={[]} {...common} currencies={CURRENCIES}
          books={MOCK_BOOKS} documentType="FV" mainSide="MD" status="filed" />
      </ShowcaseSection>
      <ShowcaseSection title="Interní doklad" description="ID bez partnera skládá popis do sekce Data.">
        <DocumentForm title="Interní doklad" value={idCp} onChange={setIdCp} lines={[]} {...common}
          books={MOCK_BOOKS} documentType="ID" status="filed" vat={{ visible: false }} />
      </ShowcaseSection>
      <ShowcaseSection title="Faktura přijatá s platebním kalendářem"
        description="Hlavní účet 321 na straně DAL, číslo a kurz jen ke čtení, částka zadaná v hlavičce. Platební kalendář je druhá záložka: 3 splátky a pozastávka.">
        <DocumentForm
          title="Přijatá faktura"
          value={{ ...invoice, vatRelevant: invoiceVatRelevant }} onChange={(next) => { setInvoice(next); setInvoiceVatRelevant(next.vatRelevant !== false); }}
          lines={invoiceLines} onLinesChange={setInvoiceLines}
          books={MOCK_BOOKS} accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          currencies={CURRENCIES}
          documentType="FP" rateAmount={1}
          homeCurrency="CZK" homeCurrencySymbol="Kč"
          vat={{ visible: true, periodLabel: VAT_PERIODS[0].label, periodFiled: true }}
          mainSide="MD"
          linesEditorProps={{ dimensionRequired: true, storageKey: "showcase-doc-fp", units }}
          status="filed"
          tabs={[{
            id: "schedule", label: "Platební kalendář", badge: schedule.length,
            content: (
              <PaymentScheduleEditor items={schedule} onChange={setSchedule} totalToPay={invoice.amountTotal} currencySymbol="Kč"
                paid={3630} remaining={invoice.amountTotal - 3630} users={USERS} canRelease canUnrelease />
            ),
          }]}
          saveAction={{ onSave: () => toast.success("Doklad uložen"), dirty: true }}
          primaryAction={{ label: "Zaúčtovat", onClick: () => toast.success("Doklad zaúčtován") }}
          moreActions={[{ id: "duplicate", label: "Duplikovat", onClick: () => toast.info("Doklad zduplikován") }]}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Vydaná faktura – odběratel s IČ a DIČ"
        description="editableFields povolí pouze popis a platební údaje; řádky mění jen popisné údaje. Uvolněná pozastávka je jen ke čtení.">
        <DocumentForm
          title="Vydaná faktura"
          value={{ ...posted, mainAccountId: "311001" }} onChange={setPosted}
          lines={postedLines} onLinesChange={setPostedLines}
          books={MOCK_BOOKS} accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          documentType="FV"
          homeCurrency="CZK" homeCurrencySymbol="Kč"
          mainSide="MD"
          editableFields={["mainAccountId", "description", "dueDate", "variableSymbol", "constantSymbol", "specificSymbol", "bankAccount", "excludeFromPaymentOrders"]}
          linesEditorProps={{ editableFields: ["text", "debitVs", "creditVs", "debitPartnerId", "creditPartnerId", "debitDimensionId", "creditDimensionId", "nonTax"], storageKey: "showcase-doc-posted" }}
          status="posted" approved
          changedBy="Jana Nováková" changedAt="12.09.2026 14:05"
          tabs={[{
            id: "schedule", label: "Platební kalendář",
            content: <PaymentScheduleEditor items={postedSchedule} onChange={setPostedSchedule} totalToPay={12100} currencySymbol="Kč" paid={10890} remaining={1210} users={USERS} canUnrelease />,
          }]}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Pokladna – příjem se zamčeným účtem"
        description="Jediná kniha a účet pokladny jsou zobrazené jako text. Směr je jen ke čtení a číslo se přidělí při zařazení.">
        <DocumentForm
          title="Pokladní doklad – příjem"
          value={cash} onChange={setCash}
          lines={cashLines} onLinesChange={setCashLines}
          accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          documentType="PO"
          homeCurrency="CZK" homeCurrencySymbol="Kč"
          books={MOCK_BOOKS.filter((book) => book.id === "b-pd")}
          isNew mainSide="MD" mainAccountLocked
          linesEditorProps={{ storageKey: "showcase-doc-cash" }}
          status="draft"
        />
      </ShowcaseSection>

      <ShowcaseSection title="Interní doklad"
        description="Bez hlavního účtu; částka celkem je součet řádků a nejde přepsat.">
        <DocumentForm
          title="Interní doklad"
          value={internal} onChange={setInternal}
          lines={internalLines} onLinesChange={setInternalLines}
          books={MOCK_BOOKS} accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          documentType="ID"
          homeCurrency="CZK" homeCurrencySymbol="Kč"
          linesEditorProps={{ storageKey: "showcase-doc-internal" }}
          status="filed"
        />
      </ShowcaseSection>
    </>
  );
}
