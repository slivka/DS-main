/** Skutečné rozměry formulářů a samostatných ikon při aplikačním zoomu. */
import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });

async function setChecked(page: Page, checked: boolean) {
  const toggle = page.getByRole("checkbox", { name: "Měnu nelze změnit" });
  await expect(async () => {
    if ((await toggle.getAttribute("aria-checked")) !== String(checked)) await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", String(checked), { timeout: 1000 });
  }).toPass();
}

async function zoom(page: Page, value: number) {
  await page.evaluate(async (z) => {
    const modulePath = "/src/lib/app-zoom.ts";
    const module = await import(/* @vite-ignore */ modulePath);
    module.setAppZoom(z);
  }, value);
  await page.waitForTimeout(200);
}

test("měna nemění rozměry ani polohu při zamčení", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  await zoom(page, 1);
  const section = page.getByTestId("form-with-supplier");
  await page.waitForTimeout(1000);
  const geometry = () =>
    section.evaluate((el) => {
      const root = el.getBoundingClientRect();
      return ["#document-currency", "#document-amountTotal"].map((selector) => {
        const element = el.querySelector(selector);
        if (!element) throw new Error("Chybí měnové nebo částkové pole");
        const rect = element.getBoundingClientRect();
        return [rect.x - root.x, rect.y - root.y, rect.width, rect.height].map(Math.round);
      });
    });
  const before = await geometry();
  await setChecked(page, true);
  expect(await geometry()).toEqual(before);
  expect(before[0]?.slice(2)).toEqual([104, 44]);
});

test("účet lícuje s Dodavatelem a číslo dodavatele s IČO a DIČ", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  await zoom(page, 1);
  const section = page.getByTestId("form-with-supplier");
  await section.evaluate((el) => {
    el.style.width = "1000px";
  });
  const rects = await section.evaluate((el) => {
    return [
      "#document-partner",
      "#document-partner-ico",
      "#document-partner-dic",
      "[aria-label='Bankovní účet']",
      "#document-externalNumber",
    ].map((selector) => {
      const element = el.querySelector(selector);
      if (!element) throw new Error("Pole chybí");
      const r = element.getBoundingClientRect();
      return { left: r.left, right: r.right };
    });
  });
  expect(rects[3]).toEqual(rects[0]);
  expect(rects[4]?.left).toBeCloseTo(rects[1]?.left ?? 0, 1);
  expect(rects[4]?.right).toBeCloseTo(rects[2]?.right ?? 0, 1);
});

test("křížek a šipka se nepřekrývají při 70–200 % a šipka neposkočí", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  for (const value of [0.7, 1, 1.25, 1.5, 2]) {
    await zoom(page, value);
    // Rozložení se po změně zoomu ustálí až po přepočtu; měř opakovaně.
    await expect(async () => {
      const selected = page.locator("#symbol-selected");
      const empty = page.locator("#symbol-empty");
      const arrow = selected.locator("[data-slot=select-chevron]");
      const clear = selected.locator("..").getByRole("button", { name: "Vymazat" });
      const boxes = await Promise.all([
        selected.boundingBox(),
        arrow.boundingBox(),
        clear.boundingBox(),
        empty.boundingBox(),
        empty.locator("[data-slot=select-chevron]").boundingBox(),
      ]);
      const [s, a, c, e, ea] = boxes;
      if (!s || !a || !c || !e || !ea) throw new Error("Ikona není vidět");
      expect(c.x + c.width).toBeLessThanOrEqual(a.x);
      expect(Math.abs(s.x + s.width - a.x - (e.x + e.width - ea.x))).toBeLessThan(1);
    }).toPass();
  }
});

test("pevná měna zabírá stejnou šířku jako výběr při pěti aplikačních zoomech", async ({
  page,
}) => {
  test.setTimeout(300_000);
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const section = page.getByTestId("form-with-supplier");
  const measure = () =>
    section.evaluate((el) => {
      const pair = el.querySelector('[data-slot="document-total-currency-pair"]');
      if (!pair) throw new Error("Dvojice Celkem + Měna chybí");
      const rect = pair.getBoundingClientRect();
      return [Math.round(rect.width), Math.round(rect.height)];
    });
  for (const value of [0.7, 1, 1.25, 1.5, 2]) {
    await zoom(page, value);
    for (const width of [1000, 640, 560, 440, 360]) {
      await section.evaluate((el, w) => {
        el.style.width = `${w}px`;
      }, width);
      const select = await measure();
      await setChecked(page, true);
      expect(await measure(), `zoom ${value}, šířka ${width}px`).toEqual(select);
      await setChecked(page, false);
    }
  }
});
