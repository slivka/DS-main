/**
 * Řádky patičky pod rekapitulací (2.118.0, DPH 5 B): Součet · Odečtené zálohy · Zaokrouhlení ·
 * K úhradě · Rozdíl. Jen pravidla viditelnosti a součet K úhradě z hodnot od DB / useJournalTotals.
 * Nesmí: počítat daň ani zálohy.
 */
import { roundJournalAmount } from "./journal-lines-model";

/** Vstup patičky v měně dokladu. */
export interface RecapFooterInput {
  /** Součet řádků (u DPH s daní) bez zaokrouhlení. */
  sum: number;
  /** Odečtené zálohy (kladná částka, která se od součtu odečítá). */
  advances?: number;
  /** Zaokrouhlení dokladu. */
  rounding: number;
  /** Rozdíl proti zadané částce; 0 nebo bez zadané částky se nezobrazí. */
  difference: number;
}

/** Klíč řádku patičky. */
export type RecapFooterKey = "sum" | "advances" | "rounding" | "toPay" | "difference";

/** Viditelné řádky patičky v pevném pořadí. */
export function recapFooterRows(input: RecapFooterInput): { key: RecapFooterKey; value: number }[] {
  const advances = input.advances ?? 0;
  const rows: { key: RecapFooterKey; value: number }[] = [{ key: "sum", value: input.sum }];
  if (advances !== 0) rows.push({ key: "advances", value: -advances });
  rows.push({ key: "rounding", value: input.rounding });
  if (advances !== 0 || input.rounding !== 0)
    rows.push({ key: "toPay", value: roundJournalAmount(input.sum + input.rounding - advances) });
  if (input.difference !== 0) rows.push({ key: "difference", value: input.difference });
  return rows;
}
