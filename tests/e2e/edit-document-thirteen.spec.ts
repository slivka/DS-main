/** Edit 13 · skutečné klávesy, rozměry a bankovní výpisy ve třech prohlížečích. */
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });
test.setTimeout(240_000);
async function prepare(page: Page) {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  await expect(page.getByTestId("bank-showcase")).toHaveAttribute("data-ready", "true", {
    timeout: 60_000,
  });
}
async function zoom(page: Page, value: number) {
  await page.evaluate(async (next) => {
    const path = "/src/lib/app-zoom.ts";
    const module = await import(/* @vite-ignore */ path);
    module.setAppZoom(next);
  }, value);
}

test("přepínače mají jednotné rozměry, stálé názvy a klávesnici", async ({ page }, info) => {
  await prepare(page);
  const root = page.getByTestId("field-toggle-examples");
  const partner = root.locator('[data-slot="counterparty-input"]').first();
  const toggle = partner.getByRole("button", { name: "Vybrat z adresáře", exact: true });
  for (const scale of [0.7, 1, 1.25, 1.5, 2]) {
    await zoom(page, scale);
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const geometry = await partner.evaluate((node) => {
      const arrow = node.querySelector('[data-slot="select-chevron"]')?.getBoundingClientRect();
      const edit = node
        .querySelector('[data-slot="field-inline-actions"] button')
        ?.getBoundingClientRect();
      const button = node
        .querySelector('[data-slot="field-toggle-button"]')
        ?.getBoundingClientRect();
      const control = node.querySelector('[role="combobox"]')?.getBoundingClientRect();
      if (!arrow || !edit || !button || !control) throw new Error("Chybí měřené ikony");
      return {
        arrowGap: button.left - arrow.right,
        editGap: arrow.left - edit.right,
        inset: button.top - control.top,
        height: control.height - button.height,
      };
    });
    expect(geometry.arrowGap).toBeGreaterThan(0);
    expect(geometry.editGap).toBeGreaterThan(0);
    expect(geometry.inset).toBeGreaterThan(0);
    expect(geometry.height).toBeGreaterThan(0);
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(partner.getByRole("button", { name: "Upravit vybraný záznam" })).toHaveCount(0);
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  }
  const locked = root
    .locator('[data-slot="counterparty-input"]')
    .last()
    .getByRole("button", { name: "Vybrat z adresáře" });
  await locked.focus();
  await page.keyboard.press("Space");
  await expect(locked).toHaveAttribute("aria-pressed", "true");
  await expect(locked).toHaveAttribute("aria-disabled", "true");
  await locked.hover();
  await expect(page.getByRole("tooltip")).toContainText("Doklad je zařazen");
  const suggest = root.getByRole("button", {
    name: "Našeptávač z předchozích dokladů",
    exact: true,
  });
  await suggest.focus();
  await page.keyboard.press("Enter");
  await expect(suggest).toHaveAttribute("aria-pressed", "false");
  await page.keyboard.press("Space");
  await expect(suggest).toHaveAttribute("aria-pressed", "true");
  await root.getByRole("combobox", { name: "Popis" }).fill("Dop");
  await expect(page.getByRole("option", { name: "Doprava zásilky" })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(root.getByRole("combobox", { name: "Popis" })).toHaveValue("Doprava zásilky");
  await info.attach("Přepínače 200 %", { body: await root.screenshot(), contentType: "image/png" });
});

test("výpis uloží zůstatek, kontrola zamkne pole a položky zakážou odstranění", async ({
  page,
}, info) => {
  await prepare(page);
  const showcase = page.getByTestId("bank-showcase");
  const root = page.getByTestId("bank-panels");
  const form = root.locator('[data-slot="bank-statement-form"]').first();
  const difference = form.locator('[data-slot="bank-statement-difference"]');
  await expect(difference).toHaveText("");
  await form.getByLabel("Konečný zůstatek dle banky", { exact: true }).fill("12500");
  await expect(difference).toContainText("0,00");
  await expect(difference.getByRole("img", { name: "Zůstatek souhlasí" })).toBeVisible();
  await form.getByRole("button", { name: "Uložit", exact: true }).click();
  await expect(form.getByRole("button", { name: "Uložit", exact: true })).toBeDisabled();
  await expect(difference).toContainText("0,00");
  await form.getByRole("button", { name: "Zkontrolovat", exact: true }).click();
  await expect(form.getByText("Zkontrolovaný", { exact: true })).toBeVisible();
  await expect(form.getByRole("textbox", { name: "Poznámka", exact: true })).toHaveCount(0);
  await form.getByRole("button", { name: "Zrušit kontrolu", exact: true }).click();
  await expect(form.getByRole("textbox", { name: "Poznámka", exact: true })).toBeVisible();
  await showcase.getByRole("button", { name: "difference", exact: true }).click();
  await expect(difference).toContainText("−50,00");
  await showcase.getByRole("button", { name: "items", exact: true }).click();
  await expect(form.getByRole("textbox", { name: "Číslo výpisu", exact: true })).toHaveCount(0);
  await form.getByRole("button", { name: "Další akce", exact: true }).click();
  const remove = page.getByRole("menuitem", { name: /Odstranit/ });
  await expect(remove).toHaveAttribute("aria-disabled", "true");
  await expect(remove).toContainText("Výpis má položky");
  await page.keyboard.press("Escape");
  await info.attach("Výpis s položkami", {
    body: await form.screenshot(),
    contentType: "image/png",
  });
});

test("výpis v CS/SK, 70–200 %, 1/2/3 panelech a 360 px nezalamuje popisky", async ({
  page,
}, info) => {
  await prepare(page);
  const showcase = page.getByTestId("bank-showcase");
  const root = page.getByTestId("bank-panels");
  const results = [];
  for (const language of ["CS", "SK"]) {
    await showcase.getByRole("button", { name: language, exact: true }).click();
    for (const scale of [0.7, 1, 1.25, 1.5, 2]) {
      await zoom(page, scale);
      for (const count of [1, 2, 3, 0]) {
        await showcase
          .getByRole("button", { name: count ? `${count} panelů` : "360 px", exact: true })
          .click();
        await root.evaluate(
          (node, width) => {
            node.style.width = `${width}px`;
          },
          count ? 1920 : 360,
        );
        await expect(root.locator("[data-pane]")).toHaveCount(count || 1);
        const form = root.locator('[data-slot="bank-statement-form"]').first();
        await expect
          .poll(async () =>
            form.evaluate((node) => {
              const box = node.getBoundingClientRect();
              return [...node.querySelectorAll("label,input,[data-slot=field-value],button")].every(
                (el) => {
                  const rect = el.getBoundingClientRect();
                  return rect.right <= box.right + 2 && rect.left >= box.left - 2;
                },
              );
            }),
          )
          .toBe(true);
        const actions = form.getByRole("button", { name: "Uložit", exact: true });
        await expect(actions.locator("svg")).toBeHidden();
        const actionGap = await form.evaluate((node) => {
          const bar = node.querySelector('[data-slot="record-action-bar"]');
          const left = bar?.querySelector("div:first-child>button")?.getBoundingClientRect();
          const right = bar?.querySelector("div:last-child>button")?.getBoundingClientRect();
          if (!left || !right) throw new Error("Chybí akce výpisu");
          return right.top >= left.bottom || right.left >= left.right;
        });
        expect(actionGap).toBe(true);
        const metrics = await form.evaluate((node) => {
          const labels = [...node.querySelectorAll("label")].map((el) => {
            const style = getComputedStyle(el);
            return {
              text: el.textContent,
              nowrap: style.whiteSpace,
              height: el.getBoundingClientRect().height,
              line: parseFloat(style.lineHeight),
            };
          });
          const heights = [...node.querySelectorAll("input,[data-slot=field-value]")].map(
            (el) => el.getBoundingClientRect().height,
          );
          return { width: node.getBoundingClientRect().width, labels, heights };
        });
        for (const label of metrics.labels) {
          expect(label.nowrap).toBe("nowrap");
          expect(label.height).toBeLessThanOrEqual(label.line + 2);
        }
        expect(Math.max(...metrics.heights) - Math.min(...metrics.heights)).toBeLessThan(2);
        results.push({ language, scale, count, ...metrics });
      }
    }
  }
  await showcase.getByRole("button", { name: "eur", exact: true }).click();
  const form = root.locator('[data-slot="bank-statement-form"]').first();
  await expect(form.locator('[data-slot="bank-statement-difference"]')).toHaveCount(2);
  await expect(form.getByRole("heading", { name: "v Kč", exact: true })).toBeVisible();
  await info.attach("Měření všech výpisů", {
    body: JSON.stringify(results),
    contentType: "application/json",
  });
  await info.attach("Výpis EUR úzký 200 %", {
    body: await form.screenshot(),
    contentType: "image/png",
  });
});
