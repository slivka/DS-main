import { useEffect, useState } from "react";
import type { ExportCell, GridExportData } from "../../../lib/excel-export";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { PrintPreviewDialog } from "../print/print-preview-dialog";
import { buildReportPdf, type PrintColumn, type PrintContext, type PrintRowStyle, type PrintSection } from "../print/report-pdf";
import { gridPeriodLabel, type GridPeriodValue } from "./grid-period";
import { GridSegmentedToggle, type GridSegmentedToggleOption } from "./grid-segmented-toggle";

export type GridPrintOrientation = "portrait" | "landscape";
export interface GridPrintParam { label: string; value: string }

/** Nastavení tisku gridu do PDF. Bez `context` se položka Tisk nezobrazí. */
export interface GridPrintConfig {
  context: PrintContext;
  title: string;
  /** Parametry v záhlaví 1. strany (automatické z kontextového řádku + `printParams`). */
  params: GridPrintParam[];
  /** Popisek položky v menu Stáhnout. */
  label?: string;
}

/** Hranice počtu řádků, nad kterou se před tiskem zobrazí potvrzení. */
export const GRID_PRINT_LARGE_ROWS = 5000;
const INDENT_MM = 2;
const ROWS_PER_PAGE: Record<GridPrintOrientation, number> = { portrait: 52, landscape: 34 };

const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return y && m && d ? `${d}. ${m}. ${y}` : iso;
};

/** Parametry záhlaví z kontextového řádku gridu, `extra` se připojí za ně. */
export function gridPrintParams({ book, period, periodRange, search, filters = [], asOf, extra = [] }: {
  book?: { books: { id: string; code?: string; name: string }[]; value: string; allBooksLabel?: string } | undefined;
  period?: GridPeriodValue | undefined;
  /** Zobrazit u období i rozsah datumů (výchozí ano). */
  periodRange?: boolean;
  search?: string | undefined;
  filters?: string[];
  asOf?: { enabled: boolean; value?: string | null | undefined } | undefined;
  extra?: GridPrintParam[] | undefined;
}): GridPrintParam[] {
  const out: GridPrintParam[] = [];
  if (book) {
    const found = book.value === "all" ? null : book.books.find((item) => item.id === book.value);
    out.push({ label: "Kniha", value: found ? found.name : book.allBooksLabel ?? "Všechny knihy" });
  }
  if (period) {
    const label = gridPeriodLabel(period);
    out.push({ label: "Období", value: periodRange === false ? label : `${label} (${fmtDate(period.from)} – ${fmtDate(period.to)})` });
  }
  if (search?.trim()) out.push({ label: "Hledání", value: search.trim() });
  const activeFilters = filters.filter(Boolean);
  if (activeFilters.length) out.push({ label: "Filtr", value: activeFilters.join("; ") });
  if (asOf?.enabled && asOf.value) out.push({ label: "Stav k datu", value: fmtDate(asOf.value) });
  return [...out, ...extra];
}

const ACCOUNT_LABEL = /(účet|účtu|^md$|^dal$|protiúčet)/i;
const isAccountValue = (value: ExportCell) => value == null || value === "" || /^\d{3,}$/.test(String(value));

/** Formát tiskového sloupce podle metadat exportu. */
export function gridPrintColumnFormat(data: GridExportData, index: number): NonNullable<PrintColumn["format"]> {
  const type = data.columnMeta?.[index]?.type;
  if (type === "number") return "amount";
  if (type === "date" || type === "datetime") return "date";
  if (ACCOUNT_LABEL.test(data.columns[index] ?? "") && data.rows.every((row) => isAccountValue(row[index]))) return "code";
  return "text";
}

/** Odhad šířek sloupců v mm (podle záhlaví a prvních řádků). */
export function gridPrintColumnWidths(data: GridExportData): number[] {
  const sample = data.rows.slice(0, 300);
  return data.columns.map((label, index) => {
    const format = gridPrintColumnFormat(data, index);
    let chars = label.length;
    for (const row of sample) chars = Math.max(chars, String(row[index] ?? "").trim().length + (format === "amount" ? 4 : 0));
    const min = format === "amount" ? 24 : 14;
    return Math.min(80, Math.max(min, chars * 1.6 + 4));
  });
}

/** Více než 7 sloupců nebo součet šířek nad 180 mm → na šířku. */
export function gridPrintOrientation(widths: number[]): GridPrintOrientation {
  return widths.length > 7 || widths.reduce((sum, width) => sum + width, 0) > 180 ? "landscape" : "portrait";
}

export function gridPrintPageEstimate(rows: number, orientation: GridPrintOrientation) {
  return Math.max(1, Math.ceil(rows / ROWS_PER_PAGE[orientation]));
}

/** Pořadí řádků: souhrnné řádky stromu (pod dětmi v exportu) přesune nad jejich děti. */
function printOrder(data: GridExportData): number[] {
  const n = data.rows.length;
  const levels = data.rowLevels;
  if (!data.outlineSummaryBelow || !levels) return Array.from({ length: n }, (_, i) => i);
  const out: number[] = [];
  const walk = (from: number, to: number, level: number) => {
    let p = from;
    while (p <= to) {
      let r = p;
      while (r <= to && (levels[r] ?? 0) !== level) r += 1;
      if (r > to) { for (let i = p; i <= to; i += 1) out.push(i); return; }
      out.push(r);
      if (r > p) walk(p, r - 1, level + 1);
      p = r + 1;
    }
  };
  walk(0, n - 1, Math.min(...levels));
  return out;
}

