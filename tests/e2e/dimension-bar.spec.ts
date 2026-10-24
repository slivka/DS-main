import { expect, test } from "@playwright/test";
import { expectTooltip } from "./helpers/tooltip";

test("Dimenze: klávesnice, převzaté hodnoty, ruční výjimka a Enter v gridu", async ({ page }) => {
  await page.goto("/components/accounting-journal", { waitUntil: "networkidle" });
  const demo = page.getByTestId("dimensions-invoice-demo");
  const header = demo.locator('[data-slot="dimension-bar"]').first();
  await page.waitForFunction(() => {
    const node = document.querySelector(
      '[data-testid="dimensions-invoice-demo"] [data-slot="dimension-bar"]',
    );
    return node && Object.keys(node).some((key) => key.startsWith("__react"));
  });
  const add = header.getByRole("combobox", { name: "+ Dimenze" });
  await add.focus();
  await page.keyboard.press("Enter");
  await page.keyboard.type("Stred");
  await expect(page.getByRole("option", { name: "Středisko", exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "100 – Kancelář" })).toBeVisible();
  await page.keyboard.type("Díl");
  await expect(page.getByRole("option", { name: "Dílna", exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(header.getByRole("combobox", { name: "Středisko: Dílna" })).toBeVisible();
  await header.getByRole("combobox", { name: "Středisko: Dílna" }).focus();
  await page.keyboard.press("Backspace");
  await expect(header.getByRole("combobox", { name: "Středisko: Dílna" })).toHaveCount(0);
  await demo.locator('[data-slot="journal-detail-toggle"]').click();
  const detail = demo.locator('[data-slot="journal-dimensions-detail"]');
  const inherited = detail.getByRole("combobox", { name: "Vozidlo: Octavia · 1AB 2345" });
  await expect(inherited).toHaveAttribute("data-inherited", "true");
  await inherited.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("option", { name: "Transporter · 2BC 3456" })).toBeVisible();
  await page.keyboard.type("Transporter");
  await expect(page.getByRole("option", { name: "Transporter · 2BC 3456" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Enter");
  await expect(
    detail.getByRole("combobox", { name: "Vozidlo: Transporter · 2BC 3456" }),
  ).toBeVisible();
  await expect(header.getByText("+ další", { exact: true })).toBeVisible();
  await expectTooltip(
    page,
    header.getByText("+ další", { exact: true }),
    "Na 1 řádcích jiná hodnota",
  );
  await header.getByRole("combobox", { name: "Vozidlo: Octavia · 1AB 2345" }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.type("Octavia");
  await expect(page.getByRole("option", { name: "Octavia · 1AB 2345" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("Enter");
  await expect(
    detail.getByRole("combobox", { name: "Vozidlo: Transporter · 2BC 3456" }),
  ).toBeVisible();
  await detail.getByRole("button", { name: "Vrátit na hodnotu z hlavičky" }).click();
  await expect(inherited).toHaveAttribute("data-inherited", "true");
  await expect(header.getByText("+ další", { exact: true })).toHaveCount(0);
  const text = demo.locator('[data-cell-key="dimensions-invoice:text"]');
  await text.focus();
  await page.keyboard.press("Enter");
  await expect(demo.locator('[data-cell-key="dimensions-invoice:amount"]')).toBeFocused();
  await expect(text).toContainText("Servis vozidla");
  const id = page.getByTestId("dimensions-internal-demo");
  await id.locator('[data-slot="journal-detail-toggle"]').click();
  await expect(id.locator('[data-dimension-side="MD"]')).toBeVisible();
  await expect(id.locator('[data-dimension-side="D"]')).toBeVisible();
});
