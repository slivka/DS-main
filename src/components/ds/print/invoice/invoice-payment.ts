/** Klíčové údaje C · vlastní pás platby a vektorové QR · hotové částky dodává APP. */
import { invoiceFont, invoiceWrap, type InvoiceCanvas } from "./invoice-canvas";
import {
  formatInvoiceAmount as money,
  formatInvoiceDate,
  invoiceUsesTotal,
} from "./invoice-format";
import { canPrintInvoiceQr, invoiceQrModules } from "./invoice-spayd";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Kreslí QR obdélníky se čtyřmodulovým klidovým okrajem. */
function drawQr(c: InvoiceCanvas, x: number, y: number) {
  const modules = invoiceQrModules(c.data),
    unit = 22 / (modules.length + 8);
  c.doc.setFillColor(...T.white);
  c.doc.rect(x, y, 22, 22, "F");
  c.doc.setFillColor(...T.text);
  modules.forEach((row, r) =>
    row.forEach((dark, col) => {
      if (dark) c.doc.rect(x + (col + 4) * unit, y + (r + 4) * unit, unit, unit, "F");
    }),
  );
  invoiceFont(c, 7, false, T.gray);
  c.doc.text(c.texts.qr, x + 11, y + 25, { align: "center" });
}
/** Výška pásu je nezávislá na QR. */
export function invoicePaymentHeight(c: InvoiceCanvas): number {
  const p = c.data.payment;
  const schedule =
    p.uses_bank_account && c.data.print.options.showPaymentSchedule ? c.data.schedule : [];
  return (
    29 +
    (p.uses_bank_account ? 4 : 0) +
    (schedule.length ? Math.ceil(schedule.length / 2) * 5 + 8 : 0)
  );
}
/** Platební pás, účet a volitelný kalendář. */
export function drawInvoicePayment(c: InvoiceCanvas) {
  const d = c.data,
    p = d.payment,
    t = c.texts,
    y = c.y,
    height = invoicePaymentHeight(c);
  c.doc.setDrawColor(...T.blue);
  c.doc.setLineWidth(0.5);
  c.doc.line(T.margin, y, 197, y);
  invoiceFont(c, 7, false, T.gray);
  c.doc.text((invoiceUsesTotal(d) ? t.total : t.toPay).toUpperCase(), T.margin + 3, y + 6);
  invoiceFont(c, 20, true, T.blue);
  const value = money(invoiceUsesTotal(d) ? d.totals.doc_total : d.totals.to_pay);
  c.doc.text(value, T.margin + 3, y + 16);
  const amountWidth = c.doc.getTextWidth(value);
  invoiceFont(c, 12, true, T.blue);
  c.doc.text(p.currency_code, T.margin + 5 + amountWidth, y + 16);
  invoiceFont(c, 7, false, T.gray);
  c.doc.text(t.due.toUpperCase(), 104, y + 6);
  invoiceFont(c, 12, true);
  c.doc.text(formatInvoiceDate(d.date_due), 104, y + 13);
  invoiceFont(c, 7, false, T.gray);
  c.doc.text((p.uses_bank_account ? t.vs : t.method).toUpperCase(), 141, y + 6);
  invoiceFont(c, 10, true);
  c.doc.text(
    invoiceWrap(
      c,
      p.uses_bank_account ? (p.variable_symbol ?? "") : p.method_name,
      29,
      10,
      true,
    ).slice(0, 3),
    141,
    y + 13,
  );
  if (p.print_text) {
    invoiceFont(c, 8, true, T.blue);
    const text = p.print_text.toUpperCase();
    const w = Math.min(85, c.doc.getTextWidth(text) + 5);
    c.doc.setDrawColor(...T.blue);
    c.doc.setLineWidth(0.4);
    c.doc.rect(T.margin + 3, y + 21, w, 6);
    c.doc.text(text, T.margin + 5, y + 25, { maxWidth: w - 4 });
  }
  if (canPrintInvoiceQr(d)) drawQr(c, 175, y + 4);
  let lineY = y + 29;
  if (p.uses_bank_account) {
    invoiceFont(c, 8);
    const account = [p.account_number, p.bank_code].filter(Boolean).join("/");
    c.doc.text(
      [
        [t.account, account],
        [t.iban, p.iban],
        [t.bic, p.swift],
        [t.ks, p.constant_symbol],
      ]
        .filter(([, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join("    "),
      T.margin + 3,
      lineY,
      { maxWidth: 178 },
    );
    lineY += 5;
    if (d.print.options.showPaymentSchedule && d.schedule.length) {
      invoiceFont(c, 7, false, T.gray);
      c.doc.text(t.schedule.toUpperCase(), T.margin + 3, lineY);
      lineY += 5;
      d.schedule.forEach((s, i) => {
        invoiceFont(c, 8);
        c.doc.text(
          `${i + 1}. ${t.installment} ${formatInvoiceDate(s.due)}  ${money(s.amount)}`,
          T.margin + 3 + (i % 2) * 88,
          lineY,
        );
        if (i % 2 === 1) lineY += 5;
      });
    }
  }
  c.doc.setDrawColor(...T.text);
  c.doc.setLineWidth(0.25);
  c.doc.line(T.margin, y + height, 197, y + height);
  c.y = y + height + 4;
}
