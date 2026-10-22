/**
 * Typy odečtů záloh jako řádků dokladu · vlastní tvar dat od APP · nesmí počítat zálohy ani DPH.
 */

/** Druh odečtu: vybraná záloha nebo ruční odečet. */
export type JournalDeductionKind = "advance" | "manual";

/** Oprávnění akce odečtu. */
export interface JournalDeductionPermission {
  /** Akce je povolena. */
  can: boolean;
  /** Vysvětlení zákazu v bublině. */
  reason?: string;
}

/** Řádek odečtu zálohy; všechny částky (záporné) dodává APP. */
export interface JournalDeductionRow {
  /** Stálé id. */
  id: string;
  /** Druh odečtu; částku lze upravit jen u ručního. */
  kind: JournalDeductionKind;
  /** Popis, např. „Odečet zálohy ZFV 2026003 (VS 2026003)“. */
  text: string;
  /** Formátovaný kód DPH. */
  vatCode?: string;
  /** Základ (záporný). */
  base: number;
  /** DPH (záporná). */
  vat: number;
  /** Celkem (záporné) od APP; DS nic nesčítá. */
  total: number;
  /** Základ v měně firmy (u dokladu v cizí měně). */
  homeBase?: number;
  /** DPH v měně firmy (u dokladu v cizí měně). */
  homeVat?: number;
  /** Celkem v měně firmy (u dokladu v cizí měně). */
  homeTotal?: number;
  /** Formátovaný účet. */
  account?: string;
  /** Stav odečtu (jen v detailu a bublině). */
  status?: string;
  /** Platba (jen v detailu a bublině). */
  payment?: string;
  /** Daňový doklad (jen v detailu a bublině). */
  taxDocument?: string;
  /** Oprávnění odebrat; bez hodnoty se akce nezobrazí. */
  remove?: JournalDeductionPermission;
}

/** Řádek odečtu v rekapitulaci DPH. */
export interface JournalDeductionRecapRow {
  /** Stálé id. */
  id: string;
  /** Formátovaný kód DPH (sloupec Kód). */
  vatCode: string;
  /** Popis řádku (bublina a přístupný název). */
  label: string;
  /** Základ. */
  base: number;
  /** DPH. */
  vat: number;
  /** Celkem od APP. */
  total: number;
  /** Základ v měně firmy. */
  homeBase?: number;
  /** DPH v měně firmy. */
  homeVat?: number;
  /** Celkem v měně firmy. */
  homeTotal?: number;
}

/** Řádek „Celkem po odečtu záloh“ za kód DPH od APP (DS nic nesčítá). */
export interface JournalDeductionTotalByCode {
  /** Formátovaný kód DPH. */
  vatCode: string;
  /** Základ. */
  base: number;
  /** DPH. */
  vat: number;
  /** Celkem. */
  total: number;
  /** Základ v měně firmy. */
  homeBase?: number;
  /** DPH v měně firmy. */
  homeVat?: number;
  /** Celkem v měně firmy. */
  homeTotal?: number;
}

/** Součty pod mřížkou od APP v měně dokladu. */
export interface JournalDeductionTotals {
  /** Položky celkem s DPH (bez odečtů). */
  itemsGross: number;
  /** Odečteno záloh s DPH (záporné). */
  deductionsGross: number;
  /** Zaokrouhlení dokladu; zobrazí se, je-li různé od nuly. */
  rounding?: number;
  /** K úhradě (po odečtech a zaokrouhlení). */
  payable: number;
}

/** Konfigurace odečtů v editoru řádků (FV, FP, PO). */
export interface JournalDeductions {
  /** Řádky odečtů, vykreslené pod položkami. */
  rows: JournalDeductionRow[];
  /** Přidání odečtu ze split tlačítka; bez něj se tlačítko nezobrazí. */
  onAdd?: (kind: JournalDeductionKind) => void;
  /** Důvod, proč odečet nelze přidat. */
  addDisabledReason?: string;
  /** Odebrání odečtu (po potvrzení, s důvodem, je-li požadován). */
  onRemove?: (row: JournalDeductionRow, reason: string) => void;
  /** Potvrzení odebrání v DS (výchozí true); false = APP má vlastní dialog. */
  confirmRemove?: boolean;
  /** Povinný či volitelný důvod v potvrzení odebrání. */
  removeReason?: { label?: string; required?: boolean; placeholder?: string };
  /** Změna základu ručního odečtu. */
  onAmountChange?: (row: JournalDeductionRow, base: number) => void;
  /** Součty pod mřížkou od APP; nahrazují lištu Součet · Zaokrouhlení · K úhradě. */
  totals?: JournalDeductionTotals;
  /** Řádky odečtů a součty podle kódu v rekapitulaci DPH. */
  recap?: {
    /** Každý odečet vlastním řádkem. */
    deductionRows: JournalDeductionRecapRow[];
    /** „Celkem po odečtu záloh“ podle kódu DPH. */
    totalsByCode: JournalDeductionTotalByCode[];
  };
}
