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
      total: -1000,
      homeBase: -20000.5,
      homeVat: -4200.1,
      homeTotal: -24200.6,
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
      total: -605,
      remove: { can: true },
    },
  ],
  totals: { itemsGross: 12100, deductionsGross: -1605, payable: 10495 },
  recap: {
    deductionRows: [
      {
        id: "zfv",
        vatCode: "U21",
        label: "Odečet zálohy ZFV 1",
        base: -826.45,
        vat: -173.55,
        total: -1000,
        homeBase: -20000.5,
        homeVat: -4200.1,
      },
    ],
    totalsByCode: [{ vatCode: "U21", base: 9173.55, vat: 1926.45, total: 11000 }],
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
    const grid = container.querySelector('table[role="grid"]');
    const rows = [...(grid?.querySelectorAll("tbody > tr:not([hidden])") ?? [])].map((row) =>
      row.getAttribute("data-slot"),
    );
    expect(rows[0]).not.toBe("journal-deduction-row");
    expect(rows.slice(-3)).toEqual([
      "journal-footer-sum",
      "journal-deduction-row",
      "journal-deduction-row",
    ]);
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
    expect(screen.getByRole("button", { name: "Další možnosti – Odečet zálohy" })).toBeTruthy();
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
    expect(container.querySelector('[data-slot="journal-deduction-rounding"]')).toBeNull();
    expect(text("journal-deduction-items")).toContain("12 100,00");
    expect(text("journal-deduction-deducted")).toContain("−1 605,00");
    expect(text("journal-deduction-to-pay")).toContain("10 495,00");
  });

  it("rekapitulace: odečet s kódem DPH a „Celkem po odečtu záloh“ z dat APP", () => {
    const { container } = renderEditor({ deductions: deductions() });
    const recap = container.querySelector('[data-slot="journal-vat-recap"]');
    const row = recap?.querySelector('[data-slot="journal-vat-deduction-row"]');
    expect(row?.querySelector("td")?.firstChild?.textContent).toBe("U21");
    expect(row?.textContent).toContain("−826,45");
    const total = recap?.querySelector('[data-slot="journal-vat-total-by-code"]');
    const text = total?.textContent?.replace(/\s/g, " ");
    expect(text).toContain("Celkem po odečtu záloh U21");
    // APP posílá 11 000 (base + vat by dalo 11 100) – DS zobrazí hodnotu APP.
    expect(text).toContain("11 000,00");
    expect(text).not.toContain("11 100,00");
  });

  it("celkem řádku odečtu bere DS z dat APP, nic nesčítá", () => {
    const base = deductions();
    const recap = base.recap && {
      ...base.recap,
      deductionRows: base.recap.deductionRows.map((row) => ({ ...row, total: -999.99 })),
    };
    const { container } = renderEditor({ deductions: { ...base, recap } });
    const row = container.querySelector('[data-slot="journal-vat-deduction-row"]');
    expect(row?.textContent?.replace(/\s/g, " ")).toContain("−999,99");
  });

  it("s odečty není druhé K úhradě ani stará lišta Součet · Zaokrouhlení", () => {
    const { container } = renderEditor({
      deductions: deductions({
        totals: { itemsGross: 12100, deductionsGross: -1605, rounding: 0.4, payable: 10495.4 },
      }),
      rounding: { value: 0.4 },
    } as Partial<EditorProps>);
    expect(container.querySelector('[data-slot="journal-difference-bar"]')).toBeNull();
    expect(container.querySelector('[data-slot="journal-footer-to-pay"]')).toBeNull();
    expect(container.querySelectorAll('[data-slot="journal-deduction-to-pay"]').length).toBe(1);
    const rounding = container.querySelector('[data-slot="journal-deduction-rounding"]');
    expect(rounding?.textContent?.replace(/\s/g, " ")).toContain("0,40");
  });

  it("Součet položek je nad odečty a má stejnou hodnotu jako bez odečtů", () => {
    const gross = (container: HTMLElement) =>
      container.querySelector('[data-slot="journal-lines-total-base"]')?.textContent;
    const plain = renderEditor({});
    const before = gross(plain.container);
    cleanup();
    const { container } = renderEditor({ deductions: deductions() });
    const sum = container.querySelector('[data-slot="journal-footer-sum"]');
    expect(sum?.textContent).toContain("Součet položek");
    expect(before).toBeTruthy();
    expect(gross(container)).toBe(before);
    expect(container.querySelector('table[role="grid"] tfoot')).toBeNull();
  });

  it("cizí měna: odečet v rekapitulaci ukáže částky v měně firmy", () => {
    const { container } = renderEditor({
      deductions: deductions(),
      documentCurrency: "EUR",
      exchangeRate: 25,
      recap: { vatHomeOpen: true, onVatHomeOpenChange: () => {} },
    } as Partial<EditorProps>);
    const row = container.querySelector('[data-slot="journal-vat-deduction-row"]');
    const text = row?.textContent?.replace(/\s/g, " ");
    expect(text).toContain("−20 000,50");
    expect(text).toContain("−4 200,10");
  });

  it("odebrání s potvrzením v DS a povinným důvodem", async () => {
    const removed: string[] = [];
    renderEditor({
      deductions: deductions({
        onRemove: (row, reason) => removed.push(`${row.id}:${reason}`),
        removeReason: { required: true },
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Odebrat: Ruční odečet zálohy" }));
    const dialog = await screen.findByRole("alertdialog").catch(() => screen.findByRole("dialog"));
    const confirmButton = [...dialog.querySelectorAll("button")].find(
      (button) => button.textContent === "Odebrat",
    ) as HTMLButtonElement;
    fireEvent.click(confirmButton);
    expect(removed).toEqual([]);
    fireEvent.change(dialog.querySelector("textarea, input") as HTMLElement, {
      target: { value: "Chyba" },
    });
    fireEvent.click(confirmButton);
    expect(removed).toEqual(["manual:Chyba"]);
  });

  it("split tlačítko je skupina a nabídka jde otevřít klávesnicí", async () => {
    const kinds: string[] = [];
    renderEditor({ deductions: deductions({ onAdd: (kind) => kinds.push(kind) }) });
    expect(screen.getByRole("group", { name: "Odečet zálohy" })).toBeTruthy();
    const trigger = screen.getByRole("button", { name: "Další možnosti – Odečet zálohy" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    const manual = await screen.findByRole("menuitem", { name: "Ruční odečet…" });
    fireEvent.keyDown(manual, { key: "Enter" });
    expect(kinds).toEqual(["manual"]);
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
