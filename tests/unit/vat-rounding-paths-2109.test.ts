/** Druhé opravné kolo 2.109.0: zaokrouhlení ve všech cestách DPH, zaúčtovaný doklad, samovyměření. */
import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  buildVatPreviewLines,
  calculateVatFromBase,
  resolveLineVat,
  summarizeVat,
} from "../../src/components/ds/accounting/journal-vat";
import {
  calculateLineAmount,
  toHomeAmount,
} from "../../src/components/ds/accounting/journal-lines-model";
import {
  applyVatAllocation,
  computeVatGroups,
  storedVatAllocation,
} from "../../src/components/ds/accounting/journal-vat-groups";
import { convertAmount } from "../../src/components/ds/accounting/currency-amount";
import { roundTo } from "../../src/lib/format";
import type { JournalLine, VatCodeOption } from "../../src/components/ds/accounting/journal-lines";

const code = (id: string, rate: number, extra: Partial<VatCodeOption> = {}): VatCodeOption =>
  ({
    id,
    code: id,
    name: id,
    rate,
    hasTax: true,
    direction: "in",
    selfAssessment: false,
    taxInAccount: "343021",
    taxOutAccount: "343121",
    ...extra,
  }) as VatCodeOption;
const P21 = code("p21", 21);
const PDP = code("pdp", 21, { selfAssessment: true });
const CODES = [P21, PDP];
const line = (id: string, amount: number, extra: Partial<JournalLine> = {}): JournalLine =>
  ({
    id,
    amount,
    vatCodeId: "p21",
    debitAccount: "518001",
    creditAccount: "321001",
    ...extra,
  }) as JournalLine;

/** Referenční round(a × b / c, 2) v celých číslech (a v setinách), polovina od nuly. */
function reference(aCents: number, b: number, c: number): number {
  const numerator = BigInt(aCents) * BigInt(b);
  const denominator = BigInt(c) * 100n;
  const negative = numerator < 0n;
  const n = negative ? -numerator : numerator;
  const q = (2n * n * 100n + denominator) / (2n * denominator);
  return Number(negative ? -q : q) / 100;
}

describe("cesty DPH zaokrouhlují polovinou od nuly jako DB", () => {
  it("−12,50 × 21 % → −2,63", () => {
    expect(calculateVatFromBase(-12.5, 21)).toBe(-2.63);
    expect(resolveLineVat(line("a", -12.5), CODES).vat).toBe(-2.63);
  });

  it("hromadně: calculateVatFromBase, odpočet podílem, převod kurzem", () => {
    let mismatches = 0;
    for (let cents = -100000; cents <= 100000; cents += 7) {
      const base = cents / 100;
      for (const rate of [21, 15, 12, 10]) {
        if (calculateVatFromBase(base, rate) !== reference(cents, rate, 100)) mismatches++;
      }
      if (toHomeAmount(base, 25, 1) !== reference(cents, 25, 1)) mismatches++;
      if (convertAmount(base, 3, 2) !== reference(cents, 3, 2)) mismatches++;
      if (calculateLineAmount(1, base) !== base) mismatches++;
    }
    expect(mismatches).toBe(0);
  });

  it("částečný odpočet PDP: round(daň × podíl / 100) a zbytek", () => {
    // daň 2,63 × 50 % = 1,315 → 1,32; zbytek 1,31
    const { lines } = buildVatPreviewLines(
      [line("a", 12.5, { vatCodeId: "pdp", vatDeduction: "partial", vatDeductionShare: 50 })],
      { codes: CODES },
    );
    expect(lines.map((l) => l.amount)).toEqual([1.32, 1.31]);
  });

  it("domácí částka řádku daně = round(daň × kurz, 2) po řádcích", () => {
    // daň 0,125 EUR neexistuje – 0,63 × 24,125 = 15,19875 → 15,20
    const { lines } = buildVatPreviewLines([line("a", 0, { foreignAmount: 3, currency: "EUR" })], {
      codes: CODES,
      foreign: true,
      rate: 24.125,
      rateAmount: 1,
    });
    expect(lines[0].foreignAmount).toBe(0.63);
    expect(lines[0].amount).toBe(15.2);
  });

  it("summarizeVat sčítá přesně a záporné zaokrouhlí od nuly", () => {
    const [row] = summarizeVat([line("a", -12.5), line("b", -12.5)], { codes: CODES });
    expect(row.vat).toBe(-5.26);
    expect(row.base).toBe(-25);
  });

  it("roundTo zaokrouhlí −2,625 na −2,63", () => {
    expect(roundTo(-2.625, 2)).toBe(-2.63);
  });

  it("v peněžních výpočtech DS a lib nezůstal Math.round", () => {
    const allowed = new Set(["useJournalLayout.ts", "app-zoom.ts"]);
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) {
          if (name !== "mock") walk(path);
        } else if (/\.tsx?$/.test(name) && !allowed.has(name)) {
          const code = readFileSync(path, "utf8").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "");
          if (code.includes("Math.round(")) offenders.push(path);
        }
      }
    };
    walk("src/components/ds/accounting");
    walk("src/lib");
    expect(offenders).toEqual([]);
  });
});

