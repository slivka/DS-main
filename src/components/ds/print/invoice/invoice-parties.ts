/** Strany faktury · vlastní adresní bloky · neaktualizuje snímek firmy/partnera. */
import type { InvoicePrintAddress } from "./invoice-types";
import { invoiceFont, invoiceWrap, type InvoiceCanvas } from "./invoice-canvas";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Zobrazené řádky adresy. */
function addressLines(p: InvoicePrintAddress): string[] {
  return [
    [p.street, p.house_number].filter(Boolean).join(" "),
    [p.zip, p.city].filter(Boolean).join("  "),
    p.country ?? "",
  ].filter(Boolean);
}
/** Nakreslí všechny strany v jednom nerozděleném pásu. */
export function drawInvoiceParties(c: InvoiceCanvas) {
  const d = c.data,
    gap = d.delivery ? 3.7 : 5.3;
  const widths = d.delivery ? [60.8, 55, 60.8] : [(T.width - gap) / 2, (T.width - gap) / 2];
  const parties = [
    {
      p: d.issuer,
      label: c.texts.supplier,
      tail: d.issuer.registry_court_note ?? "",
      customer: false,
      delivery: false,
    },
    ...(d.delivery
      ? [
          {
            p: d.delivery,
            label: c.texts.delivery,
            tail: d.delivery.contact ?? "",
            customer: false,
            delivery: true,
          },
        ]
      : []),
    { p: d.customer, label: c.texts.customer, tail: "", customer: true, delivery: false },
  ];
  const heights = parties.map((v, i) => {
    const w = (widths[i] ?? 60) - 6;
    return (
      10 +
      invoiceWrap(c, v.p.name, w, 10, true).length * 4.4 +
      addressLines(v.p).length * 4.1 +
      (v.p.ico || v.p.dic ? 6 : 0) +
      (v.tail ? invoiceWrap(c, v.tail, w, 7.5).length * 3.3 : 0)
    );
  });
  const height = Math.max(...heights, 29);
  let x = T.margin;
  parties.forEach((v, i) => {
    const w = widths[i] ?? 60;
    if (v.customer) {
      c.doc.setFillColor(...T.soft);
      c.doc.rect(x, c.y, w, height, "F");
    }
    c.doc.setDrawColor(...T.blue);
    c.doc.setLineWidth(0.5);
    c.doc.setLineDashPattern(v.delivery ? [1.3, 1] : [], 0);
    c.doc.line(x, c.y, x + w, c.y);
    c.doc.setLineDashPattern([], 0);
    let y = c.y + 5;
    invoiceFont(c, 7, false, T.gray);
    c.doc.text(v.label.toUpperCase(), x + 3, y);
    y += 5;
    const name = invoiceWrap(c, v.p.name, w - 6, 10, true);
    invoiceFont(c, 10, true);
    c.doc.text(name, x + 3, y);
    y += name.length * 4.4;
    invoiceFont(c, 9);
    for (const line of addressLines(v.p)) {
      c.doc.text(line, x + 3, y, { maxWidth: w - 6 });
      y += 4.1;
    }
    invoiceFont(c, 8.6);
    const ids = [v.p.ico ? `IČO ${v.p.ico}` : "", v.p.dic ? `DIČ ${v.p.dic}` : ""]
      .filter(Boolean)
      .join("   ");
    if (ids) {
      c.doc.text(ids, x + 3, y, { maxWidth: w - 6 });
      y += 5;
    }
    if (v.tail) {
      const tail = invoiceWrap(c, v.tail, w - 6, v.delivery ? 8.25 : 7.5);
      invoiceFont(c, v.delivery ? 8.25 : 7.5, false, T.gray);
      c.doc.text(tail, x + 3, y);
    }
    x += w + gap;
  });
  c.y += height + 4;
}
