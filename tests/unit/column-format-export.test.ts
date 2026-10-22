/** Export formátovaných sloupců zachová tabulku a součtové vzorce. */
import { expect, it } from "bun:test";
import { buildExcelWorkbook, COLUMN_TONE_ARGB } from "../../src/lib/excel-export";
import { buildGridPrintSection } from "../../src/components/ds/grid/grid-print";
it("Excel zachová tučně, výplň, text strong a vzorec součtu", async () => {
  const workbook = await buildExcelWorkbook(
    {
      columns: ["Doklad", "Celkem", "Zbývá"],
      rows: [["FV-1", 12540, -2420]],
      columnMeta: [
        { type: "text", total: "none" },
        { type: "number", style: { bold: true, tone: "blue-soft" } },
        { type: "number", style: { tone: "purple-strong" } },
      ],
    },
    { title: "Faktury" },
  );
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("List chybí");
  expect(sheet.getCell("B5").font.bold).toBe(true);
  expect(sheet.getCell("B5").fill).toEqual({
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: COLUMN_TONE_ARGB["blue-soft"].fill },
  });
  expect(sheet.getCell("C5").font.color?.argb).toBe(COLUMN_TONE_ARGB["purple-strong"].font);
  expect(sheet.getCell("C5").numFmt).not.toContain("[Red]");
  expect(sheet.getCell("B5").numFmt).toContain("[Red]");
  expect(sheet.getCell("B4").fill).not.toEqual(sheet.getCell("B5").fill);
  expect(sheet.getCell("B6").value).toHaveProperty("formula");
  expect(sheet.getColumn(2).width).toBeGreaterThanOrEqual(8);
});
it("tisková tabulka přenese formát do sloupce bez změny hodnot", () => {
  const section = buildGridPrintSection({
    columns: ["Částka"],
    rows: [[1234]],
    columnMeta: [{ type: "number", total: "none", style: { bold: true, tone: "orange-strong" } }],
  });
  expect(section.columns[0]?.style).toEqual({ bold: true, tone: "orange-strong" });
  expect(section.rows[0]?.c0).toBe(1234);
});
