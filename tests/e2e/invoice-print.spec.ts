import { expect, test } from "@playwright/test";

test("InvoicePrint – skutečné PDF, čtyři vzory, koncept a stažení", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1800 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/components/print");
  const showcase = page.getByTestId("invoice-print-showcase");
  const preview = page.getByTestId("invoice-pdf-preview").frameLocator("iframe");
  // První PDF čeká na hydrataci, fonty i import workeru; nejde o chybu rušení náhledu.
  await expect(preview.locator("canvas").first()).toBeVisible({ timeout: 30_000 });
  await expect(showcase).toHaveAttribute("data-pages", "2");
  await expect(preview.locator("canvas").first()).toHaveAttribute("aria-label", /112012005/);
  await showcase.getByRole("combobox").first().click();
  await page.getByRole("option", { name: "DPH 21 % + 12 %", exact: true }).click();
  await expect(showcase).toHaveAttribute("data-pages", "1");
  await expect(preview.locator("canvas").first()).toHaveAttribute("aria-label", /FV20260002/);
  await showcase.getByRole("button", { name: "Náhled", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const download = page.waitForEvent("download");
  await dialog.getByRole("button", { name: "Stáhnout PDF", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("faktura-fv20260002.pdf");
  await page.keyboard.press("Escape");
  await showcase.getByRole("checkbox", { name: "KONCEPT", exact: true }).click();
  await expect(preview.locator("canvas").first()).toHaveAttribute("aria-label", /KONCEPT/);
  expect(await preview.locator("canvas").first().getAttribute("aria-label")).not.toContain(
    "QR Platba",
  );
  await showcase.getByRole("checkbox", { name: "KONCEPT", exact: true }).click();
  for (const [label, number] of [
    ["Faktura v EUR", "FV20260003"],
    ["Platba kartou", "FV20260004"],
  ]) {
    await showcase.getByRole("combobox").first().click();
    await page.getByRole("option", { name: label, exact: true }).click();
    await expect(preview.locator("canvas").first()).toHaveAttribute(
      "aria-label",
      new RegExp(number),
    );
    await expect(showcase).toHaveAttribute("data-pages", "1");
  }
  expect(await preview.locator("canvas").first().getAttribute("aria-label")).not.toContain(
    "K úhradě",
  );
  // Dvě rychlé změny dokumentu zruší předchozí načítání/render; skutečná chyba se nefiltruje.
  const draft = showcase.getByRole("checkbox", { name: "KONCEPT", exact: true });
  for (let round = 0; round < 3; round++) {
    await draft.click();
    await draft.click();
  }
  await expect(preview.locator("canvas").first()).toHaveAttribute("aria-label", /FV20260004/);
  expect(errors).toEqual([]);
});
