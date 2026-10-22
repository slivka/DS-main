/** Zaokrouhlení jako Postgres round(numeric, 2), tolerance a dorovnání skupin DPH (2.109.0). */
import { describe, expect, it } from "bun:test";
import { mulDivRound, roundHalfAwayFromZero } from "../../src/lib/decimal-round";
import { allocateVatGroupTax, baseDeltaForDifference, baseFromGrossAmount, computeVatGroups, resolveDifferenceActions, taxFromGrossTotal, vatGroupsFromStored } from "../../src/components/ds/accounting/journal-vat-groups";
import type { JournalLine, VatCodeOption } from "../../src/components/ds/accounting/journal-lines";

const code = (id: string, rate: number): VatCodeOption =>
  ({ id, code: id, name: id, rate, hasTax: true, isActive: true }) as VatCodeOption;
const line = (id: string, amount: number, vatCodeId = "p21"): JournalLine =>
  ({ id, amount, vatCodeId, debitAccount: "518001", creditAccount: "321001" }) as JournalLine;

/** Referenční round(a × b / c, 2) v celých číslech: vstupy v setinách, polovina od nuly. */
function reference(baseCents: number, ratePct: number): number {
  const numerator = BigInt(baseCents) * BigInt(ratePct); // setiny × procenta
  const negative = numerator < 0n;
  const n = negative ? -numerator : numerator;
  const q = (2n * n + 100n) / 200n; // / 100 s polovinou nahoru
  return Number(negative ? -q : q) / 100;
}

describe("roundHalfAwayFromZero – shodně s Postgres", () => {
  it.each([
    [1.005, 1.01],
    [10.075, 10.08],
    [-7.875, -7.88],
    [-1.005, -1.01],
    [2.675, 2.68],
    [0.125, 0.13],
    [-0.125, -0.13],
    [1.0049, 1],
  ])("%p → %p", (value, expected) => {
    expect(roundHalfAwayFromZero(value, 2)).toBe(expected);
  });

  it("dobropis: záporný základ −37,50 × 21 % = −7,88", () => {
    expect(mulDivRound(-37.5, 21, 100, 2)).toBe(-7.88);
    const result = computeVatGroups([line("a", -37.5)], [], [code("p21", 21)]);
    expect(result.groups[0].calculatedTax).toBe(-7.88);
  });

  it("hromadně: základy −1000…1000 po haléřích × 21/15/12/10 % proti referenci", () => {
    let mismatches = 0;
    for (const rate of [21, 15, 12, 10])
      for (let cents = -100000; cents <= 100000; cents += 7) {
        const base = cents / 100;
        if (mulDivRound(base, rate, 100, 2) !== reference(cents, rate)) mismatches += 1;
      }
    expect(mismatches).toBe(0);
  });
});

describe("výpočty skupin s přesným zaokrouhlením", () => {
  it("pomocník Cena s DPH a daň z celkem používají polovinu od nuly", () => {
    expect(baseFromGrossAmount(121, 21)).toBe(100);
    expect(taxFromGrossTotal(100, 21)).toBe(17.36);
    expect(taxFromGrossTotal(-100, 21)).toBe(-17.36);
  });

  it("rozpočet 3 × 12,50 při 21 % → 2,62 / 2,63 / 2,63", () => {
    const shares = allocateVatGroupTax(
      [
        { lineId: "a", base: 12.5 },
        { lineId: "b", base: 12.5 },
        { lineId: "c", base: 12.5 },
      ],
      7.88,
    );
    expect(shares.map((s) => s.tax).reduce((a, b) => a + b, 0)).toBeCloseTo(7.88, 10);
    expect(shares.map((s) => s.tax).sort()).toEqual([2.62, 2.63, 2.63]);
  });
});

describe("tolerance přepisu jako DB (nezaokrouhlený součin)", () => {
  it("0,04 × 25,10 = 1,004 → mimo toleranci", () => {
    const result = computeVatGroups(
      [{ ...line("a", 0), foreignAmount: 100 }],
      [{ vatCodeId: "p21", vatRate: 21, taxAmount: 21.04 }],
      [code("p21", 21)],
      { foreign: true, exchangeRate: 25.1 },
    );
    expect(result.groups[0].withinTolerance).toBe(false);
  });

  it("nulový základ s přepisem ≠ 0 je označen (vat_override_zero_base)", () => {
    const result = computeVatGroups(
      [line("a", 500), line("b", -500)],
      [{ vatCodeId: "p21", vatRate: 21, taxAmount: 1 }],
      [code("p21", 21)],
    );
    expect(result.groups[0].zeroBaseOverride).toBe(true);
  });
});

describe("Dorovnat základ vynuluje Rozdíl", () => {
  it("82,00 při 21 %, cíl 99,99 bez přepisu → posun, po kterém součet = 99,99", () => {
    const group = computeVatGroups([line("a", 82)], [], [code("p21", 21)]).groups[0];
    const delta = baseDeltaForDifference(group, 0.77);
    expect(delta).not.toBeNull();
    const after = computeVatGroups([line("a", 82 + (delta ?? 0))], [], [code("p21", 21)]);
    expect(roundHalfAwayFromZero(after.groups[0].base + after.groups[0].tax, 2)).toBe(99.99);
  });

  it("82,64 / cíl 100,00 nejde dorovnat základem → nabídka bez Dorovnat základ", () => {
    const group = computeVatGroups([line("a", 82.64)], [], [code("p21", 21)]).groups[0];
    expect(baseDeltaForDifference(group, 0.01)).toBeNull();
    const { actions } = resolveDifferenceActions({
      difference: 0.01,
      groups: [group],
      lineCount: 1,
      baseBalanceable: false,
    });
    expect(actions).toEqual(["vat"]);
  });

  it("skupina s přepisem posune základ o celý rozdíl", () => {
    const group = { base: 82.64, rate: 21, calculatedTax: 17.35, overridden: true };
    expect(baseDeltaForDifference(group, 0.01)).toBe(0.01);
  });
});

describe("Zaokrouhlení v nabídce Rozdílu", () => {
  it("limit platí pro |stávající zaokrouhlení + rozdíl|", () => {
    const base = { groups: [], lineCount: 1, roundingLimit: 1 };
    expect(resolveDifferenceActions({ ...base, difference: 0.6 }).actions).toContain("rounding");
    expect(
      resolveDifferenceActions({ ...base, difference: 0.6, currentRounding: 0.5 }).actions,
    ).not.toContain("rounding");
  });
});

describe("zaúčtovaný doklad – skupiny z uložených řádků", () => {
  it("daň skupiny je z řádku daně DB", () => {
    const lines = [
      line("a", 100),
      { ...line("t", 21.05), isVatLine: true, vatParentLineId: "a" } as JournalLine,
    ];
    const result = vatGroupsFromStored(lines, [], [code("p21", 21)]);
    expect(result.groups[0].base).toBe(100);
    expect(result.groups[0].tax).toBe(21.05);
  });
});
