/** 13g · dvě primární akce lišty ve třech šířkách a DUZP u BA. */
import { expect, test } from "@playwright/test";

test("lišta: plné texty, zkrácené texty a sloučená nabídka", async ({ page }) => {
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  const wide = page.getByTestId("primary-actions-wide");
  const short = page.getByTestId("primary-actions-short");
  const narrow = page.getByTestId("primary-actions-menu");
  await wide.scrollIntoViewIfNeeded();
  await expect(wide.locator("[data-toolbar-add]:visible span:visible")).toHaveText([
    "Nový příjem",
    "Nový výdaj",
  ]);
  await short.scrollIntoViewIfNeeded();
  // Počká, až lišta po vstupu do viewportu změří režim popisků; jinak se ve
  // Firefoxu pod zátěží čte ještě plný text.
  await expect(short.locator('[data-slot="grid-toolbar"]')).toHaveAttribute(
    "data-add-labels",
    "short",
  );
  await expect(short.locator("[data-toolbar-add]:visible span:visible")).toHaveText([
    "Příjem",
    "Výdaj",
  ]);
  // Lišta gridu se vykreslí až po vstupu do viewportu; ukázka nad ní může stránku posunout.
  await narrow.evaluate((node) => node.scrollIntoView({ block: "center" }));
  await expect(narrow.locator("[data-overflow-level]")).toHaveAttribute("data-overflow-level", "3");
  await narrow.evaluate((node) => node.scrollIntoView({ block: "center" }));
  const menu = narrow.locator('[data-slot="grid-add-menu"]');
  await expect(menu).toBeVisible();
  await expect(menu).toHaveAttribute("aria-haspopup", "menu");
  await expect(narrow.locator("[data-toolbar-add]:visible")).toHaveCount(0);
  await menu.click();
  await page.getByRole("menuitem", { name: "Výdaj" }).click();
  await expect(page.getByTestId("primary-actions-last")).toHaveText(
    "Poslední akce: Pokladna – úzký panel: výdaj",
  );
  await menu.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Příjem" }).press("Enter");
  await expect(page.getByTestId("primary-actions-last")).toHaveText(
    "Poslední akce: Pokladna – úzký panel: příjem",
  );
});
test("BA výdaj v EUR s DPH ukazuje DUZP, Datum DPH a Kurz DPH", async ({ page }) => {
  await page.goto("/components/accounting-bank", { waitUntil: "networkidle" });
  const form = page.getByTestId("bank-vat-example");
  await form.scrollIntoViewIfNeeded();
  await expect(form.getByText("DUZP", { exact: true })).toBeVisible();
  await expect(form.getByText("Datum DPH", { exact: true })).toBeVisible();
  await expect(form.getByText("Kurz DPH", { exact: true })).toBeVisible();
});

test("lišta na hranicích plné → zkrácené → nabídka nepřetéká", async ({ page }) => {
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  const box = page.getByTestId("primary-actions-wide");
  await box.scrollIntoViewIfNeeded();
  const toolbar = box.locator('[data-slot="grid-toolbar"]');
  const modes = new Set<string>();
  for (const width of [960, 640, 400, 340, 320, 300, 290, 280, 270, 260, 250, 240, 230, 220, 208]) {
    await box.evaluate((node, value) => {
      node.style.width = `${value}px`;
    }, width);
    await expect
      .poll(async () =>
        toolbar.evaluate((node) => {
          const rect = node.getBoundingClientRect();
          return (
            node.scrollWidth <= node.clientWidth &&
            Array.from(node.querySelectorAll<HTMLElement>("button"))
              .filter((button) => button.getBoundingClientRect().width > 0)
              .every((button) => {
                const edge = button.getBoundingClientRect();
                return edge.left >= rect.left && edge.right <= rect.right;
              })
          );
        }),
      )
      .toBe(true);
    const mode = await toolbar.evaluate((node) =>
      node.dataset.overflowLevel === "3" ? "menu" : (node.dataset.addLabels ?? "full"),
    );
    modes.add(mode);
  }
  expect([...modes]).toEqual(["full", "short", "menu"]);
  await toolbar.screenshot({ path: "/tmp/13h/toolbar-boundary.png" });
});

test("zablokovaná akce s důvodem – klik i Enter ukážou důvod, nic nespustí", async ({ page }) => {
  await page.goto("/components/grid", { waitUntil: "networkidle" });
  const reason = "Pokladna je uzavřená – výdaj nelze přidat";
  const wide = page.getByTestId("primary-actions-locked");
  await wide.evaluate((node) => node.scrollIntoView({ block: "center" }));
  const out = wide.locator("[data-toolbar-add]:visible").nth(1);
  await expect(out).toHaveAttribute("aria-disabled", "true");
  // Lišta se po vstupu do viewportu ještě přeměřuje; před každým klikem ji
  // znovu posuneme do zorného pole a klik opakujeme, dokud se důvod neukáže.
  await expect(async () => {
    await wide.evaluate((node) => node.scrollIntoView({ block: "center" }));
    await out.click({ force: true });
    await expect(page.getByRole("tooltip").filter({ hasText: reason }).first()).toBeAttached({
      timeout: 1000,
    });
  }).toPass({ timeout: 15000 });
  await out.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("primary-actions-last")).toHaveText("Poslední akce: –");

  const narrow = page.getByTestId("primary-actions-locked-menu");
  await narrow.evaluate((node) => node.scrollIntoView({ block: "center" }));
  const menu = narrow.locator('[data-slot="grid-add-menu"]');
  await expect(menu).toBeVisible();
  await menu.click();
  const item = page.getByRole("menuitem", { name: "Výdaj", exact: true });
  await expect(item).toHaveAttribute("aria-disabled", "true");
  await expect(item.locator('[data-slot="disabled-reason-text"]')).toHaveText(reason);
  await item.click({ force: true });
  await item.focus();
  await item.press("Enter");
  await expect(page.getByTestId("primary-actions-last")).toHaveText("Poslední akce: –");
});
