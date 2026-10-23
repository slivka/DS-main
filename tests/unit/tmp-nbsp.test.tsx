import { afterEach, expect, it } from "bun:test";
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { ExtractedItemsTable } = await import("../../src/components/ds/extraction/extracted-items-table");
afterEach(cleanup);
it("table totals", () => {
  const items = [
    { id: "i1", text: "Kancelářské potřeby", quantity: 2, unit: "bal", unitPrice: 1250, vatRate: "21 %", base: 2500, tax: 525 },
    { id: "i2", text: "Doprava", quantity: null, unit: null, unitPrice: null, vatRate: "21 %", base: 150, tax: 31.5 },
  ];
  const view = render(<ExtractedItemsTable items={items} totals={{ base: 2650, tax: 556.5 }} />);
  fireEvent.click(view.getByText("Vytěžené položky (2)"));
  const tds = Array.from(view.container.querySelectorAll("td")).map((t) => JSON.stringify(t.textContent));
  console.log(tds.join(" | "));
  expect(view.getByText("2 650,00")).toBeTruthy();
});
