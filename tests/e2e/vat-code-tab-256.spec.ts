import { expect, test } from "@playwright/test";

test("Tab z Částky na Kód DPH a psaní otevře výběr", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  // Stránka je velká: psaní do buňky funguje až po hydrataci, proto čekáme na odezvu editoru.
  const amount = page.locator('[data-cell-key="fv1:amount"]');
  await amount.scrollIntoViewIfNeeded();
  await expect(async () => {
    await amount.focus();
    await page.keyboard.press("Tab");
    await expect(page.locator('[data-cell-key="fv1:vatCodeId"]')).toBeFocused();
    await page.keyboard.type("2");
    await expect(page.locator("[cmdk-input]")).toBeFocused({ timeout: 1000 });
  }).toPass({ timeout: 30_000 });
  await page.keyboard.type("1V");
  await expect(page.locator("[cmdk-item]").first()).toContainText("21V");
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-cell-key="fv1:vatCodeId"]')).toContainText("21V");
});
