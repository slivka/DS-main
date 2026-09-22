import { expect, test } from "@playwright/test";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const EXCEL_ERRORS = ["#REF!", "#DIV/0!", "#VALUE!", "#N/A", "#NAME?", "#NUM!", "#NULL!"];
const REPAIR_WARNINGS = /repair|recovered|corrupt|poškozen|opraven|obnoven/i;

const decodeXml = (value: string) => value
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/&amp;/g, "&");

const rowFromRef = (ref: string) => Number(/\d+/.exec(ref)?.[0] ?? 0);

async function inspectOpenXml(filePath: string) {
  const zip = await JSZip.loadAsync(await readFile(filePath));
  const text = async (path: string) => {
    const entry = zip.file(path);
    expect(entry, `XLSX musí obsahovat ${path}`).not.toBeNull();
    return entry ? entry.async("text") : "";
  };
  const sheetXml = await text("xl/worksheets/sheet1.xml");
  const tableXml = await text("xl/tables/table1.xml");
  const sharedStringsEntry = zip.file("xl/sharedStrings.xml");
  const sharedStringsXml = sharedStringsEntry ? await sharedStringsEntry.async("text") : "";
  const sharedStrings = [...sharedStringsXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((match) =>
    decodeXml([...match[1].matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)].map((part) => part[1]).join("")),
  );
  expect(sharedStrings, "Sdílené řetězce nesmí obsahovat prázdnou hodnotu").not.toContain("");

  const tableRef = /\bref="([A-Z]+\d+:[A-Z]+\d+)"/.exec(tableXml)?.[1];
  const autoFilterRef = /<autoFilter\s+ref="([A-Z]+\d+:[A-Z]+\d+)"/.exec(tableXml)?.[1];
  expect(tableRef, "Tabulka musí mít platný rozsah").toBeTruthy();
  const [tableStart = "", tableEnd = ""] = tableRef?.split(":") ?? [];
  const tableEndColumn = /[A-Z]+/.exec(tableEnd)?.[0] ?? "";
  const expectedFilterRef = `${tableStart}:${tableEndColumn}${rowFromRef(tableEnd) - 1}`;
  expect(autoFilterRef, "Filtr tabulky musí odpovídat datové části bez součtového řádku").toBe(expectedFilterRef);
  expect(/\bname="[A-Za-z][A-Za-z0-9_]*"/.test(tableXml), "Název tabulky musí být bezpečný pro Excel").toBe(true);
  expect(tableXml, "Sloupce bez součtu nesmí zapisovat totalsRowFunction=none").not.toContain('totalsRowFunction="none"');

  const tableColumns = [...tableXml.matchAll(/<tableColumn\b[^>]*\bname="([^"]*)"/g)].map((match) => decodeXml(match[1]));
  expect(tableColumns.length).toBeGreaterThan(0);
  for (const name of tableColumns) {
    expect(name.length).toBeLessThanOrEqual(255);
    expect(name).not.toMatch(/[\[\]#']/);
  }

  const headerRowXml = /<row\b[^>]*\br="4"[^>]*>([\s\S]*?)<\/row>/.exec(sheetXml)?.[1] ?? "";
  const headerValues = [...headerRowXml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g)].map((match) => {
    const type = /\bt="([^"]+)"/.exec(match[1])?.[1];
    const raw = /<v>([\s\S]*?)<\/v>/.exec(match[2])?.[1] ?? "";
    return type === "s" ? sharedStrings[Number(raw)] : decodeXml(raw);
  });
  expect(headerValues, "Hlavička listu musí přesně odpovídat názvům sloupců tabulky").toEqual(tableColumns);

  const tableEndRow = rowFromRef(tableRef?.split(":")[1] ?? "");
  const merges = [...sheetXml.matchAll(/<mergeCell\s+ref="([A-Z]+\d+):([A-Z]+\d+)"/g)].map((match) => ({
    start: rowFromRef(match[1]),
    end: rowFromRef(match[2]),
  }));
  expect(
    merges.filter((merge) => merge.end >= 4 && merge.start <= tableEndRow + 1),
    "Sloučení nesmí zasáhnout tabulku ani první řádek pod ní",
  ).toEqual([]);

  const rowTags = [...sheetXml.matchAll(/<row\b([^>]*)>/g)].map((match) => match[1]);
  const levels = rowTags.map((tag) => Number(/\boutlineLevel="(\d+)"/.exec(tag)?.[1] ?? 0));
  const maxLevel = Math.max(0, ...levels);
  const declaredLevel = Number(/<sheetFormatPr\b[^>]*\boutlineLevelRow="(\d+)"/.exec(sheetXml)?.[1] ?? 0);
  expect(declaredLevel, "Deklarovaná úroveň osnovy musí pokrýt řádky").toBeGreaterThanOrEqual(maxLevel);
  expect(
    rowTags.filter((tag) => /\bcollapsed="1"/.test(tag) && !/\bhidden="1"/.test(tag)),
    "Nesbalený viditelný řádek nesmí být označen collapsed",
  ).toEqual([]);

  const firstDateCell = /<c\b[^>]*\br="B5"[^>]*>([\s\S]*?)<\/c>/.exec(sheetXml)?.[1] ?? "";
  const dateSerial = Number(/<v>([^<]+)<\/v>/.exec(firstDateCell)?.[1]);
  expect(dateSerial, "Datum 01.01.2026 musí být uložené bez časového posunu").toBe(46023);
  expect(Number.isInteger(dateSerial), "Datum bez času musí být celé pořadové číslo Excelu").toBe(true);
}