/** Tisková tabulka ze stejných dat jako Excel export. */
export function buildGridPrintSection(data: GridExportData, totalLabel = "Celkem"): Extract<PrintSection, { type: "table" }> {
  const levels = data.rowLevels;
  const minLevel = levels?.length ? Math.min(...levels) : 0;
  const maxLevel = levels?.length ? Math.max(...levels) : 0;
  const columns: PrintColumn[] = data.columns.map((label, index) => {
    const format = gridPrintColumnFormat(data, index);
    const align = data.columnMeta?.[index]?.align ?? (format === "amount" ? "right" : "left");
    return { key: `c${index}`, label, format, align };
  });
  const order = printOrder(data);
  const rows: Array<Record<string, unknown>> = [];
  const rowStyles: Array<PrintRowStyle | undefined> = [];
  for (const i of order) {
    const source = data.rows[i] ?? [];
    const level = levels?.[i];
    const record: Record<string, unknown> = {};
    columns.forEach((column, index) => {
      const value = source[index];
      record[column.key] = index === 0 && typeof value === "string" ? value.trimStart() : value;
    });
    rows.push(record);
    const isNode = level !== undefined && (data.outlineSummaryBelow
      ? data.subtotalRows?.some((item) => item.row === i) ?? false
      : level < maxLevel);
    const indent = level !== undefined ? (level - minLevel) * INDENT_MM : 0;
    rowStyles.push(isNode || indent ? { ...(isNode ? { bold: true } : {}), ...(indent ? { indent } : {}) } : undefined);
  }
  let totals: Record<string, unknown> | undefined;
  const sumColumns = columns.filter((column, index) => column.format === "amount" && data.columnMeta?.[index]?.total !== "none");
  if (data.totalRows?.length) {
    const first = data.totalRows[0]!;
    const span = Math.max(1, first.labelSpan ?? 1);
    totals = { c0: first.label };
    first.cells.forEach((value, index) => { totals![`c${span + index}`] = value; });
  } else if (data.summarize !== false && sumColumns.length) {
    totals = { c0: totalLabel };
    for (const column of sumColumns) {
      const index = Number(column.key.slice(1));
      totals[column.key] = data.rows.reduce((sum, row, rowIndex) => {
        if (levels && levels[rowIndex] !== minLevel) return sum;
        const value = row[index];
        return sum + (typeof value === "number" ? value : 0);
      }, 0);
    }
  }
  const widths = gridPrintColumnWidths(data);
  const total = widths.reduce((sum, width) => sum + width, 0);
  const available = gridPrintOrientation(widths) === "landscape" ? 267 : 180;
  if (total <= available) columns.forEach((column, index) => { column.width = widths[index]; });
  return { type: "table", columns, rows, rowStyles, ...(totals ? { totals } : {}) };
}

export function buildGridPrintPdf(data: GridExportData, config: GridPrintConfig, orientation: GridPrintOrientation) {
  return buildReportPdf({ title: config.title, params: config.params, context: config.context, orientation, sections: [buildGridPrintSection(data)] });
}

const ORIENTATION_OPTIONS: GridSegmentedToggleOption<GridPrintOrientation>[] = [
  { value: "portrait", label: "Na výšku" },
  { value: "landscape", label: "Na šířku" },
];

/** Hook pro položku „Tisk (PDF)…“: potvrzení velkého objemu a náhled s volbou orientace. */
export function useGridPrint(getData: () => GridExportData | Promise<GridExportData>, config: GridPrintConfig | undefined) {
  const { confirm, confirmDialog } = useConfirmDialog();
  const [data, setData] = useState<GridExportData | null>(null);
  const [orientation, setOrientation] = useState<GridPrintOrientation>("portrait");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !data || !config) return;
    let cancelled = false;
    setBlob(null);
    void buildGridPrintPdf(data, config, orientation).then((next) => { if (!cancelled) setBlob(next); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, data, orientation]);

  const start = async () => {
    if (!config) return;
    const next = await getData();
    const auto = gridPrintOrientation(gridPrintColumnWidths(next));
    const show = () => { setData(next); setOrientation(auto); setOpen(true); };
    if (next.rows.length > GRID_PRINT_LARGE_ROWS) {
      const count = next.rows.length.toLocaleString("cs-CZ");
      const pages = gridPrintPageEstimate(next.rows.length, auto).toLocaleString("cs-CZ");
      confirm({ title: "Tisk velkého objemu dat", description: `Sestava má ${count} řádků, odhadem ${pages} stran. Příprava PDF může chvíli trvat. Pokračovat?`, confirmLabel: "Vytisknout", onConfirm: show });
    } else show();
  };

  const dialog = config ? (
    <>
      {confirmDialog}
      <PrintPreviewDialog
        open={open}
        onOpenChange={setOpen}
        blob={blob}
        title={config.title}
        companyName={config.context.company.name}
        settings={<GridSegmentedToggle options={ORIENTATION_OPTIONS} value={orientation} defaultValue="portrait" onChange={setOrientation} ariaLabel="Orientace stránky" />}
      />
    </>
  ) : null;

  return { start, dialog };
}
