import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DocumentForm,
  type DocumentHeaderValue,
} from "../../src/components/ds/accounting/document-form";
import { JournalLinesEditor } from "../../src/components/ds/accounting/journal-lines-editor";
import {
  toJournalRows,
  type JournalLine,
  type VatCodeOption,
} from "../../src/components/ds/accounting/journal-lines";
import {
  applyVatCalcMode,
  baseFromGross,
  buildVatPreviewLines,
  computeJournalTotals,
  fillInitialVatCode,
  isSelfAssessed,
  resolveLineVat,
  summarizeVat,
} from "../../src/components/ds/accounting/journal-vat";
import { TooltipProvider } from "../../src/components/ui/tooltip";

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
const FP = { mainAccount: "321001", mainSide: "D" as const };
const rcGross: JournalLine = {
  id: "a",
  debitAccount: "518001",
  creditAccount: "321001",
  amount: 1000,
  grossAmount: 1000,
  vatCodeId: "rc",
};

describe("Samovyměření v režimu S DPH (2.57.0)", () => {
  it("RC-P21 1 000 → základ 1 000, daň 210, celek 1 000", () => {
    expect(isSelfAssessed(CODES[1])).toBe(true);
    expect(resolveLineVat(rcGross, CODES, { calcMode: "gross" })).toMatchObject({
      base: 1000,
      vat: 210,
      gross: 1000,
    });
    expect(baseFromGross({ ...rcGross, amount: undefined }, CODES, {})).toEqual({ amount: 1000 });
    const preview = buildVatPreviewLines([rcGross], { codes: CODES, calcMode: "gross" }, FP).lines;
    expect(preview).toEqual([
      expect.objectContaining({
        debitAccount: "343200",
        creditAccount: "343100",
        amount: 210,
        excludeFromTotal: true,
      }),
    ]);
    expect(
      computeJournalTotals([rcGross], {
        vat: { enabled: true, codes: CODES, calcMode: "gross" },
        ...FP,
      }),
    ).toMatchObject({ base: 1000, vat: 0, gross: 1000 });
    expect(summarizeVat([rcGross], { codes: CODES, calcMode: "gross" })[0]).toMatchObject({
      base: 1000,
      vat: 210,
      gross: 1000,
    });
  });
  it("přepnutí Bez → S DPH nemění celek", () => {
    const net: JournalLine = { ...rcGross, grossAmount: undefined };
    const switched = applyVatCalcMode([net], "gross", { codes: CODES });
    expect(switched[0]!.grossAmount).toBe(1000);
    expect(
      computeJournalTotals(switched, {
        vat: { enabled: true, codes: CODES, calcMode: "gross" },
        ...FP,
      }).gross,
    ).toBe(1000);
  });
  it("poměrný nárok 60 % u RC-P21 → 126 odpočet + 84 bez nároku, výstup celých 210", () => {
    const lines = buildVatPreviewLines(
      [{ ...rcGross, vatDeduction: "partial", vatDeductionShare: 60 }],
      { codes: CODES, calcMode: "gross" },
      FP,
    ).lines;
    expect(lines.map((line) => [line.debitAccount, line.creditAccount, line.amount])).toEqual([
      ["343200", "343100", 126],
      ["518001", "343100", 84],
    ]);
  });
});

describe("Výchozí kód na počátečním řádku", () => {
  const blank: JournalLine = {
    id: "n",
    debitAccount: null,
    creditAccount: "321001",
    isBlank: true,
  };
  it("doplní kód i opožděně, upravený řádek nepřepíše", () => {
    expect(fillInitialVatCode([blank], "v21", CODES)?.[0]).toMatchObject({
      vatCodeId: "v21",
      vatRate: 21,
    });
    expect(fillInitialVatCode([blank], null, CODES)).toBeNull();
    expect(fillInitialVatCode([blank], "v21", CODES, new Set(["n"]))).toBeNull();
    expect(fillInitialVatCode([{ ...blank, vatCodeId: "rc" }], "v21", CODES)).toBeNull();
    expect(fillInitialVatCode([{ ...blank, isBlank: false }], "v21", CODES)).toBeNull();
  });
});

describe("Přepínač Bez DPH | S DPH", () => {
  const render = (readOnly: boolean) =>
    renderToStaticMarkup(
      <TooltipProvider>
        <JournalLinesEditor
          lines={[
            {
              id: "a",
              debitAccount: "518001",
              creditAccount: "321001",
              amount: 1000,
              vatCodeId: "v21",
            },
          ]}
          onChange={() => {}}
          accounts={[]}
          documentCurrency="CZK"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          storageKey={`vat257-${readOnly}`}
          vat={{ enabled: true, codes: CODES, calcMode: "net", readOnly }}
        />
      </TooltipProvider>,
    );
  it("je neaktivní při vat.readOnly", () => {
    expect(render(true)).toMatch(/role="radiogroup"[^>]*aria-disabled="true"/);
    expect(render(false)).not.toMatch(/role="radiogroup"[^>]*aria-disabled="true"/);
  });
});

