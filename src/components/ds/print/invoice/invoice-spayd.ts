/** QR Platba · vlastní SPAYD a moduly QR · nepřepočítává částku ani účet. */
import qrcode from "qrcode-generator";
import type { InvoicePrintData } from "./invoice-types";
/** Čistý SPAYD 1.0; hvězdičky v hodnotách se percent-escapují. */
export function buildSpayd(data: InvoicePrintData): string {
  const p = data.payment;
  const escape = (value: string) =>
    value
      .replace(/%/g, "%25")
      .replace(/\*/g, "%2A")
      .replace(/[\r\n]/g, " ");
  const fields: Array<[string, string | undefined | null]> = [
    [
      "ACC",
      `${(p.iban ?? "").replace(/\s/g, "").toUpperCase()}${p.swift ? `+${p.swift.replace(/\s/g, "").toUpperCase()}` : ""}`,
    ],
    ["AM", data.totals.to_pay.toFixed(2)],
    ["CC", p.currency_code.toUpperCase()],
    ["X-VS", p.variable_symbol],
    ["X-KS", p.constant_symbol],
    ["X-SS", p.specific_symbol],
    ["DT", data.date_due?.slice(0, 10).replace(/-/g, "")],
    ["MSG", data.number ? `Faktura ${data.number}` : null],
  ];
  return `SPD*1.0*${fields
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => `${k}:${escape(v ?? "")}`)
    .join("*")}`;
}
/** Podmínky QR jsou výhradně prezentační pravidla. */
export function canPrintInvoiceQr(data: InvoicePrintData): boolean {
  return (
    data.print.options.showQr &&
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
