/** Protiúčet pohybu · automatické rozpoznání IBAN a zachování druhého režimu. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { BankMovementAccount } from "../../src/components/ds/accounting/document-form/bank-movement-account";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form";
afterEach(cleanup);
function Counteraccount() {
  const [value, setValue] = useState<DocumentHeaderValue>({
    currency: "EUR",
    amountTotal: 0,
    totalMode: "entered",
    bankAccount: "19-2000145399",
    bankCode: "0800",
    bankSwift: "TEST",
  });
  return (
    <BankMovementAccount
      value={value}
      patch={(next) => setValue((old) => ({ ...old, ...next }))}
      bankCodes={["0800", "0100"]}
    />
  );
}
test("platný CZ IBAN se převede na účet s předčíslím a kód banky", () => {
  const view = render(<Counteraccount />);
  fireEvent.change(view.getByLabelText("Účet protistrany"), {
    target: { value: "CZ65 0800 0000 1920 0014 5399" },
  });
  expect((view.getByLabelText("Účet protistrany") as HTMLInputElement).value).toBe("19-2000145399");
  expect(view.getByLabelText("Kód banky").textContent).toContain("0800");
});
test("neplatný CZ IBAN zůstane IBAN s chybou a nezničí tuzemský účet", () => {
  const view = render(<Counteraccount />);
  fireEvent.change(view.getByLabelText("Účet protistrany"), {
    target: { value: "CZ66 0800 0000 1920 0014 5399" },
  });
  const input = view.getByLabelText("Účet protistrany") as HTMLInputElement;
  expect(input.value).toBe("CZ6608000000192000145399");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(view.getByLabelText("SWIFT")).toBeDefined();
  fireEvent.click(view.getByRole("button", { name: "Druh účtu" }));
  expect(input.value).toBe("19-2000145399");
});
