/** Zamčená pole · skutečná geometrie a fokus · nesmí číst zdroj souborů. */
import { expect, test } from "@playwright/test";
test("zamčené datum sdílí šířku výběru a odkaz chyby zaměří zámek", async ({ page }) => {
  await page.goto("/components/accounting-forms", { waitUntil: "networkidle" });
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
  await page.evaluate(async () => {
    const reactPath = "/node_modules/.vite/deps/react.js";
    const domPath = "/node_modules/.vite/deps/react-dom_client.js";
    const formPath = "/src/components/ds/accounting/document-form/DocumentForm.tsx";
    const React = (await import(/* @vite-ignore */ reactPath)).default;
    const ReactDom = (await import(/* @vite-ignore */ domPath)).default;
    const { DocumentForm } = await import(/* @vite-ignore */ formPath);
    const node = document.createElement("div");
    node.id = "date-width-test";
    document.body.replaceChildren(node);
    const props = {
      title: "Test data",
      documentType: "BA",
      status: "draft",
      value: {
        issueDate: "2026-10-20",
        accountingDate: "2026-10-20",
        currency: "EUR",
        amountTotal: 10,
        totalMode: "entered",
      },
      onChange: () => {},
      lines: [],
      onLinesChange: () => {},
      books: [],
      accounts: [],
      homeCurrency: "EUR",
      mainSide: "D",
    };
    ReactDom.createRoot(node).render(
      React.createElement(
        "div",
        {},
        React.createElement(
          "div",
          { id: "editable-date" },
          React.createElement(DocumentForm, props),
        ),
        React.createElement(
          "div",
          { id: "locked-date" },
          React.createElement(DocumentForm, {
            ...props,
            editableFields: [],
            fieldLockedReasons: { issueDate: "Převzato z banky" },
            issues: [
              {
                fieldId: "document-issueDate",
                label: "Datum pohybu",
                message: "Ověřte datum banky",
                severity: "error",
                source: "server",
              },
            ],
          }),
        ),
      ),
    );
  });
  const editable = page.locator("#editable-date #document-issueDate");
  const locked = page.locator("#locked-date #document-issueDate");
  await expect(locked).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 1800 });
    await expect
      .poll(async () => {
        const a = await editable.boundingBox();
        const b = await locked.boundingBox();
        return Math.abs((a?.width ?? 0) - (b?.width ?? -10));
      })
      .toBeLessThan(1);
  }
  // Id polí jsou v reálném formuláři jedinečná; porovnávací kopii před navigací odstraníme.
  await page.locator("#editable-date").evaluate((node) => node.remove());
  await page.getByRole("button", { name: "Datum pohybu: Ověřte datum banky" }).click();
  await expect(page.getByRole("button", { name: "Převzato z banky", exact: true })).toBeFocused();
});
