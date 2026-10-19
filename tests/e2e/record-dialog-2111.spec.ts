import { expect, test, type Page } from "@playwright/test";

const REM = 16;
const WIDTHS = { sm: 32, md: 48, lg: 56 } as const;
const SIZE_LABEL = { sm: "sm – 32 rem", md: "md – 48 rem", lg: "lg – 56 rem" } as const;

async function open(page: Page) {
  await page.setViewportSize({ width: 1800, height: 1400 });
  await page.goto("/components/forms");
  const pane = page.getByTestId("record-dialog-demo-pane");
  await pane.scrollIntoViewIfNeeded();
  return pane;
}

async function choose(page: Page, label: string, option: string) {
  const trigger = page.getByRole("combobox", { name: label });
  const item = page.getByRole("option", { name: option, exact: true });
  // Spolehlivé čekání na otevřený seznam (po hydrataci), bez prodlužování timeoutů.
  await expect(async () => {
    if (!(await item.isVisible())) await trigger.click();
    await expect(item).toBeVisible({ timeout: 1000 });
  }).toPass();
  await item.click();
}

async function openScenario(page: Page, size: keyof typeof WIDTHS, inPane: boolean, name: string) {
  await choose(page, "Velikost", SIZE_LABEL[size]);
  await choose(page, "Umístění", inPane ? "V panelu" : "Mimo panel");
  await page.getByRole("button", { name, exact: true }).click();
  const dialog = page.getByRole("dialog", { name: /Kniha|Nová kniha/ }).first();
  await expect(dialog).toBeVisible();
  return dialog;
}

test("RecordDialog: sm / md / lg mají v panelu i mimo panel stejnou šířku", async ({ page }) => {
  const pane = await open(page);
  const paneWidth = (await pane.boundingBox())?.width ?? 0;
  for (const size of ["sm", "md", "lg"] as const) {
    const expected = WIDTHS[size] * REM;
    const outside = await openScenario(page, size, false, "Nový");
    // Počká na konec úvodní animace (zvětšení z 95 %).
    await expect
      .poll(async () => Math.round((await outside.boundingBox())?.width ?? 0))
      .toBe(expected);
    const outsideWidth = (await outside.boundingBox())?.width ?? 0;
    await page.keyboard.press("Escape");
    await expect(outside).toBeHidden();
    const inside = await openScenario(page, size, true, "Nový");
    const insideExpected = Math.min(expected, paneWidth - 2 * REM);
    await expect
      .poll(async () => Math.round((await inside.boundingBox())?.width ?? 0))
      .toBe(Math.round(insideExpected));
    const insideWidth = (await inside.boundingBox())?.width ?? 0;
    await page.keyboard.press("Escape");
    await expect(inside).toBeHidden();
    expect(Math.abs(outsideWidth - expected)).toBeLessThanOrEqual(1);
    // V panelu nejvýš šířka panelu minus okraj (p-4 = 2 × 1 rem).
    expect(Math.abs(insideWidth - insideExpected)).toBeLessThanOrEqual(1);
    if (paneWidth - 2 * REM >= expected)
      expect(Math.abs(insideWidth - outsideWidth)).toBeLessThanOrEqual(1);
  }
});

test("RecordDialog v panelu: ochrana neuložených změn a past fokusu", async ({ page }) => {
  await open(page);
  const dialog = await openScenario(page, "md", true, "Existující (zkus zavřít po úpravě)");
  const name = dialog.locator("#book-name");
  await name.fill("Přijaté faktury – upraveno");

  await page.keyboard.press("Escape");
  await expect(page.getByText("Zavřít záznam s neuloženými změnami?")).toBeVisible();
  await page.getByRole("button", { name: "Zpět k záznamu" }).click();
  await expect(page.getByText("Zavřít záznam s neuloženými změnami?")).toBeHidden();
  await expect
    .poll(() => dialog.evaluate((node) => node.contains(document.activeElement)))
    .toBe(true);

  // Tab nevyjde z dialogu v panelu.
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  }
  for (let i = 0; i < 25; i += 1) {
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
  }

  await page
    .locator('[data-slot="record-dialog-pane-overlay"]')
    .click({ position: { x: 5, y: 5 } });
  await expect(page.getByText("Zavřít záznam s neuloženými změnami?")).toBeVisible();
  await page.getByRole("button", { name: "Zavřít bez uložení" }).click();
  await expect(dialog).toBeHidden();
});
