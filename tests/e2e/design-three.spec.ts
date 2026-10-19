import { expect, test } from "@playwright/test";

async function ready(page: import("@playwright/test").Page) {
  await page.goto("/components/design-three");
  await expect(page.locator('[data-testid="design-three"][data-ready="true"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
}
for (const zoom of [70, 100, 200]) {
  for (const width of [1280, 560]) {
    test(`IdentityLine stálá výška ${zoom}% při šířce ${width}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 1800 });
      await ready(page);
      await page.evaluate(
        ({ zoom, width }) => {
          document.documentElement.style.fontSize = `${(16 * zoom) / 100}px`;
          const demo = document.querySelector<HTMLElement>('[data-testid="identity-demo"]');
          if (demo) demo.style.width = `${width}px`;
        },
        { zoom, width },
      );
      const demo = page.getByTestId("identity-demo");
      const identity = demo.locator('[data-slot="document-identity"]');
      const field = demo.getByRole("textbox", { name: "První pole" });
      await demo.getByRole("button", { name: "Změnit účet", exact: true }).scrollIntoViewIfNeeded();
      const before = await identity.boundingBox();
      const fieldBefore = await field.boundingBox();
      await demo.getByRole("button", { name: "Změnit účet", exact: true }).click();
      await expect(demo.getByRole("combobox")).toBeVisible();
      const after = await identity.boundingBox();
      const accountBox = demo.locator(".document-identity-account-box");
      const accountMetrics = await accountBox.evaluate((e) => ({
        width: e.getBoundingClientRect().width,
        rootSize: parseFloat(getComputedStyle(document.documentElement).fontSize),
        label: e.querySelector('[role="combobox"] .truncate')?.getBoundingClientRect().width ?? 0,
        labelOverflow: (() => {
          const label = e.querySelector<HTMLElement>('[role="combobox"] .truncate');
          return label ? label.scrollWidth - label.clientWidth : 0;
        })(),
      }));
      if (width === 1280)
        expect(accountMetrics.width + 1 / 64).toBeGreaterThanOrEqual(18 * accountMetrics.rootSize);
      if (width === 1280) expect(accountMetrics.labelOverflow).toBeLessThanOrEqual(1);
      expect(accountMetrics.label).toBeGreaterThan(0);
      const fieldAfter = await field.boundingBox();
      expect(before).not.toBeNull();
      expect(after).not.toBeNull();
      expect(Math.abs((before?.height ?? 0) - (after?.height ?? 0))).toBeLessThan(1);
      expect(
        Math.abs(
          (fieldBefore?.y ?? 0) - (before?.y ?? 0) - ((fieldAfter?.y ?? 0) - (after?.y ?? 0)),
        ),
      ).toBeLessThan(1);
    });
  }
}
test("Calendar zachovává velikost popoveru ve třech pohledech", async ({ page }) => {
  await ready(page);
  await page.getByRole("button", { name: "Otevřít kalendář", exact: true }).click();
  const shell = page
    .getByRole("dialog")
    .filter({ has: page.locator('[data-slot="calendar-shell"]') });
  await shell.evaluate(async (e) => {
    await Promise.all(e.getAnimations().map((a) => a.finished));
  });
  const days = await shell.boundingBox();
  await shell.getByRole("button", { name: /říjen 2026/i }).click();
  const months = await shell.boundingBox();
  await shell.getByRole("button", { name: "2026", exact: true }).click();
  const years = await shell.boundingBox();
  for (const box of [months, years]) {
    expect(box?.width).toBe(days?.width);
    expect(box?.height).toBe(days?.height);
  }
  await page.keyboard.press("Escape");
  await expect(shell.getByRole("button", { name: "leden" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(shell.getByRole("button", { name: /říjen 2026/i })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(shell).not.toBeVisible();
});
test("Button zakázané bez výplně, stav uložení nemění rozměry", async ({ page }) => {
  await ready(page);
  const bar = page.locator('[data-slot="record-action-buttons"]').first();
  const save = bar.getByRole("button", { name: "Uložit", exact: true });
  await expect(save).toBeDisabled();
  const before = await save.boundingBox();
  expect(await save.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
  await page.getByRole("textbox", { name: "Popis ukázky" }).fill("Změna");
  await expect(save).toBeEnabled();
  const after = await save.boundingBox();
  expect(after?.height).toBe(before?.height);
});
test("StatusBadge i Badge optické centrování velkých písmen", async ({ page }) => {
  await ready(page);
  const metrics = await page
    .locator(
      '[data-testid="design-three"] > [data-slot="page-header"] .ds-badge-text, [data-testid="design-three"] > .ds-badge .ds-badge-text',
    )
    .evaluateAll((elements) =>
      elements.map((e) => {
        const s = getComputedStyle(e);
        const text = e.textContent ?? "";
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas unavailable");
        ctx.font = `${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
        const cap = ctx.measureText("H");
        const box = e.getBoundingClientRect();
        const badge = e.closest(".ds-badge")?.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(e);
        const r = range.getBoundingClientRect();
        const font = ctx.measureText(text);
        const baseline =
          r.top +
          (r.height - font.fontBoundingBoxAscent - font.fontBoundingBoxDescent) / 2 +
          font.fontBoundingBoxAscent;
        const top = baseline - cap.actualBoundingBoxAscent;
        const bottom = baseline + cap.actualBoundingBoxDescent;
        return {
          diff: badge ? Math.abs(top - badge.top - (badge.bottom - bottom)) : 100,
          text,
          box,
        };
      }),
    );
  for (const metric of metrics) expect(metric.diff, metric.text).toBeLessThanOrEqual(0.5);
});

test("DocumentDirectionBadge a DocumentStatusBadge mají stejnou výšku", async ({ page }) => {
  await ready(page);
  const status = page
    .locator('[data-testid="design-three"] > [data-slot="page-header"] .ds-badge')
    .first();
  const direction = page
    .getByTestId("identity-demo")
    .locator('[data-slot="document-direction-badge"]');
  const statusHeight = (await status.boundingBox())?.height;
  const directionHeight = (await direction.boundingBox())?.height;
  expect(statusHeight).toBeDefined();
  expect(directionHeight).toBeDefined();
  // Enginy zaokrouhlují rem na různé subpixely; smlouva dovoluje nejvýše 0,5 px.
  expect(Math.abs((directionHeight ?? 0) - (statusHeight ?? 0))).toBeLessThanOrEqual(0.5);
});

test("PageHeader neořezává diakritiku ani dotahy nadpisu", async ({ page }) => {
  await ready(page);
  const title = page.getByRole("heading", { name: "Účetní doklady – Ýy", exact: true });
  const metrics = await title.evaluate((e) => {
    const range = document.createRange();
    range.selectNodeContents(e);
    const text = range.getBoundingClientRect();
    const box = e.getBoundingClientRect();
    return {
      scroll: e.scrollHeight,
      client: e.clientHeight,
      textTop: text.top,
      textBottom: text.bottom,
      top: box.top,
      bottom: box.bottom,
    };
  });
  expect(metrics.scroll).toBeLessThanOrEqual(metrics.client);
  expect(metrics.textTop).toBeGreaterThanOrEqual(metrics.top);
  expect(metrics.textBottom).toBeLessThanOrEqual(metrics.bottom);
});

test("MonthYearSelect Escape zavře a Vymazat obnoví prázdný výběr", async ({ page }) => {
  await ready(page);
  const trigger = page.getByRole("button", { name: "Měsíc / Rok", exact: true });
  await trigger.click();
  await expect(page.getByRole("button", { name: "říjen", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("group", { name: "Měsíc" })).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await page.getByRole("button", { name: "Vymazat", exact: true }).click();
  await expect(trigger).toHaveText("Měsíc / Rok");
});

test("Pás záložek v úzkém panelu ořezává vodorovný přesah i při přetažení", async ({ page }) => {
  await ready(page);
  await page.getByRole("button", { name: "3 panely", exact: true }).click();
  const strip = page.locator(".design-three-panes [data-tab-strip]").first();
  const tab = strip.locator("[data-tab-id]").first();
  const box = await tab.boundingBox();
  if (!box) throw new Error("Chybí záložka");
  await page.mouse.move(box.x + 30, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 80, box.y + box.height / 2, { steps: 12 });
  const metrics = await strip.evaluate((e) => {
    const box = e.getBoundingClientRect();
    const tab = e.querySelector("[data-tab-id]")?.getBoundingClientRect();
    const outside = document.elementFromPoint(box.left - 2, box.top + box.height / 2);
    return {
      clip: getComputedStyle(e).clipPath,
      left: box.left,
      tabLeft: tab?.left,
      leaked: Boolean(outside?.closest("[data-tab-id]")),
    };
  });
  expect(metrics.clip).toBe("inset(0px 0px -1px)");
  expect(metrics.tabLeft).toBeLessThan(metrics.left);
  expect(metrics.leaked).toBe(false);
  await page.mouse.up();
});
