import { expect, test } from "@playwright/test";

test("ID: psaní + Enter vybere kategorii na MD i DAL", async ({ page }) => {
  await page.goto("/components/accounting-journal", { waitUntil: "networkidle" });
  const demo = page.getByTestId("journal-categories-demo");
  await page.waitForFunction(() => {
    const node = document.querySelector('[data-cell-key="category-id:debitCategoryId"]');
    return !!node && Object.keys(node).some((key) => key.startsWith("__react"));
  });
  for (const [column, query, expected] of [
    ["debitCategoryId", "Mater", "Materiál"],
    ["creditCategoryId", "Prodej", "PR – Prodej"],
  ]) {
    const cell = demo.locator(`[data-cell-key="category-id:${column}"]`);
    await cell.scrollIntoViewIfNeeded();
    await cell.focus();
    await page.keyboard.type(query[0] ?? "");
    const input = page.locator("[cmdk-input]");
    await expect(input).toBeFocused();
    await page.keyboard.type(query.slice(1));
    await expect(page.locator('[cmdk-item][aria-selected="true"]')).toContainText(expected);
    await page.keyboard.press("Enter");
    await expect(cell).toContainText(expected);
  }
  await expect(demo.locator('[data-cell-key="category-id:debitCategoryId"]')).toContainText(
    "Materiál",
  );
});
