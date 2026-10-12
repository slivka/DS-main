/** Edit dokladu 11 · skutečné rozměry, pořadí a tooltipy při zoomu aplikace. */
import { expect, test } from "@playwright/test";
test.use({ viewport: { width: 1280, height: 1800 } });
test("kurzy a přijatý doklad při zoomu 70–200 %", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const issued = page.getByTestId("form-design-two");
  const received = page.getByTestId("edit-document-eleven-received");
  // SSR obsah je viditelný dříve než hydratace rozsáhlé stránky; ověříme skutečnou reakci.
  await expect(async () => {
    const same = issued.getByRole("checkbox", { name: "Stejný kurz DPH" });
    if ((await same.getAttribute("aria-checked")) !== "true") await same.click();
    await expect(issued.locator("#document-vat-rate")).toHaveCount(0, { timeout: 1000 });
  }).toPass();
  await issued.getByRole("checkbox", { name: "Stejný kurz DPH" }).click();
  await expect(issued.locator("#document-vat-rate")).toHaveCount(1);
  for (const zoom of [0.7, 1, 1.25, 1.5, 2]) {
    await page.evaluate(async (z) => {
      const path = "/src/lib/app-zoom.ts";
      const m = await import(/* @vite-ignore */ path);
      m.setAppZoom(z);
    }, zoom);
    for (const width of [360, 720, 750, 770, 800, 1600]) {
      for (const form of [issued, received])
        await form.evaluate((el, w) => {
          el.style.width = `${w}px`;
          el.style.maxWidth = "none";
        }, width);
      await expect(async () => {
        const boxes = await received.evaluate((el) => {
          const rect = (selector: string) => {
            const node = el.querySelector(selector);
            if (!node) throw new Error(selector);
            const r = node.getBoundingClientRect();
            return { x: r.x, y: r.y, right: r.right, width: r.width };
          };
          return {
            account: rect('[aria-label="Bankovní účet"]'),
            method: rect("#document-paymentMethodId"),
            description: rect("#document-description"),
            number: rect("#document-externalNumber"),
            ico: rect("#document-partner-ico"),
            dic: rect("#document-partner-dic"),
            rootSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
          };
        });
        // Kontejner formuláře určuje práh, nikoli viewport stránky.
        if (width < 40 * boxes.rootSize) {
          expect(boxes.method.y).toBeGreaterThan(boxes.account.y);
          expect(boxes.description.y).toBeGreaterThan(boxes.method.y);
          expect(boxes.number.y).toBeGreaterThan(boxes.description.y);
          expect(boxes.dic.y).toBeGreaterThan(boxes.ico.y);
          expect(boxes.number.x).toBeCloseTo(boxes.description.x, 0);
        } else {
          expect(boxes.method.y).toBeCloseTo(boxes.account.y, 0);
          expect(boxes.description.y).toBeCloseTo(boxes.number.y, 0);
          expect(boxes.account.x).toBeCloseTo(boxes.description.x, 0);
          expect(boxes.method.x).toBeCloseTo(boxes.number.x, 0);
        }
        expect(await issued.locator(".rate-field-hint").count()).toBe(0);
        for (const id of ["document-rate", "document-vat-rate"])
          await expect(issued.locator(`#${id}`)).toHaveAttribute("aria-describedby", /.+/);
      }).toPass();
    }
  }
  await page.evaluate(async () => {
    const path = "/src/lib/app-zoom.ts";
    const m = await import(/* @vite-ignore */ path);
    m.setAppZoom(1);
  });
  await issued.evaluate((el) => {
    el.style.width = "800px";
  });
  const rate = issued.locator("#document-rate");
  await rate.hover();
  await expect(page.getByRole("tooltip")).toContainText("ČNB 9. 10. 2026");
  await page.mouse.move(0, 0);
  await rate.focus();
  await expect(page.getByRole("tooltip")).toContainText("ČNB 9. 10. 2026");
  await rate.blur();
  await issued.getByRole("checkbox", { name: "Starší zdroj kurzu" }).click();
  await expect(issued.locator('[data-slot="rate-source-attention"]')).toHaveCount(1);
  // Ukázková stránka obsahuje více formulářů se stejnými interními id;
  // vazbu popisku měříme uvnitř konkrétní ukázky, nikoli přes globální id dokumentu.
  await received.locator("#document-paymentMethodId").click();
  await page.getByRole("option", { name: "Hotově", exact: true }).click();
  const toggle = received.getByRole("button", {
    name: "Platit příkazem",
  });
  await expect(toggle).toHaveAttribute("aria-disabled", "true");
  await toggle.focus();
  await expect(page.getByRole("tooltip")).toContainText(
    "Hotovostní platba nepoužívá bankovní účet",
  );
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(received.locator("#document-constantSymbol")).toHaveCount(0);
  await expect(received.locator("#document-specificSymbol")).toHaveCount(0);
  const reason = received
    .locator("[data-slot=field-value]")
    .filter({ hasText: "Hotovostní platba nepoužívá bankovní účet" });
  await expect(reason).not.toHaveAttribute("title");
  await received.evaluate((el) => {
    el.style.width = "280px";
  });
  const geometry = await reason.evaluate((el) => {
    const text = el.firstElementChild;
    const bank = el.parentElement?.querySelector("button");
    if (!text || !bank) throw new Error("Chybí důvod nebo přepínač");
    return {
      textRight: text.getBoundingClientRect().right,
      bankLeft: bank.getBoundingClientRect().left,
      scroll: text.scrollWidth,
      width: text.clientWidth,
    };
  });
  expect(geometry.textRight).toBeLessThanOrEqual(geometry.bankLeft);
  expect(geometry.scroll).toBeGreaterThan(geometry.width);
  await expect(reason.locator("svg")).toHaveCount(0);
  await reason.focus();
  await expect(page.getByRole("tooltip")).toHaveCount(1);
  await expect(page.getByRole("tooltip")).toContainText(
    "Hotovostní platba nepoužívá bankovní účet",
  );
});

