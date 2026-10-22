import { describe, expect, it } from "vitest";

import type { JournalLine, VatCodeOption } from "@/components/ds/accounting/journal-lines";
import { applyVatAllocation, baseFromGrossAmount, computeVatGroups, largestBaseLineId, removeVatOverride, resolveDifferenceActions, taxFromGrossTotal, upsertVatOverride } from "@/components/ds/accounting/journal-vat-groups";

const code = (id: string, rate: number | null, extra: Partial<VatCodeOption> = {}) =>
  ({
    id,
    code: id,
    name: id,
    direction: "in",
    hasTax: rate !== null,
    rate,
    selfAssessment: false,
    requiresPdpSubject: false,
    ...extra,
  }) as VatCodeOption;
const CODES = [
  code("p21", 21),
  code("p12", 12),
  code("pdp", 21, { selfAssessment: true }),
  code("osv", null),
];
const line = (id: string, amount: number, vatCodeId = "p21", extra: Partial<JournalLine> = {}) =>
  ({ id, text: id, amount, vatCodeId, ...extra }) as JournalLine;

describe("computeVatGroups", () => {
  it("82,64 při 21 % s přepisem 17,36 dá celkem 100,00", () => {
    const { groups } = computeVatGroups(
      [line("a", 82.64)],
      [{ vatCodeId: "p21", vatRate: 21, taxAmount: 17.36 }],
      CODES,
    );
    expect(groups[0].calculatedTax).toBe(17.35);
    expect(groups[0].tax).toBe(17.36);
    expect(groups[0].gross).toBe(100);
    expect(groups[0].withinTolerance).toBe(true);
  });

  it("3 × 12,50 při 21 % dá 7,88 rozpočtené 2,62 / 2,63 / 2,63", () => {
    const { groups } = computeVatGroups(
      [line("a", 12.5), line("b", 12.5), line("c", 12.5)],
      [],
      CODES,
    );
    expect(groups[0].tax).toBe(7.88);
    expect(groups[0].lines.map((s) => s.tax)).toEqual([2.62, 2.63, 2.63]);
  });

  it("EUR s kurzem DPH 24,50: přepis +0,03 projde, +0,05 ne", () => {
    const lines = [line("a", 0, "p21", { foreignAmount: 100 })];
    const ok = computeVatGroups(
      lines,
      [{ vatCodeId: "p21", vatRate: 21, taxAmount: 21.03 }],
      CODES,
      {
        foreign: true,
        exchangeRate: 24.5,
      },
    );
    const over = computeVatGroups(
      lines,
      [{ vatCodeId: "p21", vatRate: 21, taxAmount: 21.05 }],
      CODES,
      {
        foreign: true,
        exchangeRate: 24.5,
      },
    );
    expect(ok.groups[0].withinTolerance).toBe(true);
    expect(over.groups[0].withinTolerance).toBe(false);
    expect(over.groups[0].differenceHome).toBe(1.23);
  });

  it("+500 a −500 dají daň 0", () => {
    const { groups } = computeVatGroups([line("a", 500), line("b", -500)], [], CODES);
    expect(groups[0].tax).toBe(0);
    expect(groups[0].lines.map((s) => s.tax)).toEqual([0, 0]);
  });

  it("dvě skupiny 21 % a 12 %", () => {
    const { groups, taxTotal } = computeVatGroups(
      [line("a", 1000), line("b", 1000, "p12")],
      [],
      CODES,
    );
    expect(groups.map((g) => [g.rate, g.tax])).toEqual([
      [21, 210],
      [12, 120],
    ]);
    expect(taxTotal).toBe(330);
  });

  it("kód bez daně a pevná daň do skupiny nevstupují, samovyměření má vlastní skupinu", () => {
    const { groups, fixed, taxTotal } = computeVatGroups(
      [
        line("a", 100),
        line("b", 100, "pdp"),
        line("c", 100, "osv"),
        line("d", -1000, "p21", { vatManual: true, vatAmount: -210 }),
      ],
      [],
      CODES,
    );
    expect(groups.map((g) => [g.vatCodeId, g.base, g.selfAssessment])).toEqual([
      ["p21", 100, false],
      ["pdp", 100, true],
    ]);
    expect(fixed).toEqual([{ lineId: "d", vatCodeId: "p21", base: -1000, tax: -210 }]);
    expect(taxTotal).toBe(-168);
  });

  it("rozpočet se promítne do řádků náhledu", () => {
    const lines = [line("a", 12.5), line("b", 12.5)];
    const allocated = applyVatAllocation(lines, computeVatGroups(lines, [], CODES));
    expect(allocated.map((l) => l.vatAmount)).toEqual([2.62, 2.63]);
  });
});

describe("pomocné výpočty", () => {
  it("základ z ceny s DPH na přesnost sloupce", () => {
    expect(baseFromGrossAmount(100, 21)).toBe(82.64);
    expect(baseFromGrossAmount(100, 21, 4)).toBe(82.6446);
    expect(taxFromGrossTotal(100, 21)).toBe(17.36);
  });

  it("přepis lze nastavit a vrátit", () => {
    const set = upsertVatOverride([], { vatCodeId: "p21", rate: 21 }, 17.36);
    expect(set).toEqual([{ vatCodeId: "p21", vatRate: 21, taxAmount: 17.36 }]);
    expect(removeVatOverride(set, { vatCodeId: "p21", rate: 21 })).toEqual([]);
  });

  it("řádek s největším základem, při shodě dřívější", () => {
    expect(largestBaseLineId([line("a", 10), line("b", -30), line("c", 30)])).toBe("b");
  });
});

describe("resolveDifferenceActions", () => {
  it("jedna skupina a haléřový rozdíl → Dorovnat DPH", () => {
    expect(
      resolveDifferenceActions({
        difference: 0.01,
        groups: [{ key: "x" }],
        lineCount: 1,
        roundingLimit: 1,
      }),
    ).toEqual({ actions: ["vat", "base", "rounding"], preferred: "vat" });
  });

  it("víc skupin → Zaokrouhlení v limitu", () => {
    const result = resolveDifferenceActions({
      difference: 0.4,
      groups: [{ key: "x" }, { key: "y" }],
      lineCount: 2,
      roundingLimit: 0.5,
    });
    expect(result.preferred).toBe("rounding");
  });

  it("nad limit žádná výchozí akce ani Zaokrouhlení", () => {
    const result = resolveDifferenceActions({
      difference: 5,
      groups: [],
      lineCount: 2,
      roundingLimit: 0.5,
    });
    expect(result).toEqual({ actions: ["base"], preferred: null });
  });

  it("nulový rozdíl bez akcí", () => {
    expect(resolveDifferenceActions({ difference: 0, groups: [], lineCount: 1 }).actions).toEqual(
      [],
    );
  });
});
