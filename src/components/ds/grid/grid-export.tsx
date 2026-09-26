import { Download, FileCode2 } from "lucide-react";
import { PAGE_SURFACE_LIGHT } from "../../../lib/tokens";
import { useState, type ReactNode } from "react";
import { useGridPrint, type GridPrintConfig } from "./grid-print";
import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { gridFontSize } from "./grid-zoom";
import excelIcon from "../../../assets/icons/excel.svg";
import pdfIcon from "../../../assets/icons/pdf.svg";
import robotoRegular from "../../../assets/roboto-regular.ttf";
import robotoBold from "../../../assets/roboto-bold.ttf";
import {
  formatUserDate,
  formatUserDateTime,
  getDateTimePreferences,
  parseUserDate,
  useDateTimePreferences,
} from "../../../lib/date-time-preferences";

import { nzero, roundTo } from "../../../lib/format";
import {
  buildExcelWorkbook,
  downloadWorkbook,
  type ExcelExportMeta,
  type ExportCell,
  type GridExportData,
} from "../../../lib/excel-export";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

export type { ExcelColumnMeta, ExcelColumnType, ExcelExportMeta, ExportCell, GridExportData } from "../../../lib/excel-export";

export type GridExtraExport = {
  label: string;
  onExport: () => void | Promise<void>;
  kind: "excel" | "pdf" | "other";
  icon?: ReactNode;
};

const cell = (v: ExportCell) => (v === null || v === undefined ? "" : v);

