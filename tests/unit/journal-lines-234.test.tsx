import { describe, expect, it } from "bun:test";
import { calculateLineAmount, orderJournalLines, reorderJournalLines, roundingSuggestion } from "../../src/components/ds/accounting/journal-lines-editor";
import type { JournalLine } from "../../src/components/ds/accounting/journal-lines";

describe("JournalLinesEditor 2.34.0", () => {
  it("navrhne vyrovnání z rozdílu jen v limitu", () => {
    expect(roundingSuggestion({ totalMode: "entered", expectedAmount: 100, linesTotal: 99.6, limit: 0.5 })).toBe(0.4);
    expect(roundingSuggestion({ totalMode: "entered", expectedAmount: 100, linesTotal: 90, limit: 0.5 })).toBe(0);
  });
  it("při součtu zaokrouhlí rozpis na celé jednotky", () => {
    expect(roundingSuggestion({ totalMode: "computed", linesTotal: 99.6 })).toBe(0.4);
  });
  it("počítá množství krát cenu na dvě desetinná místa", () => {
    expect(calculateLineAmount(3, 14.9)).toBe(44.7);
  });
  it("při přesunu ponechá připnuté řádky na konci ve správném pořadí", () => {
    const lines: JournalLine[] = [
      { id: "a", amount: 1 }, { id: "r", amount: 0.1, isRounding: true },
      { id: "b", amount: 2 }, { id: "fx", amount: -0.01, isFxRounding: true },
    ];
    expect(orderJournalLines(lines).map((line) => line.id)).toEqual(["a", "b", "fx", "r"]);
    expect(reorderJournalLines(lines, "a", "b").map((line) => line.id)).toEqual(["b", "a", "fx", "r"]);
  });
});
describe("JournalLinesEditor 2.48", () => {
  it("vytvoří počáteční prázdný řádek bez nulové částky a bez validace", async () => {
    const onChange = mock();
    const { JournalLinesEditor } = await import("@/components/ds/accounting/journal-lines-editor");
    render(<JournalLinesEditor lines={[]} onChange={onChange} accounts={[]} mode="full" initialEmptyLine />);
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ isBlank: true, amount: undefined });
    expect(screen.queryByText(/Chyby:/)).not.toBeInTheDocument();
  });

  it("tlačítko plus má úplný přístupný název", async () => {
    const { JournalLinesEditor } = await import("@/components/ds/accounting/journal-lines-editor");
    render(<JournalLinesEditor lines={[]} onChange={() => {}} accounts={[]} mode="full" />);
    expect(screen.getByRole("button", { name: "Přidat řádek (Ctrl+Enter)" })).toHaveTextContent("＋");
  });
});
