/** Ukotvený sloupec Akce má viditelnou svislou čáru v záhlaví, těle i patičce i po rolování doprava. */
import { expect, test, type Page } from "@playwright/test";

async function checkDivider(page: Page, zoom: number) {
  await page.evaluate((z) => {
    document.documentElement.style.fontSize = `${16 * z}px`;
    window.dispatchEvent(new Event("app:zoom-change"));
  }, zoom);
  await page.waitForTimeout(300);
  const table = page.locator('.zoom-grid table:has([data-slot="grid-actions"])').first();
  await expect(table).toBeVisible();
  await table.scrollIntoViewIfNeeded();
  await table.evaluate((t) => {
    const scroller = t.closest(".zoom-grid") as HTMLElement | null;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  });
  for (const part of ["thead", "tbody", "tfoot"]) {
    const cell = table.locator(`${part} tr > :is(th, td):last-child`).first();
    if ((await cell.count()) === 0) continue;
    const shadow = await cell.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(shadow, `${part} @ ${zoom}`).toContain("inset");
    expect(shadow).toMatch(/1px 0px 0px/);
    // Pixel na levé hraně buňky se liší od pixelu uvnitř buňky (čára je vidět).
    const shot = await cell.screenshot();
    const { PNG } = await import("pngjs").catch(() => ({ PNG: null }));
    if (!PNG) continue;
    const img = PNG.sync.read(shot);
    const y = Math.floor(img.height / 2);
    const px = (x: number) => img.data.slice((y * img.width + x) * 4, (y * img.width + x) * 4 + 3);
    const edge = px(0);
    const inner = px(Math.min(4, img.width - 1));
    const diff = Math.abs(edge[0] - inner[0]) + Math.abs(edge[1] - inner[1]) + Math.abs(edge[2] - inner[2]);
    expect(diff, `${part} @ ${zoom}`).toBeGreaterThan(3);
  }
}

test("čára u sloupce Akce zůstane při rolování a zoomu", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1400 });
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  for (const zoom of [0.7, 1, 1.5]) await checkDivider(page, zoom);
});
