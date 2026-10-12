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
        // Observer musí dokončit měření po změně panelu i v pomalejším WebKitu.
        await page.evaluate(() => new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        }));
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
              ...(input.parentElement?.querySelectorAll("button,span[tabindex]") ?? []),
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
              labelFontSize: label ? parseFloat(getComputedStyle(label).fontSize) : 0,
              fullWidth: (() => {
                const field = input.closest<HTMLElement>('[data-slot="field"]');
                if (!field) throw new Error("Chybí datumové pole");
                const scale = field.style.getPropertyValue("--document-date-scale");
                field.style.setProperty("--document-date-scale", "1");
                const width = field.getBoundingClientRect().width;
                field.style.setProperty("--document-date-scale", scale);
                return width;
              })(),
            };
          });
          const gap = parseFloat(getComputedStyle(el).gap);
          return {
            container: box.width,
            scroll: el.scrollWidth,
            client: el.clientWidth,
            gap,
            rows: new Set(values.map((input) => Math.round(input.y * 10) / 10)).size,
            threshold: values.reduce((sum, input) => sum + input.width, 0) + 5 * gap,
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
          if (input.fullWidth <= result.container) {
            expect(Math.abs(input.fontSize - 14 * zoom)).toBeLessThanOrEqual(0.5);
            expect(Math.abs(input.labelFontSize - 12 * zoom)).toBeLessThanOrEqual(0.5);
          } else {
            expect(input.width).toBeGreaterThanOrEqual(result.container * 0.95);
          }
          expect(input.textWidth).toBeLessThanOrEqual(input.available);
          expect(input.iconGap).toBeGreaterThanOrEqual(0);
          if (input.icons === 3) {
            const labelExpansion = Math.max(
              0,
              input.labelWidth - input.textWidth - (input.width - input.available),
            );
            expect(input.iconGap).toBeLessThanOrEqual(input.fontSize * 0.3 + labelExpansion + 0.01);
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

test("šipka účtu nepřekrývá platební příkaz při 100 a 200 %", async ({ page }, testInfo) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const received = page.getByTestId("edit-document-eleven-received");
  await expect(received).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  for (const zoom of [1, 2]) {
    await page.evaluate(async (value) => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(value);
    }, zoom);
    const account = received.locator('[data-slot="payment-order-account"]');
    const arrow = account.locator('[data-slot="select-chevron"]');
    const action = account.getByRole("button", { name: "Platit příkazem", exact: true });
    await expect(arrow).toBeVisible();
    const arrowBox = await arrow.boundingBox();
    const actionBox = await action.boundingBox();
    if (!arrowBox || !actionBox) throw new Error("Chybí geometrie účtu");
    expect(arrowBox.x + arrowBox.width).toBeLessThanOrEqual(actionBox.x);
    const textEdge = await account.locator('[role="combobox"]').evaluate((el) => {
      const style = getComputedStyle(el);
      return el.getBoundingClientRect().right - parseFloat(style.paddingRight);
    });
    expect(textEdge).toBeLessThanOrEqual(arrowBox.x);
    await account.screenshot({
      path: `/tmp/browser/dates/${testInfo.project.name}-account-${zoom * 100}.png`,
    });
    await testInfo.attach(`Účet při ${zoom * 100} %`, {
      body: await account.screenshot(),
      contentType: "image/png",
    });
  }
});

