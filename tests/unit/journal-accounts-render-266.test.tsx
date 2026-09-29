import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/" });
const { cleanup, fireEvent, render, within, act } = await import("@testing-library/react");
const { JournalLinesEditor } = await import("../../src/components/ds/accounting/journal-lines-editor");
const { JournalLinesRecap } = await import("../../src/components/ds/accounting/journal-lines-recap");
const { DocumentSettingsDialog } = await import("../../src/components/ds/accounting/document-settings-dialog");
const { DsTextsProvider } = await import("../../src/ds-texts");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
type JournalLine = import("../../src/components/ds/accounting/journal-lines").JournalLine;

const ACCOUNTS = [
  { code: "321100", name: "Závazky" },
  { code: "518001", name: "Služby" },
  { code: "343100", name: "DPH" },
  { code: "548001", name: "Zaokrouhlení" },
];
const originalRect = HTMLElement.prototype.getBoundingClientRect;
let width = 1600;

beforeEach(() => {
  localStorage.clear();
  width = 1600;
  HTMLElement.prototype.getBoundingClientRect = function () { return { width, height: 400, top: 0, left: 0, right: width, bottom: 400, x: 0, y: 0, toJSON: () => ({}) } as DOMRect; };
});
afterEach(() => { cleanup(); HTMLElement.prototype.getBoundingClientRect = originalRect; });
afterAll(async () => { if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister(); });

const headers = (root: HTMLElement) => [...root.querySelectorAll("table[role=grid] thead th")].map((th) => th.textContent?.trim() ?? "");

function Editor({ onLines, storageKey }: { onLines?: (lines: JournalLine[]) => void; storageKey: string }) {
  const [lines, setLines] = React.useState<JournalLine[]>([{ id: "a", debitAccount: "518001", creditAccount: "321100", amount: 1000, text: "Služba" }]);
  return <TooltipProvider><JournalLinesEditor lines={lines} onChange={(next) => { setLines(next); onLines?.(next); }} accounts={ACCOUNTS} documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč" storageKey={storageKey} /></TooltipProvider>;
}

describe("JournalLinesEditor 2.66 – vykreslení", () => {
  it("má výchozí záhlaví MD / DAL a rozšířené formy ve Sloupce vypnuté", async () => {
    const view = render(<Editor storageKey="r266-default" />);
    const shown = headers(view.container);
    expect(shown).toContain("MD");
    expect(shown).toContain("DAL");
    expect(shown).not.toContain("MD účet");
    expect(shown).not.toContain("DAL účet");
    const grid = view.container.querySelector("table[role=grid]")!;
    expect(grid.textContent).toContain("518.001");
    expect(grid.textContent).not.toContain("518.001 - Služby");
    fireEvent.click(view.getAllByRole("button", { name: /Sloupce/i })[0]!);
    const menu = await view.findByRole("dialog");
    const row = (label: string) => [...menu.querySelectorAll("label")].find((item) => item.textContent?.trim() === label)!;
    expect(row("MD účet").querySelector("[role=checkbox]")?.getAttribute("aria-checked")).toBe("false");
    expect(row("DAL účet").querySelector("[role=checkbox]")?.getAttribute("aria-checked")).toBe("false");
  });

  it("nedovolí odškrtnout poslední formu strany – zakázané zaškrtávátko s tooltipem", async () => {
    const view = render(<Editor storageKey="r266-last" />);
    fireEvent.click(view.getAllByRole("button", { name: /Sloupce/i })[0]!);
    const menu = await view.findByRole("dialog");
    const locked = [...menu.querySelectorAll("[data-slot=column-toggle-disabled]")];
    expect(locked.length).toBe(2);
    expect(locked[0]!.getAttribute("aria-label")).toBe("Aspoň jedna forma účtu musí zůstat zobrazená");
    expect(locked[0]!.querySelector("button")?.hasAttribute("disabled")).toBe(true);
    expect(locked[0]!.hasAttribute("title")).toBe(false);
    fireEvent.click(locked[0]!.querySelector("button")!);
    expect(headers(view.container)).toContain("MD");
  });

  it("obě formy zapnuté a úzká šířka – nevzniknou dva sloupce MD", () => {
    width = 420;
    localStorage.setItem("columns:r266-narrow:v4", JSON.stringify({ debitAccountName: true, creditAccountName: true }));
    const view = render(<Editor storageKey="r266-narrow" />);
    const shown = headers(view.container);
    expect(shown.filter((label) => label === "MD").length).toBe(1);
    expect(shown.filter((label) => label === "DAL").length).toBe(1);
    expect(shown).not.toContain("MD účet");
  });

  it("zkrácená rozšířená forma má krátký nadpis s tooltipem a ve Sloupce původní název", async () => {
    width = 420;
    localStorage.setItem("columns:r266-compact:v4", JSON.stringify({ debitAccount: false, debitAccountName: true }));
    const view = render(<Editor storageKey="r266-compact" />);
    const compact = view.container.querySelector("[data-slot=compact-account-heading]");
    expect(compact?.textContent).toBe("MD");
    expect(compact?.closest("th")?.hasAttribute("title")).toBe(false);
    fireEvent.click(view.getAllByRole("button", { name: /Sloupce/i })[0]!);
    const menu = await view.findByRole("dialog");
    const labels = [...menu.querySelectorAll("label")].map((item) => item.textContent?.trim());
    expect(labels).toContain("MD účet");
  });

  it.each([["krátké", "r266-edit-short", {}], ["rozšířené", "r266-edit-long", { debitAccount: false, debitAccountName: true }]] as const)("editace účtu v %s formě mění stejnou hodnotu", async (_label, key, preset) => {
    localStorage.setItem(`columns:${key}:v4`, JSON.stringify(preset));
    let last: JournalLine[] = [];
    const view = render(<Editor storageKey={key} onLines={(lines) => { last = lines; }} />);
    const cell = [...view.container.querySelectorAll("td")].find((td) => td.textContent?.includes("518.001"))!;
    fireEvent.click(cell);
    await new Promise((r) => setTimeout(r, 50));
    console.log("DBG", document.activeElement?.outerHTML.slice(0,400), "|||", [...document.querySelectorAll("[role=option],[role=listbox],[cmdk-item],input")].map((e) => e.outerHTML.slice(0,200)).join("\n"));
    const option = await view.findByRole("option", { name: /343\.100/ });
    await act(async () => { fireEvent.click(option); });
    expect(last[0]?.debitAccount).toBe("343100");
    expect(last[0]?.creditAccount).toBe("321100");
  });
});

