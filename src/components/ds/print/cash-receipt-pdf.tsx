import { useEffect, useState } from "react";
import { Label } from "../../ui/label";
import { OptionSelect } from "../form/option-select";
import { amountInWordsCs, createPrintDocument, resolveCompanyLogo, type PrintCompany, type PrintContext } from "./report-pdf";
import { PrintPreviewDialog } from "./print-preview-dialog";

export type CashReceiptCopies = 1 | 2 | 3 | 4 | 5;

export interface CashReceiptPdfInput {
  direction: "in" | "out";
  number?: string | null;
  bookName: string;
  company: PrintCompany;
  counterparty: { name: string; ico?: string; dic?: string; address?: string };
  purpose: string;
  amount: number;
  currency: string;
  currencySymbol?: string;
  homeCurrency: string;
  homeCurrencySymbol?: string;
  rate?: number;
  rateAmount?: number;
  amountHome?: number;
  dateIssued: string | Date;
  dateAccounting: string | Date;
  dateTax?: string | Date;
  lines: Array<{ debit: string; credit: string; amount: number; text: string }>;
  issuedBy: string;
  approvedBy?: string;
  status: string;
  copies: CashReceiptCopies;
  /** Skládat dvě kopie na jednu A4; výchozí true, u dlouhého dokladu se ignoruje. */
  twoPerPage?: boolean;
  /** Tisknout číslo dokladu; výchozí true, vypnuté nechá pole prázdné. */
  printNumber?: boolean;
}

const NAVY: [number, number, number] = [28, 72, 119];
const GRAY: [number, number, number] = [102, 112, 123];
const LINE: [number, number, number] = [201, 208, 216];
export const formatCashReceiptMoney = (value: number, currency: string, currencySymbol?: string) => `${value < 0 ? "−" : ""}${Math.abs(value).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currencySymbol ?? currency}`;
const formatDate = (value: string | Date) => (value instanceof Date ? value : new Date(value)).toLocaleDateString("cs-CZ");

/** Číslo dokladu na tisku; vypnutý tisk čísla nechává pole prázdné. */
export const cashReceiptNumberLabel = (input: Pick<CashReceiptPdfInput, "number" | "status" | "printNumber">) =>
  input.printNumber === false ? "" : input.status === "draft" ? "—" : input.number || "—";

/** Rozložení kopií na strany A4; při dvou na stránku se kopie skládají po dvou. */
export function planCashReceiptPages(copies: CashReceiptCopies, twoPerPage: boolean, fullPage: boolean): Array<{ page: number; slot: 0 | 1; copy: boolean }> {
  const pack = twoPerPage && !fullPage;
  return Array.from({ length: copies }, (_, index) => ({ page: pack ? Math.floor(index / 2) : index, slot: (pack ? index % 2 : 0) as 0 | 1, copy: index > 0 }));
}

type PrintDoc = Awaited<ReturnType<typeof createPrintDocument>>;

