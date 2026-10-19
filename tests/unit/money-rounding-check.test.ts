/** Kontrolní skript ověřujeme nad vstupním textem, nikoli čtením zdrojů knihovny. */
import { expect, it } from "bun:test";
import { moneyRoundingViolations } from "../../scripts/check-money-rounding";

it("odmítá Math.round i toFixed v peněžním výpočtu", () => {
  expect(
    moneyRoundingViolations(
      "const a = Math.round(amount * 100); const b = amount.toFixed(2);",
      "src/lib/money.ts",
    ),
  ).toHaveLength(2);
});
it("ignoruje komentáře a řetězce, ale ne jejich sousední výpočet", () => {
  expect(
    moneyRoundingViolations(
      '// Math.round(x)\nconst text = "x.toFixed(2)"; const a = Math.round(x);',
      "src/lib/money.ts",
    ),
  ).toHaveLength(1);
});
it("povoluje jen výstupní formátování, ne další výpočet ve stejném souboru", () => {
  expect(
    moneyRoundingViolations(
      "Math.abs(n).toFixed(decimals); amount.toFixed(2);",
      "src/lib/format.ts",
    ),
  ).toHaveLength(1);
});
