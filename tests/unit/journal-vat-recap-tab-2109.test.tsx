/** 2.109.0 · záložka DPH ve spodní rekapitulaci editoru řádků – koncept i zaúčtovaný doklad. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, render, within } = await import("@testing-library/react");
const { JournalLinesEditor } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;
type VatCodeOption = import("../../src/components/ds/accounting/journal-lines").VatCodeOption;
type EditorProps = React.ComponentProps<typeof JournalLinesEditor>;

const P21: VatCodeOption = {
  id: "p21",
  code: "P21",
  name: "Přijatá 21 %",
  direction: "in",
  hasTax: true,
  rate: 21,
  selfAssessment: false,
  requiresPdpSubject: false,
  taxInAccount: "343021",
  taxOutAccount: "343021",
};
const ACCOUNTS = [
  { code: "518001", name: "Služby" },
  { code: "321001", name: "Dodavatelé" },
  { code: "343021", name: "DPH" },
];
const base: JournalLine = {
  id: "a",
  text: "Služba",
  debitAccount: "518001",
  creditAccount: "321001",
  amount: 82.64,
  vatCodeId: "p21",
};
let key = 0;
const renderEditor = (props: Partial<EditorProps>) =>
  render(
    <TooltipProvider>
      <JournalLinesEditor
        storageKey={`vat-tab-${++key}`}
        lines={[base]}
        onChange={() => {}}
        accounts={ACCOUNTS}
        documentCurrency="CZK"
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        mode="mainAccount"
        mainAccount="321001"
        mainSide="D"
        recap={{ open: true, tab: "vat" }}
        {...props}
      />
    </TooltipProvider>,
  );
const vatTab = (container: HTMLElement) => within(container).queryByRole("tab", { name: "DPH" });

afterEach(cleanup);

describe("Rekapitulace – záložka DPH", () => {
  it("koncept: záložka DPH existuje a ukazuje platnou daň skupiny (přepis 17,36)", () => {
    const { container } = renderEditor({
      vat: { enabled: true, codes: [P21] },
      vatOverrides: [{ vatCodeId: "p21", vatRate: 21, taxAmount: 17.36 }],
      onVatOverridesChange: () => {},
    });
    expect(vatTab(container)).not.toBeNull();
    const panel = container.querySelector('[role="tabpanel"][data-state="active"]');
    expect(panel?.textContent).toContain("82,64");
    expect(panel?.textContent).toContain("17,36");
  });

  it("zaúčtovaný doklad: záložka DPH čte daň z řádku daně DB, jen ke čtení", () => {
    const { container } = renderEditor({
      lines: [
        base,
        {
          id: "t",
          text: "DPH",
          debitAccount: "343021",
          creditAccount: "321001",
          amount: 17.4,
          vatCodeId: "p21",
          isVatLine: true,
          vatParentLineId: "a",
        },
      ],
      vat: { enabled: true, codes: [P21], readOnly: true },
    });
    expect(vatTab(container)).not.toBeNull();
    const panel = container.querySelector('[role="tabpanel"][data-state="active"]');
    expect(panel?.textContent).toContain("17,40");
    expect(
      panel?.querySelector("input:not([type=checkbox]), [data-slot='journal-vat-adjust']"),
    ).toBeNull();
  });

  it("doklad nevstupuje do DPH: záložka DPH chybí", () => {
    const { container } = renderEditor({ vat: { enabled: false, codes: [P21] } });
    expect(vatTab(container)).toBeNull();
  });
});
