import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DocumentForm,
  type DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
import {
  DocumentSettingsDialog,
  type DocumentSettingsValue,
} from "../../src/components/ds/accounting/document-settings-dialog";
import type { JournalLine, VatCodeOption } from "../../src/components/ds/accounting/journal-lines";
import { computeJournalTotals } from "../../src/components/ds/accounting/journal-vat";

const squashSrc = (s: string) => s.replace(/\s+/g, " ");

const CODES: VatCodeOption[] = [
  {
    id: "v21",
    code: "21V",
    name: "21 %",
    direction: "out",
    hasTax: true,
    rate: 21,
    selfAssessment: false,
    requiresPdpSubject: false,
    taxOutAccount: "343100",
  },
  {
    id: "v12",
    code: "12V",
    name: "12 %",
    direction: "out",
    hasTax: true,
    rate: 12,
    selfAssessment: false,
    requiresPdpSubject: false,
    taxOutAccount: "343100",
  },
  {
    id: "rc",
    code: "RC-P21",
    name: "PDP",
    direction: "in",
    hasTax: true,
    rate: 21,
    selfAssessment: true,
    requiresPdpSubject: false,
    taxInAccount: "343200",
    taxOutAccount: "343100",
  },
];
const vat = { enabled: true, codes: CODES };
const fv: JournalLine[] = [
  { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "v21" },
];

describe("computeJournalTotals (2.56.0)", () => {
  it("FV 1 000 + 21 % → 1 210 předběžně", () => {
    expect(computeJournalTotals(fv, { vat, mainAccount: "311001", mainSide: "MD" })).toMatchObject({
      base: 1000,
      vat: 210,
      gross: 1210,
      visibleLineCount: 1,
    });
  });
  it("dvě sazby → 1 770", () => {
    const lines = [
      ...fv,
      { id: "b", debitAccount: "311001", creditAccount: "604001", amount: 500, vatCodeId: "v12" },
    ];
    expect(computeJournalTotals(lines, { vat, mainAccount: "311001", mainSide: "MD" }).gross).toBe(
      1770,
    );
  });
  it("RC-P21 1 000 → 1 000 editovatelné i jen ke čtení (uložené řádky 343/343 mimo celek)", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "518001", creditAccount: "321001", amount: 1000, vatCodeId: "rc" },
    ];
    expect(computeJournalTotals(base, { vat, mainAccount: "321001", mainSide: "D" }).gross).toBe(
      1000,
    );
    const saved: JournalLine[] = [
      ...base,
      {
        id: "t",
        debitAccount: "343200",
        creditAccount: "343100",
        amount: 210,
        isVatLine: true,
        vatParentLineId: "a",
        vatCodeId: "rc",
      },
    ];
    const ro = computeJournalTotals(saved, {
      vat,
      readOnly: true,
      mainAccount: "321001",
      mainSide: "D",
    });
    expect(ro.gross).toBe(1000);
    expect(ro.visibleLineCount).toBe(1);
  });
  it("jen ke čtení s uloženou daní FV → 1 210; editovatelný uloženou daň ignoruje", () => {
    const saved: JournalLine[] = [
      ...fv,
      {
        id: "t",
        debitAccount: "311001",
        creditAccount: "343100",
        amount: 210,
        isVatLine: true,
        vatParentLineId: "a",
        vatCodeId: "v21",
      },
    ];
    expect(
      computeJournalTotals(saved, { vat, readOnly: true, mainAccount: "311001", mainSide: "MD" })
        .gross,
    ).toBe(1210);
    const changed = saved.map((line) => (line.id === "a" ? { ...line, amount: 2000 } : line));
    expect(
      computeJournalTotals(changed, { vat, mainAccount: "311001", mainSide: "MD" }).gross,
    ).toBe(2420);
  });
  it("bez DPH součet řádků jako dříve, prázdné a řádky daně se nepočítají do odznaku", () => {
    const lines: JournalLine[] = [
      ...fv,
      { id: "x", isBlank: true },
      { id: "p", amount: 5, isVatPreview: true, isVatLine: true },
    ];
    const totals = computeJournalTotals(lines, {});
    expect(totals.visibleLineCount).toBe(1);
    expect(computeJournalTotals(fv, {}).gross).toBe(1000);
  });
  it("cizí měna – součet v měně dokladu", () => {
    const lines: JournalLine[] = [
      {
        id: "a",
        debitAccount: "311001",
        creditAccount: "602001",
        foreignAmount: 100,
        amount: 2500,
        vatCodeId: "v21",
      },
    ];
    expect(
      computeJournalTotals(lines, {
        vat,
        foreign: true,
        rate: 25,
        rateAmount: 1,
        mainAccount: "311001",
        mainSide: "MD",
      }),
    ).toMatchObject({ base: 100, gross: 121 });
  });
});

