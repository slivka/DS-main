import { expect, test } from "@playwright/test";

test("ColumnPicker formát, výběr, klávesnice, tmavý vzhled a zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto("/components/grid");
  const demo = page.getByTestId("column-format-showcase");
  await expect(demo).toHaveAttribute("data-ready", "true");
  const cell = demo.locator("tbody tr").nth(1).locator("td").last();
  const head = demo.locator("thead th").last();
  await expect
    .poll(() => cell.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toContain("0.965");
  await demo.getByRole("button", { name: "Sloupce", exact: true }).click();
  await page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true }).click();
  const editor = page.locator('[data-slot="column-format-editor"]');
  await editor.getByRole("checkbox", { name: "Tučně" }).uncheck();
  await expect.poll(() => cell.evaluate((el) => getComputedStyle(el).fontWeight)).toBe("400");
  await editor.getByRole("checkbox", { name: "Tučně" }).check();
  const blue = editor.getByRole("button", { name: "Modrá světlá", exact: true });
  await blue.focus();
  await page.keyboard.press("ArrowRight");
  await expect(editor.getByRole("button", { name: "Tyrkysová světlá", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    editor.getByRole("button", { name: "Tyrkysová světlá", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await editor.getByRole("button", { name: "Modrá sytá", exact: true }).focus();
  await page.keyboard.press("Space");
  await expect
    .poll(() => cell.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toContain("0.44");
  await page.keyboard.press("Escape");
  await expect(editor).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true })).toHaveCount(
    0,
  );
  await expect
    .poll(() => head.evaluate((el) => getComputedStyle(el, "::before").height))
    .toBe("2px");
  await cell.click();
  await expect(demo.locator("tbody tr").nth(1)).toHaveAttribute("data-state", "selected");
  await expect
    .poll(() => cell.evaluate((el) => getComputedStyle(el).backgroundImage))
    .not.toBe("none");
  const negative = cell.locator("span").first();
  expect(await negative.evaluate((el) => getComputedStyle(el).color)).toBe(
    await cell.evaluate((el) => getComputedStyle(el).color),
  );
  const error = demo.locator("tbody tr").nth(2).locator("td").last();
  await expect
    .poll(() => error.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toContain("0.95");
  for (const dark of [false, true])
    for (const zoom of [0.7, 1.5]) {
      await page.evaluate(
        ({ dark, zoom }) => {
          document.documentElement.classList.toggle("dark", dark);
          document.documentElement.style.fontSize = `${16 * zoom}px`;
        },
        { dark, zoom },
      );
      await expect
        .poll(() => head.evaluate((el) => getComputedStyle(el, "::before").height))
        .toBe("2px");
      await expect
        .poll(() => cell.evaluate((el) => getComputedStyle(el).backgroundColor))
        .toContain(dark ? "0.78" : "0.44");
      await demo.screenshot({
        path: `/tmp/browser/column-format/${dark ? "dark" : "light"}-${zoom}.png`,
      });
    }
  await demo.getByRole("button", { name: "Sloupce", exact: true }).click();
  await page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true }).click();
  await page
    .locator('[data-slot="column-format-editor"]')
    .screenshot({ path: "/tmp/browser/column-format/final-editor.png" });
  await page.getByRole("button", { name: "Zrušit formát všech sloupců" }).click();
  await expect(page.getByRole("button", { name: "Zrušit formát všech sloupců" })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-slot="column-format-editor"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true }).focus();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true })).toHaveCount(
    0,
  );
  await page.setViewportSize({ width: 390, height: 1800 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "32px";
  });
  const columnsButton = demo.getByRole("button", { name: "Sloupce", exact: true });
  if (!(await columnsButton.isVisible())) {
    await demo.locator(".grid-toolbar-overflow-menu").click();
  }
  await page
    .getByRole("button", { name: "Sloupce", exact: true })
    .filter({ visible: true })
    .click();
  await page.getByRole("button", { name: "Formát sloupce Zbývá", exact: true }).click();
  const narrowEditor = page.locator('[data-slot="column-format-editor"]');
  await expect(narrowEditor).toBeVisible();
  const box = await narrowEditor.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(390);
  await narrowEditor.screenshot({ path: "/tmp/browser/column-format/narrow-large-font.png" });
});
