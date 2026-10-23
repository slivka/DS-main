import { expect, test } from "@playwright/test";
import { identityMetrics } from "./helpers/identity";
import { expectTooltip } from "./helpers/tooltip";

/** Identita má jedinou výšku a nepřekrývá se ani při maximálním zoomu. */
test("řádek identity bez překryvu v úzkém formuláři", async ({ page }) => {
  await page.goto("/components/record-panel", { waitUntil: "networkidle" });
  const section = page.getByTestId("extraction-narrow-section");
  await section.scrollIntoViewIfNeeded();
  const toggle = section.getByRole("button", { name: "Zobrazit úzký formulář" });
  const form = section.getByTestId("extraction-document-narrow");
  await expect
    .poll(
      async () => {
        if (!(await form.isVisible())) await toggle.click();
        return form.isVisible();
      },
      { timeout: 20_000 },
    )
    .toBe(true);
  for (const zoom of [16, 32])
    for (const width of [360, 420, 480, 640]) {
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}px`;
      }, zoom);
      await form.evaluate((node, w) => {
        (node as HTMLElement).style.maxWidth = `${w}px`;
      }, width);
      // Rozvržení se ustálí po přeměření řádku.
      await expect
        .poll(() => form.evaluate((node) => node.getBoundingClientRect().width))
        .toBe(width);
      await page.waitForTimeout(300);
      const metrics = await form.evaluate(identityMetrics);
      expect(metrics.difference).toBeLessThanOrEqual(0.5);
      expect(metrics.overlaps, `šířka ${width}`).toEqual([]);
      const status = form.locator('[data-slot="identity-status-text"]');
      const fullText = await status.getAttribute("aria-label");
      if (!fullText) throw new Error("Chybí celý stav");
      await expectTooltip(page, status, fullText);
      await page.mouse.move(0, 0);
      const row = form.locator('[data-slot="identity-line-row"]');
      if (Number(await row.getAttribute("data-identity-level")) >= 8) {
        const label = await row.getAttribute("aria-label");
        if (!label) throw new Error("Chybí plná identita");
        await expectTooltip(page, row, label, { interaction: "keyboard" });
        await page.mouse.move(0, 0);
      }
      // Tužka zůstává hned za textem účtu.
      const text = form.locator('[data-slot="document-identity-account-text"]');
      const pencil = form.locator(".document-identity-pencil-slot");
      const t = await text.boundingBox();
      const p = await pencil.boundingBox();
      if (!t || !p) throw new Error("Chybí účet nebo tužka");
      expect(p.x - (t.x + t.width), `tužka při ${width}`).toBeLessThanOrEqual(12);
    }
});
