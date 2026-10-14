/** Edit 13 · skutečné klávesy, rozměry a bankovní výpisy ve třech prohlížečích. */
import { nonTaxBaseline } from "./non-tax-baseline";
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });
// Matice 40 rozvržení a 18 referenčních ND měření potřebuje delší celkový běh.
// Jednotlivá očekávání používají běžný timeout a žádné opakování celého testu.
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
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
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
  const suggest = root
    .getByRole("combobox", { name: "Popis", exact: true })
    .locator("..")
    .getByRole("button", {
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
  await expect(difference).toHaveCount(0);
  await form.getByLabel("Zůstatek dle banky", { exact: true }).fill("12500");
  await expect(difference).toHaveCount(0);
  await form.getByRole("button", { name: /^(Uložit|Uložiť)$/ }).click();
  await expect(form.getByRole("button", { name: /^(Uložit|Uložiť)$/ })).toBeDisabled();
  await expect(difference).toHaveCount(0);
  await form.getByRole("button", { name: "Zkontrolovat", exact: true }).click();
  await expect(form.getByText("Zkontrolovaný", { exact: true })).toBeVisible();
  await expect(form.getByRole("textbox", { name: "Číslo výpisu", exact: true })).toHaveCount(0);
  await form.getByRole("button", { name: "Zrušit kontrolu", exact: true }).click();
  await expect(form.getByRole("textbox", { name: "Číslo výpisu", exact: true })).toBeVisible();
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
        await expect(actions.getByText(/^(Uložit|Uložiť)$/)).toBeVisible();
        await expect
          .poll(() =>
            form.locator('[data-slot="record-action-bar"]').evaluate((bar) => {
              const save = bar.querySelector(
                'button[aria-label="Uložit"],button[aria-label="Uložiť"]',
              );
              return save?.querySelector("span")?.classList.contains("sr-only") === false;
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
              title: el.title,
              overflow: style.overflow,
              ellipsis: style.textOverflow,
              width: el.getBoundingClientRect().width,
              field: el.closest("[data-slot=field]")?.getBoundingClientRect().width,
            };
          });
          const heights = [...node.querySelectorAll("input,[data-slot=field-value]")].map(
            (el) => el.getBoundingClientRect().height,
          );
          return { width: node.getBoundingClientRect().width, labels, heights };
        });
        for (const label of metrics.labels) {
          expect(label.title).toBe(label.text);
          expect(label.overflow).toBe("hidden");
          expect(label.ellipsis).toBe("ellipsis");
          if (label.field !== undefined) expect(label.width).toBeLessThanOrEqual(label.field + 0.5);
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
  await expect(form.locator('[data-slot="bank-statement-difference"]')).toHaveCount(0);
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
  await document.locator("input:not(:disabled):not([readonly])").first().fill("14.10.2026");
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
      await expect(save.getByText(/^(Uložit|Uložiť)$/)).toBeVisible();
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

test("přetékající grid nezakrývá ND prvního řádku a skutečný klik přepne stav", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  await prepare(page);
  await zoom(page, 1);
  const nd = page.locator('[data-slot="non-tax-toggle"]').first();
  const grid = nd.locator("xpath=ancestor::div[contains(@class,'zoom-grid')][1]");
  const editor = grid.locator("..");
  await editor.evaluate((node) => (node.style.width = "200px"));
  await expect(grid).toHaveAttribute("data-overflow", "true");
  await editor.locator(".zoom-value").first().focus();
  await page.keyboard.press("Enter");
  await expect
    .poll(() => grid.evaluate((node) => getComputedStyle(node).getPropertyValue("--grid-zoom")))
    .toBe("1");
  await expect(grid).toHaveAttribute("data-overflow", "true");
  await expect(grid).toHaveAttribute("data-sticky-header", "none");
  await nd.scrollIntoViewIfNeeded();
  expect(
    await nd.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit?.closest('[data-slot="non-tax-toggle"]') === node;
    }),
  ).toBe(true);
  const pressed = await nd.getAttribute("aria-pressed");
  await nd.click();
  await expect(nd).toHaveAttribute("aria-pressed", String(pressed !== "true"));
  await info.attach("ND po skutečném kliknutí v přetékajícím gridu", {
    body: await editor.screenshot(),
    contentType: "image/png",
  });
});

