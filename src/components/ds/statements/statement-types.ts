/** Typy výkazů · veřejné tvary dat od APP · nesmí obsahovat výpočty. */

/** Druh výkazu. */
export type StatementKind = "balance" | "income";
/** Jednotky zobrazení: celé jednotky měny nebo tisíce. */
export type StatementUnit = "full" | "thousands";

/** Sloupec hodnot (běžné / minulé období, brutto / korekce / netto). */
export interface StatementValueColumn {
  /** Klíč sloupce v `StatementRow.values`. */
  id: string;
  /** Popisek od APP, např. „Běžné období – netto“. */
  label: string;
}

/** Řádek výkazu; hodnoty pro obě jednotky dodává APP (součty i dorovnání počítá DB). */
export interface StatementRow {
  /** Klíč řádku. */
  id: string;
  /** Nadřazený řádek. */
  parentId?: string | null;
  /** Označení, např. „A.“, „A.I.“. */
  mark: string;
  /** Název řádku. */
  label: string;
  /** Součtový řádek je tučný a nikdy needitovatelný. */
  kind: "sum" | "mapped";
  /** Hodnoty podle jednotek a sloupců. */
  values: Record<StatementUnit, Record<string, number | null | undefined>>;
  /** Řádek dorovnaný při zaokrouhlení na tisíce (příznak z DB). */
  rounded?: boolean;
  /** Vlastní text bubliny dorovnání. */
  roundedNote?: string;
}

/** Změna hodnoty v režimu úprav; přepočet součtů provede APP / DB. */
export interface StatementValuePatch {
  rowId: string;
  columnId: string;
  unit: StatementUnit;
  value: number | null;
}

/** Stav kontroly výkazu od APP. */
export interface StatementCheck {
  /** Aktiva = Pasiva, nebo HV rozvaha = HV výsledovka. */
  kind: "balance" | "profit";
  ok: boolean;
  /** Rozdíl v aktuálních jednotkách. */
  difference?: number | null;
}

/** Uložený výkaz v seznamu. */
export interface SavedStatement {
  id: string;
  name: string;
  kind: StatementKind;
  /** Popisek období od APP. */
  period: string;
  unit: StatementUnit;
  savedBy: string;
  /** ISO datum a čas uložení. */
  savedAt: string;
}

/** Hodnoty dialogu uložení. */
export interface StatementSaveValue {
  name: string;
  kind: StatementKind;
  period: string;
  unit: StatementUnit;
}

/** Řádek šablony výkazu. */
export interface StatementTemplateRow {
  id: string;
  parentId?: string | null;
  mark: string;
  label: string;
  kind: "sum" | "mapped";
  /** Mapované účty / skupiny (klíče z `mappingOptions`). */
  mapping: string[];
}

/** Volba mapování účtu nebo skupiny z dat APP. */
export interface StatementMappingOption {
  value: string;
  label: string;
}
