/** Id skutečných polí dokladů · vlastní prohlížečovou matici · nesmí číst zdrojový text. */
import { expect, test } from "@playwright/test";

const common = [
  "number",
  "partner",
  "partner-ico",
  "partner-dic",
  "description",
  "issueDate",
  "accountingDate",
  "amountTotal",
  "currency",
];
const scenarios = [
  {
    code: "FP",
    title: "Přijatá faktura",
    fields: [
      ...common,
      "mainAccountId",
      "bankAccount",
      "paymentMethodId",
      "externalNumber",
      "dueDate",
      "taxDate",
      "vatDate",
      "vatRelevant",
      "variableSymbol",
      "constantSymbol",
      "specificSymbol",
      "rate",
      "rate-note",
    ],
  },
  {
    code: "FV",
    title: "Vydaná faktura",
    fields: [
      ...common,
      "mainAccountId",
      "paymentMethodId",
      "companyBankAccountId",
      "taxDocumentNumber",
      "dueDate",
      "taxDate",
      "vatDate",
      "vatRelevant",
      "variableSymbol",
      "constantSymbol",
      "specificSymbol",
    ],
  },
  { code: "ID", title: "Interní doklad", fields: common },
  {
    code: "PO",
    title: "Pokladní doklad – výdaj",
    fields: [
      ...common,
      "mainAccountId",
      "direction",
      "handedOverBy",
      "externalNumber",
      "taxDocumentNumber",
      "taxDate",
      "vatDate",
      "vatRelevant",
    ],
  },
  {
    code: "BA",
    title: "Bankovní pohyb",
    fields: [
      ...common,
      "mainAccountId",
      "direction",
      "taxDocumentNumber",
      "taxDate",
      "vatDate",
      "vatRelevant",
      "bankAccountKind",
      "movement-account",
      "bank-code",
      "variableSymbol",
      "constantSymbol",
      "specificSymbol",
      "rate",
      "vat-rate",
    ],
  },
];

for (const scenario of scenarios) {
  test(`${scenario.code}: skutečná id všech polí vykreslené varianty`, async ({ page }) => {
    // Přijatá faktura je na stránce Další doklady, bankovní pohyb ve výpisu, ostatní v Editoru dokladů.
    const url =
      scenario.code === "FP"
        ? "/components/accounting-documents"
        : scenario.code === "BA"
          ? "/components/accounting-bank"
          : "/components/accounting-forms";
    await page.goto(url, { waitUntil: "networkidle" });
    await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
    const form = page
      .locator('div[class~="@container"][class~="space-y-4"]')
      .filter({ has: page.getByRole("heading", { name: scenario.title, exact: true }) })
      .first();
    await expect(form).toBeVisible();
    for (const key of scenario.fields) {
      const field = form.locator(`[id="document-${key}"]`);
      await expect(field, `${scenario.code}: document-${key}`).toHaveCount(1);
      await expect(field).toBeVisible();
    }
  });
}

test("Vlastní chyba buňky: oprava částky odstraní rámeček i položku pruhu", async ({ page }) => {
  await page.goto("/components/accounting-documents", { waitUntil: "networkidle" });
  await expect(page.getByTestId("accounting-forms-nav")).toHaveAttribute("data-ready", "true");
  const form = page
    .locator('div[class~="@container"][class~="space-y-4"]')
    .filter({ has: page.getByRole("heading", { name: "Interní doklad", exact: true }) })
    .last();
  const cell = form.locator('[data-cell-key$=":amount"]').first();
  await cell.click();
  const input = cell.locator("input");
  await input.fill("0");
  await input.press("Enter");
  await expect(cell).toHaveAttribute("aria-invalid", "true");
  const bar = form.locator('[data-slot="form-issues-bar"]');
  await expect(bar).toContainText(/Částka/);
  await expect(bar).not.toContainText("– amount:");
  await cell.click();
  await cell.locator("input").fill("12 500");
  await cell.locator("input").press("Enter");
  await expect(cell).not.toHaveAttribute("aria-invalid", "true");
  await expect(cell.locator('[data-slot="field-feedback"]')).toHaveCount(0);
  await expect(bar).toHaveCount(0);
});
