import { expect, test } from "@playwright/test";
import { identityMetrics } from "./helpers/identity";
import { expectTooltip } from "./helpers/tooltip";

// Zámek VS v prohlížeči: přijatá FP – náhled z čísla, odemčení zachová hodnotu,
// > 10 číslic zachová vazbu s prázdným náhledem a varováním.
test("VS zámek: náhled, odemčení se stejnou hodnotou, prázdný zamčený náhled při > 10 číslicích", async ({
  page,
}) => {
  await page.goto("/components/accounting-controls", { waitUntil: "networkidle" });
  // Čekat na hydrataci stránky (spolehlivý signál), ne na delší limit.
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
  const external = page.locator("#document-externalNumber").first();
  await external.scrollIntoViewIfNeeded();
  // Stránka má více formulářů se stejnými id – pracujeme v nejbližším společném předkovi.
  const form = external.locator("xpath=ancestor::div[.//*[@id='document-variableSymbol']][1]");
  const vs = form.locator("#document-variableSymbol");
  const lock = form.getByRole("button", { name: "Svázat VS s číslem daňového dokladu" });

  await expect(async () => {
    await external.fill("FA-2026/0456");
    await expect(vs).toHaveValue("20260456");
  }).toPass({ timeout: 30_000 });
  await expect(vs).toHaveAttribute("readonly", "");

  // Odemčení: hodnota z náhledu zůstane v poli.
  await lock.click();
  await expect(vs).not.toHaveAttribute("readonly", "");
  await expect(vs).toHaveValue("20260456");

  // Neplatný zdroj zámek nemění; poslední platný náhled se vrátí až při odemčení.
  await lock.click();
  await external.fill("12345678901");
  await expect(vs).toHaveAttribute("readonly", "");
  await expect(vs).toHaveValue("");
  // Varování = žlutý rámeček (aria-invalid je jen pro chyby).
  await expect(vs).toHaveClass(/border-warning/);
  await lock.click();
  await expect(vs).toHaveValue("20260456");
  await expect(vs).not.toHaveClass(/border-warning/);
});

test("PageHeader: střed štítku odpovídá účaří a polovině ex při změně písma", async ({ page }) => {
  await page.goto("/components/design-three");
  await expect(page.getByTestId("design-three")).toHaveAttribute("data-ready", "true");
  await page.evaluate(() => document.fonts.ready);
  for (const zoom of [70, 75, 100, 200]) {
    await page.evaluate((zoom) => {
      document.documentElement.style.fontSize = `${(16 * zoom) / 100}px`;
    }, zoom);
    const diff = await page
      .locator(".page-title-badge")
      .first()
      .evaluate((badge) => {
        const title = badge.closest(".page-title-line")?.querySelector("h1");
        if (!title) throw new Error("Chybí nadpis");
        // Nulová inline schránka měří účaří bez odhadu řádkové výšky či Canvas podpory enginu.
        const baseline = document.createElement("span");
        baseline.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        const x = document.createElement("span");
        x.style.cssText = "display:inline-block;width:0;height:1ex;vertical-align:baseline";
        title.append(baseline, x);
        const box = badge.getBoundingClientRect();
        const target = baseline.getBoundingClientRect().top - x.getBoundingClientRect().height / 2;
        baseline.remove();
        x.remove();
        return Math.abs((box.top + box.bottom) / 2 - target);
      });
    expect(diff, `zoom ${zoom}`).toBeLessThanOrEqual(1);
  }
});

