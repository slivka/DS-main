/** Faktura návrh C · skládá sekce společného jsPDF · žádné doménové výpočty ani druhý tiskový systém. */
import { resolveInvoiceOptions } from "./invoice-options";
import { createPrintDocument } from "../report-pdf";
import { INVOICE_PRINT_CS, INVOICE_PRINT_SK } from "../../../../ds-texts/invoice-print-texts";
import type { BuildInvoicePdfOptions, InvoicePrintData } from "./invoice-types";
import type { InvoiceCanvas } from "./invoice-canvas";
import {
  drawInvoiceHeader,
  drawInvoiceContinuation,
  loadInvoiceLogo,
  finishInvoicePages,
} from "./invoice-header";
import { drawInvoiceParties } from "./invoice-parties";
import { drawInvoicePayment } from "./invoice-payment";
import { drawInvoiceItems } from "./invoice-items";
import {
  drawInvoiceAdvances,
  drawInvoiceVat,
  drawInvoiceClosing,
  drawInvoiceIdentityDetails,
} from "./invoice-details";
/** Vykreslí hotový výstup document_print_data do A4 s Roboto. */
export async function buildInvoicePdf(
  data: InvoicePrintData,
  opts: BuildInvoicePdfOptions = {},
): Promise<Blob> {
  const [doc, logo] = await Promise.all([
    createPrintDocument(),
    loadInvoiceLogo(opts.logoImage ?? data.issuer.logo_image ?? data.issuer.logo_path),
  ]);
  const c: InvoiceCanvas = {
    doc,
    data: { ...data, print: { ...data.print, options: resolveInvoiceOptions(data.print.options) } },
    opts,
    texts: { ...(opts.locale === "sk" ? INVOICE_PRINT_SK : INVOICE_PRINT_CS), ...opts.texts },
    y: 35,
    nextPage: () => {
      doc.addPage();
      drawInvoiceContinuation(c);
    },
  };
  drawInvoiceHeader(c, logo);
  drawInvoiceParties(c);
  drawInvoicePayment(c);
  drawInvoiceIdentityDetails(c);
  drawInvoiceItems(c);
  drawInvoiceAdvances(c);
  drawInvoiceVat(c);
  drawInvoiceClosing(c);
  finishInvoicePages(c);
  opts.onPageCount?.(doc.getNumberOfPages());
  doc.setProperties({
    title: data.title,
    subject: data.is_draft ? c.texts.draft : (data.number ?? ""),
    author: data.issuer.name,
  });
  return doc.output("blob");
}
