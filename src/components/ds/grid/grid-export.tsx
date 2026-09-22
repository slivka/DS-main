import { Download, FileCode2, FileText } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { gridFontSize } from "@/components/ds/grid/grid-zoom";
import excelIcon from "@/assets/excel.svg";
import pdfIcon from "@/assets/pdf.svg";
import robotoRegular from "@/assets/roboto-regular.ttf";
import robotoBold from "@/assets/roboto-bold.ttf";
import {
  excelDateFormat,
  formatUserDate,
  formatUserDateTime,
  getDateTimePreferences,
  parseUserDate,
  useDateTimePreferences,
} from "@/lib/date-time-preferences";

import { nzero, roundTo } from "@/lib/format";

type ExportCell = string | number | Date | null | undefined;

export type GridExportData = {
  /** Hlavičky sloupců v pořadí zobrazení. */
  columns: string[];
  /** Volitelné víceřádkové záhlaví; poslední řádek odpovídá datovým sloupcům. */
  headerRows?: string[][];
  /** Řádky – hodnoty jako text nebo číslo. */
  rows: ExportCell[][];
  /** V PDF rozloží dlouhý seznam do více paralelních bloků. */
  pdfColumnGroups?: number;
  /** Vypnout součtový řádek u stavových a časových řad. */
  summarize?: boolean;
  /** Volitelný Excel číselný formát pro jednotlivé sloupce. */
  excelNumberFormats?: (string | null)[];
  /** Úroveň zanoření řádku (0 = kořen) – v Excelu vytvoří sbalovací skupiny. */
  rowLevels?: number[];
  /** Doplňková informace do záhlaví sestavy (např. přepočet k datu). */
  note?: string | null;
  /** Rekapitulace pod tabulkou – popis a hodnota, volitelně tučně či červeně. */
  footerRows?: {
    label: string;
    value?: number | string | null;
    bold?: boolean;
    warn?: boolean;
    numberFormat?: string | null;
  }[];
  /**
   * Součtové řádky tabulky (stejné jako patička gridu). Popisek se slučuje přes
   * prvních `labelSpan` sloupců a zarovnává doprava, hodnoty navazují za ním.
   */
  totalRows?: { label: string; labelSpan?: number; cells: ExportCell[] }[];
};

const cell = (v: ExportCell) => (v === null || v === undefined ? "" : v);

const CURRENCY_CODE = "EUR";
const NUM_FMT = "#,##0.00";
const MONEY_FMT = `#,##0.00\u00a0"\u20ac"`;
const INT_FMT = "#,##0";
const PCT_FMT = "0.0%";
const YEAR_FMT = "0";

/** Doplní do Excel formátu sekci pro nulu, aby se místo 0,00 (a nikdy -0,00) zobrazila pomlčka. */
/** Tenké orámování buněk tabulky v sešitu. */
const THIN = { style: "thin", color: { argb: "FFB8BCC4" } } as const;
const TABLE_BORDER_EXCELJS = { top: THIN, bottom: THIN, left: THIN, right: THIN };

/** ExcelJS se načítá až při exportu (prohlížečový build). */
let excelJsPromise: Promise<typeof import("exceljs")> | null = null;
function loadExcelJs() {
  excelJsPromise ??= import("exceljs/dist/exceljs.min.js").then(
    (mod) => ((mod as { default?: unknown }).default ?? mod) as typeof import("exceljs"),
  );
  return excelJsPromise;
}

/** Stabilní číslo pro unikátní název tabulky v sešitu. */
function hashCode(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return hash;
}

function withDashZero(fmt: string) {
  if (fmt.includes(";")) return fmt;
  return `${fmt};-${fmt};"–"`;
}

/** Počet desetinných míst, na který se hodnota zaokrouhlí, aby formát nikdy neukázal -0,00. */
function decimalsForFormat(fmt: string | null | undefined) {
  if (!fmt) return 6;
  if (fmt.includes("%")) return 6;
  const match = /\.(0+)/.exec(fmt);
  return match ? match[1].length : 0;
}

/** Normalizuje číslo pro export: zaokrouhlí dle formátu a odstraní zápornou nulu. */
function normalizeExportNumber(v: number, fmt?: string | null) {
  return nzero(roundTo(v, decimalsForFormat(fmt)));
}

