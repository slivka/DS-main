import { describe, expect, it } from "bun:test";
import {
  accountColumnPair,
  accountColumns,
} from "../../src/components/ds/accounting/account-columns";

type Row = { debit: string; credit: string; account: string };
const names: Record<string, string> = { "321100": "Závazky", "311200": "Odběratelé" };

describe("account columns 2.66", () => {
  it("ponechá rozšířené formy viditelné a krátké skryté s textovou tečkovanou hodnotou", () => {
    const cols = accountColumns<Row>({
      debit: (r) => r.debit,
      credit: (r) => r.credit,
      accountName: (code) => names[code],
    });
    expect(cols.map((c) => [c.id, c.label, c.defaultVisible])).toEqual([
      ["debitAccount", "MD", false],
      ["debitAccountName", "MD účet", undefined],
      ["creditAccount", "DAL", false],
      ["creditAccountName", "DAL účet", undefined],
    ]);
    expect(cols[0]?.value?.({ debit: "321100", credit: "311200", account: "" })).toBe("321.100");
    expect(cols[1]?.value?.({ debit: "321100", credit: "311200", account: "" })).toBe(
      "321.100 - Závazky",
    );
  });

  it("vytvoří veřejnou jednoúčtovou dvojici", () => {
    const cols = accountColumnPair<Row>({
      id: "account",
      label: "Účet",
      shortLabel: "Účet č.",
      getCode: (r) => r.account,
      accountName: (code) => names[code],
    });
    expect(cols.map((c) => c.id)).toEqual(["account", "accountName"]);
    expect(cols[0]?.value?.({ debit: "", credit: "", account: "321100" })).toBe("321.100");
    expect(cols[1]?.value?.({ debit: "", credit: "", account: "321100" })).toBe(
      "321.100 - Závazky",
    );
  });
});
