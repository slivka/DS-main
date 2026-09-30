import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import {
  JournalLinesEditor,
  orderJournalLines,
} from "../../src/components/ds/accounting/journal-lines-editor";
import { JournalLinesRecap } from "../../src/components/ds/accounting/journal-lines-recap";
import {
  fromJournalRow,
  toJournalRow,
  toJournalRows,
  type JournalLine,
  type VatCodeOption,
} from "../../src/components/ds/accounting/journal-lines";
import {
  applyVatCalcMode,
  baseFromGross,
  buildVatPreviewLines,
  resolveLineVat,
  sumJournalTotal,
  summarizeVat,
} from "../../src/components/ds/accounting/journal-vat";
import { TooltipProvider } from "../../src/components/ui/tooltip";

const OUT: VatCodeOption[] = [
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
    id: "vx",
    code: "21VX",
    name: "bez účtů",
    direction: "out",
    hasTax: true,
    rate: 21,
    selfAssessment: false,
    requiresPdpSubject: false,
    taxOutAccount: null,
  },
];
const IN: VatCodeOption[] = [
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
  {
    id: "rc",
    code: "RC-P21",
    name: "PDP",
    direction: "in",
    hasTax: true,
    rate: 21,
    selfAssessment: true,
    requiresPdpSubject: true,
    taxInAccount: "343200",
    taxOutAccount: "343100",
  },
];
const FV = { mainAccount: "311001", mainSide: "MD" as const };
const FP = { mainAccount: "321001", mainSide: "D" as const };
const total = (base: JournalLine[], tax: JournalLine[]) =>
  sumJournalTotal([...base, ...tax]).amount;