test("PageHeader: dlouhý nadpis ve 360 px se zkrátí, štítek zůstane celý", async ({ page }) => {
  await page.goto("/components/design-three");
  await expect(page.getByTestId("design-three")).toHaveAttribute("data-ready", "true");
  const result = await page
    .locator(".page-title-badge")
    .first()
    .evaluate((badge) => {
      const line = badge.closest(".page-title-line");
      const header = line?.parentElement?.parentElement?.parentElement;
      const title = line?.querySelector("h1");
      if (!line || !header || !title) throw new Error("Chybí záhlaví");
      title.textContent = "Daňový doklad k přijaté záloze – velmi dlouhý nadpis panelu";
      header.style.width = "360px";
      const row = line.getBoundingClientRect();
      const b = badge.getBoundingClientRect();
      return {
        overflow: header.scrollWidth - header.clientWidth,
        lineOverflow: line.scrollWidth - line.clientWidth,
        badgeInside: b.left >= row.left - 1 && b.right <= row.right + 1,
        truncated: title.scrollWidth > title.clientWidth,
        ellipsis: getComputedStyle(title).textOverflow,
        nowrap: getComputedStyle(title).whiteSpace,
      };
    });
  expect(result.overflow).toBeLessThanOrEqual(0);
  expect(result.lineOverflow).toBeLessThanOrEqual(0);
  expect(result.badgeInside).toBe(true);
  expect(result.truncated).toBe(true);
  expect(result.ellipsis).toBe("ellipsis");
  expect(result.nowrap).toBe("nowrap");
});

test("GridToolbar: všechny prvky sdílejí výšku při min, 75 %, 100 % a max", async ({ page }) => {
  for (const route of ["grid", "accounting-controls", "accounting-bank", "record-panel"]) {
    // Lištu vykreslí už SSR, ale hydratace ještě stahuje kód stránky. WebKit při odchodu
    // přerušený import odmítne „Importing a module script failed“ a TanStack Router to
    // vyhodnotí jako chybějící modul a stránku obnoví – další page.goto se pak přeruší.
    // Proto se před měřením a odchodem čeká na dokončení všech požadavků.
    await page.goto(`/components/${route}`, { waitUntil: "networkidle" });
    await expect(page.locator('[data-slot="grid-toolbar"]').first()).toBeVisible();
    for (const zoom of [0.6, 0.75, 1, 1.4]) {
      const metrics = await page.locator('[data-slot="grid-toolbar"]').evaluateAll(
        (bars, zoom) =>
          bars.map((bar) => {
            if (!(bar instanceof HTMLElement)) throw new Error("Chybí lišta");
            bar.style.fontSize = `${14 * zoom}px`;
            const heights = Array.from(bar.querySelectorAll<HTMLElement>("button,input"))
              .filter(
                (control) =>
                  control.getClientRects().length && !control.closest('[aria-hidden="true"]'),
              )
              .map((control) => control.getBoundingClientRect().height);
            return heights.length ? Math.max(...heights) - Math.min(...heights) : 0;
          }),
        zoom,
      );
      for (const difference of metrics)
        expect(difference, `${route} ${zoom}`).toBeLessThanOrEqual(0.5);
    }
  }
});

test("IdentityLine: 360/480 px i maximální zoom drží jedinou výšku bez překryvu", async ({
  page,
}) => {
  await page.goto("/components/design-three");
  await expect(page.getByTestId("design-three")).toHaveAttribute("data-ready", "true");
  for (const width of [360, 480]) {
    await page.getByTestId("identity-demo").evaluate((demo, width) => {
      demo.style.width = `${width}px`;
      document.documentElement.style.fontSize = "32px";
    }, width);
    await expect(async () => {
      const metrics = await page
        .locator('[data-slot="document-identity"]')
        .evaluate(identityMetrics);
      expect(metrics.difference, `výška při ${width} px`).toBeLessThanOrEqual(0.5);
      expect(metrics.overlaps, `překryv při ${width} px`).toEqual([]);
    }).toPass();
    const status = page.locator('[data-slot="identity-status-text"]');
    const level = Number(
      await page.locator('[data-slot="identity-line-row"]').getAttribute("data-identity-level"),
    );
    if (level >= 7) await expect(status.locator("svg")).toBeVisible();
    else await expect(status).toHaveText("Koncept");
    await expect(status).toHaveAttribute("aria-label", "Koncept – číslo při zařazení");
    await expect(page.locator('[data-slot="identity-line-row"]')).not.toHaveAttribute(
      "data-stacked",
    );
    await expectTooltip(page, status, "Koncept – číslo při zařazení");
    await page.mouse.move(0, 0);
  }
});
