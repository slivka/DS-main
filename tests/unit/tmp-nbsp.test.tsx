import { afterEach, expect, it } from "bun:test";
const { cleanup, fireEvent, render, screen } = await import("@testing-library/react");
const { ExtractedItemsTable } = await import("../../src/components/ds/extraction/extracted-items-table");
afterEach(cleanup);
it("table totals", () => {
  const items = [
    { id: "i1", text: "K", quantity: 2, unit: "bal", unitPrice: 1250, vatRate: "21 %", base: 2500, tax: 525 },
  ];
  const view = render(<ExtractedItemsTable items={items} totals={{ base: 2650, tax: 556.5 }} />);
  fireEvent.click(view.getByText("Vytěžené položky (1)"));
  const td = Array.from(view.container.querySelectorAll("td")).find((t) => t.textContent?.includes("650"))!;
  console.log("codepoints:", Array.from(td.textContent!).map((c) => c.codePointAt(0)).join(","));
  const found = screen.queryByText((content, el) => el?.tagName === "TD" && content.includes("650"));
  console.log("fn matcher found:", !!found);
  expect(view.getByText("2 650,00")).toBeTruthy();
});
