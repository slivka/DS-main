import { expect, test } from "@playwright/test";
test("DE: položka jménem, Enter beze změny, filtr knihy a proklik", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto("/components/tax-records");
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  const demo = page.getByTestId("tax-records-showcase");
  const lines = demo.getByTestId("tax-lines");
  const cell = lines.locator('[data-cell-key="line1:counterAccount"]');
  await cell.focus();
  await page.keyboard.type("Mater");
  await expect(page.getByRole("option", { name: "Materiál", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: /Technická pokladna/ })).toHaveCount(0);
  await page.keyboard.press("Enter");
  await expect(lines.getByTestId("tax-line-value")).toHaveText("501001");
  await cell.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await expect(lines.getByTestId("tax-line-value")).toHaveText("501001");
  const book = demo.getByTestId("tax-book");
  await book.getByRole("combobox", { name: "Položka", exact: true }).focus();
  await page.keyboard.type("Tržby");
  await expect(page.getByRole("option", { name: "Tržby za služby", exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(book.getByRole("button", { name: "PO2026001", exact: true })).toBeVisible();
  await expect(book.getByRole("button", { name: "BA2026001", exact: true })).toHaveCount(0);
  await book.getByRole("button", { name: "FV2026001", exact: true }).click();
  await expect(demo.getByTestId("tax-event")).toHaveText("fv1");
  await page.screenshot({ path: "/tmp/browser/tax-records-desktop.png" });
  await page.setViewportSize({ width: 480, height: 1800 });
  await expect(cell).toBeVisible();
  await page.screenshot({ path: "/tmp/browser/tax-records-mobile.png" });
});
