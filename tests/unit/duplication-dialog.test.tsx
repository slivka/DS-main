/** Duplikace · ověřuje meze, náhled a callbacky bez doménového výpočtu. */
import { afterEach, expect, test, mock } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { DuplicationDialog } from "../../src/components/ds/templates/duplication-dialog";
import type { DuplicationValue, DuplicationPreviewRow } from "../../src/components/ds/templates/template-types";
import { RecordDialog } from "../../src/components/ds/layout/RecordDialog";
afterEach(cleanup);
const value: DuplicationValue = { mode: "single", date: "2026-11-15", months: 12, day: 15 };
const rows: DuplicationPreviewRow[] = [
  { id: "a", date: value.date, period: "11/2026", description: "Nájem", canCreate: true },
];
const noop = () => {};
const base = {
  open: true,
  onOpenChange: noop,
  value,
  onChange: noop,
  rows,
  storageKey: "duplicate-unit",
  onCreate: noop,
};
test("DuplicationDialog předá jeden doklad s datem APP a sám nezavře", () => {
  const create = mock();
  const close = mock();
  const view = render(<DuplicationDialog {...base} onCreate={create} onOpenChange={close} />);
  fireEvent.click(view.getByRole("button", { name: "Vytvořit" }));
  expect(create).toHaveBeenCalledWith(value);
  expect(close).not.toHaveBeenCalled();
});
test("DuplicationDialog přepne režim přes callback", () => {
  const change = mock();
  const view = render(<DuplicationDialog {...base} onChange={change} />);
  fireEvent.click(view.getByRole("radio", { name: "Série" }));
  expect(change).toHaveBeenCalledWith({ ...value, mode: "series" });
});
for (const [field, limit] of [
  ["months", 24],
  ["day", 31],
] as const) {
  test(`DuplicationDialog ${field} nepřekročí 1–${limit}`, () => {
    function Controlled() {
      const [current, setCurrent] = useState<DuplicationValue>({ ...value, mode: "series" });
      return <DuplicationDialog {...base} value={current} onChange={setCurrent} />;
    }
    const view = render(<Controlled />);
    const input = view.getByRole("spinbutton", {
      name: field === "months" ? "Počet měsíců" : "Den v měsíci",
    });
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.blur(input);
    expect(input.getAttribute("aria-valuenow")).toBe(String(limit));
    fireEvent.change(input, { target: { value: "0" } });
    fireEvent.blur(input);
    expect(input.getAttribute("aria-valuenow")).toBe("1");
  });
}
test("DuplicationDialog bez vytvořitelného řádku zakáže i submit klávesou", () => {
  const create = mock();
  const view = render(
    <DuplicationDialog
      {...base}
      rows={rows.map((row) => ({ ...row, canCreate: false, problem: "Uzavřené období" }))}
      onCreate={create}
    />,
  );
  expect(view.getByRole("button", { name: "Vytvořit" }).hasAttribute("disabled")).toBe(true);
  const form = view.getByRole("dialog").querySelector("form");
  if (!form) throw new Error("Chybí formulář");
  fireEvent.submit(form);
  expect(create).not.toHaveBeenCalled();
});
for (const props of [{ loading: true }, { error: "Chyba náhledu" }]) {
  test(`DuplicationDialog blokuje vytvoření během ${"loading" in props ? "načítání" : "chyby"}`, () => {
    const view = render(<DuplicationDialog {...base} {...props} />);
    expect(view.getByRole("button", { name: "Vytvořit" }).hasAttribute("disabled")).toBe(true);
  });
}
test("DuplicationDialog rozepsaná změna při zavření vyžádá ochranu", () => {
  const close = mock();
  const view = render(<DuplicationDialog {...base} dirty onOpenChange={close} />);
  fireEvent.click(view.getByRole("button", { name: "Zrušit" }));
  expect(view.getByRole("alertdialog")).toBeTruthy();
  expect(close).not.toHaveBeenCalled();
});
test("RecordDialog submitDisabled zachová zavření a potlačí submit", () => {
  const submit = mock();
  const close = mock();
  const view = render(
    <RecordDialog
      open
      size="md"
      title="Test"
      submitDisabled
      onSubmit={submit}
      onOpenChange={close}
    />,
  );
  const form = view.getByRole("dialog").querySelector("form");
  if (!form) throw new Error("Chybí formulář");
  fireEvent.submit(form);
  expect(submit).not.toHaveBeenCalled();
  fireEvent.click(view.getByRole("button", { name: "Zrušit" }));
  expect(close).toHaveBeenCalledWith(false);
});