describe("JournalLinesRecap 2.66 – vykreslení", () => {
  const lines: JournalLine[] = [
    { id: "1", debitAccount: "518001", creditAccount: "321100", amount: 1000, foreignAmount: 40 },
    { id: "2", debitAccount: "343100", creditAccount: "321100", amount: 210, foreignAmount: 8.4 },
    { id: "3", debitAccount: "321100", creditAccount: "518001", amount: 50, foreignAmount: 2 },
    { id: "r", debitAccount: "548001", creditAccount: null, amount: 0.4, foreignAmount: 0, isRounding: true },
  ];
  const rows = (root: HTMLElement) => [...root.querySelectorAll("tbody tr")].map((tr) => [...tr.querySelectorAll("td")].map((td) => td.textContent?.trim() ?? ""));

  it("zachová pořadí dat, součty, značky měn a popisek Zaokrouhlení v obou formách", () => {
    const view = render(<TooltipProvider><JournalLinesRecap lines={lines} accounts={ACCOUNTS} documentCurrency="EUR" documentCurrencySymbol="€" homeCurrency="CZK" homeCurrencySymbol="Kč" storageKey="recap-r266" /></TooltipProvider>);
    const shown = headers(view.container).length ? headers(view.container) : [...view.container.querySelectorAll("thead th")].map((th) => th.textContent?.trim() ?? "");
    expect(shown.join("|")).toContain("MD účet");
    expect(shown.join("|")).toContain("Celkem (Kč)");
    expect(shown.join("|")).toContain("Celkem (€)");
    const body = rows(view.container).map((cells) => cells.join(" | "));
    expect(body[0]).toContain("518.001 - Služby");
    expect(body[1]).toContain("343.100 - DPH");
    expect(body[2]).toContain("321.100 - Závazky");
    expect(view.container.querySelectorAll("tbody tr")[3]!.querySelector("td [title]")?.getAttribute("title")).toBe("548.001 - Zaokrouhlení Zaokrouhlení");
    expect(body[3]).toContain("—");
    const pinned = view.container.querySelectorAll("tbody tr")[3]!;
    expect(pinned.className).toContain("bg-muted");
    const text = view.container.textContent ?? "";
    expect(text).toContain("1 260,40");
    expect(text).toContain("50,40");
  });

  it("přebírá texty z DsTextsProvider a propu texts", () => {
    const view = render(<TooltipProvider><DsTextsProvider texts={{ journalRecap: { debitShort: "MD", creditShort: "DAL", debitAccount: "Má dať účet", creditAccount: "Dal účet" } }}><JournalLinesRecap lines={lines} accounts={ACCOUNTS} documentCurrency="CZK" homeCurrency="CZK" storageKey="recap-r266-texts" texts={{ creditAccount: "Dal (prop)" }} /></DsTextsProvider></TooltipProvider>);
    const text = [...view.container.querySelectorAll("thead th")].map((th) => th.textContent).join("|");
    expect(text).toContain("Má dať účet");
    expect(text).toContain("Dal (prop)");
  });
});

describe("DocumentSettingsDialog 2.66 – vykreslení", () => {
  it.each(["cs", "sk"] as const)("v jazyce %s nenabízí volbu zobrazení účtu", (locale) => {
    const value = { suggestDescription: true, descriptionScope: "company", suggestCounterparty: false, counterpartyScope: "company", amountFromLines: "book", showQuantityColumns: false, offerPrintAfterSave: false, printTwoPerPage: false } as never;
    render(<DsTextsProvider locale={locale}><DocumentSettingsDialog open onOpenChange={() => {}} value={value} onSave={() => {}} documentTypeLabel="Faktura" /></DsTextsProvider>);
    const dialog = document.body.textContent ?? "";
    expect(dialog).toContain("Faktura");
    expect(dialog).not.toMatch(/Účet v gridu|Účet v mriežke|Celý – |Číslo účtu/);
  });
});
