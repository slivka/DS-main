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
  basic: "Základní údaje",
  balances: "Zůstatky",
  date: "Datum výpisu",
  number: "Číslo výpisu",
  note: "Poznámka",
  opening: "Počáteční zůstatek",
  income: "Příjmy",
  expense: "Výdaje",
  closing: "Konečný zůstatek",
  bankClosing: "Konečný zůstatek dle banky",
  difference: "Rozdíl",
  items: "Pohyby",
  hasItems: "Výpis má položky",
  delete: "Odstranit",
  matched: "Zůstatek souhlasí",
  home: "Zůstatky v {currency}",
};
