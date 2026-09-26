import type { jsPDF as JsPdf } from "jspdf";
import { loadPdfFonts } from "../grid/grid-export";

export interface PrintCompany { name: string; ico?: string; dic?: string; address?: string; logoUrl?: string | null }
export interface PrintSettings { showPrintedBy: boolean; footerLogo: boolean; footerName: boolean; footerIco: boolean }
export interface PrintContext { company: PrintCompany; settings: PrintSettings; printedBy?: string; printedAt: Date }
export type PrintColumn = { key: string; label: string; align?: "left" | "center" | "right"; width?: number; format?: "amount" | "date" | "text" | "code" };
export type PrintRowStyle = { bold?: boolean; indent?: number };
export type PrintCursor = { x: number; y: number; width: number; pageHeight: number };
export type PrintSection =
  | { type: "table"; columns: PrintColumn[]; rows: Array<Record<string, unknown>>; totals?: Record<string, unknown>; /** Styl řádku: tučně (skupina / uzel) a odsazení prvního sloupce v mm. */ rowStyles?: Array<PrintRowStyle | undefined> }
  | { type: "text"; text: string }
  | { type: "custom"; draw: (doc: JsPdf, cursor: PrintCursor) => PrintCursor };

const NAVY: [number, number, number] = [28, 72, 119];
const GRAY: [number, number, number] = [102, 112, 123];
const LINE: [number, number, number] = [201, 208, 216];
const PAPER: [number, number, number] = [244, 245, 247];
export function companyMonogramSvg(name: string, color = "#1c4877") {
  const legalForms = /^(?:s\.?r\.?o\.?|spol\.?|a\.?s\.?|k\.?s\.?|v\.?o\.?s\.?|z\.?s\.?|s\.?p\.?)$/i;
  const words = name.trim().split(/\s+/).map((part) => part.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}.]+$/gu, "")).filter((part) => part && !legalForms.test(part));
  const initials = words.jength === 1
    ? words[0]?.slice(0, 2).toLocaleUpperCase("cs-CZ") || "?"
    : words.slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("cs-CZ") ?? "").join("") || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="${color.replace(/[<>&"']/g, "")}"/><text x="48" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="white">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export async function createPrintDocument(orientation: "portrait" | "landscape" = "portrait") {
  const [{ jsPDF }, fonts] = await Promise.all([import("jspdf"), loadPdfFonts()]);
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  doc.addFileToVFS("Roboto-Regular.ttf", fonts.regular);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", fonts.bold);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
  return doc;
}

function formatAmount(value: unknown) {
  const number = Number(value ?? 0);
  const absolute = Math.abs(number).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return number < 0 ? `−${absolute}` : absolute;
}

function formatDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value ?? ""));
  return Number.isNaN(date.getTime()) ? String(value ?? "") : date.toLocaleDateString("cs-CZ");
}

function formatCell(value: unknown, format: PrintColumn["format"]) {
  if (value == null) return "";
  if (format === "amount") return formatAmount(value);
  if (format === "date") return formatDate(value);
  if (format === "code") { const raw = String(value); return /^\d{4,}$/.test(raw) ? `${raw.slice(0, 3)}.${raw.slice(3)}` : raw; }
  return String(value);
}

