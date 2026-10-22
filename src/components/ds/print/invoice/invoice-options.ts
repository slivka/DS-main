/** Tiskové výchozí hodnoty · vlastní normalizaci voleb · ignoruje zastaralé přepínače. */
import type { BuildInvoicePdfOptions, InvoicePrintOptions } from "./invoice-types";
/** Jediné výchozí hodnoty formuláře i PDF. */
export const INVOICE_OPTION_DEFAULTS = {
  showPaymentSchedule: false,
  showAdvanceDetail: true,
  showQr: true,
  showSignature: false,
  showIssuedBy: true,
};
/** Doplní chybějící volby bez převzetí zastaralých klíčů. */
export function resolveInvoiceOptions(options: InvoicePrintOptions) {
  return {
    showPaymentSchedule: options.showPaymentSchedule ?? INVOICE_OPTION_DEFAULTS.showPaymentSchedule,
    showAdvanceDetail: options.showAdvanceDetail ?? INVOICE_OPTION_DEFAULTS.showAdvanceDetail,
    showQr: options.showQr ?? INVOICE_OPTION_DEFAULTS.showQr,
    showSignature: options.showSignature ?? INVOICE_OPTION_DEFAULTS.showSignature,
    showIssuedBy: options.showIssuedBy ?? INVOICE_OPTION_DEFAULTS.showIssuedBy,
  };
}
/** Domácí měna tisku; APP může výchozí českou měnu přepsat. */
export function invoiceHomeCurrency(opts: BuildInvoicePdfOptions) {
  return opts.homeCurrency ?? { code: "CZK", symbol: "Kč" };
}