function field(doc: PrintDoc, label: string, value: string, x: number, y: number, width: number) {
  doc.setFont("Roboto", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text(label, x, y);
  doc.setFontSize(8.5); doc.setTextColor(24, 24, 27); const lines = doc.splitTextToSize(value || "—", width); doc.text(lines, x, y + 4);
}

function wrapByWidth(doc: PrintDoc, text: string, width: number) {
  const lines: string[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const chunks: string[] = [];
    let chunk = "";
    for (const character of word) {
      if (chunk && doc.getTextWidth(chunk + character) > width) { chunks.push(chunk); chunk = character; }
      else chunk += character;
    }
    if (chunk) chunks.push(chunk);
    for (const part of chunks) {
      const previous = lines.at(-1);
      if (previous && doc.getTextWidth(`${previous} ${part}`) <= width) lines[lines.length - 1] = `${previous} ${part}`;
      else lines.push(part);
    }
  }
  return lines.length ? lines : ["—"];
}

function footerText(date: Date) {
  return date.toLocaleString("cs-CZ", { day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function drawReceiptFooter(doc: PrintDoc, context: PrintContext, logo: string | null, y: number) {
  doc.setFont("Roboto", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY);
  let left = 15;
  if (logo) { doc.addImage(logo, "PNG", left, y - 6, 6, 6); left += 8; }
  const company = [context.settings.footerName ? context.company.name : null, context.settings.footerIco && context.company.ico ? `IČO ${context.company.ico}` : null].filter(Boolean).join(" · ");
  if (company) doc.text(company, left, y - 1.5);
  if (context.settings.showPrintedBy && context.printedBy) doc.text(`Vytiskl: ${context.printedBy}, ${footerText(context.printedAt)}`, 195, y - 1.5, { align: "right" });
}

function drawReceipt(doc: PrintDoc, input: CashReceiptPdfInput, context: PrintContext, logo: string | null, top: number, copy: boolean, fullPage: boolean) {
  const x = 15; const width = 180;
  doc.setTextColor(...NAVY); doc.setFont("Roboto", "bold"); doc.setFontSize(15);
  doc.text(input.direction === "in" ? "PŘÍJMOVÝ POKLADNÍ DOKLAD" : "VÝDAJOVÝ POKLADNÍ DOKLAD", x, top + 11);
  doc.setFont("Roboto", "bold"); doc.setFontSize(16); doc.text(input.status === "draft" ? "—" : input.number || "—", x + width, top + 10, { align: "right" });
  doc.setFont("Roboto", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY); doc.text(input.bookName, x + width, top + 15, { align: "right" });
  doc.setDrawColor(...LINE); doc.line(x, top + 19, x + width, top + 19);
  if (copy) { doc.roundedRect(x + 86, top + 10.5, 18, 6, 1, 1); doc.setFontSize(7); doc.text("kopie", x + 95, top + 14.5, { align: "center" }); }

  field(doc, "Vystavitel", [input.company.name, input.company.address, input.company.ico ? `IČO ${input.company.ico}` : "", input.company.dic ? `DIČ ${input.company.dic}` : ""].filter(Boolean).join(" · "), x, top + 25, 112);
  field(doc, input.direction === "in" ? "Přijato od:" : "Vyplaceno komu:", [input.counterparty.name, input.counterparty.ico ? `IČO ${input.counterparty.ico}` : "", input.counterparty.dic ? `DIČ ${input.counterparty.dic}` : "", input.counterparty.address].filter(Boolean).join(" · "), x, top + 38, 112);
  field(doc, "Účel platby:", input.purpose, x, top + 51, 112);
  doc.setDrawColor(...NAVY); doc.setLineWidth(0.35); doc.roundedRect(x + 119, top + 24, 61, 23, 1.5, 1.5);
  doc.setLineWidth(0.2);
  doc.setFont("Roboto", "bold"); doc.setFontSize(15); doc.setTextColor(...NAVY); doc.text(formatCashReceiptMoney(input.amount, input.currency, input.currencySymbol), x + 176, top + 38, { align: "right" });
  doc.setFont("Roboto", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text("Částka", x + 123, top + 29);
  doc.setFont("Roboto", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text("Slovy:", x, top + 61);
  doc.setFontSize(8); doc.setTextColor(24, 24, 27); const words = wrapByWidth(doc, amountInWordsCs(input.amount, input.currency), width); doc.text(words, x, top + 65);
  const wordsBottom = top + 65 + Math.max(0, words.length - 1) * 3.5;
  if (input.currency !== input.homeCurrency) field(doc, "Kurz / částka v domácí měně", `${formatCashReceiptMoney(input.rate ?? 0, input.homeCurrency, input.homeCurrencySymbol)} za ${(input.rateAmount ?? 1).toLocaleString("cs-CZ")} ${input.currencySymbol ?? input.currency} · ${formatCashReceiptMoney(input.amountHome ?? input.amount * (input.rate ?? 0) / (input.rateAmount ?? 1), input.homeCurrency, input.homeCurrencySymbol)}`, x, wordsBottom + 5, width);

  const datesY = wordsBottom + (input.currency !== input.homeCurrency ? 15 : 6);
  field(doc, "Datum vystavení", formatDate(input.dateIssued), x, datesY, 44);
  field(doc, "Datum účetního případu", formatDate(input.dateAccounting), x + 48, datesY, 50);
  if (input.dateTax) field(doc, "DUZP", formatDate(input.dateTax), x + 102, datesY, 35);
  const tableY = datesY + 11;
  const columns = [x, x + 24, x + 48, x + 82, x + width];
  const tableFontSize = input.lines.length > 4 ? 7 : 8;
  const rowHeight = tableFontSize === 7 ? 4 : 5;
  doc.setFillColor(244, 245, 247); doc.rect(x, tableY, width, 6, "F"); doc.setDrawColor(...LINE); doc.rect(x, tableY, width, 6);
  ["MD", "DAL", "Částka", "Text"].forEach((text, index) => { doc.setFont("Roboto", "bold"); doc.setFontSize(tableFontSize); doc.setTextColor(24, 24, 27); doc.text(text, columns[index] + 2, tableY + 4); });
  input.lines.forEach((line, row) => {
    const y = tableY + 6 + row * rowHeight; doc.setFont("Roboto", "normal"); doc.setFontSize(tableFontSize);
    doc.text(line.debit, columns[0] + 2, y + rowHeight - 1.5); doc.text(line.credit, columns[1] + 2, y + rowHeight - 1.5); doc.text(formatCashReceiptMoney(line.amount, input.currency, input.currencySymbol), columns[3] - 2, y + rowHeight - 1.5, { align: "right" }); doc.text(doc.splitTextToSize(line.text, 94)[0] ?? "", columns[3] + 2, y + rowHeight - 1.5); doc.line(x, y + rowHeight, x + width, y + rowHeight);
  });
  const tableBottom = tableY + 6 + input.lines.length * rowHeight;
  const signatureY = fullPage ? Math.min(tableBottom + 12, top + 245) : Math.min(Math.max(tableBottom + 8, top + 108), top + 119);
  const labels = [["Vystavil", input.issuedBy], ["Schválil", input.approvedBy ?? ""], ["Pokladník", ""], [input.direction === "in" ? "Plátce" : "Příjemce", ""]];
  labels.forEach(([label, name], index) => { const sx = x + index * 46; doc.setDrawColor(...LINE); doc.line(sx, signatureY + 8, sx + 40, signatureY + 8); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text(label, sx, signatureY + 12); if (name) { doc.setTextColor(24, 24, 27); doc.text(name, sx, signatureY + 6); } });
  if (input.status === "draft") {
    doc.setTextColor(160, 166, 173); doc.setFont("Roboto", "bold"); doc.setFontSize(23); doc.text("KONCEPT – neplatný doklad", 105, top + 70, { align: "center", angle: 25 });
  }
  drawReceiptFooter(doc, context, logo, fullPage ? top + 282 : top + 139);
}

function cashReceiptNeedsFullPage(input: Pick<CashReceiptPdfInput, "lines" | "amount" | "currency" | "homeCurrency">) {
  const estimatedWordLines = Math.max(1, Math.ceil(amountInWordsCs(input.amount, input.currency).length / 95));
  const availableRows = input.currency !== input.homeCurrency || estimatedWordLines > 2 ? 9 : 10;
  return input.lines.length > availableRows;
}

export async function buildCashReceiptPdf(input: CashReceiptPdfInput, context: PrintContext) {
  const doc = await createPrintDocument("portrait");
  const fullPage = cashReceiptNeedsFullPage(input);
  const logo = await resolveCompanyLogo(context.company, context.settings.footerLogo);
  drawReceipt(doc, input, context, logo, 5, false, fullPage);
  if (input.copies === 2 && !fullPage) {
    doc.setDrawColor(...GRAY); doc.setLineDashPattern([2, 2], 0); doc.line(15, 148, 195, 148); doc.setLineDashPattern([], 0); doc.setFontSize(7); doc.setTextColor(...GRAY);
    doc.setLineWidth(0.3); doc.circle(100.5, 145.7, 1.2); doc.circle(100.5, 148.1, 1.2); doc.line(101.5, 146.4, 104, 148.5); doc.line(101.5, 147.4, 104, 145.3);
    doc.setLineWidth(0.2); doc.setFillColor(255, 255, 255); doc.rect(104, 143.5, 20, 5, "F"); doc.text("odstřihněte", 114, 146.7, { align: "center" });
    drawReceipt(doc, input, context, logo, 151, true, false);
  } else if (input.copies === 2) {
    doc.addPage(); drawReceipt(doc, input, context, logo, 5, true, true);
  }
  return doc.output("blob");
}

export function CashReceiptPrintDialog({ open, onOpenChange, value, context }: { open: boolean; onOpenChange: (open: boolean) => void; value: Omit<CashReceiptPdfInput, "copies"> & { copies?: 1 | 2 }; context: PrintContext }) {
  const [copies, setCopies] = useState<1 | 2>(value.copies ?? 2); const [blob, setBlob] = useState<Blob | null>(null);
  useEffect(() => { let active = true; if (open) void buildCashReceiptPdf({ ...value, copies }, context).then((next) => { if (active) setBlob(next); }); return () => { active = false; }; }, [open, copies, value, context]);
  const fullPage = cashReceiptNeedsFullPage(value);
  return <PrintPreviewDialog open={open} onOpenChange={onOpenChange} blob={blob} title={value.direction === "in" ? "Příjmový pokladní doklad" : "Výdajový pokladní doklad"} companyName={value.company.name} settings={<div className="grid gap-1"><Label htmlFor="cash-receipt-copies">Doklady na A4</Label><OptionSelect id="cash-receipt-copies" value={String(copies)} onChange={(next) => setCopies(next === "1" ? 1 : 2)} options={[{ value: "1", label: "1 doklad" }, { value: "2", label: "2 doklady" }]} />{fullPage ? <p className="max-w-80 text-xs text-muted-foreground">Doklad má více řádků, proto se každá kopie vytiskne na samostatnou A4.</p> : null}</div>} />;
}