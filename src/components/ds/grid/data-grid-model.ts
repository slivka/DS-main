/**
 * Čisté výpočty DataGrid.
 * Vlastní: textovou podobu buňky, klíče datumového filtru (rok, čtvrtletí, měsíc), nabídku
 * hodnot autofiltru, součtový řádek a data pro export a tisk.
 * Nesmí: používat React ani stav – vstup → výstup, testovatelné samostatně.
 */
import type { ReactNode } from "react";

import { fmtAmount } from "../../../lib/format";
import { formatUserDate, formatUserDateTime } from "../../../lib/date-time-preferences";
import type { GridExportData } from "./grid-export";
import type { GroupedItem } from "./grid-grouping";
import type { GridTexts } from "./grid-texts";
import type { DataGridColumn } from "./data-grid-types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
const DATE_FILTER_PREFIX = "__date:";

/** Rok a měsíc hodnoty pro datumový filtr. */
export type DateFilterParts = { year: number; month: number };

/** Rok a měsíc z ISO data nebo z d.M.rrrr; jinak null. */
export const dateFilterParts = (value: unknown): DateFilterParts | null => {
  if (typeof value !== "string") return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]) };
  const local = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/.exec(value.trim());
  if (!local) return null;
  return { year: Number(local[3]), month: Number(local[2]) };
};

/** Klíče roku, čtvrtletí a měsíce, podle kterých datumový filtr hledá shodu. */
export const dateFilterKeys = (parts: DateFilterParts) => {
  const month = String(parts.month).padStart(2, "0");
  const quarter = Math.ceil(parts.month / 3);
  return [
    `${DATE_FILTER_PREFIX}year:${parts.year}`,
    `${DATE_FILTER_PREFIX}quarter:${parts.year}-Q${quarter}`,
    `${DATE_FILTER_PREFIX}month:${parts.year}-${month}`,
  ];
};

/** Textová podoba buňky – datumy vždy podle centrálního nastavení firmy. */
export const cellText = (v: unknown) => {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return formatUserDateTime(v);
  if (typeof v === "string") {
    if (ISO_DATE.test(v)) return formatUserDate(v);
    if (ISO_DATE_TIME.test(v)) return formatUserDateTime(v);
  }
  return String(v);
};

/** Položka nabídky autofiltru. */
export type FilterOption = { value: string; label: string; section?: string };

type FilterTexts = Pick<
  GridTexts,
  | "locale"
  | "dateFilterYears"
  | "dateFilterQuarter"
  | "dateFilterQuarters"
  | "dateFilterMonths"
  | "dateFilterDates"
  | "emptyValue"
>;

/** Skupiny roků, čtvrtletí a měsíců nad hodnotami datumového sloupce (nejnovější první). */
function dateOptions(values: Set<string>, texts: FilterTexts): FilterOption[] {
  const parts = [...values]
    .map((value) => dateFilterParts(value))
    .filter((part): part is DateFilterParts => part !== null);
  const years = [...new Set(parts.map((part) => part.year))].sort((a, b) => b - a);
  const quarters = [
    ...new Set(parts.map((part) => `${part.year}-Q${Math.ceil(part.month / 3)}`)),
  ].sort((a, b) => b.localeCompare(a, texts.locale));
  const months = [
    ...new Set(parts.map((part) => `${part.year}-${String(part.month).padStart(2, "0")}`)),
  ].sort((a, b) => b.localeCompare(a, texts.locale));
  return [
    ...years.map((year) => ({
      value: `${DATE_FILTER_PREFIX}year:${year}`,
      label: String(year),
      section: texts.dateFilterYears,
    })),
    ...quarters.map((key) => {
      const [year, quarter] = key.split("-Q").map(Number);
      return {
        value: `${DATE_FILTER_PREFIX}quarter:${key}`,
        label: texts.dateFilterQuarter(quarter ?? 1, year ?? 0),
        section: texts.dateFilterQuarters,
      };
    }),
    ...months.map((key) => {
      const [year, month] = key.split("-").map(Number);
      return {
        value: `${DATE_FILTER_PREFIX}month:${key}`,
        label: new Intl.DateTimeFormat(texts.locale, { month: "long", year: "numeric" }).format(
          new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, 1)),
        ),
        section: texts.dateFilterMonths,
      };
    }),
  ];
}

/** Nabídka autofiltru jednoho sloupce z hodnot řádků (u data i skupiny období). */
export function columnFilterOptions(
  values: Set<string>,
  isDate: boolean,
  texts: FilterTexts,
): FilterOption[] {
  return [
    ...(isDate ? dateOptions(values, texts) : []),
    ...[...values]
      .sort((a, b) => a.localeCompare(b, texts.locale))
      .map((v) => ({
        value: v,
        label: v === "" ? texts.emptyValue : v,
        ...(isDate ? { section: texts.dateFilterDates } : {}),
      })),
  ];
}

/**
 * Buňky součtového řádku: součet (výchozí u číselných), průměr, počet, součet vybraných
 * nebo vlastní funkce; null = sloupec bez součtu.
 */
export function totalCells<Row>(
  columns: DataGridColumn<Row>[],
  rows: Row[],
  selectedRows: Row[],
): (ReactNode | null)[] {
  return columns.map((c) => {
    const mode = c.total ?? (c.numeric ? "sum" : "none");
    if (mode === "none") return null;
    if (typeof mode === "function") return mode(rows);
    if (mode === "count") return fmtAmount(rows.length, 0);
    const nums: number[] = [];
    // „sumSelected“ sčítá vybrané řádky včetně těch skrytých filtrem.
    for (const row of mode === "sumSelected" ? selectedRows : rows) {
      const v = c.value?.(row);
      if (typeof v === "number" && Number.isFinite(v)) nums.push(v);
    }
    if (!nums.length) return mode === "sumSelected" ? fmtAmount(0, c.decimals ?? 2) : null;
    const sum = nums.reduce((a, b) => a + b, 0);
    const value = mode === "avg" ? sum / nums.length : sum;
    return fmtAmount(value, c.decimals ?? 2);
  });
}

/** Data pro Excel (bez součtů skupin) nebo tisk (se součty skupin v řádku skupiny). */
export function buildExportData<Row>(
  shown: DataGridColumn<Row>[],
  items: GroupedItem<Row>[],
  groupLevels: number | null,
  forPrint: boolean,
): GridExportData {
  const hasSections = shown.some((column) => column.section);
  return {
    columns: shown.map((column) => column.label),
    ...(hasSections
      ? {
          headerRows: [
            shown.map((column) => column.section ?? ""),
            shown.map((column) => column.label),
          ],
        }
      : {}),
    rows: items.map((item) => {
      if (item.type === "group") {
        return shown.map((column, index) =>
          index === 0
            ? `${item.column}: ${item.label}`
            : forPrint
              ? (item.sums.find((sum) => sum.id === column.id)?.total ?? null)
              : null,
        );
      }
      return shown.map((column) => {
        const value = column.value?.(item.row) ?? null;
        if (typeof value === "number") return value;
        return value === null || value === undefined ? "" : String(value);
      });
    }),
    ...(groupLevels !== null
      ? {
          rowLevels: items.map((item) => (item.type === "group" ? item.level : groupLevels)),
        }
      : {}),
    columnMeta: shown.map((column) => {
      const type = column.exportType ?? (column.numeric ? "number" : "text");
      const total = column.total ?? (column.numeric ? "sum" : "none");
      return {
        type,
        align: column.align ?? (column.numeric ? "right" : "left"),
        total: total === "sum" || total === "count" ? total : "none",
      };
    }),
  };
}
