import type { AccountOption } from "../../components/ds/accounting/account-select";
import type { DocumentStatus } from "../../components/ds/accounting/document-status-badge";
import type { FiscalPeriod } from "../../components/ds/accounting/fiscal-period-select";

/** Ukázková účtová osnova (pouze pro showcase design systému). */
export const MOCK_ACCOUNTS: AccountOption[] = [
  { code: "211", name: "Pokladna", type: "asset", postable: false, category: "bilance", accountType: "rozvahovy" },
  { code: "211001", name: "Pokladna hlavní", type: "asset", postable: true, category: "bilance", accountType: "rozvahovy" },
  { code: "211002", name: "Pokladna valutová", type: "asset", category: "bilance", accountType: "rozvahovy" },
  { code: "221", name: "Bankovní účty", type: "asset", postable: false, category: "bilance", accountType: "rozvahovy" },
  { code: "221001", name: "Běžný účet CZK", type: "asset", category: "bilance", accountType: "rozvahovy" },
  { code: "221002", name: "Běžný účet EUR", type: "asset", category: "bilance", accountType: "rozvahovy" },
  { code: "311100", name: "Odběratelé tuzemsko", type: "asset", category: "pohledavky", accountType: "rozvahovy" },
  { code: "311200", name: "Odběratelé zahraničí", type: "asset", category: "pohledavky", accountType: "rozvahovy" },
  { code: "311001", name: "Odběratelé", type: "asset", category: "pohledavky", accountType: "rozvahovy" },
  { code: "321001", name: "Dodavatelé", type: "liability", category: "zavazky", accountType: "rozvahovy" },
  { code: "321100", name: "Závazky", type: "liability", category: "zavazky", accountType: "rozvahovy" },
  { code: "343001", name: "DPH 21 %", type: "liability", category: "bilance", accountType: "rozvahovy" },
  { code: "411000", name: "Základní kapitál", type: "equity", category: "bilance", accountType: "rozvahovy" },
  { code: "511001", name: "Opravy a udržování", type: "expense", category: "vysledkove", accountType: "nakladovy" },
  { code: "513001", name: "Náklady na reprezentaci", type: "expense", category: "vysledkove", accountType: "nakladovy" },
  { code: "518001", name: "Ostatní služby", type: "expense", category: "vysledkove", accountType: "nakladovy" },
  { code: "518002", name: "Nájemné", type: "expense", category: "vysledkove", accountType: "nakladovy" },
  { code: "521001", name: "Mzdové náklady", type: "expense", category: "vysledkove", accountType: "nakladovy" },
  { code: "548001", name: "Zaokrouhlovací rozdíly", type: "expense", category: "vysledkove", accountType: "nakladovy" },
  { code: "602001", name: "Tržby z prodeje služeb", type: "revenue", category: "vysledkove", accountType: "vynosovy" },
  { code: "604001", name: "Tržby za zboží", type: "revenue", category: "vysledkove", accountType: "vynosovy" },
  { code: "648001", name: "Ostatní provozní výnosy", type: "revenue", category: "vysledkove", accountType: "vynosovy" },
  { code: "999001", name: "Podrozvahová evidence", type: "offBalance", active: false },
];

export const MOCK_PERIODS: FiscalPeriod[] = [
  { id: "2026", name: "Rok 2026", from: "2026-01-01", to: "2026-12-31", state: "open" },
  { id: "2025", name: "Rok 2025", from: "2025-01-01", to: "2025-12-31", state: "closing" },
  { id: "2024", name: "Rok 2024", from: "2024-01-01", to: "2024-12-31", state: "closed" },
];

export const MOCK_WORKSPACES = [
  { id: "ws-slivka", name: "Slivka Group" },
  { id: "ws-partner", name: "Partnerský prostor" },
];

export const MOCK_COMPANIES = [
  { id: "c1", name: "Slivka Accounting s.r.o.", workspaceId: "ws-slivka" },
  { id: "c2", name: "Slivka Reality a.s.", workspaceId: "ws-slivka" },
  { id: "c3", name: "Partner Servis s.r.o.", workspaceId: "ws-partner" },
];

export type JournalEntry = {
  id: string;
  date: string;
  document: string;
  debitAccount: string;
  creditAccount: string;
  debit: number;
  credit: number;
  symbol: string;
  partner: string;
  text: string;
  status: DocumentStatus;
};

const PARTNERS = [
  "Alfa Trading s.r.o.",
  "Beta Servis a.s.",
  "Cesta Logistic s.r.o.",
  "Dřevo Morava s.r.o.",
  "Elektro Novák",
  "Fortis Consulting s.r.o.",
];

const TEXTS = [
  "Fakturace služeb",
  "Nájemné kanceláře",
  "Úhrada faktury",
  "Nákup materiálu",
  "Mzdy za měsíc",
  "Bankovní poplatky",
];

const STATUSES: DocumentStatus[] = ["posted", "posted", "posted", "draft", "cancelled"];