describe("DPH – předběžný výpočet (2.55.0)", () => {
  it("FV 21V 1 000 → 1 210", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "v21" },
    ];
    const preview = buildVatPreviewLines(base, { codes: OUT }, FV);
    expect(preview.lines).toHaveLength(1);
    expect(preview.lines[0]).toMatchObject({
      debitAccount: "311001",
      creditAccount: "343100",
      amount: 210,
      isVatPreview: true,
      isVatLine: true,
      vatParentLineId: "a",
    });
    expect(total(base, preview.lines)).toBe(1210);
  });
  it("21V 1 000 + 12V 500 → 1 770", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "v21" },
      { id: "b", debitAccount: "311001", creditAccount: "604001", amount: 500, vatCodeId: "v12" },
    ];
    expect(total(base, buildVatPreviewLines(base, { codes: OUT }, FV).lines)).toBe(1770);
  });
  it("ruční daň 210,40 – odchylka 0,40 (varování)", () => {
    const line: JournalLine = {
      id: "a",
      debitAccount: "518001",
      creditAccount: "321001",
      amount: 1000,
      vatCodeId: "p21",
      vatManual: true,
      vatAmount: 210.4,
    };
    expect(resolveLineVat(line, IN).deviation).toBe(0.4);
    expect(buildVatPreviewLines([line], { codes: IN }, FP).lines[0]).toMatchObject({
      debitAccount: "343200",
      creditAccount: "321001",
      amount: 210.4,
    });
    expect(resolveLineVat({ ...line, vatAmount: 212 }, IN).deviation).toBe(2);
  });
  it("RC-P21 1 000 → celek 1 000 (343 / 343)", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "518001", creditAccount: "321001", amount: 1000, vatCodeId: "rc" },
    ];
    const preview = buildVatPreviewLines(base, { codes: IN }, FP);
    expect(preview.lines[0]).toMatchObject({
      debitAccount: "343200",
      creditAccount: "343100",
      amount: 210,
      excludeFromTotal: true,
    });
    expect(total(base, preview.lines)).toBe(1000);
  });
  it("bez nároku – daň 210 na účet základu", () => {
    const base: JournalLine[] = [
      {
        id: "a",
        debitAccount: "518001",
        creditAccount: "321001",
        amount: 1000,
        vatCodeId: "p21",
        vatDeduction: "none",
      },
    ];
    expect(buildVatPreviewLines(base, { codes: IN }, FP).lines).toEqual([
      expect.objectContaining({
        debitAccount: "518001",
        creditAccount: "321001",
        amount: 210,
        vatLineKind: "non_deductible",
      }),
    ]);
  });
  it("poměrný nárok 60 % → 126 + 84", () => {
    const base: JournalLine[] = [
      {
        id: "a",
        debitAccount: "518001",
        creditAccount: "321001",
        amount: 1000,
        vatCodeId: "p21",
        vatDeduction: "partial",
        vatDeductionShare: 60,
      },
    ];
    const lines = buildVatPreviewLines(base, { codes: IN }, FP).lines;
    expect(lines.map((line) => [line.debitAccount, line.amount])).toEqual([
      ["343200", 126],
      ["518001", 84],
    ]);
    expect(total(base, lines)).toBe(1210);
  });
  it("režim S DPH: 121 → 100 + 21", () => {
    const line: JournalLine = {
      id: "a",
      debitAccount: "518001",
      creditAccount: "211001",
      grossAmount: 121,
      vatCodeId: "p21",
    };
    expect(resolveLineVat(line, IN, { calcMode: "gross" })).toMatchObject({
      base: 100,
      vat: 21,
      gross: 121,
    });
    expect(baseFromGross(line, IN, {})).toEqual({ amount: 100 });
  });
  it("kód bez účtů → daň se spočte, řádek daně nevznikne", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "vx" },
    ];
    const preview = buildVatPreviewLines(base, { codes: OUT }, FV);
    expect(preview.lines).toHaveLength(0);
    expect(preview.missingAccounts).toEqual([{ lineId: "a", code: "21VX" }]);
    expect(resolveLineVat(base[0]!, OUT).vat).toBe(210);
  });
  it("cizí měna: daň v měně dokladu, domácí kurzem DPH", () => {
    const base: JournalLine[] = [
      {
        id: "a",
        debitAccount: "518001",
        creditAccount: "321001",
        foreignAmount: 1000,
        amount: 25120,
        vatCodeId: "p21",
      },
    ];
    const [tax] = buildVatPreviewLines(
      base,
      { codes: IN, foreign: true, rate: 25.12, vatRate: 25.05 },
      FP,
    ).lines;
    expect(tax).toMatchObject({ foreignAmount: 210, amount: 5260.5 });
    const [noVatRate] = buildVatPreviewLines(
      base,
      { codes: IN, foreign: true, rate: 25.12 },
      FP,
    ).lines;
    expect(noVatRate?.amount).toBe(5275.2);
  });
  it("přepnutí na S DPH nemění celek", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "v21" },
    ];
    const gross = applyVatCalcMode(base, "gross", { codes: OUT });
    expect(gross[0]?.grossAmount).toBe(1210);
    expect(
      total(gross, buildVatPreviewLines(gross, { codes: OUT, calcMode: "gross" }, FV).lines),
    ).toBe(1210);
  });
  it("rekapitulace DPH po kódech", () => {
    const base: JournalLine[] = [
      { id: "a", amount: 1000, vatCodeId: "p21", vatDeduction: "partial", vatDeductionShare: 60 },
      { id: "b", amount: 1000, vatCodeId: "rc" },
    ];
    const rows = summarizeVat(base, { codes: IN });
    expect(rows.find((row) => row.code === "21P")).toMatchObject({
      base: 1000,
      vat: 210,
      gross: 1210,
      deductible: 126,
      nonDeductible: 84,
    });
    expect(rows.find((row) => row.code === "RC-P21")).toMatchObject({
      vat: 210,
      gross: 1000,
      selfAssessment: true,
    });
  });
  it("RC-P21 bez nároku → 518/343.100 210 mimo celek", () => {
    const base: JournalLine[] = [
      {
        id: "a",
        debitAccount: "518001",
        creditAccount: "321001",
        amount: 1000,
        vatCodeId: "rc",
        vatDeduction: "none",
      },
    ];
    const preview = buildVatPreviewLines(base, { codes: IN }, FP);
    expect(preview.lines).toEqual([
      expect.objectContaining({
        debitAccount: "518001",
        creditAccount: "343100",
        amount: 210,
        vatLineKind: "non_deductible",
        excludeFromTotal: true,
      }),
    ]);
    expect(total(base, preview.lines)).toBe(1000);
  });
  it("RC-P21 poměrný 60 % → 126 (343/343) + 84 (518/343)", () => {
    const base: JournalLine[] = [
      {
        id: "a",
        debitAccount: "518001",
        creditAccount: "321001",
        amount: 1000,
        vatCodeId: "rc",
        vatDeduction: "partial",
        vatDeductionShare: 60,
      },
    ];
    const lines = buildVatPreviewLines(base, { codes: IN }, FP).lines;
    expect(lines.map((l) => [l.debitAccount, l.creditAccount, l.amount, l.vatLineKind])).toEqual([
      ["343200", "343100", 126, "deductible"],
      ["518001", "343100", 84, "non_deductible"],
    ]);
    expect(total(base, lines)).toBe(1000);
  });
  it("RC chybějící účty: výstup vždy, vstup jen s nárokem", () => {
    const noIn: VatCodeOption[] = [{ ...IN[1]!, taxInAccount: null }];
    const noOut: VatCodeOption[] = [{ ...IN[1]!, taxOutAccount: null }];
    const line: JournalLine = {
      id: "a",
      debitAccount: "518001",
      creditAccount: "321001",
      amount: 1000,
      vatCodeId: "rc",
    };
    expect(buildVatPreviewLines([line], { codes: noIn }, FP).missingAccounts).toHaveLength(1);
    expect(
      buildVatPreviewLines(
        [{ ...line, vatDeduction: "partial", vatDeductionShare: 60 }],
        { codes: noIn },
        FP,
      ),
    ).toMatchObject({ lines: [], missingAccounts: [{ lineId: "a" }] });
    expect(
      buildVatPreviewLines([{ ...line, vatDeduction: "none" }], { codes: noIn }, FP).lines,
    ).toHaveLength(1);
    expect(
      buildVatPreviewLines([{ ...line, vatDeduction: "none" }], { codes: noOut }, FP),
    ).toMatchObject({ lines: [], missingAccounts: [{ lineId: "a" }] });
  });
  it("rekapitulace: rozpad nároku i u samovyměření", () => {
    const rows = summarizeVat(
      [{ id: "b", amount: 1000, vatCodeId: "rc", vatDeduction: "partial", vatDeductionShare: 60 }],
      { codes: IN },
    );
    expect(rows[0]).toMatchObject({ deductible: 126, nonDeductible: 84 });
    expect(
      summarizeVat([{ id: "b", amount: 1000, vatCodeId: "rc" }], { codes: IN })[0],
    ).toMatchObject({ deductible: 210, nonDeductible: 0 });
  });
});

