import type { AccountOption } from "@/components/ds/accounting/account-select";
import type { DocumentStatus } from "@/components/ds/accounting/document-status-badge";
import type { FiscalPeriod } from "@/components/ds/accounting/fiscal-period-select";

/** Ukázková účtová osnova (pouze pro showcase design systému). */
export const MOCK_ACCOUNTS: AccountOption[] = [
  { code: "211", name: "Pokladna", type: "asset" },
  { code: "211001", name: "Pokladna hlavní", type: "asset" },
  { code: "211002", name: "Pokladna valutová", type: "asset" },
  { code: "221", name: "Bankovní účty", type: "asset" },
  { code: "221001", name: "Běžný účet CZK", type: "asset" },
  { code: "221002", name: "Běžný účet EUR", type: "asset" },
  { code: "311001", name: "Odběratelé tuzemsko", type: "asset" },
  { code: "321001", name: "Dodavatelé tuzemsko", type: "liability" },
  { code: "343001", name: "DPH 21 %", type: "liability" },
  { code: "411000", name: "Základní kapitál", type: "equity" },
  { code: "518001", name: "Ostatní služby", type: "expense" },
  { code: "518002", name: "Nájemné", type: "expense" },
  { code: "521001", name: "Mzdové náklady", type: "expense" },
  { code: "602001", name: "Tržby za služby", type: "revenue" },
  { code: "604001", name: "Tržby za zboží", type: "revenue" },
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
