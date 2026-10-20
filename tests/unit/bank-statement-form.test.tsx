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
  value: { date: "2026-10-12", number: "2026/10", bankClosing: null },
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
test.each([
  [null, null],
  [12500, null],
  [12550, "Rozdíl proti pohybům 50,00 €"],
] as const)("BankStatementForm zůstatek na výpise %s → varování %s", (bankClosing, warning) => {
  const view = show({ value: { ...base.value, bankClosing } });
  const field = view.container.querySelector('[data-slot="bank-statement-bank-closing"]');
  expect(field?.closest('[data-slot="field"]')?.getAttribute("data-warning") ?? null).toBe(
    warning ? "true" : null,
  );
  // Rozdíl je položka živého pruhu, ne samostatný NoticeBar (oprava 2.108.0).
  const bar = view.container.querySelector('[data-slot="form-issues-bar"]');
  if (warning) {
    expect(bar?.textContent).toContain("Upozornění (1)");
    expect(bar?.textContent).toContain(warning);
  } else {
    expect(bar).toBeNull();
  }
  expect(view.container.querySelector('[data-slot="bank-statement-difference-notice"]')).toBeNull();
  expect(view.container.querySelector('[data-slot="bank-statement-difference"]')).toBeNull();
});
test("BankStatementForm Σ zapnuto ukazuje konečný zůstatek jen ke čtení", () => {
  const view = show();
  const sum = view.getByRole("button", { name: "Zůstatek z pohybů" });
  expect(sum.getAttribute("aria-pressed")).toBe("true");
  expect(view.queryByRole("textbox", { name: "Zůstatek na výpise" })).toBeNull();
  // 2.117.0 D8: pole záhlaví výpisu značku měny neopakují.
  expect(view.getByText("12 500,00")).toBeTruthy();
  expect(view.queryByText("12 500,00 €")).toBeNull();
});
test("BankStatementForm vypnutí Σ předvyplní vypočtený zůstatek, zapnutí vrátí null", () => {
  let result = base.value;
  const view = show({ onChange: (next) => (result = next) });
  fireEvent.click(view.getByRole("button", { name: "Zůstatek z pohybů" }));
  expect(result.bankClosing).toBe(12500);
  view.rerender(
    <BankStatementForm
      {...base}
      value={{ ...base.value, bankClosing: 12550 }}
      onChange={(next) => (result = next)}
    />,
  );
  fireEvent.click(view.getByRole("button", { name: "Zůstatek z pohybů" }));
  expect(result.bankClosing).toBeNull();
});
test("BankStatementForm mění číslo v identitě, částku převede bez mezer", () => {
  let result = base.value;
  const view = show({
    value: { ...base.value, bankClosing: 1 },
    onChange: (next) => {
      result = next;
    },
  });
  fireEvent.change(view.getByLabelText("Číslo výpisu"), { target: { value: "2026/11" } });
  expect(result.number).toBe("2026/11");
  fireEvent.change(view.getByLabelText("Zůstatek na výpise"), {
    target: { value: "12 500,50" },
  });
  expect(result.bankClosing).toBe(12500.5);
});
test.each(["posted"] as const)(
  "BankStatementForm stav %s neumožní editaci a nemá akce kontroly",
  (status) => {
    const view = show({ status, onSave: () => {}, onCheckedChange: () => {} });
    expect(view.queryByRole("textbox", { name: "Číslo výpisu" })).toBeNull();
    expect(view.getByRole("button", { name: "Uložit" }).getAttribute("aria-disabled")).toBe("true");
    for (const name of ["Zkontrolovat", "Zrušit kontrolu"]) {
      expect(view.queryByRole("button", { name })).toBeNull();
    }
  },
);
test("BankStatementForm položky zamknou číslo a zachovají obsah slotu", () => {
  const view = show({ hasItems: true, items: <span>Pohyb aplikace</span> });
  expect(view.queryByRole("textbox", { name: "Číslo výpisu" })).toBeNull();
  expect(view.getAllByText("2026/10")).toHaveLength(1);
  expect(view.getByText("Pohyb aplikace")).toBeTruthy();
});
test("BankStatementForm slovenské texty bez zůstatků v domácí měně", () => {
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
  expect(view.queryByText(/zł/)).toBeNull();
  expect(view.getByText("Zostatok na výpise")).toBeTruthy();
});
test("BankStatementForm základní údaje v pořadí datum → zůstatek na výpise", () => {
  const view = show();
  const labels = [...view.container.querySelectorAll('[data-slot="field"] > span label')].map(
    (node) => node.textContent,
  );
  expect(labels).toEqual([
    "Datum výpisu",
    "Počáteční zůstatek",
    "Příjmy",
    "Výdaje",
    "Zůstatek na výpise",
  ]);
  expect(view.queryByText("Zůstatky dle pohybů")).toBeNull();
  expect(view.queryByText("Konečný zůstatek")).toBeNull();
});
test.each([true, false])("BankStatementForm pohyby vždy ze slotu items (nový %s)", (isNew) => {
  const view = show({ isNew, items: <span>Grid pohybů</span> });
  expect(view.getByText("Grid pohybů")).toBeTruthy();
  expect(view.queryByText("Pohyby lze zadat po uložení výpisu")).toBeNull();
});
test("BankStatementForm bez slotu ukáže prázdný stav", () => {
  const view = show({ isNew: true });
  expect(view.getByText("Výpis zatím nemá pohyby")).toBeTruthy();
});

