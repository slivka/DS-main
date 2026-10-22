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
    const shot = (await cell.screenshot()).toString("base64");
    const diff = await page.evaluate(async (b64) => {
      const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(img.width, img.height);
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0);
      const y = Math.floor(img.height / 2);
      const e = g.getImageData(0, y, 1, 1).data;
      const i = g.getImageData(Math.min(4, img.width - 1), y, 1, 1).data;
      return Math.abs(e[0] - i[0]) + Math.abs(e[1] - i[1]) + Math.abs(e[2] - i[2]);
    }, shot);
    expect(diff, `${part} @ ${zoom}`).toBeGreaterThan(3);
  }
}

test("čára u sloupce Akce zůstane při rolování a zoomu", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1400 });
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  for (const zoom of [0.7, 1, 1.5]) await checkDivider(page, zoom);
});