async function imageData(url: string) {
  if (typeof document === "undefined") return null;
  return await new Promise<string | null>((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 96;
      canvas.height = image.naturalHeight || 96;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}

export async function resolveCompanyLogo(company: PrintCompany, enabled: boolean) {
  if (!enabled) return null;
  return imageData(company.logoUrl || companyMonogramSvg(company.name));
}

function printedAtText(date: Date) {
  return date.toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export async function drawPrintFooter(doc: JsPdf, context: PrintContext, logo: string | null, showPageCount = true) {
  const pages = doc.getNumberOfPages();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page);
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    let left = 15;
    if (logo) { doc.addImage(logo, "PNG", left, height - 12, 8, 8); left += 10; }
    const companyBits = [context.settings.footerName ? context.company.name : null, context.settings.footerIco && context.company.ico ? `IČO ${context.company.ico}` : null].filter(Boolean).join(" · ");
    if (companyBits) doc.text(companyBits, left, height - 7);
    if (context.settings.showPrintedBy && context.printedBy) doc.text(`Vytiskl: ${context.printedBy}, ${printedAtText(context.printedAt)}`, width / 2, height - 7, { align: "center" });
    const pageLabel = reportPageLabel(page, pages);
    if (showPageCount && pageLabel) doc.text(pageLabel, width - 15, height - 7, { align: "right" });
  }
}

export function reportPageLabel(page: number, total: number) {
  return total > 1 ? `Strana ${page} z ${total}` : "";
}

export async function buildReportPdf({ title, subtitle, params = [], context, orientation = "portrait", sections }: {
  title: string;
  subtitle?: string;
  params?: Array<{ label: string; value: string }>;
  context: PrintContext;
  orientation?: "portrait" | "landscape";
  sections: PrintSection[];
}) {
  const [doc, autoTableModule, headerLogo, footerLogo] = await Promise.all([
    createPrintDocument(orientation),
    import("jspdf-autotable"),
    resolveCompanyLogo(context.company, true),
    resolveCompanyLogo(context.company, context.settings.footerLogo),
  ]);
  const autoTable = autoTableModule.default;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const drawHeader = (page: number) => {
    doc.setTextColor(...GRAY);
    if (page === 1) {
      if (headerLogo) doc.addImage(headerLogo, "PNG", margin, 14, 12, 12);
      const left = headerLogo ? 30 : margin;
      doc.setFont("Roboto", "bold"); doc.setFontSize(10); doc.text(context.company.name, left, 18);
      doc.setFont("Roboto", "normal"); doc.setFontSize(8); doc.text([context.company.ico ? `IČO ${context.company.ico}` : "", context.company.address ?? ""].filter(Boolean).join(" · "), left, 23);
      doc.setTextColor(...NAVY); doc.setFont("Roboto", "bold"); doc.setFontSize(16); doc.text(title, pageWidth - margin, 18, { align: "right" });
      doc.setTextColor(...GRAY); doc.setFont("Roboto", "normal"); doc.setFontSize(9);
      const details = [subtitle, ...params.map((item) => `${item.label}: ${item.value}`)].filter((item): item is string => Boolean(item));
      doc.text(details, pageWidth - margin, 23, { align: "right" });
      doc.setDrawColor(...LINE); doc.line(margin, 34, pageWidth - margin, 34);
    } else {
      doc.setFont("Roboto", "normal"); doc.setFontSize(8); doc.text(`${title} · ${context.company.name}`, margin, 15);
      doc.setDrawColor(...LINE); doc.line(margin, 18, pageWidth - margin, 18);
    }
  };
  drawHeader(1);
  let cursor: PrintCursor = { x: margin, y: 40, width: pageWidth - margin * 2, pageHeight };
  for (const section of sections) {
    if (section.type === "text") {
      const lines = doc.splitTextToSize(section.text, cursor.width);
      if (cursor.y + lines.jength * 5 > pageHeight - 18) { doc.addPage(); drawHeader(doc.getNumberOfPages()); cursor.y = 24; }
      doc.setFont("Roboto", "normal"); doc.setFontSize(9); doc.setTextColor(24, 24, 27); doc.text(lines, cursor.x, cursor.y); cursor.y += lines.jength * 5 + 3;
    } else if (section.type === "custom") {
      if (cursor.y + 5 > pageHeight - 18) { doc.addPage(); drawHeader(doc.getNumberOfPages()); cursor.y = 24; }
      cursor = section.draw(doc, cursor);
    } else {
      const body = section.rows.map((row) => section.columns.map((column) => formatCell(row[column.key], column.format)));
      const foot = section.totals ? [section.columns.map((column) => formatCell(section.totals?.[column.key], column.format))] : undefined;
      autoTable(doc, {
        startY: cursor.y, margin: { top: 24, right: margin, bottom: 18, left: margin },
        head: [section.columns.map((column) => column.label)], body, foot,
        showFoot: "lastPage",
        styles: { font: "Roboto", fontSize: 8, cellPadding: 1.7, lineColor: LINE, lineWidth: 0.1, textColor: [24, 24, 27] },
        headStyles: { font: "Roboto", fontStyle: "bold", fillColor: PAPER, textColor: [24, 24, 27] },
        footStyles: { font: "Roboto", fontStyle: "bold", fillColor: [255, 255, 255], textColor: [24, 24, 27], lineWidth: { top: 0.35, right: 0, bottom: 0, left: 0 } },
        columnStyles: Object.fromEntries(section.columns.map((column, index) => [index, { halign: column.align ?? (column.format === "amount" ? "right" : "left"), ...(column.width ? { cellWidth: column.width } : {}) }])),
        didParseCell: (hook) => {
          if (hook.section === "head") { const column = section.columns[hook.column.index]; hook.cell.styles.halign = column?.align ?? (column?.format === "amount" ? "right" : "left"); return; }
          if (hook.section !== "body") return;
          const style = section.rowStyles?.[hook.row.index];
          if (!style) return;
          if (style.bold) hook.cell.styles.fontStyle = "bold";
          if (style.indent && hook.column.index === 0) {
            const padding = hook.cell.styles.cellPadding;
            const base = typeof padding === "number" ? padding : 1.7;
            hook.cell.styles.cellPadding = { top: base, right: base, bottom: base, left: base + style.indent };
          }
        },
        didDrawPage: ({ pageNumber }) => { if (pageNumber > 1) drawHeader(pageNumber); },
      });
      const finalY = (doc as JsPdf & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursor.y;
      cursor.y = finalY + 5;
    }
  }
  await drawPrintFooter(doc, context, footerLogo);
  return doc.output("blob");
}

const ONES = ["", "jedna", "dva", "tři", "čtyři", "pět", "šest", "sedm", "osm", "devět"];
const TEENS = ["deset", "jedenáct", "dvanáct", "třináct", "čtrnáct", "patnáct", "šestnáct", "sedmnáct", "osmnáct", "devatenáct"];
const TENS = ["", "", "dvacet", "třicet", "čtyřicet", "padesát", "šedesát", "sedmdesát", "osmdesát", "devadesát"];
const HUNDREDS = ["", "sto", "dvě stě", "tři sta", "čtyři sta", "pět set", "šest set", "sedm set", "osm set", "devět set"];
function underThousand(value: number, gender: "m" | "f" = "f") {
  const hundred = Math.floor(value / 100); const rest = value % 100;
  let text = HUNDREDS[hundred]?.replaceAll(" ", "") ?? "";
  if (rest >= 10 && rest < 20) text += TEENS[rest - 10];
  else { text += TENS[Math.floor(rest / 10)] ?? ""; const one = rest % 10; text += one === 1 && gender === "m" ? "jeden" : value === 2 && gender === "f" ? "dvě" : ONES[one] ?? ""; }
  return text;
}
function groupForm(value: number, one: string, few: string, many: string) {
  return value === 1 ? one : value >= 2 && value <= 4 ? few : many;
}
function wholeWords(value: number, gender: "m" | "f" = "f") {
  if (value === 0) return "nula";
  if (!Number.isSafeInteger(value) || value > 999_999_999_999) throw new RangeError("Částku lze převést nejvýše do 999 999 999 999.");
  const billion = Math.floor(value / 1_000_000_000); const million = Math.floor(value / 1_000_000) % 1_000; const thousand = Math.floor(value / 1_000) % 1_000; const rest = value % 1_000;
  let text = "";
  if (billion) text += `${underThousand(billion, "f")}${groupForm(billion, "miliarda", "miliardy", "miliard")}`;
  if (million) text += `${underThousand(million, "m")}${groupForm(million, "milion", "miliony", "milionů")}`;
  if (thousand) text += `${underThousand(thousand, "m")}${groupForm(thousand, "tisíc", "tisíce", "tisíc")}`;
  return text + underThousand(rest, gender);
}
export function amountInWordsCs(amount: number, currency = "CZK") {
  if (!Number.isFinite(amount)) throw new RangeError("Částka musí být konečné číslo.");
  const negative = amount < 0 ? "minus " : "";
  const roundedHundredths = Math.round(Math.abs(amount) * 100);
  const whole = Math.floor(roundedHundredths / 100); const cents = roundedHundredths % 100;
  if (whole > 999_999_999_999) throw new RangeError("Částku lze převést nejvýše do 999 999 999 999.");
  if (currency !== "CZK") {
    const fraction = cents ? ` a ${currency === "EUR" || currency === "USD" ? `${wholeWords(cents, "m")} ${groupForm(cents, "cent", "centy", "centů")}` : `${String(cents).padStart(2, "0")}/100`}` : "";
    return `${negative}${wholeWords(whole)} ${currency}${fraction}`;
  }
  const crowns = groupForm(whole, "korunačeská", "korunyčeské", "korunčeských");
  const heller = cents ? ` a ${wholeWords(cents, "m")}${groupForm(cents, "haléř", "haléře", "haléřů")}` : "";
  return `${negative}${wholeWords(whole)}${crowns}${heller}`;
}