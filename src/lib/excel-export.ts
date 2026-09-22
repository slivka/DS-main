import type { Alignment, Workbook } from "exceljs";
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
}

export const EXCEL_NUMBER_FORMAT = "#,##0.00;[Red]-#,##0.00";
export const EXCEL_INTEGER_FORMAT = "#,##0";
export const EXCEL_YEAR_FORMAT = "0";
export const EXCEL_PERCENT_FORMAT = "0.00%";

const NAVY_TRUST = {
  primary: "FF385A8A",
  primaryForeground: "FFFFFFFF",
  frost: "FFEFF2F6",
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

function uniqueHeaders(data: GridExportData) {
  const rows = data.headerRows?.length ? data.headerRows : [data.columns];
  const used = new Set<string>();
  return data.columns.map((fallback, index) => {
    const parts = rows
      .map((row) => String(row[index] ?? "").trim())
      .filter((part, partIndex, all) => part && all.indexOf(part) === partIndex);
    const raw = parts.join(" – ") || fallback || `Sloupec ${index + 1}`;
    const base = raw.replace(/[\[\]#']/g, " ").replace(/\s+/g, " ").trim().slice(0, 255) || `Sloupec ${index + 1}`;
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

function displayValue(value: ExportCell, meta: ExcelColumnMeta) {
  if (value === null || value === undefined || value === "") return "";
  if (meta.type === "date" || meta.type === "datetime") {
    const date = parseDate(value);
    if (date) return meta.type === "datetime" ? formatUserDateTime(date) : formatUserDate(date);
  }
  if (typeof value === "number") {
    const normalized = nzero(roundTo(value, meta.type === "integer" || meta.type === "year" ? 0 : 2));
    if (meta.type === "percent") {
      return normalized.toLocaleString("cs-CZ", { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return normalized.toLocaleString("cs-CZ", {
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
  const headers = uniqueHeaders(data);
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
    properties: { outlineProperties: { summaryBelow: false, summaryRight: false } },
    views: [{ state: "frozen", ySplit: firstHeaderRow }],
  });

  sheet.mergeCells(1, 1, 1, Math.max(1, headers.length));
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: NAVY_TRUST.primary } };
  titleCell.alignment = { horizontal: "left", vertical: "middle" };
  sheet.getRow(1).height = 22;

  const metadata = [
    options.meta?.company ? `Firma: ${options.meta.company}` : null,
    options.meta?.period ? `Období: ${options.meta.period}` : null,
    `Exportováno: ${formatUserDateTime(created)}`,
    options.meta?.user ? `Uživatel: ${options.meta.user}` : null,
    options.meta?.filters?.length ? `Filtry: ${options.meta.filters.join("; ")}` : null,
  ].filter((item): item is string => Boolean(item));
  sheet.mergeCells(2, 1, 2, Math.max(1, headers.length));
  const metaCell = sheet.getCell(2, 1);
  metaCell.value = metadata.join(" · ");
  metaCell.font = { name: "Arial", size: 9, color: { argb: NAVY_TRUST.muted } };
  metaCell.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
  sheet.getRow(2).height = Math.max(18, Math.ceil(metaCell.value.length / 120) * 13);

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

  sheet.addTable({
    name,
    ref: `A${firstHeaderRow}`,
    headerRow: true,
    totalsRow,
    style: { theme: "TableStyleMedium2", showRowStripes: true, showColumnStripes: false },
    columns: tableColumns,
    rows: data.rows.map((row) => headers.map((_, index) => excelValue(row[index], meta[index]))),
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
        ...(isHeader ? { color: { argb: NAVY_TRUST.primaryForeground } } : {}),
      };
      target.alignment = {
        horizontal,
        vertical: "middle",
        wrapText: columnMeta.type === "text" && (sheet.getColumn(columnIndex + 1).width ?? 0) >= 60,
      };
      if (isHeader) target.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_TRUST.primary } };
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
    const contentLengths = sampledRows.map((row) => displayValue(row[index], columnMeta).length);
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
    const measured = Math.max(8, Math.ceil(header.length * 1.1) + 3, ...contentLengths, ...totalLengths);
    const width = Math.max(8, Math.min(60, columnMeta.width ?? measured + 2));
    sheet.getColumn(index + 1).width = width;
    if (columnMeta.type === "text" && measured > 60) {
      for (let rowIndex = firstDataRow; rowIndex < firstDataRow + data.rows.length; rowIndex += 1) {
        sheet.getCell(rowIndex, index + 1).alignment = {
          ...sheet.getCell(rowIndex, index + 1).alignment,
          wrapText: true,
        };
      }
    }
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
  sheet.headerFooter = { oddFooter: `&L${title}&RStrana &P z &N` };
  return workbook;
}

function datedFilename(exportName: string, created: Date) {
  const date = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}-${String(created.getDate()).padStart(2, "0")}`;
  return `${exportName}_${date}.xlsx`;
}

/** Stáhne hotový sešit v prohlížeči. */
export async function downloadWorkbook(
  workbook: Workbook,
  exportName: string,
  created = workbook.created ?? new Date(),
) {
  const buffer = await workbook.xlsx.writeBuffer();
  const bytes = buffer instanceof Uint8Array ? new Uint8Array(buffer) : new Uint8Array(buffer as ArrayBuffer);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = datedFilename(exportName, created);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  window.setTimeout(() => {
    anchor.remove();
    URL.revokeObjectURL(url);
  }, 60_000);
}