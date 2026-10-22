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
    const box = (await cell.boundingBox())!;
    const shot = (
      await page.screenshot({
        clip: { x: Math.floor(box.x) - 2, y: box.y + box.height / 2 - 1, width: 10, height: 2 },
      })
    ).toString("base64");
    const diff = await page.evaluate(async (b64) => {
      const img = await createImageBitmap(await (await fetch(`data:image/png;base64,${b64}`)).blob());
      const c = new OffscreenCanvas(img.width, img.height);
      const g = c.getContext("2d")!;
      g.drawImage(img, 0, 0);
      const row = g.getImageData(0, 0, img.width, 1).data;
      const lum = (x: number) => row[x * 4] + row[x * 4 + 1] + row[x * 4 + 2];
      const inner = lum(img.width - 1);
      let max = 0;
      for (let x = 0; x < img.width / 2; x++) max = Math.max(max, inner - lum(x));
      return max;
    }, shot);
    expect(diff, `${part} @ ${zoom}`).toBeGreaterThan(3);
  }
}

test("čára u sloupce Akce zůstane při rolování a zoomu", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1400 });
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  for (const zoom of [0.7, 1, 1.5]) await checkDivider(page, zoom);
});
