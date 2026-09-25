import type { jsPDF as JsPdf } from "jspdf";
import { loadPdfFonts } from "../grid/grid-export";

export interface PrintCompany { name: string; ico?: string; dic?: string; address?: string; logoUrl?: string | null }
export interface PrintSettings { showPrintedBy: boolean; footerLogo: boolean; footerName: boolean; footerIco: boolean }
export interface PrintContext { company: PrintCompany; settings: PrintSettings; printedBy?: string; printedAt: Date }
export type PrintColumn = { key: string; label: string; align?: "left" | "center" | "right"; width?: number; format?: "amount" | "date" | "text" | "code" };
export type PrintCursor = { x: number; y: number; width: number; pageHeight: number };
export type PrintSection =
  | { type: "table"; columns: PrintColumn[]; rows: Array<Record<string, unknown>>; totals?: Record<string, unknown> }
  | { type: "text"; text: string }
  | { type: "custom"; draw: (doc: JsPdf, cursor: PrintCursor) => PrintCursor };

const NAVY: [number, number, number] = [28, 72, 119];
const GRAY: [number, number, number] = [102, 112, 123];
const LINE: [number, number, number] = [201, 208, 216];
const PAPER: [number, number, number] = [244, 245, 247];
const TOTAL_PAGES = "{total_pages_count_string}";

export function companyMonogramSvg(name: string, color = "#1c4877") {
  const initials = name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("cs-CZ") ?? "").join("") || "?";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><circle cx="48" cy="48" r="48" fill="${color.replace(/[<>&\"']/g, "")}"/><text x="48" y="58" text-anchor="middle" font-family="Arial,sans-serif" font-size="34" font-weight="700" fill="white">${initials}</text></svg>`;
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
  return date.toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
    if (showPageCount && pages > 1) doc.text(`Strana ${page} z ${TOTAL_PAGES}`, width - 15, height - 7, { align: "right" });
  }
  if (showPageCount && pages > 1 && typeof doc.putTotalPages === "function") doc.putTotalPages(TOTAL_PAGES);
}

export async function buildReportPdf({ title, subtitle, params = [], context, orientation = "portrait", sections }: {
  title: string;
  subtitle?: string;
  params?: Array<{ label: string; value: string }>;
  context: PrintContext;
  orientation?: "portrait" | "landscape";
  sections: PrintSection[];
}) {
  const [doc, autoTableModule, logo] = await Promise.all([createPrintDocument(orientation), import("jspdf-autotable"), resolveCompanyLogo(context.company, context.settings.footerLogo)]);
  const autoTable = autoTableModule.default;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const drawHeader = (page: number) => {
    doc.setTextColor(...GRAY);
    if (page === 1) {
      if (logo) doc.addImage(logo, "PNG", margin, 14, 12, 12);
      const left = logo ? 30 : margin;
      doc.setFont("Roboto", "bold"); doc.setFontSize(10); doc.text(context.company.name, left, 18);
      doc.setFont("Roboto", "normal"); doc.setFontSize(8); doc.text([context.company.ico ? `IČO ${context.company.ico}` : "", context.company.address ?? ""].filter(Boolean).join(" · "), left, 23);
      doc.setTextColor(...NAVY); doc.setFont("Roboto", "bold"); doc.setFontSize(16); doc.text(title, pageWidth - margin, 18, { align: "right" });
      doc.setTextColor(...GRAY); doc.setFont("Roboto", "normal"); doc.setFontSize(9);
      const details = [subtitle, ...params.map((item) => `${item.label}: ${item.value}`)].filter(Boolean);
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
      if (cursor.y + lines.length * 5 > pageHeight - 18) { doc.addPage(); drawHeader(doc.getNumberOfPages()); cursor.y = 24; }
      doc.setFont("Roboto", "normal"); doc.setFontSize(9); doc.setTextColor(24, 24, 27); doc.text(lines, cursor.x, cursor.y); cursor.y += lines.length * 5 + 3;
    } else if (section.type === "custom") {
      cursor = section.draw(doc, cursor);
    } else {
      const body = section.rows.map((row) => section.columns.map((column) => formatCell(row[column.key], column.format)));
      const foot = section.totals ? [section.columns.map((column) => formatCell(section.totals?.[column.key], column.format))] : undefined;
      autoTable(doc, {
        startY: cursor.y, margin: { top: 24, right: margin, bottom: 18, left: margin },
        head: [section.columns.map((column) => column.label)], body, foot,
        styles: { font: "Roboto", fontSize: 8, cellPadding: 1.7, lineColor: LINE, lineWidth: 0.1, textColor: [24, 24, 27] },
        headStyles: { font: "Roboto", fontStyle: "bold", fillColor: PAPER, textColor: [24, 24, 27] },
        footStyles: { font: "Roboto", fontStyle: "bold", fillColor: [255, 255, 255], textColor: [24, 24, 27], lineWidth: { top: 0.35, right: 0, bottom: 0, left: 0 } },
        columnStyles: Object.fromEntries(section.columns.map((column, index) => [index, { halign: column.align ?? (column.format === "amount" ? "right" : "left"), ...(column.width ? { cellWidth: column.width } : {}) }])),
        didDrawPage: ({ pageNumber }) => { if (pageNumber > 1) drawHeader(pageNumber); },
      });
      const finalY = (doc as JsPdf & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? cursor.y;
      cursor.y = finalY + 5;
    }
  }
  await drawPrintFooter(doc, context, logo);
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
  else { text += TENS[Math.floor(rest / 10)] ?? ""; const one = rest % 10; text += one === 1 && gender === "m" ? "jeden" : one === 2 && gender === "f" ? "dvě" : ONES[one] ?? ""; }
  return text;
}
function wholeWords(value: number) {
  if (value === 0) return "nula";
  const million = Math.floor(value / 1_000_000); const thousand = Math.floor(value / 1_000) % 1_000; const rest = value % 1_000;
  let text = "";
  if (million) text += `${underThousand(million, "m")}${million === 1 ? "milion" : million >= 2 && million <= 4 ? "miliony" : "milionů"}`;
  if (thousand) text += `${underThousand(thousand, "m")}${thousand === 1 ? "tisíc" : thousand >= 2 && thousand <= 4 ? "tisíce" : "tisíc"}`;
  return text + underThousand(rest);
}
function plural(value: number, one: string, few: string, many: string) { const last = value % 100; return last === 1 ? one : last >= 2 && last <= 4 ? few : many; }
export function amountInWordsCs(amount: number, currency = "CZK") {
  const negative = amount < 0 ? "minus" : "";
  const absolute = Math.abs(amount); const whole = Math.floor(absolute + 1e-9); const cents = Math.round((absolute - whole) * 100);
  if (currency !== "CZK") return `${negative}${wholeWords(whole)} ${currency}${cents ? ` a ${wholeWords(cents)} setin` : ""}`;
  const crowns = plural(whole, "korunačeská", "korunyčeské", "korunčeských");
  return `${negative}${wholeWords(whole)}${crowns}${cents ? ` a ${wholeWords(cents)} ${plural(cents, "haléř", "haléře", "haléřů")}` : ""}`;
}