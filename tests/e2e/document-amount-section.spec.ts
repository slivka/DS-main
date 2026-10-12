/** Částka dokladu · standardní výška a tučný součet při aplikačním zoomu. */
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1280, height: 1800 } });

test("Částka sdílí výšku, písmo a osu popisků s VS", async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  const form = page.getByTestId("form-design-two");
  await expect(form).toHaveAttribute("data-ready", "true", { timeout: 60_000 });
  const total = form.locator("#document-amountTotal");
  const sum = form.getByRole("button", { name: "Sčítá se z rozpisu", exact: true });
  await total.fill("1234567,89");
  await total.blur();
  for (const zoom of [1, 1.5, 2]) {
    await page.evaluate(async (value) => {
      const path = "/src/lib/app-zoom.ts";
      const module = await import(/* @vite-ignore */ path);
      module.setAppZoom(value);
    }, zoom);
    for (const computed of [false, true]) {
      if ((await sum.getAttribute("aria-pressed")) !== String(computed)) await sum.click();
      await expect(sum).toHaveAttribute("aria-pressed", String(computed));
      await expect(async () => {
        const measured = await form.evaluate((root) => {
          const input = root.querySelector<HTMLInputElement>("#document-variableSymbol");
          const amount = root.querySelector<HTMLInputElement>("#document-amountTotal");
          if (!input || !amount) throw new Error("Chybí VS nebo částka");
          const vsStyle = getComputedStyle(input);
          const style = getComputedStyle(amount);
          const vsLabel = root.querySelector('label[for="document-variableSymbol"]');
          if (!vsLabel) throw new Error("Chybí popisek VS");
          const gap = input.getBoundingClientRect().top - vsLabel.getBoundingClientRect().bottom;
          const fields = [
            "document-rate",
            "document-vat-rate",
            "document-amountTotal",
            "document-currency",
          ].map((id) => {
            const node = root.querySelector(`#${id}`);
            const label = root.querySelector(`label[for="${id}"]`);
            if (!node || !label) throw new Error(`Chybí pole ${id}`);
            const rect = node.getBoundingClientRect();
            return {
              id,
              height: rect.height,
              top: rect.top,
              font: getComputedStyle(node).fontSize,
              family: getComputedStyle(node).fontFamily,
              gap: rect.top - label.getBoundingClientRect().bottom,
            };
          });
          const button = amount.parentElement?.querySelector("button");
          if (!button) throw new Error("Chybí přepínač součtu");
          const rect = amount.getBoundingClientRect();
          const buttonRect = button.getBoundingClientRect();
          return {
            fields,
            gap,
            height: input.getBoundingClientRect().height,
            font: Number.parseFloat(style.fontSize),
            family: vsStyle.fontFamily,
            vsFont: Number.parseFloat(vsStyle.fontSize),
            weight: Number.parseInt(style.fontWeight),
            scroll: amount.scrollWidth,
            client: amount.clientWidth,
            buttonTop: buttonRect.top - rect.top,
            buttonBottom: rect.bottom - buttonRect.bottom,
          };
        });
        for (const field of measured.fields) {
          expect(Math.abs(field.height - measured.height), field.id).toBeLessThanOrEqual(0.5);
          expect(Math.abs(field.gap - measured.gap), field.id).toBeLessThanOrEqual(0.5);
        }
        expect(measured.font).toBeCloseTo(measured.vsFont, 1);
        for (const field of measured.fields.filter((item) => item.id !== "document-currency")) {
          expect(Number.parseFloat(field.font)).toBeCloseTo(measured.vsFont, 1);
          expect(field.family).toBe(measured.family);
        }
        // Celá pole se při velkém zoomu mohou zalomit; v každém řádku sdílí osu.
        for (const field of measured.fields) {
          const row = measured.fields.filter(
            (item) => Math.abs(item.top - field.top) < measured.height,
          );
          expect(
            Math.max(...row.map((item) => item.top)) - Math.min(...row.map((item) => item.top)),
          ).toBeLessThanOrEqual(0.5);
        }
        expect(measured.weight).toBeGreaterThanOrEqual(600);
        expect(measured.scroll).toBeLessThanOrEqual(measured.client);
        expect(measured.buttonTop).toBeGreaterThanOrEqual(0);
        expect(measured.buttonBottom).toBeGreaterThanOrEqual(0);
      }).toPass();
      await testInfo.attach(`Částka ${zoom * 100} % – ${computed ? "rozpis" : "ručně"}`, {
        body: await form.locator('[data-section="document-amount-section"]').screenshot(),
        contentType: "image/png",
      });
    }
  }
});