const fmtNumber = (v: number) => {
  const n = nzero(roundTo(v, 2));
  return n === 0
    ? "–"
    : n.toLocaleString("sk-SK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/** Sjednotí ISO datum/čas vložený v nadpisu, záhlaví nebo popisu filtru. */
export function formatExportTextDates(value: string) {
  return value.replace(
    /\b(\d{4}-\d{2}-\d{2})(?:[T ](\d{2}:\d{2}(?::\d{2})?)(?:\.\d+)?Z?)?\b/g,
    (match, date: string, time?: string) => {
      if (!time) return formatUserDate(date);
      const parsed = new Date(`${date}T${time}${match.endsWith("Z") ? "Z" : ""}`);
      return Number.isNaN(parsed.getTime()) ? match : formatUserDateTime(parsed);
    },
  );
}

/** Rozpozná datum v běžných formátech (31.7.2026, 2026-07-31, s časem i bez). */
function parseDateValue(v: unknown): { date: Date; hasTime: boolean } | null {
  if (v instanceof Date)
    return Number.isNaN(v.getTime())
      ? null
      : { date: v, hasTime: Boolean(v.getHours() || v.getMinutes() || v.getSeconds()) };
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;

  let m = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    const [, d, mo, y, hh, mi, ss] = m;
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(hh ?? 0),
      Number(mi ?? 0),
      Number(ss ?? 0),
    );
    return Number.isNaN(date.getTime()) ? null : { date, hasTime: hh !== undefined };
  }

  m = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(s);
  if (m) {
    const [, y, mo, d, hh, mi, ss] = m;
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(hh ?? 0),
      Number(mi ?? 0),
      Number(ss ?? 0),
    );
    return Number.isNaN(date.getTime()) ? null : { date, hasTime: hh !== undefined };
  }

  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(s);
  if (m) {
    const [, d, mo, y, hh, mi, ss] = m;
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      Number(hh ?? 0),
      Number(mi ?? 0),
      Number(ss ?? 0),
    );
    return Number.isNaN(date.getTime()) ? null : { date, hasTime: hh !== undefined };
  }

  const userValue = /^(\S+)(?:[ ,]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM))?))?$/i.exec(s);
  const datePart = userValue?.[1] ?? s;
  const timePart = userValue?.[2];
  const iso = parseUserDate(datePart, getDateTimePreferences());
  if (iso) {
    const [, y, mo, d] = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) ?? [];
    const time = timePart
      ? /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?$/i.exec(timePart)
      : null;
    let hour = Number(time?.[1] ?? 0);
    if (time?.[4]) hour = (hour % 12) + (time[4].toUpperCase() === "PM" ? 12 : 0);
    const date = new Date(
      Number(y),
      Number(mo) - 1,
      Number(d),
      hour,
      Number(time?.[2] ?? 0),
      Number(time?.[3] ?? 0),
    );
    if (!Number.isNaN(date.getTime())) return { date, hasTime: Boolean(time) };
  }
  return null;
}

const displayExportCell = (value: ExportCell, isDate: boolean, hasTime: boolean) => {
  if (!isDate) return value;
  const parsed = parseDateValue(value);
  if (!parsed) return value;
  return hasTime ? formatUserDateTime(parsed.date) : formatUserDate(parsed.date);
};

/** Převod na Excel sériové číslo (systém 1900). */
function toExcelSerial(date: Date) {
  const utcDays = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000 + 25569;
  const timeFraction =
    (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) / 86400;
  return utcDays + timeFraction;
}

/** Sloupce, kde jsou všechny neprázdné hodnoty datumy. */
function dateColumns(data: GridExportData) {
  return data.columns.map((_, i) => {
    let hasDate = false;
    let hasTime = false;
    for (const r of data.rows) {
      const v = r[i];
      if (v === null || v === undefined || v === "") continue;
      const parsed = parseDateValue(v);
      if (!parsed) return { isDate: false, hasTime: false };
      hasDate = true;
      hasTime ||= parsed.hasTime;
    }
    return { isDate: hasDate, hasTime };
  });
}

/** Sloupce, kde jsou (alespoň někde) čísla a nikde text. */
function numericColumns(data: GridExportData) {
  return data.columns.map((_, i) => {
    let hasNumber = false;
    for (const r of data.rows) {
      const v = r[i];
      if (v === null || v === undefined || v === "") continue;
      if (typeof v === "number" && Number.isFinite(v)) hasNumber = true;
      else return false;
    }
    return hasNumber;
  });
}

