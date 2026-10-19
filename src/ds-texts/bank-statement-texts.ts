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
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená; klíč zůstává kvůli typům aplikací. */
  check: string;
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená. */
  uncheck: string;
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená. */
  checkHint: string;
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená. */
  uncheckHint: string;
  /** Popisek basic. */
  basic: string;
  /** @deprecated 2.108.0 – sekce Zůstatky dle pohybů je zrušená. */
  balances: string;
  /** Popisek date. */
  date: string;
  /** Popisek number. */
  number: string;
  /** Popisek opening. */
  opening: string;
  /** Popisek income. */
  income: string;
  /** Popisek expense. */
  expense: string;
  /** Popisek closing. */
  closing: string;
  /** Popisek pole Zůstatek na výpise. */
  bankClosing: string;
  /** Popisek difference. */
  difference: string;
  /** Popisek items. */
  items: string;
  /** @deprecated 2.108.0 – kontrola výpisu je zrušená; klíč zůstává kvůli typům aplikací. */
  lockedChecked: string;
  /** Důvod zamčení zaúčtovaného výpisu. */
  lockedPosted: string;
  /** Důvod výpisu pouze ke čtení. */
  lockedReadOnly: string;
  /** Popisek hasItems. */
  hasItems: string;
  /** Popisek delete. */
  delete: string;
  /** Popisek shody zůstatku pro vlastní prezentaci aplikace. */
  matched: string;
  /** @deprecated 2.108.0 – zůstatky v domácí měně se nezobrazují. */
  home: string;
  /** Tooltip Σ: zůstatek na výpise se počítá z pohybů. */
  bankClosingSum: string;
  /** Tooltip Σ vypnuto: zůstatek na výpise je zadaný z banky. */
  bankClosingEntered: string;
  /** Přístupný název přepínače Σ zůstatku. */
  bankClosingToggle: string;
  /** Varování rozdílu, token {amount}. */
  differenceWarning: string;
  /** Prázdný seznam pohybů. */
  emptyItems: string;
}
