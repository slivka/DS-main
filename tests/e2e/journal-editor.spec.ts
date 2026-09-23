import { expect, test } from "@playwright/test";

test.describe("JournalLinesEditor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/accounting-forms");
    await page.waitForFunction(() => Object.keys(document.querySelector('[data-cell-key="l1:text"]') ?? {}).some((key) => key.startsWith("__reactProps")));
  });

  test("píše rovnou do aktivní buňky, Esc vrací hodnotu a F2 ji zachová", async ({ page }) => {
    const firstGrid = page.getByRole("grid").first();
    const textCell = firstGrid.locator('[data-cell-key="l1:text"]');
    await expect(textCell).toContainText("Servisní práce");

    await textCell.click();
    await textCell.press("X");
    await expect(textCell.getByRole("textbox")).toHaveValue("X");
    await page.keyboard.press("Escape");
    await expect(textCell).toContainText("Servisní práce");

    await textCell.press("F2");
    await expect(textCell.getByRole("textbox")).toHaveValue("Servisní práce");
    await page.keyboard.press("Enter");
    await expect(firstGrid.locator('[data-cell-key="l1:dimensionId"]')).toBeFocused();
  });

  test("Ctrl+D duplikuje a Ctrl+Delete odebere řádek s možností vrácení", async ({ page }) => {
    const firstGrid = page.getByRole("grid").first();
    const rows = firstGrid.locator("tbody tr");
    await expect(rows).toHaveCount(2);
    const activeCell = firstGrid.locator('[data-cell-key="l1:text"]');
    await activeCell.click();
    await activeCell.press("Control+d");
    await expect(rows).toHaveCount(3);
    await activeCell.press("Control+Delete");
    await expect(rows).toHaveCount(2);
    await page.getByRole("button", { name: "Zpět" }).click();
    await expect(rows).toHaveCount(3);
  });

  test("měnové řádky přepočítají Kč a ukázka potvrzuje převod tam i zpět", async ({ page }) => {
    await expect(page.getByTestId("journal-roundtrip")).toContainText("2 předkontací → 4 DB řádků → 2 předkontací");
    const foreignCell = page.locator('[data-cell-key="fx1:foreignAmount"]');
    await page.waitForFunction(() => Object.keys(document.querySelector('[data-cell-key="fx1:foreignAmount"]') ?? {}).some((key) => key.startsWith("__reactProps")));
    await foreignCell.scrollIntoViewIfNeeded();
    await foreignCell.evaluate((element) => element.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
    const input = foreignCell.getByRole("textbox");
    await input.fill("200");
    await input.press("Enter");
    await expect(page.locator('[data-cell-key="fx1:amount"]')).toContainText("5 024,00");
  });

  test("zaúčtovaný příklad dovolí upravit pouze text a zakázku", async ({ page }) => {
    const postedGrid = page.getByRole("grid").nth(3);
    await expect(postedGrid.locator('[data-cell-key="posted1:text"]')).toHaveAttribute("tabindex", "0");
    await expect(postedGrid.locator('[data-cell-key="posted1:dimensionId"]')).toHaveAttribute("tabindex", "0");
    await expect(postedGrid.locator('[data-cell-key="posted1:amount"]')).toHaveAttribute("tabindex", "-1");
  });
});