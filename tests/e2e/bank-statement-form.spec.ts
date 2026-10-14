/** Výpis · vlastní chování ve skutečném panelu · nesmí kontrolovat zdrojový text. */
import { expect, test } from "@playwright/test";

for (const width of [960, 360]) {
  test(`BankStatementForm ${width}: číslo, rozdíl, Uložit a kontrola`, async ({ page }, info) => {
    await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(1);
    });
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
    await expect(save.locator(".lucide-save")).toBeVisible();
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
    await expect
      .poll(async () => {
        const bank = await amount.boundingBox();
        const opening = await form
          .getByRole("group", { name: "Počáteční zůstatek", exact: true })
          .boundingBox();
        return bank && opening ? Math.abs(bank.width - opening.width) : Infinity;
      })
      .toBeLessThan(2);
    const bankBox = await amount.boundingBox();
    const dateBox = await form.getByLabel("Datum výpisu", { exact: true }).boundingBox();
    const differenceBox = await difference.boundingBox();
    expect(bankBox).not.toBeNull();
    expect(dateBox).not.toBeNull();
    expect(differenceBox).not.toBeNull();
    if (bankBox && dateBox && differenceBox) {
      if (width === 960) {
        expect(bankBox.x).toBeGreaterThan(dateBox.x + dateBox.width);
        expect(Math.abs(bankBox.y - dateBox.y)).toBeLessThan(2);
        expect(bankBox.x - (differenceBox.x + differenceBox.width)).toBeLessThan(14);
      } else {
        expect(bankBox.y).toBeGreaterThan(dateBox.y + dateBox.height);
      }
    }
    await info.attach(`Rozměry výpisu ${width}`, {
      body: await form.screenshot(),
      contentType: "image/png",
    });
    await amount.fill("12500");
    await expect(difference).toHaveCount(0);
    await save.click();
    await expect(save).toBeDisabled();
    await form.getByRole("button", { name: "Zkontrolovat", exact: true }).click();
    await expect(form.getByText("Zkontrolovaný", { exact: true })).toBeVisible();
    await expect(save).toHaveAttribute("aria-disabled", "true");
    await save.focus();
    await save.press("Enter");
    await expect(
      page.getByRole("tooltip").filter({ hasText: "Výpis je zkontrolovaný" }).first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");
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
  await page.goto("/components/accounting-forms", {
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

for (const width of [960, 360]) {
  test(`BankStatementForm EUR ${width}: stejné šířky obou měn a typografie identity`, async ({
    page,
  }, info) => {
    await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
    await page.evaluate(async () => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(1);
    });
    const showcase = page.getByTestId("bank-showcase");
    await expect(showcase).toHaveAttribute("data-ready", "true");
    await showcase.getByRole("button", { name: "eur", exact: true }).click();
    const panels = page.getByTestId("bank-panels");
    await panels.evaluate((node, size) => {
      node.style.width = `${size}px`;
    }, width);
    const form = panels.locator('[data-slot="bank-statement-form"]').first();
    const fields = form.getByRole("group", { name: "Zůstatek dle banky", exact: true });
    const foreign = form.getByRole("textbox", { name: "Zůstatek dle banky", exact: true });
    await expect
      .poll(async () => {
        const a = await foreign.boundingBox();
        const b = await fields.boundingBox();
        return a && b ? Math.abs(a.width - b.width) : Infinity;
      })
      .toBeLessThan(2);
    const number = form.getByRole("textbox", { name: "Číslo výpisu", exact: true });
    const font = await number.evaluate((node) => getComputedStyle(node).fontSize);
    const identityFont = await number.evaluate(
      (node) => getComputedStyle(node.parentElement ?? node).fontSize,
    );
    expect(font).toBe(identityFont);
    await form.getByRole("button", { name: "Zkontrolovat", exact: true }).click();
    const locked = form.getByRole("group", { name: "Číslo výpisu", exact: true });
    expect(await locked.evaluate((node) => getComputedStyle(node).fontSize)).toBe(font);
    const lock = locked.getByRole("button");
    const lockSize = await lock.boundingBox();
    expect(lockSize?.width).toBe(16);
    expect(lockSize?.height).toBe(16);
    await info.attach(`EUR výpis ${width}`, {
      body: await form.screenshot(),
      contentType: "image/png",
    });
  });
}
