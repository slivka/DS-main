/** Edit 13 · skutečné klávesy, rozměry a bankovní výpisy ve třech prohlížečích. */
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });
test.setTimeout(480_000);
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
  await form.getByRole("button", { name: /^(Uložit|Uložiť)$/ }).click();
  await expect(form.getByRole("button", { name: /^(Uložit|Uložiť)$/ })).toBeDisabled();
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
        const actions = form.getByRole("button", { name: /^(Uložit|Uložiť)$/ });
        await expect(actions.locator("svg")).toBeVisible();
        await expect
          .poll(() =>
            form.locator('[data-slot="record-action-bar"]').evaluate((bar) => {
              const save = bar.querySelector(
                'button[aria-label="Uložit"],button[aria-label="Uložiť"]',
              );
              const compact = bar.getBoundingClientRect().width < 640;
              return save?.querySelector("span")?.classList.contains("sr-only") === compact;
            }),
          )
          .toBe(true);
        await expect(actions).toHaveAttribute("aria-label", /^(Uložit|Uložiť)$/);
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
              scroll: el.scrollWidth,
              client: el.clientWidth,
            };
          });
          const heights = [...node.querySelectorAll("input,[data-slot=field-value]")].map(
            (el) => el.getBoundingClientRect().height,
          );
          return { width: node.getBoundingClientRect().width, labels, heights };
        });
        for (const label of metrics.labels) {
          expect(label.scroll, label.text ?? "").toBeLessThanOrEqual(label.client);
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
  await expect(form.getByRole("heading", { name: "Zostatky v Kč", exact: true })).toBeVisible();
  await info.attach("Měření všech výpisů", {
    body: JSON.stringify(results),
    contentType: "application/json",
  });
  await info.attach("Výpis EUR úzký 200 %", {
    body: await form.screenshot(),
    contentType: "image/png",
  });
});

test("Uložit odpovídá dokladu a během ukládání má spinner", async ({ page }) => {
  await prepare(page);
  await page.getByTestId("bank-panels").locator("input").first().fill("13.10.2026");
  const bank = page.getByTestId("bank-panels").locator('[data-slot="bank-statement-form"]').first();
  const document = page.getByTestId("form-design-two");
  for (const width of [900, 360]) {
    await page.getByTestId("bank-panels").evaluate((n, w) => {
      n.style.width = `${w}px`;
    }, width);
    await document.evaluate((n, w) => {
      n.style.width = `${w}px`;
    }, width);
    for (const form of [bank, document]) {
      const bar = form
        .locator('[data-slot="record-action-bar"],[data-slot="document-action-bar"]')
        .first();
      const save = bar.getByRole("button", { name: /^(Uložit|Uložiť)$/ });
      await expect(save.locator("svg")).toBeVisible();
      const compact = await bar.evaluate((n) => n.getBoundingClientRect().width < 640);
      await expect(save.locator("span").first()).toHaveClass(
        compact ? /sr-only/ : /^(?!.*sr-only)/,
      );
      if (compact) {
        await save.scrollIntoViewIfNeeded();
        await save.hover({ force: true });
        await expect(page.getByRole("tooltip")).toContainText("Uložit");
        await page.mouse.move(0, 0);
      }
    }
  }
  await page
    .getByTestId("bank-showcase")
    .getByRole("button", { name: "busy", exact: true })
    .click();
  await expect(
    bank.getByRole("button", { name: /^(Uložit|Uložiť)$/ }).locator(".lucide-loader-circle"),
  ).toBeVisible();
});

test("ND zachovává rozměry vydání 2.99.0 při 70/100/200 %", async ({ page }, info) => {
  await prepare(page);
  const nd = page
    .getByRole("button", { name: "Nedaňový řádek", exact: true })
    .filter({ has: page.locator("svg") })
    .first();
  const results = [];
  for (const scale of [0.7, 1, 2]) {
    await zoom(page, scale);
    const m = await nd.evaluate((n) => {
      const rect = n.getBoundingClientRect();
      const icon = n.querySelector("svg")?.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        icon: icon?.width,
        root: parseFloat(getComputedStyle(document.documentElement).fontSize),
        weight: getComputedStyle(n).fontWeight,
      };
    });
    expect(m.width).toBeCloseTo((24 * m.root) / 16, 0);
    expect(m.height).toBeCloseTo((24 * m.root) / 16, 0);
    expect(m.icon).toBeCloseTo((14 * m.root) / 16, 0);
    expect(Number(m.weight)).toBe(700);
    results.push({ scale, ...m });
  }
  await info.attach("ND proti 24/24/14 px", {
    body: JSON.stringify(results),
    contentType: "application/json",
  });
});

test("Landmark Sigma History mají shodné vsazení a místní výška mění rezervu", async ({ page }) => {
  await prepare(page);
  for (const scale of [0.7, 1, 2]) {
    await zoom(page, scale);
    for (const icon of ["landmark", "sigma", "history", "contact-round"]) {
      const toggle = page
        .locator(`[data-slot="field-toggle-button"]:has(svg.lucide-${icon})`)
        .first();
      const m = await toggle.evaluate((n) => {
        const parent = n.parentElement;
        const control = parent?.querySelector("input,[role=combobox],[data-slot=field-value]");
        if (!control) throw new Error("Chybí pole");
        const a = n.getBoundingClientRect();
        const b = control.getBoundingClientRect();
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        return { inset: a.top - b.top, size: a.height, control: b.height, rem };
      });
      expect(m.inset).toBeCloseTo(m.rem / 4, 0);
      expect(m.size).toBeCloseTo(m.control - m.rem / 2, 0);
    }
  }
  const scope = page.getByTestId("field-toggle-examples");
  await scope.evaluate((n) => n.style.setProperty("--control-h", "3rem"));
  const reserve = await scope
    .locator('[data-slot="counterparty-input"]')
    .first()
    .evaluate((n) => {
      const control = n.querySelector('[role="combobox"]');
      if (!control) throw new Error("Chybí pole");
      const style = getComputedStyle(control);
      return {
        padding: parseFloat(style.paddingRight),
        rem: parseFloat(getComputedStyle(document.documentElement).fontSize),
      };
    });
  expect(reserve.padding).toBeCloseTo(7 * reserve.rem, 0);
  const locked = scope.locator('[data-slot="counterparty-input"]').last();
  const styles = await locked.evaluate((n) => {
    const input = document.querySelector('[data-testid="document-readonly"] input:disabled');
    const button = n.querySelector('[data-slot="field-toggle-button"]');
    if (!input || !button) throw new Error("Chybí zamčené pole");
    const a = getComputedStyle(input),
      b = getComputedStyle(button);
    return {
      background: [a.backgroundColor, b.backgroundColor],
      color: [a.color, b.color],
      opacity: b.opacity,
    };
  });
  expect(styles.background[0]).toBe(styles.background[1]);
  expect(styles.color[0]).toBe(styles.color[1]);
  expect(styles.opacity).toBe("1");
});
