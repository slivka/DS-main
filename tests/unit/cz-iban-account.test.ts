/** Převod CZ IBAN · ověřuje součet, předčíslí, nuly a mezery. */
import { expect, test } from "bun:test";
import { accountFromCzIban, czIban } from "../../src/lib/bank-account";
test("CZ IBAN s předčíslím a mezerami vrací účet a čtyřmístný kód banky", () => {
  expect(accountFromCzIban("CZ65 0800 0000 1920 0014 5399")).toEqual({
    prefix: "19",
    number: "2000145399",
    bankCode: "0800",
  });
});
test("CZ IBAN odstraní pouze doplňující počáteční nuly čísla a předčíslí", () => {
  expect(accountFromCzIban(czIban("000019", "0000012345", "0100"))).toEqual({
    prefix: "19",
    number: "12345",
    bankCode: "0100",
  });
});
test("prázdné předčíslí zůstane prázdné", () => {
  expect(accountFromCzIban(czIban("", "123456789", "0100"))?.prefix).toBe("");
});
test("neplatný součet ani cizí IBAN se nepřevede", () => {
  expect(accountFromCzIban("CZ66 0800 0000 1920 0014 5399")).toBeNull();
  expect(accountFromCzIban("DE89370400440532013000")).toBeNull();
});