describe("Kurz DPH bez kurzu ČNB", () => {
  const value: DocumentHeaderValue = {
    accountingDate: "2026-09-26",
    issueDate: "2026-09-26",
    currency: "EUR",
    rate: 24.35,
    amountTotal: 0,
    totalMode: "sum",
  };
  const form = (field: Record<string, unknown>) =>
    renderToStaticMarkup(
      <DocumentForm
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        title="Faktura"
        documentType="FP"
        value={value}
        onChange={() => {}}
        lines={[]}
        onLinesChange={() => {}}
        books={[]}
        accounts={[]}
        status="draft"
        vatRateField={{ value: null, onChange: () => {}, ...field }}
      />,
    );
  const msg = "Kurz ČNB k DUZP není k dispozici – zadejte ruční kurz s důvodem.";
  it("ukáže hlášku jen bez doporučeného kurzu a bez ručního kurzu", () => {
    expect(form({ suggestedRate: null })).toContain(msg);
    expect(form({ suggestedRate: 24.4 })).not.toContain(msg);
    expect(form({ suggestedRate: null, manual: true, value: 24.4 })).not.toContain(msg);
    expect(form({ suggestedRate: null, sameAsDocument: true })).not.toContain(msg);
  });
});

describe("Předběžné Kurzové zaokrouhlení", () => {
  const line: JournalLine = {
    id: "a",
    debitAccount: "518001",
    creditAccount: "321001",
    foreignAmount: 100,
    amount: 2435,
    grossAmount: 121,
    currency: "EUR",
    vatCodeId: "p21",
  };
  const codes: VatCodeOption[] = [
    {
      id: "p21",
      code: "21P",
      name: "21 %",
      direction: "in",
      hasTax: true,
      rate: 21,
      selfAssessment: false,
      requiresPdpSubject: false,
      taxInAccount: "343200",
    },
  ];
  const config = {
    codes,
    calcMode: "gross" as const,
    foreign: true,
    rate: 24.35,
    rateAmount: 1,
    vatRate: 24.4,
    vatRateAmount: 1,
  };
  it("EUR 121, kurz 24,35 / DPH 24,40 → −1,05, neukládá se", () => {
    const preview = buildVatPreviewLines([line], config, FP).lines;
    const fx = preview.find((item) => item.isFxRounding);
    expect(fx).toMatchObject({
      amount: -1.05,
      foreignAmount: 0,
      isVatPreview: true,
      debitAccount: null,
      creditAccount: null,
    });
    const totals = computeJournalTotals([line], {
      vat: { enabled: true, codes, calcMode: "gross", vatRate: 24.4, vatRateAmount: 1 },
      foreign: true,
      rate: 24.35,
      rateAmount: 1,
      ...FP,
    });
    expect(totals.gross).toBe(121);
    expect(totals.grossHome).toBe(2946.35);
    expect(toJournalRows([line, ...preview])).toHaveLength(1);
  });
  it("stejný kurz → žádný řádek", () => {
    expect(
      buildVatPreviewLines([line], { ...config, vatRate: 24.35 }, FP).lines.some(
        (item) => item.isFxRounding,
      ),
    ).toBe(false);
  });
});

describe("Uložené Kurzové zaokrouhlení vs. předběžné", async () => {
  const { mergeFxRoundingPreview } = await import("../../src/components/ds/accounting/journal-vat");
  const codes: VatCodeOption[] = [
    {
      id: "p21",
      code: "21P",
      name: "21 %",
      direction: "in",
      hasTax: true,
      rate: 21,
      selfAssessment: false,
      requiresPdpSubject: false,
      taxInAccount: "343200",
    },
  ];
  const base: JournalLine = {
    id: "a",
    debitAccount: "518001",
    creditAccount: "321001",
    foreignAmount: 100,
    amount: 2435,
    grossAmount: 121,
    currency: "EUR",
    vatCodeId: "p21",
  };
  const saved: JournalLine = {
    id: "fx",
    debitAccount: "211002",
    creditAccount: "663001",
    amount: 1.05,
    isFxRounding: true,
  };
  const config = {
    codes,
    calcMode: "gross" as const,
    foreign: true,
    rate: 24.35,
    rateAmount: 1,
    vatRate: 24.4,
    vatRateAmount: 1,
  };
  const opts = {
    vat: { enabled: true, codes, calcMode: "gross" as const, vatRate: 24.4, vatRateAmount: 1 },
    foreign: true,
    rate: 24.35,
    rateAmount: 1,
    ...FP,
  };
  it("editovatelný koncept: jen jeden (předběžný) řádek a celek 2 946,35", () => {
    const preview = buildVatPreviewLines([base], config, FP).lines;
    const shown = mergeFxRoundingPreview([base, saved], preview);
    const fx = [...shown, ...preview.filter((line) => !line.isFxRounding)].filter(
      (line) => line.isFxRounding,
    );
    expect(fx).toHaveLength(1);
    expect(fx[0]).toMatchObject({ amount: -1.05, isVatPreview: true });
    expect(computeJournalTotals([base, saved], opts).grossHome).toBe(2946.35);
  });
  it("jen ke čtení: jen uložený řádek", () => {
    const shown = mergeFxRoundingPreview([base, saved], []);
    expect(shown.filter((line) => line.isFxRounding)).toEqual([saved]);
  });
});
