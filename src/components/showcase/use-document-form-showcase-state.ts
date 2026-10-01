/**
 * Stav rozsáhlé ukázky formulářů dokladu.
 * Vlastní: izolovaný stav jednotlivých scénářů ukázky.
 * Nesmí: obsahovat prezentační strukturu nebo ukládat data mimo ukázku.
 */
import { useState } from "react";
import type { DocumentHeaderValue } from "@/components/ds/accounting/document-form";
import type { JournalLine } from "@/components/ds/accounting/journal-lines";
import type { PaymentScheduleItem } from "@/components/ds/accounting/payment-schedule";
import type { DocumentSettingsValue } from "@/components/ds/accounting/document-settings-dialog";
import type {
  DocumentCounterpartyValue,
  DocumentPrintValue,
} from "@/components/ds/accounting/document-detail-tabs";
import { MOCK_ACCOUNTS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";
import {
  INVOICE_HEADER,
  INVOICE_LINES,
  PURCHASE_INVOICE_HEADER,
  PURCHASE_INVOICE_LINES,
  SCHEDULE,
} from "./document-form-showcase-data";

export function useDocumentFormShowcaseState() {
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

  return {
    cashDateLocked,
    setCashDateLocked,
    courierVatRelevant,
    setCourierVatRelevant,
    invoiceVatRelevant,
    setInvoiceVatRelevant,
    handedSuggestions,
    setHandedSuggestions,
    descriptionSuggestions,
    setDescriptionSuggestions,
    invoice,
    setInvoice,
    invoiceLines,
    setInvoiceLines,
    schedule,
    setSchedule,
    settingsOpen,
    setSettingsOpen,
    formError,
    setFormError,
    lineValidationError,
    setLineValidationError,
    documentSettings,
    setDocumentSettings,
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
    courierLines,
    setCourierLines,
    courier,
    setCourier,
    cashIn,
    setCashIn,
    cashEur,
    setCashEur,
    fvCzk,
    setFvCzk,
    fvEur,
    setFvEur,
    counterpartyPrint,
    setCounterpartyPrint,
    printData,
    setPrintData,
    fpNonPayer,
    setFpNonPayer,
    idCp,
    setIdCp,
    exchangeDifference,
    setExchangeDifference,
    suggestNames,
    suggestDescriptions,
    common,
    units,
  };
}

export type ReturnTypeOfDocumentShowcaseState = ReturnType<typeof useDocumentFormShowcaseState>;
