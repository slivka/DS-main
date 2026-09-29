import type { Alignment, Workbook } from "exceljs";
import JSZip from "jszip";
import { excelDateFormat, formatUserDate, formatUserDateTime } from "./date-time-preferences";
import { nzero, roundTo } from "./format";

export type ExportCell = string | number | Date | null | undefined;

export type ExcelColumnType =
  | "text"
  | "number"
  | "integer"
  | "date"
  | "datetime"
  | "percent"
  | "year";

export interface ExcelColumnMeta {
  type: ExcelColumnType;
  align?: "left" | "right" | "center";
  numFmt?: string;
  total?: "sum" | "count" | "none";
  /** Preferovaná šířka v znacích. */
  width?: number;
}

export interface ExcelExportMeta {
  company?: string;
  period?: string;
  user?: string;
  filters?: string[];
}

export interface GridExportData {
  columns: string[];
  headerRows?: string[][];
  rows: ExportCell[][];
  columnMeta?: ExcelColumnMeta[];
  pdfColumnGroups?: number;
  summarize?: boolean;
  /** @deprecated Použijte columnMeta[].numFmt. Zachováno kvůli kompatibilitě PDF/HTML exportů. */
  excelNumberFormats?: (string | null)[];
  rowLevels?: number[];
  /** Souhrnný řádek skupiny je pod svými dětmi (Excel outline summaryBelow). */
  outlineSummaryBelow?: boolean;
  /**
   * Souhrnné řádky stromu: `row` je index souhrnného řádku v `rows`,
   * `from`–`to` rozsah řádků jeho potomků. Sčítané sloupce dostanou vzorec SUBTOTAL(9, …).
   */
  subtotalRows?: { row: number; from: number; to: number }[];
  note?: string | null;
  footerRows?: {
    label: string;
    value?: number | string | null;
    bold?: boolean;
    warn?: boolean;
    numberFormat?: string | null;
  }[];
  totalRows?: { label: string; labelSpan?: number; cells: ExportCell[] }[];
}

export interface BuildExcelWorkbookOptions {
  title: string;
  exportName?: string;
  meta?: ExcelExportMeta;
  totalLabel?: string;
  created?: Date;
  locale?: string;
  texts?: { parametersSheet: string; parameter: string; value: string; reportName: string; company: string; period: string; exportedAt: string; user: string; activeFilters: string; pageFooter: string; fallbackColumn: (index: number) => string };
}

export const EXCEL_NUMBER_FORMAT = "#,##0.00;[Red]-#,##0.00";
export const EXCEL_INTEGER_FORMAT = "#,##0";
export const EXCEL_YEAR_FORMAT = "0";
export const EXCEL_PERCENT_FORMAT = "0.00%";

const EXCEL_MIN_COLUMN_WIDTH = 8;
const EXCEL_MAX_COLUMN_WIDTH = 100;
const EXCEL_LONG_TEXT_LENGTH = 100;
const EXCEL_FILTER_WIDTH = 3;
const EXCEL_CELL_PADDING = 2;

const NAVY_TRUST = {
  primary: "FF385A8A",
  header: "FFE7E9ED",
  headerForeground: "FF27272A",
  total: "FFDCE3F0",
  muted: "FF71717A",
  border: "FFC4CBD4",
} as const;

let excelJsPromise: Promise<typeof import("exceljs")> | null = null;
function loadExcelJs() {
  excelJsPromise ??= import("exceljs/dist/exceljs.min.js").then(
    (module) => ((module as { default?: unknown }).default ?? module) as typeof import("exceljs"),
  );
  return excelJsPromise;
}

const emptyCell = (value: ExportCell) => (value === null || value === undefined || value === "" ? null : value);

function safeWorksheetName(title: string) {
  const safe = title.replace(/[\\/:?*[\]]/g, "-").replace(/^'+|'+$/g, "").trim();
  return (safe || "Data").slice(0, 31);
}

function tableName(value: string) {
  const cleaned = value.normalize("NFKD").replace(/[^A-Za-z0-9_]/g, "").slice(0, 240);
  return /^[A-Za-z]/.test(cleaned) ? cleaned : `Tabulka_${cleaned || "Export"}`;
}

