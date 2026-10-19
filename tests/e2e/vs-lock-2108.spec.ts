import { expect, test } from "@playwright/test";

// Zámek VS v prohlížeči: přijatá FP – náhled z čísla, odemčení zachová hodnotu,
// > 10 číslic uvolní vazbu a ukáže varování.
test("VS zámek: náhled, odemčení se stejnou hodnotou, uvolnění při > 10 číslicích", async ({
  page,
}) => {
  await page.goto("/components/accounting-controls", { waitUntil: "networkidle" });
  // Čekat na hydrataci stránky (spolehlivý signál), ne na delší limit.
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
  const external = page.locator("#document-externalNumber").first();
  await external.scrollIntoViewIfNeeded();
  // Stránka má více formulářů se stejnými id – pracujeme v nejbližším společném předkovi.
  const form = external.locator("xpath=ancestor::div[.//*[@id='document-variableSymbol']][1]");
  const vs = form.locator("#document-variableSymbol");
  const lock = form.getByRole("button", { name: "Svázat VS s číslem daňového dokladu" });

  await expect(async () => {
    await external.fill("FA-2026/0456");
    await expect(vs).toHaveValue("20260456");
  }).toPass({ timeout: 30_000 });
  await expect(vs).toHaveAttribute("readonly", "");

  // Odemčení: hodnota z náhledu zůstane v poli.
  await lock.click();
  await expect(vs).not.toHaveAttribute("readonly", "");
  await expect(vs).toHaveValue("20260456");

  // Znovu zamknout a zadat číslo s > 10 číslicemi: vazba se uvolní, VS zůstane, varování.
  await lock.click();
  await external.fill("12345678901");
  await expect(vs).not.toHaveAttribute("readonly", "");
  await expect(vs).toHaveValue("20260456");
  // Varování = žlutý rámeček (aria-invalid je jen pro chyby).
  await expect(vs).toHaveClass(/border-warning/);
});
