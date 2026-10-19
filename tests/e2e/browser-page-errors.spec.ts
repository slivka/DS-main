import { expect, test } from "@playwright/test";

for (const path of ["/components/accounting-forms", "/components/grid", "/components/forms"]) {
  test(`hlavní ukázka ${path} se připojí bez chyby stránky`, async ({ page, browserName }) => {
    test.skip(browserName === "chromium", "Regresní kontrola Firefoxu a WebKitu.");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.stack ?? error.message));
    await page.goto(path);
    if (path === "/components/accounting-forms") {
      await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
    } else if (path === "/components/grid") {
      await expect(page.locator('[data-slot="grid-toolbar"]').first()).toHaveAttribute(
        "data-overflow-level",
        /[0-3]/,
      );
    } else {
      const pane = page.getByTestId("record-dialog-demo-pane");
      await pane.scrollIntoViewIfNeeded();
      // Po SSR je tlačítko viditelné dřív než má handler; opakujeme jen dosud neotevřený dialog.
      await expect(async () => {
        if (!(await page.getByRole("dialog", { name: "Nová kniha" }).isVisible()))
          await page.getByRole("button", { name: "Nový", exact: true }).click();
        await expect(page.getByRole("dialog", { name: "Nová kniha" })).toBeVisible({ timeout: 1000 });
      }).toPass();
      await expect(page.getByRole("dialog", { name: "Nová kniha" })).toBeVisible();
    }
    expect(errors, errors.join("\n")).toEqual([]);
  });
}