const CURRENCY_CODES = [CURRENCY_CODE];

/** Vrátí kód měny z hlavičky sloupce, např. „Zůstatek (EUR)“ → EUR. */
function currencyFromHeader(header: string) {
  const upper = header.toUpperCase();
  if (/€|\bEUR\b/.test(upper)) return CURRENCY_CODE;
  return CURRENCY_CODES.find((code) => new RegExp(`\\b${code}\\b`).test(upper)) ?? null;
}

const MONEY_WORDS =
  /zůstatek|zostatok|stav|vázan|viazan|volné|volne|částka|castka|čiastka|ciastka|celkem|celkom|obrat|suma|cena|hodnota|balance|úrok|urok|poplatok|poplatek|záloha|zaloha/i;
const COUNT_WORDS = /počet|pocet|počty|množství|mnozstvi|ks\b|účtů|uctu|id\b/i;

/**
 * Určí číselný formát pro každý sloupec podle hlavičky a hodnot:
 * měna → #,##0.00 "CZK", procenta → 0.0%, počty/roky → celá čísla, jinak 2 desetinná.
 */
function columnFormats(data: GridExportData, numeric: boolean[]) {
  return data.columns.map((header, i) => {
    if (!numeric[i]) return null;
    const explicitFormat = data.excelNumberFormats?.[i];
    if (explicitFormat) return explicitFormat;
    const values = data.rows
      .map((r) => r[i])
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const allIntegers = values.every((v) => Number.isInteger(v));

    if (/%|procent/i.test(header)) return PCT_FMT;
    if (/\brok\b|\broku\b|year/i.test(header) && allIntegers) return YEAR_FMT;

    const currency = currencyFromHeader(header);
    if (currency) return MONEY_FMT;
    if (MONEY_WORDS.test(header)) return MONEY_FMT;
    if (allIntegers && COUNT_WORDS.test(header)) return INT_FMT;
    return allIntegers ? INT_FMT : NUM_FMT;
  });
}

function columnSums(data: GridExportData, numeric: boolean[]) {
  return data.columns.map((_, i) =>
    numeric[i]
      ? nzero(
          roundTo(
            data.rows.reduce(
              (acc, r) => acc + (typeof r[i] === "number" ? (r[i] as number) : 0),
              0,
            ),
            6,
          ),
        )
      : null,
  );
}

/** Excel nepovoluje v názvu listu znaky : \\ / ? * [ ] a limituje jej na 31 znaků. */
function worksheetName(title: string) {
  const safe = title
    .replace(/[\\/:?*[\]]/g, "-")
    .replace(/^'+|'+$/g, "")
    .trim();
  return (safe || "Data").slice(0, 31);
}