test("delší popisky v panelu 360 px při 200 % nepřetékají", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const root = page.getByTestId("date-panels");
  await expect(root).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  await page.evaluate(async () => {
    const path = "/src/lib/app-zoom.ts";
    const module = await import(/* @vite-ignore */ path);
    module.setAppZoom(2);
  });
  for (const language of ["CS", "SK"]) {
    await root.getByRole("button", { name: language, exact: true }).click();
    await root.getByRole("button", { name: "Úzký panel", exact: true }).click();
    await root.evaluate((el) => {
      el.style.width = "360px";
    });
    await root.getByRole("button", { name: "Delší popisky", exact: true }).click();
    const dates = root.locator('[data-slot="document-dates"]').first();
    await expect
      .poll(() =>
        dates.evaluate((el) => {
          const box = el.getBoundingClientRect();
          return (
            Array.from(el.querySelectorAll<HTMLElement>('[data-slot="field"]')).every((field) => {
              const rect = field.getBoundingClientRect();
              const label = field.querySelector("label")?.getBoundingClientRect();
              const input = field.querySelector("input");
              return (
                rect.right <= box.right + 0.5 &&
                rect.left >= box.left - 0.5 &&
                (!label || label.right <= rect.right + 0.5) &&
                (!input || input.scrollWidth <= input.clientWidth)
              );
            }) && el.scrollWidth <= el.clientWidth
          );
        }),
      )
      .toBe(true);
    await root.getByRole("button", { name: "Delší popisky", exact: true }).click();
  }
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
    await expect(input.locator("..")).toHaveAccessibleName(name);
    await expect(input.locator("..")).toHaveAccessibleDescription(
      "Nezahrnuje se do platebních příkazů",
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

test("formáty a delší popisky rozšíří pouze vlastní pole", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const root = page.getByTestId("date-panels");
  await expect(root).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  for (const language of ["CS", "SK"]) {
    await root.getByRole("button", { name: language, exact: true }).click();
    for (const format of ["dd.MM.yyyy", "d.M.yyyy", "yyyy-MM-dd", "dd/MM/yyyy"]) {
      await root.getByRole("button", { name: format, exact: true }).click();
      await root.getByRole("button", { name: "1 panelů", exact: true }).click();
      await page.evaluate(async () => {
        const path = "/src/lib/app-zoom.ts";
        const m = await import(/* @vite-ignore */ path);
        m.setAppZoom(1);
      });
      await root.evaluate((el) => {
        el.style.width = "1920px";
      });
      const dates = root.locator('[data-slot="document-dates"]').first();
      const measure = () =>
        dates.evaluate((el) => {
          return Array.from(el.querySelectorAll("input")).map((input) => {
            const rect = input.getBoundingClientRect();
            const style = getComputedStyle(input);
            const label = input.closest('[data-slot="field"]')?.querySelector("label");
            const probe = document.createElement("span");
            probe.textContent = input.value;
            Object.assign(probe.style, {
              position: "absolute",
              visibility: "hidden",
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              fontVariantNumeric: "tabular-nums",
              whiteSpace: "nowrap",
            });
            document.body.append(probe);
            const textWidth = probe.getBoundingClientRect().width;
            probe.remove();
            const icons = Array.from(
              input.parentElement?.querySelectorAll("button,span[tabindex]") ?? [],
            )
              .map((icon) => icon.getBoundingClientRect())
              .filter((icon) => icon.width);
            return {
              id: input.id,
              width: rect.width,
              x: rect.x,
              y: rect.y,
              client: input.clientWidth,
              scroll: input.scrollWidth,
              value: input.value,
              labelRight: label?.getBoundingClientRect().right ?? 0,
              right: rect.right,
              fontSize: parseFloat(style.fontSize),
              iconGap:
                Math.min(...icons.map((icon) => icon.x)) -
                rect.x -
                textWidth -
                parseFloat(style.paddingLeft) -
                parseFloat(style.borderLeftWidth),
            };
          });
        });
      const normal = await measure();
      expect(normal[1]?.value).toBe(
        format === "yyyy-MM-dd"
          ? "2026-10-12"
          : format === "dd/MM/yyyy"
            ? "12/10/2026"
            : "12.10.2026",
      );
      for (const input of normal) {
        expect(input.scroll).toBeLessThanOrEqual(input.client);
        expect(input.iconGap).toBeGreaterThanOrEqual(0);
        if (input.id === "document-accountingDate")
          expect(input.iconGap).toBeLessThanOrEqual(input.fontSize * 0.3);
      }
      const button = root.getByRole("button", { name: "Delší popisky", exact: true });
      await button.click();
      const expanded = await measure();
      for (let index = 0; index < expanded.length; index++) {
        const field = expanded[index];
        const previous = normal[index];
        if (!field || !previous) throw new Error("Chybí datumové pole");
        if (["document-accountingDate", "document-taxDate"].includes(field.id))
          expect(field.width).toBeGreaterThan(previous.width);
        else expect(Math.abs(field.width - previous.width)).toBeLessThan(0.01);
        expect(field.labelRight).toBeLessThanOrEqual(field.right + 0.1);
        const next = expanded[index + 1];
        if (next && next.y === field.y) expect(field.labelRight).toBeLessThanOrEqual(next.x);
      }
      const pairWidth = (expanded[3]?.width ?? 0) + (expanded[4]?.width ?? 0) + 12;
      const overhead = await root.evaluate(
        (el) =>
          el.getBoundingClientRect().width -
          (el.querySelector('[data-slot="document-dates"]')?.getBoundingClientRect().width ?? 0),
      );
      await root.evaluate(
        (el, width) => {
          el.style.width = `${width}px`;
        },
        pairWidth + 2 + overhead,
      );
      const fits = await measure();
      expect(fits[3]?.y).toBe(fits[4]?.y);
      await root.evaluate(
        (el, width) => {
          el.style.width = `${width}px`;
        },
        pairWidth - 2 + overhead,
      );
      const wraps = await measure();
      expect(wraps[3]?.y).not.toBe(wraps[4]?.y);
      await button.click();
    }
  }
  await root.getByRole("button", { name: "dd.MM.yyyy", exact: true }).click();
});