test("ikony menu mají 1rem při zoomu a nepřekrývají text", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const form = page.getByTestId("form-design-two");
  for (const zoom of [0.7, 1, 2]) {
    await page.evaluate(async (z) => {
      const path = "/src/lib/app-zoom.ts";
      const m = await import(/* @vite-ignore */ path);
      m.setAppZoom(z);
    }, zoom);
    await expect(async () => {
      if (!(await page.getByRole("menuitem").first().isVisible()))
        await form.getByRole("button", { name: "Další akce" }).click();
      await expect(page.getByRole("menuitem").first()).toBeVisible({ timeout: 1000 });
    }).toPass();
    const icon = page.getByRole("menuitem").first().locator("svg");
    const box = await icon.boundingBox();
    const root = await page.evaluate(() =>
      parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
    expect(box?.width).toBeCloseTo(root, 0);
    expect(box?.height).toBeCloseTo(root, 0);
    await page.keyboard.press("Escape");
  }
});

test("reálný kurz odděluje ikonu zdroje, číslo a aktualizaci; aktualizace má jediný tooltip", async ({
  page,
}) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const form = page.getByTestId("form-design-two");
  await expect(async () => {
    const attention = form.getByRole("checkbox", { name: "Starší zdroj kurzu" });
    if ((await attention.getAttribute("aria-checked")) !== "true") await attention.click();
    await expect(form.locator('[data-slot="rate-source-attention"]')).toHaveCount(1, {
      timeout: 1000,
    });
  }).toPass();
  for (const zoom of [0.7, 1, 2]) {
    await page.evaluate(async (z) => {
      const path = "/src/lib/app-zoom.ts";
      const m = await import(/* @vite-ignore */ path);
      m.setAppZoom(z);
    }, zoom);
    const rate = form.locator("#document-rate");
    for (const real of ["24,365", "123,456"]) {
      await rate.fill("");
      await rate.fill(real);
      const parent = rate.locator("xpath=../..");
      const update = parent.getByRole("button");
      const geometry = await parent.evaluate((el) => {
        const input = el.querySelector("input");
        const icon = el.querySelector('[data-slot="rate-source-attention"]');
        const action = el.querySelector("button");
        if (!input || !icon || !action) throw new Error("Chybí kurz nebo ikony");
        const style = getComputedStyle(input);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Chybí měření textu");
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const box = input.getBoundingClientRect();
        const textRight =
          box.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth);
        return {
          zoom: parseFloat(getComputedStyle(document.documentElement).fontSize) / 16,
          iconRight: icon.getBoundingClientRect().right,
          textLeft: textRight - context.measureText(input.value).width,
          textRight,
          actionLeft: action.getBoundingClientRect().left,
          value: input.value,
          fontSize:
            parseFloat(style.fontSize) /
            parseFloat(getComputedStyle(document.documentElement).fontSize),
        };
      });
      expect(geometry.value.replace(/\s/g, "")).toContain(real);
      // Písmo se nezmenšuje: standardní text-sm = 0,875rem.
      expect(geometry.fontSize).toBeCloseTo(0.875, 2);
      expect(geometry.iconRight).toBeLessThanOrEqual(geometry.textLeft);
      expect(geometry.textRight).toBeLessThanOrEqual(geometry.actionLeft);
      // Standardní Tooltip po kliknutí do pole znovu otevře až nové najetí.
      await page.mouse.move(0, 0);
      await rate.hover();
      await expect(page.getByRole("tooltip")).toContainText("Ruční kurz");
      // Posun stránky při změně zoomu zavírá tooltipy; najetí se proto opakuje po ustálení.
      await expect(async () => {
        await page.mouse.move(0, 0);
        await update.hover();
        await expect(page.getByRole("tooltip")).toHaveCount(1, { timeout: 1500 });
      }).toPass();
      await expect(page.getByRole("tooltip")).toContainText("25,000");
      await update.click();
    }
  }
});
