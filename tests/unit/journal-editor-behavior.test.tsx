import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

// Radix vybírá useLayoutEffect při prvním načtení modulu; vynutíme skutečný efekt i po SSR testech.
mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { JournalLinesEditor, resolveJournalColumnLayout } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;
type VatCodeOption = import("../../src/components/ds/accounting/journal-lines").VatCodeOption;
type EditorProps = React.ComponentProps<typeof JournalLinesEditor>;

const ACCOUNTS = [
  { code: "321100", name: "Závazky" },
  { code: "518001", name: "Služby" },
  { code: "211000", name: "Pokladna" },
];
const LINES: JournalLine[] = [
  { id: "l1", debitAccount: "518001", creditAccount: "321100", amount: 1000, text: "První" },
  { id: "l2", debitAccount: "518001", creditAccount: "321100", amount: 500, text: "Druhý" },
];
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
  },
  {
    id: "rc",
    code: "RC",
    name: "Samovyměření",
    direction: "in",
    hasTax: true,
    rate: 21,
    selfAssessment: true,
    requiresPdpSubject: false,
  },
];
const originalRect = HTMLElement.prototype.getBoundingClientRect;
const originalClientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
let storageCounter = 0;

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get: () => 1600,
  });
  HTMLElement.prototype.getBoundingClientRect = function () {
    return {
      width: 1600,
      height: 400,
      top: 0,
      left: 0,
      right: 1600,
      bottom: 400,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect;
  };
});
afterEach(() => {
  cleanup();
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  if (originalClientWidth)
    Object.defineProperty(HTMLElement.prototype, "clientWidth", originalClientWidth);
});

/** Řízený obal editoru: drží řádky ve stavu a hlásí každou změnu. */
function Editor({
  initial = LINES,
  onLines,
  ...props
}: Partial<EditorProps> & { initial?: JournalLine[]; onLines?: (lines: JournalLine[]) => void }) {
  const [lines, setLines] = React.useState<JournalLine[]>(initial);
  const [key] = React.useState(() => `behavior-${++storageCounter}`);
  return (
    <TooltipProvider>
      <JournalLinesEditor
        accounts={ACCOUNTS}
        documentCurrency="CZK"
        homeCurrency="CZK"
        homeCurrencySymbol="Kč"
        storageKey={key}
        {...props}
        lines={lines}
        onChange={(next) => {
          setLines(next);
          onLines?.(next);
        }}
      />
    </TooltipProvider>
  );
}

const cell = (root: HTMLElement, key: string) =>
  root.querySelector<HTMLElement>(`[data-cell-key="${key}"]`);
const textCells = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>('[data-cell-key$=":text"]')].map((el) =>
    el.textContent?.trim(),
  );
const squash = (value: string | null | undefined) => (value ?? "").replace(/\s+/g, " ");

describe("JournalLinesEditor – řádky", () => {
  it("přidá prázdný řádek tlačítkem i zkratkou Ctrl+Enter", () => {
    let latest: JournalLine[] = [];
    const view = render(<Editor onLines={(lines) => (latest = lines)} />);
    fireEvent.click(view.getByRole("button", { name: "Přidat řádek (Ctrl+Enter)" }));
    expect(latest).toHaveLength(3);
    expect(latest[2]?.isBlank).toBe(true);
    fireEvent.keyDown(cell(view.container, "l1:text")!, { key: "Enter", ctrlKey: true });
    expect(latest).toHaveLength(4);
  });

  it("s initialEmptyLine založí prázdný doklad jedním prázdným řádkem", () => {
    let latest: JournalLine[] = [];
    render(<Editor initial={[]} initialEmptyLine onLines={(lines) => (latest = lines)} />);
    expect(latest).toHaveLength(1);
    expect(latest[0]?.isBlank).toBe(true);
  });

  it("duplikuje řádek pod originál a odebere řádek", () => {
    let latest: JournalLine[] = [];
    const view = render(<Editor onLines={(lines) => (latest = lines)} />);
    fireEvent.click(view.getAllByRole("button", { name: "Duplikovat řádek" })[0]!);
    expect(textCells(view.container)).toEqual(["První", "První", "Druhý"]);
    expect(latest[1]?.id).not.toBe("l1");
    fireEvent.click(view.getAllByRole("button", { name: "Odebrat řádek" })[2]!);
    expect(textCells(view.container)).toEqual(["První", "První"]);
  });

  it("posune řádek klávesou Alt+šipka a připnuté zaokrouhlení zůstane poslední", () => {
    const view = render(
      <Editor
        initial={[...LINES, { id: "r", amount: 0.4, isRounding: true }]}
        rounding={{ value: 0.4 }}
      />,
    );
    fireEvent.keyDown(cell(view.container, "l1:text")!, { key: "ArrowDown", altKey: true });
    expect(textCells(view.container).slice(0, 2)).toEqual(["Druhý", "První"]);
    const rows = view.container.querySelectorAll("tbody tr");
    expect(rows[rows.length - 1]?.textContent).toContain("Zaokrouhlení");
  });
});

