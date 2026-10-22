/** QR Platba · vlastní SPAYD a moduly QR · nepřepočítává částku ani účet. */
import qrcode from "qrcode-generator";
import { resolveInvoiceOptions } from "./invoice-options";
import type { InvoicePrintData } from "./invoice-types";
/** Čistý SPAYD 1.0; hvězdičky v hodnotách se percent-escapují. */
export function buildSpayd(data: InvoicePrintData): string {
  const p = data.payment;
  const escape = (value: string) =>
    value
      .replace(/%/g, "%25")
      .replace(/\*/g, "%2A")
      .replace(/[\r\n]/g, " ");
  const symbol = (value: string | null | undefined, max: number) =>
    value && new RegExp(`^\\d{1,${max}}$`).test(value) ? value : null;
  const fields: Array<[string, string | undefined | null]> = [
    [
      "ACC",
      `${(p.iban ?? "").replace(/\s/g, "").toUpperCase()}${p.swift ? `+${p.swift.replace(/\s/g, "").toUpperCase()}` : ""}`,
    ],
    ["AM", data.totals.to_pay.toFixed(2)],
    ["CC", p.currency_code.toUpperCase()],
    ["X-VS", symbol(p.variable_symbol, 10)],
    ["X-KS", symbol(p.constant_symbol, 4)],
    ["X-SS", symbol(p.specific_symbol, 10)],
    ["DT", data.date_due?.slice(0, 10).replace(/-/g, "")],
    [
      "MSG",
      data.number ? `${data.title} ${data.number}`.replace(/[\r\n]/g, " ").slice(0, 60) : null,
    ],
  ];
  return `SPD*1.0*${fields
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}:${escape(v ?? "")}`)
    .join("*")}`;
}
/** Podmínky QR jsou výhradně prezentační pravidla. */
export function canPrintInvoiceQr(data: InvoicePrintData): boolean {
  return (
    resolveInvoiceOptions(data.print.options).showQr &&
    data.totals.to_pay > 0 &&
    data.kind !== "advance_tax" &&
    data.payment.uses_bank_account &&
    data.payment.currency_code === "CZK" &&
    Boolean(data.payment.iban) &&
    !data.is_draft
  );
}
/** Moduly generuje ověřená QR knihovna; PDF je kreslí bez bitmapy. */
export function invoiceQrModules(data: InvoicePrintData): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(buildSpayd(data));
  qr.make();
  return Array.from({ length: qr.getModuleCount() }, (_, row) =>
    Array.from({ length: qr.getModuleCount() }, (_, col) => qr.isDark(row, col)),
  );
}
