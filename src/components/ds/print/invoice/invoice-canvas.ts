/** Tisková plocha · vlastní měření textu a stránky · nesmí počítat hodnoty dokladu. */
import type { jsPDF } from "jspdf";
import type { BuildInvoicePdfOptions, InvoicePrintData } from "./invoice-types";
import type { InvoicePrintTexts } from "../../../../ds-texts/invoice-print-texts";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Sdílený stav vykreslování sekcí. */
export interface InvoiceCanvas {
  /** PDF se společnými Roboto fonty. */ doc: jsPDF;
  /** Hotová data. */ data: InvoicePrintData;
  /** Texty. */ texts: InvoicePrintTexts;
  /** Nastavení. */ opts: BuildInvoicePdfOptions;
  /** Aktuální y v mm. */ y: number;
  /** Nová strana s kompaktním záhlavím. */ nextPage: () => void;
}
/** Roboto s pevnými tiskovými tokeny. */
export function invoiceFont(c: InvoiceCanvas, size = T.bodySize, bold = false, color = T.text) {
  c.doc.setFont("Roboto", bold ? "bold" : "normal");
  c.doc.setFontSize(size);
  c.doc.setTextColor(...color);
}
/** Zalomí text podle skutečných metrik PDF. */
export function invoiceWrap(
  c: InvoiceCanvas,
  text: string,
  width: number,
  size = T.bodySize,
  bold = false,
): string[] {
  invoiceFont(c, size, bold);
  return c.doc.splitTextToSize(text, width) as string[];
}
/** Výška textu v mm. */
export function invoiceTextHeight(c: InvoiceCanvas, text: string, width = T.width): number {
  return text ? invoiceWrap(c, text, width).length * T.lineHeight + 3 : 0;
}
/** Nedělitelná sekce přejde celá na další stranu. */
export function invoiceEnsure(c: InvoiceCanvas, height: number) {
  if (c.y + height > T.bottom && c.y > T.continuationTop) c.nextPage();
}
/** Textový blok včetně dlouhého textu přes stránky. */
export function invoiceText(c: InvoiceCanvas, text: string, title?: string) {
  if (!text) return;
  const rows = invoiceWrap(c, text, T.width);
  invoiceEnsure(c, rows.length * T.lineHeight + (title ? 9 : 3));
  if (title) {
    invoiceFont(c, T.labelSize, false, T.gray);
    c.doc.text(title.toUpperCase(), T.margin, c.y + 3);
    c.y += 7;
  }
  for (const row of rows) {
    invoiceEnsure(c, T.lineHeight);
    invoiceFont(c);
    c.doc.text(row, T.margin, c.y + 3);
    c.y += T.lineHeight;
  }
  c.y += 3;
}
