/** Texty výpisu · vlastní překlad · nesmí řídit formulář. */
import type { BankStatementTexts } from "./bank-statement-texts";

/** České texty výpisu. */
export const BANK_STATEMENT_CS: BankStatementTexts = {
  title: "Bankovní výpis",
  open: "Otevřený",
  checked: "Zkontrolovaný",
  posted: "Zaúčtovaný",
  check: "Zkontrolovat",
  uncheck: "Zrušit kontrolu",
  checkHint: "Potvrdí, že výpis souhlasí s bankou (zůstatek dle banky = konečný zůstatek dle pohybů), a výpis zamkne.",
  uncheckHint: "Odemkne výpis pro úpravy.",
  basic: "Základní údaje",
  balances: "Zůstatky dle pohybů",
  date: "Datum výpisu",
  number: "Číslo výpisu",
  opening: "Počáteční zůstatek",
  income: "Příjmy",
  expense: "Výdaje",
  closing: "Konečný zůstatek",
  bankClosing: "Zůstatek dle banky",
  difference: "Rozdíl",
  items: "Pohyby",
  lockedChecked: "Výpis je zkontrolovaný",
  lockedPosted: "Výpis je zaúčtovaný",
  lockedReadOnly: "Výpis je jen pro čtení",
  hasItems: "Výpis má položky",
  delete: "Odstranit",
  home: "Zůstatky v {currency}",
};
