/** Banka I3–I7 · rozpis výpisu a dávka plateb · nesmí testovat doménu aplikace. */
import { expect, test } from "@playwright/test";

test.describe("Banka – rozpis výpisu a dávka plateb", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/accounting-bank", { waitUntil: "networkidle" });
    // Hydratace stránky je spolehlivý signál; dřívější klik bez Reactu nic nezměnil.
    await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
    await expect(page.getByTestId("bank-reconcile-showcase")).toBeVisible({ timeout: 45_000 });
  });

  test("rozpis výpisu: filtr stavu, přijetí návrhu, výběr řádků", async ({ page }) => {
    const view = page.locator('[data-slot="bank-statement-reconcile-view"]');
    await expect(view.getByRole("button", { name: /Jisté \(2\)/ })).toBeVisible();

    // Filtr stavu Nerozpoznané zúží grid.
    const unknown = view.getByRole("button", { name: /Nerozpoznané \(2\)/ });
    await unknown.click();
    await expect(unknown).toHaveAttribute("aria-pressed", "true");
    await expect(view.getByText("Poplatek za vedení účtu")).toBeVisible();
    await expect(view.getByText("Úhrada faktury")).toBeHidden();
    await view.getByRole("button", { name: /Vše \(6\)/ }).click();

    // Klik na řádek s návrhem zobrazí řádek návrhu s kandidáty a akcemi.
    await view.getByText("Záloha na pojištění").click();
    const suggestion = page.locator('[data-slot="bank-reconcile-suggestion"]');
    await expect(suggestion).toBeVisible();
    await expect(suggestion.getByRole("combobox", { name: "Kandidát úhrady" })).toBeVisible();

    // Ctrl+Enter přijme návrh aktivního řádku – stav se změní na Jisté.
    await page.keyboard.press("Control+Enter");
    await expect(view.getByRole("button", { name: /Jisté \(3\)/ })).toBeVisible();

    // Výběr řádku checkboxem zpřístupní Zařadit vybrané.
    const fileSelected = view.getByRole("button", { name: "Zařadit vybrané" });
    await expect(fileSelected).toBeDisabled();
    await view.getByRole("button", { name: "Vybrat více" }).click();
    await view.getByRole("row", { name: /Poplatek za vedení účtu/ }).getByRole("checkbox").click();
    await expect(fileSelected).toBeEnabled();
  });

  test("dávka plateb: výběr, kontroly blokují soubor, dialog odeslání", async ({ page }) => {
    const batch = page.locator('[data-slot="payment-order-batch-view"]');
    await expect(batch.getByText("Alza a.s.")).toBeVisible();
    await batch.getByRole("button", { name: "Vybrat více" }).click();

    // Řádek s chybou (chybí účet partnera) blokuje vytvoření souboru.
    await batch.getByRole("row", { name: /Karet s\.r\.o\./ }).getByRole("checkbox").click();
    await expect(batch.getByRole("button", { name: "Vytvořit soubor příkazu" })).toBeDisabled();

    // Bezchybný řádek soubor povolí.
    await batch.getByRole("row", { name: /Karet s\.r\.o\./ }).getByRole("checkbox").click();
    await batch.getByRole("row", { name: /Alza a\.s\./ }).getByRole("checkbox").click();
    await expect(batch.getByRole("button", { name: "Vytvořit soubor příkazu" })).toBeEnabled();

    // Dialog odeslání vyžaduje opsání textu.
    await batch.getByRole("button", { name: "Odeslat do Fio" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/Platby se odešlou přímo do banky/)).toBeVisible();
    const submit = dialog.getByRole("button", { name: "Odeslat do banky" });
    await expect(submit).toBeDisabled();
    await dialog.getByRole("textbox").fill("ODESLAT");
    await expect(submit).toBeEnabled();
    await dialog.getByRole("button", { name: "Zrušit" }).click();
  });
});
