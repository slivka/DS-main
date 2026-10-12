/** Lišty gridu · aktivní a hover barvy a zamčené segmenty v obou režimech. */
import { expect, test, type Locator } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });
test.setTimeout(120_000);

async function colors(control: Locator) {
  return control.evaluate((node) => {
    const style = getComputedStyle(node);
    const probe = document.createElement("span");
    document.body.append(probe);
    probe.style.color = "var(--filter-active)";
    const active = getComputedStyle(probe).color;
    probe.style.backgroundColor = "color-mix(in oklab, var(--filter-active) 10%, transparent)";
    const background = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return { color: style.color, background: style.backgroundColor, active, expected: background };
  });
}

test("aktivní lišta a hover zachovají barvy v obou režimech", async ({ page }, info) => {
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  // Oddělíme měřený grid od dalších ukázek, které se ve společném flexu smrští.
  await page.locator('[data-slot="data-grid"], [data-slot="tree-grid"]').evaluateAll((nodes) => {
    nodes.forEach((node, index) => {
      if (index === 0) {
        (node as HTMLElement).style.flexShrink = "0";
        (node as HTMLElement).style.width = "100rem";
      } else (node as HTMLElement).style.display = "none";
    });
  });
  const toolbar = page.locator('[data-slot="grid-toolbar"]').first();
  const context = page.locator('[data-slot="grid-context-bar"]').first();
  await expect(toolbar).toHaveAttribute("data-overflow-level", "0");
  await toolbar.getByRole("button", { name: "Hledat", exact: true }).focus();
  await page.keyboard.press("Enter");
  await toolbar.locator("[data-toolbar-search] input").fill("doklad");
  await context.getByRole("button", { name: "Období:", exact: true }).click();
  await page.getByRole("button", { name: "Q1", exact: true }).click();
  for (const dark of [false, true]) {
    const toggle = page.getByRole("button", {
      name: dark ? "Tmavý režim" : "Světlý režim",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    await expect(page.locator("html")).toHaveClass(dark ? /dark/ : /^(?!.*dark).*$/);
    await page.mouse.move(0, 0);
    for (const control of [
      toolbar.locator("input.grid-toolbar-active"),
      toolbar.getByRole("button", { name: /Aktivní filtry:/ }),
      context.locator("button.grid-toolbar-active"),
    ]) {
      await expect(control).toBeVisible();
      await expect(async () => {
        const style = await colors(control);
        expect(style.color).toBe(style.active);
        expect(style.background).toBe(style.expected);
      }).toPass();
    }
    for (const control of [
      toolbar.locator("[data-toolbar-add]"),
      toolbar.locator(".grid-toolbar-icon-control").first(),
    ]) {
      await page.mouse.move(0, 0);
      await page.waitForTimeout(250);
      const before = await colors(control);
      await control.hover();
      await expect
        .poll(async () => {
          const after = await colors(control);
          return after.background !== before.background || after.color !== before.color;
        })
        .toBe(true);
    }
    await info.attach(dark ? "Tmavá lišta" : "Světlá lišta", {
      body: await toolbar.screenshot(),
      contentType: "image/png",
    });
  }
});

test("zakázaná segmentová volba zůstává odlišená a čitelná", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  await expect(page.getByTestId("document-readonly")).toHaveAttribute("data-ready", "true", {
    timeout: 60_000,
  });
  const group = page.getByTestId("disabled-segments");
  for (const dark of [false, true]) {
    const toggle = page.getByRole("button", {
      name: dark ? "Tmavý režim" : "Světlý režim",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    await expect(page.locator("html")).toHaveClass(dark ? /dark/ : /^(?!.*dark).*$/);
    await expect(async () => {
      const selected = await colors(group.locator('[aria-checked="true"]'));
      const other = await colors(group.locator('[aria-checked="false"]'));
      expect(selected.color).not.toBe(other.color);
      expect(selected.background).not.toBe(other.background);
      const contrast = await group.locator('[aria-checked="true"]').evaluate((node) => {
        const canvas = document.createElement("canvas").getContext("2d");
        if (!canvas) throw new Error("Chybí měření barev");
        const rgb = (color: string) => {
          canvas.clearRect(0, 0, 1, 1);
          canvas.fillStyle = color;
          canvas.fillRect(0, 0, 1, 1);
          return Array.from(canvas.getImageData(0, 0, 1, 1).data);
        };
        const layers: number[][] = [];
        let element: Element | null = node;
        while (element) {
          layers.unshift(rgb(getComputedStyle(element).backgroundColor));
          element = element.parentElement;
        }
        let background = [255, 255, 255];
        for (const layer of layers) {
          background = background.map(
            (v, i) => (layer[i] * layer[3]) / 255 + v * (1 - layer[3] / 255),
          );
        }
        const luminance = (values: number[]) =>
          values
            .map((v) => {
              const channel = v / 255;
              return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
        const a = luminance(rgb(getComputedStyle(node).color).slice(0, 3));
        const b = luminance(background);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      console.log(`KONTRAST segment ${dark ? "tmavý" : "světlý"}: ${contrast.toFixed(2)}`);
    }).toPass();
  }
});
