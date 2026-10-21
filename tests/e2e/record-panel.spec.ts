import { expect, test } from "@playwright/test";
test("Panel záznamu – přílohy, poznámky, výběr, úzká šířka a zoom", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1800 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/components/record-panel");
  const example = page.getByTestId("document-panel-example");
  const trigger = example.getByRole("button", { name: "Přílohy: 2", exact: true });
  await expect(page.getByTestId("record-panel-showcase")).toHaveAttribute("data-ready", "true");
  await trigger.click();
  const panel = example.locator('[data-slot="record-side-panel"]');
  await expect(panel.getByRole("tab", { name: "Přílohy: 2", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(panel.getByRole("button", { name: "Nahradit", exact: true })).toBeVisible();
  const handle = panel.getByRole("separator", { name: "Změnit šířku panelu" });
  await handle.focus();
  await handle.press("ArrowLeft");
  await expect(handle).toHaveAttribute("aria-valuenow", "400");
  await handle.dblclick();
  await expect(handle).toHaveAttribute("aria-valuenow", "384");
  const formBox = await page.getByTestId("document-panel-form").boundingBox();
  const panelBox = await panel.boundingBox();
  expect(formBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  if (formBox && panelBox) expect(formBox.x + formBox.width).toBeLessThanOrEqual(panelBox.x + 1);
  await panel.getByRole("tab", { name: "Poznámky: 2", exact: true }).click();
  await panel.getByRole("textbox", { name: "Nová poznámka…" }).fill("Zkouška panelu");
  await panel.getByRole("textbox", { name: "Nová poznámka…" }).press("Control+Enter");
  await expect(panel.getByText("Zkouška panelu", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole("button", { name: "Úzký panel", exact: true }).click();
  await trigger.click();
  await expect(example.locator('[data-slot="record-panel-layout"]')).toHaveAttribute(
    "data-overlay",
    "true",
  );
  await expect(panel).toHaveAttribute("aria-modal", "true");
  await page.getByRole("button", { name: "Zoom 200 %", exact: true }).click();
  await expect(panel.getByRole("tab", { name: "Poznámky: 3", exact: true })).toBeVisible();
  await page.screenshot({ path: "/tmp/browser/record-panel/e2e-zoom.png" });
  await panel.getByRole("button", { name: "Zavřít panel", exact: true }).click();
  await page.getByRole("button", { name: "Zoom 200 %", exact: true }).click();
  await page.getByRole("button", { name: "Úzký panel", exact: true }).click();
  const grid = page.getByTestId("grid-panel-example");
  const row = grid.getByRole("row").filter({ hasText: "FP 2026/0142" });
  await row.getByRole("button", { name: "Přílohy: 2", exact: true }).click();
  await expect(row.getByRole("checkbox")).not.toBeChecked();
  await grid
    .locator('[data-slot="record-side-panel"]')
    .getByRole("button", { name: "Zavřít panel", exact: true })
    .click();
  await row.getByRole("checkbox").check();
  await grid.getByRole("row").filter({ hasText: "FP 2026/0143" }).getByRole("checkbox").check();
  await expect(grid.getByText("Vybráno 2 dokladů", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
