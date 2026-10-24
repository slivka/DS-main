import { expect, test } from "@playwright/test";

test("DPH: řádek, oddíl KH, doklad a řízené podání", async ({ page }) => {
  await page.goto("/components/vat-reports");
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  const demo = page.getByTestId("vat-showcase");
  await demo.getByText("1 · Dodání zboží a služeb · 21 %", { exact: true }).dblclick();
  await expect(demo.getByTestId("vat-event")).toHaveText("Řádek 1");
  await demo.getByRole("tab", { name: "A4", exact: true }).click();
  await demo.getByText("FV2026001", { exact: true }).dblclick();
  await expect(demo.getByTestId("vat-event")).toHaveText("Doklad fv1");
  await demo.getByRole("tab", { name: "A5", exact: true }).click();
  await expect(demo.getByRole("tabpanel")).toContainText("7 000,00");
  await demo.getByRole("button", { name: "Vytvořit podání", exact: true }).click();
  await expect(demo.getByTestId("vat-event")).toHaveText("Podání vytvořeno");
  await demo.getByRole("button", { name: "Označit jako podané", exact: true }).click();
  await expect(demo.getByText("Podané", { exact: true })).toBeVisible();
  await demo.getByRole("button", { name: "Vytvořit dodatečné", exact: true }).click();
  await expect(demo.getByRole("combobox", { name: "Druh podání" })).toContainText("Dodatečné");
  await demo.getByRole("button", { name: "Odemknout období", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Důvod odemknutí").fill("Oprava údajů");
  await dialog.locator("input").fill("Říjen 2026");
  await dialog.getByRole("button", { name: "Odemknout období", exact: true }).click();
  await expect(demo.getByText("Otevřené", { exact: true })).toBeVisible();
});
