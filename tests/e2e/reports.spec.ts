import { expect, test } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

test.describe("Výkazy 2.8.0", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/accounting-forms");
    await page.waitForFunction(() =>
      Object.keys(document.querySelector('[data-slot="tree-grid"] button') ?? {}).some((key) => key.startsWith("__react")),
    );
  });

  test("TreeGrid – úrovně rozbalení a zvýraznění", async ({ page }) => {
    const grid = page.locator('[data-slot="tree-grid"]').first();
    await expect(grid.locator('[data-row-id="g22"]')).toBeVisible();
    await expect(grid.locator('[data-row-id="s221"]')).toHaveCount(0);
    await grid.getByRole("button", { name: "Rozbalit vše" }).click();
    await page.getByRole("menuitem", { name: "Vše" }).click();
    await expect(grid.locator('[data-row-id="a221001"]')).toBeVisible();
    await grid.getByRole("button", { name: "Rozbalit vše" }).click();
    await page.getByRole("menuitem", { name: "Třídy" }).click();
    await expect(grid.locator('[data-row-id="g22"]')).toHaveCount(0);
    await grid.locator('[data-row-id="t2"]').getByRole("button", { name: "Rozbalit" }).click();
    await expect(grid.locator('[data-row-id="t2"]')).toHaveAttribute("data-highlighted", "true");
  });

  test("TreeGrid – export se souhrnem pod dětmi a SUBTOTAL", async ({ page }) => {
    const grid = page.locator('[data-slot="tree-grid"]').first();
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      (async () => {
        await grid.getByRole("button", { name: "Stáhnout" }).click();
        await page.getByRole("button", { name: "Stáhnout Excel" }).click();
      })(),
    ]);
    const zip = await JSZip.loadAsync(await readFile((await download.path())!));
    const sheet = await zip.file("xl/worksheets/sheet1.xml")!.async("text");
    expect(sheet).toContain('summaryBelow="1"');
    expect(sheet).toMatch(/<f>SUBTOTAL\(9,[A-Z]+\d+:[A-Z]+\d+\)<\/f>/);
    expect(sheet.indexOf("<outlinePr")).toBeLessThan(sheet.indexOf("<pageSetUpPr"));
  });

  test("BarBreakdownChart a FilterChips", async ({ page }) => {
    const chips = page.locator('[data-slot="filter-chips"]').last();
    await expect(chips.locator('[data-chip-id="group"]')).toBeVisible();
    await page.locator('[data-bar-id="51"]').click();
    await expect(chips.locator('[data-chip-id="group"]')).toHaveCount(0);
    await page.locator('[data-bar-id="52"]').click();
    await expect(chips.locator('[data-chip-id="group"]')).toContainText("52");
    await chips.getByRole("button", { name: "Zrušit vše" }).click();
    await expect(chips.locator('[data-chip-id="active"]')).toHaveCount(0);
  });
});
