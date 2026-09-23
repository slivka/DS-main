import { test, expect } from "@playwright/test";
import {
  generatePaymentSchedule,
  sumPaymentSchedule,
} from "../../src/components/ds/accounting/payment-schedule";
import { documentFieldsForType } from "../../src/components/ds/accounting/document-fields";

test.describe("generatePaymentSchedule", () => {
  test("12 100 / 3 splátky / 10 % pozastávka", () => {
    const items = generatePaymentSchedule(12100, {
      count: 3, firstDueDate: "2026-01-31", interval: "month", retentionPercent: 10, retentionDueDate: "2027-01-31",
    });
    expect(items.map((i) => i.amount)).toEqual([3630, 3630, 3630, 1210]);
    expect(items.map((i) => i.kind)).toEqual(["installment", "installment", "installment", "retention"]);
    expect(items.map((i) => i.dueDate)).toEqual(["2026-01-31", "2026-02-28", "2026-03-31", "2027-01-31"]);
    expect(sumPaymentSchedule(items)).toBe(12100);
  });

  test("10 000 / 3 – rozdíl do poslední splátky", () => {
    const items = generatePaymentSchedule(10000, { count: 3, firstDueDate: "2026-02-15", interval: "month" });
    expect(items.map((i) => i.amount)).toEqual([3333.33, 3333.33, 3333.34]);
  });

  test("čtvrtletní interval", () => {
    const items = generatePaymentSchedule(4000, { count: 4, firstDueDate: "2026-01-15", interval: "quarter" });
    expect(items.map((i) => i.dueDate)).toEqual(["2026-01-15", "2026-04-15", "2026-07-15", "2026-10-15"]);
  });

  test("vlastní počet dní a pozastávka částkou", () => {
    const items = generatePaymentSchedule(1000, {
      count: 2, firstDueDate: "2026-12-20", interval: "days", intervalDays: 14, retentionAmount: 100,
    });
    expect(items.map((i) => i.dueDate)).toEqual(["2026-12-20", "2027-01-03", "2027-01-03"]);
    expect(items.map((i) => i.amount)).toEqual([450, 450, 100]);
  });

  test("předvolby polí podle typu dokladu", () => {
    expect(documentFieldsForType("FP").paymentOrders).toBe(true);
    expect(documentFieldsForType("ID").partner).toBe(false);
    expect(documentFieldsForType("PO").direction).toBe(true);
  });
});
