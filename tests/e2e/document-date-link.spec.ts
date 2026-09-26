import { expect, test } from "@playwright/test";

test("svázané datum se kliknutím odemkne a dostane fokus", async ({ page }) => {
  await page.goto("/components/accounting-forms");
  const section = page.getByText("Pokladna – výdej kurýrovi bez partnera").locator("..");
  const unlock = section.getByRole("button", { name: "Stejné jako datum vystavení – klikněte pro úpravu" });
  await expect(unlock).toHaveAttribute("aria-pressed", "true");
  await expect(section.getByRole("button", { name: "Otevřít kalendář" })).toHaveCount(2);
  await unlock.click();
  await expect(section.getByRole("button", { name: "Znovu svázat s datem vystavení" })).toHaveAttribute("aria-pressed", "false");
  await expect(section.locator("#document-accountingDate")).toBeFocused();
  await expect(section.getByRole("button", { name: "Otevřít kalendář" })).toHaveCount(3);
});