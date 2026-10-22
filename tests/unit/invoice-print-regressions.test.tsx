import { describe, expect, it, mock, spyOn } from "bun:test";
import { act, render } from "@testing-library/react";
import { jsPDF } from "jspdf";
import { INVOICE_PRINT_SAMPLES } from "../../src/components/showcase/invoice-print-samples";
import { INVOICE_PRINT_CS } from "../../src/ds-texts/invoice-print-texts";
import { buildSpayd, canPrintInvoiceQr } from "../../src/components/ds/print/invoice/invoice-spayd";
import {
  formatInvoiceQuantity,
  formatInvoiceRate,
} from "../../src/components/ds/print/invoice/invoice-format";
import { resolveInvoiceOptions } from "../../src/components/ds/print/invoice/invoice-options";
import {
  invoiceTotalRows,
  drawInvoiceTotals,
} from "../../src/components/ds/print/invoice/invoice-totals";
import { drawInvoiceVat } from "../../src/components/ds/print/invoice/invoice-details";
import { drawInvoiceItems } from "../../src/components/ds/print/invoice/invoice-items";
import { invoiceFooterColumns } from "../../src/components/ds/print/invoice/invoice-header";
import { INVOICE_THEME as T } from "../../src/components/ds/print/invoice/invoice-theme";
import type { InvoiceCanvas } from "../../src/components/ds/print/invoice/invoice-canvas";
import type { InvoicePrintOptions } from "../../src/components/ds/print/invoice/invoice-types";
import { InvoicePrintDialog } from "../../src/components/ds/print/invoice/invoice-print-dialog";
import * as invoicePdf from "../../src/components/ds/print/invoice/invoice-pdf";