function uniqueHeaders(data: GridExportData, fallbackColumn = (index: number) => `Sloupec ${index}`) {
  const rows = data.headerRows?.length ? data.headerRows : [data.columns];
  const used = new Set<string>();
  return data.columns.map((fallback, index) => {
    const parts = rows
      .map((row) => String(row[index] ?? "").trim())
      .filter((part, partIndex, all) => part && all.indexOf(part) === partIndex);
    const raw = parts.join(" – ") || fallback || fallbackColumn(index + 1);
    const base = raw.replace(/[[\]#']/g, " ").replace(/\s+/g, " ").trim().slice(0, 255) || fallbackColumn(index + 1);
    let name = base;
    let suffix = 2;
    while (used.has(name.toLocaleLowerCase("cs"))) {
      const ending = ` (${suffix++})`;
      name = `${base.slice(0, 255 - ending.length)}${ending}`;
    }
    used.add(name.toLocaleLowerCase("cs"));
    return name;
  });
}

function parseDate(value: ExportCell) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string") return null;
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
  if (iso) {
    const [, year, month, day, hour, minute, second] = iso;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour ?? 0),
      Number(minute ?? 0),
      Number(second ?? 0),
    );
  }
  const cz = /^(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})(?:[ ,]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/.exec(value.trim());
  if (!cz) return null;
  const [, day, month, year, hour, minute, second] = cz;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour ?? 0),
    Number(minute ?? 0),
    Number(second ?? 0),
  );
}

function inferredType(data: GridExportData, index: number): ExcelColumnType {
  const values = data.rows.map((row) => row[index]).filter((value) => value !== "" && value != null);
  return values.length > 0 && values.every((value) => typeof value === "number") ? "number" : "text";
}

function resolveColumnMeta(data: GridExportData) {
  return data.columns.map((_, index): Required<Pick<ExcelColumnMeta, "type" | "align" | "total">> & ExcelColumnMeta => {
    const source = data.columnMeta?.[index];
    const type = source?.type ?? inferredType(data, index);
    const numeric = ["number", "integer", "percent", "year"].includes(type);
    return {
      ...source,
      type,
      align: source?.align ?? (numeric ? "right" : "left"),
      total: source?.total ?? (numeric && data.summarize !== false ? "sum" : "none"),
    };
  });
}

function numberFormat(meta: ExcelColumnMeta) {
  if (meta.numFmt) return meta.numFmt;
  if (meta.type === "integer") return EXCEL_INTEGER_FORMAT;
  if (meta.type === "year") return EXCEL_YEAR_FORMAT;
  if (meta.type === "percent") return EXCEL_PERCENT_FORMAT;
  return EXCEL_NUMBER_FORMAT;
}

function displayValue(value: ExportCell, meta: ExcelColumnMeta, locale = "cs-CZ") {
  if (value === null || value === undefined || value === "") return "";
  if (meta.type === "date" || meta.type === "datetime") {
    const date = parseDate(value);
    if (date) return meta.type === "datetime" ? formatUserDateTime(date) : formatUserDate(date);
  }
  if (typeof value === "number") {
    const normalized = nzero(roundTo(value, meta.type === "integer" || meta.type === "year" ? 0 : 2));
    if (meta.type === "percent") {
      return normalized.toLocaleString(locale, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return normalized.toLocaleString(locale, {
      minimumFractionDigits: meta.type === "number" ? 2 : 0,
      maximumFractionDigits: meta.type === "number" ? 2 : 0,
    });
  }
  return String(value);
}

function summedColumnValue(data: GridExportData, index: number, meta: ExcelColumnMeta) {
  const decimals = meta.type === "integer" || meta.type === "year" ? 0 : 2;
  const sum = data.rows.reduce((total, row) => {
    const value = row[index];
    return typeof value === "number" && Number.isFinite(value)
      ? total + nzero(roundTo(value, decimals))
      : total;
  }, 0);
  return nzero(roundTo(sum, decimals));
}

function excelValue(value: ExportCell, meta: ExcelColumnMeta) {
  if (meta.type === "date" || meta.type === "datetime") {
    const date = parseDate(value);
    if (!date) return emptyCell(value);
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      meta.type === "datetime" ? date.getHours() : 0,
      meta.type === "datetime" ? date.getMinutes() : 0,
      meta.type === "datetime" ? date.getSeconds() : 0,
      meta.type === "datetime" ? date.getMilliseconds() : 0,
    ));
  }
  if (typeof value === "number") {
    const decimals = meta.type === "integer" || meta.type === "year" ? 0 : 2;
    return nzero(roundTo(value, decimals));
  }
  return emptyCell(value);
}

