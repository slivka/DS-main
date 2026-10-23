import { expect, test } from "@playwright/test";

/** Vytěžování 2.135.0 · ukázka na stránce Panel záznamu: stavy, F8 a dialog přepsání. */
test.describe("vytěžování souboru", () => {
  test("ukázka vykreslí stavy, F8 obchází nejistá pole a dialog nabídne tři volby", async ({
    page,
  }) => {
    await page.goto("/components/record-panel");
    const showcase = page.getByTestId("extraction-showcase");
    await expect(showcase).toBeVisible();

    // Pruh stavu a souhrn návrhu.
    await expect(showcase.getByText("Hotovo · AI návrh")).toBeVisible();
    await expect(showcase.getByText(/Vyplněno ze souboru \(AI návrh\)/)).toBeVisible();

    // Nejisté pole je označené a F8 na něj přesune fokus.
    const amount = showcase.getByLabel("Částka");
    await expect(showcase.locator('[data-suggestion="uncertain"]')).toHaveCount(1);
    await page.keyboard.press("F8");
    await expect(amount).toBeFocused();

    // Ruční změna hodnoty stav návrhu zruší (řídí rodič).
    await amount.fill("12 500,00");
    await expect(showcase.locator('[data-suggestion="uncertain"]')).toHaveCount(0);

    // Dialog přepsání do rozepsaného dokladu.
    await showcase.getByRole("button", { name: "Vytěžit do rozepsaného dokladu" }).click();
    await expect(page.getByText("Doklad už má vyplněné hodnoty")).toBeVisible();
    await page.getByRole("button", { name: "Doplnit jen prázdná pole" }).click();
    await expect(showcase.getByText("Zvoleno: Doplnit jen prázdná pole")).toBeVisible();

    // Tabulka položek je výchozí sbalená a rozbalí se.
    const itemsTitle = showcase.getByText("Vytěžené položky (3)");
    await expect(itemsTitle).toBeVisible();
    await expect(showcase.getByText("Kancelářské potřeby")).toBeHidden();
    await itemsTitle.click();
    await expect(showcase.getByText("Kancelářské potřeby")).toBeVisible();
  });
});
