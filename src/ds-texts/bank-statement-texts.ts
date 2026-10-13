/** Texty výpisu · vlastní jazykový kontrakt · nesmí řídit formulář. */
/** Texty formuláře bankovního výpisu. */
export interface BankStatementTexts {
  /** Popisek title. */
  title: string;
  /** Popisek open. */
  open: string;
  /** Popisek checked. */
  checked: string;
  /** Popisek posted. */
  posted: string;
  /** Popisek check. */
  check: string;
  /** Popisek uncheck. */
  uncheck: string;
  /** Popisek basic. */
  basic: string;
  /** Popisek balances. */
  balances: string;
  /** Popisek date. */
  date: string;
  /** Popisek number. */
  number: string;
  /** Popisek note. */
  note: string;
  /** Popisek opening. */
  opening: string;
  /** Popisek income. */
  income: string;
  /** Popisek expense. */
  expense: string;
  /** Popisek closing. */
  closing: string;
  /** Popisek bankClosing. */
  bankClosing: string;
  /** Popisek difference. */
  difference: string;
  /** Popisek items. */
  items: string;
  /** Popisek hasItems. */
  hasItems: string;
  /** Popisek delete. */
  delete: string;
  /** Popisek matched. */
  matched: string;
  /** Popisek home. */
  home: string;
}
/** České texty výpisu. */
export const BANK_STATEMENT_CS: BankStatementTexts = {
  title: "Bankovní výpis",
  open: "Otevřený",
  checked: "Zkontrolovaný",
  posted: "Zaúčtovaný",
  check: "Zkontrolovat",
  uncheck: "Zrušit kontrolu",
  basic: "ZÁKLADNÍ ÚDAJE",
  balances: "ZŮSTATKY",
  date: "Datum výpisu",
  number: "Číslo výpisu",
  note: "Poznámka",
  opening: "Počáteční zůstatek",
  income: "Příjmy",
  expense: "Výdaje",
  closing: "Konečný zůstatek",
  bankClosing: "Konečný zůstatek dle banky",
  difference: "Rozdíl",
  items: "POHYBY",
  hasItems: "Výpis má položky",
  delete: "Odstranit",
  matched: "Zůstatek souhlasí",
  home: "v {currency}",
};
/** Slovenské texty výpisu. */
export const BANK_STATEMENT_SK: BankStatementTexts = {
  title: "Bankový výpis",
  open: "Otvorený",
  checked: "Skontrolovaný",
  posted: "Zaúčtovaný",
  check: "Skontrolovať",
  uncheck: "Zrušiť kontrolu",
  basic: "ZÁKLADNÉ ÚDAJE",
  balances: "ZOSTATKY",
  date: "Dátum výpisu",
  number: "Číslo výpisu",
  note: "Poznámka",
  opening: "Počiatočný zostatok",
  income: "Príjmy",
  expense: "Výdavky",
  closing: "Konečný zostatok",
  bankClosing: "Konečný zostatok podľa banky",
  difference: "Rozdiel",
  items: "POHYBY",
  hasItems: "Výpis má položky",
  delete: "Odstrániť",
  matched: "Zostatok súhlasí",
  home: "v {currency}",
};
