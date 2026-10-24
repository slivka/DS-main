/** Textový kontrakt dokladu · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
export type DocumentFormTexts = {
  headerSection: string;
  datesSection: string;
  paymentSection: string;
  propertiesSection: string;
  rateSection: string;
  currencySection: string;
  periodHint: string;
  amountSection: string;
  amountOnlySection: string;
  book: string;
  period: string;
  number: string;
  numberPending: string;
  direction: string;
  directionIn: string;
  directionOut: string;
  status: string;
  approved: string;
  yes: string;
  no: string;
  accountingDate: string;
  issueDate: string;
  taxDate: string;
  vatRelevant: string;
  vatDate: string;
  dueDate: string;
  externalNumber: string;
  supplierNumber: string;
  supplierTaxDocumentNumber: string;
  documentNumberTooLongForVs: string;
  /** Neplatný zápis data v pruhu chyb (za popiskem pole). */
  invalidDate: string;
  /** Obecný popisek pole bez vlastního textu (výjimka – technický klíč se nikdy neukáže). */
  unknownField: string;
  partner: string;
  ico: string;
  dic: string;
  handedOverByIn: string;
  handedOverByOut: string;
  invalidIco: string;
  variableSymbol: string;
  constantSymbol: string;
  specificSymbol: string;
  bankAccount: string;
  description: string;
  currency: string;
  rate: string;
  vatRate: string;
  vatRateNote: string;
  vatRateMissing: string;
  amountTotal: string;
  totalHome: string;
  amountSum: string;
  /** @deprecated Od 2.100.0 ignorováno; použijte DsTexts.fieldToggle.sumPressed. Odstranění v 3.0.0. */
  sumFromLines?: string;
  rounding: string;
  /** Stálý název vazby data DPH na DUZP. */
  vatDateLinkLabel: string;
  /** Popisek vazby dobropisu na původní doklad (FV/FP). */
  correctsDocument: string;
  vatDateLockedHint: string;
  filedWarning: string;
  excludeFromPaymentOrders: string;
  linesTab: string;
  changedBy: string;
  changedAt: string;
  settings: string;
  rateNote: string;
  manualRate: string;
  rateNoteRequired: string;
  errorTitle: string;
  closeError: string;
  changeAccount: string;
  currencyDisabled: string;
  mainAccountSelect: string;
  bankAccountInvalid: string;
  bankCodeInvalid: string;
  otherBankAccount: string;
  /** @deprecated Od 2.100.0 ignorováno; použijte DsTexts.fieldToggle.directory. Odstranění v 3.0.0. */
  selectFromDirectory?: string;
  /** @deprecated Od 2.100.0 ignorováno; použijte DsTexts.fieldToggle.directoryUnpressed. Odstranění v 3.0.0. */
  enterManually?: string;
  replaceManualCounterparty: string;
  payByOrder: string;
  paymentOrderDisabled: string;
  payToBankAccount: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Základní údaje",
  datesSection: "Datumy",
  paymentSection: "Platební údaje",
  propertiesSection: "Vlastnosti dokladu",
  rateSection: "Kurz dokladu",
  currencySection: "Měna",
  periodHint: "Období se řídí datem účetního případu",
  amountSection: "Částka dokladu",
  amountOnlySection: "Částka",
  book: "Kniha",
  period: "Období",
  number: "Číslo dokladu",
  numberPending: "Koncept – číslo při zařazení",
  direction: "Směr",
  directionIn: "Příjem",
  directionOut: "Výdaj",
  status: "Stav",
  approved: "Schváleno",
  yes: "Ano",
  no: "Ne",
  accountingDate: "Datum účetního případu",
  issueDate: "Datum vystavení",
  taxDate: "DUZP",
  vatRelevant: "Vstupuje do DPH",
  vatDate: "Datum DPH",
  dueDate: "Splatnost",
  externalNumber: "Externí číslo",
  supplierNumber: "Číslo dokladu dodavatele",
  supplierTaxDocumentNumber: "Číslo daňového dokladu",
  documentNumberTooLongForVs: "Číslo má víc než 10 číslic – VS doplňte ručně",
  invalidDate: "neplatné datum",
  unknownField: "Pole formuláře",
  partner: "Partner",
  ico: "IČO",
  dic: "DIČ",
  handedOverByIn: "Přijato od",
  handedOverByOut: "Vyplaceno komu",
  invalidIco: "IČO neprošlo kontrolou CZ – zkontrolujte ho.",
  variableSymbol: "Variabilní symbol",
  constantSymbol: "Konstantní symbol",
  specificSymbol: "Specifický symbol",
  bankAccount: "Bankovní účet",
  description: "Popis",
  currency: "Měna",
  rate: "Kurz",
  vatRate: "Kurz DPH",
  vatRateNote: "Důvod ručního kurzu DPH",
  vatRateMissing: "Kurz ČNB k DUZP není k dispozici – zadejte ruční kurz s důvodem.",
  amountTotal: "Celkem za doklad",
  totalHome: "Celkem v {symbol}",
  amountSum: "Celkem za doklad",
  sumFromLines: "Sčítá se z rozpisu",
  rounding: "Zaokrouhlení",
  vatDateLinkLabel: "Svázat s DUZP",
  correctsDocument: "Opravuje doklad",
  vatDateLockedHint: "Daň na výstupu patří do období DUZP",
  filedWarning: "Období je podané – doklad půjde do dodatečného přiznání",
  excludeFromPaymentOrders: "Nezahrnovat do platebních příkazů",
  linesTab: "Řádky",
  changedBy: "Změnil",
  changedAt: "Změněno",
  settings: "Nastavení…",
  rateNote: "Důvod ručního kurzu",
  manualRate: "Ruční kurz",
  rateNoteRequired: "Uveďte důvod ručního kurzu.",
  errorTitle: "Doklad nelze uložit",
  closeError: "Zavřít chybovou hlášku",
  changeAccount: "Změnit účet",
  currencyDisabled: "Měnu nelze změnit",
  mainAccountSelect: "Hlavní účet",
  bankAccountInvalid: "Číslo účtu není platné.",
  bankCodeInvalid: "Kód banky není platný.",
  otherBankAccount: "Jiný účet",
  selectFromDirectory: "Vybrat z adresáře",
  enterManually: "Zadat ručně",
  replaceManualCounterparty: "Ručně zadané údaje budou nahrazeny údaji partnera",
  payByOrder: "Platit příkazem",
  paymentOrderDisabled: "Nezahrnuje se do platebních příkazů",
  payToBankAccount: "Uhradit na bankovní účet",
};
