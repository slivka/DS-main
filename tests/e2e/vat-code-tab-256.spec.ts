import { expect, test } from "@playwright/test";

test("Tab z Popisu na Kód DPH, Enter vybere a přejde na Částku; Shift+Tab zpět", async ({ page }) => {
  await page.goto("/components/accounting-lines", { waitUntil: "networkidle" });
  // Od rozdělení ukázek (2.109.0) jsou na stránce dva editory s řádkem fv1; měříme první.
  const amount = page.locator('[data-cell-key="fv1:amount"]').first();
  const description = page.locator('[data-cell-key="fv1:text"]').first();
  const vatCode = page.locator('[data-cell-key="fv1:vatCodeId"]').first();
  // Čekat na hydrataci (spolehlivý signál), ne opakovat Tab + psaní: opakování při pomalém
  // otevření výběru samo zavíralo editor a nikdy nedoběhlo (Firefox v GitHubu, 2.113.0).
  // Hydratace je stav, ne časový limit: čeká se na signál stránky v rámci limitu testu.
  await page.waitForFunction(
    () =>
      document.querySelector<HTMLElement>('[data-testid="accounting-forms-nav"]')?.dataset[
        "ready"
      ] === "true",
  );
  await page.waitForFunction(() => {
    const cell = document.querySelector('[data-cell-key="fv1:vatCodeId"]');
    return Boolean(cell && Object.keys(cell).some((key) => key.startsWith("__react")));
  });
  await description.scrollIntoViewIfNeeded();
  await description.focus();
  await page.keyboard.press("Tab");
  await expect(vatCode).toBeFocused();
  await page.keyboard.type("2");
  await expect(page.locator("[cmdk-input]")).toBeFocused();
  await page.keyboard.type("1V");
  await expect(page.locator("[cmdk-item]").first()).toContainText("21V");
  await page.keyboard.press("Enter");
  await expect(vatCode).toContainText("21V");
  await expect(amount).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(vatCode).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(description).toBeFocused();
});
