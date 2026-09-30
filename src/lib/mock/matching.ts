/** Ukázková data pro Saldokonto a Párování (jen pro ukázku, značky měn jsou součástí dat). */

export type OpenItemKind = "receivable" | "payable" | "advance";
export type OpenItemStatus = "open" | "partial" | "overdue";

export interface OpenItem {
  id: string;
  kind: OpenItemKind;
  partner: string;
  account: string;
  vs: string;
  document: string;
  date: string;
  due: string;
  currency: string;
  currencySymbol: string;
  rate: number;
  amount: number;
  matched: number;
  /** Typ protipoložky při párování. */
  source: "document" | "payment";
}

export const HOME_CURRENCY_SYMBOL = "Kč";
export const MATCHING_TODAY = "2026-09-29";

const p = (
  id: string,
  kind: OpenItemKind,
  partner: string,
  account: string,
  vs: string,
  document: string,
  date: string,
  due: string,
  amount: number,
  matched: number,
  source: OpenItem["source"] = "document",
  currency = "CZK",
  currencySymbol = "Kč",
  rate = 1,
): OpenItem => ({
  id,
  kind,
  partner,
  account,
  vs,
  document,
  date,
  due,
  currency,
  currencySymbol,
  rate,
  amount,
  matched,
  source,
});

export const MOCK_OPEN_ITEMS: OpenItem[] = [
  p(
    "o1",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "311001",
    "2026001",
    "FV-2026-001",
    "2026-07-05",
    "2026-07-19",
    12400,
    0,
  ),
  p(
    "o2",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "311001",
    "2026014",
    "FV-2026-014",
    "2026-08-12",
    "2026-08-26",
    48300,
    20000,
  ),
  p(
    "o3",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "311001",
    "2026031",
    "FV-2026-031",
    "2026-09-10",
    "2026-10-10",
    9680,
    0,
  ),
  p(
    "o4",
    "receivable",
    "BETA obchod a služby a.s.",
    "311001",
    "2026007",
    "FV-2026-007",
    "2026-02-02",
    "2026-02-16",
    156200,
    100000,
  ),
  p(
    "o5",
    "receivable",
    "BETA obchod a služby a.s.",
    "311002",
    "2026022",
    "FV-2026-022",
    "2026-09-01",
    "2026-09-15",
    2150,
    0,
    "document",
    "EUR",
    "€",
    24.35,
  ),
  p(
    "o6",
    "receivable",
    "GAMA stavby s.r.o.",
    "311001",
    "2025118",
    "FV-2025-118",
    "2025-08-20",
    "2025-09-03",
    72600,
    0,
  ),
  p(
    "o7",
    "payable",
    "Dodavatel energie a.s.",
    "321001",
    "8801234",
    "FP-2026-044",
    "2026-09-02",
    "2026-09-16",
    18750,
    0,
  ),
  p(
    "o8",
    "payable",
    "Kancelář Plus s.r.o.",
    "321001",
    "556677",
    "FP-2026-051",
    "2026-09-18",
    "2026-10-02",
    3490,
    0,
  ),
  p(
    "o9",
    "advance",
    "GAMA stavby s.r.o.",
    "314001",
    "2026500",
    "ZF-2026-005",
    "2026-06-01",
    "2026-06-15",
    50000,
    0,
  ),
];

/** Protipoložky k vybrané položce (platby a dobropisy). */
export const MOCK_COUNTER_ITEMS: OpenItem[] = [
  p(
    "c1",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "221001",
    "2026001",
    "BV-2026-091",
    "2026-07-20",
    "2026-07-20",
    12400,
    0,
    "payment",
  ),
  p(
    "c2",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "221001",
    "2026014",
    "BV-2026-112",
    "2026-09-03",
    "2026-09-03",
    15000,
    0,
    "payment",
  ),
  p(
    "c3",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "311001",
    "2026001",
    "DV-2026-002",
    "2026-07-15",
    "2026-07-15",
    1400,
    0,
    "document",
  ),
  p(
    "c4",
    "receivable",
    "ALFA servis Praha s.r.o.",
    "211001",
    "",
    "PPD-2026-033",
    "2026-07-22",
    "2026-07-22",
    5000,
    0,
    "payment",
  ),
  p(
    "c5",
    "receivable",
    "BETA obchod a služby a.s.",
    "221001",
    "2026007",
    "BV-2026-120",
    "2026-09-12",
    "2026-09-12",
    12400,
    0,
    "payment",
  ),
];

export interface MatchHistoryRow {
  id: string;
  group: string;
  date: string;
  document: string;
  partner: string;
  vs: string;
  amount: number;
  currencySymbol: string;
  user: string;
  cancelled: boolean;
  reason?: string;
}

export const MOCK_MATCH_HISTORY: MatchHistoryRow[] = [
  {
    id: "h1",
    group: "P-2026-0041",
    date: "2026-09-03",
    document: "FV-2026-014",
    partner: "ALFA servis Praha s.r.o.",
    vs: "2026014",
    amount: 20000,
    currencySymbol: "Kč",
    user: "Petr Slivka",
    cancelled: false,
  },
  {
    id: "h2",
    group: "P-2026-0041",
    date: "2026-09-03",
    document: "BV-2026-104",
    partner: "ALFA servis Praha s.r.o.",
    vs: "2026014",
    amount: -20000,
    currencySymbol: "Kč",
    user: "Petr Slivka",
    cancelled: false,
  },
  {
    id: "h3",
    group: "P-2026-0038",
    date: "2026-08-28",
    document: "FV-2026-014",
    partner: "ALFA servis Praha s.r.o.",
    vs: "2026014",
    amount: 5000,
    currencySymbol: "Kč",
    user: "Jana Nová",
    cancelled: true,
    reason: "Chybně zvolená platba",
  },
  {
    id: "h4",
    group: "P-2026-0038",
    date: "2026-08-28",
    document: "BV-2026-099",
    partner: "ALFA servis Praha s.r.o.",
    vs: "",
    amount: -5000,
    currencySymbol: "Kč",
    user: "Jana Nová",
    cancelled: true,
    reason: "Chybně zvolená platba",
  },
];

export const remaining = (item: OpenItem) => Math.round((item.amount - item.matched) * 100) / 100;

export function daysOverdue(item: OpenItem, today = MATCHING_TODAY): number {
  const diff = Math.floor((Date.parse(today) - Date.parse(item.due)) / 86_400_000);
  return remaining(item) > 0 ? Math.max(0, diff) : 0;
}
