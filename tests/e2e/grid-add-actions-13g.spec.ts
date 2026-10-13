/** 13g · dvě primární akce lišty ve třech šířkách a DUZP u BA. */
import { expect, test } from "@playwright/test";

test("lišta: plné texty, zkrácené texty a sloučená nabídka", async ({ page }) => {
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  const wide = page.getByTestId("primary-actions-wide");
  const short = page.getByTestId("primary-actions-short");
  const narrow = page.getByTestId("primary-actions-menu");
  await wide.scrollIntoViewIfNeeded();
  await expect(wide.locator("[data-toolbar-add]:visible span:visible")).toHaveText([
    "Nový příjem",
    "Nový výdej",
  ]);
  await short.scrollIntoViewIfNeeded();
  await expect(short.locator("[data-toolbar-add]:visible span:visible")).toHaveText([
    "Příjem",
    "Výdej",
  ]);
  // Lišta gridu se vykreslí až po vstupu do viewportu; ukázka nad ní může stránku posunout.
  await narrow.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await expect(narrow.locator("[data-overflow-level]")).toHaveAttribute("data-overflow-level", "3");
  await narrow.evaluate((node) => node.scrollIntoView({ block: "center" }));
  const menu = narrow.locator('[data-slot="grid-add-menu"]');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-haspopup", "menu");
  await expect(narrow.locator("[data-toolbar-add]:visible")).toHaveCount(0);
  await menu.click();
  await page.getByRole("menuitem", { name: "Výdej" }).click();
  await expect(page.getByTestId("primary-actions-last")).toHaveText(
    "Poslední akce: Pokladna – úzký panel: výdej",
  );
  await menu.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Příjem" }).press("Enter");
  await expect(page.getByTestId("primary-actions-last")).toHaveText(
    "Poslední akce: Pokladna – úzký panel: příjem",
  );
});
test("BA výdej v EUR s DPH ukazuje DUZP, Datum DPH a Kurz DPH", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const form = page.getByTestId("bank-vat-example");
  await form.scrollIntoViewIfNeeded();
  await expect(form.getByText("DUZP", { exact: true })).toBeVisible();
  await expect(form.getByText("Datum DPH", { exact: true })).toBeVisible();
  await expect(form.getByText("Kurz DPH", { exact: true })).toBeVisible();
});
