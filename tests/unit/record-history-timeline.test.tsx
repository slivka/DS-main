import { afterEach, describe, expect, it } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { RecordHistoryTimeline, type HistoryEvent, type HistoryKind, type HistoryMode } from "../../src/components/ds/feedback/record-history-timeline";
import { groupHistoryByDay } from "../../src/components/ds/feedback/record-history-model";
import { DsTextsProvider, DS_TEXTS_CS, DS_TEXTS_SK } from "../../src/ds-texts";

afterEach(cleanup);
const NOW = new Date("2026-10-20T12:00:00Z");
const events: HistoryEvent[] = [
  {
    id: "a",
    at: "2026-10-20T09:00:00Z",
    author: "Jana",
    kind: "status",
    title: "Zařazeno",
    statusChange: { from: "Koncept", to: "Zařazen" },
    changes: [
      { label: "Partner", after: "ACME" },
      { label: "VS", before: "1", after: "2" },
    ],
  },
  { id: "b", at: "2026-10-19T09:00:00Z", kind: "note", title: "Přidána poznámka" },
  {
    id: "c",
    at: "2026-10-14T09:00:00Z",
    author: "Petr",
    kind: "change",
    title: "Upraveny řádky",
    lines: [{ label: "řádek 3", kind: "added", summary: "Servis 1 500,00" }],
    auto: [{ label: "DPH", before: "2 100,00", after: "2 415,00" }],
  },
];
function Demo({ locale }: { locale?: "sk" }) {
  const [mode, setMode] = useState<HistoryMode>("basic");
  const [filter, setFilter] = useState<HistoryKind[]>([]);
  return (
    <DsTextsProvider locale={locale}>
      <TooltipProvider>
        <RecordHistoryTimeline
          events={events}
          now={NOW}
          mode={mode}
          onModeChange={setMode}
          filter={filter}
          onFilterChange={setFilter}
        />
      </TooltipProvider>
    </DsTextsProvider>
  );
}

describe("RecordHistoryTimeline", () => {
  it("seskupí po dnech od nejnovější: Dnes, Včera, datum", () => {
    const groups = groupHistoryByDay(events, NOW);
    expect(groups.map((g) => g.relative)).toEqual(["today", "yesterday", "date"]);
    render(<Demo />);
    const headings = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(["Dnes", "Včera", "14.10.2026"]);
  });

  it("základní režim ukáže počty, rozšířený tabulku Bylo → Je s „—“", () => {
    render(<Demo />);
    expect(screen.queryByTestId("history-detail")).toBeNull();
    expect(screen.getAllByTestId("history-count")[0].textContent).toContain("2 změny");
    fireEvent.click(screen.getByRole("button", { name: "Rozšířený" }));
    expect(screen.getAllByTestId("history-detail").length).toBeGreaterThan(0);
    expect(screen.getByText("ACME")).toBeTruthy();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("Přidán řádek 3: Servis 1 500,00")).toBeTruthy();
  });

  it("starý filter se převede na skryté typy a změna volá původní callback", async () => {
    render(<Demo />);
    const menu = async () => {
      fireEvent.pointerDown(screen.getByRole("button", { name: "Typy událostí" }), {
        button: 0,
        ctrlKey: false,
      });
      await act(async () => {});
    };
    await menu();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Poznámky" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    await menu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Zobrazit vše" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("hiddenKinds může skrýt všechny typy a odkaz vyžádá zobrazení všech", () => {
    const calls: HistoryKind[][] = [];
    render(
      <TooltipProvider>
        <RecordHistoryTimeline
          events={events}
          mode="basic"
          onModeChange={() => {}}
          filter={["status"]}
          hiddenKinds={["status", "note", "change"]}
          onHiddenKindsChange={(next) => calls.push(next)}
          now={NOW}
        />
      </TooltipProvider>,
    );
    expect(screen.queryByText("Zařazeno")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Zobrazit vše" }));
    expect(calls).toEqual([[]]);
  });

  it("neprázdný starý filter zobrazí pouze vybrané typy", () => {
    render(
      <TooltipProvider>
        <RecordHistoryTimeline
          events={events}
          mode="basic"
          onModeChange={() => {}}
          filter={["note"]}
          onFilterChange={() => {}}
          now={NOW}
        />
      </TooltipProvider>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByText("Přidána poznámka")).toBeTruthy();
  });

  it("automatické přepočty jsou sbalené a rozbalí se", () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Rozšířený" }));
    const toggle = screen.getByRole("button", { name: "Automatické přepočty (1)" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("2 415,00")).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText("2 415,00")).toBeTruthy();
  });

  it("slovenské texty z DsTextsProvider", async () => {
    render(<Demo locale="sk" />);
    expect(screen.getByRole("button", { name: "Rozšírený" })).toBeTruthy();
    fireEvent.pointerDown(screen.getByRole("button", { name: "Typy udalostí" }), {
      button: 0,
      ctrlKey: false,
    });
    await act(async () => {});
    expect(screen.getByRole("menuitemcheckbox", { name: "Väzby" })).toBeTruthy();
  });

  it("skloňuje počet změn v CS i SK", () => {
    const cs = DS_TEXTS_CS.recordHistory.changesCount;
    const sk = DS_TEXTS_SK.recordHistory.changesCount;
    expect([1, 3, 5].map(cs)).toEqual(["1 změna", "3 změny", "5 změn"]);
    expect([1, 3, 5].map(sk)).toEqual(["1 zmena", "3 zmeny", "5 zmien"]);
    expect(cs(0)).toBe("0 změn");
  });
});
