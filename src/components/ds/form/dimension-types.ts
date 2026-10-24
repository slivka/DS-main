/** Dimenze · vlastní obecné datové kontrakty · nesmí znát účetnictví ani načítat data. */
/** Typ dimenze dodaný aplikací. */
export interface DimensionType {
  /** Identita typu. */
  id: string;
  /** Zobrazovaný název. */
  label: string;
  /** Pořadí chipů. */
  order: number;
}
/** Hodnota dimenze v liště nebo na straně řádku. */
export interface DimensionValue {
  /** Identita typu. */
  typeId: string;
  /** Identita hodnoty; null znamená typ k vyplnění. */
  valueId: string | null;
  /** Hotový název hodnoty. */
  label: string;
  /** Převzato z hlavičky; ruční hodnota je false. */
  inherited?: boolean;
  /** Zdroj zápisu dodává aplikace. */
  kind?: "value" | "vehicle";
  /** Uložená ukončená hodnota zůstává viditelná. */
  inactive?: boolean;
}
/** Nabídka hodnot; ukončené položky aplikace vynechá nebo označí inactive. */
export interface DimensionOptionItem {
  /** Identita hodnoty nebo vozidla. */
  id: string;
  /** Název hodnoty. */
  label: string;
  /** Nepovinný kód. */
  code?: string | null;
  /** Zakázaný výběr. */
  disabled?: boolean;
  /** Vysvětlení zákazu. */
  disabledReason?: string;
  /** Ukončené hodnoty se nikdy znovu nenabízí. */
  inactive?: boolean;
  /** Zdroj hodnoty pro převod do DB. */
  kind?: "value" | "vehicle";
}
/** Aplikace načítá hodnoty podle typu a hledání. */
export type LoadDimensionOptions = (
  typeId: string,
  query: string,
) => Promise<DimensionOptionItem[]>;
