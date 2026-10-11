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
    name: "Hotovostní platba nepoužívá bankovní účet",
  });
  await expect(toggle).toBeDisabled();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(received.locator("#document-constantSymbol")).toHaveCount(0);
  await expect(received.locator("#document-specificSymbol")).toHaveCount(0);
  const reason = received.getByTitle("Hotovostní platba nepoužívá bankovní účet");
  await received.evaluate((el) => {
    el.style.width = "360px";
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
