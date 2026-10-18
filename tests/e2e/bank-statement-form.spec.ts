/** Výpis · vlastní chování ve skutečném panelu · nesmí kontrolovat zdrojový text. */
import { expect, test, type Page } from "@playwright/test";

async function open(page: Page, scenario: string, width: number) {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const showcase = page.getByTestId("bank-showcase");
  await expect(showcase).toHaveAttribute("data-ready", "true", { timeout: 45000 });
  await page.evaluate(async () => {
    const path = "/src/lib/app-zoom.ts";
    const module = await import(/* @vite-ignore */ path);
    module.setAppZoom(1);
  });
  await showcase.getByRole("button", { name: scenario, exact: true }).click();
  const panels = page.getByTestId("bank-panels");
  await panels.evaluate((node, size) => {
    node.style.width = `${size}px`;
  }, width);
  return panels.locator('[data-slot="bank-statement-form"]').first();
}

for (const width of [960, 360]) {
  test(`BankStatementForm ${width}: pořadí polí, Σ zůstatku a varování rozdílu`, async ({
    page,
  }, info) => {
    const form = await open(page, "empty", width);
    const save = form.getByRole("button", { name: "Uložit", exact: true });
    await expect(save.locator(".lucide-save")).toHaveCount(0);
    await form.getByRole("textbox", { name: "Číslo výpisu" }).fill("2026/011");
    await expect(save).toBeEnabled();
    const sum = form.getByRole("button", { name: "Zůstatek z pohybů" });
    await expect(sum).toHaveAttribute("aria-pressed", "true");
    const closed = form.getByRole("group", { name: "Zůstatek na výpise", exact: true });
    const opening = form.getByRole("group", { name: "Počáteční zůstatek", exact: true });
    const date = form.getByLabel("Datum výpisu", { exact: true });
    const [c, o] = [await closed.boundingBox(), await opening.boundingBox()];
    expect(Math.abs((c?.height ?? 0) - (o?.height ?? 99))).toBeLessThan(1);
    await sum.click();
    const amount = form.getByRole("textbox", { name: "Zůstatek na výpise", exact: true });
    await expect(amount).toHaveValue(/12\s500,00/);
    await amount.fill("12550");
    await amount.blur();
    const notice = form.locator('[data-slot="bank-statement-difference-notice"]');
    await expect(notice).toContainText("Rozdíl proti pohybům 50,00 Kč");
    const bank = await amount.boundingBox();
    const dateBox = await date.boundingBox();
    if (bank && dateBox) {
      if (width === 960) expect(Math.abs(bank.y - dateBox.y)).toBeLessThan(2);
      else expect(bank.y).toBeGreaterThan(dateBox.y + dateBox.height);
      expect(bank.y >= dateBox.y).toBe(true);
    }
    await expect(form.locator('[data-slot="bank-statement-difference"]')).toHaveCount(0);
    await expect(form.getByText("Zůstatky dle pohybů")).toHaveCount(0);
    await info.attach(`Výpis ${width}`, { body: await form.screenshot(), contentType: "image/png" });
    await sum.click();
    await expect(notice).toHaveCount(0);
  });
}

test("BankStatementForm nový i uložený výpis mají stejný grid pohybů", async ({ page }) => {
  const created = await open(page, "empty", 960);
  await expect(created.getByRole("button", { name: "Nový příjem" })).toBeVisible();
  await expect(created.getByText("Pohyby lze zadat po uložení výpisu")).toHaveCount(0);
  await expect(created.getByRole("button", { name: /kontrol/i })).toHaveCount(0);
  const saved = await open(page, "equal", 960);
  await expect(saved.getByRole("button", { name: "Nový příjem" })).toBeVisible();
});

test("BankStatementForm dotyk vysvětlí zámek čísla", async ({ browser }) => {
  const context = await browser.newContext({ hasTouch: true, viewport: { width: 1280, height: 1800 } });
  const page = await context.newPage();
  const form = await open(page, "items", 960);
  await form.getByRole("button", { name: "Výpis má položky" }).tap();
  await expect(page.getByRole("tooltip").filter({ hasText: "Výpis má položky" }).first()).toBeVisible();
  await context.close();
});

test("BankStatementForm EUR: bez zůstatků v Kč a stejná typografie identity", async ({ page }) => {
  const form = await open(page, "eur", 960);
  await expect(form.getByText(/Zůstatky v/)).toHaveCount(0);
  const number = form.getByRole("textbox", { name: "Číslo výpisu", exact: true });
  const font = await number.evaluate((node) => getComputedStyle(node).fontSize);
  expect(await number.evaluate((node) => getComputedStyle(node.parentElement ?? node).fontSize)).toBe(font);
});
