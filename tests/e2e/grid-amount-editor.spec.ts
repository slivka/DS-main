/** Skutečný peněžní editor v párování – záporná polovina a potvrzení do součtu. */
import { expect, test } from "@playwright/test";

test("−1,005 v párování se potvrdí jako −1,01", async ({ page }) => {
  await page.goto("/components/matching", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: "Párování", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "BV-2026-091" });
  await row.getByRole("checkbox").check();
  const input = page.getByRole("textbox", { name: "Párovat částkou BV-2026-091" });
  await input.click();
  await input.fill("-1,005");
  await input.press("Enter");
  await expect(input).toHaveValue("-1,01");
  await expect(page.getByText(/Páruje se -1,01/)).toBeVisible();
});