describe("DPH – ukládání a načtení", () => {
  it("toJournalRows neposílá zakázané sloupce ani řádky daně", () => {
    const lines: JournalLine[] = [
      {
        id: "a",
        debitAccount: "518001",
        creditAccount: "321001",
        amount: 1000,
        vatCodeId: "p21",
        vatRate: 21,
        vatAmount: 210,
        vatManual: false,
        vatDeduction: "partial",
        vatDeductionShare: 60,
        vatAmountHome: 210,
        vatBaseHome: 1000,
      },
      { id: "t", debitAccount: "343200", creditAccount: "321001", amount: 210, isVatLine: true },
      { id: "p", debitAccount: "343200", creditAccount: "321001", amount: 210, isVatPreview: true },
    ];
    const rows = toJournalRows(lines, { vat: { calcMode: "net" } });
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    for (const key of [
      "vat_rate",
      "vat_amount",
      "vat_base_dom",
      "is_vat_line",
      "vat_parent_line_id",
      "vat_amount_foreign",
      "amount_gross",
    ])
      expect(row).not.toHaveProperty(key);
    expect(row).toMatchObject({
      vat_code_id: "p21",
      vat_manual: false,
      vat_deduction: "partial",
      vat_deduction_share: 60,
    });
  });
  it("ruční daň a režim S DPH posílají amount_gross i základ", () => {
    const row = toJournalRow(
      { id: "a", amount: 100, grossAmount: 121, vatCodeId: "p21", vatManual: true, vatAmount: 21 },
      { vat: { calcMode: "gross" } },
    );
    expect(row).toMatchObject({
      amount: 100,
      amount_gross: 121,
      vat_amount_foreign: 21,
      vat_manual: true,
    });
    expect(row).not.toHaveProperty("vat_deduction_share");
  });
  it("bez vat je výstup shodný s 2.54.0", () => {
    const row = toJournalRow({ id: "a", amount: 100, vatCodeId: "p21" });
    expect(row).not.toHaveProperty("vat_code_id");
    expect(Object.keys(row)).toHaveLength(20);
  });
  it("fromJournalRow načte DPH sloupce", () => {
    const base = toJournalRow({
      id: "a",
      amount: 1000,
      debitAccount: "518001",
      creditAccount: "321001",
    });
    const line = fromJournalRow(
      {
        ...base,
        vat_code_id: "p21",
        vat_rate: 21,
        vat_amount_foreign: 210,
        vat_amount: 210,
        vat_base_dom: 1000,
        vat_manual: true,
        vat_deduction: "full",
        pdp_subject_code: null,
        vat_gross_foreign: 1210,
        is_vat_line: false,
        vat_parent_line_id: null,
        vat_line_kind: null,
      },
      "a",
    );
    expect(line).toMatchObject({
      vatCodeId: "p21",
      vatRate: 21,
      vatAmount: 210,
      vatAmountHome: 210,
      vatBaseHome: 1000,
      vatManual: true,
      vatDeduction: "full",
      grossAmount: 1210,
      isVatLine: false,
    });
  });
});

