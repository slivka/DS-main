import { expect, test } from "@playwright/test";
import ExcelJS from "exceljs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { spawnSync } from "node:child_process";

const EXCEL_ERRORS = ["#REF!", "#DIV/0!", "#VALUE!", "#N/A", "#NAME?", "#NUM!", "#NULL!"];
const REPAIR_WARNINGS = /repair|recovered|corrupt|poškozen|opraven|obnoven/i;

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

  const numberCells = sheet.getColumn(6).values.slice(5).filter((value) => typeof value === "number");
  expect(numberCells.length).toBeGreaterThan(0);
  expect(sheet.getCell("F5").numFmt).toBe("#,##0.00;[Red]-#,##0.00");
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
    await inspectWorkbook(filePath);

    const openedPath = verifyLibreOfficeOpen(filePath, convertedDir);
    await inspectWorkbook(openedPath);
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
});