function excelColumnName(name: string) {
  return name.replace(/]/g, "]]" );
}

/** Sestaví kompletní Excel sešit bez vazby na React nebo DOM. */
export async function buildExcelWorkbook(data: GridExportData, options: BuildExcelWorkbookOptions) {
  const ExcelJS = await loadExcelJs();
  const created = options.created ?? new Date();
  const title = options.title.trim() || "Export";
  const headers = uniqueHeaders(data, options.texts?.fallbackColumn);
  const meta = resolveColumnMeta(data);
  const totalLabel = options.totalLabel ?? "Celkem";
  const totalsRow = meta.some((column) => column.total !== "none") && data.summarize !== false;
  const firstHeaderRow = 4;
  const firstDataRow = firstHeaderRow + 1;
  const tableLastRow = firstHeaderRow + data.rows.length + (totalsRow ? 1 : 0);
  const name = tableName(options.exportName ?? title);

  const workbook = new ExcelJS.Workbook();
  workbook.title = title;
  workbook.creator = options.meta?.user || "Slivka Design System";
  workbook.company = options.meta?.company ?? "";
  workbook.created = created;
  workbook.modified = created;
  workbook.calcProperties.fullCalcOnLoad = true;

  const sheet = workbook.addWorksheet(safeWorksheetName(title), {
    properties: { outlineProperties: { summaryBelow: data.outlineSummaryBelow === true, summaryRight: false } },
    views: [{ state: "frozen", ySplit: firstHeaderRow }],
  });

  sheet.mergeCells(1, 1, 1, Math.max(1, headers.length));
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: NAVY_TRUST.primary } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 22;

  const tableColumns = headers.map((header, index) => {
    const total = meta[index]?.total ?? "none";
    return {
      name: header,
      filterButton: true,
      ...(index === 0 && totalsRow ? { totalsRowLabel: totalLabel } : {}),
      ...(index > 0 && total === "sum" ? { totalsRowFunction: "sum" as const } : {}),
      ...(index > 0 && total === "count" ? { totalsRowFunction: "count" as const } : {}),
    };
  });

  const subtotalByRow = new Map(
    (data.subtotalRows ?? [])
      .filter((entry) => entry.from <= entry.to && entry.to < data.rows.length && entry.row < data.rows.length)
      .map((entry) => [entry.row, entry]),
  );
  sheet.addTable({
    name,
    ref: `A${firstHeaderRow}`,
    headerRow: true,
    totalsRow,
    style: { theme: "TableStyleLight1", showRowStripes: false, showColumnStripes: false },
    columns: tableColumns,
    rows: data.rows.map((row, rowIndex) =>
      headers.map((_, index) => {
        const subtotal = subtotalByRow.get(rowIndex);
        const value = excelValue(row[index], meta[index]);
        if (!subtotal || index === 0 || meta[index]?.total !== "sum") return value;
        const letter = sheet.getColumn(index + 1).letter;
        return {
          formula: `SUBTOTAL(9,${letter}${firstDataRow + subtotal.from}:${letter}${firstDataRow + subtotal.to})`,
          result: typeof value === "number" ? value : 0,
        };
      }),
    ),
  });

  const requestedLevels = (data.rowLevels ?? []).map((level) => Math.max(0, Math.min(7, Math.trunc(level))));
  const hasSummaryBoundary = requestedLevels.some((level) => level === 0);
  const appliedLevels = hasSummaryBoundary ? requestedLevels : [];
  const maxOutlineLevel = Math.max(0, ...appliedLevels);
  appliedLevels.forEach((level, rowIndex) => {
    if (level > 0 && rowIndex < data.rows.length) sheet.getRow(firstDataRow + rowIndex).outlineLevel = level;
  });
  sheet.properties.outlineLevelRow = maxOutlineLevel;

  const customTotalsStart = tableLastRow + 2;
  (data.totalRows ?? []).forEach((definition, rowIndex) => {
    const rowNumber = customTotalsStart + rowIndex;
    const row = sheet.getRow(rowNumber);
    const labelSpan = Math.max(1, Math.min(definition.labelSpan ?? 1, headers.length));
    row.getCell(1).value = definition.label;
    if (labelSpan > 1) sheet.mergeCells(rowNumber, 1, rowNumber, labelSpan);
    definition.cells.forEach((value, cellIndex) => {
      const columnIndex = labelSpan + cellIndex;
      if (columnIndex >= headers.length) return;
      const columnMeta = meta[columnIndex];
      if (columnMeta.total !== "sum" && (value === null || value === undefined || value === "")) return;
      row.getCell(columnIndex + 1).value =
        columnMeta.total === "sum"
          ? { formula: `SUBTOTAL(109,${name}[${excelColumnName(headers[columnIndex])}])` }
          : excelValue(value, columnMeta);
    });
  });

  const footerStart = customTotalsStart + (data.totalRows?.length ?? 0) + 1;
  (data.footerRows ?? []).forEach((definition, rowIndex) => {
    const row = sheet.getRow(footerStart + rowIndex);
    row.getCell(1).value = definition.label;
    if (definition.value !== null && definition.value !== undefined && definition.value !== "") {
      row.getCell(headers.length).value = definition.value;
    }
    row.font = { name: "Arial", bold: definition.bold || definition.warn };
    if (definition.warn) row.font = { ...row.font, color: { argb: "FFBE1E2D" } };
  });

  for (let rowIndex = firstHeaderRow; rowIndex <= tableLastRow; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    const isHeader = rowIndex === firstHeaderRow;
    const isTableTotal = totalsRow && rowIndex === tableLastRow;
    row.height = isHeader ? 24 : 18;
    for (let columnIndex = 0; columnIndex < headers.length; columnIndex += 1) {
      const target = row.getCell(columnIndex + 1);
      const columnMeta = meta[columnIndex];
      const horizontal = columnMeta.align as Alignment["horizontal"];
      target.font = {
        name: "Arial",
        bold: isHeader || isTableTotal,
        ...(isHeader ? { color: { argb: NAVY_TRUST.headerForeground } } : {}),
      };
      target.alignment = {
        horizontal,
        vertical: "middle",
        wrapText: isHeader || (columnMeta.type === "text" && (sheet.getColumn(columnIndex + 1).width ?? 0) >= 60),
      };
      if (isHeader) target.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_TRUST.header } };
      if (isTableTotal) target.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_TRUST.total } };
      target.border = {
        top: { style: "thin", color: { argb: NAVY_TRUST.border } },
        bottom: { style: "thin", color: { argb: NAVY_TRUST.border } },
        left: { style: "thin", color: { argb: NAVY_TRUST.border } },
        right: { style: "thin", color: { argb: NAVY_TRUST.border } },
      };
      if (["number", "integer", "percent", "year"].includes(columnMeta.type)) {
        target.numFmt = numberFormat(columnMeta);
      } else if (columnMeta.type === "date" || columnMeta.type === "datetime") {
        target.numFmt = excelDateFormat(undefined, columnMeta.type === "datetime");
      }
    }
  }

  (data.totalRows ?? []).forEach((definition, rowIndex) => {
    const rowNumber = customTotalsStart + rowIndex;
    const labelSpan = Math.max(1, Math.min(definition.labelSpan ?? 1, headers.length));
    const populatedColumns = new Set<number>([1]);
    definition.cells.forEach((value, cellIndex) => {
      const columnIndex = labelSpan + cellIndex;
      const columnMeta = meta[columnIndex];
      if (columnIndex < headers.length && columnMeta && (columnMeta.total === "sum" || (value !== null && value !== undefined && value !== ""))) {
        populatedColumns.add(columnIndex + 1);
      }
    });
    populatedColumns.forEach((columnNumber) => {
      const target = sheet.getCell(rowNumber, columnNumber);
      const columnMeta = meta[columnNumber - 1];
      target.font = { name: "Arial", bold: true };
      target.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_TRUST.total } };
      target.alignment = { horizontal: columnMeta?.align, vertical: "middle" };
      if (columnMeta && ["number", "integer", "percent", "year"].includes(columnMeta.type)) target.numFmt = numberFormat(columnMeta);
    });
  });

  const sampledRows = data.rows.length <= 2_000
    ? data.rows
    : Array.from({ length: 2_000 }, (_, index) => data.rows[Math.floor((index * data.rows.length) / 2_000)]);
  headers.forEach((header, index) => {
    const columnMeta = meta[index];
    const displayedValues = sampledRows.map((row) => displayValue(row[index], columnMeta));
    const contentLengths = displayedValues.map((value) => value.length);
    const automaticTotalLength = columnMeta.total === "sum"
      ? displayValue(summedColumnValue(data, index, columnMeta), columnMeta).length
      : columnMeta.total === "count"
        ? displayValue(data.rows.length, { ...columnMeta, type: "integer" }).length
        : index === 0 && totalsRow
          ? totalLabel.length
          : 0;
    const totalLengths = (data.totalRows ?? []).map((row) => {
      const labelSpan = Math.max(1, Math.min(row.labelSpan ?? 1, headers.length));
      if (index === 0) return row.label.length;
      if (index < labelSpan) return 0;
      const value = row.cells[index - labelSpan];
      const displayed = columnMeta.total === "sum"
        ? summedColumnValue(data, index, columnMeta)
        : value;
      return displayValue(displayed, columnMeta).length;
    });
    totalLengths.push(automaticTotalLength);
    const measured = Math.max(
      EXCEL_MIN_COLUMN_WIDTH,
      header.length + EXCEL_FILTER_WIDTH,
      ...contentLengths.map((length) => length + EXCEL_CELL_PADDING),
      ...totalLengths.map((length) => length + EXCEL_CELL_PADDING),
    );
    const preferred = columnMeta.width === undefined ? measured : Math.max(measured, columnMeta.width);
    const width = Math.max(EXCEL_MIN_COLUMN_WIDTH, Math.min(EXCEL_MAX_COLUMN_WIDTH, preferred));
    sheet.getColumn(index + 1).width = width;
    if (columnMeta.type === "text") {
      for (let rowIndex = firstDataRow; rowIndex < firstDataRow + data.rows.length; rowIndex += 1) {
        const displayed = displayValue(data.rows[rowIndex - firstDataRow]?.[index], columnMeta, options.locale);
        if (displayed.length <= EXCEL_LONG_TEXT_LENGTH) continue;
        const cell = sheet.getCell(rowIndex, index + 1);
        cell.alignment = { ...cell.alignment, wrapText: true };
        const row = sheet.getRow(rowIndex);
        row.height = Math.max(row.height ?? 18, Math.ceil(displayed.length / EXCEL_LONG_TEXT_LENGTH) * 18);
      }
    }
  });

  sheet.eachRow((row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      cell.alignment = { ...cell.alignment, vertical: "middle" };
    });
  });

  const totalWidth = sheet.columns.reduce((sum, column) => sum + (column.width ?? 8), 0);
  sheet.pageSetup = {
    paperSize: 9,
    orientation: headers.length > 7 || totalWidth > 100 ? "landscape" : "portrait",
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    printTitlesRow: `${firstHeaderRow}:${firstHeaderRow}`,
    margins: { left: 0.394, right: 0.394, top: 0.394, bottom: 0.394, header: 0.2, footer: 0.2 },
  };
  sheet.headerFooter = { oddFooter: `&L${title}&R${options.texts?.pageFooter ?? "Strana &P z &N"}` };

  const parameterRows = [
    [options.texts?.reportName ?? "Název sestavy", title],
    ...(options.meta?.company ? [[options.texts?.company ?? "Firma", options.meta.company]] : []),
    ...(options.meta?.period ? [[options.texts?.period ?? "Období", options.meta.period]] : []),
    [options.texts?.exportedAt ?? "Exportováno", formatUserDateTime(created)],
    ...(options.meta?.user ? [[options.texts?.user ?? "Uživatel", options.meta.user]] : []),
    ...(options.meta?.filters?.length ? [[options.texts?.activeFilters ?? "Aktivní filtry", options.meta.filters.join("; ")]] : []),
  ];
  const parameterSheet = workbook.addWorksheet(options.texts?.parametersSheet ?? "Parametry exportu", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  parameterSheet.addTable({
    name: `${name.slice(0, 230)}_Parametry`,
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: { theme: "TableStyleLight1", showRowStripes: false, showColumnStripes: false },
    columns: [{ name: options.texts?.parameter ?? "Parametr", filterButton: false }, { name: options.texts?.value ?? "Hodnota", filterButton: false }],
    rows: parameterRows,
  });
  parameterSheet.getColumn(1).width = 22;
  parameterSheet.getColumn(2).width = 60;
  parameterSheet.eachRow((row, rowNumber) => {
    row.height = rowNumber === 1 ? 30 : 20;
    row.eachCell((cell) => {
      cell.font = { name: "Arial", bold: rowNumber === 1 };
      cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
      cell.border = {
        top: { style: "thin", color: { argb: NAVY_TRUST.border } },
        bottom: { style: "thin", color: { argb: NAVY_TRUST.border } },
        left: { style: "thin", color: { argb: NAVY_TRUST.border } },
        right: { style: "thin", color: { argb: NAVY_TRUST.border } },
      };
      if (rowNumber === 1) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_TRUST.header } };
        cell.font = { ...cell.font, color: { argb: NAVY_TRUST.headerForeground } };
      }
    });
  });
  return workbook;
}

