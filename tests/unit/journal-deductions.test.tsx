/** JournalLinesEditor · odečty záloh jako řádky dokladu a zakázaná primární akce RecordDialog. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, fireEvent, render, screen } = await import("@testing-library/react");
const { JournalLinesEditor } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { RecordDialog } = await import("../../src/components/ds");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;
type VatCodeOption = import("../../src/components/ds/accounting/journal-lines").VatCodeOption;
type Deductions =
  import("../../src/components/ds/accounting/journal-lines-editor").JournalDeductions;
type EditorProps = React.ComponentProps<typeof JournalLinesEditor>;

const U21: VatCodeOption = {
  id: "u21",
  code: "U21",
  name: "Uskutečněná 21 %",
  direction: "out",
  hasTax: true,
  rate: 21,
  selfAssessment: false,
  requiresPdpSubject: false,
  taxInAccount: "343021",
  taxOutAccount: "343021",
};
const ACCOUNTS = [
  { code: "311001", name: "Odběratelé" },
  { code: "602001", name: "Služby" },
  { code: "324001", name: "Přijaté zálohy" },
];
const line: JournalLine = {
  id: "a",
  text: "Služba",
  debitAccount: "311001",
  creditAccount: "602001",
  amount: 10000,
  vatCodeId: "u21",
};
const deductions = (over: Partial<Deductions> = {}): Deductions => ({
  rows: [
    {
      id: "zfv",
      kind: "advance",
      text: "Odečet zálohy ZFV 1 (VS 1)",
      vatCode: "U21",
      base: -826.45,
      vat: -173.55,
      account: "324.001",
      status: "Uzavřený",
      payment: "Spárováno",
      remove: { can: true },
    },
    {
      id: "manual",
      kind: "manual",
      text: "Ruční odečet zálohy",
      vatCode: "U21",
      base: -500,
      vat: -105,
      remove: { can: true },
    },
  ],
  totals: { items: 12100, deducted: -1605, toPay: 10495 },
  recap: {
    deductionRows: [{ id: "zfv", label: "Odečet zálohy ZFV 1", base: -826.45, vat: -173.55 }],
    totalsByCode: [{ vatCode: "U21", base: 9173.55, vat: 1926.45 }],
  },
  ...over,
});
let key = 0;
const renderEditor = (props: Partial<EditorProps>) =>
  render(
    <TooltipProvider>
      <JournalLinesEditor
        storageKey={`deductions-${++key}`}
        lines={[line]}
        onChange={() => {}}
        accounts={ACCOUNTS}
        documentCurrency="CZK"
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        mode="mainAccount"
        mainAccount="311001"
        mainSide="D"
        vat={{ enabled: true, codes: [U21] }}
        {...props}
      />
    </TooltipProvider>,
  );

afterEach(cleanup);

describe("JournalLinesEditor – odečty záloh", () => {
  it("vykreslí odečty pod položkami, první oddělený čarou", () => {
    const { container } = renderEditor({ deductions: deductions() });
    const grid = container.querySelector('table[role="grid"] tbody');
    const rows = [...(grid?.querySelectorAll("tr") ?? [])].map((row) =>
      row.getAttribute("data-slot"),
    );
    expect(rows[0]).not.toBe("journal-deduction-row");
    expect(rows.slice(-2)).toEqual(["journal-deduction-row", "journal-deduction-row"]);
    const deductionRows = container.querySelectorAll('[data-slot="journal-deduction-row"]');
    expect(deductionRows[0]?.hasAttribute("data-separator")).toBe(true);
    expect(deductionRows[1]?.hasAttribute("data-separator")).toBe(false);
    expect(container.textContent).not.toContain("Odečtené zálohy");
  });

  it("split akce nabízí výběr zálohy i ruční odečet", () => {
    const kinds: string[] = [];
    renderEditor({ deductions: deductions({ onAdd: (kind) => kinds.push(kind) }) });
    fireEvent.click(screen.getByRole("button", { name: "Odečet zálohy" }));
    expect(kinds).toEqual(["advance"]);
    expect(screen.getByRole("button", { name: "Odečet zálohy – Akce" })).toBeTruthy();
  });

  it("zakázaná split akce nevolá onAdd", () => {
    const kinds: string[] = [];
    renderEditor({
      deductions: deductions({ onAdd: (kind) => kinds.push(kind), addDisabledReason: "Zamčeno" }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Odečet zálohy" }));
    expect(kinds).toEqual([]);
  });

  it("ukáže tři součty od aplikace", () => {
    const { container } = renderEditor({ deductions: deductions() });
    const text = (slot: string) =>
      container.querySelector(`[data-slot="${slot}"]`)?.textContent?.replace(/\s/g, " ");
    expect(text("journal-deduction-items")).toContain("12 100,00");
    expect(text("journal-deduction-deducted")).toContain("−1 605,00");
    expect(text("journal-deduction-to-pay")).toContain("10 495,00");
  });

  it("rekapitulace DPH obsahuje řádek odečtu a součet podle kódu", () => {
    const { container } = renderEditor({ deductions: deductions() });
    const recap = container.querySelector('[data-slot="journal-vat-recap"]');
    expect(recap?.querySelector('[data-slot="journal-vat-deduction-row"]')?.textContent).toContain(
      "−826,45",
    );
    expect(
      recap
        ?.querySelector('[data-slot="journal-vat-total-by-code"]')
        ?.textContent?.replace(/\s/g, " "),
    ).toContain("9 173,55");
  });

  it("upravit jde jen částku ručního odečtu", () => {
    const changes: number[] = [];
    const { container } = renderEditor({
      deductions: deductions({ onAmountChange: (_row, base) => changes.push(base) }),
    });
    const inputs = container.querySelectorAll('[data-slot="journal-deduction-amount"]');
    expect(inputs.length).toBe(1);
    const input = inputs[0] as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "-600" } });
    expect(changes).toEqual([-600]);
  });

  it("odebrání po potvrzení předá řádek aplikaci", () => {
    const removed: string[] = [];
    renderEditor({
      deductions: deductions({ onRemove: (row) => removed.push(row.id), confirmRemove: false }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Odebrat: Ruční odečet zálohy" }));
    expect(removed).toEqual(["manual"]);
  });

  it("detail řádku ukáže stav a platbu až po rozbalení", () => {
    const { container } = renderEditor({ deductions: deductions() });
    expect(container.querySelector('[data-slot="journal-deduction-detail"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Podrobnosti odečtu" }));
    const detail = container.querySelector('[data-slot="journal-deduction-detail"]');
    expect(detail?.textContent).toContain("Spárováno");
  });
});

describe("RecordDialog – zakázané Uložit s důvodem", () => {
  it("zůstane zaměřitelné, nespustí uložení a oznamuje důvod", () => {
    let submitted = 0;
    render(
      <RecordDialog
        open
        onOpenChange={() => {}}
        title="Import"
        size="md"
        submitLabel="Pokračovat"
        submitDisabled
        submitDisabledReason="Nejdříve vyberte soubory"
        onSubmit={() => submitted++}
      />,
    );
    const button = screen.getByRole("button", { name: "Pokračovat" });
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    const described = document.getElementById(button.getAttribute("aria-describedby") ?? "");
    expect(described?.textContent).toBe("Nejdříve vyberte soubory");
    fireEvent.click(button);
    expect(submitted).toBe(0);
  });
});
