/** Součty faktury · vlastní pouze zobrazení dodaných součtů · nikdy je neodvozuje z položek. */
import { invoiceFont, invoiceTextHeight, invoiceWrap, type InvoiceCanvas } from "./invoice-canvas";
import { formatInvoiceAmount as money, invoiceUsesTotal } from "./invoice-format";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Součtový řádek. */
export interface InvoiceTotalRow {
  /** Popisek. */ label: string;
  /** Hodnota. */ value: string;
  /** Tučně. */ bold?: boolean;
  /** Podklad. */ accent?: boolean;
  /** Šedá. */ muted?: boolean;
}
/** Sestaví jen prezentační popisky a hotové hodnoty APP. */
export function invoiceTotalRows(c: InvoiceCanvas): InvoiceTotalRow[] {
  const d = c.data,
    s = d.totals,
    t = c.texts,
    currency = d.payment.currency_code;
  const rows: InvoiceTotalRow[] = [];
  if (s.base_total != null) rows.push({ label: t.baseTotal, value: money(s.base_total) });
  if (s.vat_total != null || s.vat_total_text)
    rows.push({ label: t.vatTotal, value: s.vat_total_text || money(s.vat_total) });
  if (s.rounding) rows.push({ label: t.rounding, value: money(s.rounding) });
  rows.push({ label: `${t.total} ${currency}`, value: money(s.total_before_advances), bold: true });
  if (
    s.total_home != null &&
    s.rate &&
    c.opts.homeCurrency &&
    currency !== c.opts.homeCurrency.code
  ) {
    rows.push({
      label: t.totalHome
        .replace("{home}", c.opts.homeCurrency.symbol)
        .replace("{rate}", String(s.rate)),
      value: money(s.total_home),
      muted: true,
    });
  }
  if (d.advances.length) rows.push({ label: t.advances, value: money(s.advances_deducted) });
  if (!invoiceUsesTotal(d) || d.advances.length)
    rows.push({
      label: invoiceUsesTotal(d) ? t.afterAdvances : t.toPay,
      value: `${money(s.to_pay)} ${currency}`,
      bold: true,
      accent: true,
    });
  return rows;
}
/** Výška součtů a textu pod položkami, vždy s koncem tabulky. */
export function invoiceTotalsHeight(c: InvoiceCanvas): number {
  return (
    Math.max(
      invoiceTotalRows(c).length * 5 + 4,
      invoiceTextHeight(c, c.data.print.footer_text ?? "", 99),
    ) + 4
  );
}
/** Součty 79 mm napravo, text vlevo. */
export function drawInvoiceTotals(c: InvoiceCanvas) {
  const start = c.y + 3,
    rows = invoiceTotalRows(c);
  let y = start;
  if (c.data.print.footer_text) {
    const lines = invoiceWrap(c, c.data.print.footer_text, 99);
    invoiceFont(c);
    c.doc.text(lines, T.margin, start + 3);
  }
  rows.forEach((row) => {
    if (row.accent) {
      c.doc.setFillColor(...T.soft);
      c.doc.rect(118, y, 79, 5, "F");
    } else if (row.bold) {
      c.doc.setDrawColor(...T.text);
      c.doc.setLineWidth(0.25);
      c.doc.line(118, y, 197, y);
    }
    invoiceFont(
      c,
      row.accent ? 10.5 : 9,
      row.bold,
      row.accent ? T.blue : row.muted ? T.gray : T.text,
    );
    c.doc.text(row.label, 120, y + 4, { maxWidth: 48 });
    c.doc.text(row.value, 195, y + 4, { align: "right", maxWidth: 46 });
    y += 5;
  });
  c.y += invoiceTotalsHeight(c);
}