describe("zaúčtovaný doklad – daň z uložených řádků daně", () => {
  it("3 × 0,50 při 21 %: mřížka i součet 0,32, ne 0,33", () => {
    const stored: JournalLine[] = [
      line("a", 0.5),
      line("b", 0.5),
      line("c", 0.5),
      line("ta", 0.1, { isVatLine: true, vatParentLineId: "a" }),
      line("tb", 0.11, { isVatLine: true, vatParentLineId: "b" }),
      line("tc", 0.11, { isVatLine: true, vatParentLineId: "c" }),
    ];
    const allocated = storedVatAllocation(stored);
    const base = allocated.filter((l) => !l.isVatLine);
    expect(base.map((l) => resolveLineVat(l, CODES).vat)).toEqual([0.1, 0.11, 0.11]);
    expect(summarizeVat(allocated, { codes: CODES })[0].vat).toBe(0.32);
    // Kontrola: po řádcích by vyšlo 3 × 0,11 = 0,33.
    expect(summarizeVat(stored, { codes: CODES })[0].vat).toBe(0.33);
  });
});

describe("samovyměření ve skupinách jako DB", () => {
  const lines = [
    line("a", 0.5, { vatCodeId: "pdp" }),
    line("b", 0.5, { vatCodeId: "pdp" }),
    line("c", 0.5, { vatCodeId: "pdp" }),
  ];

  it("PDP 3 × 0,50 při 21 % → daň skupiny 0,32 rozpočtená", () => {
    const result = computeVatGroups(lines, [], CODES);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].selfAssessment).toBe(true);
    expect(result.groups[0].tax).toBe(0.32);
    expect(result.groups[0].lines.map((s) => s.tax)).toEqual([0.1, 0.11, 0.11]);
    const allocated = applyVatAllocation(lines, result);
    expect(summarizeVat(allocated, { codes: CODES })[0].vat).toBe(0.32);
  });

  it("PDP nemá přepis – zadaný přepis se ignoruje", () => {
    const result = computeVatGroups(
      lines,
      [{ vatCodeId: "pdp", vatRate: 21, taxAmount: 5 }],
      CODES,
    );
    expect(result.groups[0].overridden).toBe(false);
    expect(result.groups[0].tax).toBe(0.32);
  });

  it("doklad, který nevstupuje do DPH → žádné skupiny", () => {
    const result = computeVatGroups(lines, [], CODES, { vatEnabled: false });
    expect(result.groups).toEqual([]);
    expect(result.fixed).toEqual([]);
  });
});

describe("kurz DPH bez platné hodnoty", () => {
  it("kurz 0 / null toleranci nehodnotí (žádná položka pruhu)", () => {
    const lines = [line("a", 0, { foreignAmount: 100 })];
    const overrides = [{ vatCodeId: "p21", vatRate: 21, taxAmount: 30 }];
    for (const exchangeRate of [0, null]) {
      const { groups } = computeVatGroups(lines, overrides, CODES, {
        foreign: true,
        exchangeRate,
      });
      expect(groups[0].withinTolerance).toBe(true);
      expect(groups[0].differenceHome).toBe(0);
    }
    const one = computeVatGroups(lines, overrides, CODES, { foreign: true, exchangeRate: 1 });
    expect(one.groups[0].withinTolerance).toBe(false);
  });
});
