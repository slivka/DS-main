/** Jednotná výška polí 2.107.0 · vlastní měření v prohlížeči · nesmí číst zdroj. */
import { expect, test, type Page } from "@playwright/test";

/** Rozdíl výšek ovládání v každém řádku ukázky a kontrola „nic pod prvkem“. */
async function measure(page: Page) {
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll<HTMLElement>('[data-slot="field-status-row"]')];
    return rows.map((row) => {
      const controls = [
        ...row.querySelectorAll<HTMLElement>(".ds-field-control > :first-child"),
        ...row.querySelectorAll<HTMLElement>('[data-slot="checkbox-field"] > div'),
        ...row.querySelectorAll<HTMLElement>('[data-slot="button"][data-size="control"]'),
      ];
      const heights = controls.map((node) => node.getBoundingClientRect().height);
      const below = [...row.querySelectorAll<HTMLElement>('[data-slot="field"]')].map((field) => {
        const control = field.querySelector<HTMLElement>(".ds-field-control");
        if (!control) return 0;
        return field.getBoundingClientRect().bottom - control.getBoundingClientRect().bottom;
      });
      return {
        state: row.dataset.state,
        spread: Math.max(...heights) - Math.min(...heights),
        below: Math.max(...below),
        count: heights.length,
      };
    });
  });
}

for (const width of [1280, 560]) {
  for (const theme of ["light", "dark"] as const) {
    test(`Výška polí ${width}px, ${theme}, zoom aplikace 70–200 %, mřížky 60–140 %`, async ({
      page,
    }) => {
      test.setTimeout(240_000);
      await page.setViewportSize({ width, height: 1800 });
      await page.goto("/components/forms", { waitUntil: "networkidle" });
      const showcase = page.locator('[data-slot="field-status-showcase"]');
      await expect(showcase).toBeVisible({ timeout: 45_000 });
      await page.evaluate((dark) => {
        document.documentElement.classList.toggle("dark", dark);
      }, theme === "dark");
      for (const appZoom of [0.7, 0.9, 1, 1.25, 2]) {
        await page.evaluate(async (value) => {
          const path = "/src/lib/app-zoom.ts";
          const module = await import(/* @vite-ignore */ path);
          module.setAppZoom(value);
        }, appZoom);
        for (const gridZoom of ["60 %", "100 %", "140 %"]) {
          await showcase.getByRole("radio", { name: gridZoom, exact: true }).click();
          const rows = await measure(page);
          expect(rows.length).toBe(8);
          for (const row of rows) {
            expect(row.count, `${row.state} počet`).toBeGreaterThan(6);
            expect(row.spread, `${row.state} app ${appZoom} grid ${gridZoom}`).toBeLessThan(1);
            expect(row.below, `${row.state} pod polem`).toBeLessThan(1);
          }
        }
      }
    });
  }
}

test("Detail řádku: výška stejná s chybou i bez", async ({ page }) => {
  await page.goto("/components/forms", { waitUntil: "networkidle" });
  const grid = page.locator('[data-slot="field-status-grid"]');
  await expect(grid).toBeVisible({ timeout: 45_000 });
  const heights = await grid
    .locator('[data-slot="field-status-row"]')
    .evaluateAll((rows) => rows.map((row) => row.getBoundingClientRect().height));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
});