/** Ukázkový účetní deník – generovaný v paměti, bez databáze. */
export const MOCK_JOURNAL: JournalEntry[] = Array.from({ length: 180 }, (_, i) => {
  const month = (i % 12) + 1;
  const day = ((i * 7) % 27) + 1;
  const amount = Math.round((1200 + ((i * 3767) % 480000)) / 10) * 10 + (i % 100) / 100;
  const debitSide = i % 2 === 0;
  return {
    id: `je-${i + 1}`,
    date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    document: `FP${String(2026000 + i + 1)}`,
    debitAccount: debitSide ? "518001" : "221001",
    creditAccount: debitSide ? "321001" : "602001",
    debit: debitSide ? amount : amount,
    credit: amount,
    symbol: String(500000 + i * 13),
    partner: PARTNERS[i % PARTNERS.length],
    text: TEXTS[i % TEXTS.length],
    status: STATUSES[i % STATUSES.length],
  } satisfies JournalEntry;
});

/** Ukázkoví obchodní partneři (jen pro showcase). */
export const MOCK_PARTNERS = [
  { id: "p1", name: "Alfa Trading s.r.o.", ico: "27182818", dic: "CZ27182818", country: "CZ", kind: "company" as const },
  { id: "p2", name: "Beta Servis a.s.", ico: "27074358", dic: "CZ27074358", country: "CZ", kind: "company" as const },
  { id: "p3", name: "Cesta Logistic s.r.o.", ico: "16180339", dic: "CZ16180339" },
  { id: "p4", name: "Delta Consulting s.r.o.", ico: "14142135" },
  { id: "p5", name: "Epsilon Media s.r.o.", ico: "17320508" },
];

/** Ukázkové knihy dokladů. */
export const MOCK_BOOKS = [
  { id: "b-fp", code: "FP", name: "Přijaté faktury", type: "invoiceIn" as const },
  { id: "b-fv", code: "FV", name: "Vydané faktury", type: "invoiceOut" as const },
  { id: "b-bv", code: "BV", name: "Bankovní výpisy", type: "bank" as const },
  { id: "b-pd", code: "PD", name: "Pokladní doklady", type: "cash" as const },
  { id: "b-id", code: "ID", name: "Interní doklady", type: "internal" as const },
];

/** Ukázkový strom zakázek – nadřazené větve nejsou volitelné. */
export const MOCK_DIMENSIONS = [
  { id: "d-cz", code: "CZ", name: "Česká republika", selectable: false },
  { id: "d-cz-1", parentId: "d-cz", code: "CZ-100", name: "Rekonstrukce Brno" },
  { id: "d-cz-2", parentId: "d-cz", code: "CZ-200", name: "Novostavba Praha" },
  { id: "d-sk", code: "SK", name: "Slovensko", selectable: false },
  { id: "d-sk-1", parentId: "d-sk", code: "SK-100", name: "Servis Bratislava" },
  { id: "d-rezie", code: "REZ", name: "Režie" },
];

export type ChartNode = {
  id: string;
  parentId?: string | null;
  code: string;
  name: string;
  debit: number;
  credit: number;
};

/** Ukázková účtová osnova ve stromu (třída → skupina → syntetika → analytika). */
export const MOCK_CHART_TREE: ChartNode[] = [
  { id: "t2", code: "2", name: "Finanční účty", debit: 0, credit: 0 },
  { id: "g22", parentId: "t2", code: "22", name: "Účty v bankách", debit: 0, credit: 0 },
  { id: "s221", parentId: "g22", code: "221", name: "Bankovní účty", debit: 0, credit: 0 },
  { id: "a221001", parentId: "s221", code: "221001", name: "Běžný účet CZK", debit: 1284500.5, credit: 942310.25 },
  { id: "a221002", parentId: "s221", code: "221002", name: "Běžný účet EUR", debit: 318200, credit: 205480.9 },
  { id: "t3", code: "3", name: "Zúčtovací vztahy", debit: 0, credit: 0 },
  { id: "g31", parentId: "t3", code: "31", name: "Pohledávky", debit: 0, credit: 0 },
  { id: "s311", parentId: "g31", code: "311", name: "Odběratelé", debit: 0, credit: 0 },
  { id: "a311001", parentId: "s311", code: "311001", name: "Odběratelé tuzemsko", debit: 2450800.75, credit: 1980420.1 },
  { id: "g32", parentId: "t3", code: "32", name: "Závazky", debit: 0, credit: 0 },
  { id: "s321", parentId: "g32", code: "321", name: "Dodavatelé", debit: 0, credit: 0 },
  { id: "a321001", parentId: "s321", code: "321001", name: "Dodavatelé tuzemsko", debit: 890400.4, credit: 1560900.8 },
  { id: "a321100", parentId: "s321", code: "321100", name: "Závazky ostatní", debit: 120300, credit: 245600.35 },
  { id: "t5", code: "5", name: "Náklady", debit: 0, credit: 0 },
  { id: "g51", parentId: "t5", code: "51", name: "Služby", debit: 0, credit: 0 },
  { id: "s518", parentId: "g51", code: "518", name: "Ostatní služby", debit: 0, credit: 0 },
  { id: "a518001", parentId: "s518", code: "518001", name: "Ostatní služby", debit: 642100.2, credit: 12400 },
  { id: "a518002", parentId: "s518", code: "518002", name: "Nájemné", debit: 480000, credit: 0 },
  { id: "t6", code: "6", name: "Výnosy", debit: 0, credit: 0 },
  { id: "g60", parentId: "t6", code: "60", name: "Tržby", debit: 0, credit: 0 },
  { id: "s602", parentId: "g60", code: "602", name: "Tržby z prodeje služeb", debit: 0, credit: 0 },
  { id: "a602001", parentId: "s602", code: "602001", name: "Tržby ze služeb", debit: 18400, credit: 3894250.6 },
];
