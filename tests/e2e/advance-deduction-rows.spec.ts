/** Odečty záloh jako řádky dokladu a čitelné zakázané primární tlačítko. */
import { expect, test } from "@playwright/test";

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

  await page.getByRole("button", { name: "Odečet zálohy – Akce" }).first().click();
  await expect(page.getByRole("menuitem", { name: "Ruční odečet…" })).toBeVisible();
  await page.keyboard.press("Escape");
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
  await button.focus();
  await expect(page.getByRole("tooltip")).toContainText("Nejdříve vyberte soubory");
});
