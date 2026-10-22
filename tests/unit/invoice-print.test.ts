import { describe, expect, it, mock } from "bun:test";
import { jsPDF } from "jspdf";
import { INVOICE_PRINT_CS } from "../../src/ds-texts/invoice-print-texts";
import { INVOICE_PRINT_SAMPLES } from "../../src/components/showcase/invoice-print-samples";
import {
  buildSpayd,
  canPrintInvoiceQr,
  invoiceQrModules,
} from "../../src/components/ds/print/invoice/invoice-spayd";
import {
  formatInvoiceAmount,
  formatInvoiceDate,
  invoicePdfFilename,
  invoiceUsesTotal,
} from "../../src/components/ds/print/invoice/invoice-format";
import {
  drawInvoiceItems,
  planInvoiceItemPages,
} from "../../src/components/ds/print/invoice/invoice-items";
import {
  invoiceFooterColumns,
  drawInvoiceHeader,
  finishInvoicePages,
} from "../../src/components/ds/print/invoice/invoice-header";
import { invoicePaymentHeight } from "../../src/components/ds/print/invoice/invoice-payment";
import { invoiceTotalRows } from "../../src/components/ds/print/invoice/invoice-totals";
import type { InvoiceCanvas } from "../../src/components/ds/print/invoice/invoice-canvas";
import type { InvoicePrintData } from "../../src/components/ds/print/invoice/invoice-types";

