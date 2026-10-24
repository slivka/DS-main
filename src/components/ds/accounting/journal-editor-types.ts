/**
 * Veřejné typy editoru řádků dokladu.
 * Vlastní: props `JournalLinesEditor` a jejich pomocné typy (DPH, zaokrouhlení, rekapitulace).
 * Nesmí: obsahovat logiku; změna tvaru props je změna veřejného API.
 */
import type { JournalDeductions } from "./journal-deductions-types";
import type { JournalRowSuggestions } from "./journal-suggestions";
import type * as React from "react";
import type { AccountOption } from "./account-select";
import type { CategoryOption } from "./category-select";
import type { AllowedCategories } from "./journal-category-model";
import type { DimensionType, DimensionValue, LoadDimensionOptions } from "../form/dimension-types";
import type { DimensionOption } from "./dimension-select";
import type { PartnerOption } from "./partner-select";
import type { UnitOption } from "./unit-select";
import type { JournalLinesMode } from "./journal-column-layout";
import type { JournalLineErrors } from "./journal-lines-validation";
import type {
  JournalLine,
  JournalLineColumn,
  JournalSharedSide,
  SideFieldRulesFn,
  VatCalcMode,
  VatCodeOption,
  VatPdpSubject,
} from "./journal-lines";
import type { JournalRecapTab } from "./journal-lines-recap";
import type { JournalTotals } from "./journal-vat";
import type { JournalVatOverride } from "./journal-vat-groups";
import type { JournalEditorTexts } from "../../../ds-texts";

export type { JournalLinesMode } from "./journal-column-layout";
export type { JournalLineErrors } from "./journal-lines-validation";

/** DPH v editoru řádků – bez propu (nebo s enabled=false) se nic z DPH nezobrazí. */
export interface JournalLinesVat {
  /** „Vstupuje do DPH“ a firma je plátce. */
  enabled: boolean;
  /** Jen kódy použitelné pro doklad (směr, aktivní, platné k Datu DPH) – filtruje aplikace. */
  codes: VatCodeOption[];
  /**
   * @deprecated 2.109.0 – řádky jsou vždy bez DPH, hodnota se ignoruje (pro výpočet z ceny
   * s DPH slouží pomocník „Cena s DPH“). Odstraní se ve 3.0.0.
   */
  calcMode?: VatCalcMode;
  /** @deprecated 2.109.0 – přepínač zrušen, nevolá se. Odstraní se ve 3.0.0. */
  onCalcModeChange?: (mode: VatCalcMode) => void;
  /** Kód pro nový řádek; jinak kód z předchozího řádku. */
  defaultCodeId?: string | null;
  /** Předměty plnění PDP. */
  pdpSubjects?: VatPdpSubject[];
  /** Kurz DPH (cizí měna) – bez něj kurz dokladu. */
  vatRate?: number | null;
  /** Počet jednotek kurzu DPH. */
  vatRateAmount?: number;
  /** Zaúčtovaný doklad – DPH údaje jen ke čtení, součty z řádků daně z DB. */
  readOnly?: boolean;
  /** Výchozí true; aplikace vrátí false u výjimek (např. řádek s účtem DPH). */
  isCodeRequired?: (line: JournalLine) => boolean;
  /**
   * Doklad bez pevného směru (interní doklad, pokladna, banka; 2.118.0): výběr ve skupinách
   * Výstup / Vstup a směr v buňce („Z 21 % (vstup)“).
   */
  bidirectional?: boolean;
  /** Výchozí směr – jeho skupina je ve výběru první. */
  defaultDirection?: "out" | "in";
  /** Štítek oddílu KH u řádků rekapitulace (z `VatCodeOption.khSection`); výchozí true, u ZL false. */
  showKhSection?: boolean;
  /** Informativní text pod rekapitulací (u ZL „Nejde o daňový doklad“). */
  recapNote?: React.ReactNode;
  /**
   * Vydané doklady: ruční oprava DPH se nenabízí viditelně (tužka), jen jako akce v ⋯ řádku
   * rekapitulace. Výchozí false.
   */
  overrideInMenu?: boolean;
  /** Daň bez nároku na odpočet po kódech DPH (`vatCodeId` → částka v měně dokladu) z DB. */
  nonDeductibleByCode?: Record<string, number>;
  /** Účetní pole detailu (2.121.0); withoutAccounts je skryje, hodnoty se nemažou. */
  rowDetails?: {
    /** Oprávnění APP pro pole konkrétního řádku; výchozí true. */
    canEdit?: (
      line: JournalLine,
      field: "vatDeduction" | "vatDeductionShare" | "khLimitExcluded",
    ) => boolean;
    /** Vysvětlení zamčení od APP, např. zaúčtovaný doklad. */
    disabledReason?:
      | string
      | ((
          line: JournalLine,
          field: "vatDeduction" | "vatDeductionShare" | "khLimitExcluded",
        ) => string | undefined);
  };
}
/** Výchozí hodnoty nového řádku. */
export type JournalLineDefaults = Partial<Omit<JournalLine, "id">>;
/** Strana hlavního účtu knihy. */
export type JournalMainSide = "MD" | "D";
/** Zaokrouhlení dokladu jako poslední připnutý řádek. */
export interface JournalLinesRounding {
  /** Aktuální hodnota zaokrouhlení. */
  value: number;
  /** Změna hodnoty; bez ní je zaokrouhlení jen ke čtení. */
  onChange?: (value: number) => void;
  /** Jen ke čtení. */
  readOnly?: boolean;
  /** Vlastní popisek řádku. */
  label?: string;
  /** @deprecated 2.109.0 – použijte `roundingLimit` editoru. Odstraní se ve 3.0.0. */
  limit?: number;
}
/** Řízený stav rekapitulace pod editorem. */
export interface JournalLinesRecapState {
  /** Rekapitulace rozbalená. */
  open?: boolean;
  /** Změna rozbalení. */
  onOpenChange?: (open: boolean) => void;
  /** Aktivní záložka. */
  tab?: string;
  /** Změna záložky. */
  onTabChange?: (tab: string) => void;
  /** Rekapitulace DPH: sloupce v měně firmy rozbalené (cizí měna; 2.109.0). */
  vatHomeOpen?: boolean;
  /** Změna rozbalení sloupců v měně firmy; bez ní se přepínač nezobrazí. */
  onVatHomeOpenChange?: (open: boolean) => void;
}
/** Texty editoru; výchozí hodnoty jsou v `DsTexts.journalEditor`. */
export type JournalLinesEditorTexts = JournalEditorTexts;

