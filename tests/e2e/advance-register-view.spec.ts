/** Evidence záloh se záložkami: sdílené datum, varování rozdílu, lišta bez zalomení při zoomu. */
import { expect, test, type Page } from "@playwright/test";

async function setRootZoom(page: Page, zoom: number) {
  await page.evaluate((z) => {
    document.documentElement.style.fontSize = `${16 * z}px`;
    window.dispatchEvent(new Event("app:zoom-change"));
  }, zoom);
  await page.waitForFunction(
    () => {
      const w: Window & { __lastH?: number } = window;
      const h = document.documentElement.scrollHeight;
      const stable = w.__lastH === h;
      w.__lastH = h;
      return stable;
    },
    undefined,
    { polling: 100 },
  );
}

test("přepnutí záložek zachová Stav k datu, rozdíl varuje, lišta se nezalomí", async ({ page }) => {
  await page.goto("/components/accounting-advances", { waitUntil: "networkidle" });
  const view = page.getByTestId("advance-register-view-provided");
  await expect(view).toBeVisible();
  const date = view.locator('[data-slot="advance-register-as-of"] input').first();
  const before = await date.inputValue();
  expect(before).not.toBe("");

  const warning = view.locator('[data-slot="advance-difference-warning"]');
  await expect(warning).toHaveCount(1);
  await expect(warning).toHaveAttribute("tabindex", "0");
  // Skutečný Tab znovu vstoupí do spouštěče i po oživení/rolování gridu;
  // samotný focus() nebo hover před přestavbou řádku může zaniknout.
  await expect(async () => {
    await warning.focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(warning).toBeFocused();
    // Opakujeme skutečný vstup, pokud přepočet gridu nahradí spouštěč.
    await page.mouse.move(0, 0);
    await warning.hover();
    await expect(page.getByRole("tooltip")).toContainText("nesouhlasí", { timeout: 2_000 });
  }).toPass({ timeout: 20_000 });

  for (const name of ["Platby záloh", "Vyúčtování záloh", "Zůstatek"]) {
    await view.getByRole("tab", { name }).click();
    await expect(view.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
    await expect(date).toHaveValue(before);
  }

  await view.getByRole("tab", { name: "Platby záloh" }).click();
  for (const zoom of [0.7, 1.5]) {
    await setRootZoom(page, zoom);
    const toolbar = view.locator('[data-slot="grid-toolbar"]').first();
    const metrics = await toolbar.evaluate((node) => {
      const tops = [...node.querySelectorAll<HTMLElement>("button, input")]
        .filter((el) => el.offsetParent !== null && !el.closest(".grid-toolbar-measure-copy"))
        .map((el) => Math.round(el.getBoundingClientRect().top + el.offsetHeight / 2));
      return {
        spread: Math.max(...tops) - Math.min(...tops),
        overflow: node.scrollWidth - node.clientWidth,
      };
    });
    expect(metrics.spread, `lišta při zoomu ${zoom}`).toBeLessThanOrEqual(4);
    expect(metrics.overflow, `přetečení při zoomu ${zoom}`).toBeLessThanOrEqual(1);
  }
});