function datedFijename(exportName: string, created: Date) {
  const date = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;
  return `${exportName}_${date}.xlsx`;
}

/**
 * Přeskládá děti <sheetPr> do pořadí vyžadovaného schématem OOXML (CT_SheetPr):
 * tabColor → outlinePr → pageSetUpPr. ExcelJS je zapisuje obráceně
 * (pageSetUpPr před outlinePr), což Microsoft Excel při kombinaci fitToPage
 * a outlineProperties odmítne s hláškou „Zjistili jsme problém s obsahem“.
 * Atributy sheetPr i jednotlivých elementů zůstávají beze změny.
 *
 * Vstup:  <sheetPr><pageSetUpPr fitToPage="1"/><outlinePr summaryBelow="0" summaryRight="0"/></sheetPr>
 * Výstup: <sheetPr><outlinePr summaryBelow="0" summaryRight="0"/><pageSetUpPr fitToPage="1"/></sheetPr>
 */
function reorderSheetPrChildren(xml: string) {
  return xml.replace(/<sheetPr\b[^>]*>([\s\S]*?)<\/sheetPr>/g, (match, inner: string) => {
    const openTag = match.slice(0, match.indexOf(">") + 1);
    let rest = inner;
    const extract = (tag: string) => {
      const re = new RegExp(`<${tag}\\b[^>]*/>|<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`);
      const found = rest.match(re);
      if (!found) return "";
      rest = rest.replace(re, "");
      return found[0];
    };
    const tabColor = extract("tabColor");
    const outlinePr = extract("outlinePr");
    const pageSetUpPr = extract("pageSetUpPr");
    return `${openTag}${tabColor}${outlinePr}${pageSetUpPr}${rest}</sheetPr>`;
  });
}

