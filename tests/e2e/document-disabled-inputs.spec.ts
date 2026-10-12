/** Zakázané vstupy dokladu · stejné barvy jako zamčený datum v obou režimech. */
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });

test("zakázané KS a SS sdílejí vzhled zamčeného Datum DPH", async ({ page }, testInfo) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const received = page.getByTestId("edit-document-eleven-received");
  await expect(received).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  await received.getByRole("button", { name: "Platit příkazem", exact: true }).click();
  const date = page.locator("#document-vatDate:disabled").first();
  await expect(date).toBeDisabled();

  for (const dark of [false, true]) {
    await page.evaluate((enabled) => {
      document.documentElement.classList.toggle("dark", enabled);
    }, dark);
    for (const id of ["document-constantSymbol", "document-specificSymbol"]) {
      const symbol = received.locator(`#${id}`);
      await expect(symbol).toBeDisabled();
      await expect(symbol).toHaveValue("");
      await expect
        .poll(async () => {
          const reference = await date.evaluate((input) => {
            const style = getComputedStyle(input);
            return [style.backgroundColor, style.borderColor, style.color, style.opacity];
          });
          const actual = await symbol.evaluate((input) => {
            const style = getComputedStyle(input);
            return [style.backgroundColor, style.borderColor, style.color, style.opacity];
          });
          return JSON.stringify(actual) === JSON.stringify(reference);
        })
        .toBe(true);
      expect(await symbol.evaluate((input) => getComputedStyle(input).backgroundColor)).not.toBe(
        "rgba(0, 0, 0, 0)",
      );
    }
    await testInfo.attach(
      dark ? "Zakázané symboly – tmavý režim" : "Zakázané symboly – světlý režim",
      {
        body: await received.locator('[data-slot="document-payment-section"]').screenshot(),
        contentType: "image/png",
      },
    );
  }
  await received.getByRole("button", { name: "Platit příkazem", exact: true }).click();
  await expect(received.locator("#document-specificSymbol")).toHaveValue("99");
});
