import { expect, test } from "@playwright/test";

// 2.122.0: regrese – vstup hledání se portálem vykresluje mimo [cmdk-root], takže Enter/Tab
// zvýrazněnou položku nevybral. Kořen nabídky se hledá přes aria-controls vstupu.
test.beforeEach(async ({ page }) => {
  await page.goto("/components/accounting-lines", { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      document.querySelector<HTMLElement>('[data-testid="accounting-forms-nav"]')?.dataset[
        "ready"
      ] === "true",
  );
  await page.waitForFunction(() => {
    const cell = document.querySelector('[data-cell-key="fv1:counterAccount"]');
    return Boolean(cell && Object.keys(cell).some((key) => key.startsWith("__react")));
  });
});

test("psaní kódu účtu do protiúčtu a Enter vybere zvýrazněnou položku", async ({ page }) => {
  const counter = page.locator('[data-cell-key="fv1:counterAccount"]').first();
  await expect(counter).toContainText("602.001");
  await counter.scrollIntoViewIfNeeded();
  await counter.dblclick();
  await expect(page.locator("[cmdk-input]")).toBeFocused();
  await page.keyboard.type("604");
  await expect(page.locator('[cmdk-item][aria-selected="true"]')).toContainText("604.001");
  await page.keyboard.press("Enter");
  await expect(counter).toContainText("604.001");
  await expect(counter).not.toBeFocused();
});

test("psaní kódu DPH a Tab potvrdí zvýrazněnou položku a přesune fokus", async ({ page }) => {
  const vatCode = page.locator('[data-cell-key="fv1:vatCodeId"]').first();
  await expect(vatCode).toContainText("21V");
  await vatCode.scrollIntoViewIfNeeded();
  await vatCode.dblclick();
  await expect(page.locator("[cmdk-input]")).toBeFocused();
  await page.keyboard.type("12");
  await expect(page.locator('[cmdk-item][aria-selected="true"]')).toContainText("12V");
  await page.keyboard.press("Tab");
  await expect(vatCode).toContainText("12V");
  await expect(vatCode).not.toBeFocused();
});