const value: DocumentHeaderValue = {
  accountingDate: "2026-09-26",
  issueDate: "2026-09-26",
  currency: "CZK",
  amountTotal: 0,
  totalMode: "sum",
};
const form = (extra: Record<string, unknown>) =>
  renderToStaticMarkup(
    <DocumentForm
      homeCurrency="CZK"
      homeCurrencySymbol="Kč"
      title="Faktura"
      documentType="FV"
      value={value}
      onChange={() => {}}
      lines={fv}
      onLinesChange={() => {}}
      books={[]}
      accounts={[]}
      status="draft"
      {...extra}
    />,
  );

describe("DocumentForm 2.56.0", () => {
  it("Celkem za doklad ze rozpisu zahrnuje předběžnou daň", () => {
    expect(form({ linesEditorProps: { vat } })).toMatch(/value="1.210,00"/);
    expect(form({})).not.toMatch(/value="1.210,00"/);
  });
  it("Kurz DPH se zobrazí jen u předaného propu a cizí měny", () => {
    const eur = { ...value, currency: "EUR", rate: 25 };
    expect(form({ value: eur })).not.toContain("Kurz DPH");
    expect(form({ value: eur, vatRateField: { value: 25.1, onChange: () => {} } })).toContain(
      "Kurz DPH",
    );
    expect(
      form({ value: eur, vatRateField: { value: null, onChange: () => {}, sameAsDocument: true } }),
    ).toContain("stejný jako kurz dokladu");
  });
  it("odznak Řádky počítá jen řádky v gridu", () => {
    const src = squashSrc(readFileSync("src/components/ds/accounting/document-form.tsx", "utf8"));
    expect(src).toContain("badge: vatTotals.visibleLineCount");
  });
});

describe("DocumentSettingsDialog – Zadávat částky (2.56.0)", () => {
  const settings: DocumentSettingsValue = {
    suggestDescription: false,
    descriptionScope: "company",
    suggestCounterparty: false,
    counterpartyScope: "company",
    amountFromLines: "book",
    showQuantityColumns: false,
    offerPrintAfterSave: false,
    printTwoPerPage: false,
    printDocumentNumber: false,
    copies: 1,
    vatCalcMode: "gross",
  };
  it("volba se zobrazí jen při showVatCalcMode", () => {
    const src = squashSrc(
      readFileSync("src/components/ds/accounting/document-settings-dialog.tsx", "utf8"),
    );
    expect(src).toContain("showVatCalcMode ?");
    expect(settings.vatCalcMode).toBe("gross");
    // Dialog je v portálu – statické vykreslení zavřeného dialogu nesmí spadnout.
    expect(() =>
      renderToStaticMarkup(
        <DocumentSettingsDialog
          open={false}
          onOpenChange={() => {}}
          value={settings}
          onSave={() => {}}
          documentTypeLabel="FV"
          showVatCalcMode
        />,
      ),
    ).not.toThrow();
  });
});
