import { expect, test } from "@playwright/test";

test.describe("Úzká pole 2.90", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/components/accounting-forms");
    await page.getByTestId("narrow-fields").scrollIntoViewIfNeeded();
  });

  for (const zoom of [0.7, 1, 2]) {
    test(`kód MJ se v nejužším sloupci neusekne (zoom ${zoom})`, async ({ page }) => {
      await page.evaluate((z) => {
        document.documentElement.style.zoom = String(z);
      }, zoom);
      for (const code of ["ks", "hod"]) {
        for (const mode of ["edit", "plain"]) {
          const cell = page.getByTestId(`unit-${code}-${mode}`);
          const text = cell.getByText(code, { exact: true });
          await expect(text).toBeVisible();
          const clipped = await text.evaluate((el) => el.scrollWidth > el.clientWidth);
          expect(clipped, `${code}/${mode}`).toBe(false);
          const textBox = await text.boundingBox();
          const pencil = cell.getByRole("button", { name: /upravit/i });
          if (mode === "edit") {
            const pencilBox = await pencil.boundingBox();
            expect(textBox!.x + textBox!.width).toBeLessThanOrEqual(pencilBox!.x + 0.5);
          } else {
            await expect(pencil).toHaveCount(0);
          }
        }
      }
    });
  }

  test("dlouhá výzva účtu se zkrátí před tlačítkem banky", async ({ page }) => {
    const field = page.getByTestId("narrow-payment-order");
    const prompt = field.getByText("Nejdřív vyberte dodavatele");
    await expect(prompt).toBeVisible();
    await expect(prompt).toHaveAttribute("title", "Nejdřív vyberte dodavatele");
    const truncated = await prompt.evaluate((el) => el.scrollWidth > el.clientWidth);
    expect(truncated).toBe(true);
    const promptBox = await prompt.boundingBox();
    const bankBox = await field.getByRole("button", { name: "Platit příkazem" }).boundingBox();
    expect(promptBox!.x + promptBox!.width).toBeLessThanOrEqual(bankBox!.x);
  });
});
