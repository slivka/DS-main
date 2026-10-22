/** Fiktivní obálky evidence záloh · simuluje odpověď DB · nepatří do připojené knihovny. */
import type {
  AdvanceRegisterData,
  AdvanceRegisterTab,
  AdvanceRegisterViewRow,
} from "../ds/accounting/advances/advance-register-view-types";

type Side = "provided" | "received";
const ACC = {
  provided: [
    { value: "314100", name: "Poskytnuté zálohy – tuzemsko" },
    { value: "314200", name: "Poskytnuté zálohy – zahraničí" },
  ],
  received: [{ value: "324100", name: "Přijaté zálohy" }],
};
export const advanceAccounts = (side: Side) => ACC[side];

const d = (row: Partial<AdvanceRegisterViewRow> & { id: string; account: string }) =>
  ({ rowKind: "detail", ...row }) as AdvanceRegisterViewRow;
const s = (
  rowKind: AdvanceRegisterViewRow["rowKind"],
  id: string,
  account: string,
  values: Partial<AdvanceRegisterViewRow>,
): AdvanceRegisterViewRow => ({ id, rowKind, account, ...values });

/** Hotové hodnoty, jak je vrací DB; ukázka nic nepočítá. */
const BALANCE: Record<Side, AdvanceRegisterViewRow[]> = {
  provided: [
    d({
      id: "b1",
      account: "314100",
      accountName: ACC.provided[0]!.name,
      partner: "Alfa s.r.o.",
      kind: "payment",
      document: "BV 2026/014",
      vs: "2026001",
      date: "2026-09-02",
      currency: "CZK",
      amount: 12100,
      amountHome: 12100,
      balance: 12100,
      balanceHome: 12100,
    }),
    d({
      id: "b2",
      account: "314100",
      partner: "Alfa s.r.o.",
      kind: "deduction",
      document: "FP 2026/101",
      vs: "2026001",
      date: "2026-09-30",
      currency: "CZK",
      amount: -6050,
      amountHome: -6050,
      balance: -6050,
      balanceHome: -6050,
      reason: "Vyúčtování",
    }),
    s("partner_total", "pt1", "314100", {
      partner: "Alfa s.r.o.",
      balance: 6050,
      balanceHome: 6050,
    }),
    d({
      id: "b3",
      account: "314100",
      partner: "Beta a.s.",
      kind: "payment",
      document: "BV 2026/018",
      vs: "2026007",
      date: "2026-10-05",
      currency: "CZK",
      amount: 30000,
      amountHome: 30000,
      balance: 30000,
      balanceHome: 30000,
    }),
    s("partner_total", "pt2", "314100", {
      partner: "Beta a.s.",
      balance: 30000,
      balanceHome: 30000,
    }),
    s("account_total", "at1", "314100", { balanceHome: 36050 }),
    s("account_control", "ac1", "314100", {
      ledgerBalance: 36050,
      registerBalance: 36050,
      difference: 0,
    }),
    d({
      id: "b4",
      account: "314200",
      accountName: ACC.provided[1]!.name,
      partner: "Gamma GmbH",
      kind: "payment",
      document: "BV 2026/021",
      vs: "88001",
      date: "2026-10-10",
      currency: "EUR",
      amount: 1000,
      amountHome: 24350,
      balance: 1000,
      balanceHome: 24350,
    }),
    s("partner_total", "pt3", "314200", { partner: "Gamma GmbH", balanceHome: 24350 }),
    s("account_total", "at2", "314200", { balanceHome: 24350 }),
    s("account_control", "ac2", "314200", {
      ledgerBalance: 24500,
      registerBalance: 24350,
      difference: 150,
    }),
  ],
  received: [
    d({
      id: "r1",
      account: "324100",
      accountName: ACC.received[0]!.name,
      partner: "Delta s.r.o.",
      kind: "payment",
      document: "BV 2026/030",
      vs: "2026101",
      date: "2026-10-01",
      currency: "CZK",
      amount: 50000,
      amountHome: 50000,
      balance: 50000,
      balanceHome: 50000,
    }),
    s("partner_total", "rp1", "324100", { partner: "Delta s.r.o.", balanceHome: 50000 }),
    s("account_total", "ra1", "324100", { balanceHome: 50000 }),
    s("account_control", "rc1", "324100", {
      ledgerBalance: 50000,
      registerBalance: 50000,
      difference: 0,
    }),
  ],
};
const PAYMENTS: Record<Side, AdvanceRegisterViewRow[]> = {
  provided: [
    d({
      id: "p1",
      account: "314100",
      accountName: ACC.provided[0]!.name,
      partner: "Alfa s.r.o.",
      vs: "2026001",
      date: "2026-09-02",
      currency: "CZK",
      amount: 12100,
      amountHome: 12100,
      paidList: 12100,
      coveredTaxDocument: 12100,
      deducted: 6050,
      refunded: 0,
      remaining: 6050,
      taxStatus: "issued",
      deadline: "2026-09-17",
    }),
    d({
      id: "p2",
      account: "314100",
      partner: "Beta a.s.",
      vs: "2026007",
      date: "2026-10-05",
      currency: "CZK",
      amount: 30000,
      amountHome: 30000,
      paidList: 30000,
      coveredTaxDocument: 0,
      deducted: 0,
      refunded: 0,
      remaining: 30000,
      taxStatus: "missing",
      deadline: "2026-10-20",
      overdue: true,
    }),
    s("account_total", "pa1", "314100", { amountHome: 42100, deducted: 6050, remaining: 36050 }),
    s("account_control", "pc1", "314100", {
      ledgerBalance: 36050,
      registerBalance: 36050,
      difference: 0,
    }),
    d({
      id: "p3",
      account: "314200",
      accountName: ACC.provided[1]!.name,
      partner: "Gamma GmbH",
      vs: "88001",
      date: "2026-10-10",
      currency: "EUR",
      amount: 1000,
      amountHome: 24350,
      paidList: 1000,
      coveredTaxDocument: 0,
      deducted: 0,
      refunded: 0,
      remaining: 1000,
      taxStatus: "notIssued",
      deadline: "2026-10-25",
    }),
    s("account_total", "pa2", "314200", { amountHome: 24350, remaining: 1000 }),
    s("account_control", "pc2", "314200", {
      ledgerBalance: 24500,
      registerBalance: 24350,
      difference: 150,
    }),
  ],
  received: [
    d({
      id: "q1",
      account: "324100",
      accountName: ACC.received[0]!.name,
      partner: "Delta s.r.o.",
      vs: "2026101",
      date: "2026-10-01",
      currency: "CZK",
      amount: 50000,
      amountHome: 50000,
      paidList: 50000,
      coveredTaxDocument: 50000,
      deducted: 0,
      refunded: 0,
      remaining: 50000,
      taxStatus: "issued",
      deadline: "2026-10-16",
    }),
    s("account_total", "qa1", "324100", { amountHome: 50000, remaining: 50000 }),
    s("account_control", "qc1", "324100", {
      ledgerBalance: 50000,
      registerBalance: 50000,
      difference: 0,
    }),
  ],
};
const SETTLEMENTS: Record<Side, AdvanceRegisterViewRow[]> = {
  provided: [
    d({
      id: "s1",
      account: "314100",
      accountName: ACC.provided[0]!.name,
      partner: "Alfa s.r.o.",
      document: "FP 2026/101",
      date: "2026-09-30",
      base: -5000,
      vat: -1050,
      matched: 6050,
      unmatched: 0,
    }),
    d({
      id: "s2",
      account: "314100",
      partner: "Beta a.s.",
      document: "FP 2026/120",
      date: "2026-10-15",
      base: -2000,
      vat: -420,
      matched: 0,
      unmatched: 2420,
      reason: "Chybí platba",
    }),
    s("account_total", "sa1", "314100", {
      base: -7000,
      vat: -1470,
      matched: 6050,
      unmatched: 2420,
    }),
    s("account_control", "sc1", "314100", {
      ledgerBalance: 36050,
      registerBalance: 36050,
      difference: 0,
    }),
  ],
  received: [
    d({
      id: "u1",
      account: "324100",
      accountName: ACC.received[0]!.name,
      partner: "Delta s.r.o.",
      document: "FV 2026/055",
      date: "2026-10-12",
      base: -10000,
      vat: -2100,
      matched: 12100,
      unmatched: 0,
    }),
    s("account_total", "ua1", "324100", { base: -10000, vat: -2100, matched: 12100, unmatched: 0 }),
  ],
};
const TOTALS: Record<AdvanceRegisterTab, Record<Side, Partial<AdvanceRegisterViewRow>>> = {
  balance: { provided: { balanceHome: 60400 }, received: { balanceHome: 50000 } },
  payments: {
    provided: { amountHome: 66450, deducted: 6050 },
    received: { amountHome: 50000, remaining: 50000 },
  },
  settlements: {
    provided: { base: -7000, vat: -1470, matched: 6050, unmatched: 2420 },
    received: { base: -10000, vat: -2100, matched: 12100, unmatched: 0 },
  },
};

/** Odpověď „DB“ pro záložku; filtr účtů a stavu simuluje APP. */
export function advanceRegisterData(
  side: Side,
  tab: AdvanceRegisterTab,
  accounts: string[],
  state: string,
): AdvanceRegisterData {
  const source = tab === "balance" ? BALANCE : tab === "payments" ? PAYMENTS : SETTLEMENTS;
  const rows = source[side].filter((row) => {
    if (accounts.length && !accounts.includes(row.account)) return false;
    if (row.rowKind !== "detail") return true;
    if (state === "unsettled") return Boolean(row.remaining);
    if (state === "withoutTaxDocument") return row.taxStatus === "missing";
    if (state === "overdue") return Boolean(row.overdue);
    if (state === "unmatched") return Boolean(row.unmatched);
    return true;
  });
  return {
    rows,
    totals: TOTALS[tab][side],
    total_count: rows.filter((row) => row.rowKind === "detail").length,
  };
}
