import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { filterByGridPeriod, gridPeriodLabel, gridPeriodRange, moveGridPeriod } from "../../src/components/ds/grid/grid-period";
import { createGridBookColumn, GridBookSelect, GridContextBar, GRID_BOOK_COLUMN_ID, placeGridBookColumnFirst } from "../../src/components/ds/grid/grid-context-bar";
import { BookSelect } from "../../src/components/ds/accounting/book-select";
import { GridZoomContext } from "../../src/components/ds/grid/grid-zoom";
import { filterByDirection, GRID_DIRECTION_OPTIONS, GridSegmentedToggle, nextGridSegmentValue } from "../../src/components/ds/grid/grid-segmented-toggle";

describe("období gridu", () => {
  it("počítá měsíce kalendářního období", () => {
    expect(gridPeriodRange("2026-01-01", "2026-12-31", "month", 2)).toEqual({ kind: "month", index: 2, from: "2026-03-01", to: "2026-03-31" });
  });
  it("počítá čtvrtletí od začátku nekalendářního období", () => {
    expect(gridPeriodRange("2026-07-01", "2027-06-30", "quarter", 1)).toEqual({ kind: "quarter", index: 1, from: "2026-10-01", to: "2026-12-31" });
  });
  it("omezuje YTD koncem účetního období", () => {
    const value = gridPeriodRange("2026-07-01", "2027-06-30", "ytd", 0, "2027-09-25");
    expect(value.to).toBe("2027-06-30");
    expect(gridPeriodLabel(value)).toBe("1. 7. 2026 – 30. 6. 2027");
  });
  it("zkracuje začátek YTD jen v témže roce", () => {
    expect(gridPeriodLabel({ kind: "ytd", from: "2026-01-01", to: "2026-09-24" })).toBe("1. 1. – 24. 9. 2026");
    expect(gridPeriodLabel({ kind: "ytd", from: "2025-07-01", to: "2026-09-24" })).toBe("1. 7. 2025 – 24. 9. 2026");
    expect(gridPeriodLabel({ kind: "custom", from: "2026-01-01", to: "2026-09-24" })).toBe("1. 1. 2026 – 24. 9. 2026");
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
    expect(both.indexOf("Kniha A")).toBeLessThan(both.indexOf("w-px shrink-0"));
    expect(both.indexOf("w-px shrink-0")).toBeLessThan(both.indexOf("Celé období"));
    expect(renderToStaticMarkup(createElement(GridContextBar, { book }))).not.toContain("w-px shrink-0");
    expect(renderToStaticMarkup(createElement(GridContextBar, { period }))).not.toContain("w-px shrink-0");
  });

  it("zobrazuje české popisky a váže je na knihu i období", () => {
    const period = { fiscalFrom: "2026-01-01", fiscalTo: "2026-12-31", value: gridPeriodRange("2026-01-01", "2026-12-31", "all"), onChange: () => {} };
    const html = renderToStaticMarkup(createElement(GridContextBar, { book, period }));
    expect(html).toContain(">Kniha:</label>");
    expect(html).toContain(">Období:</label>");
    const bookLabelId = html.match(/id="(grid-book-label-[^"]+)"/)?.[1];
    const periodLabelId = html.match(/id="(grid-period-label-[^"]+)"/)?.[1];
    expect(bookLabelId).toBeTruthy();
    expect(periodLabelId).toBeTruthy();
    expect(html).toContain(`aria-labelledby="${bookLabelId}"`);
    expect(html).toContain(`aria-labelledby="${periodLabelId}"`);
  });

  it("přijímá vlastní popisky přes texts", () => {
    const html = renderToStaticMarkup(createElement(GridContextBar, { book, texts: { bookLabel: "Agenda:" } }));
    expect(html).toContain(">Agenda:</label>");
  });

  it("vykreslí řádek i pouze s pravým obsahem", () => {
    const html = renderToStaticMarkup(createElement(GridContextBar, { contextRight: createElement("span", null, "Směr") }));
    expect(html).toContain("Směr");
    expect(html).toContain("ml-auto");
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

  it("drží všechny popisky knih ve stejné překryvné buňce", () => {
    const books = [book.books[0], { id: "b", code: "B", name: "Výrazně delší název knihy" }];
    const html = renderToStaticMarkup(createElement(GridBookSelect, { books, value: "a", onChange: () => {} }));
    expect(html).toContain("Kniha A");
    expect(html).toContain("Výrazně delší název knihy");
    expect(html).toContain("Všechny knihy");
    expect(html.match(/\[grid-area:1\/1\]/g)).toHaveLength(3);
    expect(html).toContain("invisible");
    expect(html).toContain('aria-hidden="true"');
  });

  it("drží typické i vybrané popisky období ve stejné překryvné buňce", () => {
    const period = { fiscalFrom: "2026-01-01", fiscalTo: "2026-12-31", value: gridPeriodRange("2026-01-01", "2026-12-31", "ytd", 0, "2026-09-25"), onChange: () => {} };
    const html = renderToStaticMarkup(createElement(GridContextBar, { period }));
    expect(html).toContain("Celé období");
    expect(html).toContain("1. 1. – 25. 9. 2026");
    expect((html.match(/\[grid-area:1\/1\]/g) ?? []).length).toBeGreaterThanOrEqual(6);
  });

  it("formulářovou jedinou knihu zobrazí jako hodnotu bez výběru", () => {
    const html = renderToStaticMarkup(createElement(BookSelect, { books: book.books, value: "a", onChange: () => {} }));
    expect(html).toContain("A – Kniha A");
    expect(html).not.toContain("<button");
    expect(html).not.toContain('role="combobox"');
  });
});

describe("směr dokladů", () => {
  it("je výchozí neutrální a aktivní filtr oranžový", () => {
    const neutral = renderToStaticMarkup(createElement(GridSegmentedToggle, { options: GRID_DIRECTION_OPTIONS, value: "all", onChange: () => {}, defaultValue: "all", ariaLabel: "Směr" }));
    const active = renderToStaticMarkup(createElement(GridSegmentedToggle, { options: GRID_DIRECTION_OPTIONS, value: "in", onChange: () => {}, defaultValue: "all", ariaLabel: "Směr" }));
    expect(neutral).not.toContain("grid-toolbar-active");
    expect(active).toContain("grid-toolbar-active");
    expect(active).toContain('role="radiogroup"');
    expect(active).toContain('aria-checked="true"');
  });

  it("šipkami přechází mezi segmenty včetně cyklického přechodu", () => {
    expect(nextGridSegmentValue(GRID_DIRECTION_OPTIONS, "all", 1)).toBe("in");
    expect(nextGridSegmentValue(GRID_DIRECTION_OPTIONS, "all", -1)).toBe("out");
  });

  it("filtruje příjmy a výdaje, all vrací původní pole", () => {
    const rows = [{ direction: "in" as const }, { direction: "out" as const }, { direction: "in" as const }];
    expect(filterByDirection(rows, "all", (row) => row.direction)).toBe(rows);
    expect(filterByDirection(rows, "in", (row) => row.direction)).toHaveLength(2);
    expect(filterByDirection(rows, "out", (row) => row.direction)).toHaveLength(1);
  });
});
