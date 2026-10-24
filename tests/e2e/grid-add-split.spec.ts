/** Rozdělená akce gridu · hlavní plocha, nabídka a N v úzkém panelu. */
import { expect, test } from "@playwright/test";
for (const width of [360, 480]) {
  test(`Nový split při ${width} px a N spouští jen hlavní akci`, async ({ page }) => {
    await page.goto("/components/accounting-documents", { waitUntil: "networkidle" });
    const grid = page
      .locator('[data-slot="data-grid"]')
      .filter({ has: page.getByRole("button", { name: "Další možnosti – Nový", exact: true }) })
      .first();
    const main = grid.getByRole("button", { name: "Nový (N)", exact: true });
    await expect(main).toBeVisible();
    await grid.evaluate((node, size) => (node.style.width = `${size}px`), width);
    await expect(grid.locator('[data-slot="grid-toolbar"]')).toHaveAttribute(
      "data-overflow-level",
      /[0-3]/,
      { timeout: 45000 },
    );
    await main.click();
    await expect(page.getByText("Prázdný doklad", { exact: true })).toBeVisible({ timeout: 45000 });
    await expect(page.getByRole("menu")).toHaveCount(0);
    await main.focus();
    await page.evaluate(() => {
      const state = { clicks: 0 };
      Reflect.set(window, "splitPrimaryProbe", state);
      document
        .querySelector('[data-slot="data-grid"] [data-toolbar-add]')
        ?.addEventListener("click", () => state.clicks++);
    });
    await page.keyboard.press("n");
    expect(await page.evaluate(() => Reflect.get(window, "splitPrimaryProbe").clicks)).toBe(1);
    await expect(page.getByRole("menu")).toHaveCount(0);
    await grid.getByRole("button", { name: "Další možnosti – Nový", exact: true }).click();
    await expect(page.getByRole("menuitem", { name: "Prázdný doklad", exact: true })).toBeVisible();
    await page.keyboard.press("Escape");
    await grid
      .locator('[data-slot="grid-toolbar"]')
      .screenshot({ path: `/tmp/browser/d139/split-${width}.png` });
  });
}
