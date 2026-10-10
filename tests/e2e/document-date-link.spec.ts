import { expect, test } from "@playwright/test";

test("svázané datum se kliknutím odemkne a dostane fokus", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const section = page.getByText("Pokladna – výdej kurýrovi bez partnera").locator("..");
  const unlock = section.getByRole("button", {
    name: "Stejné jako datum vystavení – klikněte pro úpravu",
  });
  await expect(unlock).toHaveAttribute("aria-pressed", "true");
  await expect(section.getByRole("button", { name: "Otevřít kalendář" })).toHaveCount(2);
  // Velká stránka: klik před hydratací nic neudělá, proto opakujeme až do odezvy.
  await expect(async () => {
    if ((await unlock.count()) > 0) await unlock.click();
    await expect(
      section.getByRole("button", { name: "Znovu svázat s datem vystavení" }),
    ).toHaveAttribute("aria-pressed", "false", { timeout: 1000 });
  }).toPass({ timeout: 30_000 });
  await expect(section.locator("#document-accountingDate")).toBeFocused();
  await expect(section.getByRole("button", { name: "Otevřít kalendář" })).toHaveCount(3);
});
