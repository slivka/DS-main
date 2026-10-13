/** Výpis · vlastní testy údajů a stavů · nesmí testovat zdrojový text. */
import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  BankStatementForm,
  type BankStatementFormProps,
} from "../../src/components/ds/accounting/bank-statement-form";
import { DsTextsProvider } from "../../src/ds-texts";

afterEach(cleanup);
const base: BankStatementFormProps = {
  value: { date: "2026-10-12", number: "2026/10", note: "Poznámka", bankClosing: null },
  onChange: () => {},
  status: "open",
  book: "Banka",
  currency: "EUR",
  currencySymbol: "€",
  period: "2026",
  bankAccount: "123/0800",
  balances: { opening: 10000, income: 5000, expense: 2500 },
};
function show(props: Partial<BankStatementFormProps> = {}, locale: "cs" | "sk" = "cs") {
  return render(
    <DsTextsProvider locale={locale}>
      <BankStatementForm {...base} {...props} />
    </DsTextsProvider>,
  );
}
test.each([null, 12500, 12550])(
  "BankStatementForm rozdíl při bankovním zůstatku %s",
  (bankClosing) => {
    const view = show({ value: { ...base.value, bankClosing } });
    const difference = view.container.querySelector('[data-slot="bank-statement-difference"]');
    expect(difference?.textContent).toBe(
      bankClosing === null ? "" : bankClosing === 12500 ? "0,00 €" : "50,00 €",
    );
    expect(view.queryByRole("img", { name: "Zůstatek souhlasí" }) !== null).toBe(
      bankClosing === 12500,
    );
    expect(view.getByText("12 500,00 €")).toBeTruthy();
  },
);
test("BankStatementForm mění číslo a poznámku, částku převede bez mezer", () => {
  let result = base.value;
  const view = show({
    onChange: (next) => {
      result = next;
    },
  });
  fireEvent.change(view.getByLabelText("Číslo výpisu"), { target: { value: "2026/11" } });
  expect(result.number).toBe("2026/11");
  fireEvent.change(view.getByLabelText("Konečný zůstatek dle banky"), {
    target: { value: "12 500,50" },
  });
  expect(result.bankClosing).toBe(12500.5);
});
test.each(["checked", "posted"] as const)(
  "BankStatementForm stav %s neumožní editaci",
  (status) => {
    const view = show({ status, onSave: () => {}, onCheckedChange: () => {} });
    expect(view.queryByRole("textbox", { name: "Poznámka" })).toBeNull();
    expect(view.getByRole("button", { name: "Uložit" }).hasAttribute("disabled")).toBe(true);
    expect(
      view.getByRole("button", { name: "Zrušit kontrolu" }).getAttribute("aria-disabled") ===
        "true",
    ).toBe(status === "posted");
  },
);
test("BankStatementForm položky zamknou číslo a zachovají obsah slotu", () => {
  const view = show({ hasItems: true, items: <span>Pohyb aplikace</span> });
  expect(view.queryByRole("textbox", { name: "Číslo výpisu" })).toBeNull();
  expect(view.getAllByText("2026/10")).toHaveLength(2);
  expect(view.getByText("Pohyb aplikace")).toBeTruthy();
});
test("BankStatementForm domácí zůstatky a slovenské texty", () => {
  const view = show(
    {
      home: {
        opening: 250000,
        income: 125000,
        expense: 62500,
        currencySymbol: "zł",
        bankClosing: 312500,
      },
    },
    "sk",
  );
  expect(view.getByRole("heading", { name: "Bankový výpis" })).toBeTruthy();
  expect(view.getByRole("heading", { name: "Zostatky v zł" })).toBeTruthy();
  expect(view.container.querySelectorAll('[data-slot="bank-statement-difference"]')).toHaveLength(
    2,
  );
  expect(view.getAllByText("312 500,00 zł")).toHaveLength(2);
});

test("BankStatementForm ukládá Ctrl/Cmd+S jen při dostupné akci", () => {
  let saves = 0;
  const view = show({
    onSave: () => {
      saves += 1;
    },
    dirty: true,
  });
  fireEvent.keyDown(view.getByLabelText("Poznámka"), { key: "s", ctrlKey: true });
  fireEvent.keyDown(view.getByLabelText("Poznámka"), { key: "s", metaKey: true });
  expect(saves).toBe(2);
  view.rerender(
    <BankStatementForm
      {...base}
      busy
      onSave={() => {
        saves += 1;
      }}
    />,
  );
  fireEvent.keyDown(view.getByLabelText("Poznámka"), { key: "s", ctrlKey: true });
  expect(saves).toBe(2);
  expect(
    view.getByRole("button", { name: "Uložit" }).querySelector(".lucide-loader-circle"),
  ).toBeTruthy();
});

test("BankStatementForm pouze čtené hodnoty mají jméno z popisku", () => {
  const view = show({ status: "checked", value: { ...base.value, bankClosing: 12500 } });
  for (const label of [
    "Číslo výpisu",
    "Poznámka",
    "Konečný zůstatek dle banky",
    "Počáteční zůstatek",
    "Příjmy",
    "Výdaje",
    "Konečný zůstatek",
    "Rozdíl",
  ]) {
    const node = view.getByRole("group", { name: label, exact: true });
    expect(node.getAttribute("data-slot")).toBe(
      label === "Rozdíl" ? "bank-statement-difference" : "field-value",
    );
    expect(node.getAttribute("aria-labelledby")).toBeTruthy();
  }
});
test.each(["cs", "sk"] as const)("BankStatementForm důvody stavů %s", (locale) => {
  const view = show({ status: "posted", onCheckedChange: () => {} }, locale);
  const name = locale === "cs" ? "Zrušit kontrolu" : "Zrušiť kontrolu";
  const action = view.getByRole("button", { name });
  const id = action.getAttribute("aria-describedby");
  expect(id).toBeTruthy();
  expect(view.container.querySelector(`[id="${id}"]`)?.textContent).toBe("Výpis je zaúčtovaný");
});
