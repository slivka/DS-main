/** Volitelná měna náhledu nesmí měnit částky ani původní formát. */
import { afterEach, expect, it } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { AdvanceCorrectionDialog } from "../../src/components/ds/accounting/advances/advance-correction-dialog";
afterEach(cleanup);
for (const currencyCode of [undefined, "EUR"]) {
  it(`náhled zachová částky ${currencyCode ? "s měnou APP" : "bez měny"}`, () => {
    render(<AdvanceCorrectionDialog open onOpenChange={() => {}} onDecision={() => {}}
      storageKey={`currency-${currencyCode ?? "none"}`} currencyCode={currencyCode}
      rows={[{ id: "a", document: "DD1", base: -12540.5, vat: -2633.51 }]} />);
    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent?.replace(/\s+/g, " ").trim());
    expect(cells).toContain(currencyCode ? "−12 540,50EUR" : "−12 540,50");
    expect(cells).toContain(currencyCode ? "−2 633,51EUR" : "−2 633,51");
  });
}