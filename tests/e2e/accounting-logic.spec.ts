import { test, expect } from "@playwright/test";
import { toDbLines, fromDbLines } from "../../src/components/ds/accounting/journal-lines";
import { convertAmount } from "../../src/components/ds/accounting/currency-amount";

test.describe("Accounting Logic Unit Tests", () => {
  test("convertAmount handles rates and units correctly", () => {
    expect(convertAmount(100, 25.123456, 1)).toBe(2512.35);
    expect(convertAmount(1000, 25, 100)).toBe(250.00); // Pro 100 jednotek měny
    expect(convertAmount(0, 25, 1)).toBe(0);
  });

  test("roundtrip conversion (UI <-> DB) preserves data integrity", () => {
    const uiLines = [
      { id: "1", amount: 123.45, debitAccount: "211", creditAccount: "602", text: "Test" }
    ];
    
    const dbLines = toDbLines(uiLines);
    expect(dbLines).toHaveLength(2);
    expect(dbLines[0]).toMatchObject({ pairNo: 1, account: "211", debit: 123.45, credit: 0 });
    expect(dbLines[1]).toMatchObject({ pairNo: 1, account: "602", debit: 0, credit: 123.45 });

    const backToUi = fromDbLines(dbLines);
    expect(backToUi[0].amount).toBe(123.45);
    expect(backToUi[0].debitAccount).toBe("211");
    expect(backToUi[0].creditAccount).toBe("602");
    expect(backToUi[0].pairNo).toBe(1);
  });

  test("fromDbLines zachová nespárovatelný starší řádek", () => {
    const [line] = fromDbLines([{ account: "211", debit: 500, credit: 0, text: "Starší data" }]);
    expect(line).toMatchObject({ debitAccount: "211", creditAccount: null, amount: 500, text: "Starší data" });
  });
});
