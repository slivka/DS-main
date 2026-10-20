/**
 * Texty DPH 5 B a zálohových listů (2.118.0): skupiny kódů DPH, rekapitulace po oddílech,
 * patička K úhradě, zakotvení sloupce, záložka Zaúčtování a stav úhrady zálohového listu.
 * Jen texty CS/SK – nesmí obsahovat logiku.
 */

/** Texty DPH 5 B. */
export interface VatFiveTexts {
  /** Skupina výběru: kódy s daní. */
  groupTaxed: string;
  /** Skupina výběru: osvobozená plnění a zvláštní režimy. */
  groupExempt: string;
  /** Skupina výběru: mimo DPH. */
  groupOutside: string;
  /** Skupina výběru u dokladu bez pevného směru: výstup. */
  groupOut: string;
  /** Skupina výběru u dokladu bez pevného směru: vstup. */
  groupIn: string;
  /** Přípona směru v buňce („vstup“ / „výstup“). */
  directionOutShort: string;
  /** Přípona směru v buňce. */
  directionInShort: string;
  /** Oddíl rekapitulace: v režimu DPH. */
  sectionInVat: string;
  /** Oddíl rekapitulace: mimo DPH. */
  sectionOutsideVat: string;
  /** Řádek „z toho bez nároku“. */
  nonDeductible: string;
  /** Štítek oddílu kontrolního hlášení; `{section}`. */
  khSection: string;
  /** Patička: Odečtené zálohy. */
  advances: string;
  /** Patička: K úhradě. */
  toPay: string;
  /** Akce ⋯ řádku rekapitulace (vydané doklady). */
  rowActions: string;
  /** Zrušit ruční opravu DPH. */
  cancelOverride: string;
  /** Zakotvit sloupec; `{column}`. */
  pinColumn: string;
  /** Uvolnit zakotvený sloupec; `{column}`. */
  unpinColumn: string;
  /** Převzatá hodnota ze zakotveného sloupce (přístupný popis). */
  inherited: string;
  /** Informativní text zálohového listu. */
  notTaxDocument: string;
  /** Záložka Zaúčtování. */
  postingTab: string;
  /** Sloupce gridu Zaúčtování. */
  postingText: string;
  postingDebit: string;
  postingCredit: string;
  postingAmount: string;
  /** Prázdné zaúčtování. */
  postingEmpty: string;
  /** Štítky automatických řádků. */
  autoVat: string;
  autoNonDeductible: string;
  autoAdvance: string;
  autoRounding: string;
  autoFxRounding: string;
  /** Stav úhrady zálohového listu. */
  paymentUnpaid: string;
  paymentPartial: string;
  paymentPaid: string;
  paymentRemainderCancelled: string;
}

/** České texty DPH 5 B. */
export const VAT_FIVE_CS: VatFiveTexts = {
  groupTaxed: "S daní",
  groupExempt: "Osvobozená a zvláštní režimy",
  groupOutside: "Mimo DPH",
  groupOut: "Výstup",
  groupIn: "Vstup",
  directionOutShort: "výstup",
  directionInShort: "vstup",
  sectionInVat: "V režimu DPH",
  sectionOutsideVat: "Mimo DPH",
  nonDeductible: "z toho bez nároku",
  khSection: "KH {section}",
  advances: "Odečtené zálohy",
  toPay: "K úhradě",
  rowActions: "Další akce",
  cancelOverride: "Zrušit ruční opravu DPH",
  pinColumn: "Zakotvit sloupec {column}",
  unpinColumn: "Uvolnit sloupec {column}",
  inherited: "Převzato z řádku výše",
  notTaxDocument: "Nejde o daňový doklad",
  postingTab: "Zaúčtování",
  postingText: "Popis",
  postingDebit: "MD",
  postingCredit: "DAL",
  postingAmount: "Částka",
  postingEmpty: "Doklad zatím nemá zaúčtování",
  autoVat: "DPH",
  autoNonDeductible: "Bez nároku",
  autoAdvance: "Záloha",
  autoRounding: "Zaokrouhlení",
  autoFxRounding: "Kurzové zaokrouhlení",
  paymentUnpaid: "Neuhrazeno",
  paymentPartial: "Částečně uhrazeno",
  paymentPaid: "Uhrazeno",
  paymentRemainderCancelled: "Zbytek stornován",
};

/** Slovenské texty DPH 5 B. */
export const VAT_FIVE_SK: VatFiveTexts = {
  groupTaxed: "S daňou",
  groupExempt: "Oslobodené a osobitné režimy",
  groupOutside: "Mimo DPH",
  groupOut: "Výstup",
  groupIn: "Vstup",
  directionOutShort: "výstup",
  directionInShort: "vstup",
  sectionInVat: "V režime DPH",
  sectionOutsideVat: "Mimo DPH",
  nonDeductible: "z toho bez nároku",
  khSection: "KV {section}",
  advances: "Odpočítané zálohy",
  toPay: "Na úhradu",
  rowActions: "Ďalšie akcie",
  cancelOverride: "Zrušiť ručnú opravu DPH",
  pinColumn: "Ukotviť stĺpec {column}",
  unpinColumn: "Uvoľniť stĺpec {column}",
  inherited: "Prevzaté z riadku vyššie",
  notTaxDocument: "Nejde o daňový doklad",
  postingTab: "Zaúčtovanie",
  postingText: "Popis",
  postingDebit: "MD",
  postingCredit: "D",
  postingAmount: "Suma",
  postingEmpty: "Doklad zatiaľ nemá zaúčtovanie",
  autoVat: "DPH",
  autoNonDeductible: "Bez nároku",
  autoAdvance: "Záloha",
  autoRounding: "Zaokrúhlenie",
  autoFxRounding: "Kurzové zaokrúhlenie",
  paymentUnpaid: "Neuhradené",
  paymentPartial: "Čiastočne uhradené",
  paymentPaid: "Uhradené",
  paymentRemainderCancelled: "Zvyšok stornovaný",
};
