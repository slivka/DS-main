import { describe, expect, it } from "bun:test";
import { amountInWordsCs, reportPageLabel } from "../../src/components/ds/print/report-pdf";
import { cashReceiptNumberLabel, formatCashReceiptMoney, planCashReceiptPages } from "../../src/components/ds/print/cash-receipt-pdf";

describe("české částky slovy", () => {
  it.each([
    [0, "nulakorunčeských"],
    [1, "jednakorunačeská"],
    [2, "dvěkorunyčeské"],
    [5, "pětkorunčeských"],
    [21, "dvacetjednakorunčeských"],
    [22, "dvacetdvakorunčeských"],
    [100, "stokorunčeských"],
    [101, "stojednakorunčeských"],
    [1000, "jedentisíckorunčeských"],
    [1001, "jedentisícjednakorunčeských"],
    [2.999, "třikorunyčeské"],
    [1_000_000_000, "jednamiliardakorunčeských"],
    [1234567.89, "jedenmiliondvěstětřicetčtyřitisícpětsetšedesátsedmkorunčeských a osmdesátdevěthaléřů"],
    [-2, "minus dvěkorunyčeské"],
    [1.01, "jednakorunačeská a jedenhaléř"],
    [2.02, "dvěkorunyčeské a dvahaléře"],
    [5.05, "pětkorunčeských a pěthaléřů"],
    [21.21, "dvacetjednakorunčeských a dvacetjedenhaléřů"],
  ])("převede %s", (amount, expected) => expect(amountInWordsCs(amount)).toBe(expected));

  it("u cizí měny připíše kód a správnou setinu", () => {
    expect(amountInWordsCs(180.5, "EUR")).toBe("stoosmdesát EUR a padesát centů");
    expect(amountInWordsCs(1, "EUR")).toBe("jedna EUR");
    expect(amountInWordsCs(180.5, "GBP")).toBe("stoosmdesát GBP a 50/100");
  });
  it("odmítne bilion a vyšší částky", () => expect(() => amountInWordsCs(1_000_000_000_000)).toThrow());
});

describe("číslování stran sestavy", () => {
  it("jednu stranu nečísluje", () => expect(reportPageLabel(1, 1)).toBe(""));
  it("více stran čísluje", () => expect(reportPageLabel(2, 3)).toBe("Strana 2 z 3"));
});

describe("měnové značky pokladního dokladu 2.44.0", () => {
  it("použije značku měny a bez ní zachová kód", () => {
    expect(formatCashReceiptMoney(1_000, "CZK", "Kč")).toBe("1 000,00 Kč");
    expect(formatCashReceiptMoney(40, "EUR", "€")).toBe("40,00 €");
    expect(formatCashReceiptMoney(40, "EUR")).toBe("40,00 EUR");
  });
});

describe("tisk pokladního dokladu podle nastavení 2.51.0", () => {
  it("skládá kopie po dvou na stránku", () => {
    expect(planCashReceiptPages(5, true, false)).toEqual([
      { page: 0, slot: 0, copy: false }, { page: 0, slot: 1, copy: true },
      { page: 1, slot: 0, copy: true }, { page: 1, slot: 1, copy: true },
      { page: 2, slot: 0, copy: true },
    ]);
  });
  it("bez skládání nebo u dlouhého dokladu dává každou kopii na vlastní stranu", () => {
    expect(planCashReceiptPages(3, false, false).map((p) => p.page)).toEqual([0, 1, 2]);
    expect(planCashReceiptPages(2, true, true).map((p) => p.page)).toEqual([0, 1]);
    expect(planCashReceiptPages(1, true, false)).toEqual([{ page: 0, slot: 0, copy: false }]);
  });
  it("vypnutý tisk čísla nechává pole prázdné", () => {
    expect(cashReceiptNumberLabel({ number: "PPD1", status: "filed", printNumber: false })).toBe("");
    expect(cashReceiptNumberLabel({ number: "PPD1", status: "filed" })).toBe("PPD1");
    expect(cashReceiptNumberLabel({ number: "PPD1", status: "draft" })).toBe("—");
  });
});