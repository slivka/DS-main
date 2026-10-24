/** Texty dimenzí · vlastní CS/SK lišt a buněk · bez dat aplikace. */
/** Jazykový kontrakt dimenzí. */
export interface DimensionTexts {
  /** Název lišty. */
  title: string;
  /** Přidání typu. */
  add: string;
  /** Prázdná hodnota. */
  choose: string;
  /** Prázdné hledání. */
  empty: string;
  /** Probíhá načítání. */
  loading: string;
  /** Selhání načítání. */
  loadFailed: string;
  /** Ukončená uložená hodnota. */
  ended: string;
  /** Odebrání chipu. */
  remove: (type: string) => string;
  /** Další hodnoty. */
  more: string;
  /** Řádkové výjimky. */
  overrides: (count: number) => string;
  /** Vrácení převzaté hodnoty. */
  reset: string;
  /** Dimenze MD. */
  debit: string;
  /** Dimenze DAL. */
  credit: string;
  /** Ikona ruční hodnoty. */
  manual: string;
  /** Faktura v ukázce. */
  invoiceExample: string;
  /** ID v ukázce. */
  internalExample: string;
}
/** České texty dimenzí. */
export const DIMENSION_TEXTS_CS: DimensionTexts = {
  title: "Dimenze", add: "+ Dimenze", choose: "vyberte…", empty: "Žádná hodnota",
  loading: "Načítání…", loadFailed: "Hodnoty se nepodařilo načíst", ended: "Ukončená hodnota",
  remove: (type) => `Odebrat dimenzi ${type}`, more: "+ další",
  overrides: (count) => `Na ${new Intl.NumberFormat("cs").format(count)} řádcích jiná hodnota`,
  reset: "Vrátit na hodnotu z hlavičky", debit: "Dimenze MD", credit: "Dimenze DAL",
  manual: "Ruční dimenze řádku", invoiceExample: "Faktura s dimenzemi", internalExample: "Interní doklad s dimenzemi MD/DAL",
};
/** Slovenské texty dimenzí. */
export const DIMENSION_TEXTS_SK: DimensionTexts = {
  title: "Dimenzie", add: "+ Dimenzie", choose: "vyberte…", empty: "Žiadna hodnota",
  loading: "Načítanie…", loadFailed: "Hodnoty sa nepodarilo načítať", ended: "Ukončená hodnota",
  remove: (type) => `Odobrať dimenziu ${type}`, more: "+ ďalšie",
  overrides: (count) => `Na ${new Intl.NumberFormat("sk").format(count)} riadkoch iná hodnota`,
  reset: "Vrátiť na hodnotu z hlavičky", debit: "Dimenzie MD", credit: "Dimenzie DAL",
  manual: "Ručná dimenzia riadka", invoiceExample: "Faktúra s dimenziami", internalExample: "Interný doklad s dimenziami MD/DAL",
};
