/** Fiktivní vyúčtování záloh · hotové hodnoty jako z DB · nepatří do knihovny. */
import type { AdvanceRegisterViewRow } from "../ds/accounting/advances/advance-register-view-types";
import { ACC, d, s, type Side } from "./advance-register-view-data";

export const SETTLEMENTS: Record<Side, AdvanceRegisterViewRow[]> = {
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
