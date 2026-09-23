import { test, expect } from "@playwright/test";
import { toJournalRow, fromJournalRow, sideFieldRules } from "../../src/components/ds/accounting/journal-lines";
import { convertAmount } from "../../src/components/ds/accounting/currency-amount";

test.describe("Accounting Logic Unit Tests", () => {
  test("convertAmount handles rates and units correctly", () => {
    expect(convertAmount(100, 25.123456, 1)).toBe(2512.35);
    expect(convertAmount(1000, 25, 100)).toBe(250.00); // Pro 100 jednotek měny
    expect(convertAmount(0, 25, 1)).toBe(0);
  });

  test("roundtrip toJournalRow / fromJournalRow zachová data", () => {
    const row = toJournalRow({ id: "1", amount: 123.45, debitAccount: "211", creditAccount: "602", text: "Test" });
    expect(row).toMatchObject({ debit_account_id: "211", credit_account_id: "602", amount: 123.45, description: "Test" });
    const back = fromJournalRow(row, "1");
    expect(back).toMatchObject({ id: "1", amount: 123.45, debitAccount: "211", creditAccount: "602", text: "Test" });
  });

  test("toJournalRow mapuje předkontaci na jeden databázový řádek", () => {
    const row = toJournalRow({
      id: "1", debitAccount: "518001", creditAccount: "321001", amount: 1200,
      text: "Služby", vs: "2026000001", partnerId: "p1", dimensionId: "d-cz-1", nonTax: true,
    });
    expect(row).toMatchObject({
      debit_account_id: "518001", credit_account_id: "321001", amount: 1200,
      description: "Služby", debit_variable_symbol: "2026000001", credit_variable_symbol: "2026000001",
      debit_partner_id: "p1", credit_partner_id: "p1", non_tax: true, is_rounding: false,
    });

    const onlyCredit = toJournalRow({ id: "2", amount: 10, vs: "5" }, { sharedSide: "credit" });
    expect(onlyCredit.debit_variable_symbol).toBeNull();
    expect(onlyCredit.credit_variable_symbol).toBe("5");

    const back = fromJournalRow(row, "1");
    expect(back).toMatchObject({ id: "1", debitAccount: "518001", creditAccount: "321001", amount: 1200, nonTax: true });
  });

  test("hlavní účet knihy určí protiúčet", () => {
    const row = toJournalRow({ id: "1", debitAccount: "211001", creditAccount: "602001", amount: 500 }, { mainSide: "MD" });
    expect(row.counter_account_id).toBe("602001");
  });

  test("sideFieldRules určí povinná stranová pole", () => {
    expect(sideFieldRules({ category: "zavazky" })).toMatchObject({ vsRequired: true, partnerOffered: true });
    expect(sideFieldRules({ category: "bilance" }, { dimensionRequired: true }).dimensionRequired).toBe(true);
  });
});