/** Props editoru řádků dokladu. */
export interface JournalLinesEditorProps {
  /** Účetnictví je výchozí; DE mění jen prezentaci položek. */
  bookkeepingMode?: import("../tax-records/tax-record-types").BookkeepingMode;
  /** Výchozí true; false skryje kategorie i jejich nastavení a validaci bez změny dat. */
  categoriesEnabled?: boolean;
  /** U ID přeřazení zobrazí dvě položky, ostatní pohyby jednu. */
  taxMovementKind?: import("../tax-records/tax-record-types").TaxMovementKind;
  onTaxMovementKindChange?: (
    kind: import("../tax-records/tax-record-types").TaxMovementKind,
  ) => void;
  /** @deprecated 2.108.0 – Celkem v domácí měně se v rekapitulaci nezobrazuje; ignorováno. */
  recapTotalAmount?: number;
  /** @deprecated 2.108.0 – ignorováno. */
  recapTotalLabel?: string;
  /** Řádky dokladu (řízená hodnota). */
  lines: JournalLine[];
  /** Nové řádky po každé změně. */
  onChange: (lines: JournalLine[]) => void;
  /** Návrhy účtu, kategorie, kódu DPH, částky a textu podle id řádku. */
  rowSuggestions?: JournalRowSuggestions;
  /** První ruční změna navržené buňky; APP odebere návrh. */
  onSuggestionCleared?: (key: string, rowId?: string) => void;
  /** Účtový rozvrh. */
  accounts: AccountOption[];
  /** Ekonomické kategorie. */
  /** Ekonomické kategorie; mají přednost před dimensions. */
  categories?: CategoryOption[];
  /** Kategorie zvlášť MD / DAL; výchozí true pro internal, false pro mainAccount. */
  categoryBySide?: boolean;
  /** Povolené uzly účtu včetně potomků; null = všechny. */
  allowedCategories?: AllowedCategories;
  /** Hodnoty B2; CategoryOption[] je @deprecated B1 alias categories do 3.0.0. */
  dimensions?: DimensionOption[] | DimensionValue[];
  /** Typy skutečných dimenzí B2, oddělené od ekonomických kategorií. */
  dimensionTypes?: DimensionType[];
  /** Změna dimenzí hlavičky. */
  onDimensionsChange?: (values: DimensionValue[]) => void;
  /** Hledání hodnot a vozidel dodané APP. */
  loadDimensionOptions?: LoadDimensionOptions;
  /** Dvě lišty MD/DAL; výchozí true pro internal. */
  dimensionsBySide?: boolean;
  /** Partneři. */
  partners?: PartnerOption[];
  /** Měrné jednotky. */
  units?: UnitOption[];
  /** Založení nové měrné jednotky z výběru. */
  onCreateUnit?: (code: string) => Promise<UnitOption>;
  /** Otevře úpravu vybrané měrné jednotky z buňky nebo detailu řádku. */
  onEditUnit?: (unitId: string) => void;
  /** Otevře úpravu vybrané kategorie z buňky nebo detailu řádku. */
  /** Ekonomické kategorie. */
  onEditCategory?: (categoryId: string) => void;
  /** @deprecated Od 2.138.0 onEditCategory; odstranění ve 3.0.0. */
  onEditDimension?: (dimensionId: string) => void;
  /**
   * Přidá kategorii z hledání (＋ v buňce i v detailu řádku); dostane hledaný text.
   * Vrátí-li Promise kategorii, DS ji vybere v řádku, ze kterého se zakládalo;
   * `null` / `undefined` / zamítnutí nic nemění.
   */
  /** Ekonomické kategorie. */
  onCreateCategory?: (searchText: string) => void | Promise<CategoryOption | null | undefined>;
  /** @deprecated Od 2.138.0 onCreateCategory; odstranění ve 3.0.0. */
  onCreateDimension?: (searchText: string) => void | Promise<DimensionOption | null | undefined>;
  /** Kód měny dokladu. */
  documentCurrency: string;
  /** Značka měny dokladu (z dat). */
  documentCurrencySymbol?: string;
  /** Kód domácí měny. */
  homeCurrency: string;
  /** Značka domácí měny (z dat). */
  homeCurrencySymbol?: string;
  /** Kurz dokladu. */
  rate?: number | null;
  /** Počet jednotek kurzu. */
  rateAmount?: number;
  /** Pole stran společná, nebo zvlášť pro MD a DAL. */
  sideFields?: "shared" | "split";
  /** Strana sdílených polí. */
  sharedSide?: JournalSharedSide;
  /** Interní doklad (MD i DAL), nebo kniha s hlavním účtem (jen protiúčet). */
  mode?: JournalLinesMode;
  /** Strana hlavního účtu v režimu `mainAccount`. */
  mainSide?: JournalMainSide;
  /** Hlavní účet knihy v režimu `mainAccount`. */
  mainAccount?: string | null;
  /** Pravidla stran podle účtu. */
  sideFieldRules?: SideFieldRulesFn;
  /** Kategorie povinná pro celou knihu. */
  /** Ekonomické kategorie. */
  categoryRequired?: boolean;
  /** @deprecated Od 2.138.0 categoryRequired; odstranění ve 3.0.0. */
  dimensionRequired?: boolean;
  /** Smí být řádek nedaňový. */
  isNonTaxAllowed?: (line: JournalLine) => boolean;
  /** Editovatelné sloupce (výchozí všechny). */
  editableFields?: JournalLineColumn[];
  /** Celková částka dokladu pro „Zbývá rozepsat“. */
  totalAmount?: number;
  /** Celek zadaný, nebo počítaný z řádků. */
  totalMode?: "entered" | "computed";
  /** Zaokrouhlení dokladu. */
  rounding?: JournalLinesRounding;
  /** Výchozí hodnoty nového řádku. */
  defaults?: JournalLineDefaults;
  /** Doplňková validace řádku. */
  validate?: (line: JournalLine) => JournalLineErrors;
  /** Celek řádků (stejný výpočet jako patička a „Celkem …“ v liště); volá se jen při změně hodnot. */
  onTotalsChange?: (totals: JournalTotals) => void;
  /**
   * Počet a seznam viditelných chyb; `line` je pořadí řádku od 1. Od 2.107.0 navíc
   * `fieldId`, `rowId` a `columnId` pro odkazy souhrnu chyb (aditivní).
   */
  onValidationChange?: (
    count: number,
    errors: {
      /** Pořadí řádku od 1; chybí u položek skupiny DPH (2.109.0). */
      line?: number;
      field: string;
      message: string;
      /** Popisek položky mimo řádek (skupina DPH „kód sazba %“). */
      label?: string;
      /** Závažnost; bez ní chyba. Varování se nepočítá do `count` (2.109.0). */
      severity?: "error" | "warning";
      fieldId?: string;
      rowId?: string;
      columnId?: string;
    }[],
  ) => void;
  /**
   * Externí stavy buněk z pruhu položek (2.108.0): chyba → červený rámeček buňky,
   * varování → žluté; text se ukáže v bublině buňky. Sloučí se s vlastní validací.
   */
  cellIssues?: {
    rowId: string;
    columnId: string;
    message: string;
    severity: "error" | "warning";
  }[];
  /** Řádky lze přesouvat (výchozí, pokud je něco editovatelné). */
  reorderable?: boolean;
  /** Prázdný doklad začne jedním prázdným řádkem. */
  initialEmptyLine?: boolean;
  /** Ukázat chyby i u nedotčených prázdných řádků. */
  showAllErrors?: boolean;
  /** Množstevní sloupce viditelné ve výchozím stavu. */
  showQuantityColumns?: boolean;
  /** Klíč uložení sloupců a zoomu. */
  storageKey?: string;
  /** Řízený stav rekapitulace. */
  recap?: JournalLinesRecapState;
  /** Vlastní záložky rekapitulace. */
  recapTabs?: JournalRecapTab[];
  /** Přepis textů (priorita: prop → DsTextsProvider → čeština). */
  texts?: Partial<JournalLinesEditorTexts>;
  /** Třída kořenového prvku. */
  className?: string;
  /** DPH na řádcích – bez propu se editor chová jako dřív. */
  vat?: JournalLinesVat;
  /** Přepisy daně skupin „dle dokladu“ (2.109.0); ukládají se s řádky jako `_vat_overrides`. */
  vatOverrides?: JournalVatOverride[];
  /** Změna přepisů skupin; `[]` = smazat všechny. Bez ní je rekapitulace jen ke čtení. */
  onVatOverridesChange?: (overrides: JournalVatOverride[]) => void;
  /** Kurz DPH (měna firmy za `vatExchangeRateAmount` jednotek); výchozí `vat.vatRate`, pak kurz dokladu. */
  vatExchangeRate?: number | null;
  /** Počet jednotek kurzu DPH (výchozí 1). */
  vatExchangeRateAmount?: number;
  /** Limit zaokrouhlení firmy; bez něj nabídka Rozdílu Zaokrouhlení nenabízí. */
  roundingLimit?: number;
  /** Zápis zaokrouhlení z nabídky Rozdílu; výchozí `rounding.onChange`. */
  onRoundingChange?: (value: number) => void;
  /**
   * Řádky bez zaúčtování MD / DAL (zálohový list, 2.118.0): sloupce účtů se nezobrazí ani
   * nekontrolují; zaúčtování dokladu vytváří DB.
   */
  withoutAccounts?: boolean;
  /** Odečtené zálohy v měně dokladu (z DB, 2.118.0); patička je ukáže jen při nenulové hodnotě. */
  advanceDeduction?: number;
  /**
   * Odečty záloh jako řádky pod položkami se split akcí, třemi součty a řádky rekapitulace
   * (FV, FP, PO); data a částky dodává APP. Nahrazuje AdvanceDeductionsSection v afterVatRecap.
   */
  deductions?: JournalDeductions;
  /** Obsah pod rekapitulací; APP předá odečty faktury, u ZL slot nepředává. */
  afterVatRecap?: React.ReactNode;
  /** Závažnost rozdílu přepisu nad tolerancí (koncept varování, zařazení chyba); výchozí warning. */
  vatOverrideSeverity?: "warning" | "error";
}
