/** Ukázka Import souborů: krok 1 → 2, výběr výpisů a zakázaná položka. */
import { expect, test } from "@playwright/test";

test("import výpisů: výběr souboru, zaškrtnutí a zakázaná položka", async ({ page }) => {
  await page.goto("/components/file-import", { waitUntil: "networkidle" });
  await expect(page.getByTestId("file-import-showcase")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Importovat výpisy" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Krok 1: výběr souboru přes skrytý vstup zóny.
  await dialog
    .locator('input[type="file"]')
    .first()
    .setInputFiles({
      name: "vypis.xml",
      mimeType: "text/xml",
      buffer: Buffer.from("<xml/>"),
    });
  await expect(dialog.getByText("vypis.xml")).toBeVisible();
  await dialog.getByRole("button", { name: "Pokračovat" }).click();

  // Krok 2: seskupený výběr – výchozí zaškrtnutí dvou platných výpisů.
  const first = dialog.getByRole("option", { name: /Výpis 2026\/10/ });
  const second = dialog.getByRole("option", { name: /Výpis 2026\/11/ });
  const broken = dialog.getByRole("option", { name: /Výpis 2026\/04/ });
  await expect(first).toHaveAttribute("aria-checked", "true");
  await expect(second).toHaveAttribute("aria-checked", "true");
  await expect(broken).toHaveAttribute("aria-checked", "false");

  // Zakázanou položku s chybou nejde zaškrtnout ani klávesou na řádku.
  await broken.press(" ");
  await expect(broken).toHaveAttribute("aria-checked", "false");

  // Mezerník na řádku odškrtne platný výpis; patička sleduje počet.
  await second.press(" ");
  await expect(second).toHaveAttribute("aria-checked", "false");
  await expect(dialog.getByRole("button", { name: /Importovat 1/ })).toBeEnabled();

  await dialog.getByRole("button", { name: /Importovat 1/ }).click();
  await expect(page.getByText("Ukázka dokončena: 1 výpisů.")).toBeVisible();
});