function sample(): InvoicePrintData {
  const data = INVOICE_PRINT_SAMPLES[1];
  if (!data) throw new Error("Chybí vzor");
  return structuredClone(data);
}
function canvas(data = sample()): InvoiceCanvas {
  const doc = new jsPDF();
  // Jen metriky pro jednotkové testy sekcí; skutečné Roboto a PDF ověřuje Chromium.
  doc.setFont = mock(() => doc);
  return {
    doc,
    data,
    texts: INVOICE_PRINT_CS,
    opts: { homeCurrency: { code: "CZK", symbol: "Kč" } },
    y: 35,
    nextPage: () => doc.addPage(),
  };
}
describe("InvoicePrint – formát a platební pravidla", () => {
  it.each([
    { quantity: null, unit_price: null, expected: ["", ""] },
    { quantity: null, unit_price: 1250, expected: ["", "1 250,00"] },
    { quantity: 0.125, unit_price: null, expected: ["0,125", ""] },
    { quantity: 0, unit_price: 0, expected: ["0", "0,00"] },
  ])("prázdné množství/cena se nepletou s nulou: %j", ({ quantity, unit_price, expected }) => {
    const c = canvas();
    c.data.lines = [{ description: "Doprava", quantity, unit_price, unit: null, vat_rate: 21, base: 690 }];
    const text = mock(c.doc.text.bind(c.doc));
    c.doc.text = text;
    drawInvoiceItems(c);
    const start = text.mock.calls.findIndex(
      ([value]) => Array.isArray(value) && value[0] === "Doprava",
    );
    expect(start).toBeGreaterThanOrEqual(0);
    const cells = text.mock.calls.slice(start, start + 6).map(([value]) =>
      Array.isArray(value) ? value.join("") : value,
    );
    expect(cells).toEqual(["Doprava", expected[0], "", expected[1], "21 %", "690,00"]);
  });
  it("datum bez mezer a bez změny časového pásma", () =>
    expect(formatInvoiceDate("2020-12-31T23:00:00Z")).toBe("31.12.2020"));
  it("dvě desetinná místa, tisíce a pravé mínus", () =>
    expect(formatInvoiceAmount(-1234567.89)).toBe("−1 234 567,89"));
  it("chybějící hotová částka zůstává prázdná", () => expect(formatInvoiceAmount(null)).toBe(""));
  it.each(["card", "cash", "offset"] as const)("%s používá Celkem", (kind) => {
    const d = sample();
    d.payment.method_kind = kind;
    expect(invoiceUsesTotal(d)).toBe(true);
  });
  it("převod používá K úhradě", () => expect(invoiceUsesTotal(sample())).toBe(false));
  it("stažení používá nadpis a číslo", () => {
    const d = sample();
    d.title = "Vydaná faktura";
    d.number = "FV/2026/42";
    expect(invoicePdfFilename(d)).toBe("vydana-faktura-fv-2026-42.pdf");
  });
  it("koncept nikdy nepoužije číslo v názvu PDF", () => {
    const d = sample();
    d.is_draft = true;
    expect(invoicePdfFilename(d)).toBe("koncept-faktura.pdf");
  });
  it("částky nepřepočítává podle položek", () => {
    const c = canvas();
    c.data.totals.to_pay = 7654321.09;
    expect(invoiceTotalRows(c).at(-1)?.value).toBe("7 654 321,09 CZK");
  });
  it("karta bez záloh nemá K úhradě", () => {
    const c = canvas();
    c.data.payment.method_kind = "card";
    c.data.advances = [];
    expect(invoiceTotalRows(c).some((r) => r.label === INVOICE_PRINT_CS.toPay)).toBe(false);
  });
  it("QR nemění výšku platebního pásu", () => {
    const c = canvas();
    const h = invoicePaymentHeight(c);
    c.data.print.options.showQr = false;
    expect(invoicePaymentHeight(c)).toBe(h);
  });
});
describe("InvoicePrint – SPAYD", () => {
  it("vytvoří SPD 1.0 z hotové částky, účtu, symbolů a splatnosti", () => {
    const d = sample();
    d.payment = {
      ...d.payment,
      iban: "CZ12 0100 0001 1596 3283 0257",
      swift: "KOMBCZPP",
      variable_symbol: "42",
      constant_symbol: "0308",
      specific_symbol: "8",
    };
    d.totals.to_pay = 5000;
    d.date_due = "2026-11-05";
    d.number = "42";
    expect(buildSpayd(d)).toBe(
      "SPD*1.0*ACC:CZ1201000001159632830257+KOMBCZPP*AM:5000.00*CC:CZK*X-VS:42*X-KS:0308*X-SS:8*DT:20261105*MSG:Faktura 42",
    );
  });
  it("escapuje hvězdičky a procenta", () => {
    const d = sample();
    d.number = "A*50%";
    expect(buildSpayd(d)).toContain("MSG:Faktura A%2A50%25");
  });
  it.each(["draft", "currency", "account", "iban", "option"])("QR zakáže %s", (rule) => {
    const d = sample();
    if (rule === "draft") d.is_draft = true;
    if (rule === "currency") d.payment.currency_code = "EUR";
    if (rule === "account") d.payment.uses_bank_account = false;
    if (rule === "iban") d.payment.iban = null;
    if (rule === "option") d.print.options.showQr = false;
    expect(canPrintInvoiceQr(d)).toBe(false);
  });
  it("povolí bankovní CZK s IBAN a volbou", () => expect(canPrintInvoiceQr(sample())).toBe(true));
  it("QR má čtvercové tmavé moduly", () => {
    const modules = invoiceQrModules(sample());
    expect(modules.length).toBeGreaterThan(20);
    expect(modules.every((r) => r.length === modules.length)).toBe(true);
    expect(modules[0]?.[0]).toBe(true);
  });
});
describe("InvoicePrint – stránky, zápatí a logo", () => {
  it("krátké položky se součty zůstanou společně", () =>
    expect(planInvoiceItemPages([8, 8], 60, 250, 25)).toEqual([[0, 1]]));
  it("dlouhé položky se neopakují a neztrácejí", () => {
    const p = planInvoiceItemPages(Array(50).fill(8), 100, 250, 35);
    expect(p.flat()).toEqual(Array.from({ length: 50 }, (_, i) => i));
    expect(p.every((r) => r.length === 0 || r.length >= 2)).toBe(true);
  });
  it("začátek přesune, když se nevejdou dva řádky", () =>
    expect(planInvoiceItemPages([8, 8, 8], 20, 250, 25)).toEqual([[], [0, 1, 2]]));
  it("vypnutí Vystavil zachová ostatní sloupce", () => {
    const c = canvas();
    const before = invoiceFooterColumns(c);
    c.data.print.options.showIssuedBy = false;
    const after = invoiceFooterColumns(c);
    expect(after[0]).toBe("");
    expect(after.slice(1)).toEqual(before.slice(1));
  });
  it("zápatí kreslí na každou stranu", () => {
    const c = canvas();
    c.doc.addPage();
    const text = mock(c.doc.text.bind(c.doc));
    c.doc.text = text;
    finishInvoicePages(c);
    expect(text.mock.calls.some((args) => args[0] === "Strana 1 z 2")).toBe(true);
    expect(text.mock.calls.some((args) => args[0] === "Strana 2 z 2")).toBe(true);
  });
  it("bez nahraného loga negeneruje obrázek", () => {
    const c = canvas();
    const image = mock(c.doc.addImage.bind(c.doc));
    c.doc.addImage = image;
    drawInvoiceHeader(c, null);
    expect(image).not.toHaveBeenCalled();
  });
  it("logo obsahující název zabrání duplicitě v záhlaví", () => {
    const c = canvas();
    c.data.issuer.logo_contains_name = true;
    const text = mock(c.doc.text.bind(c.doc));
    c.doc.text = text;
    c.doc.addImage = mock(() => c.doc);
    drawInvoiceHeader(c, { data: "uploaded", width: 400, height: 80 });
    expect(
      text.mock.calls.some(
        (args) => Array.isArray(args[0]) && args[0].includes(c.data.issuer.name),
      ),
    ).toBe(false);
  });
});
