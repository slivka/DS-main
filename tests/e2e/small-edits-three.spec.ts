import { expect, test } from "@playwright/test";

// Drobné opravy 3: patička malého dialogu vpravo v jednom řádku, Od | Do vedle sebe v sm dialogu.
test("malý dialog: Zrušit a Uložit vpravo v řádku, Od a Do na stejné výšce", async ({ page }) => {
  await page.goto("/components/forms", { waitUntil: "networkidle" });
  const demo = page.getByTestId("small-dialog-showcase");
  await demo.scrollIntoViewIfNeeded();
  await demo.getByRole("button", { name: "Nové účetní období" }).click();
  const dialog = page.getByRole("dialog", { name: /Nové účetní období/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-slot="record-dialog-description"]')).toBeVisible();
  const cancel = await dialog.getByRole("button", { name: "Zrušit" }).boundingBox();
  const save = await dialog.locator('[data-slot="record-submit"]').boundingBox();
  const box = await dialog.boundingBox();
  if (!cancel || !save || !box) throw new Error("Chybí tlačítka");
  expect(Math.abs(cancel.y - save.y)).toBeLessThanOrEqual(1);
  expect(cancel.x).toBeLessThan(save.x);
  expect(box.x + box.width - (save.x + save.width)).toBeLessThanOrEqual(40);
  const from = await dialog.locator("#sm-from").boundingBox();
  const to = await dialog.locator("#sm-to").boundingBox();
  if (!from || !to) throw new Error("Chybí pole");
  expect(Math.abs(from.y - to.y)).toBeLessThanOrEqual(1);
});

test("úzký panel bez sm dialogu: pole zůstávají pod sebou pod 40 rem", async ({ page }) => {
  await page.setViewportSize({ width: 560, height: 1200 });
  await page.goto("/components/forms", { waitUntil: "networkidle" });
  const demo = page.getByTestId("small-dialog-showcase");
  await demo.getByRole("button", { name: "Stejná pole ve středním dialogu" }).click();
  const dialog = page.getByRole("dialog");
  const from = await dialog.locator("#md-from").boundingBox();
  const to = await dialog.locator("#md-to").boundingBox();
  if (!from || !to) throw new Error("Chybí pole");
  expect(to.y).toBeGreaterThan(from.y + 10);
});
