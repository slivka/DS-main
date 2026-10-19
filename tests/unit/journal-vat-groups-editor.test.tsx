import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, fireEvent, render, screen, waitFor } = await import("@testing-library/react");
const { JournalLinesEditor } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;
type VatCodeOption = import("../../src/components/ds/accounting/journal-lines").VatCodeOption;
type EditorProps = React.ComponentProps<typeof JournalLinesEditor>;

const code = (id: string, rate: number, selfAssessment = false): VatCodeOption => ({
  id,
  code: id.toUpperCase(),
  name: id,
  direction: "in",
  hasTax: true,
  rate,
  selfAssessment,
  requiresPdpSubject: false,
  taxInAccount: "343021",
  taxOutAccount: "343021",
});
const CODES = [code("p21", 21), code("p12", 12), code("rc", 21, true)];
const ACCOUNTS = [
  { code: "518001", name: "Služby" },
  { code: "321001", name: "Dodavatelé" },
  { code: "343021", name: "DPH" },
];
const line = (id: string, amount: number, vatCodeId = "p21"): JournalLine => ({
  id,
  text: id,
  debitAccount: "518001",
  creditAccount: "321001",
  amount,
  vatCodeId,
});
let key = 0;
const renderEditor = (props: Partial<EditorProps> = {}) =>
  render(
    <TooltipProvider>
      <JournalLinesEditor
        storageKey={`vat-groups-${++key}`}
        lines={[line("a", 82.64)]}
        onChange={() => {}}
        accounts={ACCOUNTS}
        documentCurrency="CZK"
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        mode="mainAccount"
        mainAccount="321001"
        mainSide="D"
        vat={{ enabled: true, codes: CODES }}
        {...props}
      />
    </TooltipProvider>,
  );

afterEach(cleanup);

describe("JournalLinesEditor – skupiny DPH", () => {
  it("rekapitulace ukáže skupinu kód × sazba a přepis s vypočtenou daní", () => {
    const { container } = renderEditor({
      vatOverrides: [{ vatCodeId: "p21", vatRate: 21, taxAmount: 17.36 }],
      onVatOverridesChange: () => {},
    });
    const group = container.querySelector('[data-slot="journal-vat-group"]');
    expect(group?.textContent).toContain("17,36");
    expect(container.querySelector('[data-slot="journal-vat-calculated"]')?.textContent).toContain(
      "17,35",
    );
    expect(container.querySelector('[data-slot="journal-footer-sum"]')?.textContent).toContain(
      "100,00",
    );
  });

  it("Vrátit vypočtenou daň odebere přepis skupiny", () => {
    const onVatOverridesChange = mock(() => {});
    const { container } = renderEditor({
      vatOverrides: [{ vatCodeId: "p21", vatRate: 21, taxAmount: 17.36 }],
      onVatOverridesChange,
    });
    fireEvent.click(container.querySelector('[data-slot="journal-vat-reset"]')!);
    expect(onVatOverridesChange).toHaveBeenCalledWith([]);
  });

  it("přepis nad tolerancí s vatOverrideSeverity=error hlásí položku s fieldId skupiny", async () => {
    const onValidationChange = mock(() => {});
    renderEditor({
      vatOverrides: [{ vatCodeId: "p21", vatRate: 21, taxAmount: 20 }],
      onVatOverridesChange: () => {},
      vatOverrideSeverity: "error",
      onValidationChange,
    });
    await waitFor(() => expect(onValidationChange).toHaveBeenCalled());
    const calls = onValidationChange.mock.calls as unknown[][];
    const errors = calls.at(-1)?.[1] as { fieldId?: string }[];
    expect(errors.some((item) => item.fieldId === "journal-vat-group-P21-21")).toBe(true);
  });

  it("samovyměření nemá pomocníka ceny s DPH ani úpravy skupiny", () => {
    const { container } = renderEditor({
      lines: [line("a", 100, "rc")],
      onVatOverridesChange: () => {},
    });
    expect(container.querySelector('[data-slot="journal-gross-helper"]')).toBeNull();
    expect(container.querySelector('[data-slot="journal-vat-adjust"]')).toBeNull();
  });

  it("pomocník Cena s DPH vyplní základ 82,64 ze 100,00 při 21 %", async () => {
    const onChange = mock((next: JournalLine[]) => next);
    const { container } = renderEditor({ lines: [line("a", 0)], onChange });
    fireEvent.click(container.querySelector('[data-slot="journal-gross-helper"]')!);
    const input = await screen.findByLabelText("Částka s DPH (21 %)");
    fireEvent.change(input, { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Použít" }));
    const next = onChange.mock.calls.at(-1)?.[0] as JournalLine[];
    expect(next[0].amount).toBe(82.64);
  });

  it("Rozdíl nabídne jako výchozí Dorovnat DPH u jedné skupiny a haléře", () => {
    const { container } = renderEditor({
      lines: [line("a", 82.64)],
      totalAmount: 100,
      totalMode: "entered",
      roundingLimit: 1,
      onVatOverridesChange: () => {},
    });
    const actions = container.querySelector('[data-slot="journal-difference-actions"]');
    expect(actions?.getAttribute("data-preferred")).toBe("vat");
  });

  it("bez DPH patička nemá rekapitulaci skupin a nad limitem nenabízí akci zaokrouhlení", () => {
    const { container } = renderEditor({
      vat: undefined,
      lines: [line("a", 100)],
      totalAmount: 110,
      totalMode: "entered",
      roundingLimit: 1,
    });
    expect(container.querySelector('[data-slot="journal-vat-recap"]')).toBeNull();
    expect(
      container
        .querySelector('[data-slot="journal-difference-actions"]')
        ?.getAttribute("data-preferred"),
    ).toBeNull();
  });
});