test("ND zachovává rozměry vydání 2.99.0", async ({ page }, info) => {
  await prepare(page);
  await page.evaluate(() => document.fonts.ready);
  const nd = page.locator('[data-slot="non-tax-toggle"]').first();
  const browser = info.project.name;
  if (browser !== "chromium" && browser !== "firefox" && browser !== "webkit")
    throw new Error("Chybí referenční prohlížeč");
  for (const expected of nonTaxBaseline(browser)) {
    await zoom(page, expected.app);
    if ((await nd.getAttribute("aria-pressed")) !== String(expected.pressed)) {
      // Referenční měření přepíná stav klávesnicí; skutečný klik ověřuje samostatný test.
      await nd.focus();
      await page.keyboard.press("Space");
    }
    await expect(nd).toHaveAttribute("aria-pressed", String(expected.pressed));
    // Lišta je vlastníkem zoomu; kolečko na třídě zoom-grid nemusí mít posluchač.
    const editor = nd.locator("xpath=ancestor::div[contains(@class,'@container')][1]");
    const reset = editor.locator(".zoom-value").first();
    await reset.click();
    const direction = expected.grid < 1 ? "Zmenšit tabulku" : "Zvětšit tabulku";
    for (let step = 0; step < Math.round(Math.abs(expected.grid - 1) * 10); step += 1)
      await editor.getByRole("button", { name: direction, exact: true }).click();
    await expect
      .poll(() =>
        nd.evaluate((n) => {
          const grid = n.closest(".zoom-grid");
          return grid ? Number(getComputedStyle(grid).getPropertyValue("--grid-zoom")) : 0;
        }),
      )
      .toBeCloseTo(expected.grid, 2);
    const measured = await nd.evaluate((n) => {
      const r = n.getBoundingClientRect(),
        s = getComputedStyle(n);
      const icon = n.querySelector("svg")?.getBoundingClientRect();
      return {
        width: r.width,
        height: r.height,
        icon: icon?.width ?? null,
        font: parseFloat(s.fontSize),
        weight: Number(s.fontWeight),
      };
    });
    for (const key of ["width", "height", "font"] as const)
      expect(
        Math.abs(measured[key] - expected[key]),
        `${browser} ${JSON.stringify(expected)} ${key}`,
      ).toBeLessThanOrEqual(0.5);
    expect(measured.weight).toBe(expected.weight);
    if (expected.icon !== null && measured.icon !== null)
      expect(Math.abs(measured.icon - expected.icon)).toBeLessThanOrEqual(0.5);
    else expect(measured.icon).toBe(expected.icon);
  }
});

test("Landmark Sigma History mají shodné vsazení a místní výška mění rezervu", async ({ page }) => {
  await prepare(page);
  for (const scale of [0.7, 1, 2]) {
    await zoom(page, scale);
    for (const icon of ["landmark", "sigma", "history", "contact-round"]) {
      const toggle = page
        .getByTestId("field-toggle-examples")
        .locator(`[data-slot="field-toggle-button"]:has(svg.lucide-${icon})`)
        .first();
      await page.getByTestId("field-toggle-examples").evaluate((n) => n.scrollIntoView());
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

test("zamčené Landmark Sigma History a vazba DPH mají správný vzhled a názvy", async ({ page }) => {
  await prepare(page);
  const root = page.getByTestId("field-toggle-examples");
  const reference = page.getByTestId("document-readonly").locator("input:disabled").first();
  const expected = await reference.evaluate((n) => {
    const s = getComputedStyle(n);
    return { background: s.backgroundColor, color: s.color, opacity: s.opacity };
  });
  for (const icon of ["landmark", "sigma", "history"]) {
    const toggle = root.locator(
      `[data-slot=field-toggle-button]:has(svg.lucide-${icon})[aria-disabled=true]`,
    );
    const actual = await toggle.evaluate((n) => {
      const s = getComputedStyle(n);
      return { background: s.backgroundColor, color: s.color, opacity: s.opacity };
    });
    expect(actual).toEqual(expected);
  }
  const dates = page.getByTestId("date-panels");
  await expect(dates).toHaveAttribute("data-ready", "true");
  await dates.getByRole("button", { name: "CS", exact: true }).click();
  await expect(dates.getByRole("button", { name: "CS", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    dates.getByRole("button", { name: "Svázat s DUZP", exact: true }).first(),
  ).toBeVisible();
  const slovak = dates.getByRole("button", { name: "SK", exact: true });
  await slovak.click();
  await expect(slovak).toHaveAttribute("aria-pressed", "true");
  await expect(
    dates.getByRole("button", { name: "Prepojiť s DUZP", exact: true }).first(),
  ).toBeVisible();
});

test("DocumentForm vlevo při 360 px a 200 % neprotéká tlačítkem", async ({ page }) => {
  await prepare(page);
  await zoom(page, 2);
  const root = page.getByTestId("form-design-two");
  await root.evaluate((n) => (n.style.width = "360px"));
  const buttons = root.locator("[data-slot=document-action-bar] > div:first-child button");
  for (const button of await buttons.all()) {
    const m = await button.evaluate((n) => ({
      scroll: n.scrollHeight,
      client: n.clientHeight,
      width: n.scrollWidth,
      available: n.clientWidth,
    }));
    expect(m.scroll).toBeLessThanOrEqual(m.client);
    expect(m.width).toBeLessThanOrEqual(m.available);
  }
});

// Vydání 2.99.0: Switch h-5 w-9 při kořeni 16 px; zoom násobí oba rozměry.
test("DPH Switch zachovává 20 × 36 px při 100 a 200 %", async ({ page }) => {
  await prepare(page);
  const control = page.getByTestId("form-design-two").getByRole("switch");
  for (const scale of [1, 2]) {
    await zoom(page, scale);
    await control.scrollIntoViewIfNeeded();
    const size = await control.evaluate((n) => {
      const r = n.getBoundingClientRect();
      return { width: r.width, height: r.height };
    });
    expect(Math.abs(size.width - 36 * scale)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(size.height - 20 * scale)).toBeLessThanOrEqual(0.5);
  }
});
