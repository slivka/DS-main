/** Zakázané vstupy dokladu · stejné barvy jako zamčený datum v obou režimech. */
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });

test("zakázané KS a SS sdílejí vzhled zamčeného Datum DPH", async ({ page }, testInfo) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const received = page.getByTestId("edit-document-eleven-received");
  await expect(received).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  await received.getByRole("button", { name: "Platit příkazem", exact: true }).click();
  const date = page.getByTestId("document-readonly").locator("#document-vatDate:disabled");
  await expect(date).toBeDisabled();

  for (const dark of [false, true]) {
    const theme = page.getByRole("button", {
      name: dark ? "Tmavý režim" : "Světlý režim",
      exact: true,
    });
    if (await theme.count()) await theme.click();
    await expect(page.locator("html")).toHaveClass(dark ? /dark/ : /^(?!.*dark).*$/);
    for (const id of ["document-constantSymbol", "document-specificSymbol"]) {
      const symbol = received.locator(`#${id}`);
      await expect(symbol).toBeDisabled();
      await expect(symbol).toHaveValue("");
      await expect
        .poll(async () => {
          const reference = await date.evaluate((input) => {
            const style = getComputedStyle(input);
            return [style.backgroundColor, style.color, style.opacity];
          });
          const actual = await symbol.evaluate((input) => {
            const style = getComputedStyle(input);
            return [style.backgroundColor, style.color, style.opacity];
          });
          return JSON.stringify(actual) === JSON.stringify(reference);
        })
        .toBe(true);
      expect(await symbol.evaluate((input) => getComputedStyle(input).backgroundColor)).not.toBe(
        "rgba(0, 0, 0, 0)",
      );
    }
    await testInfo.attach(
      dark ? "Zakázané symboly – tmavý režim" : "Zakázané symboly – světlý režim",
      {
        body: await received.locator('[data-slot="document-payment-section"]').screenshot(),
        contentType: "image/png",
      },
    );
  }
  await received.getByRole("button", { name: "Platit příkazem", exact: true }).click();
  await expect(received.locator("#document-specificSymbol")).toHaveValue("99");
});

test("doklad jen pro čtení sdílí barvy a čitelný text v obou režimech", async ({ page }, info) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const form = page.getByTestId("document-readonly");
  await expect(form).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  const reference = form.locator("#document-vatDate");
  const controls = await form
    .locator(
      'input[id]:disabled, textarea:disabled, button:disabled, button[aria-disabled="true"], ' +
        'div.ds-disabled-control[aria-disabled="true"], [data-slot="field-value"][aria-disabled="true"]',
    )
    .all();
  controls.push(...(await page.getByTestId("disabled-selects").getByRole("combobox").all()));
  expect(controls.length).toBeGreaterThanOrEqual(20);
  await expect(form.locator("#document-partner")).toBeDisabled();
  await expect(page.locator("#disabled-currency-select")).toBeDisabled();
  await expect(page.locator("#disabled-radix-select")).toBeDisabled();
  for (const dark of [false, true]) {
    const toggle = page.getByRole("button", {
      name: dark ? "Tmavý režim" : "Světlý režim",
      exact: true,
    });
    if (await toggle.count()) await toggle.click();
    await expect(page.locator("html")).toHaveClass(dark ? /dark/ : /^(?!.*dark).*$/);
    await expect
      .poll(async () =>
        reference.evaluate((node) =>
          getComputedStyle(node).getPropertyValue("--muted-foreground").trim(),
        ),
      )
      .toBe(dark ? "oklch(0.72 0.02 250)" : "oklch(0.5 0.035 245)");
    const expected = await reference.evaluate((node) => {
      const style = getComputedStyle(node);
      return [style.backgroundColor, style.color, style.opacity];
    });
    const contrasts: number[] = [];
    const enabledColor = await page
      .getByTestId("form-design-two")
      .locator("#document-variableSymbol")
      .evaluate((node) => getComputedStyle(node).color);
    expect(expected[1]).not.toBe(enabledColor);
    const emptyStyle = await page
      .locator("#disabled-empty-select [data-placeholder]")
      .evaluate((node) => getComputedStyle(node).fontStyle);
    expect(emptyStyle).toBe("italic");
    const warning = await reference.evaluate((node) => {
      const canvas = document.createElement("canvas").getContext("2d");
      if (!canvas) throw new Error("Chybí měření barvy");
      canvas.fillStyle = getComputedStyle(node).getPropertyValue("--warning");
      canvas.fillRect(0, 0, 1, 1);
      const expected = Array.from(canvas.getImageData(0, 0, 1, 1).data);
      canvas.fillStyle = getComputedStyle(node).borderColor;
      canvas.fillRect(0, 0, 1, 1);
      return { expected, actual: Array.from(canvas.getImageData(0, 0, 1, 1).data) };
    });
    expect(warning.actual).toEqual(warning.expected);
    for (const control of controls) {
      const actual = await control.evaluate((node) => {
        const style = getComputedStyle(node);
        return [style.backgroundColor, style.color, style.opacity];
      });
      expect(actual.slice(1)).toEqual(expected.slice(1));
      if (await control.getAttribute("id")) expect(actual[0]).toBe(expected[0]);
      const contrast = await control.evaluate((node) => {
        const context = document.createElement("canvas").getContext("2d");
        if (!context) throw new Error("Chybí měření barev");
        const rgb = (color: string) => {
          context.clearRect(0, 0, 1, 1);
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return Array.from(context.getImageData(0, 0, 1, 1).data);
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
            (value, i) => (layer[i] * layer[3]) / 255 + value * (1 - layer[3] / 255),
          );
        }
        const foreground = rgb(getComputedStyle(node).color).slice(0, 3);
        const luminance = (values: number[]) =>
          values
            .map((value) => {
              const channel = value / 255;
              return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
        const a = luminance(background);
        const b = luminance(foreground);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      contrasts.push(contrast);
      console.log(
        `KONTRAST ${dark ? "tmavý" : "světlý"} ${(await control.getAttribute("id")) ?? (await control.getAttribute("aria-label")) ?? "akce"}: ${contrast.toFixed(2)}`,
      );
    }
    await info.attach(dark ? "Tmavý kontrast" : "Světlý kontrast", {
      body: JSON.stringify(contrasts),
      contentType: "application/json",
    });
    await info.attach(dark ? "Tmavý doklad" : "Světlý doklad", {
      body: await form.screenshot(),
      contentType: "image/png",
    });
  }
});
