/** Ukázková data záloh · vlastní demonstrační hodnoty · nepatří do připojené knihovny. */
import type {
  AdvanceDeductionRow,
  AdvanceRegisterRow,
  AdvancePaymentTotals,
} from "../ds/accounting/advances/advance-types";
import type { JournalDeductionRow } from "../ds/accounting/journal-deductions-types";
export const ADVANCE_CURRENCY = { code: "CZK", symbol: "Kč" };
export const ADVANCE_TOTALS: AdvancePaymentTotals = {
  amount: 2000,
  listAmount: 1815,
  cancelled: 185,
  withoutList: 185,
  taxAmount: 1500,
  noTaxDocument: 0,
  withoutTaxDocument: 500,
  deducted: 1000,
  refunded: 0,
  remaining: 1000,
};
export const ADVANCE_DEDUCTIONS: AdvanceDeductionRow[] = [
  {
    id: "closed",
    vs: "2026001",
    vatCode: "Z 21 %",
    base: 826.45,
    vat: 173.55,
    total: 1000,
    payment: "Spárováno",
    taxDocument: "DDPZ 2026001",
    status: "closed",
    permissions: { remove: { can: false, reason: "Doklad je uzavřený" } },
  },
  {
    id: "open",
    vs: "2026002",
    vatCode: "Z 21 %",
    base: 413.22,
    vat: 86.78,
    total: 500,
    payment: "Bez platby",
    status: "open",
    openReason: "Chybí spárovaná platba a daňový doklad",
    permissions: {
      linkTaxDocument: { can: true },
      matchPayment: { can: true },
      remove: { can: true },
    },
  },
];
export const ADVANCE_REGISTER: AdvanceRegisterRow[] = [
  {
    id: "payment1",
    partner: "Alfa Trading s.r.o.",
    vs: "2026001",
    paidAt: "2026-10-01",
    currency: ADVANCE_CURRENCY.code,
    amount: 2000,
    paidList: 1815,
    coveredTaxDocument: 1500,
    deducted: 1000,
    remaining: 1000,
    taxStatus: "partial",
    deadline: "2026-10-16",
    overdue: true,
    withoutDD: true,
  },
  {
    id: "payment2",
    partner: "Beta servis s.r.o.",
    vs: "2026002",
    paidAt: "2026-10-18",
    currency: ADVANCE_CURRENCY.code,
    amount: 3500,
    paidList: 3500,
    coveredTaxDocument: 3500,
    deducted: 0,
    remaining: 3500,
    taxStatus: "issued",
    deadline: "2026-11-02",
    overdue: false,
    withoutDD: false,
  },
];
/** Odečty jako řádky dokladu (APP mapuje z DB). */
export const DEDUCTION_ROWS: JournalDeductionRow[] = [
  {
    id: "zfv1",
    kind: "advance",
    text: "Odečet zálohy ZFV 2026001 (VS 2026001)",
    vatCode: "Z 21 %",
    base: -826.45,
    vat: -173.55,
    account: "324.001",
    status: "Uzavřený",
    payment: "Spárováno",
    taxDocument: "DDPZ 2026001",
    remove: { can: false, reason: "Doklad je uzavřený" },
  },
  {
    id: "zfv2",
    kind: "advance",
    text: "Odečet zálohy ZFV 2026002 (VS 2026002)",
    vatCode: "Z 21 %",
    base: -413.22,
    vat: -86.78,
    account: "324.001",
    status: "Otevřený",
    payment: "Bez platby",
    remove: { can: true },
  },
];
/** Ruční odečet (částka upravitelná). */
export const MANUAL_DEDUCTION: JournalDeductionRow = {
  id: "manual",
  kind: "manual",
  text: "Ruční odečet zálohy",
  vatCode: "Z 21 %",
  base: -500,
  vat: -105,
  account: "324.001",
  remove: { can: true },
};
