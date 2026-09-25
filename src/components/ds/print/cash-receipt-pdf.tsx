import { useEffect, useState } from "react";
import { Label } from "../../ui/label";
import { OptionSelect } from "../form/option-select";
import { amountInWordsCs, createPrintDocument, drawPrintFooter, resolveCompanyLogo, type PrintCompany, type PrintContext } from "./report-pdf";
import { PrintPreviewDialog } from "./print-preview-dialog";

export interface CashReceiptPdfInput {
  direction: "in" | "out";
  number?: string | null;
  bookName: string;
  company: PrintCompany;
  counterparty: { name: string; ico?: string; dic?: string; address?: string };
  purpose: string;
  amount: number;
  currency: string;
  homeCurrency: string;
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
  copies: 1 | 2;
}

const NAVY: [number, number, number] = [28, 72, 119];
const GRAY: [number, number, number] = [102, 112, 123];
const LINE: [number, number, number] = [201, 208, 216];
const formatMoney = (value: number, currency: string) => `${value < 0 ? "−" : ""}${Math.abs(value).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
const formatDate = (value: string | Date) => (value instanceof Date ? value : new Date(value)).toLocaleDateString("cs-CZ");

function field(doc: Awaited<ReturnType<typeof createPrintDocument>>, label: string, value: string, x: number, y: number, width: number) {
  doc.setFont("Roboto", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text(label, x, y);
  doc.setFontSize(8.5); doc.setTextColor(24, 24, 27); const lines = doc.splitTextToSize(value || "—", width); doc.text(lines, x, y + 4);
}

function drawReceipt(doc: Awaited<ReturnType<typeof createPrintDocument>>, input: CashReceiptPdfInput, top: number, copy: boolean) {
  const x = 15; const width = 180;
  doc.setTextColor(...NAVY); doc.setFont("Roboto", "bold"); doc.setFontSize(15);
  doc.text(input.direction === "in" ? "PŘÍJMOVÝ POKLADNÍ DOKLAD" : "VÝDAJOVÝ POKLADNÍ DOKLAD", x, top + 11);
  doc.setFont("Roboto", "bold"); doc.setFontSize(16); doc.text(input.status === "draft" ? "—" : input.number || "—", x + width, top + 10, { align: "right" });
  doc.setFont("Roboto", "normal"); doc.setFontSize(8); doc.setTextColor(...GRAY); doc.text(input.bookName, x + width, top + 15, { align: "right" });
  if (copy) { doc.setDrawColor(...LINE); doc.roundedRect(x + width - 18, top + 18, 18, 6, 1, 1); doc.setFontSize(7); doc.text("kopie", x + width - 9, top + 22, { align: "center" }); }
  doc.setDrawColor(...LINE); doc.line(x, top + 19, x + width, top + 19);

  field(doc, "Vystavitel", [input.company.name, input.company.address, input.company.ico ? `IČO ${input.company.ico}` : "", input.company.dic ? `DIČ ${input.company.dic}` : ""].filter(Boolean).join(" · "), x, top + 25, 112);
  field(doc, input.direction === "in" ? "Přijato od" : "Vyplaceno komu", [input.counterparty.name, input.counterparty.ico ? `IČO ${input.counterparty.ico}` : "", input.counterparty.dic ? `DIČ ${input.counterparty.dic}` : "", input.counterparty.address].filter(Boolean).join(" · "), x, top + 38, 112);
  field(doc, "Účel platby", input.purpose, x, top + 51, 112);
  doc.setDrawColor(...NAVY); doc.setLineWidth(0.35); doc.roundedRect(x + 119, top + 24, 61, 23, 1.5, 1.5);
  doc.setFont("Roboto", "bold"); doc.setFontSize(15); doc.setTextColor(...NAVY); doc.text(formatMoney(input.amount, input.currency), x + 176, top + 38, { align: "right" });
  doc.setFont("Roboto", "normal"); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text("Částka", x + 123, top + 29);
  field(doc, "Slovy", amountInWordsCs(input.amount, input.currency), x + 119, top + 51, 61);
  if (input.currency !== input.homeCurrency) field(doc, "Kurz / částka v domácí měně", `${formatMoney(input.rate ?? 0, input.homeCurrency)} za ${(input.rateAmount ?? 1).toLocaleString("cs-CZ")} ${input.currency} · ${formatMoney(input.amountHome ?? input.amount * (input.rate ?? 0) / (input.rateAmount ?? 1), input.homeCurrency)}`, x + 119, top + 61, 61);

  field(doc, "Datum vystavení", formatDate(input.dateIssued), x, top + 67, 44);
  field(doc, "Datum účetního případu", formatDate(input.dateAccounting), x + 48, top + 67, 50);
  if (input.dateTax) field(doc, "DUZP", formatDate(input.dateTax), x + 102, top + 67, 35);
  const tableY = top + 78;
  const columns = [x, x + 24, x + 48, x + 82, x + width];
  doc.setFillColor(244, 245, 247); doc.rect(x, tableY, width, 6, "F"); doc.setDrawColor(...LINE); doc.rect(x, tableY, width, 6);
  ["MD", "DAL", "Částka", "Text"].forEach((text, index) => { doc.setFont("Roboto", "bold"); doc.setFontSize(7); doc.setTextColor(24, 24, 27); doc.text(text, columns[index] + 2, tableY + 4); });
  input.lines.slice(0, 4).forEach((line, row) => {
    const y = tableY + 6 + row * 5; doc.setFont("Roboto", "normal"); doc.setFontSize(7);
    doc.text(line.debit, columns[0] + 2, y + 3.5); doc.text(line.credit, columns[1] + 2, y + 3.5); doc.text(formatMoney(line.amount, input.currency), columns[3] - 2, y + 3.5, { align: "right" }); doc.text(doc.splitTextToSize(line.text, 94)[0] ?? "", columns[3] + 2, y + 3.5); doc.line(x, y + 5, x + width, y + 5);
  });
  const signatureY = top + 116;
  const labels = [["Vystavil", input.issuedBy], ["Schválil", input.approvedBy ?? ""], ["Pokladník", ""], [input.direction === "in" ? "Plátce" : "Příjemce", ""]];
  labels.forEach(([label, name], index) => { const sx = x + index * 46; doc.setDrawColor(...LINE); doc.line(sx, signatureY + 8, sx + 40, signatureY + 8); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text(label, sx, signatureY + 12); if (name) { doc.setTextColor(24, 24, 27); doc.text(name, sx, signatureY + 6); } });
  if (input.status === "draft") {
    doc.setTextColor(160, 166, 173); doc.setFont("Roboto", "bold"); doc.setFontSize(23); doc.text("KONCEPT – neplatný doklad", 105, top + 70, { align: "center", angle: 25 });
  }
}

export async function buildCashReceiptPdf(input: CashReceiptPdfInput, context: PrintContext) {
  const doc = await createPrintDocument("portrait");
  drawReceipt(doc, input, 5, false);
  if (input.copies === 2) {
    doc.setDrawColor(...GRAY); doc.setLineDashPattern([2, 2], 0); doc.line(15, 148, 195, 148); doc.setLineDashPattern([], 0); doc.setFontSize(7); doc.setTextColor(...GRAY); doc.text("✂  odstřihněte", 105, 146.5, { align: "center" });
    doc.setLineWidth(0.3); doc.circle(100.5, 145.7, 1.2); doc.circle(100.5, 148.1, 1.2); doc.line(101.5, 146.4, 104, 148.5); doc.line(101.5, 147.4, 104, 145.3);
    doc.setFillColor(255, 255, 255); doc.rect(104, 143.5, 20, 5, "F"); doc.text("odstřihněte", 114, 146.7, { align: "center" });
    drawReceipt(doc, input, 151, true);
  }
  const logo = await resolveCompanyLogo(context.company, context.settings.footerLogo);
  await drawPrintFooter(doc, context, logo, false);
  return doc.output("blob");
}

export function CashReceiptPrintDialog({ open, onOpenChange, value, context }: { open: boolean; onOpenChange: (open: boolean) => void; value: Omit<CashReceiptPdfInput, "copies"> & { copies?: 1 | 2 }; context: PrintContext }) {
  const [copies, setCopies] = useState<1 | 2>(value.copies ?? 2); const [blob, setBlob] = useState<Blob | null>(null);
  useEffect(() => { let active = true; if (open) void buildCashReceiptPdf({ ...value, copies }, context).then((next) => { if (active) setBlob(next); }); return () => { active = false; }; }, [open, copies, value, context]);
  return <PrintPreviewDialog open={open} onOpenChange={onOpenChange} blob={blob} title={value.direction === "in" ? "Příjmový pokladní doklad" : "Výdajový pokladní doklad"} companyName={value.company.name} settings={<div className="grid gap-1"><Label htmlFor="cash-receipt-copies">Doklady na A4</Label><OptionSelect id="cash-receipt-copies" value={String(copies)} onChange={(next) => setCopies(next === "1" ? 1 : 2)} options={[{ value: "1", label: "1 doklad" }, { value: "2", label: "2 doklady" }]} /></div>} />;
}