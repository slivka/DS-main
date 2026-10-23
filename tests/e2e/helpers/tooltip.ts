/** Společné ověření bublin skutečným vstupem uživatele, i po přepočtu gridu. */
import { expect, type Locator, type Page } from "@playwright/test";

interface TooltipExpectationOptions {
  /** Klávesnice, klik a dotyk se ověřují samostatně, nikoli náhradním hoverem. */
  interaction?: "hover" | "keyboard" | "click" | "tap";
  /** Celková mez opakovaného vstupu při oživení a posunu stránky. */
  timeoutMs?: number;
}

/** Vyhledá bublinu podle role i obsahu; opakuje vstup, ne syntetické události. */
export async function expectTooltip(
  page: Page,
  trigger: Locator,
  text: string,
  { interaction = "hover", timeoutMs = 20_000 }: TooltipExpectationOptions = {},
) {
  const tooltip = page.getByRole("tooltip").filter({ hasText: text }).first();
  await expect(async () => {
    await trigger.scrollIntoViewIfNeeded({ timeout: 3_000 });
    // Vysoké ukázky se při hydrataci posouvají; cíl nesmí zůstat pod sticky lištou.
    await trigger.evaluate((node) => node.scrollIntoView({ block: "center", inline: "nearest" }));
    await expect(trigger).toBeVisible({ timeout: 3_000 });
    // PointerLeave zavírá Radix bublinu i při předchozím focus; nový Tab musí přijít až poté.
    await trigger.evaluate((node) => {
      if (node instanceof HTMLElement) node.blur();
    });
    await page.mouse.move(0, 0);
    await expect(tooltip).not.toBeVisible({ timeout: 3_000 });
    if (interaction === "keyboard") {
      expect(
        await trigger.evaluate((node) => node instanceof HTMLElement && node.tabIndex >= 0),
      ).toBe(true);
      await trigger.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(trigger).toBeFocused({ timeout: 2_000 });
    } else if (interaction === "click") {
      // aria-disabled musí zůstat klikatelné kvůli vysvětlení; Playwright je bere jako disabled.
      const blocked = (await trigger.getAttribute("aria-disabled")) === "true";
      await trigger.click({ timeout: 3_000, force: blocked });
    } else if (interaction === "tap") {
      const blocked = (await trigger.getAttribute("aria-disabled")) === "true";
      await trigger.tap({ timeout: 3_000, force: blocked });
    } else {
      await trigger.hover({ timeout: 3_000 });
    }
    await expect(tooltip).toBeVisible({ timeout: 3_000 });
    await expect(tooltip).toContainText(text, { timeout: 3_000 });
  }).toPass({ timeout: timeoutMs, intervals: [250, 500, 1_000] });
  return tooltip;
}
