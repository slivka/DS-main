import { afterEach, expect, it } from "bun:test";
const { cleanup, render } = await import("@testing-library/react");
afterEach(cleanup);
it("nbsp match", () => {
  const view = render(<table><tfoot><tr><td>{"2 650,00"}</td></tr></tfoot></table>);
  const td = view.container.querySelector("td")!;
  console.log("raw:", JSON.stringify(td.textContent));
  expect(view.getByText("2 650,00")).toBeTruthy();
});