describe("JournalLinesEditor – klávesnice", () => {
  it("F2 otevře editor, Esc vrátí hodnotu a psaní přepíše obsah", () => {
    const view = render(<Editor />);
    const text = cell(view.container, "l1:text")!;
    fireEvent.keyDown(text, { key: "F2" });
    const input = text.querySelector("input")!;
    expect(input.value).toBe("První");
    fireEvent.change(input, { target: { value: "Změna" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(text.querySelector("input")).toBeNull();
    expect(text.textContent).toContain("První");
    fireEvent.keyDown(text, { key: "X" });
    expect(text.querySelector("input")?.value).toBe("X");
  });

  it("Enter i Tab potvrdí hodnotu a přesunou fokus na další buňku", async () => {
    const view = render(<Editor />);
    const text = cell(view.container, "l1:text")!;
    fireEvent.keyDown(text, { key: "F2" });
    fireEvent.change(text.querySelector("input")!, { target: { value: "Nový text" } });
    fireEvent.keyDown(text.querySelector("input")!, { key: "Tab" });
    expect(text.textContent).toContain("Nový text");
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("data-cell-key")).toBe("l1:debitAccount"),
    );
    const amount = cell(view.container, "l1:amount")!;
    fireEvent.keyDown(amount, { key: "Enter" });
    fireEvent.keyDown(amount.querySelector("input")!, { key: "Enter", shiftKey: true });
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("data-cell-key")).toBe("l1:creditAccount"),
    );
  });

  it("přepínač nedaňový není v pořadí Tab", () => {
    const view = render(<Editor isNonTaxAllowed={() => true} />);
    const toggle = view.getAllByRole("button", { name: "Daňový – klikněte pro nedaňový" })[0]!;
    expect(toggle.getAttribute("tabindex")).toBe("-1");
  });
});

describe("JournalLinesEditor – součty", () => {
  it("sečte řádky do patičky a ohlásí součty rodiči", () => {
    let totals: { base: number } | undefined;
    const view = render(<Editor onTotalsChange={(next) => (totals = next)} />);
    const footer = view.container.querySelector('[data-slot="journal-lines-total-base"]');
    expect(squash(footer?.textContent)).toBe("1 500,00");
    expect(totals?.base).toBe(1500);
  });

  it("ukáže zbývající rozdíl a po vyrovnání stav Rozepsáno", () => {
    const view = render(<Editor totalMode="entered" totalAmount={1600} />);
    const remaining = () =>
      squash(view.container.querySelector('[data-slot="journal-lines-remaining"]')?.textContent);
    expect(remaining()).toBe("Zbývá rozepsat 100,00");
    cleanup();
    const balanced = render(<Editor totalMode="entered" totalAmount={1500} />);
    expect(
      balanced.container.querySelector('[data-slot="journal-lines-remaining"]')?.textContent,
    ).toContain("Rozepsáno");
  });
});

