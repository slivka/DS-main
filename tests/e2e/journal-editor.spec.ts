import { expect, test } from "@playwright/test";

test.describe("JournalLinesEditor", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/accounting-forms");
    await page.waitForFunction(() => Object.keys(document.querySelector('[data-cell-key="l1:text"]') ?? {}).some((key) => key.startsWith("__reactProps")));
  });

  test("píše rovnou do aktivní buňky, Esc vrací hodnotu a F2 ji zachová", async ({ page }) => {
    const firstGrid = page.locator('[role="grid"]:has([data-cell-key="l1:text"])');
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
    await expect(textCell.getByRole("textbox")).toHaveCount(0);
    await expect(textCell).toContainText("Servisní práce");
  });

  test("uloží první znak, znaménko, desetinnou čárku, blur a Tab", async ({ page }) => {
    const grid = page.locator('[role="grid"]:has([data-cell-key="l1:text"])');
    const text = grid.locator('[data-cell-key="l1:text"]');
    const amount = grid.locator('[data-cell-key="l1:amount"]');

    await text.click();
    await text.press("a");
    await page.getByRole("heading", { name: "Řádky" }).click();
    await expect(text).toContainText("a");

    await amount.click();
    await amount.press("-");
    await page.keyboard.type("12");
    await page.keyboard.press("Enter");
    await expect(amount).toContainText("-12,00");

    await amount.press(",");
    await page.keyboard.type("5");
    await page.keyboard.press("Tab");
    await expect(amount).toContainText("0,50");
  });

  test("Ctrl+D duplikuje a Ctrl+Delete odebere řádek s možností vrácení", async ({ page }) => {
    const firstGrid = page.locator('[role="grid"]:has([data-cell-key="l2:text"])');
    const rows = firstGrid.locator('[data-cell-key$=":text"]');
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
    await expect(page.getByTestId("journal-roundtrip")).toContainText("Jedna předkontace = jeden databázový řádek");
    const foreignCell = page.locator('[data-cell-key="fx1:amount"][tabindex="0"]');
    await page.waitForFunction(() => Object.keys(document.querySelector('[data-cell-key="fx1:amount"]') ?? {}).some((key) => key.startsWith("__reactProps")));
    await foreignCell.scrollIntoViewIfNeeded();
    await foreignCell.evaluate((element) => element.dispatchEvent(new MouseEvent("dblclick", { bubbles: true })));
    const input = foreignCell.getByRole("textbox");
    await input.fill("200");
    await input.press("Enter");
    await expect(foreignCell).toContainText("200,00");
    await foreignCell.locator("xpath=ancestor::tr").getByRole("button", { name: "Zobrazit detail řádku" }).click();
    await expect(foreignCell.locator("xpath=ancestor::tr/following-sibling::tr[1]").locator('input[value="5 024,00"]')).toHaveCount(1);
  });

  test("zaúčtovaný příklad dovolí upravit pouze text a zakázku", async ({ page }) => {
    const postedGrid = page.locator('[role="grid"]:has([data-cell-key="posted1:text"])');
    await expect(postedGrid.locator('[data-cell-key="posted1:text"]')).toHaveAttribute("tabindex", "0");
    await expect(postedGrid.locator('[data-cell-key="posted1:text"]')).toHaveAttribute("tabindex", "0");
    await expect(postedGrid.locator('[data-cell-key="posted1:amount"]')).toHaveAttribute("tabindex", "-1");
  });

  test("hlavní účet knihy je jen pro čtení a řádek zaokrouhlení je poslední bez akcí", async ({ page }) => {
    const cashGrid = page.locator('[role="grid"]:has([data-cell-key="pd1:counterAccount"])');
    await expect(cashGrid.locator('[data-cell-key="pd1:counterAccount"]')).toHaveAttribute("tabindex", "0");
    const rows = cashGrid.locator("tbody tr");
    await expect(rows.last()).toContainText("Zaokrouhlení");
    await expect(rows.last().getByRole("button", { name: "Odebrat řádek" })).toHaveCount(0);
  });
});