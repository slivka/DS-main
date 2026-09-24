import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { filterByGridPeriod, gridPeriodLabel, gridPeriodRange, moveGridPeriod } from "../../src/components/ds/grid/grid-period";
import { createGridBookColumn, GridBookSelect, GridContextBar, GRID_BOOK_COLUMN_ID, placeGridBookColumnFirst } from "../../src/components/ds/grid/grid-context-bar";
import { BookSelect } from "../../src/components/ds/accounting/book-select";
import { GridZoomContext } from "../../src/components/ds/grid/grid-zoom";

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

describe("kontextový řádek gridu", () => {
  const book = { books: [{ id: "a", code: "A", name: "Kniha A" }], value: "a", onChange: () => {} };

  it("použije bez kontextu normální hustotu a zoom 100 %", () => {
    const html = renderToStaticMarkup(createElement(GridContextBar, { book }));
    expect(html).toContain('data-density="normal"');
    expect(html).toContain('font-size:13.00px');
  });

  it("převezme zoom a hustotu z GridZoomContext", () => {
    const html = renderToStaticMarkup(createElement(GridZoomContext.Provider, { value: { zoom: 0.6, density: "compact", setZoom: () => {} } }, createElement(GridContextBar, { book })));
    expect(html).toContain('data-density="compact"');
    expect(html).toContain('font-size:7.80px');
  });

  it("řadí knihu, oddělovač a období zleva a oddělovač bez dvojice nezobrazí", () => {
    const period = { fiscalFrom: "2026-01-01", fiscalTo: "2026-12-31", value: gridPeriodRange("2026-01-01", "2026-12-31", "all"), onChange: () => {}, today: "2026-09-24" };
    const both = renderToStaticMarkup(createElement(GridContextBar, { book, period }));
    expect(both.indexOf("Kniha A")).toBeLessThan(both.indexOf('aria-hidden="true"'));
    expect(both.indexOf('aria-hidden="true"')).toBeLessThan(both.indexOf("Celé období"));
    expect(renderToStaticMarkup(createElement(GridContextBar, { book }))).not.toContain('aria-hidden="true"');
    expect(renderToStaticMarkup(createElement(GridContextBar, { period }))).not.toContain('aria-hidden="true"');
  });

  it("jedinou knihu vykreslí jen jako text bez tlačítka nebo comboboxu", () => {
    const html = renderToStaticMarkup(createElement(GridBookSelect, { ...book, onChange: () => {} }));
    expect(html).toContain("<strong");
    expect(html).toContain("Kniha A");
    expect(html).not.toContain("<button");
    expect(html).not.toContain('role="combobox"');
  });

  it("readOnly výběr vykreslí vybranou knihu nebo všechny knihy jen jako text", () => {
    const books = [book.books[0], { id: "b", code: "B", name: "Kniha B" }];
    const selected = renderToStaticMarkup(createElement(GridBookSelect, { books, value: "b", readOnly: true }));
    const all = renderToStaticMarkup(createElement(GridBookSelect, { books, value: "all", readOnly: true }));
    expect(selected).toContain("Kniha B");
    expect(all).toContain("Všechny knihy");
    expect(selected).not.toContain("<button");
    expect(all).not.toContain("<button");
  });

  it("neznámou hodnotu více knih zobrazí jako výběr Všechny knihy", () => {
    const books = [book.books[0], { id: "b", code: "B", name: "Kniha B" }];
    const html = renderToStaticMarkup(createElement(GridBookSelect, { books, value: "missing", onChange: () => {} }));
    expect(html).toContain("<button");
    expect(html).toContain("Všechny knihy");
  });

  it("formulářovou jedinou knihu zobrazí jako hodnotu bez výběru", () => {
    const html = renderToStaticMarkup(createElement(BookSelect, { books: book.books, value: "a", onChange: () => {} }));
    expect(html).toContain("A – Kniha A");
    expect(html).not.toContain("<button");
    expect(html).not.toContain('role="combobox"');
  });
});
