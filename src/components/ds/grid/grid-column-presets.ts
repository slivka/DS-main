/**
 * Výchozí sady sloupců gridu a jejich šířky.
 * Vlastní: seznamy id sloupců připnutých vlevo a sloupců s šířkou podle obsahu, pravidla šířky
 * sloupce pobočky a připnutých sloupců, převod šířky v px na styl buňky.
 * Nesmí: obsahovat doménová id přímo v gridu – grid dostává sady přes props, výchozí hodnoty
 * jsou zde jako exportované konstanty, které si aplikace může upravit.
 */
import type { CSSProperties } from "react";

/**
 * Výchozí id sloupců připnutých vlevo (stav, aktivní, systémový, zdroj). Grid je použije,
 * pokud aplikace nepředá vlastní `pinnedColumnIds`.
 */
export const DEFAULT_PINNED_COLUMNS: readonly string[] = [
  "status",
  "is_active",
  "is_system",
  "source",
];

/**
 * Výchozí účetní identifikátory a krátké systémové hodnoty, které mají v gridu jen šířku
 * nutnou pro záhlaví, filtr a nejdelší hodnotu. Porovnává se s id i popiskem sloupce bez
 * diakritiky, mezer a velikosti písmen. Grid je použije, pokud aplikace nepředá
 * vlastní `compactColumnIds`.
 */
export const DEFAULT_COMPACT_COLUMNS: readonly string[] = [
  "status",
  "state",
  "documentstatus",
  "date",
  "documentdate",
  "document",
  "documentnumber",
  "number",
  "variabilesymbol",
  "variablesymbol",
  "symbol",
  "vs",
  "md",
  "dal",
  "debit",
  "credit",
  "debitaccount",
  "creditaccount",
];

/** Pevná minimální šířka sloupce pobočky (px) – kódy poboček jsou krátké. */
export const BRANCH_COLUMN_WIDTH = 78;

/** Šířka připnutého sloupce (px); širší jen sloupec `is_system`, jehož štítek je delší. */
export const pinnedColumnWidth = (id: string) => (id === "is_system" ? 118 : 84);

/** Sloupec je připnutý vlevo podle zadané sady (výchozí {@link DEFAULT_PINNED_COLUMNS}). */
export const isPinnedColumn = (id: string, ids: readonly string[] = DEFAULT_PINNED_COLUMNS) =>
  ids.includes(id);

/** Sloupec pobočky řídí `branchVisibility`; zobrazuje se vždy jako první. */
export const isBranchColumn = (column: { branchVisibility?: "auto" | "always" | undefined }) =>
  column.branchVisibility !== undefined;

/** Klíč pro porovnání se sadou kompaktních sloupců: bez diakritiky, mezer a velikosti písmen. */
export const compactColumnKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLocaleLowerCase("cs");

/** Vlastnosti sloupce, ze kterých se pozná kompaktní sloupec. */
export type CompactColumnInfo = {
  id: string;
  label: string;
  fitContent?: boolean | undefined;
  exportType?: string | undefined;
};

/** Sloupec má šířku podle obsahu: `fitContent`, datum, nebo id / popisek ze sady. */
export function isCompactColumn(column: CompactColumnInfo, ids: readonly string[]) {
  const keys = new Set(ids.map(compactColumnKey));
  return (
    column.fitContent === true ||
    column.exportType === "date" ||
    column.exportType === "datetime" ||
    keys.has(compactColumnKey(column.id)) ||
    keys.has(compactColumnKey(column.label))
  );
}

/** Šířka v px převedená na rem, která se násobí zoomem gridu. */
export const zoomedWidth = (px: number) => `calc(${px / 16}rem * var(--grid-zoom, 1))`;

/** Pevná šířka buňky (šířka = minimum = maximum); bez šířky nic. */
export function fixedWidthStyle(px: number | undefined): CSSProperties | undefined {
  if (!px) return undefined;
  const width = zoomedWidth(px);
  return { width, maxWidth: width, minWidth: width, boxSizing: "border-box" };
}
