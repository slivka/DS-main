import { expect, test } from "@playwright/test";

for (const width of [360, 480, 620, 800, 1100, 1440]) {
  test(`řádek akcí se neořízne při ${width} px`, async ({ page }) => {
    await page.setViewportSize({ width: 1800, height: 1200 });
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
    const controlBoxes = await visibleControls.evaluateAll((items) =>
      items.map((item) => {
        const box = item.getBoundingClientRect();
        return { left: box.left, right: box.right, top: box.top, bottom: box.bottom };
      }),
    );
    expect(toolbarBox).not.toBeNull();
    expect(
      controlBoxes.every(
        (box) =>
          toolbarBox &&
          box.left >= toolbarBox.x - 1 &&
          box.right <= toolbarBox.x + toolbarBox.width + 1 &&
          box.top >= toolbarBox.y - 1 &&
          box.bottom <= toolbarBox.y + toolbarBox.height + 1,
      ),
    ).toBe(true);
    await expect(toolbar.getByRole("button", { name: "Další akce" })).toHaveCount(1);
    const refresh = toolbar.getByRole("button", { name: "Obnovit data" });
    await expect(refresh).toBeVisible();
    const refreshBox = await refresh.boundingBox();
    expect(
      refreshBox &&
        toolbarBox &&
        refreshBox.x + refreshBox.width <= toolbarBox.x + toolbarBox.width + 1,
    ).toBe(true);
    if (width < 620) {
      await toolbar.getByRole("button", { name: "Další akce" }).click();
      await expect(page.getByText("Parametry", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Stav k datu" }).last()).toBeVisible();
    }
  });
}

for (const gridSelector of ['[data-slot="data-grid"]', '[data-slot="tree-grid"]']) {
  test(`pořadí skupin a oddělovače v ${gridSelector}`, async ({ page }) => {
    await page.setViewportSize({ width: 1800, height: 1200 });
    await page.goto("/components/grid");
    const toolbar = page.locator(gridSelector).first().locator('[data-slot="grid-toolbar"]');
    await toolbar.evaluate((element) => {
      (
        element.closest('[data-slot="data-grid"],[data-slot="tree-grid"]') as HTMLElement
      ).style.width = "1440px";
    });
    await expect(toolbar).toHaveAttribute("data-overflow-level", "0");
    const order = await toolbar
      .locator("[data-toolbar-group]")
      .evaluateAll((groups) => groups.map((group) => group.getAttribute("data-toolbar-group")));
    expect(order).toEqual(["find", "display", "data", "menu", "refresh"]);
    const separatorBoxes = await toolbar
      .locator('[data-slot="grid-toolbar-separator"]:visible')
      .evaluateAll((items) =>
        items.map((item) => {
          const box = item.getBoundingClientRect();
          return { left: box.left, right: box.right };
        }),
      );
    const toolbarBox = await toolbar.boundingBox();
    expect(separatorBoxes.length).toBeGreaterThan(0);
    expect(toolbarBox).not.toBeNull();
    expect(
      separatorBoxes.every(
        (separator) =>
          toolbarBox &&
          separator.left > toolbarBox.x + 4 &&
          separator.right < toolbarBox.x + toolbarBox.width - 4,
      ),
    ).toBe(true);
    expect(
      separatorBoxes.every(
        (separator, index) => index === 0 || separator.left - separatorBoxes[index - 1].right > 2,
      ),
    ).toBe(true);
  });
}
for (const width of [700, 800, 900, 1000]) {
  test(`Nový doklad + toolbarLeft + aktivní filtr: Obnovit uvnitř řádku při ${width} px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1800, height: 1200 });
    await page.goto("/components/grid");
    const grid = page.locator('[data-slot="data-grid"]').first();
    await grid.evaluate((element, nextWidth) => {
      (element as HTMLElement).style.width = `${nextWidth}px`;
    }, width);
    const toolbar = grid.locator('[data-slot="grid-toolbar"]');
    await expect(toolbar).toHaveAttribute("data-overflow-level", /[0-3]/);
    await expect(toolbar.locator("[data-toolbar-add]").first()).toBeVisible();
    await page.waitForTimeout(400);
    const box = await toolbar.boundingBox();
    const boxes = await toolbar
      .locator("button:visible,input:visible")
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
    expect(box).not.toBeNull();
    for (const b of boxes) {
      expect(b.left).toBeGreaterThanOrEqual(box!.x - 1);
      expect(b.right).toBeLessThanOrEqual(box!.x + box!.width + 1);
    }
    const refresh = await toolbar.getByRole("button", { name: "Obnovit data" }).boundingBox();
    expect(refresh!.x + refresh!.width).toBeLessThanOrEqual(box!.x + box!.width + 1);
    expect(
      await page.locator("[id]").evaluateAll((els) => {
        const ids = els.map((e) => e.id);
        return ids.length - new Set(ids).size;
      }),
    ).toBe(0);
  });
}

test("360 px s textem v hledání: nic se nevytlačí", async ({ page }) => {
  await page.setViewportSize({ width: 1800, height: 1200 });
  await page.goto("/components/grid");
  const grid = page.locator('[data-slot="data-grid"]').first();
  await grid.evaluate((element) => {
    (element as HTMLElement).style.width = "360px";
  });
  const toolbar = grid.locator('[data-slot="grid-toolbar"]');
  await expect(toolbar).toHaveAttribute("data-overflow-level", "3");
  await toolbar
    .getByRole("button", { name: /Hledat/ })
    .first()
    .click();
  await page.keyboard.type("faktura");
  await page.waitForTimeout(400);
  const box = await toolbar.boundingBox();
  const boxes = await toolbar
    .locator("button:visible,input:visible")
    .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
  for (const b of boxes) expect(b.right).toBeLessThanOrEqual(box!.x + box!.width + 1);
});
