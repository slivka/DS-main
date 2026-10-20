/** currencyColumnLabel · měna jednou v nadpisu sloupce, v domácí měně nikde. */
import { expect, test } from "bun:test";
import { currencyColumnLabel } from "../../src/lib/format";

test("cizí měna se uvede v nadpisu sloupce", () => {
  expect(currencyColumnLabel("Příjem", "EUR", "CZK")).toBe("Příjem (EUR)");
});
test("domácí měna ani chybějící kód nadpis nemění", () => {
  expect(currencyColumnLabel("Příjem", "CZK", "CZK")).toBe("Příjem");
  expect(currencyColumnLabel("Výdaj", null, "CZK")).toBe("Výdaj");
});
