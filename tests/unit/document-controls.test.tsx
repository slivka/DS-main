/** Ovládání dokladů · vlastní testy interakcí · nesmí číst zdrojové soubory. */
import { afterEach, expect, test } from "bun:test";
import { useState } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { StepperInput } from "../../src/components/ds/form/stepper-input";
import { DateField } from "../../src/components/ds/form/date-field";
import { TaxDocumentNumberField } from "../../src/components/ds/accounting/document-form/tax-document-number-field";
import { applyDocumentDateLinks } from "../../src/components/ds/accounting/document-form/document-date-linking";
import { shiftDocumentDate } from "../../src/lib/date-quick-options";
import { BankStatementForm } from "../../src/components/ds/accounting/bank-statement-form";
import { OptionSelect } from "../../src/components/ds/form/option-select";
import type { DocumentHeaderValue } from "../../src/components/ds/accounting/document-form/document-form-types";

afterEach(cleanup);
const header: DocumentHeaderValue = {
  bookId: "b",
  number: "2026/12",
  issueDate: "2026-01-31",
  accountingDate: "2026-01-31",
  currency: "CZK",
  amountTotal: 0,
};

test("StepperInput rozsah kopií 1–5 platí pro psaní, tlačítka i šipky", () => {
  function Example() {
    const [value, setValue] = useState(1);
    return (
      <TooltipProvider>
        <StepperInput value={value} onChange={setValue} min={1} max={5} aria-label="Kopie" />
      </TooltipProvider>
    );
  }
  const view = render(<Example />);
  const input = view.getByRole("spinbutton") as HTMLInputElement;
  expect((view.getByRole("button", { name: "Snížit" }) as HTMLButtonElement).disabled).toBe(true);
  // Mezistav se ověří až při opuštění pole: mimo rozsah se zarovná na hranici.
  for (const [value, expected] of [
    ["0", "1"],
    ["-1", "1"],
    ["6", "5"],
    ["1", "1"],
  ]) {
    fireEvent.change(input, { target: { value } });
    fireEvent.blur(input);
    expect(input.value).toBe(expected);
  }
  fireEvent.change(input, { target: { value: "12" } });
  expect(input.value).toBe("12");
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input.value).toBe("5");
  fireEvent.click(view.getByRole("button", { name: "Snížit" }));
  fireEvent.click(view.getByRole("button", { name: "Snížit" }));
  fireEvent.click(view.getByRole("button", { name: "Snížit" }));
  fireEvent.click(view.getByRole("button", { name: "Snížit" }));
  fireEvent.change(input, { target: { value: "4" } });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(input.value).toBe("5");
  expect((view.getByRole("button", { name: "Zvýšit" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(input.value).toBe("5");
  fireEvent.click(view.getByRole("button", { name: "Snížit" }));
  expect(input.value).toBe("4");
});

test("Splatnost +14 používá datum vystavení", () => {
  let result = "";
  const view = render(
    <DateField
      value=""
      baseDate="2026-01-31"
      onChange={(date) => {
        result = date;
      }}
    />,
  );
  fireEvent.change(view.getByRole("textbox"), { target: { value: "+14" } });
  fireEvent.blur(view.getByRole("textbox"));
  expect(result).toBe("2026-02-14");
});

test("Kalendářní měsíc od 31. ledna končí posledním dnem února", () => {
  expect(shiftDocumentDate("2026-01-31", 1, "months")).toBe("2026-02-28");
});

test("Navázané účetní datum a dosud nezměněné DUZP sledují vystavení", () => {
  const next = applyDocumentDateLinks(header, { issueDate: "2026-02-14" }, true, true);
  expect(next.accountingDate).toBe("2026-02-14");
  expect(next.taxDate).toBe("2026-02-14");
});

test("Ruční DUZP a samostatné účetní datum změna vystavení nepřepíše", () => {
  const next = applyDocumentDateLinks(
    { ...header, taxDate: "2026-01-15" },
    { issueDate: "2026-02-14" },
    false,
    false,
  );
  expect(next.accountingDate).toBe("2026-01-31");
  expect(next.taxDate).toBe("2026-01-15");
});

test("Daňové číslo po opětovném zamčení obnoví číslo dokladu", () => {
  function Example() {
    const [value, setValue] = useState(header);
    return (
      <TaxDocumentNumberField value={value} patch={(next) => setValue({ ...value, ...next })} />
    );
  }
  const view = render(<Example />);
  const toggle = view.getByRole("button", { name: "Svázat s číslem dokladu" });
  fireEvent.click(toggle);
  fireEvent.change(view.getByRole("textbox"), { target: { value: "Vlastní" } });
  expect((view.getByRole("textbox") as HTMLInputElement).value).toBe("Vlastní");
  fireEvent.click(toggle);
  expect((view.getByRole("textbox") as HTMLInputElement).value).toBe("2026/12");
});

test("Přidání partnera dostane aktuální hledaný text", () => {
  let query = "";
  const view = render(
    <TooltipProvider>
      <OptionSelect
        value=""
        options={[]}
        onChange={() => {}}
        onCreate={(next) => {
          query = next;
        }}
        createLabel="Nový partner"
      />
    </TooltipProvider>,
  );
  fireEvent.click(view.getByRole("combobox"));
  fireEvent.change(view.getByPlaceholderText("Hledat…"), { target: { value: "Firma Alfa" } });
  fireEvent.click(view.getByRole("button", { name: "Nový partner" }));
  expect(query).toBe("Firma Alfa");
});

test("Nový výpis zobrazí stejný grid pohybů bez náhradních tlačítek", () => {
  const view = render(
    <BankStatementForm
      isNew
      value={{ number: "", date: "", bankClosing: null }}
      onChange={() => {}}
      status="open"
      book="Banka"
      currency="EUR"
      currencySymbol="€"
      period="2026"
      bankAccount="IBAN"
      balances={{ opening: 0, income: 0, expense: 0 }}
      items={<div data-testid="grid">grid</div>}
    />,
  );
  expect(view.getByTestId("grid")).toBeDefined();
  expect(view.queryByRole("button", { name: "Výdaj", exact: true })).toBeNull();
  expect(view.queryByText("Pohyby lze zadat po uložení výpisu")).toBeNull();
});