function downloadXlsx(data: ArrayBuffer, filename: string) {
  const blob = new Blob([data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

let fontsPromise: Promise<{ regular: string; bold: string }> | null = null;

/** Načte a nacachuje TTF fonty (base64) kvůli české diakritice v PDF. */
export function loadPdfFonts() {
  fontsPromise ??= (async () => {
    const toBase64 = async (url: string) => {
      const buf = await (await fetch(url)).arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.length; i += 8192) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
      }
      return btoa(binary);
    };
    const [regular, bold] = await Promise.all([
      toBase64(robotoRegular),
      toBase64(robotoBold),
    ]);
    return { regular, bold };
  })();
  return fontsPromise;
}

/**
 * Stažení dat gridu – tlačítko s nabídkou Excel / PDF.
 * Obsah nabídky se řídí zoomem gridu (em jednotky odvozené od fontSize).
 */
export function GridExport({
  getData,
  filename,
  title,
  zoom = 1,
  className = "",
  html = false,
  extraExcelExport,
  extraPdfExport,
  pdfExport,
  disabled = false,
}: {
  /** Vrací aktuálně zobrazená data (po filtrech a řazení). */
  getData: () => GridExportData | Promise<GridExportData>;
  /** Název souboru bez přípony. */
  filename: string;
  /** Nadpis v PDF sestavě. */
  title?: string;
  zoom?: number;
  className?: string;
  /** Zobrazit i položku pro stažení do HTML. */
  html?: boolean;
  /** Volitelný specializovaný Excel export zobrazený odděleně za běžnými formáty. */
  extraExcelExport?: {
    label: string;
    onExport: () => void | Promise<void>;
  };
  /** Volitelné další PDF sestavy zobrazené odděleně za běžnými formáty. */
  extraPdfExport?:
    | {
        label: string;
        onExport: () => void | Promise<void>;
        icon?: ReactNode;
      }
    | { label: string; onExport: () => void | Promise<void>; icon?: ReactNode }[];

  /** Nahradí výchozí PDF export vlastní tiskovou sestavou. */
  pdfExport?: () => void | Promise<void>;
  disabled?: boolean;
}) {
  const { formatDateTime } = useDateTimePreferences();
  const fontSize = gridFontSize(zoom);

  const exportExcel = async () => {
    const data = await getData();
    const { columns, rows } = data;
    const exportColumns = columns.map(formatExportTextDates);
    const colCount = Math.max(1, exportColumns.length);
    const numeric = numericColumns(data);
    const dates = dateColumns(data);
    const formats = columnFormats(data, numeric);
    const sums = data.summarize === false ? columns.map(() => null) : columnSums(data, numeric);
    const hasSums = sums.some((v) => v !== null);
    const columnHeaders = (data.headerRows?.length ? data.headerRows : [columns]).map((header) =>
      exportColumns.map((_, i) => formatExportTextDates(header[i] ?? "")),
    );
    const headerRowCount = columnHeaders.length;
    const note = data.note?.trim() ? formatExportTextDates(data.note.trim()) : null;
    const heading = [title ? formatExportTextDates(title) : null, note].filter(Boolean).join(" · ");
    const totalDefs = data.totalRows ?? [];
    const totalSpan = (t: { labelSpan?: number }) =>
      Math.max(1, Math.min(t.labelSpan ?? 1, colCount));
    const footerDefs = data.footerRows ?? [];
    const levels = data.rowLevels;
    const grouped = Boolean(levels?.some((l) => l > 0));
    // skutečná Excel tabulka jde použít jen u jednořádkové hlavičky bez seskupení
    const useTable = headerRowCount === 1 && rows.length > 0 && !grouped;

    const ExcelJS = await loadExcelJs();

    const valueFor = (v: ExportCell, i: number): Date | number | string => {
      if (dates[i]?.isDate) {
        const parsed = parseDateValue(v);
        if (parsed) return parsed.date;
      }
      const normalized = cell(v);
      if (typeof normalized === "number") return normalizeExportNumber(normalized, formats[i]);
      if (normalized instanceof Date) return formatUserDateTime(normalized);
      return normalized as string;
    };

    const titleRow = heading ? 1 : 0;
    const firstHeaderRow = titleRow + 1;
    const headerRow = firstHeaderRow + headerRowCount - 1;
    const firstDataRow = headerRow + 1;
    const lastDataRow = headerRow + rows.length;
    const summaryRowNum = hasSums ? lastDataRow + 1 : 0;
    const customTotalsStart = (summaryRowNum || lastDataRow) + 1;
    const tableLastRow = customTotalsStart + totalDefs.length - 1;
    const footerStart = footerDefs.length ? tableLastRow + 2 : 0;

    const book = new ExcelJS.Workbook();
    const sheet = book.addWorksheet(worksheetName(formatExportTextDates(title ?? "Data")), {
      views: [{ state: "frozen", ySplit: headerRow }],
      properties: { outlineProperties: { summaryBelow: false, summaryRight: false } },
    });

    if (heading) {
      const row = sheet.getRow(1);
      row.getCell(1).value = heading;
      if (colCount > 1) sheet.mergeCells(1, 1, 1, colCount);
    }

    if (useTable) {
      // unikátní názvy sloupců – Excel je v tabulce vyžaduje
      const used = new Set<string>();
      const tableColumns = columnHeaders[0].map((label, i) => {
        const base = (label || `Sloupec ${i + 1}`).trim() || `Sloupec ${i + 1}`;
        let name = base;
        let n = 2;
        while (used.has(name.toLowerCase())) name = `${base} (${n++})`;
        used.add(name.toLowerCase());
        return {
          name,
          filterButton: true,
          ...(hasSums
            ? i === 0
              ? { totalsRowLabel: "Spolu" }
              : sums[i] !== null
                ? { totalsRowFunction: "sum" as const }
                : { totalsRowLabel: "" }
            : {}),
        };
      });
      sheet.addTable({
        name: `Tabulka${Math.abs(hashCode(filename)) % 100000}`,
        ref: `A${firstHeaderRow}`,
        headerRow: true,
        totalsRow: hasSums,
        style: { theme: "TableStyleLight9", showRowStripes: true, showColumnStripes: false },
        columns: tableColumns,
        rows: rows.map((r) => exportColumns.map((_, i) => valueFor(r[i], i))),
      });
    } else {
      columnHeaders.forEach((header, i) => {
        const row = sheet.getRow(firstHeaderRow + i);
        header.forEach((value, c) => {
          row.getCell(c + 1).value = value;
        });
      });
      rows.forEach((r, i) => {
        const row = sheet.getRow(firstDataRow + i);
        exportColumns.forEach((_, c) => {
          row.getCell(c + 1).value = valueFor(r[c], c);
        });
      });
      if (hasSums) {
        const row = sheet.getRow(summaryRowNum);
        exportColumns.forEach((_, c) => {
          if (c === 0) row.getCell(1).value = "Spolu";
          else if (sums[c] !== null)
            row.getCell(c + 1).value = normalizeExportNumber(sums[c] as number, formats[c]);
        });
      }
      if (rows.length)
        sheet.autoFilter = {
          from: { row: headerRow, column: 1 },
          to: { row: lastDataRow, column: colCount },
        };
    }

    // součtové řádky se sloučeným popiskem (stejné jako patička gridu)
    totalDefs.forEach((t, i) => {
      const rowNum = customTotalsStart + i;
      const row = sheet.getRow(rowNum);
      const span = totalSpan(t);
      row.getCell(1).value = t.label;
      t.cells.forEach((v, ci) => {
        const c = span + ci;
        if (c >= colCount) return;
        row.getCell(c + 1).value = valueFor(v, c);
      });
      if (span > 1) sheet.mergeCells(rowNum, 1, rowNum, span);
    });

    // rekapitulace pod tabulkou (oddělená prázdným řádkem)
    footerDefs.forEach((f, i) => {
      const row = sheet.getRow(footerStart + i);
      row.getCell(1).value = f.label;
      if (f.value !== null && f.value !== undefined)
        row.getCell(colCount).value =
          typeof f.value === "number" ? normalizeExportNumber(f.value, f.numberFormat) : f.value;
    });

    const HEADER_FILL = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8EAEE" },
    } as const;
    const TOTAL_FILL = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDCE3F0" },
    } as const;

    const lastRow = Math.max(tableLastRow, footerStart + footerDefs.length - 1, 1);
    for (let r = 1; r <= lastRow; r++) {
      const row = sheet.getRow(r);
      const isNote = r === titleRow;
      const isHeader = r >= firstHeaderRow && r <= headerRow;
      const isSummary = summaryRowNum > 0 && r === summaryRowNum;
      const totalDef =
        totalDefs.length && r >= customTotalsStart && r <= tableLastRow
          ? totalDefs[r - customTotalsStart]
          : null;
      const footerDef = footerStart > 0 && r >= footerStart ? footerDefs[r - footerStart] : null;
      const inTable = r >= firstHeaderRow && r <= tableLastRow;
      const isData = r >= firstDataRow && r <= lastDataRow;

      for (let c = 1; c <= colCount; c++) {
        const target = row.getCell(c);
        const isNumber = typeof target.value === "number";
        const isDateCell = target.value instanceof Date;
        if (isDateCell) target.numFmt = excelDateFormat(undefined, dates[c - 1]?.hasTime ?? false);
        else if (footerDef && isNumber)
          target.numFmt = withDashZero(footerDef.numberFormat ?? formats[c - 1] ?? NUM_FMT);
        else if (isNumber && inTable && numeric[c - 1])
          target.numFmt = withDashZero(formats[c - 1] ?? NUM_FMT);

        const totalLabelCell = totalDef ? c <= totalSpan(totalDef) : false;
        target.alignment = {
          vertical: "middle",
          horizontal: isHeader
            ? "center"
            : isNote
              ? "left"
              : totalLabelCell || isNumber || isDateCell
                ? "right"
                : "left",
          wrapText: (isHeader && !isNumber) || isNote,
        };
        if (inTable && !useTable) target.border = TABLE_BORDER_EXCELJS;
        if (inTable && useTable && (isSummary || totalDef)) target.border = TABLE_BORDER_EXCELJS;
        if (isHeader && !useTable) target.fill = HEADER_FILL;
        if (isHeader && useTable) target.fill = HEADER_FILL;
        if (isSummary || totalDef) target.fill = TOTAL_FILL;
        target.font = {
          bold:
            isHeader ||
            isNote ||
            isSummary ||
            Boolean(totalDef) ||
            Boolean(footerDef?.bold || footerDef?.warn),
          ...(footerDef?.warn ? { color: { argb: "FFBE1E2D" } } : {}),
          ...(isNote ? { size: 12 } : {}),
        };
      }

      if (isData && grouped) {
        const level = levels?.[r - firstDataRow];
        if (typeof level === "number" && level > 0) row.outlineLevel = Math.min(7, level);
      }
    }

    const MAX_W = 60;
    const MIN_W = 10;
    const widths = exportColumns.map((label, i) =>
      Math.min(
        MAX_W,
        dates[i]?.isDate
          ? Math.max(
              label.length + 4,
              ...columnHeaders.map((header) => String(header[i] ?? "").length + 4),
              MIN_W,
              dates[i].hasTime ? 19 : 13,
            )
          : Math.max(
              label.length + 4,
              ...columnHeaders.map((header) => String(header[i] ?? "").length + 4),
              MIN_W,
              ...rows.map((r) =>
                numeric[i] && typeof r[i] === "number"
                  ? fmtNumber(r[i] as number).length + (formats[i]?.includes('"') ? 7 : 3)
                  : String(cell(r[i])).length + 2,
              ),
            ),
      ),
    );
    widths.forEach((w, i) => {
      sheet.getColumn(i + 1).width = w;
    });

    const ROW_H = 16;
    const HEAD_H = 22;
    const titleWidth = widths.reduce((a, w) => a + w, 0);
    const titleLines = heading
      ? Math.max(1, Math.ceil(heading.length / Math.max(20, titleWidth - 2)))
      : 1;
    for (let r = 1; r <= lastRow; r++) {
      sheet.getRow(r).height =
        r === titleRow ? Math.max(HEAD_H, titleLines * 16 + 6) : r <= headerRow ? HEAD_H : ROW_H;
    }

    const buffer = (await book.xlsx.writeBuffer()) as ArrayBuffer;
    downloadXlsx(buffer, `${filename}.xlsx`);
  };

  const exportPdf = async () => {
    const data = await getData();
    const { columns, rows } = data;
    const exportColumns = columns.map(formatExportTextDates);
    const headerRows = (data.headerRows?.length ? data.headerRows : [exportColumns]).map((header) =>
      exportColumns.map((_, index) => formatExportTextDates(header[index] ?? "")),
    );
    const numeric = numericColumns(data);
    const dates = dateColumns(data);
    const sums = data.summarize === false ? columns.map(() => null) : columnSums(data, numeric);
    const hasSums = sums.some((v) => v !== null);
    const text = (v: ExportCell, i: number) => {
      const displayed = displayExportCell(v, dates[i]?.isDate ?? false, dates[i]?.hasTime ?? false);
      return typeof displayed === "number"
        ? numeric[i]
          ? fmtNumber(displayed)
          : String(displayed)
        : String(cell(displayed));
    };

    const [{ jsPDF }, autoTableMod, fonts] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
      loadPdfFonts(),
    ]);
    const autoTable = autoTableMod.default;

    /** Vytvorí A4 dokument s pripravenými fontmi. */
    const makeDoc = (orientation: "portrait" | "landscape") => {
      const d = new jsPDF({ orientation, unit: "mm", format: "a4" });
      d.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
      d.addFont("Roboto-Regular.ttf", "Roboto", "normal");
      d.addFileToVFS("Roboto-Bold.ttf", fonts.bold);
      d.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      d.setFont("Roboto", "normal");
      return d;
    };

    const groupCount = Math.max(1, Math.min(data.pdfColumnGroups ?? 1, rows.length || 1));
    const rowsPerGroup = Math.ceil(rows.length / groupCount);
    const pdfHeaders = headerRows.map((header) =>
      Array.from({ length: groupCount }, () => header).flat(),
    );
    const lastPdfHeader = pdfHeaders.at(-1) ?? [];
    const pdfRows = Array.from({ length: rowsPerGroup }, (_, rowIndex) =>
      Array.from({ length: groupCount }, (_, groupIndex) => {
        const row = rows[groupIndex * rowsPerGroup + rowIndex];
        return columns.map((_, columnIndex) => (row ? text(row[columnIndex], columnIndex) : ""));
      }).flat(),
    );

    // primárne tlačíme na výšku – na šírku len ak sa obsah na výšku nezmestí
    const probe = makeDoc("portrait");
    probe.setFontSize(8);
    const measure = (v: unknown) => probe.getTextWidth(String(v ?? ""));
    const colCount = lastPdfHeader.length || columns.length;
    const sample = pdfRows.slice(0, 200);
    let neededWidth = 0;
    for (let i = 0; i < colCount; i++) {
      let w = 0;
      for (const header of pdfHeaders) w = Math.max(w, measure(header[i]));
      for (const row of sample) w = Math.max(w, measure(row[i]));
      // stĺpec sa môže zalomiť, preto obmedzíme jeho nárok na šírku
      neededWidth += Math.min(w + 3.6, 45);
    }
    const portraitUsable = probe.internal.pageSize.getWidth() - 20;
    const landscape = neededWidth > portraitUsable;
    const doc = landscape ? makeDoc("landscape") : probe;

    const heading = formatExportTextDates(title ?? filename);
    const pageWidth = doc.internal.pageSize.getWidth();

    // součtové řádky tabulky – popisek sloučený a zarovnaný doprava jako v gridu
    const pdfTotals = (data.totalRows ?? []).map((t) => {
      const span = Math.max(1, Math.min(t.labelSpan ?? 1, columns.length));
      return [
        { content: t.label, colSpan: span, styles: { halign: "right" as const } },
        ...columns.slice(span).map((_, i) => ({
          content: text(t.cells[i], span + i),
          styles: { halign: numeric[span + i] ? ("right" as const) : ("left" as const) },
        })),
      ];
    });

    const pdfFoot = [
      ...pdfTotals,
      ...(hasSums
        ? [
            columns.map((_, i) =>
              i === 0 ? "Spolu" : sums[i] === null ? "" : fmtNumber(sums[i] as number),
            ),
          ]
        : []),
    ];

    autoTable(doc, {
      head: pdfHeaders,
      body: pdfRows,
      foot: pdfFoot.length ? (pdfFoot as never) : undefined,

      startY: 22,
      margin: { top: 22, right: 10, bottom: 14, left: 10 },
      styles: {
        font: "Roboto",
        fontSize: 8,
        cellPadding: 1.6,
        overflow: "linebreak",
        lineColor: [212, 212, 216],
        lineWidth: 0.1,
      },
      headStyles: {
        font: "Roboto",
        fontStyle: "bold",
        fillColor: [244, 244, 245],
        textColor: [24, 24, 27],
      },
      footStyles: {
        font: "Roboto",
        fontStyle: "bold",
        fillColor: [228, 228, 231],
        textColor: [24, 24, 27],
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: Object.fromEntries(
        lastPdfHeader.map((_, i) => [
          i,
          { halign: numeric[i % columns.length] ? ("right" as const) : ("left" as const) },
        ]),
      ),
      didDrawPage: () => {
        doc.setFont("Roboto", "bold");
        doc.setFontSize(12);
        doc.text(heading, 10, 12);
        doc.setFont("Roboto", "normal");
        doc.setFontSize(8);
        doc.setTextColor(110);
        const meta = [
          `${formatDateTime(new Date())} · ${rows.length} záznamů`,
          data.note?.trim() || null,
        ]
          .filter(Boolean)
          .join(" · ");
        doc.text(meta, 10, 17);
        const page = doc.getNumberOfPages();
        doc.text(String(page), pageWidth - 10, 17, { align: "right" });
        doc.setTextColor(24);
      },
    });

    doc.save(`${filename}.pdf`);
  };

  const exportHtml = async () => {
    const data = await getData();
    const { columns, rows } = data;
    const numeric = numericColumns(data);
    const dates = dateColumns(data);
    const sums = columnSums(data, numeric);
    const hasSums = sums.some((v) => v !== null);
    const exportColumns = columns.map(formatExportTextDates);
    const headerRows = (data.headerRows?.length ? data.headerRows : [exportColumns]).map((header) =>
      exportColumns.map((_, index) => formatExportTextDates(header[index] ?? "")),
    );
    const heading = formatExportTextDates(title ?? filename);
    const esc = (v: unknown) =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    const td = (v: ExportCell, i: number, tag = "td") =>
      `<${tag}${numeric[i] ? ' class="num"' : ""}>${esc(
        typeof v === "number"
          ? fmtNumber(v)
          : displayExportCell(v, dates[i]?.isDate ?? false, dates[i]?.hasTime ?? false),
      )}</${tag}>`;
    // součtové řádky se sloučeným popiskem zarovnaným doprava
    const htmlTotals = (data.totalRows ?? [])
      .map((t) => {
        const span = Math.max(1, Math.min(t.labelSpan ?? 1, columns.length));
        return `<tr><td colspan="${span}" class="num">${esc(t.label)}</td>${columns
          .slice(span)
          .map((_, i) => td(t.cells[i], span + i))
          .join("")}</tr>`;
      })
      .join("");

    const html = `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><title>${esc(heading)}</title>
<style>
body{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;margin:24px;color:#18181b}
h1{font-size:18px;margin:0 0 4px}
.meta{font-size:12px;color:#71717a;margin-bottom:16px}
table{border-collapse:collapse;font-size:12px;width:100%}
th,td{border:1px solid #d4d4d8;padding:4px 8px;text-align:left}
th{background:#f4f4f5}
tbody tr:nth-child(even){background:#fafafa}
tfoot td{background:#e4e4e7;font-weight:600}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
</style></head><body>
<h1>${esc(heading)}</h1>
<div class="meta">${esc(formatDateTime(new Date()))} · ${rows.length} záznamů${data.note?.trim() ? ` · ${esc(data.note.trim())}` : ""}</div>
<table>
<thead>${headerRows.map((header) => `<tr>${header.map((c, i) => td(c, i, "th")).join("")}</tr>`).join("")}</thead>
<tbody>${rows.map((r) => `<tr>${columns.map((_, i) => td(r[i], i)).join("")}</tr>`).join("")}</tbody>
${
  htmlTotals || hasSums
    ? `<tfoot>${htmlTotals}${
        hasSums
          ? `<tr>${columns.map((_, i) => td(i === 0 ? "Spolu" : sums[i], i)).join("")}</tr>`
          : ""
      }</tfoot>`
    : ""
}

</table></body></html>`;

    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label="Stáhnout"
          title="Stáhnout"
          disabled={disabled}
          className={`grid-toolbar-control grid-toolbar-icon-control shrink-0 ${className}`}
          style={{ fontSize }}
        >
          <Download className="size-[1.25em]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[14em] p-[0.35em]" style={{ fontSize }}>
        <button
          type="button"
          onClick={() => void exportExcel()}
          className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
        >
          <img src={excelIcon} alt="" className="size-[1.5em]" />
          Stáhnout do Excelu
        </button>
        <button
          type="button"
          onClick={() => void (pdfExport ? pdfExport() : exportPdf())}
          className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
        >
          <img src={pdfIcon} alt="" className="size-[1.5em]" />
          Stáhnout do PDF
        </button>
        {html && (
          <button
            type="button"
            onClick={() => void exportHtml()}
            className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
          >
            <FileCode2 className="size-[1.5em] text-muted-foreground" />
            Stáhnout do HTML
          </button>
        )}
        {extraPdfExport && (
          <>
            <div className="my-[0.3em] border-t" />
            {(Array.isArray(extraPdfExport) ? extraPdfExport : [extraPdfExport]).map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => void item.onExport()}
                className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
              >
                {item.icon ? (
                  <span className="size-[1.5em] text-muted-foreground">{item.icon}</span>
                ) : (
                  <img src={pdfIcon} alt="" className="size-[1.5em]" />
                )}
                {item.label}
              </button>
            ))}
          </>
        )}

        {extraExcelExport && (
          <>
            <div className="my-[0.3em] border-t" />
            <button
              type="button"
              onClick={() => void extraExcelExport.onExport()}
              className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
            >
              <img src={excelIcon} alt="" className="size-[1.5em]" />
              {extraExcelExport.label}
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

/**
 * Sestaví data pro export z konfigurace sloupců gridu (bere jen viditelné sloupce).
 */
export function buildGridExport<Row, Id extends string>(
  cols: { columns: { id: Id; label: string }[]; visible: Record<Id, boolean> },
  rows: Row[],
  value: (row: Row, id: Id) => ExportCell,
): GridExportData {
  const visibleCols = cols.columns.filter((c) => cols.visible[c.id]);
  return {
    columns: visibleCols.map((c) => c.label),
    rows: rows.map((r) => visibleCols.map((c) => value(r, c.id))),
  };
}
