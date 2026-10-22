/** Hlavička a zápatí C · vlastní firemní snímek a pevné sloupce · bez generování loga. */
import type { InvoiceCanvas } from "./invoice-canvas";
import { invoiceFont, invoiceWrap } from "./invoice-canvas";
import { resolveInvoiceOptions } from "./invoice-options";
import { formatInvoiceDate } from "./invoice-format";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Vyřešený nahraný obrázek se skutečnými rozměry. */
export interface InvoiceLogo {
  /** Obrázek. */ data: string;
  /** Šířka. */ width: number;
  /** Výška. */ height: number;
}
/** Načte pouze nahrané logo, bez monogramu i při chybě. */
export async function loadInvoiceLogo(url?: string | null): Promise<InvoiceLogo | null> {
  if (!url || typeof Image === "undefined") return null;
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0);
        resolve({
          data: canvas.toDataURL("image/png"),
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
}
/** První strana má pás přes celý list. */
export function drawInvoiceHeader(c: InvoiceCanvas, logo: InvoiceLogo | null) {
  const { doc, data, texts: t } = c;
  doc.setFillColor(...T.soft);
  doc.rect(0, 0, 210, T.headerHeight, "F");
  let nameX = T.margin;
  if (logo) {
    const square = Math.abs(logo.width / logo.height - 1) < 0.15;
    const scale = Math.min((square ? 12.7 : 58) / logo.width, (square ? 12.7 : 11.6) / logo.height);
    doc.addImage(logo.data, "PNG", T.margin, 6.4, logo.width * scale, logo.height * scale);
    nameX += logo.width * scale + 3;
  }
  if (!logo || !data.issuer.logo_contains_name) {
    invoiceFont(c, logo ? 12 : 15, true, logo ? T.text : T.blue);
    const name = invoiceWrap(
      c,
      data.issuer.name,
      Math.max(20, 78 - (nameX - T.margin)),
      logo ? 12 : 15,
      true,
    );
    invoiceFont(c, logo ? 12 : 15, true, logo ? T.text : T.blue);
    doc.text(name.slice(0, 3), nameX, logo ? 12 : 13);
  }
  doc.setDrawColor(...T.line);
  doc.setLineWidth(0.25);
  doc.line(91, 6.4, 91, 24.2);
  const dates = [
    [t.issuedDate, formatInvoiceDate(data.date_issued)],
    [t.taxDate, formatInvoiceDate(data.date_tax)],
    [t.order, data.customer_order_ref],
  ].filter(([, v]) => Boolean(v));
  dates.forEach(([label, value], i) => {
    invoiceFont(c, 8.25, false, T.gray);
    doc.text(label ?? "", 118, 10 + i * 5, { align: "right" });
    invoiceFont(c, 8.25);
    doc.text(invoiceWrap(c, value ?? "", 27, 8.25)[0] ?? "", 120, 10 + i * 5);
  });
  invoiceFont(c, 7, false, T.gray);
  doc.text((data.subtitle ?? "").toUpperCase(), 197, 8, { align: "right" });
  invoiceFont(c, 11);
  doc.text(invoiceWrap(c, data.title, 48, 11).slice(0, 2), 197, 13, { align: "right" });
  invoiceFont(c, 20, true, T.blue);
  doc.text(data.is_draft ? t.draft : (data.number ?? ""), 197, 24, {
    align: "right",
    maxWidth: 49,
  });
  c.y = 35;
}
/** Kompaktní záhlaví pokračování. */
export function drawInvoiceContinuation(c: InvoiceCanvas) {
  invoiceFont(c, 9, true);
  c.doc.text(c.data.issuer.name, T.margin, 15, { maxWidth: 78 });
  invoiceFont(c, 8, false, T.gray);
  c.doc.text(
    `${c.data.title} ${c.data.is_draft ? c.texts.draft : (c.data.number ?? "")} · ${c.texts.continuation}`,
    197,
    15,
    { align: "right", maxWidth: 100 },
  );
  c.doc.setDrawColor(...T.text);
  c.doc.setLineWidth(0.25);
  c.doc.line(T.margin, 19, 197, 19);
  c.y = T.continuationTop;
}
/** Pevné sloupce zápatí; vypnutí Vystavil nehne ostatními. */
export function invoiceFooterColumns(c: InvoiceCanvas): [string, string, string] {
  const d = c.data;
  return [
    resolveInvoiceOptions(d.print.options).showIssuedBy && d.print.issued_by_name?.trim()
      ? [
          `${c.texts.issuedBy}: ${d.print.issued_by_name ?? ""}`,
          d.print.issued_by_phone,
          d.print.issued_by_email,
        ]
          .filter(Boolean)
          .join("\n")
      : "",
    [d.issuer.website, d.issuer.email, d.issuer.phone].filter(Boolean).join(" · ") +
      "\n" +
      [d.issuer.name, d.issuer.ico ? `IČO ${d.issuer.ico}` : ""].filter(Boolean).join(" · "),
    `${c.texts.invoiceNumber} ${d.is_draft ? c.texts.draft : (d.number ?? "")}`,
  ];
}
/** Vodoznak a zápatí na každé dokončené straně. */
export function finishInvoicePages(c: InvoiceCanvas) {
  const total = c.doc.getNumberOfPages();
  const cols = invoiceFooterColumns(c);
  for (let page = 1; page <= total; page++) {
    c.doc.setPage(page);
    if (c.data.is_draft) {
      c.doc.saveGraphicsState();
      c.doc.setGState(c.doc.GState({ opacity: 0.08 }));
      invoiceFont(c, 62, true, T.draft);
      c.doc.text(c.texts.draft, 44, 176, { angle: -30 });
      c.doc.restoreGraphicsState();
    }
    c.doc.setDrawColor(...T.line);
    c.doc.setLineWidth(0.25);
    c.doc.line(T.margin, 281, 197, 281);
    invoiceFont(c, 7, false, T.gray);
    c.doc.text(invoiceWrap(c, cols[0], 45, 7), T.margin, 285);
    invoiceFont(c, 7, false, T.gray);
    c.doc.text(invoiceWrap(c, cols[1], 76, 7), 62, 285);
    invoiceFont(c, 7, false, T.gray);
    c.doc.text(cols[2], 197, 285, { align: "right", maxWidth: 54 });
    c.doc.text(`${c.texts.page} ${page} ${c.texts.of} ${total}`, 197, 289, { align: "right" });
  }
}