describe("JournalLinesEditor – režimy", () => {
  it("MD i DAL: každý řádek má obě strany", () => {
    const view = render(<Editor />);
    expect(cell(view.container, "l1:debitAccount")).not.toBeNull();
    expect(cell(view.container, "l1:creditAccount")).not.toBeNull();
    expect(cell(view.container, "l1:counterAccount")).toBeNull();
  });

  it("jen protiúčet: hlavní účet doplní nový řádek a zobrazí se jen protiúčet", () => {
    let latest: JournalLine[] = [];
    const view = render(
      <Editor
        mode="mainAccount"
        mainSide="MD"
        mainAccount="211000"
        initial={[{ id: "p1", debitAccount: "211000", creditAccount: "321100", amount: 10 }]}
        onLines={(lines) => (latest = lines)}
      />,
    );
    expect(cell(view.container, "p1:counterAccount")?.textContent).toContain("321.100");
    expect(cell(view.container, "p1:debitAccount")).toBeNull();
    expect(cell(view.container, "p1:dimensionId")).not.toBeNull();
    fireEvent.click(view.getByRole("button", { name: "Přidat řádek (Ctrl+Enter)" }));
    expect(latest[1]?.debitAccount).toBe("211000");
    expect(latest[1]?.creditAccount).toBeNull();
  });

  it("množstevní sloupce řídí prop showQuantityColumns", () => {
    const hidden = render(<Editor />);
    expect(cell(hidden.container, "l1:quantity")).toBeNull();
    cleanup();
    const shown = render(<Editor showQuantityColumns />);
    expect(cell(shown.container, "l1:quantity")).not.toBeNull();
  });

  it("tužka v editoru vybrané měrné jednotky předá její id aplikaci", () => {
    const edit = mock();
    const view = render(
      <Editor
        initial={[{ ...LINES[0]!, unitId: "piece", quantity: 1, unitPrice: 1000 }]}
        showQuantityColumns
        units={[{ id: "piece", code: "ks", name: "kus", isActive: true }]}
        onEditUnit={edit}
      />,
    );
    fireEvent.doubleClick(cell(view.container, "l1:unitId")!);
    fireEvent.click(view.getByRole("button", { name: "Upravit vybraný záznam" }));
    expect(edit).toHaveBeenCalledWith("piece");
  });
});

describe("JournalLinesEditor – chyby řádků", () => {
  it("ohlásí chybu s číslem řádku a označí buňku", () => {
    const calls: { line: number; field: string; message: string }[][] = [];
    const view = render(
      <Editor
        initial={[LINES[0]!, { ...LINES[1]!, creditAccount: null }]}
        onValidationChange={(_count, errors) => calls.push(errors)}
      />,
    );
    expect(calls.at(-1)).toEqual([
      { line: 2, field: "creditAccount", message: "Vyberte účet DAL" },
    ]);
    expect(cell(view.container, "l2:creditAccount")?.getAttribute("data-invalid")).toBe("true");
    expect(cell(view.container, "l1:creditAccount")?.hasAttribute("data-invalid")).toBe(false);
  });
});

describe("JournalLinesEditor – detail a DPH", () => {
  it("detail řádku nabídne skrytá pole včetně VS", () => {
    const view = render(<Editor />);
    fireEvent.click(view.getAllByRole("button", { name: "Zobrazit detail řádku (Alt+↓)" })[0]!);
    const detail = view.container.querySelector('[data-slot="journal-line-detail-fields"]');
    expect(detail?.textContent).toContain("MD VS");
  });

  it("nový řádek převezme kód DPH předchozího řádku, jinak výchozí kód", () => {
    let latest: JournalLine[] = [];
    const vat = { enabled: true, codes: CODES, calcMode: "net" as const, defaultCodeId: "v21" };
    const view = render(
      <Editor
        vat={vat}
        initial={[{ ...LINES[0]!, vatCodeId: "v12" }]}
        onLines={(lines) => (latest = lines)}
      />,
    );
    fireEvent.click(view.getByRole("button", { name: "Přidat řádek (Ctrl+Enter)" }));
    expect(latest.find((line) => line.isBlank)?.vatCodeId).toBe("v12");
    cleanup();
    const empty = render(<Editor vat={vat} initial={[]} onLines={(lines) => (latest = lines)} />);
    fireEvent.click(empty.getByRole("button", { name: "Přidat řádek (Ctrl+Enter)" }));
    expect(latest.find((line) => line.isBlank)?.vatCodeId).toBe("v21");
  });

  it("detail nabízí nárok na odpočet i u samovyměření", () => {
    const view = render(
      <Editor
        vat={{ enabled: true, codes: CODES, calcMode: "net" }}
        initial={[{ ...LINES[0]!, vatCodeId: "rc" }]}
      />,
    );
    fireEvent.click(view.getAllByRole("button", { name: "Zobrazit detail řádku (Alt+↓)" })[0]!);
    expect(view.container.textContent).toContain("Nárok na odpočet");
  });

  it("sloupec Ř. má kompaktní šířku 4,25 rem", () => {
    const layout = resolveJournalColumnLayout({
      availableWidthRem: 100,
      mode: "internal",
      visibleColumnIds: ["row"],
    });
    expect(layout.requiredWidthRem).toBe(4.25);
  });
});