describe("DPH v editoru", () => {
  const render = (props: Partial<React.ComponentProps<typeof JournalLinesEditor>>) =>
    renderToStaticMarkup(
      <TooltipProvider>
        <JournalLinesEditor
          lines={[]}
          onChange={() => {}}
          accounts={[]}
          documentCurrency="CZK"
          homeCurrency="CZK"
          homeCurrencySymbol="Kč"
          storageKey={`vat-${Math.random()}`}
          {...props}
        />
      </TooltipProvider>,
    );
  const lines: JournalLine[] = [
    { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "v21" },
    {
      id: "db",
      debitAccount: "311001",
      creditAccount: "343100",
      amount: 999,
      isVatLine: true,
      vatParentLineId: "a",
    },
    { id: "r", debitAccount: "311001", creditAccount: "648001", amount: 0.4, isRounding: true },
  ];
  it("řádky daně se v gridu neukazují a Zaokrouhlení je poslední", () => {
    expect(orderJournalLines(lines).map((line) => line.id)).toEqual(["a", "r"]);
  });
  it("editovatelný doklad počítá součet z předběžné daně, ne z DB", () => {
    const html = render({
      lines,
      mode: "mainAccount",
      mainAccount: "311001",
      mainSide: "MD",
      totalAmount: 1210.4,
      totalMode: "entered",
      vat: { enabled: true, codes: OUT, calcMode: "net" },
    });
    expect(html).toContain("Kód DPH");
    expect(html).toContain("Rozepsáno");
  });
  it("doklad jen ke čtení použije řádky daně z DB", () => {
    const html = render({
      lines,
      mode: "mainAccount",
      mainAccount: "311001",
      mainSide: "MD",
      totalAmount: 1999.4,
      totalMode: "entered",
      vat: { enabled: true, codes: OUT, calcMode: "net", readOnly: true },
    });
    expect(html).toContain("Rozepsáno");
  });
  it("bez vat žádné DPH sloupce", () => {
    const html = render({ lines: [lines[0]!] });
    expect(html).not.toContain("Kód DPH");
    expect(html).not.toContain("S DPH");
  });
  it("DPH patička odděluje základ, daň a celek", () => {
    const base: JournalLine[] = [
      {
        id: "a",
        debitAccount: "311001",
        creditAccount: "602001",
        amount: 1000,
        grossAmount: 1210,
        vatCodeId: "v21",
      },
      {
        id: "b",
        debitAccount: "311001",
        creditAccount: "604001",
        amount: 500,
        grossAmount: 560,
        vatCodeId: "v12",
      },
    ];
    const html = render({
      lines: base,
      mode: "mainAccount",
      mainAccount: "311001",
      mainSide: "MD",
      totalAmount: 1770,
      totalMode: "entered",
      vat: { enabled: true, codes: OUT, calcMode: "gross" },
    });
    expect(html).toMatch(/data-slot="journal-lines-total-base"[^>]*>1\s500,00/);
    expect(html).toMatch(/data-slot="journal-lines-total-vat"[^>]*>270,00/);
    expect(html).toMatch(/data-slot="journal-lines-total-gross"[^>]*>1\s770,00/);
  });
  it("rekapitulace DPH používá značky měn z dat", () => {
    const summary = summarizeVat(
      [{ id: "a", foreignAmount: 100, amount: 2500, vatCodeId: "p21" }],
      { codes: IN, foreign: true, rate: 25 },
    );
    const html = renderToStaticMarkup(
      <JournalLinesRecap
        lines={[]}
        accounts={[]}
        documentCurrency="EUR"
        documentCurrencySymbol="€"
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        tab="vat"
        vatSummary={summary}
      />,
    );
    expect(html).toContain("Základ (€)");
    expect(html).toContain("DPH (€)");
    expect(html).toContain("Celkem (€)");
    expect(html).toContain("Základ (Kč)");
    expect(html).toContain("DPH (Kč)");
    expect(html).not.toContain("(CZK)");
  });
  it("při skrytém Celkem s DPH ukazuje celek se značkou měny v liště", () => {
    const base: JournalLine[] = [
      { id: "a", debitAccount: "311001", creditAccount: "602001", amount: 1000, vatCodeId: "v21" },
      { id: "b", debitAccount: "311001", creditAccount: "604001", amount: 500, vatCodeId: "v12" },
    ];
    const html = render({
      lines: base,
      mode: "mainAccount",
      mainAccount: "311001",
      mainSide: "MD",
      totalAmount: 1770,
      totalMode: "entered",
      documentCurrencySymbol: "Kč",
      vat: { enabled: true, codes: OUT, calcMode: "net" },
    });
    expect(html).toContain('data-slot="journal-lines-toolbar-total"');
    expect(html).toMatch(/Celkem 1\s770,00 Kč/);
  });
  it("bez DPH zůstává původní součet v Částce", () => {
    const html = render({
      lines: [
        { id: "a", amount: 1000 },
        { id: "r", amount: 0.4, isRounding: true },
      ],
    });
    expect(html).toMatch(/data-slot="journal-lines-total-base"[^>]*>1\s000,40/);
    expect(html).not.toContain('data-slot="journal-lines-toolbar-total"');
  });
});
