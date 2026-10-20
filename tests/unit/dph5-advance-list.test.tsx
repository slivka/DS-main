/** DPH 5 B a Zálohové listy B (2.118.0): popisky kódů, rekapitulace, patička, Zaúčtování, varianta ZL. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, fireEvent, render, screen } = await import("@testing-library/react");
const { JournalLinesEditor } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { VatCodeSelect } = await import("../../src/components/ds/accounting/vat-code-select");
const { DocumentPostingGrid } =
  await import("../../src/components/ds/accounting/document-posting-grid");
const labels = await import("../../src/components/ds/accounting/vat-code-labels");
const { recapFooterRows } = await import("../../src/components/ds/accounting/journal-recap-footer");
const { inheritedLineValues } = await import("../../src/components/ds/accounting/useJournalPins");
const { advanceListVariant, advancePaymentStatusConfig } =
  await import("../../src/components/ds/accounting/advance-list-variant");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
const { VAT_FIVE_CS, VAT_FIVE_SK } = await import("../../src/ds-texts/vat-five-texts");
type VatCodeOption = import("../../src/components/ds/accounting/journal-lines").VatCodeOption;
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;
type EditorProps = React.ComponentProps<typeof JournalLinesEditor>;

afterEach(cleanup);

const vatCode = (
  id: string,
  code: string,
  direction: "out" | "in",
  rate: number | null,
  extra: Partial<VatCodeOption> = {},
): VatCodeOption => ({
  id,
  code,
  name: extra.name ?? "Tuzemsko základní",
  direction,
  hasTax: rate != null && rate > 0,
  rate,
  selfAssessment: false,
  requiresPdpSubject: false,
  taxInAccount: "343021",
  taxOutAccount: "343021",
  ...extra,
});
const Z_OUT = vatCode("z-out", "Z", "out", 21, { khSection: "A4" });
const Z_IN = vatCode("z-in", "Z", "in", 21, { khSection: "B2" });
const EXEMPT = vatCode("osv", "O", "out", null, { name: "Osvobozeno", menuGroup: "exempt" });
const OUTSIDE = vatCode("mimo", "M", "out", null, { name: "Mimo DPH", menuGroup: "outside" });

describe("popisky a skupiny kódů DPH", () => {
  it("výběr ukáže „Z – Tuzemsko základní (21 %)“, buňka „Z 21 %“", () => {
    expect(labels.vatCodeMenuLabel(Z_OUT)).toBe("Z – Tuzemsko základní (21 %)");
    expect(labels.vatCodeCellLabel(Z_OUT, VAT_FIVE_CS)).toBe("Z 21 %");
  });
  it("u dokladu bez pevného směru buňka nese směr", () => {
    expect(labels.vatCodeCellLabel(Z_IN, VAT_FIVE_CS, true)).toBe("Z 21 % (vstup)");
    expect(labels.vatCodeCellLabel(Z_OUT, VAT_FIVE_SK, true)).toBe("Z 21 % (výstup)");
  });
  it("skupiny podle menu_group v pořadí S daní / Osvobozená / Mimo DPH", () => {
    const groups = labels.groupVatCodes([OUTSIDE, EXEMPT, Z_OUT], VAT_FIVE_CS);
    expect(groups.map((group) => group.label)).toEqual([
      "S daní",
      "Osvobozená a zvláštní režimy",
      "Mimo DPH",
    ]);
  });
  it("obousměrný doklad: výchozí směr je první skupina", () => {
    const groups = labels.groupVatCodes([Z_OUT, Z_IN], VAT_FIVE_CS, {
      bidirectional: true,
      defaultDirection: "in",
    });
    expect(groups.map((group) => group.label)).toEqual(["Vstup", "Výstup"]);
    expect(groups[0]?.codes[0]?.id).toBe("z-in");
  });
  it("výběr rozliší stejný kód obou směrů podle id", () => {
    const onChange = mock(() => {});
    render(
      <VatCodeSelect
        defaultOpen
        bidirectional
        codes={[Z_OUT, Z_IN]}
        value={null}
        onChange={onChange}
      />,
    );
    const vstup = document.querySelector('[data-vat-group="in"]')!;
    fireEvent.click(vstup.querySelector("[cmdk-item]")!);
    expect(onChange).toHaveBeenCalledWith("z-in");
  });
});

describe("patička rekapitulace", () => {
  it("bez záloh a zaokrouhlení jen Součet a Zaokrouhlení", () => {
    expect(recapFooterRows({ sum: 121, rounding: 0, difference: 0 }).map((r) => r.key)).toEqual([
      "sum",
      "rounding",
    ]);
  });
  it("odečtené zálohy ukáží K úhradě = součet + zaokrouhlení − zálohy", () => {
    const rows = recapFooterRows({ sum: 1210, advances: 605, rounding: 0.4, difference: 0 });
    expect(rows.map((r) => r.key)).toEqual(["sum", "advances", "rounding", "toPay"]);
    expect(rows.find((r) => r.key === "toPay")?.value).toBe(605.4);
    expect(rows.find((r) => r.key === "advances")?.value).toBe(-605);
  });
  it("Rozdíl jen při nenulové hodnotě", () => {
    const rows = recapFooterRows({ sum: 100, rounding: 0.3, difference: -2 });
    expect(rows.map((r) => r.key)).toEqual(["sum", "rounding", "toPay", "difference"]);
  });
});

describe("převzetí hodnot nového řádku", () => {
  const previous: JournalLine = {
    id: "a",
    text: "Nájem",
    vatCodeId: "z-in",
    debitAccount: "518001",
    creditAccount: "321001",
    dimensionId: "d1",
  };
  it("Enter převezme kód DPH a účty, zakotvený sloupec navíc", () => {
    const { values, pinnedFields } = inheritedLineValues(previous, new Set(["dimensionId"]), true);
    expect(values).toMatchObject({
      vatCodeId: "z-in",
      debitAccount: "518001",
      creditAccount: "321001",
      dimensionId: "d1",
    });
    expect(values.text).toBeUndefined();
    expect(pinnedFields).toEqual(["dimensionId"]);
  });
  it("bez Enteru jen zakotvené sloupce", () => {
    const { values } = inheritedLineValues(previous, new Set(["text"]), false);
    expect(values).toEqual({ text: "Nájem" });
  });
});

const ACCOUNTS = [
  { code: "518001", name: "Služby" },
  { code: "321001", name: "Dodavatelé" },
  { code: "343021", name: "DPH" },
];
let key = 0;
const renderEditor = (
  props: Omit<Partial<EditorProps>, "vat"> & { vat?: Partial<NonNullable<EditorProps["vat"]>> },
) =>
  render(
    <TooltipProvider>
      <JournalLinesEditor
        storageKey={`dph5-${++key}`}
        lines={[
          { id: "a", text: "a", debitAccount: "518001", amount: 100, vatCodeId: "z-in" },
          { id: "b", text: "b", debitAccount: "518001", amount: 50, vatCodeId: "mimo" },
        ]}
        onChange={() => {}}
        accounts={ACCOUNTS}
        documentCurrency="CZK"
        homeCurrency="CZK"
        mode="mainAccount"
        mainAccount="321001"
        mainSide="D"
        {...props}
        vat={{ enabled: true, codes: [Z_IN, { ...OUTSIDE, direction: "in" }], ...props.vat }}
      />
    </TooltipProvider>,
  );

describe("rekapitulace DPH", () => {
  it("oddíly V režimu DPH a Mimo DPH, KH, bez nároku a informativní text", () => {
    const { container } = renderEditor({
      vat: {
        nonDeductibleByCode: { "z-in": 5.25 },
        recapNote: "Nejde o daňový doklad",
      },
    });
    expect(container.querySelector('[data-slot="journal-vat-section-in-title"]')?.textContent).toBe(
      "V režimu DPH",
    );
    expect(container.querySelector('[data-slot="journal-vat-outside"]')?.textContent).toContain(
      "50,00",
    );
    expect(container.querySelector('[data-slot="journal-vat-kh"]')?.textContent).toBe("KH B2");
    expect(
      container.querySelector('[data-slot="journal-vat-non-deductible"]')?.textContent,
    ).toContain("5,25");
    expect(container.querySelector('[data-slot="journal-vat-recap-note"]')?.textContent).toBe(
      "Nejde o daňový doklad",
    );
  });
  it("zálohový list štítek KH nezobrazí", () => {
    const { container } = renderEditor({ vat: { showKhSection: false } });
    expect(container.querySelector('[data-slot="journal-vat-kh"]')).toBeNull();
  });
  it("vydaný doklad nabízí opravu jen jako akci ⋯", () => {
    renderEditor({
      vat: { overrideInMenu: true },
      onVatOverridesChange: () => {},
    });
    expect(screen.getByRole("button", { name: /^Další akce – Z 21 %/ })).toBeTruthy();
  });
  it("Odečtené zálohy a K úhradě v patičce", () => {
    const { container } = renderEditor({ advanceDeduction: 60 });
    expect(container.querySelector('[data-slot="journal-footer-advances"]')?.textContent).toContain(
      "−60,00",
    );
    expect(container.querySelector('[data-slot="journal-footer-to-pay"]')).not.toBeNull();
  });
});

describe("záložka Zaúčtování", () => {
  it("ukáže účty v rozšířené formě a štítky automatických řádků", () => {
    render(
      <DocumentPostingGrid
        accounts={ACCOUNTS}
        entries={[
          {
            id: "1",
            text: "Služby",
            debitAccount: "518001",
            creditAccount: "321001",
            amount: 1000,
          },
          {
            id: "2",
            text: "DPH",
            debitAccount: "343021",
            creditAccount: "321001",
            amount: 210,
            auto: "vat",
          },
        ]}
      />,
    );
    expect(screen.getByText("518.001 – Služby")).toBeTruthy();
    expect(document.querySelector('[data-slot="document-posting-auto"]')?.textContent).toBe("DPH");
  });
});

describe("varianta zálohového listu", () => {
  it("vydaný ZL plátce: bez DUZP, účetního data, Zaúčtování a KH, s textem a opravou v ⋯", () => {
    const variant = advanceListVariant({
      type: "ZFV",
      vatPayer: true,
      recapNote: VAT_FIVE_CS.notTaxDocument,
    });
    expect(variant.fields.taxDate).toBe(false);
    expect(variant.fields.accountingDate).toBe(false);
    expect(variant.fields.dueDate).toBe(true);
    expect(variant.postingTab).toBe(false);
    expect(variant.withoutAccounts).toBe(true);
    expect(variant.linesVat).toEqual({
      showKhSection: false,
      recapNote: "Nejde o daňový doklad",
      overrideInMenu: true,
    });
    expect(variant.statuses).toEqual(["draft", "filed", "cancelled"]);
  });
  it("přijatý ZL od neplátce skryje údaje DPH úplně", () => {
    const variant = advanceListVariant({ type: "ZFP", vatPayer: false, recapNote: "" });
    expect(variant.linesVat).toBeNull();
    expect(variant.fields.paymentOrders).toBe(true);
  });
  it("čtyři stavy úhrady CS i SK", () => {
    expect(Object.values(advancePaymentStatusConfig(VAT_FIVE_CS)).map((s) => s.label)).toEqual([
      "Neuhrazeno",
      "Částečně uhrazeno",
      "Uhrazeno",
      "Zbytek stornován",
    ]);
    expect(advancePaymentStatusConfig(VAT_FIVE_SK).paid.label).toBe("Uhradené");
  });
});
