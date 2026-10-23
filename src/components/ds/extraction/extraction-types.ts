/**
 * Sdílené typy vytěžování souborů.
 * Vlastní: stav vytěžení a řádek vytěžené položky.
 * Nesmí: znát doménu účetnictví ani počítat součty (dodává aplikace).
 */

/** Stav vytěžení zdrojového souboru. */
export type ExtractionState = "extracting" | "done" | "failed" | "duplicate";

/** Řádek vytěžené položky; částky dodává aplikace, knihovna je jen formátuje. */
export interface ExtractedItem {
  /** Stabilní klíč řádku. */
  id: string;
  /** Text položky. */
  text: string;
  /** Množství; null = prázdná buňka (řádek bez množství). */
  quantity: number | null;
  /** Měrná jednotka; null = prázdná buňka. */
  unit: string | null;
  /** Jednotková cena; null = prázdná buňka. */
  unitPrice: number | null;
  /** Zobrazená sazba daně (text dodává aplikace, např. „21 %“). */
  vatRate: string;
  /** Základ daně řádku. */
  base: number;
  /** Daň řádku. */
  tax: number;
}

/** Souhrnný řádek vytěžených položek; hodnoty dodává aplikace. */
export interface ExtractedItemsTotals {
  /** Součet základů. */
  base: number;
  /** Součet daně. */
  tax: number;
}
