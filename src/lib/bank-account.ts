/** Pomocné funkce pro české bankovní účty a IBAN. */

export interface CzAccountParts {
  prefix: string;
  number: string;
}

const PREFIX_WEIGHTS = [10, 5, 8, 4, 2, 1];
const NUMBER_WEIGHTS = [6, 3, 7, 9, 10, 5, 8, 4, 2, 1];

/** Rozdělí zápis „19-2000145399“ (případně s „/kód banky“) na předčíslí a číslo. */
export function parseCzAccount(value: string): CzAccountParts | null {
  const trimmed = value.replace(/\s/g, "").split("/")[0] ?? "";
  const match = /^(?:(\d{1,6})-)?(\d{2,10})$/.exec(trimmed);
  if (!match) return null;
  return { prefix: match[1] ?? "", number: match[2] ?? "" };
}

function weightedMod11(digits: string, weights: number[]): boolean {
  const padded = digits.padStart(weights.length, "0");
  const sum = weights.reduce((acc, weight, index) => acc + weight * Number(padded[index]), 0);
  return sum % 11 === 0;
}

/** Kontrola čísla účtu modulo 11 (předčíslí doplněné na 6, číslo na 10 číslic). */
export function isValidCzAccount(prefix: string, number: string): boolean {
  if (!/^\d{0,6}$/.test(prefix) || !/^\d{2,10}$/.test(number)) return false;
  if (/^0+$/.test(number)) return false;
  return weightedMod11(prefix, PREFIX_WEIGHTS) && weightedMod11(number, NUMBER_WEIGHTS);
}

function mod97(value: string): number {
  let remainder = 0;
  for (const char of value) remainder = (remainder * 10 + Number(char)) % 97;
  return remainder;
}

function ibanDigits(rearranged: string): string {
  return rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));
}

/** Sestaví český IBAN z předčíslí, čísla a kódu banky (s kontrolními číslicemi). */
export function czIban(prefix: string, number: string, bankCode: string): string {
  const bban = `${bankCode.padStart(4, "0")}${prefix.padStart(6, "0")}${number.padStart(10, "0")}`;
  const check = 98 - mod97(ibanDigits(`${bban}CZ00`));
  return `CZ${String(check).padStart(2, "0")}${bban}`;
}

/** Ověří IBAN (délka, znaky a kontrola mod 97); mezery ignoruje. */
export function isValidIban(value: string): boolean {
  const iban = value.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(iban)) return false;
  return mod97(ibanDigits(`${iban.slice(4)}${iban.slice(0, 4)}`)) === 1;
}

/** Zformátuje IBAN po 4 znacích. */
export function formatIban(value: string): string {
  return value
    .replace(/\s/g, "")
    .toUpperCase()
    .replace(/(.{4})/g, "$1 ")
    .trim();
}
