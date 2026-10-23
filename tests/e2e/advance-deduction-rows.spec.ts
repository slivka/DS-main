/** Odečty záloh jako řádky dokladu a čitelné zakázané primární tlačítko. */
import { expect, test } from "@playwright/test";
import { expectTooltip } from "./helpers/tooltip";

/** Relativní jas sRGB barvy z rgb(...) textu. */
function luminance(color: string) {
  const [r, g, b] = (color.match(/[\d.]+/g) ?? []).slice(0, 3).map((value) => {
    const channel = Number(value) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

test("FV: odečty pod položkami, split akce a tři součty", async ({ page }) => {
  await page.goto("/components/accounting-advances", { waitUntil: "networkidle" });
  const rows = page.locator('[data-slot="journal-deduction-row"]');
  await expect(rows.first()).toBeVisible();
  const editor = rows.first().locator("xpath=ancestor::table[1]");
  const bodyRows = editor.locator("tbody > tr:not([hidden])");
  await expect(bodyRows.last()).toHaveAttribute("data-slot", "journal-deduction-row");
  await expect(page.locator('[data-slot="journal-deduction-to-pay"]').first()).toBeVisible();

  const fv = page.locator('[data-slot="journal-lines-editor"]').first();
  await expect(fv.locator('[data-slot="journal-difference-bar"]')).toHaveCount(0);
  await expect(fv.locator('[data-slot="journal-deduction-to-pay"]')).toHaveCount(1);
  await expect(fv.locator('[data-slot="journal-footer-sum"]')).toContainText("Součet položek");

  const trigger = fv.getByRole("button", { name: "Další možnosti – Odečet zálohy" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menuitem", { name: "Ruční odečet…" })).toBeVisible();
  await page.keyboard.press("Escape");

  // Odebrání přes potvrzení v DS; fokus přejde na split „Odečet zálohy“.
  const remove = fv.getByRole("button", { name: /^Odebrat: Odečet zálohy ZFV 2026002/ });
  await remove.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("alertdialog").getByRole("button", { name: "Odebrat" }).click();
  await expect(fv.locator('[data-slot="journal-deduction-row"]')).toHaveCount(1);
  await expect(fv.locator('[data-slot="journal-deduction-add"]')).toBeFocused();

  // Plná šířka: split vedle „+“; úzká lišta se zvětšenou tabulkou: sbalí se do „…“ bez přetečení.
  await expect(fv.locator('[data-slot="journal-deduction-split"][data-compact]')).toHaveCount(0);
  await page.setViewportSize({ width: 420, height: 1200 });
  const toolbar = fv.locator('[data-slot="grid-toolbar"]');
  const zoomIn = toolbar.getByRole("button", { name: "Zvětšit tabulku" });
  for (let step = 0; step < 6; step++)
    await zoomIn.evaluate((button: HTMLElement) => button.click());
  await expect(fv.locator('[data-slot="journal-deduction-split"][data-compact]')).toBeVisible();
  expect(await toolbar.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(true);
});

test("zakázané Pokračovat má čitelný text (AA) a důvod", async ({ page }) => {
  await page.goto("/components/file-import", { waitUntil: "networkidle" });
  await expect(page.getByTestId("file-import-showcase")).toHaveAttribute("data-ready", "true");
  await page.getByRole("button", { name: "Importovat výpisy" }).click();
  const button = page.getByRole("button", { name: "Pokračovat" });
  await expect(button).toHaveAttribute("aria-disabled", "true");
  const colors = await button.evaluate((element) => {
    const canvas = document.createElement("canvas").getContext("2d");
    const toRgb = (value: string) => {
      if (!canvas) return value;
      canvas.fillStyle = value;
      canvas.fillRect(0, 0, 1, 1);
      return `rgb(${[...canvas.getImageData(0, 0, 1, 1).data].slice(0, 3).join(",")})`;
    };
    let node: Element | null = element;
    let background = "rgba(0, 0, 0, 0)";
    while (node && /rgba\(.*, 0\)|transparent/.test(background)) {
      background = getComputedStyle(node).backgroundColor;
      node = node.parentElement;
    }
    return { text: toRgb(getComputedStyle(element).color), background: toRgb(background) };
  });
  const [light, dark] = [luminance(colors.text), luminance(colors.background)].sort(
    (a, b) => b - a,
  );
  expect(((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05)).toBeGreaterThanOrEqual(4.5);
  await expectTooltip(page, button, "Nejdříve vyberte soubory", { interaction: "keyboard" });
});
