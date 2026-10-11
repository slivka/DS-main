/** Schválené kurzové řádky a konkrétní potvrzení odchodu při aplikačním zoomu. */
import { expect, test } from "@playwright/test";
test.use({ viewport: { width: 1280, height: 1800 } });
test("kurzy vlevo/pod celkem, shodná výška, rekapitulace a způsob platby", async ({ page }) => {
  test.setTimeout(300_000);
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const form = page.getByTestId("form-design-two");
  for (const zoom of [0.7, 1, 1.25, 1.5, 2]) {
    await page.evaluate(async (z) => {
      const path = "/src/lib/app-zoom.ts";
      const m = await import(/* @vite-ignore */ path);
      m.setAppZoom(z);
    }, zoom);
    for (const width of [360, 640, 1600]) {
      await form.evaluate((el, w) => {
        el.style.width = `${w}px`;
        el.style.maxWidth = "none";
      }, width);
      await expect(async () => {
        const boxes = await form.evaluate((el) => {
          const rect = (s: string) => {
            const n = el.querySelector(s);
            if (!n) throw new Error(s);
            const r = n.getBoundingClientRect();
            return { x: r.x, y: r.y, height: r.height, width: r.width, right: r.right };
          };
          return {
            rate: rect("#document-rate"),
            vat: rect("#document-vat-rate"),
            total: rect("#document-amountTotal"),
            pair: rect('[data-slot="document-total-currency-pair"]'),
            rates: rect('[data-slot="document-foreign-amounts"]'),
            section: rect('[data-section="document-amount-section"]'),
            method: rect("#document-paymentMethodId"),
            account: rect("#document-companyBankAccountId"),
          };
        });
        expect(Math.abs(boxes.rate.height - boxes.total.height)).toBeLessThan(0.6);
        expect(Math.abs(boxes.vat.width - boxes.rate.width)).toBeLessThan(0.6);
        expect(Math.abs(boxes.vat.y - boxes.rate.y)).toBeLessThan(0.6);
        expect(boxes.rates.x).toBeCloseTo(boxes.section.x, 0);
        if (width === 1600) expect(Math.abs(boxes.rate.y - boxes.total.y)).toBeLessThan(0.6);
        else if (boxes.rate.y !== boxes.total.y)
          expect(boxes.rate.y).toBeGreaterThan(boxes.total.y);
        expect(boxes.rates.right).toBeLessThanOrEqual(boxes.section.right + 0.6);
        if (width === 360) expect(boxes.account.y).toBeGreaterThan(boxes.method.y);
      }).toPass();
    }
  }
  await page.evaluate(async () => {
    const path = "/src/lib/app-zoom.ts";
    const m = await import(/* @vite-ignore */ path);
    m.setAppZoom(1);
  });
  await form.evaluate((el) => {
    el.style.width = "1100px";
  });
  await expect(form.locator("#document-total-home")).toHaveCount(0);
  await expect(form.locator('[data-slot="journal-recap-home-total"]')).toContainText("30 250,00");
  await expect(form.getByLabel("Způsob platby")).toHaveCount(1);
  await form.getByRole("checkbox", { name: "Stejný kurz DPH" }).click();
  await expect(form.locator("#document-vat-rate")).toHaveCount(0);
  await form.getByLabel("Způsob platby").click();
  await page.getByRole("option", { name: "Hotově" }).click();
  await expect(form.locator("#document-companyBankAccountId")).toHaveAttribute(
    "data-slot",
    "field-value",
  );
});
test("dialogy pojmenují akci, návrat má fokus a úzká tlačítka se nepřekrývají", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/components/navigation", { waitUntil: "networkidle" });
  const showcase = page.getByTestId("unsaved-actions-showcase");
  for (const name of [
    "Zavřít záložku s neuloženými změnami?",
    "Přepnout s neuloženými změnami?",
    "Odhlásit se s neuloženými změnami?",
    "Odejít s neuloženými změnami?",
  ]) {
    await showcase.getByRole("button", { name, exact: true }).click();
    const dialog = page.getByRole("alertdialog");
    await expect(dialog.getByRole("heading")).toHaveText(name);
    await expect(dialog.getByRole("button", { name: /^Zpět/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  }
  for (const zoom of [0.7, 1, 1.25, 1.5, 2]) {
    await page.evaluate(async (z) => {
      const path = "/src/lib/app-zoom.ts";
      const m = await import(/* @vite-ignore */ path);
      m.setAppZoom(z);
    }, zoom);
    await showcase
      .getByRole("button", { name: "Přepnout s neuloženými změnami?", exact: true })
      .click();
    const dialog = page.getByRole("alertdialog");
    await dialog.evaluate((el) => {
      el.style.width = "360px";
    });
    const boxes = await dialog.evaluate((el) => {
      const d = el.getBoundingClientRect();
      return [...el.querySelectorAll("button")].map((b) => {
        const r = b.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, bound: d.right };
      });
    });
    for (const b of boxes) expect(b.right).toBeLessThanOrEqual(b.bound + 0.6);
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        if (!a || !b) throw new Error("Tlačítko chybí");
        expect(
          a.bottom <= b.top || b.bottom <= a.top || a.right <= b.left || b.right <= a.left,
        ).toBe(true);
      }
    await page.keyboard.press("Escape");
  }
});
