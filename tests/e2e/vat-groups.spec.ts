/** Skupiny DPH v editoru řádků · skutečná ukázka na stránce účetních formulářů. */
import { expect, test, type Locator } from "@playwright/test";

const height = (locator: Locator) =>
  locator.evaluate((element) => element.getBoundingClientRect().height);

/** Klik s opakováním: velká stránka po hydrataci ještě přepočítává šířky a posouvá prvky. */
async function clickUntil(target: Locator, done: () => Promise<void>) {
  await expect(async () => {
    await target.scrollIntoViewIfNeeded();
    await target.click();
    await done();
  }).toPass({ timeout: 30_000 });
}

test.describe.configure({ timeout: 180_000 });

test.beforeEach(async ({ page }) => {
  await page.goto("/components/accounting-lines", { waitUntil: "networkidle" });
  // Ukázka se připojí až při posunu k ní (po hydrataci stránky).
  const heading = page.getByRole("heading", { name: "Skupiny DPH (2.109.0)" });
  await expect(async () => {
    await heading.scrollIntoViewIfNeeded();
    await expect(page.getByTestId("vat-groups-showcase")).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 30_000 });
  // Velká stránka hydratuje několik sekund; interakce až s Reactem na tlačítkách ukázky.
  await page.waitForFunction(
    () => {
      const node = document.querySelector(
        '[data-testid="vat-groups-eur"] [data-slot="journal-vat-reset"]',
      );
      return Boolean(node && Object.keys(node).some((key) => key.startsWith("__react")));
    },
    undefined,
    { timeout: 120_000 },
  );
});

test("řádek rekapitulace má stejnou výšku s chybou i bez", async ({ page }) => {
  const eurRoot = page.getByTestId("vat-groups-eur");
  const eur = eurRoot.locator('[data-slot="journal-vat-group"]');
  const fv = page.getByTestId("vat-groups-fv").locator('[data-slot="journal-vat-group"]').first();
  await expect(eur.locator("[data-warning]")).toBeVisible();
  await clickUntil(eurRoot.locator('[data-slot="journal-vat-reset"]'), () =>
    expect(eur.locator("[data-warning]")).toHaveCount(0, { timeout: 1000 }),
  );
  expect(Math.abs((await height(eur)) - (await height(fv)))).toBeLessThan(1);
});

test("pomocník Cena s DPH vyplní základ", async ({ page }) => {
  const fp = page.getByTestId("vat-groups-fp");
  const input = page.getByLabel("Částka s DPH (21 %)");
  await clickUntil(fp.locator('[data-slot="journal-gross-helper"]').first(), () =>
    expect(input).toBeVisible({ timeout: 1000 }),
  );
  await input.fill("121");
  await page
    .locator('[data-slot="journal-gross-helper-content"]')
    .getByRole("button", { name: "Použít" })
    .click();
  await expect(fp.locator('[data-slot="journal-vat-group"]')).toContainText("100,00");
});

test("Dorovnat DPH zapíše přepis skupiny a vyrovná rozdíl", async ({ page }) => {
  const fp = page.getByTestId("vat-groups-fp");
  const actions = fp.locator('[data-slot="journal-difference-actions"]');
  await expect(actions).toHaveAttribute("data-preferred", "vat");
  const item = page.locator('[data-action="vat"]');
  await clickUntil(actions, () => expect(item).toBeVisible({ timeout: 1000 }));
  await item.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("vat-groups-fp-overrides")).toContainText('"taxAmount":17.36');
  await expect(fp.locator('[data-slot="journal-lines-remaining"]')).toHaveCount(0);
});

test("Dorovnat základ vynuluje Rozdíl; u haléřového rozdílu se nenabízí", async ({ page }) => {
  const root = page.getByTestId("vat-groups-base");
  const item = page.locator('[data-action="base"]');
  await clickUntil(root.locator('[data-slot="journal-difference-actions"]'), () =>
    expect(item).toBeVisible({ timeout: 1000 }),
  );
  await item.focus();
  await page.keyboard.press("Enter");
  await expect(root.locator('[data-slot="journal-lines-remaining"]')).toHaveCount(0);
  await expect(root.locator('[data-slot="journal-vat-group"]')).toContainText("1 004,13");
  // 82,64 / cíl 100,00: žádný základ nedá přesně 100,00 → jen Dorovnat DPH.
  const fp = page.getByTestId("vat-groups-fp");
  await clickUntil(fp.locator('[data-slot="journal-difference-actions"]'), () =>
    expect(page.locator('[data-action="vat"]')).toBeVisible({ timeout: 1000 }),
  );
  await expect(page.locator('[data-action="base"]')).toHaveCount(0);
});
