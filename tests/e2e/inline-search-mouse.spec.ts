/** 2.113.1 · výběr položky myší v hledání přímo v poli (KS, partner, účet, bankovní účet). */
import { expect, test, type Locator, type Page } from "@playwright/test";

async function open(page: Page, url: string) {
  await page.goto(url, { waitUntil: "networkidle" });
  // readyState a __reactProps mohou existovat ještě před dokončením hydratace celé ukázky.
  // Čekáme na její commit, nikoli opakovaným klikáním, které by nabídku zase zavřelo.
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
}

/** Čeká, až React připojí obsluhu k poli (klik před hydratací by se ztratil). */
async function hydrated(trigger: Locator) {
  await expect
    .poll(() =>
      trigger.evaluate((node) => Object.keys(node).some((key) => key.startsWith("__reactProps"))),
    )
    .toBe(true);
}

/** Klikne myší na pole a pak na položku nabídky; hodnota se musí vybrat a nabídka zavřít. */
async function pickWithMouse(page: Page, trigger: Locator, option: RegExp) {
  await hydrated(trigger);
  await trigger.click();
  const input = page.locator("[cmdk-input]");
  await expect(input).toBeVisible();
  const item = page.locator("[cmdk-item]").filter({ hasText: option }).first();
  await item.click();
  await expect(input).toHaveCount(0);
  await expect(trigger).toContainText(option);
  await expect(trigger).toBeFocused();
}

test("KS a bankovní účet: klik myší vybere položku", async ({ page }) => {
  await open(page, "/components/accounting-controls");
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  const ks = page
    .getByTestId("selection-comparison")
    .getByRole("combobox", { name: "Konstantní symbol" })
    .nth(1);
  await pickWithMouse(page, ks, /0008/);
  const bank = page
    .getByTestId("form-with-supplier")
    .getByRole("combobox", { name: "Bankovní účet" });
  await hydrated(bank);
  await bank.click();
  const first = page.locator("[cmdk-item]").filter({ hasText: /\d+\/\d{4}|[A-Z]{2}\d{2}/ });
  const text = ((await first.first().textContent()) ?? "").match(/\d+\/\d{4}/)?.[0] ?? "";
  await page.keyboard.press("Escape");
  await expect(page.locator("[cmdk-input]")).toHaveCount(0);
  await pickWithMouse(page, bank, new RegExp(text.replace("/", "\\/")));
});

test("partner: klik myší vybere položku", async ({ page }) => {
  await open(page, "/components/accounting-fields");
  const partner = page.getByRole("combobox", { name: "Partner", exact: true }).first();
  await pickWithMouse(page, partner, /Alfa/);
});

test("účet: klik myší vybere položku", async ({ page }) => {
  await open(page, "/components/accounting-fields");
  const account = page
    .locator("button[role=combobox]")
    .filter({ hasText: /^\d+ – / })
    .first();
  await account.click();
  const before = (await account.textContent()) ?? "";
  const items = page.locator("[cmdk-item]:not([data-disabled=true])");
  const texts = await items.allTextContents();
  const label = texts.map((t) => t.trim()).find((t) => t && !before.includes(t)) ?? "";
  const name = label.split(/\s+/)[0] ?? "";
  await page.keyboard.press("Escape");
  await pickWithMouse(page, account, new RegExp(`^${name}`));
});
