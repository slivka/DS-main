/** Edit dokladu 15 · živý pruh na skutečné ukázce · nesmí kontrolovat zdrojový text. */
import { expect, test } from "@playwright/test";

test("Pruh: oprava DUZP odebere položku, titulek 2 → 1 → pruh zmizí", async ({ page }) => {
  await page.goto("/components/accounting-controls", { waitUntil: "networkidle" });
  // Hydratace: ukázka výpisu na téže stránce hlásí připravenost.
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  const box = page.getByTestId("live-issues-showcase");
  await expect(box).toContainText("Doklad nelze uložit (2)");
  const duzp = box.locator("#document-taxDate");
  await duzp.click();
  await page.keyboard.type("10.10.2026");
  await duzp.blur();
  await expect(box).toContainText("Doklad nelze uložit (1)");
  await expect(box).not.toContainText("Chybí DUZP");
  await box.getByRole("button", { name: "Opravit řádek" }).click();
  await expect(box).not.toContainText("Doklad nelze uložit");
});

test("Protiúčet BA: sloupce obou řádků lícují při zoomu 70 / 100 / 200 %", async ({ page }) => {
  await page.goto("/components/accounting-bank", { waitUntil: "networkidle" });
  const box = page.getByTestId("bank-vat-example");
  await expect(page.getByTestId("bank-showcase")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  for (const scale of [0.7, 1, 2]) {
    await page.evaluate(async (value) => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(value);
    }, scale);
    await expect
      .poll(async () =>
        box.evaluate((root) => {
          const left = (id: string) =>
            root.querySelector(`#${id}`)?.closest('[data-slot="field"]')?.getBoundingClientRect();
          const pairs = [
            ["document-bankAccountKind", "document-variableSymbol"],
            ["document-movement-account", "document-constantSymbol"],
            ["document-bank-code", "document-specificSymbol"],
          ];
          return pairs.every(([a, b]) => {
            const x = left(a!);
            const y = left(b!);
            return Boolean(
              x && y && Math.abs(x.left - y.left) < 1 && Math.abs(x.width - y.width) < 1,
            );
          });
        }),
      )
      .toBe(true);
  }
});
