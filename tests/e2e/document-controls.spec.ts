/** Geometrie sdílených polí · vlastní měření v prohlížeči · nesmí číst zdroj. */
import { expect, test } from "@playwright/test";

for (const zoom of [1, 1.5, 2]) {
  for (const width of [360, 640, 1200]) {
    test(`Ovládání formuláře ${width}px při ${zoom * 100}%`, async ({ page }) => {
      await page.goto("/components/accounting-controls", { waitUntil: "networkidle" });
      await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
        timeout: 45000,
      });
      await expect(page.getByTestId("document-controls")).toBeVisible();
      await page.evaluate(async (value) => {
        const path = "/src/lib/app-zoom.ts";
        const module = await import(/* @vite-ignore */ path);
        module.setAppZoom(value);
      }, zoom);
      const sample = page.getByTestId("document-controls");
      await sample.evaluate((node, size) => {
        node.style.width = `${size}px`;
      }, width);
      const field = sample.locator('[data-slot="field"]').first();
      const before = await field.boundingBox();
      const fieldHeights = await sample
        .locator('[data-slot="field"]')
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      await sample.getByRole("button", { name: "Výstrahy", exact: true }).click();
      const after = await field.boundingBox();
      expect(Math.abs((before?.height ?? 0) - (after?.height ?? 0))).toBeLessThan(1);
      const afterHeights = await sample
        .locator('[data-slot="field"]')
        .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
      fieldHeights.forEach((height, index) =>
        expect(Math.abs(height - afterHeights[index])).toBeLessThan(1),
      );
      const radio = sample.getByRole("radio", { name: "První" });
      const ring = await radio.boundingBox();
      const dot = await radio.locator('[data-slot="radio-dot"]').boundingBox();
      expect(ring).not.toBeNull();
      expect(dot).not.toBeNull();
      if (ring && dot) {
        expect(Math.abs(ring.x + ring.width / 2 - dot.x - dot.width / 2)).toBeLessThan(0.6);
        expect(Math.abs(ring.y + ring.height / 2 - dot.y - dot.height / 2)).toBeLessThan(0.6);
      }
      const bar = sample.getByTestId("action-width");
      let count = 0;
      for (const available of [width, 180, 110]) {
        await bar.evaluate((node, size) => {
          node.style.width = `${size}px`;
        }, available);
        await page.waitForTimeout(100);
        const actions = bar.locator('[data-slot="record-action-bar"]');
        const level = Number(await actions.getAttribute("data-overflow-level"));
        const save = bar.getByRole("button", { name: "Uložit", exact: true });
        await expect(save).toBeVisible();
        expect(level).toBeGreaterThanOrEqual(0);
        if (available === 110) expect(level).toBe(2);
        if (level === 0) await expect(save.locator("svg")).toHaveCount(0);
        await save.focus();
        await save.press("Enter");
        await expect(sample.locator('output[aria-label="Uloženo"]')).toHaveText(String(++count));
      }
      await expect(sample.locator('output[aria-label="Uloženo"]')).toContainText("3");
      const select = sample.getByRole("combobox", { name: "Partner", exact: true });
      await select.click();
      const popup = page.locator(".ds-select-popover");
      const triggerBox = await select.boundingBox();
      const popupBox = await popup.boundingBox();
      const rem = await page.evaluate(() =>
        parseFloat(getComputedStyle(document.documentElement).fontSize),
      );
      if (triggerBox && popupBox) {
        expect(popupBox.width).toBeGreaterThanOrEqual(triggerBox.width - 1);
        expect(popupBox.width).toBeGreaterThan(triggerBox.width + 10);
        expect(popupBox.width).toBeLessThanOrEqual(36 * rem + 1);
        expect(popupBox.x + popupBox.width).toBeLessThanOrEqual(1280);
      }
      const itemLines = await popup
        .getByRole("option")
        .evaluateAll((nodes) => nodes.map((node) => getComputedStyle(node).whiteSpace));
      expect(itemLines.every((value) => value === "nowrap")).toBe(true);
      // Edit 16: hledaný text se píše přímo do pole (jediný combobox), ne do řádku nabídky.
      await sample.getByRole("combobox", { name: "Partner", exact: true }).fill("Nová firma");
      await sample.getByRole("button", { name: "Nový partner" }).click();
      await expect(sample.locator('output[aria-label="Nový partner"]')).toHaveText("Nová firma");
    });
  }
}

test("Radio tečka při 70 % a 200 % zachovává přesný střed", async ({ page }) => {
  await page.goto("/components/accounting-controls", { waitUntil: "networkidle" });
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true", {
    timeout: 45000,
  });
  for (const zoom of [0.7, 2]) {
    await page.evaluate(async (value) => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(value);
    }, zoom);
    const radio = page.getByTestId("document-controls").getByRole("radio", { name: "První" });
    const ring = await radio.boundingBox();
    const dot = await radio.locator('[data-slot="radio-dot"]').boundingBox();
    expect(ring).not.toBeNull();
    expect(dot).not.toBeNull();
    if (ring && dot) {
      expect(Math.abs(ring.x + ring.width / 2 - dot.x - dot.width / 2)).toBeLessThan(0.6);
      expect(Math.abs(ring.y + ring.height / 2 - dot.y - dot.height / 2)).toBeLessThan(0.6);
    }
  }
});

test("Nový výpis má grid pohybů s akcí Nový výdaj", async ({ page }) => {
  await page.goto("/components/accounting-bank", { waitUntil: "networkidle" });
  const showcase = page.getByTestId("bank-showcase");
  await expect(showcase).toHaveAttribute("data-ready", "true", { timeout: 45000 });
  await showcase.getByRole("button", { name: "empty", exact: true }).click();
  const form = page.getByTestId("bank-panels").locator('[data-slot="bank-statement-form"]').first();
  await expect(form.getByText("Pohyby lze zadat po uložení výpisu")).toHaveCount(0);
  await form.getByRole("button", { name: "Nový výdaj" }).click();
  await expect(form.locator('output[aria-label="Nový pohyb"]')).toHaveText("Výdaj");
});