/**
 * Finalizuje buffer XLSX sešitu pro Microsoft Excel (bez vazby na DOM):
 * - odstraní neplatné totalsRowFunction="none" z definic tabulek,
 * - opraví pořadí prvků <sheetPr> (tabColor → outlinePr → pageSetUpPr),
 *   které ExcelJS zapisuje obráceně a Excel pak soubor „opravuje“.
 * Rozsah filtru zapisuje ExcelJS správně – končí posledním datovým řádkem,
 * ne řádkem souhrnů.
 */
export async function finalizeWorkbookBuffer(buffer: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const bytes = buffer instanceof Uint8Array ? new Uint8Array(buffer) : new Uint8Array(buffer);
  const zip = await JSZip.loadAsync(bytes);
  await Promise.all(Object.keys(zip.files).map(async (path) => {
    const entry = zip.file(path);
    if (!entry) return;
    if (/^xl\/tables\/table\d+\.xml$/.test(path)) {
      const xml = await entry.async("text");
      const cleaned = xml
        .replace(/\s+totalsRowFunction="none"/g, "")
        .replace(
          /(<table\b[^>]*\bref="[A-Z]+(\d+):[A-Z]+(\d+)"[^>]*\btotalsRowCount="1"[^>]*>[\s\S]*?<autoFilter\s+ref="([A-Z]+)\d+:([A-Z]+))\d+("[^>]*>)/,
          (_match, prefix: string, start: string, end: string, firstColumn: string, lastColumn: string, suffix: string) =>
            `${prefix}${Number(end) - 1}${suffix}`,
        );
      zip.file(path, cleaned);
    } else if (/^xl\/worksheets\/sheet\d+\.xml$/.test(path)) {
      const xml = await entry.async("text");
      zip.file(path, reorderSheetPrChildren(xml));
    }
  }));
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/** Stáhne hotový sešit v prohlížeči. */
export async function downloadWorkbook(
  workbook: Workbook,
  exportName: string,
  created = workbook.created ?? new Date(),
) {
  const buffer = await workbook.xlsx.writeBuffer();
  const finalized = await finalizeWorkbookBuffer(buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer as ArrayBuffer));
  const finalizedBuffer = finalized.buffer.slice(finalized.byteOffset, finalized.byteOffset + finalized.byteLength) as ArrayBuffer;
  const blob = new Blob([finalizedBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = datedFijename(exportName, created);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}