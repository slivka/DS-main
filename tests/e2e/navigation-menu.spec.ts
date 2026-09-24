import { expect, test } from "@playwright/test";

test.describe("AppShell menu 2.15.0", () => {
  test("hledá bez diakritiky, pamatuje skupiny a ovládá se klávesnicí", async ({ page }) => {
    await page.goto("/components/navigation");
    const expand = page.getByRole("button", { name: "Rozbalit menu" });
    if (await expand.isVisible()) await expand.click();

    await page.keyboard.press("/");
    const search = page.getByRole("textbox", { name: "Hledat v menu…" }).first();
    await expect(search).toBeFocused();
    await search.fill("ucet denik");
    await expect(page.getByRole("link", { name: "Účetní deník" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Přehled" })).toHaveCount(0);

    await search.press("Escape");
    await expect(search).toHaveValue("");
    await search.press("Escape");
    await expect(search).not.toBeFocused();

    const accounting = page.getByRole("button", { name: "Účetnictví" }).first();
    await accounting.click();
    await expect.poll(() => page.evaluate(() => localStorage.getItem("ds:nav-groups:showcase:accounting"))).toBe("true");
    await page.reload();
    await expect(page.getByRole("button", { name: "Účetnictví" }).first()).toHaveAttribute("aria-expanded", "false");
  });

  test("sbalené menu otevře hledání v překryvu", async ({ page }) => {
    await page.goto("/components/navigation");
    const collapse = page.getByRole("button", { name: "Sbalit menu" });
    if (await collapse.isVisible()) await collapse.click();
    await page.keyboard.press("/");
    await expect(page.locator(".shell-sidebar.fixed")).toBeVisible();
    await expect(page.locator(".shell-sidebar.fixed").getByRole("textbox", { name: "Hledat v menu…" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator(".shell-sidebar.fixed")).toBeHidden();
  });

  test("mobilní menu obsahuje stejné hledání", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/components/navigation");
    await page.getByRole("button", { name: "Menu" }).click();
    const sheet = page.getByRole("dialog");
    await expect(sheet.getByRole("textbox", { name: "Hledat v menu…" })).toBeVisible();
    await sheet.getByRole("textbox", { name: "Hledat v menu…" }).fill("ucet");
    await expect(sheet.getByRole("link", { name: "Účetní deník" })).toBeVisible();
  });

  test("firma a období jsou jednořádkové a mají stavové údaje", async ({ page }) => {
    await page.goto("/components/navigation");
    const company = page.getByRole("button", { name: "Firma" }).first();
    const period = page.getByRole("button", { name: "Účetní období" }).first();
    await expect(company).toContainText("Slivka Accounting s.r.o.");
    await expect(period).toContainText("Rok 2026");
    await expect(company.locator('[data-slot="context-pill-label"]')).toHaveCount(0);
    await expect(period.locator("svg.lucide-chevron-down")).toBeVisible();
  });
});