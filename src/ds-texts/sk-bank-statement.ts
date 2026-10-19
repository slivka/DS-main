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
  checkHint:
    "Potvrdí, že výpis súhlasí s bankou (zostatok podľa banky = konečný zostatok podľa pohybov), a výpis zamkne.",
  uncheckHint: "Odomkne výpis na úpravy.",
  basic: "Základné údaje",
  balances: "Zostatky podľa pohybov",
  date: "Dátum výpisu",
  number: "Číslo výpisu",
  opening: "Počiatočný zostatok",
  income: "Príjmy",
  expense: "Výdavky",
  closing: "Konečný zostatok",
  bankClosing: "Zostatok na výpise",
  difference: "Rozdiel",
  items: "Pohyby",
  lockedChecked: "Výpis je skontrolovaný",
  locked: "Výpis je uzamknutý",
  lockedPosted: "Výpis je zaúčtovaný",
  lockedReadOnly: "Výpis je iba na čítanie",
  hasItems: "Výpis má položky",
  delete: "Odstrániť",
  matched: "Zostatok súhlasí",
  home: "Zostatky v {currency}",
  bankClosingSum: "Zostatok na výpise sa počíta z pohybov. Kliknutím zadáte zostatok z banky.",
  bankClosingEntered: "Zostatok je zadaný z banky. Kliknutím ho budete počítať z pohybov.",
  bankClosingToggle: "Zostatok z pohybov",
  differenceWarning: "Rozdiel oproti pohybom {amount}",
  emptyItems: "Výpis zatiaľ nemá pohyby",
};
