import { expect, test } from "@playwright/test";

test("Tab z Částky na Kód DPH a psaní otevře výběr", async ({ page }) => {
  await page.goto("/components/accounting-forms");
  const amount = page.locator('[data-cell-key="fv1:amount"]');
  await amount.scrollIntoViewIfNeeded();
  await amount.focus();
  await page.keyboard.press("Tab");
  await expect(page.locator('[data-cell-key="fv1:vatCodeId"]')).toBeFocused();
  await page.keyboard.type("21V");
  await expect(page.locator("[cmdk-item]").first()).toContainText("21V");
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-cell-key="fv1:vatCodeId"]')).toContainText("21V");
});
