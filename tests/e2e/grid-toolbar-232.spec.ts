import { expect, test } from "@playwright/test";

for (const width of [620, 800, 1100, 1440]) {
  test(`řádek akcí se neořízne při ${width} px`, async ({ page }) => {
    await page.goto("/components/grid");
    const grid = page.locator('[data-slot="data-grid"]').first();
    await grid.evaluate((element, nextWidth) => {
      const html = element as HTMLElement;
      html.style.width = `${nextWidth}px`;
      html.style.maxWidth = "100%";
    }, width);
    const toolbar = grid.locator('[data-slot="grid-toolbar"]');
    await expect(toolbar).toHaveAttribute("data-overflow-level", /[0-3]/);
    await page.waitForTimeout(300);
    const toolbarBox = await toolbar.boundingBox();
    const visibleControls = toolbar.locator("button:visible,input:visible");
    const controlBoxes = await visibleControls.evaluateAll((items) => items.map((item) => {
      const box = item.getBoundingClientRect();
      return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
    }));
    expect(toolbarBox).not.toBeNull();
    expect(controlBoxes.every((box) => toolbarBox && box.left >= toolbarBox.x - 1 && box.right <= toolbarBox.x + toolbarBox.width + 1 && box.top >= toolbarBox.y - 1 && box.bottom <= toolbarBox.y + toolbarBox.height + 1)).toBe(true);
    await expect(toolbar.getByRole("button", { name: "Další akce" })).toHaveCount(1);
    const refresh = toolbar.getByRole("button", { name: "Obnovit data" });
    await expect(refresh).toBeVisible();
    const refreshBox = await refresh.boundingBox();
    expect(refreshBox && toolbarBox && refreshBox.x + refreshBox.width <= toolbarBox.x + toolbarBox.width + 1).toBe(true);
  });
}