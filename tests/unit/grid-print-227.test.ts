import { describe, expect, it } from "bun:test";
import {
  buildGridPrintSection,
  gridPrintColumnWidths,
  gridPrintOrientation,
  gridPrintParams,
} from "../../src/components/ds/grid/grid-print";
import type { GridExportData } from "../../src/lib/excel-export";

describe("orientace tisku gridu", () => {
  it("do 7 úzkých sloupců na výšku", () =>
    expect(gridPrintOrientation([20, 20, 20, 20, 20, 20, 20])).toBe("portrait"));
  it("více než 7 sloupců na šířku", () =>
    expect(gridPrintOrientation(Array(8).fill(15))).toBe("landscape"));
  it("součet šířek nad 180 mm na šířku", () =>
    expect(gridPrintOrientation([80, 80, 30])).toBe("landscape"));
});

describe("parametry z kontextového řádku", () => {
  it("kniha, období, hledání, filtr, stav k datu a vlastní parametry v tomto pořadí", () => {
    const params = gridPrintParams({
      book: { books: [{ id: "fp", name: "Faktury přijaté" }], value: "fp" },
      period: { kind: "month", from: "2026-03-01", to: "2026-03-31" },
      search: " alfa ",
      filters: ["Stav: Zaúčtován"],
      asOf: { enabled: true, value: "2026-09-25" },
      extra: [{ label: "Účty", value: "S pohybem" }],
    });
    expect(params.map((item) => item.label)).toEqual([
      "Kniha",
      "Období",
      "Hledání",
      "Filtr",
      "Stav k datu",
      "Účty",
    ]);
    expect(params[0]?.value).toBe("Faktury přijaté");
    expect(params[1]?.value).toContain("1. 3. 2026 – 31. 3. 2026");
    expect(params[2]?.value).toBe("alfa");
    expect(params[4]?.value).toBe("25. 9. 2026");
  });
  it("všechny knihy a vypnutý stav k datu", () => {
    const params = gridPrintParams({
      book: { books: [], value: "all" },
      asOf: { enabled: false, value: "2026-01-01" },
    });
    expect(params).toEqual([{ label: "Kniha", value: "Všechny knihy" }]);
  });
});

describe("obsah tiskové tabulky", () => {
  it("tiskne jen sloupce z exportu – akce ani výběr v něm nejsou", () => {
    const data: GridExportData = {
      columns: ["Číslo", "Účet", "Částka"],
      rows: [
        ["A1", "221001", 10],
        ["A2", "311001", -2.5],
      ],
      columnMeta: [{ type: "text" }, { type: "text" }, { type: "number", total: "sum" }],
    };
    const section = buildGridPrintSection(data);
    expect(section.columns.map((column) => column.label)).toEqual(["Číslo", "Účet", "Částka"]);
    expect(section.columns.some((column) => /akce|výběr/i.test(column.label))).toBe(false);
    expect(section.columns[1]?.format).toBe("code");
    expect(section.columns[2]?.format).toBe("amount");
    expect(section.totals?.c2).toBe(7.5);
  });
  it("strom: rodič nad dětmi, tučně, odsazení 2 mm na úroveň a sbalený uzel bez dětí", () => {
    // export stromu: děti nad rodičem; uzel B je sbalený (bez dětí v datech)
    const data: GridExportData = {
      columns: ["Účet", "Částka"],
      rows: [
        ["  A1", 5],
        ["  A2", 7],
        ["A", 12],
        ["B", 30],
      ],
      rowLevels: [1, 1, 0, 0],
      outlineSummaryBelow: true,
      subtotalRows: [
        { row: 2, from: 0, to: 1 },
        { row: 3, from: 3, to: 2 },
      ],
      columnMeta: [{ type: "text" }, { type: "number", total: "sum" }],
    };
    const section = buildGridPrintSection(data);
    expect(section.rows.map((row) => row.c0)).toEqual(["A", "A1", "A2", "B"]);
    expect(section.rowStyles?.[0]).toEqual({ bold: true });
    expect(section.rowStyles?.[1]).toEqual({ indent: 2 });
    expect(section.rowStyles?.[3]).toEqual({ bold: true });
    expect(section.totals?.c1).toBe(42);
  });
  it("seskupení: skupiny tučně s mezisoučtem a odsazením", () => {
    const data: GridExportData = {
      columns: ["Partner", "Částka"],
      rows: [
        ["Partner: Alfa", 15],
        ["x", 10],
        ["y", 5],
      ],
      rowLevels: [0, 1, 1],
      columnMeta: [{ type: "text" }, { type: "number", total: "sum" }],
    };
    const section = buildGridPrintSection(data);
    expect(section.rowStyles?.[0]).toEqual({ bold: true });
    expect(section.rowStyles?.[1]).toEqual({ indent: 2 });
    expect(section.totals?.c1).toBe(15);
  });
  it("odhad šířek respektuje počet sloupců", () =>
    expect(gridPrintColumnWidths({ columns: ["a", "b"], rows: [] })).toHaveLength(2));
});