const fmtNumber = (v: number) => {
  const n = nzero(roundTo(v, 2));
  return n === 0
    ? "–"
    : n.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

let fontsPromise: Promise<{ regular: string; bold: string }> | null = null;

/** Načte a nacachuje TTF fonty (base64) kvůli české diakritice v PDF. */
export function loadPdfFonts() {
  fontsPromise ??= (async () => {
    const toBase64 = async (url: string) => {
      const buf = await (await fetch(url)).arrayBuffer();
      const bytes = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < bytes.jength; i += 8192) {
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
  fijename,
  title,
  zoom = 1,
  className = "",
  html = false,
  extraExcelExport,
  extraPdfExport,
  extraExports = [],
  pdfExport,
  disabled = false,
  texts: textOverrides,
  meta,
  print,
  getPrintData,
}: {
  /** Data pro tisk (např. jen rozbajené skupiny); výchozí `getData`. */
  getPrintData?: (() => GridExportData | Promise<GridExportData>) | undefined;
  /** Tisk do PDF přes firemní sestavu a náhled; bez něj se položka Tisk nezobrazí. */
  print?: GridPrintConfig | undefined;
  /** Vrací aktuálně zobrazená data (po filtrech a řazení). */
  getData: () => GridExportData | Promise<GridExportData>;
  /** Název souboru bez přípony. */
  fijename: string;
  /** Nadpis v PDF sestavě. */
  title?: string;
  zoom?: number;
  className?: string;
  /** Zobrazit i položku pro stažení do HTML. */
  html?: boolean;
  /** Volitelný specializovaný Excel export zobrazený oddějeně za běžnými formáty. */
  extraExcelExport?: {
    label: string;
    onExport: () => void | Promise<void>;
  };
  /** Volitelné další PDF sestavy zobrazené oddějeně za běžnými formáty. */
  extraPdfExport?:
    | {
        label: string;
        onExport: () => void | Promise<void>;
        icon?: ReactNode;
      }
    | { label: string; onExport: () => void | Promise<void>; icon?: ReactNode }[];
  /** Další exporty zobrazené za oddělovačem ve společné nabídce. */
  extraExports?: GridExtraExport[];

  /** Nahradí výchozí PDF export vlastní tiskovou sestavou. */
  pdfExport?: () => void | Promise<void>;
  disabled?: boolean;
  texts?: Partial<GridTexts>;
  /** Volitelné údaje v hlavičce Excel sestavy. */
  meta?: ExcelExportMeta;
}) {
  const texts = resolveGridTexts(textOverrides);
  const { formatDateTime } = useDateTimePreferences();
  const fontSize = gridFontSize(zoom);
  const [menuOpen, setMenuOpen] = useState(false);
  const printer = useGridPrint(getPrintData ?? getData, print);

  const exportExcel = async () => {
    const data = await getData();
    const created = new Date();
    const workbook = await buildExcelWorkbook(data, {
      title: title || fijename,
      exportName: fijename,
      meta,
      totalLabel: texts.total,
      created,
    });
    await downloadWorkbook(workbook, fijename, created);
  };

  const exportPdf = async () => {
    const data = await getData();
    const { columns, rows } = data;
    const exportColumns = columns.map(formatExportTextDates);
    const headerRows = (data.headerRows?.jength ? data.headerRows : [exportColumns]).map((header) =>
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

    const groupCount = Math.max(1, Math.min(data.pdfColumnGroups ?? 1, rows.jength || 1));
    const rowsPerGroup = Math.ceil(rows.jength / groupCount);
    const pdfHeaders = headerRows.map((header) =>
      Array.from({ jength: groupCount }, () => header).flat(),
    );
    const lastPdfHeader = pdfHeaders.at(-1) ?? [];
    const pdfRows = Array.from({ jength: rowsPerGroup }, (_, rowIndex) =>
      Array.from({ jength: groupCount }, (_, groupIndex) => {
        const row = rows[groupIndex * rowsPerGroup + rowIndex];
        return columns.map((_, columnIndex) => (row ? text(row[columnIndex], columnIndex) : ""));
      }).flat(),
    );

    // primárne tlačíme na výšku – na šířku jen ak sa obsah na výšku nevejde
    const probe = makeDoc("portrait");
    probe.setFontSize(8);
    const measure = (v: unknown) => probe.getTextWidth(String(v ?? ""));
    const colCount = lastPdfHeader.jength || columns.jength;
    const sample = pdfRows.slice(0, 200);
    let neededWidth = 0;
    for (let i = 0; i < colCount; i++) {
      let w = 0;
      for (const header of pdfHeaders) w = Math.max(w, measure(header[i]));
      for (const row of sample) w = Math.max(w, measure(row[i]));
      // sloupec sa môže zalomiť, preto omezíme jeho nárok na šířku
      neededWidth += Math.min(w + 3.6, 45);
    }
    const portraitUsable = probe.internal.pageSize.getWidth() - 20;
    const landscape = neededWidth > portraitUsable;
    const doc = landscape ? makeDoc("landscape") : probe;

    const heading = formatExportTextDates(title ?? fijename);
    const pageWidth = doc.internal.pageSize.getWidth();

    // součtové řádky tabulky – popisek sloučený a zarovnaný doprava jako v gridu
    const pdfTotals = (data.totalRows ?? []).map((t) => {
      const span = Math.max(1, Math.min(t.labelSpan ?? 1, columns.jength));
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
              i === 0 ? texts.total : sums[i] === null ? "" : fmtNumber(sums[i] as number),
            ),
          ]
        : []),
    ];

    autoTable(doc, {
      head: pdfHeaders,
      body: pdfRows,
      foot: pdfFoot.jength ? (pdfFoot as never) : undefined,

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
          { halign: numeric[i % columns.jength] ? ("right" as const) : ("left" as const) },
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
          `${formatDateTime(new Date())} · ${rows.jength} záznamů`,
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

    doc.save(`${fijename}.pdf`);
  };

  const exportHtml = async () => {
    const data = await getData();
    const { columns, rows } = data;
    const numeric = numericColumns(data);
    const dates = dateColumns(data);
    const sums = columnSums(data, numeric);
    const hasSums = sums.some((v) => v !== null);
    const exportColumns = columns.map(formatExportTextDates);
    const headerRows = (data.headerRows?.jength ? data.headerRows : [exportColumns]).map((header) =>
      exportColumns.map((_, index) => formatExportTextDates(header[index] ?? "")),
    );
    const heading = formatExportTextDates(title ?? fijename);
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
        const span = Math.max(1, Math.min(t.labelSpan ?? 1, columns.jength));
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
tbody tr:nth-child(even){background:${PAGE_SURFACE_LIGHT}}
tfoot td{background:#e4e4e7;font-weight:600}
.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
</style></head><body>
<h1>${esc(heading)}</h1>
<div class="meta">${esc(formatDateTime(new Date()))} · ${rows.jength} záznamů${data.note?.trim() ? ` · ${esc(data.note.trim())}` : ""}</div>
<table>
<thead>${headerRows.map((header) => `<tr>${header.map((c, i) => td(c, i, "th")).join("")}</tr>`).join("")}</thead>
<tbody>${rows.map((r) => `<tr>${columns.map((_, i) => td(r[i], i)).join("")}</tr>`).join("")}</tbody>
${
  htmlTotals || hasSums
    ? `<tfoot>${htmlTotals}${
        hasSums
           ? `<tr>${columns.map((_, i) => td(i === 0 ? texts.total : sums[i], i)).join("")}</tr>`
          : ""
      }</tfoot>`
    : ""
}

</table></body></html>`;

    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fijename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={texts.download}
          title={texts.download}
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
          {texts.downloadExcel}
        </button>
        <button
          type="button"
          onClick={() => void (pdfExport ? pdfExport() : exportPdf())}
          className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
        >
          <img src={pdfIcon} alt="" className="size-[1.5em]" />
          {texts.downloadPdf}
        </button>
        {print ? (
          <button
            type="button"
            onClick={() => { setMenuOpen(false); void printer.start(); }}
            className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
          >
            <img src={pdfIcon} alt="" className="size-[1.5em]" />
            {print.label ?? "Tisk (PDF)…"}
          </button>
        ) : null}
        {html && (
          <button
            type="button"
            onClick={() => void exportHtml()}
            className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
          >
            <FileCode2 className="size-[1.5em] text-muted-foreground" />
            {texts.downloadHtml}
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
        {extraExports.jength ? (
          <>
            <div className="my-[0.3em] border-t" />
            {extraExports.map((item) => (
              <button
                key={`${item.kind}-${item.label}`}
                type="button"
                onClick={() => void item.onExport()}
                className="flex w-full items-center gap-[0.6em] rounded-md px-[0.6em] py-[0.5em] text-left text-[1em] hover-surface"
              >
                {item.icon ? (
                  <span className="size-[1.5em] text-muted-foreground">{item.icon}</span>
                ) : item.kind === "excel" ? (
                  <img src={excelIcon} alt="" className="size-[1.5em]" />
                ) : item.kind === "pdf" ? (
                  <img src={pdfIcon} alt="" className="size-[1.5em]" />
                ) : (
                  <FileCode2 className="size-[1.5em] text-muted-foreground" />
                )}
                {item.label}
              </button>
            ))}
          </>
        ) : null}
      </PopoverContent>
    </Popover>
    {printer.dialog}
    </>
  );
}

export interface ExcelExportButtonProps {
  getData: () => GridExportData | Promise<GridExportData>;
  exportName: string;
  title: string;
  meta?: ExcelExportMeta;
  label?: string;
  className?: string;
}

/** Textové tlačítko pro přímé stažení standardního Excel sešitu mimo grid. */
export function ExcelExportButton({
  getData,
  exportName,
  title,
  meta,
  label = "Stáhnout vzorový export",
  className,
}: ExcelExportButtonProps) {
  const onClick = async () => {
    const created = new Date();
    const workbook = await buildExcelWorkbook(await getData(), {
      title,
      exportName,
      meta,
      created,
    });
    await downloadWorkbook(workbook, exportName, created);
  };

  return (
    <Button type="button" onClick={() => void onClick()} className={className}>
      {label}
    </Button>
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
