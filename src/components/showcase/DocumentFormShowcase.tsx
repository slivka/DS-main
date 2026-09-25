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
import { Button } from "@/components/ui/button";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";

const CURRENCIES = [
  { code: "CZK", label: "Česká koruna" },
  { code: "EUR", label: "Euro" },
];
const USERS = [
  { id: "u1", name: "Petr Slivka" },
  { id: "u2", name: "Jana Nováková" },
  { id: "u3", name: "Tomáš Dvořák" },
];

const INVOICE_HEADER: DocumentHeaderValue = {
  bookId: "b-fp", number: "FP2026000712", accountingDate: "2026-09-10", issueDate: "2026-09-08",
  taxDate: "2026-09-08", dueDate: "2026-10-08", externalNumber: "2026-0451", partnerId: "p1",
  variableSymbol: "20260451", constantSymbol: "0308", bankAccount: "123456789/0100",
  description: "Rekonstrukce skladu – 1. etapa", currency: "EUR", rate: 24.38, rateInfo: "ČNB 10. 9. 2026",
  amountTotal: 12100, totalMode: "entered", roundingAmount: 0, mainAccountId: "321001",
};
const INVOICE_LINES: JournalLine[] = [
  { id: "f1", debitAccount: "518001", creditAccount: "321001", amount: 10000, text: "Stavební práce", debitDimensionId: "d-cz-1" },
  { id: "f2", debitAccount: "343001", creditAccount: "321001", amount: 2100, text: "DPH 21 %" },
];
const SCHEDULE: PaymentScheduleItem[] = [
  { id: "s1", kind: "installment", dueDate: "2026-10-08", amount: 3630, description: "Splátka 1/3" },
  { id: "s2", kind: "installment", dueDate: "2026-11-08", amount: 3630, description: "Splátka 2/3" },
  { id: "s3", kind: "installment", dueDate: "2026-12-08", amount: 3630, description: "Splátka 3/3" },
  { id: "s4", kind: "retention", dueDate: "2027-09-08", amount: 1210, description: "Pozastávka 10 %", responsibleUserId: "u2" },
];

/** Ukázky DocumentForm 2.7 a PaymentScheduleEditor na stránce Účetní formuláře. */
export function DocumentFormShowcase() {
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
    bookId: "b-pd", number: "", direction: "out", accountingDate: "2026-09-23", issueDate: "2026-09-23",
    taxDate: "2026-09-23", partnerId: "p2", description: "Nákup kancelářských potřeb", currency: "CZK", rate: 1,
    amountTotal: 1250, totalMode: "entered", roundingAmount: 0.4, mainAccountId: "211001",
  });
  const [cashLines, setCashLines] = useState<JournalLine[]>([
    { id: "c1", debitAccount: "518001", creditAccount: "211001", amount: 1249.6, text: "Kancelářské potřeby", debitDimensionId: "d-rezie" },
    { id: "c2", debitAccount: "548001", creditAccount: "211001", amount: 0.4, text: "Haléřové vyrovnání", isRounding: true },
  ]);

  const [internal, setInternal] = useState<DocumentHeaderValue>({
    bookId: "b-id", number: "ID2026000031", accountingDate: "2026-09-30", issueDate: "2026-09-30",
    description: "Přeúčtování nákladů na zakázky", currency: "CZK", rate: 1, amountTotal: 0, totalMode: "sum",
  });
  const [internalLines, setInternalLines] = useState<JournalLine[]>([
    { id: "i1", debitAccount: "511001", creditAccount: "321001", amount: 12500, text: "Oprava haly", debitDimensionId: "d-cz-1", creditVs: "2026000601", creditPartnerId: "p1" },
    { id: "i2", debitAccount: "513001", creditAccount: "211001", amount: 1900, text: "Reprezentace", nonTax: true },
  ]);

  return (
    <>
      <ShowcaseSection title="Faktura přijatá s platebním kalendářem"
        description="Hlavní účet 321 na straně DAL, číslo a kurz jen ke čtení, částka zadaná v hlavičce. Platební kalendář je druhá záložka: 3 splátky a pozastávka.">
        <DocumentForm
          title="Přijatá faktura"
          value={invoice} onChange={setInvoice}
          lines={invoiceLines} onLinesChange={setInvoiceLines}
          books={MOCK_BOOKS} accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          currencies={CURRENCIES}
          documentType="FP" periodLabel="Rok 2026" rateAmount={1}
          mainSide="D"
          linesEditorProps={{ dimensionRequired: true, storageKey: "showcase-doc-fp" }}
          status="filed"
          tabs={[{
            id: "schedule", label: "Platební kalendář", badge: schedule.length,
            content: (
              <PaymentScheduleEditor items={schedule} onChange={setSchedule} totalToPay={invoice.amountTotal}
                paid={3630} remaining={invoice.amountTotal - 3630} users={USERS} canRelease canUnrelease />
            ),
          }]}
          actions={<>
            <Button variant="outline" onClick={() => toast.success("Koncept uložen")}>Uložit koncept</Button>
            <Button onClick={() => toast.success("Doklad zaúčtován")}>Zaúčtovat</Button>
          </>}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Vydaná faktura – odběratel s IČ a DIČ"
        description="editableFields povolí pouze popis a platební údaje; řádky mění jen popisné údaje. Uvolněná pozastávka je jen ke čtení.">
        <DocumentForm
          title="Vydaná faktura"
          value={{ ...posted, mainAccountId: "311001" }} onChange={setPosted}
          lines={postedLines} onLinesChange={setPostedLines}
          books={MOCK_BOOKS} accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          documentType="FV" periodLabel="Rok 2026"
          mainSide="MD"
          editableFields={["description", "dueDate", "variableSymbol", "constantSymbol", "specificSymbol", "bankAccount", "excludeFromPaymentOrders"]}
          linesEditorProps={{ editableFields: ["text", "debitVs", "creditVs", "debitPartnerId", "creditPartnerId", "debitDimensionId", "creditDimensionId", "nonTax"], storageKey: "showcase-doc-posted" }}
          status="posted" approved
          changedBy="Jana Nováková" changedAt="12.09.2026 14:05"
          tabs={[{
            id: "schedule", label: "Platební kalendář",
            content: <PaymentScheduleEditor items={postedSchedule} onChange={setPostedSchedule} totalToPay={12100} paid={10890} remaining={1210} users={USERS} canUnrelease />,
          }]}
        />
      </ShowcaseSection>

      <ShowcaseSection title="Pokladna – výdej s haléřovým vyrovnáním"
        description="Směr je jen ke čtení, číslo se přidělí při zařazení. Hlavní účet 211 na straně DAL, řádek zaokrouhlení je poslední.">
        <DocumentForm
          title="Pokladní doklad – výdej"
          value={cash} onChange={setCash}
          lines={cashLines} onLinesChange={setCashLines}
          accounts={MOCK_ACCOUNTS} partners={MOCK_PARTNERS} dimensions={MOCK_DIMENSIONS}
          documentType="PO" periodLabel="Rok 2026"
          books={MOCK_BOOKS.filter((book) => book.id === "b-pd")}
          isNew mainSide="D" mainAccountLocked
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
          documentType="ID" periodLabel="Rok 2026"
          linesEditorProps={{ storageKey: "showcase-doc-internal" }}
          status="filed"
        />
      </ShowcaseSection>
    </>
  );
}
