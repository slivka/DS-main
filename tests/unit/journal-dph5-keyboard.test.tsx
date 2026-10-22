import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

// Radix vybírá useLayoutEffect při prvním načtení modulu; vynutíme skutečný efekt i po SSR testech.
mock.module("@radix-ui/react-use-layout-effect", () => ({
  useLayoutEffect: React.useLayoutEffect,
}));

const { cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { JournalLinesEditor } =
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

/** Enter na buňce; otevře-li se editor, Enter i v něm. */
function pressEnter(target: HTMLElement) {
  fireEvent.keyDown(target, { key: "Enter" });
  const input = target.querySelector("input");
  if (input) fireEvent.keyDown(input, { key: "Enter" });
}

describe("DPH 5 B – sloupce", () => {
  it("výchozí pořadí Popis · Kód DPH · Částka · MD · DAL bez Sazby, DPH a Celkem", () => {
    const view = render(<Editor vat={{ enabled: true, codes: CODES }} />);
    const keys = [...view.container.querySelectorAll<HTMLElement>('[data-cell-key^="l1:"]')].map(
      (el) => el.dataset.cellKey!.split(":")[1],
    );
    expect(keys.slice(0, 5)).toEqual([
      "text",
      "vatCodeId",
      "amount",
      "debitAccount",
      "creditAccount",
    ]);
    expect(keys).not.toContain("vatRate");
    expect(keys).not.toContain("vatAmount");
    expect(keys).not.toContain("grossAmount");
    expect(keys).not.toContain("quantity");
  });
});

describe("DPH 5 B – klávesnice", () => {
  it("Enter na vyplněném poli přeskočí bez otevření editoru", async () => {
    const view = render(<Editor />);
    const text = cell(view.container, "l1:text")!;
    text.focus();
    fireEvent.keyDown(text, { key: "Enter" });
    expect(text.querySelector("input")).toBeNull();
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("data-cell-key")).toBe("l1:amount"),
    );
  });

  it("Enter na konci řádku založí řádek s účty z předchozího", async () => {
    let latest: JournalLine[] = [];
    const view = render(<Editor onLines={(lines) => (latest = lines)} />);
    const cells = [
      ...view.container.querySelectorAll<HTMLElement>('[data-cell-key^="l2:"][tabindex="0"]'),
    ];
    pressEnter(cells[cells.length - 1]!);
    await waitFor(() => expect(latest).toHaveLength(3));
    expect(latest[2]?.debitAccount).toBe("518001");
    expect(latest[2]?.creditAccount).toBe("321100");
    expect(latest[2]?.amount).toBeUndefined();
  });

  it("Enter v Popisu prázdného nového řádku řádek zahodí a skočí do rekapitulace", async () => {
    let latest: JournalLine[] = [];
    const blank: JournalLine = { id: "l3", isBlank: true };
    const view = render(
      <Editor initial={[...LINES, blank]} onLines={(lines) => (latest = lines)} />,
    );
    fireEvent.keyDown(cell(view.container, "l3:text")!, { key: "Enter" });
    expect(latest.map((line) => line.id)).toEqual(["l1", "l2"]);
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("data-slot")).toBe("journal-difference-bar"),
    );
  });

  it("zakotvený sloupec předá hodnotu novému řádku světleji a starší řádky nemění", () => {
    let latest: JournalLine[] = [];
    const view = render(<Editor onLines={(lines) => (latest = lines)} />);
    fireEvent.click(view.getByRole("button", { name: "Zakotvit sloupec Popis" }));
    expect(
      view.getByRole("button", { name: "Uvolnit sloupec Popis" }).getAttribute("aria-pressed"),
    ).toBe("true");
    fireEvent.click(view.getByRole("button", { name: "Přidat řádek (Ctrl+Enter)" }));
    const added = latest[2]!;
    expect(added.text).toBe("Druhý");
    expect(latest[0]?.text).toBe("První");
    expect(cell(view.container, `${added.id}:text`)?.dataset.inherited).toBe("true");
  });
});
