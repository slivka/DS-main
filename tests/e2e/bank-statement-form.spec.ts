/** Výpis · vlastní chování ve skutečném panelu · nesmí kontrolovat zdrojový text. */
import { expect, test } from "@playwright/test";

for (const width of [960, 360]) {
  test(`BankStatementForm ${width}: číslo, rozdíl, Uložit a kontrola`, async ({ page }, info) => {
    await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
    const showcase = page.getByTestId("bank-showcase");
    await expect(showcase).toHaveAttribute("data-ready", "true");
    await showcase
      .getByRole("button", { name: width === 360 ? "360 px" : "1 panelů", exact: true })
      .click();
    const panels = page.getByTestId("bank-panels");
    await panels.evaluate((node, size) => {
      node.style.width = `${size}px`;
    }, width);
    const form = panels.locator('[data-slot="bank-statement-form"]').first();
    const save = form.getByRole("button", { name: "Uložit", exact: true });
    await expect(save.getByText("Uložit", { exact: true })).toBeVisible();
    await expect(save).toBeDisabled();
    const identity = form.locator('[data-slot="bank-statement-identity"]');
    await identity.getByRole("textbox", { name: "Číslo výpisu" }).fill("2026/011");
    await expect(save).toBeEnabled();
    await expect(form.getByRole("textbox", { name: "Poznámka" })).toHaveCount(0);
    const difference = form.locator('[data-slot="bank-statement-difference"]');
    await expect(difference).toHaveCount(0);
    const amount = form.getByLabel("Zůstatek dle banky", { exact: true });
    await amount.fill("12550");
    await expect(difference).toHaveText("Rozdíl 50,00 Kč");
    await amount.fill("12500");
    await expect(difference).toHaveCount(0);
    await save.click();
    await expect(save).toBeDisabled();
    await form.getByRole("button", { name: "Zkontrolovat", exact: true }).click();
    await expect(form.getByText("Zkontrolovaný", { exact: true })).toBeVisible();
    await expect(identity.getByRole("textbox", { name: "Číslo výpisu" })).toHaveCount(0);
    await identity.getByRole("button", { name: "Výpis je zkontrolovaný" }).click();
    await expect(
      page.getByRole("tooltip").filter({ hasText: "Výpis je zkontrolovaný" }).first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await form.getByRole("button", { name: "Zrušit kontrolu", exact: true }).click();
    await expect(identity.getByRole("textbox", { name: "Číslo výpisu" })).toHaveValue("2026/011");
    await showcase.getByRole("button", { name: "difference", exact: true }).click();
    await expect(difference).toHaveText("Rozdíl −50,00 Kč");
    await form.scrollIntoViewIfNeeded();
    await info.attach(`Výpis ${width}`, {
      body: await form.screenshot(),
      contentType: "image/png",
    });
    await showcase.getByRole("button", { name: "busy", exact: true }).click();
    await expect(save.getByText("Uložit…", { exact: true })).toBeVisible();
    await expect(save.locator(".lucide-loader-circle")).toBeVisible();
    await expect(save).toBeDisabled();
  });
}

test("BankStatementForm dotyk ukáže vysvětlení kontroly a zámku", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 1280, height: 1800 },
  });
  const page = await context.newPage();
  await page.goto("http://localhost:8080/components/accounting-forms", {
    waitUntil: "networkidle",
  });
  const showcase = page.getByTestId("bank-showcase");
  await expect(showcase).toHaveAttribute("data-ready", "true");
  await showcase.getByRole("button", { name: "items", exact: true }).click();
  const form = page.getByTestId("bank-panels").locator('[data-slot="bank-statement-form"]').first();
  await form.getByRole("button", { name: "Výpis má položky" }).tap();
  await expect(
    page.getByRole("tooltip").filter({ hasText: "Výpis má položky" }).first(),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await form.getByRole("button", { name: "Zkontrolovat", exact: true }).tap();
  await expect(
    page.getByRole("tooltip").filter({ hasText: "Potvrdí, že výpis souhlasí" }).first(),
  ).toBeVisible();
  await expect(form.getByText("Zkontrolovaný", { exact: true })).toBeVisible();
  await context.close();
});
