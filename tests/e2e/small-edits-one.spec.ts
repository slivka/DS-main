import { expect, test, type Page } from "@playwright/test";

// Drobné opravy 1: období v horní liště se nezkracuje, tečka neuložených změn sedí na štítku,
// tužka účtu stojí hned za textem.
const ZOOMS = [0.7, 1, 2];

async function setRootZoom(page: Page, zoom: number) {
  await page.evaluate((z) => {
    document.documentElement.style.fontSize = `${16 * z}px`;
    window.dispatchEvent(new Event("app:zoom-change"));
  }, zoom);
  // Počkej, až se rozvržení ustálí (dva snímky po sobě beze změny výšky dokumentu).
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __lastH?: number };
      const h = document.documentElement.scrollHeight;
      const stable = w.__lastH === h;
      w.__lastH = h;
      return stable;
    },
    undefined,
    { polling: 100 },
  );
}

test("název období je celý při zoomu min / 100 % / max", async ({ page }) => {
  await page.goto("/components/navigation", { waitUntil: "networkidle" });
  const values = page.locator('[data-context-switcher="period"] [data-slot="context-pill-value"]');
  await expect(values.first()).toBeVisible();
  for (const zoom of ZOOMS) {
    await setRootZoom(page, zoom);
    const count = await values.count();
    for (let index = 0; index < count; index += 1) {
      const value = values.nth(index);
      if (!(await value.isVisible())) continue;
      const fits = await value.evaluate((node) => {
        const pill = node.closest("[data-context-switcher]") as HTMLElement;
        const rect = node.getBoundingClientRect();
        const box = pill.getBoundingClientRect();
        const text = node.closest('[data-slot="context-pill-text"]') as HTMLElement;
        return (
          node.scrollWidth <= Math.ceil(rect.width) + 1 &&
          rect.right <= box.right + 1 &&
          text.scrollWidth <= text.clientWidth + 1
        );
      });
      expect(fits, `období ${index} při zoomu ${zoom}`).toBe(true);
    }
  }
});

test("tečka neuložených změn má střed štítku ±1 px při zoomu min / max", async ({ page }) => {
  await page.goto("/components/navigation", { waitUntil: "networkidle" });
  const demo = page.getByTestId("page-header-dirty-demo");
  await demo.scrollIntoViewIfNeeded();
  for (const zoom of [0.7, 2]) {
    await setRootZoom(page, zoom);
    // Tečka i štítek ze stejného nadpisu (ten, který štítek má).
    const scope = demo
      .locator(".page-title-line")
      .filter({ has: page.locator('[data-slot="page-title-dirty"]') })
      .filter({ has: page.locator(".page-title-badge:not([data-slot=page-title-dirty])") })
      .first();
    await scope.scrollIntoViewIfNeeded();
    const dot = scope.locator('[data-slot="page-title-dirty"]').first();
    const badge = scope
      .locator(".page-title-badge-slot:not([data-slot=page-title-dirty-slot]) .page-title-badge")
      .first();
    await expect(dot).toBeVisible();
    const dotBox = await dot.boundingBox();
    const badgeBox = await badge.boundingBox();
    if (!dotBox || !badgeBox) throw new Error("Chybí tečka nebo štítek");
    const delta = Math.abs(dotBox.y + dotBox.height / 2 - (badgeBox.y + badgeBox.height / 2));
    expect(delta, `zoom ${zoom}`).toBeLessThanOrEqual(1);
  }
});

test("tužka Změnit účet stojí hned za textem účtu", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const text = page.locator('[data-slot="document-identity-account-text"]').first();
  await text.scrollIntoViewIfNeeded();
  const pencil = text
    .locator(
      "xpath=ancestor::span[contains(concat(' ',normalize-space(@class),' '),' document-identity-account ')][1]",
    )
    .locator(".document-identity-pencil-slot");
  const textBox = await text.boundingBox();
  const pencilBox = await pencil.boundingBox();
  if (!textBox || !pencilBox) throw new Error("Chybí účet nebo tužka");
  expect(pencilBox.x - (textBox.x + textBox.width)).toBeLessThanOrEqual(12);
});
