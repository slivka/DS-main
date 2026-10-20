import { afterEach, describe, expect, it } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import {
  RecordHistoryTimeline,
  groupHistoryByDay,
  type HistoryEvent,
  type HistoryKind,
  type HistoryMode,
} from "../../src/components/ds/feedback/record-history-timeline";
import { DsTextsProvider } from "../../src/ds-texts";

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
    expect(screen.getAllByTestId("history-count")[0].textContent).toContain("2 změn");
    fireEvent.click(screen.getByRole("radio", { name: "Rozšířený" }));
    expect(screen.getAllByTestId("history-detail").length).toBeGreaterThan(0);
    expect(screen.getByText("ACME")).toBeTruthy();
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    expect(screen.getByText("Přidán řádek 3: Servis 1 500,00")).toBeTruthy();
  });

  it("filtr typů zúží události, bez výběru zobrazí vše", () => {
    render(<Demo />);
    const group = screen.getByRole("group", { name: "Typy událostí" });
    fireEvent.click(within(group).getByRole("button", { name: "Poznámky" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(within(group).getByRole("button", { name: "Stavy" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    fireEvent.click(within(group).getByRole("button", { name: "Stavy" }));
    fireEvent.click(within(group).getByRole("button", { name: "Poznámky" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("automatické přepočty jsou sbalené a rozbalí se", () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("radio", { name: "Rozšířený" }));
    const toggle = screen.getByRole("button", { name: "Automatické přepočty (1)" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText("2 415,00")).toBeNull();
    fireEvent.click(toggle);
    expect(screen.getByText("2 415,00")).toBeTruthy();
  });

  it("slovenské texty z DsTextsProvider", () => {
    render(<Demo locale="sk" />);
    expect(screen.getByRole("radio", { name: "Rozšírený" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Väzby" })).toBeTruthy();
  });
});
