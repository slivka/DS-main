/** Ukázka Import souborů: krok 1 → 2, výběr výpisů a zakázaná položka. */
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("import výpisů: výběr souboru, zaškrtnutí a zakázaná položka", async ({ page }) => {
  await page.goto("/components/file-import", { waitUntil: "networkidle" });
  await expect(page.getByTestId("file-import-showcase")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Importovat výpisy" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Jediné tlačítko plochy otevře výběr oběma klávesami bez vnořených ovladačů.
  const choose = dialog.getByRole("button", { name: "Přetáhněte soubory sem" });
  for (const key of ["Enter", " "]) {
    const chooser = page.waitForEvent("filechooser");
    await choose.press(key);
    await chooser;
  }

  // Krok 1: výběr souboru přes skrytý vstup zóny.
  await dialog
    .locator('input[type="file"]')
    .first()
    .setInputFiles(
      ["vypis.xml", "druhy.xml", "treti.xml", "ctvrty.xml"].map((name) => ({
        name,
        mimeType: "text/xml",
        buffer: Buffer.from("<xml/>"),
      })),
    );
  await expect(dialog.getByText("vypis.xml")).toBeVisible();
  await dialog.getByRole("button", { name: "Pokračovat" }).click();

  const chips = dialog.locator('[data-slot="file-chip-bar"]');
  const remove = chips.getByRole("button", { name: "Odebrat vypis.xml" });
  await remove.focus();
  for (const name of [
    "Odebrat druhy.xml",
    "Odebrat treti.xml",
    "+1 dalších",
    "Přetáhněte soubory sem",
  ]) {
    await page.keyboard.press("Tab");
    await expect(chips.getByRole("button", { name, exact: true })).toBeFocused();
  }
  const more = chips.getByRole("button", { name: "+1 dalších" });
  await more.press("Enter");
  await chips.getByRole("button", { name: "Odebrat treti.xml" }).focus();
  await page.keyboard.press("Tab");
  await expect(chips.getByRole("button", { name: "Odebrat ctvrty.xml" })).toBeFocused();
  const accessibility = await new AxeBuilder({ page })
    .include('[data-slot="file-drop-zone"]')
    .withRules(["nested-interactive"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  // Krok 2: seskupený výběr – výchozí zaškrtnutí dvou platných výpisů.
  const first = dialog.getByRole("button", { name: /Výpis 2026\/10/ });
  const second = dialog.getByRole("button", { name: /Výpis 2026\/11/ });
  const broken = dialog.getByRole("button", { name: /Výpis 2026\/04/ });
  await expect(dialog.getByRole("checkbox", { name: /Výpis 2026\/10/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(dialog.getByRole("checkbox", { name: /Výpis 2026\/11/ })).toHaveAttribute(
    "aria-checked",
    "true",
  );
  await expect(dialog.getByRole("checkbox", { name: /Výpis 2026\/04/ })).toHaveAttribute(
    "aria-checked",
    "false",
  );

  // Zakázanou položku s chybou nejde zaškrtnout ani klávesou na řádku.
  await broken.press(" ");
  await expect(dialog.getByRole("checkbox", { name: /Výpis 2026\/04/ })).toHaveAttribute(
    "aria-checked",
    "false",
  );

  // Mezerník na řádku odškrtne platný výpis; patička sleduje počet.
  await second.press(" ");
  await expect(dialog.getByRole("checkbox", { name: /Výpis 2026\/11/ })).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(dialog.getByRole("button", { name: /Importovat 1/ })).toBeEnabled();

  await dialog.getByRole("button", { name: /Importovat 1/ }).click();
  await expect(page.getByText("Ukázka dokončena: 1 výpisů.")).toBeVisible();
});