async function inspectWorkbook(filePath: string) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await readFile(filePath));
  const sheet = workbook.worksheets[0];
  expect(sheet, "Sešit musí obsahovat list").toBeDefined();
  if (!sheet) return;

  const tables = sheet.model.tables ?? [];
  expect(tables, "List musí obsahovat skutečnou tabulku Excelu").toHaveLength(1);
  expect(tables[0]?.totalsRow).toBe(true);

  const formulas: string[] = [];
  const errors: string[] = [];
  sheet.eachRow((row) => {
    row.eachCell({ includeEmpty: false }, (cell) => {
      const value = cell.value;
      if (typeof value === "object" && value && "formula" in value) formulas.push(String(value.formula));
      if (typeof value === "string" && EXCEL_ERRORS.some((error) => value.includes(error))) errors.push(value);
    });
  });
  expect(formulas.some((formula) => /SUBTOTAL/i.test(formula)), "Součty musí zůstat jako vzorce").toBe(true);
  expect(errors, "Sešit nesmí obsahovat chybové hodnoty Excelu").toEqual([]);

  const headerRow = sheet.getRow(4);
  const headerIndex = (name: string) => {
    const index = headerRow.values.findIndex((value) => String(value).endsWith(name));
    expect(index, `Excel musí obsahovat sloupec ${name}`).toBeGreaterThan(0);
    return index;
  };
  const debitAccountNameColumn = headerIndex("MD účet");
  const debitAccountCell = sheet.getCell(5, debitAccountNameColumn);
  expect(debitAccountCell.value).toBe("321.100 - Závazky");
  expect(debitAccountCell.type, "Účet musí být v Excelu uložen jako text").toBe(ExcelJS.ValueType.String);

  const dateColumn = headerIndex("Datum");
  const dateCell = sheet.getCell(5, dateColumn);
  expect(dateCell.value).toEqual(new Date(Date.UTC(2026, 0, 1)));
  expect(dateCell.numFmt).toContain("dd");

  const amountColumn = headerIndex("Částka");
  const numberCells = sheet.getColumn(amountColumn).values.slice(5).filter((value) => typeof value === "number");
  expect(numberCells.length).toBeGreaterThan(0);
  expect(sheet.getCell(5, amountColumn).numFmt.toLocaleLowerCase("en")).toBe("#,##0.00;[red]-#,##0.00");
  const largestValueLength = Math.max(
    ...numberCells.map((value) =>
      Number(value).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).length,
    ),
  );
  const total = numberCells.reduce((sum, value) => sum + Number(value), 0);
  const totalLength = total.toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).length;
  expect(totalLength, "Součet ve vzoru musí být širší než jednotlivé hodnoty").toBeGreaterThan(largestValueLength);
  expect(sheet.getColumn(amountColumn).width ?? 0, "Sloupec musí být dost široký pro zobrazený součet").toBeGreaterThanOrEqual(
    totalLength + 2,
  );
}

function verifyLibreOfficeOpen(filePath: string, outputDir: string) {
  const result = spawnSync(
    "libreoffice",
    ["--headless", "--nologo", "--norestore", "--convert-to", "xlsx", "--outdir", outputDir, filePath],
    {
      encoding: "utf8",
      env: { ...process.env, SAL_USE_VCLPLUGIN: "svp" },
      timeout: 60_000,
    },
  );
  const messages = `${result.stdout}\n${result.stderr}`;
  expect(result.error, "LibreOffice musí soubor otevřít").toBeUndefined();
  expect(result.status, messages).toBe(0);
  expect(messages, "LibreOffice nesmí hlásit opravu nebo poškození souboru").not.toMatch(REPAIR_WARNINGS);
  return join(outputDir, basename(filePath));
}

test("vzorový Excel se stáhne a otevře bez varování", async ({ page }, testInfo) => {
  const workDir = await mkdtemp(join(tmpdir(), `slivka-excel-${testInfo.project.name}-`));
  const convertedDir = join(workDir, "opened");
  await import("node:fs/promises").then(({ mkdir }) => mkdir(convertedDir));

  try {
    await page.goto("/components/excel-export", { waitUntil: "networkidle" });
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Stáhnout vzorový export" }).click(),
    ]);
    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^vzorovy-ucetni-export_\d{4}-\d{2}-\d{2}\.xlsx$/);

    const filePath = join(workDir, filename);
    await download.saveAs(filePath);
    expect((await readFile(filePath)).byteLength).toBeGreaterThan(10_000);
    await inspectOpenXml(filePath);
    await inspectWorkbook(filePath);

    const openedPath = verifyLibreOfficeOpen(filePath, convertedDir);
    await inspectOpenXml(openedPath);
    await inspectWorkbook(openedPath);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});