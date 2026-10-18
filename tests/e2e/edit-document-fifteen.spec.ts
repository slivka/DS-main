/** Edit dokladu 15 · živý pruh na skutečné ukázce · nesmí kontrolovat zdrojový text. */
import { expect, test } from "@playwright/test";

test("Pruh: oprava DUZP odebere položku, titulek 2 → 1 → pruh zmizí", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const box = page.getByTestId("live-issues-showcase");
  await expect(box).toContainText("Doklad nelze uložit (2)", { timeout: 45000 });
  const duzp = box.locator("#document-taxDate");
  await duzp.click();
  await page.keyboard.type("10.10.2026");
  await duzp.blur();
  await expect(box).toContainText("Doklad nelze uložit (1)");
  await expect(box).not.toContainText("Chybí DUZP");
  await box.getByRole("button", { name: "Opravit řádek" }).click();
  await expect(box).not.toContainText("Doklad nelze uložit");
});
