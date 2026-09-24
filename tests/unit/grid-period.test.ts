import { describe, expect, it } from "vitest";
import { filterByGridPeriod, gridPeriodLabel, gridPeriodRange, moveGridPeriod } from "../../src/components/ds/grid/grid-period";
import { createGridBookColumn, GRID_BOOK_COLUMN_ID, placeGridBookColumnFirst } from "../../src/components/ds/grid/grid-context-bar";

describe("období gridu", () => {
  it("počítá měsíce kalendářního období", () => {
    expect(gridPeriodRange("2026-01-01", "2026-12-31", "month", 2)).toEqual({ kind: "month", index: 2, from: "2026-03-01", to: "2026-03-31" });
  });
  it("počítá čtvrtletí od začátku nekalendářního období", () => {
    expect(gridPeriodRange("2026-07-01", "2027-06-30", "quarter", 1)).toEqual({ kind: "quarter", index: 1, from: "2026-10-01", to: "2026-12-31" });
  });
  it("omezuje YTD koncem účetního období", () => {
    expect(gridPeriodRange("2026-07-01", "2027-06-30", "ytd", 0, "2027-09-25").to).toBe("2027-06-30");
  });
  it("nepustí posun před začátek ani za konec", () => {
    const first = gridPeriodRange("2026-07-01", "2027-06-30", "quarter", 0);
    expect(moveGridPeriod("2026-07-01", "2027-06-30", first, -1)).toEqual(first);
    expect(moveGridPeriod("2026-07-01", "2027-06-30", gridPeriodRange("2026-07-01", "2027-06-30", "quarter", 3), 1).index).toBe(3);
  });
  it("filtruje včetně obou hranic a tvoří český popis", () => {
    const value = gridPeriodRange("2026-07-01", "2027-06-30", "month", 0);
    expect(filterByGridPeriod([{ d: "2026-06-30" }, { d: "2026-07-01" }, { d: "2026-07-31" }, { d: "2026-08-01" }], value, (row) => row.d)).toHaveLength(2);
    expect(gridPeriodLabel(value)).toContain("červenec");
  });
});

describe("sloupec knihy", () => {
  it("je povinný, dočasný a vždy první", () => {
    const book = createGridBookColumn({ books: [{ id: "a", code: "A", name: "Kniha A" }], value: "all", onChange: () => {}, getRowBookId: () => "a" });
    expect(book.locked).toBe(true);
    expect(book.transient).toBe(true);
    expect(placeGridBookColumnFirst([{ id: "date" }, book, { id: "amount" }]).map((column) => column.id)).toEqual([GRID_BOOK_COLUMN_ID, "date", "amount"]);
  });
});
