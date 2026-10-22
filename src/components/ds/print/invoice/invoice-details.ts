/** Další sekce faktury · vlastní odečty, rekapitulaci a převzetí · hodnoty výhradně APP. */
import {
  invoiceEnsure,
  invoiceFont,
  invoiceText,
  invoiceWrap,
  type InvoiceCanvas,
} from "./invoice-canvas";
import {
  formatInvoiceAmount as money,
  formatInvoiceDate,
  formatInvoiceRate,
} from "./invoice-format";
import { invoiceHomeCurrency, resolveInvoiceOptions } from "./invoice-options";
import { drawInvoiceTable } from "./invoice-table";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Seznam záloh nebo souhrn všech čísel. */
export function drawInvoiceAdvances(c: InvoiceCanvas) {
  const a = c.data.advances,
    t = c.texts;
  if (!a.length) return;
  if (!resolveInvoiceOptions(c.data.print.options).showAdvanceDetail) {
    invoiceText(
      c,
      `${t.advances} (${a.length}): ${a.flatMap((v) => v.advance_list_numbers).join(", ")} · ${money(c.data.totals.advances_deducted)}`,
      t.advances,
    );
    return;
  }
  drawInvoiceTable(
    c,
    t.advances,
    [
      { label: t.advanceList, width: 33 },
      { label: t.taxDocument, width: 31 },
      { label: t.paidOn, width: 23 },
      { label: "VS", width: 22 },
      { label: t.base, width: 25, right: true },
      { label: t.vat, width: 22, right: true },
      { label: t.amount, width: 28, right: true },
    ],
    a.map((v) => [
      { text: v.advance_list_numbers.join(", ") },
      { text: v.tax_document_number ?? t.noTaxDocument, muted: !v.tax_document_number },
      { text: formatInvoiceDate(v.paid_on) },
      { text: v.variable_symbol ?? "" },
      { text: money(v.base) },
      { text: money(v.vat) },
      { text: money(v.amount) },
    ]),
  );
}
/** Rekapitulace nezmění ani nepřepočítá jedinou daňovou hodnotu. */
export function drawInvoiceVat(c: InvoiceCanvas) {
  const d = c.data,
    t = c.texts;
  if (d.kind === "invoice_non_vat") return;
  const home = invoiceHomeCurrency(c.opts);
  const foreign = Boolean(home && d.payment.currency_code !== home.code);
  const currency = d.payment.currency_code;
  if (d.vat_recap.length) {
    const title = `${t.vatRecap}${d.informative || d.kind === "advance" ? ` (${t.informative})` : ""}`;
    const columns = foreign
      ? [
          { label: t.rate, width: 34 },
          { label: `${t.base} ${currency}`, width: 30, right: true },
          { label: `${t.vat} ${currency}`, width: 28, right: true },
          { label: `${t.base} ${home?.symbol}`, width: 32, right: true },
          { label: `${t.vat} ${home?.symbol}`, width: 28, right: true, bold: true },
          { label: `${t.total} ${home?.symbol}`, width: 32, right: true },
        ]
      : [
          { label: t.rate, width: 49 },
          { label: t.base, width: 45, right: true },
          { label: t.vat, width: 45, right: true },
          { label: t.total, width: 45, right: true },
        ];
    drawInvoiceTable(
      c,
      title,
      columns,
      d.vat_recap.map((r) => [
        {
          text: r.regime_text || (r.rate != null ? `${r.rate} %` : ""),
          muted: Boolean(r.regime_text),
        },
        { text: money(r.base) },
        { text: money(r.vat) },
        ...(foreign
          ? [
              { text: money(r.base_home) },
              { text: money(r.vat_home), bold: true },
              { text: money(r.total_home) },
            ]
          : [{ text: money(r.total) }]),
      ]),
    );
    if (foreign && home && d.totals.rate != null) {
      const values = {
        source: d.totals.rate_source ?? "",
        rate: formatInvoiceRate(d.totals.rate, c.opts.locale),
        home: home.symbol,
        currency,
        date: formatInvoiceDate(d.date_tax ?? d.totals.rate_date),
        vat: money(d.totals.vat_home),
      };
      invoiceText(
        c,
        t.rateSentence.replace(
          /\{(source|rate|home|currency|date|vat)\}/g,
          (_, key: keyof typeof values) => values[key],
        ),
      );
    }
  }
  for (const text of d.vat_texts) {
    const lines = invoiceWrap(c, text, T.width - 8),
      height = lines.length * T.lineHeight + 6;
    invoiceEnsure(c, height);
    c.doc.setFillColor(...T.soft);
    c.doc.rect(T.margin, c.y, T.width, height, "F");
    c.doc.setDrawColor(...T.gray);
    c.doc.setLineWidth(0.8);
    c.doc.line(T.margin, c.y, T.margin, c.y + height);
    invoiceFont(c, 9, false, T.gray);
    c.doc.text(lines, T.margin + 4, c.y + 5);
    c.y += height + 4;
  }
}
/** Oprava/přijatá platba jsou texty dodané APP. */
export function drawInvoiceIdentityDetails(c: InvoiceCanvas) {
  if (c.data.original_number)
    invoiceText(c, `${c.texts.originalNumber}: ${c.data.original_number}`);
  if (c.data.correction_reason)
    invoiceText(c, `${c.texts.correctionReason}: ${c.data.correction_reason}`);
  if (c.data.payment_received_date)
    invoiceText(
      c,
      `${c.texts.paymentReceived}: ${formatInvoiceDate(c.data.payment_received_date)}`,
    );
}
/** Poznámka a nerozdělené pole převzetí. */
export function drawInvoiceClosing(c: InvoiceCanvas) {
  invoiceText(c, c.data.print.note ?? "", c.texts.note);
  if (!resolveInvoiceOptions(c.data.print.options).showSignature) return;
  invoiceEnsure(c, 24);
  invoiceFont(c, 8, false, T.gray);
  c.doc.text(c.texts.receivedSignature, T.margin, c.y + 5);
  c.doc.text(c.texts.issuerSignature, 116, c.y + 5);
  c.doc.setDrawColor(...T.line);
  c.doc.setLineWidth(0.25);
  c.doc.line(T.margin, c.y + 21, 95, c.y + 21);
  c.doc.line(116, c.y + 21, 197, c.y + 21);
  c.y += 25;
}