function sample(index = 1) {
  const data = INVOICE_PRINT_SAMPLES[index];
  if (!data) throw new Error("Chybí vzor");
  return structuredClone(data);
}
function canvas(index = 1): InvoiceCanvas {
  const doc = new jsPDF();
  doc.setFont = mock(() => doc);
  const c: InvoiceCanvas = {
    doc,
    data: sample(index),
    opts: {},
    texts: INVOICE_PRINT_CS,
    y: 35,
    nextPage: () => {
      doc.addPage();
      c.y = T.continuationTop;
    },
  };
  return c;
}
describe("InvoicePrint – opravy QR", () => {
  it.each([0, -1, -5000])("QR zakáže částku %s", (amount) => {
    const data = sample();
    data.totals.to_pay = amount;
    expect(canPrintInvoiceQr(data)).toBe(false);
  });
  it("QR zakáže daňový doklad k přijaté platbě", () => {
    const data = sample();
    data.kind = "advance_tax";
    data.totals.to_pay = 5000;
    expect(canPrintInvoiceQr(data)).toBe(false);
  });
  it("MSG používá název dokladu APP včetně slovenského zálohového listu", () => {
    const data = sample();
    data.title = "Zálohová faktúra";
    data.number = "ZFV42";
    expect(buildSpayd(data)).toContain("MSG:Zálohová faktúra ZFV42");
  });
  it("MSG má nejvýše 60 znaků", () => {
    const data = sample();
    data.title = "A".repeat(65);
    expect(buildSpayd(data).split("*MSG:")[1]?.length).toBe(60);
  });
  for (const [property, key, max] of [
    ["variable_symbol", "X-VS", 10],
    ["specific_symbol", "X-SS", 10],
    ["constant_symbol", "X-KS", 4],
  ] as const) {
    it(`${key} přijímá číslice do ${max}`, () => {
      const data = sample();
      data.payment[property] = "0".repeat(max);
      expect(buildSpayd(data)).toContain(`${key}:${"0".repeat(max)}`);
    });
    it.each(["12a", "12 3", "-1", "", "1".repeat(max + 1)])(
      `${key} vynechá neplatné %s`,
      (value) => {
        const data = sample();
        data.payment[property] = value;
        expect(buildSpayd(data)).not.toContain(`${key}:`);
      },
    );
  }
});
describe("InvoicePrint – kompatibilita a formát", () => {
  it("staré volby jsou přijaty a ignorovány, nové mají výchozí hodnoty", () => {
    const legacy: InvoicePrintOptions = {
      showHeader: false,
      showFooter: false,
      showVatRecap: false,
      showNote: false,
      showColumnHeadings: false,
      showTotalsRow: false,
    };
    expect(resolveInvoiceOptions(legacy)).toEqual({
      showPaymentSchedule: false,
      showAdvanceDetail: true,
      showQr: true,
      showSignature: false,
      showIssuedBy: true,
    });
  });
  it("explicitní false má přednost před výchozím true", () => {
    expect(resolveInvoiceOptions({ showQr: false }).showQr).toBe(false);
  });
  it("množství 0,125 zachová třetí desetinné místo", () => {
    expect(formatInvoiceQuantity(0.125)).toBe("0,125");
  });
  it("množství má až čtyři místa, tisíce a žádné zbytečné nuly", () => {
    expect(formatInvoiceQuantity(1000.1256)).toBe("1 000,1256");
    expect(formatInvoiceQuantity(2)).toBe("2");
  });
  it.each(["cs", "sk"] as const)("kurz má místní čárku pro %s", (locale) => {
    expect(formatInvoiceRate(24.125, locale)).toBe("24,125");
  });
  it("EUR bez homeCurrency zachová domácí součet APP", () => {
    const c = canvas(2);
    c.data.totals.total_home = 123456.78;
    c.data.totals.rate = 24.125;
    expect(invoiceTotalRows(c)).toContainEqual({
      label: "Celkem v Kč (kurz 24,125)",
      value: "123 456,78",
      muted: true,
    });
  });
  it("EUR bez homeCurrency tiskne domácí daň APP", () => {
    const c = canvas(2);
    c.data.totals.vat_home = 98765.43;
    const text = spyOn(c.doc, "text");
    drawInvoiceVat(c);
    const printed = text.mock.calls
      .flatMap(([value]) => (Array.isArray(value) ? value : [value]))
      .join(" ");
    expect(printed).toContain("98 765,43 Kč");
  });
  it("domácí součet se tiskne i bez dodaného kurzu", () => {
    const c = canvas(2);
    c.data.totals.rate = null;
    expect(invoiceTotalRows(c).find((row) => row.muted)?.value).toBeDefined();
  });
  it("Vystavil bez jména ponechá první sloupec prázdný", () => {
    const c = canvas();
    c.data.print.issued_by_name = " ";
    expect(invoiceFooterColumns(c)[0]).toBe("");
  });
});
describe("InvoicePrint – dlouhé texty", () => {
  it.each(["header_text", "footer_text"] as const)(
    "%s nepřeteče přes stránku a neztratí text",
    (key) => {
      const c = canvas();
      const lines = Array.from({ length: 180 }, (_, index) => `Text ${index}`);
      c.data.print[key] = lines.join("\n");
      const text = spyOn(c.doc, "text");
      drawInvoiceItems(c);
      expect(c.doc.getNumberOfPages()).toBeGreaterThan(2);
      const printed = text.mock.calls.flatMap(([value]) =>
        Array.isArray(value) ? value : [value],
      );
      for (const line of lines) expect(printed.filter((value) => value === line)).toHaveLength(1);
      for (const [value, , y] of text.mock.calls) {
        if (typeof y !== "number") continue;
        const count = Array.isArray(value) ? value.length : 1;
        expect(y + Math.max(0, count - 1) * T.lineHeight).toBeLessThanOrEqual(T.bottom);
      }
      expect(c.y).toBeLessThanOrEqual(T.bottom);
    },
  );
  it("součty se při nedostatku místa přesunou na nový list", () => {
    const c = canvas();
    c.y = 270;
    drawInvoiceTotals(c);
    expect(c.doc.getNumberOfPages()).toBe(2);
    expect(c.y).toBeLessThanOrEqual(T.bottom);
  });
});
describe("InvoicePrintDialog – stabilní náhled", () => {
  it("stejné volby a nové callbacky negenerují znovu, změna volby ano", async () => {
    const data = sample();
    const generate = spyOn(invoicePdf, "buildInvoicePdf").mockImplementation(
      () => new Promise<Blob>(() => {}),
    );
    const view = render(
      <InvoicePrintDialog
        open
        onOpenChange={() => {}}
        data={data}
        opts={{ locale: "cs", homeCurrency: { code: "CZK", symbol: "Kč" } }}
      />,
    );
    await act(async () => {});
    expect(generate).toHaveBeenCalledTimes(1);
    view.rerender(
      <InvoicePrintDialog
        open
        onOpenChange={() => {}}
        data={data}
        opts={{ locale: "cs", homeCurrency: { code: "CZK", symbol: "Kč" } }}
        onError={() => {}}
      />,
    );
    await act(async () => {});
    expect(generate).toHaveBeenCalledTimes(1);
    view.rerender(
      <InvoicePrintDialog open onOpenChange={() => {}} data={data} opts={{ locale: "sk" }} />,
    );
    await act(async () => {});
    expect(generate).toHaveBeenCalledTimes(2);
  });
});
