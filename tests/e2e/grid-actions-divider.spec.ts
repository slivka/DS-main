/** Ukotvený sloupec Akce má viditelnou svislou čáru v záhlaví, těle i patičce i po rolování doprava. */
import { expect, test, type Locator, type Page } from "@playwright/test";

async function stableBox(cell: Locator) {
  await cell.scrollIntoViewIfNeeded();
  let previous = "";
  await expect
    .poll(async () => {
      const box = await cell.boundingBox();
      const current = JSON.stringify(box);
      const stable = box !== null && current === previous;
      previous = current;
      return stable;
    })
    .toBe(true);
  return cell.boundingBox();
}

async function checkDivider(
  page: Page,
  zoom: number,
  scope = '.zoom-grid table:has([data-slot="grid-actions"])',
) {
  await page.evaluate((z) => {
    document.documentElement.style.fontSize = `${16 * z}px`;
    window.dispatchEvent(new Event("app:zoom-change"));
  }, zoom);
  await page.waitForTimeout(300);
  const table = page.locator(scope).first();
  await expect(table).toBeVisible();
  await table.scrollIntoViewIfNeeded();
  await table.evaluate((t) => {
    const scroller = t.closest(".zoom-grid") as HTMLElement | null;
    if (scroller) scroller.scrollLeft = scroller.scrollWidth;
  });
  for (const part of ["thead", "tbody", "tfoot"]) {
    const cell = table.locator(`${part} tr > :is(th, td):last-child`).first();
    if ((await cell.count()) === 0) continue;
    await stableBox(cell);
    // Computed style není závislý na ořezu viewportu, překrytí sticky
    // záhlavím ani antialiasingu subpixelové hrany při zoomu 0,7.
    const style = await cell.evaluate((el) => {
      const css = getComputedStyle(el);
      return { shadow: css.boxShadow };
    });
    const inset = style.shadow.split(/,(?![^()]*\))/).find((shadow) => shadow.includes("inset"));
    expect(inset, `${part} @ ${zoom}`).toBeDefined();
    expect(inset, `${part} @ ${zoom}`).toMatch(/1px 0px 0px 0px/);
    expect(inset, `${part} @ ${zoom}`).not.toContain("rgba(0, 0, 0, 0)");
  }
}

test("čára u sloupce Akce zůstane při rolování a zoomu", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 1400 });
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  for (const zoom of [0.7, 1, 1.5]) await checkDivider(page, zoom);
});

test("čára u sloupce Akce v editoru řádků dokladu", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto("/components/accounting-lines", { waitUntil: "networkidle" });
  for (const zoom of [0.7, 1, 1.5]) await checkDivider(page, zoom, ".journal-lines-grid table");
});
