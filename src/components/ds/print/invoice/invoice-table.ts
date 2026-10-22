/** Tabulky C · vlastní měření a stránkování po řádcích · žádné součty dat. */
import { invoiceEnsure, invoiceFont, invoiceWrap, type InvoiceCanvas } from "./invoice-canvas";
import { INVOICE_THEME as T } from "./invoice-theme";
/** Buňka včetně textového režimu a hotové částky. */
export interface InvoiceTableCell {
  /** Text. */ text: string;
  /** Tlumený režim. */ muted?: boolean;
  /** Tučně. */ bold?: boolean;
}
/** Sloupec s pevnou šířkou v mm. */
export interface InvoiceTableColumn {
  /** Popisek. */ label: string;
  /** Šířka. */ width: number;
  /** Částka vpravo. */ right?: boolean;
  /** Tučně. */ bold?: boolean;
}
/** Měřený řádek tabulky. */
export interface InvoiceMeasuredRow {
  /** Buňky. */ cells: InvoiceTableCell[];
  /** Zalamované texty. */ lines: string[][];
  /** Výška. */ height: number;
}
/** Měří skutečný text Roboto před stránkováním. */
export function measureInvoiceRows(
  c: InvoiceCanvas,
  columns: InvoiceTableColumn[],
  rows: InvoiceTableCell[][],
): InvoiceMeasuredRow[] {
  return rows.map((cells) => {
    const lines = columns.map((col, i) =>
      invoiceWrap(c, cells[i]?.text ?? "", col.width - 3, T.bodySize, cells[i]?.bold || col.bold),
    );
    return {
      cells,
      lines,
      height: Math.max(1, ...lines.map((l) => l.length)) * T.lineHeight + T.rowPadding * 2,
    };
  });
}
/** Hlavička s opakováním nadpisu sekce. */
export function drawInvoiceTableHead(
  c: InvoiceCanvas,
  title: string,
  columns: InvoiceTableColumn[],
  continued = false,
) {
  invoiceFont(c, 7, false, T.gray);
  c.doc.text(
    `${title}${continued ? ` – ${c.texts.continuation}` : ""}`.toUpperCase(),
    T.margin,
    c.y + 3,
  );
  c.y += 6;
  let x = T.margin;
  columns.forEach((col) => {
    invoiceFont(c, 7, false, T.gray);
    c.doc.text(col.label.toUpperCase(), col.right ? x + col.width - 1.5 : x + 1.5, c.y + 3, {
      align: col.right ? "right" : "left",
      maxWidth: col.width - 3,
    });
    x += col.width;
  });
  c.y += 5;
  c.doc.setDrawColor(...T.text);
  c.doc.setLineWidth(0.25);
  c.doc.line(T.margin, c.y, 197, c.y);
}
/** Jeden nerozdělený řádek. */
export function drawInvoiceTableRow(
  c: InvoiceCanvas,
  columns: InvoiceTableColumn[],
  row: InvoiceMeasuredRow,
  last = false,
) {
  let x = T.margin;
  columns.forEach((col, i) => {
    const cell = row.cells[i];
    invoiceFont(c, 9, cell?.bold || col.bold, cell?.muted ? T.gray : T.text);
    c.doc.text(
      row.lines[i] ?? [],
      col.right ? x + col.width - 1.5 : x + 1.5,
      c.y + T.rowPadding + 3,
      { align: col.right ? "right" : "left", lineHeightFactor: 1.29 },
    );
    x += col.width;
  });
  c.y += row.height;
  c.doc.setDrawColor(...(last ? T.text : T.line));
  c.doc.setLineWidth(0.25);
  c.doc.line(T.margin, c.y, 197, c.y);
}
/** Sekce se dělí pouze když se nevejde ani na prázdnou stranu. */
export function drawInvoiceTable(
  c: InvoiceCanvas,
  title: string,
  columns: InvoiceTableColumn[],
  rows: InvoiceTableCell[][],
) {
  const measured = measureInvoiceRows(c, columns, rows);
  const height = T.tableHeadHeight + measured.reduce((s, r) => s + r.height, 0) + 5;
  invoiceEnsure(c, height);
  drawInvoiceTableHead(c, title, columns);
  measured.forEach((row, i) => {
    if (c.y + row.height > T.bottom) {
      c.nextPage();
      drawInvoiceTableHead(c, title, columns, true);
    }
    drawInvoiceTableRow(c, columns, row, i === measured.length - 1);
  });
  c.y += 5;
}
