/** Skutečné panely, měření data a zamknuté platební symboly. */
import { expect, test } from "@playwright/test";
test.use({ viewport: { width: 1280, height: 1800 } });
test("pět dat při všech zoomech ve skutečných panelech", async ({ page }, testInfo) => {
  test.setTimeout(240_000);
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const root = page.getByTestId("date-panels");
  await expect(root).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  const results = [];
  for (const language of ["CS", "SK"]) {
    await root.getByRole("button", { name: language, exact: true }).click();
    for (const zoom of [0.7, 1, 1.25, 1.5, 2]) {
      await page.evaluate(async (z) => {
        const path = "/src/lib/app-zoom.ts";
        const m = await import(/* @vite-ignore */ path);
        m.setAppZoom(z);
      }, zoom);
      for (const count of [1, 2, 3, 0]) {
        await root
          .getByRole("button", { name: count ? `${count} panelů` : "Úzký panel", exact: true })
          .click();
        await root.evaluate(
          (el, width) => {
            el.style.width = `${width}px`;
          },
          count ? 1920 : 360,
        );
        await expect(root.locator("[data-pane]")).toHaveCount(count || 1);
        const dates = root.locator('[data-slot="document-dates"]').first();
        const result = await dates.evaluate((el) => {
          const box = el.getBoundingClientRect();
          const inputs = [...el.querySelectorAll("input")];
          const values = inputs.map((input) => {
            const style = getComputedStyle(input);
            const canvas = document.createElement("canvas").getContext("2d");
            if (!canvas) throw new Error("Chybí měření písma");
            canvas.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
            const rect = input.getBoundingClientRect();
            const probe = document.createElement("span");
            probe.textContent = input.value;
            Object.assign(probe.style, {
              position: "absolute",
              visibility: "hidden",
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              fontVariantNumeric: style.fontVariantNumeric,
              whiteSpace: "nowrap",
            });
            document.body.append(probe);
            const textWidth = probe.getBoundingClientRect().width;
            probe.remove();
            const icons = [
              ...(input.parentElement?.querySelectorAll("button svg,span[tabindex] svg") ?? []),
            ]
              .map((icon) => icon.getBoundingClientRect())
              .filter((icon) => icon.width);
            const label = input.closest('[data-slot="field"]')?.querySelector("label");
            canvas.font = label
              ? `${getComputedStyle(label).fontWeight} ${getComputedStyle(label).fontSize} ${getComputedStyle(label).fontFamily}`
              : canvas.font;
            return {
              id: input.id,
              width: rect.width,
              left: rect.left - box.left,
              right: rect.right - box.right,
              bottom: rect.bottom - box.bottom,
              fontSize: parseFloat(style.fontSize),
              y: rect.y,
              scroll: input.scrollWidth,
              client: input.clientWidth,
              textWidth,
              available:
                input.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
              iconGap:
                Math.min(...icons.map((icon) => icon.x)) -
                rect.x -
                parseFloat(style.paddingLeft) -
                parseFloat(style.borderLeftWidth) -
                textWidth,
              icons: icons.length,
              labelWidth: label ? canvas.measureText(label.textContent ?? "").width : 0,
            };
          });
          const gap = parseFloat(getComputedStyle(el).gap);
          return {
            container: box.width,
            scroll: el.scrollWidth,
            client: el.clientWidth,
            gap,
            rows: new Set(values.map((input) => Math.round(input.y * 10) / 10)).size,
            threshold: values.reduce((sum, input) => sum + input.width, 0) + 4 * gap,
            values,
          };
        });
        expect(result.values).toHaveLength(5);
        expect(
          Math.max(...result.values.map((i) => i.width)) -
            Math.min(...result.values.map((i) => i.width)),
        ).toBeLessThan(1);
        expect(result.values.find((i) => i.id === "document-accountingDate")?.icons).toBe(3);
        for (const input of result.values) {
          expect(input.scroll).toBeLessThanOrEqual(input.client);
          expect(input.textWidth).toBeLessThanOrEqual(input.available);
          expect(input.iconGap).toBeGreaterThanOrEqual(0);
          if (input.icons === 3) {
            const labelExpansion = Math.max(
              0,
              input.labelWidth - input.textWidth - (input.width - input.available),
            );
            expect(input.iconGap).toBeLessThanOrEqual(input.fontSize * 0.3 + 3 + labelExpansion);
          }
          expect(input.labelWidth).toBeLessThanOrEqual(input.width + 1);
          expect(input.left).toBeGreaterThanOrEqual(-1);
          expect(input.right).toBeLessThanOrEqual(1);
          expect(input.bottom).toBeLessThanOrEqual(1);
        }
        expect(result.scroll).toBeLessThanOrEqual(result.client);
        const pairWidth =
          (result.values[3]?.width ?? 0) + (result.values[4]?.width ?? 0) + result.gap;
        let expectedRows = 1;
        let used = 0;
        for (const input of result.values.slice(0, 3)) {
          if (used && used + result.gap + input.width > result.container + 1) {
            expectedRows++;
            used = 0;
          }
          used += (used ? result.gap : 0) + input.width;
        }
        // Nulová rozpěrka má vlastní mezeru; dvojice se uvnitř zalomí až pod svou šířkou.
        const pairOuterWidth = Math.min(pairWidth, result.container);
        if (used + 2 * result.gap + pairOuterWidth > result.container + 1) expectedRows++;
        if (pairWidth > result.container + 1) expectedRows++;
        else expect(result.values[3]?.y).toBe(result.values[4]?.y);
        expect(result.rows).toBe(expectedRows);
        results.push({ language, zoom, panels: count || "360", expectedRows, ...result });
      }
    }
  }
  console.log(JSON.stringify({ measurements: results }));
  await root
    .locator('[data-slot="document-dates"]')
    .first()
    .screenshot({ path: `/tmp/browser/dates/${testInfo.project.name}-dates.png` });
  await testInfo.attach("date-panel-measurements", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
});
test("přijaté symboly zůstávají prázdné se správným důvodem", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const received = page.getByTestId("edit-document-eleven-received");
  await expect(received).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  const toggle = received.getByRole("button", { name: "Platit příkazem", exact: true });
  await toggle.click();
  for (const name of ["Konstantní symbol", "Specifický symbol"]) {
    const input = received.locator(
      name === "Konstantní symbol" ? "#document-constantSymbol" : "#document-specificSymbol",
    );
    await expect(input).toBeDisabled();
    await expect(input).toHaveValue("");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await input.locator("..").hover();
    await expect(page.getByRole("tooltip")).toHaveText("Nezahrnuje se do platebních příkazů");
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await input.locator("..").focus();
    await expect(page.getByRole("tooltip")).toHaveText("Nezahrnuje se do platebních příkazů");
    await input.locator("..").evaluate((el) => {
      if (el instanceof HTMLElement) el.blur();
    });
  }
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await toggle.click();
  await expect(received.locator("#document-specificSymbol")).toHaveValue("99");
  await expect(received.locator("#document-constantSymbol")).toBeEnabled();
});
