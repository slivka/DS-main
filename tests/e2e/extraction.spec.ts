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
    await expect(showcase.getByText(/Vyplněno ze souboru \(AI návrh\)/).first()).toBeVisible();

    // Nejisté pole je označené a F8 na něj přesune fokus; hydratace stránky může
    // trvat, proto stisk opakujeme, dokud posluchač nezačne reagovat.
    const amount = showcase.getByRole("textbox", { name: "Částka", exact: true });
    await expect(showcase.locator('[data-suggestion="uncertain"]')).toHaveCount(4);
    await expect
      .poll(
        async () => {
          await page.keyboard.press("F8");
          return page.evaluate(() => document.activeElement?.id);
        },
        { timeout: 20_000 },
      )
      .toBe("extraction-amount");

    // Ruční změna hodnoty stav návrhu zruší (řídí rodič).
    await amount.fill("12 500,00");
    await expect(showcase.locator('[data-suggestion="uncertain"]')).toHaveCount(3);

    // Jeden stisk F8 posune právě o jedno pole, i se dvěma souhrny návrhu na stránce.
    const documentForm = showcase.getByTestId("extraction-document");
    const dueDate = documentForm.locator("#document-dueDate");
    const total = documentForm.locator("#document-amountTotal");
    const rowAmount = documentForm.locator('[data-cell-key="extraction-row:amount"]');
    await dueDate.focus();
    await page.keyboard.press("F8");
    await expect(total).toBeFocused();
    await page.keyboard.press("F8");
    await expect(rowAmount).toBeFocused();
    await page.keyboard.press("F8");
    await expect(dueDate).toBeFocused();
    const row = rowAmount.locator("xpath=ancestor::tr");
    const before = await row.boundingBox();
    await rowAmount.click();
    const rowInput = documentForm.getByRole("textbox", { name: "Částka" });
    await rowInput.fill("-1 000,00");
    await page.keyboard.press("Tab");
    await expect(rowAmount).not.toHaveAttribute("data-suggestion");
    await expect(rowAmount).toContainText("−1 000,00");
    const after = await row.boundingBox();
    expect(before?.height).toBe(after?.height);

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
