import { expect, test } from "@playwright/test";

test("Tab z Částky na Kód DPH a psaní otevře výběr", async ({ page }) => {
  await page.goto("/components/accounting-lines", { waitUntil: "networkidle" });
  // Stránka je velká: psaní do buňky funguje až po hydrataci, proto čekáme na odezvu editoru.
  // Od rozdělení ukázek (2.109.0) jsou na stránce dva editory s řádkem fv1; měříme první.
  const amount = page.locator('[data-cell-key="fv1:amount"]').first();
  const vatCode = page.locator('[data-cell-key="fv1:vatCodeId"]').first();
  await amount.scrollIntoViewIfNeeded();
  await expect(async () => {
    await amount.focus();
    await page.keyboard.press("Tab");
    await expect(vatCode).toBeFocused();
    await page.keyboard.type("2");
    await expect(page.locator("[cmdk-input]")).toBeFocused({ timeout: 1000 });
  }).toPass({ timeout: 30_000 });
  await page.keyboard.type("1V");
  await expect(page.locator("[cmdk-item]").first()).toContainText("21V");
  await page.keyboard.press("Enter");
  await expect(vatCode).toContainText("21V");
});
