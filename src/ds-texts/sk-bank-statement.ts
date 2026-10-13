/** Texty výpisu · vlastní překlad · nesmí řídit formulář. */
import type { BankStatementTexts } from "./bank-statement-texts";

/** Slovenské texty výpisu. */
export const BANK_STATEMENT_SK: BankStatementTexts = {
  title: "Bankový výpis",
  open: "Otvorený",
  checked: "Skontrolovaný",
  posted: "Zaúčtovaný",
  check: "Skontrolovať",
  uncheck: "Zrušiť kontrolu",
  basic: "Základné údaje",
  balances: "Zostatky",
  date: "Dátum výpisu",
  number: "Číslo výpisu",
  note: "Poznámka",
  opening: "Počiatočný zostatok",
  income: "Príjmy",
  expense: "Výdavky",
  closing: "Konečný zostatok",
  bankClosing: "Konečný zostatok podľa banky",
  difference: "Rozdiel",
  items: "Pohyby",
  lockedChecked: "Výpis je skontrolovaný",
  lockedPosted: "Výpis je zaúčtovaný",
  lockedReadOnly: "Výpis je iba na čítanie",
  hasItems: "Výpis má položky",
  delete: "Odstrániť",
  matched: "Zostatok súhlasí",
  home: "Zostatky v {currency}",
};
