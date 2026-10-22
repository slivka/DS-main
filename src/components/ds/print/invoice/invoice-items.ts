/** Položky C · vlastní dělení po řádcích a součty s koncem · žádné výpočty DPH. */
import {
  invoiceEnsure,
  invoiceText,
  invoiceTextHeight,
  type InvoiceCanvas,
} from "./invoice-canvas";
import { formatInvoiceAmount as money, formatInvoiceQuantity } from "./invoice-format";
import { INVOICE_THEME as T } from "./invoice-theme";
import {
  drawInvoiceTableHead,
  drawInvoiceTableRow,
  measureInvoiceRows,
  type InvoiceTableColumn,
} from "./invoice-table";
import { drawInvoiceTotals, invoiceTotalsHeight } from "./invoice-totals";
/** Plán jednotlivých skupin položek; konečné součty pouze s poslední skupinou. */
export function planInvoiceItemPages(
  heights: number[],
  available: number,
  full: number,
  tail: number,
  head = T.tableHeadHeight,
): number[][] {
  const pages: number[][] = [];
  let remaining = heights.reduce((sum, height) => sum + height, 0);
  let index = 0,
    space = available;
  while (index < heights.length) {
    if (head + remaining + tail <= space) {
      pages.push(heights.slice(index).map((_, i) => index + i));
      break;
    }
    let count = 0,
      used = head;
    while (index + count < heights.length && used + (heights[index + count] ?? 0) <= space) {
      used += heights[index + count] ?? 0;
      count++;
    }
    if (heights.length - index - count === 1 && count > 2) count--;
    if (count < 2 && heights.length - index >= 2 && space < full) {
      pages.push([]);
      space = full;
      continue;
    }
    if (count >= heights.length - index) {
      count = Math.max(0, count - 2);
    }
    if (count === 0 && space < full) {
      pages.push([]);
      space = full;
      continue;
    }
    if (count === 0) count = Math.min(2, heights.length - index);
    pages.push(Array.from({ length: count }, (_, i) => index + i));
    remaining -= heights.slice(index, index + count).reduce((sum, height) => sum + height, 0);
    index += count;
    space = full;
  }
  if (!heights.length) pages.push([]);
  return pages;
}
/** Úvod patří k prvnímu řádku, zápatí a součty k poslednímu. */
export function drawInvoiceItems(c: InvoiceCanvas) {
  const t = c.texts;
  const columns: InvoiceTableColumn[] = [
    { label: t.description, width: 75 },
    { label: t.quantity, width: 20, right: true },
    { label: t.unit, width: 11 },
    { label: t.unitPrice, width: 28, right: true },
    { label: t.vat, width: 22, right: true },
    { label: t.base, width: 28, right: true },
  ];
  const rows = c.data.lines.map((l) => [
    { text: l.description },
    { text: formatInvoiceQuantity(l.quantity, c.opts.locale) },
    { text: l.unit ?? "" },
    { text: money(l.unit_price) },
    {
      text: l.regime_text || (l.vat_rate != null ? `${l.vat_rate} %` : ""),
      muted: Boolean(l.regime_text),
    },
    { text: money(l.base) },
  ]);
  const measured = measureInvoiceRows(c, columns, rows);
  const lead = c.data.print.header_text ?? "";
  const leadH = invoiceTextHeight(c, lead);
  const tailHeight = invoiceTotalsHeight(c);
  const tail = tailHeight > T.bottom - T.continuationTop ? 0 : tailHeight;
  invoiceEnsure(
    c,
    leadH +
      T.tableHeadHeight +
      measured.slice(0, 2).reduce((s, r) => s + r.height, 0) +
      (measured.length <= 2 ? tail : 0),
  );
  if (lead) invoiceText(c, lead);
  invoiceEnsure(c, T.tableHeadHeight + measured.slice(0, 2).reduce((s, r) => s + r.height, 0));
  const pages = planInvoiceItemPages(
    measured.map((r) => r.height),
    T.bottom - c.y,
    T.bottom - T.continuationTop,
    tail,
  );
  pages.forEach((indices, page) => {
    if (page) c.nextPage();
    if (!indices.length && measured.length) return;
    drawInvoiceTableHead(c, t.items, columns, page > 0);
    indices.forEach((index, i) => {
      const row = measured[index];
      if (row) {
        invoiceEnsure(c, row.height);
        drawInvoiceTableRow(c, columns, row, i === indices.length - 1);
      }
    });
    if (page === pages.length - 1) drawInvoiceTotals(c);
  });
}
