/** Skutečný editor řádků · měření potomků zděděné délky, nikoli napodobeniny. */
import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("Skutečné buňky a detail: 70/100/200 %, 60/100/140 %, obě hustoty", async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1280, height: 1800 });
  await page.goto("/components/forms", { waitUntil: "networkidle" });
  const root = page.locator('[data-slot="real-journal-height"]');
  await expect(root).toBeVisible();
  const toggle = root.locator('[data-slot="journal-detail-toggle"]');
  await expect(async () => {
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true", { timeout: 1000 });
  }).toPass();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  const detail = root.locator('[data-slot="journal-line-detail-fields"]');
  await expect(
    detail.locator(
      '[data-journal-field="height-row:vatDeductionShare"] [data-slot="field-feedback"]',
    ),
  ).toBeVisible();
  const results = [];
  for (const app of [0.7, 1, 2]) {
    await page.evaluate(async (zoom) => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(zoom);
    }, app);
    // Po přepočtu dostupné šířky používáme skutečné ruční ovládání zoomu.
    await page.waitForTimeout(350);
    for (const density of ["normal", "compact"]) {
      const densityButton = root.getByRole("button", {
        name: density === "compact" ? "Kompaktní hustota řádků" : "Normální hustota řádků",
        exact: true,
      });
      if (await densityButton.count()) await densityButton.click();
      for (const grid of [60, 100, 140]) {
        await root.locator(".zoom-value").click();
        const name = grid < 100 ? "Zmenšit tabulku" : "Zvětšit tabulku";
        for (let step = 0; step < Math.abs(grid - 100) / 10; step++)
          await root.getByRole("button", { name, exact: true }).click();
        await expect(root.locator(".zoom-value")).toHaveText(new RegExp(`${grid}\\s*%`));
        const fields = await detail
          .locator('[data-slot="journal-detail-field"]')
          .evaluateAll((nodes) =>
            nodes.map((node) => {
              const control = node.querySelector<HTMLElement>(
                'input,[role="combobox"],[role="radiogroup"]',
              );
              return {
                label: node.querySelector("label")?.textContent?.trim(),
                height: control?.getBoundingClientRect().height ?? 0,
              };
            }),
          );
        expect(fields.map((field) => field.label)).toEqual(
          expect.arrayContaining([
            "Množství",
            "MJ",
            "Cena za MJ",
            "VS",
            "Partner",
            "Nárok na odpočet",
            "Poměr %",
          ]),
        );
        expect(
          Math.max(...fields.map((f) => f.height)) - Math.min(...fields.map((f) => f.height)),
        ).toBeLessThan(1);
        const cells = await root
          .locator('[data-cell-key^="height-row:"]')
          .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().height));
        expect(Math.max(...cells) - Math.min(...cells)).toBeLessThan(1);
        // Skutečný textový editor buňky musí zdědit stejnou délku jako sousední buňky.
        await root.locator('[data-cell-key="height-row:text"]').click();
        const input = root.locator('[data-cell-key="height-row:text"] input');
        await expect(input).toBeVisible();
        const editorHeight = await input.evaluate((node) => node.getBoundingClientRect().height);
        expect(Math.abs(editorHeight - cells[0])).toBeLessThan(1);
        await input.press("Escape");
        results.push({ app, grid, density, fields, cellHeight: cells[0], editorHeight });
      }
    }
  }
  await writeFile("/tmp/browser/real-journal-heights.json", JSON.stringify(results, null, 2));
  await test.info().attach("real-journal-heights.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
  await root.screenshot({ path: "/tmp/browser/real-journal-verified.png" });
});