test("BankStatementForm ukládá Ctrl/Cmd+S jen při dostupné akci", () => {
  let saves = 0;
  const view = show({
    onSave: () => {
      saves += 1;
    },
    dirty: true,
  });
  fireEvent.keyDown(view.getByLabelText("Číslo výpisu"), { key: "s", ctrlKey: true });
  fireEvent.keyDown(view.getByLabelText("Číslo výpisu"), { key: "s", metaKey: true });
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
  fireEvent.keyDown(view.getByLabelText("Číslo výpisu"), { key: "s", ctrlKey: true });
  expect(saves).toBe(2);
  expect(
    view.getByRole("button", { name: "Uložit" }).querySelector(".lucide-loader-circle"),
  ).toBeTruthy();
});

test("BankStatementForm pouze čtené hodnoty mají jméno z popisku", () => {
  const view = show({ status: "posted", value: { ...base.value, bankClosing: 12500 } });
  for (const label of [
    "Číslo výpisu",
    "Zůstatek na výpise",
    "Počáteční zůstatek",
    "Příjmy",
    "Výdaje",
  ]) {
    const node = view.getByRole("group", { name: label, exact: true });
    expect(node.getAttribute("data-slot")).toBe("field-value");
    expect(node.getAttribute("aria-labelledby") || node.getAttribute("aria-label")).toBeTruthy();
  }
});

test("BankStatementForm číslo je pouze v identifikačním řádku", () => {
  const view = show();
  const number = view.getByRole("textbox", { name: "Číslo výpisu" });
  expect(number.closest('[data-slot="bank-statement-identity"]')).toBeTruthy();
  expect(view.queryByText("Poznámka")).toBeNull();
});

test("BankStatementForm zámek čísla vysvětlí důvod klepnutím", async () => {
  const view = show({ hasItems: true });
  fireEvent.click(view.getByRole("button", { name: "Výpis má položky" }));
  expect(
    (await view.findAllByRole("tooltip")).some((node) => node.textContent === "Výpis má položky"),
  ).toBe(true);
});

test("BankStatementForm čistý výpis neukládá klávesovou zkratkou", () => {
  let calls = 0;
  const view = show({ dirty: false, onSave: () => calls++ });
  fireEvent.keyDown(view.getByLabelText("Číslo výpisu"), { key: "s", ctrlKey: true });
  expect(calls).toBe(0);
});
