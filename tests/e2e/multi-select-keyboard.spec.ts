import { expect, test } from "@playwright/test";
test("filtr firmy: hledání, výběr, společné akce a Escape pouze klávesnicí", async ({ page }) => {
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  const grid = page.getByTestId("company-filter-showcase");
  const trigger = grid.getByRole("combobox", { name: "Firma" });
  await expect(trigger).toBeVisible();
  await page.waitForFunction(() => {
    const button = document.querySelector(
      '[data-testid="company-filter-showcase"] button[role="combobox"]',
    );
    return button && Object.keys(button).some((key) => key.startsWith("__reactProps"));
  });
  // Tabem dosáhnout pole, nikoli programovým fokusem nebo myší.
  for (let i = 0; i < 100 && !(await trigger.evaluate((el) => el === document.activeElement)); i++)
    await page.keyboard.press("Tab");
  await expect(trigger).toBeFocused();
  await page.keyboard.type("Beta");
  const input = grid.locator("[cmdk-input]");
  await expect(input).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option", { name: "Beta Servis a.s." })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "Beta Servis a.s." })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(grid.getByRole("cell", { name: "FV-001", exact: true })).toHaveCount(0);
  await expect(grid.getByRole("cell", { name: "FV-002", exact: true })).toBeVisible();
  await page.keyboard.press("Space");
  await expect(page.getByRole("option", { name: "Beta Servis a.s." })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Vybrat vše", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "Beta Servis a.s." })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(grid.getByRole("cell", { name: "FV-001", exact: true })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Vymazat", exact: true })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("option", { name: "Beta Servis a.s." })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await page.keyboard.press("Escape");
  await expect(input).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
