/** DE: řízená prezentace, skryté technické účty a původní tvar řádku. */
import { expect, mock, test } from "bun:test";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  AccountSelect,
  JournalLinesEditor,
  TaxBookView,
  TaxCategorySummary,
  CashCheckPanel,
  TaxBookEntriesPanel,
  BookkeepingModeSelect,
  BookkeepingSettingsFields,
  TaxMovementSelect,
  DocumentPostingGrid,
  VatPeriodBadge,
  FormIssuesBar,
  RecordDialog,
  type JournalLine,
  type TaxBookEntry,
} from "../../src/components/ds";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { DsTextsProvider } from "../../src/ds-texts";
import {
  filterTaxBook,
  visibleTaxItems,
  taxItemLabel,
} from "../../src/components/ds/tax-records/tax-record-model";
import {
  taxItemSide,
  taxItemAccountRequired,
} from "../../src/components/ds/accounting/journal-tax-records";
import { journalCategoryInputs } from "../../src/components/ds/accounting/journal-category-inputs";
const accounts = [
  {
    code: "602001",
    name: "Tržby za služby",
    displayCode: "SL",
    accountType: "vynosovy",
    category: "ekonomicka_kategorie",
  },
  { code: "501001", name: "Materiál", accountType: "nakladovy", category: "ekonomicka_kategorie" },
  { code: "211001", name: "Tajná pokladna", technical: true },
];
const lines: JournalLine[] = [
  {
    id: "r1",
    text: "Služby",
    amount: 1000,
    debitAccount: "211001",
    creditAccount: "602001",
    counterAccount: "602001",
  },
];
const entry: TaxBookEntry = {
  id: "e1",
  date: "2026-10-01",
  paymentDocumentId: "p1",
  paymentDocument: "PO1",
  invoiceId: "f1",
  invoice: "FV1",
  itemId: "602001",
  item: "Tržby",
  treatment: "taxable",
  categoryId: "cat",
  category: "Provoz",
  amount: 1000,
  currency: "EUR",
  movementAmount: 40,
  vat: 0,
};
const editor = {
  lines,
  accounts,
  mode: "mainAccount" as const,
  mainSide: "MD" as const,
  mainAccount: "211001",
  homeCurrency: "EUR",
  documentCurrency: "EUR",
  onChange: mock(),
  storageKey: "tax-unit",
};
test("technické položky vyřazuje nabídka i label", () => {
  expect(visibleTaxItems(accounts).map((a) => a.code)).toEqual(["602001", "501001"]);
  expect(taxItemLabel(accounts[2])).toBe("");
});
test("DE výběr jménem předá původní číslo jen callbackem", async () => {
  const change = mock();
  render(
    <AccountSelect
      bookkeepingMode="tax_records"
      accounts={accounts}
      value="602001"
      onChange={change}
    />,
  );
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "M" });
  await waitFor(() => expect(screen.getByRole("option", { name: "Materiál" })).toBeDefined());
  expect(screen.queryByText("Tajná pokladna")).toBeNull();
  fireEvent.click(screen.getByRole("option", { name: "Materiál" }));
  expect(change).toHaveBeenCalledWith("501001");
});
test("DE není prohledatelné podle technického čísla", async () => {
  render(
    <AccountSelect
      bookkeepingMode="tax_records"
      accounts={accounts}
      value={null}
      onChange={() => {}}
      defaultOpen
      initialSearch="211001"
    />,
  );
  await waitFor(() => expect(screen.queryAllByRole("option")).toHaveLength(0));
});
test("DE čtení technické hodnoty ji neprozradí", () => {
  render(
    <AccountSelect
      bookkeepingMode="tax_records"
      accounts={accounts}
      value="211001"
      onChange={() => {}}
    />,
  );
  expect(screen.getByRole("combobox").textContent).not.toContain("211");
  expect(screen.getByRole("combobox").textContent).not.toContain("Tajná");
});
test("DE grid má Položku, nemá MD/DAL ani účtové formy", () => {
  render(
    <TooltipProvider>
      <JournalLinesEditor {...editor} bookkeepingMode="tax_records" categoriesEnabled={false} />
    </TooltipProvider>,
  );
  const heads = screen.getAllByRole("columnheader").map((h) => h.textContent);
  expect(heads.some((h) => h?.startsWith("Položka"))).toBe(true);
  expect(heads.some((h) => h === "MD" || h === "DAL")).toBe(false);
  expect(screen.queryByText("Tajná pokladna")).toBeNull();
  expect(screen.queryByText("211.001")).toBeNull();
});
test("accrual výchozí zachovává původní účetní sloupec", () => {
  render(
    <TooltipProvider>
      <JournalLinesEditor {...editor} />
    </TooltipProvider>,
  );
  expect(screen.getAllByRole("columnheader").some((h) => h.textContent?.startsWith("DAL"))).toBe(
    true,
  );
});
test("DE příjem/výdaj a přeřazení mapuje jen položkové strany", () => {
  expect(taxItemSide({ mode: "mainAccount", mainSide: "MD" })).toBe("creditAccount");
  expect(taxItemSide({ mode: "mainAccount", mainSide: "D" })).toBe("debitAccount");
  expect(taxItemSide({ mode: "internal", taxMovementKind: "non_cash_expense" })).toBe(
    "creditAccount",
  );
  expect(
    taxItemAccountRequired({ id: "x" }, { mode: "internal", taxMovementKind: "transfer" }),
  ).toEqual(["debitAccount", "creditAccount"]);
});
test("DE APP doplní technickou stranu, DS ji nevyžaduje", () => {
  expect(
    taxItemAccountRequired(
      { id: "x", creditAccount: "602001" },
      { mode: "mainAccount", mainSide: "MD" },
    ),
  ).toEqual([]);
});
test("DE kategorie vypnuté nevynucují kategorii a nezapínají MD/DAL", () => {
  const p = journalCategoryInputs({
    ...editor,
    bookkeepingMode: "tax_records",
    categoriesEnabled: false,
    categoryRequired: true,
  });
  expect(p.categoryRequired).toBe(false);
  expect(p.categoryBySide).toBe(false);
});
test("DE interní přeřazení dvě položky a žádný technický účet", () => {
  render(
    <TooltipProvider>
      <JournalLinesEditor
        {...editor}
        mode="internal"
        bookkeepingMode="tax_records"
        taxMovementKind="transfer"
        categoriesEnabled={false}
      />
    </TooltipProvider>,
  );
  const heads = screen.getAllByRole("columnheader").map((h) => h.textContent);
  expect(heads.some((h) => h?.startsWith("Z položky"))).toBe(true);
  expect(heads.some((h) => h?.startsWith("Na položku"))).toBe(true);
});
test("filtry knihy období položka daňovost kategorie", () => {
  const rows = [entry, { ...entry, id: "e2", date: "2026-11-01", treatment: "non_tax" as const }];
  expect(
    filterTaxBook(rows, {
      from: "2026-10-01",
      to: "2026-10-31",
      itemId: "602001",
      treatment: "taxable",
      categoryId: "cat",
    }).map((r) => r.id),
  ).toEqual(["e1"]);
});
test("kniha otevře platbu a fakturu jejich skutečným id", () => {
  const open = mock();
  render(<TaxBookView rows={[entry]} homeCurrency="EUR" onDocumentOpen={open} />);
  fireEvent.click(screen.getByRole("button", { name: "PO1" }));
  fireEvent.click(screen.getByRole("button", { name: "FV1" }));
  expect(open.mock.calls.map((c) => c[0])).toEqual(["p1", "f1"]);
});
test("nezařazená úhrada má samostatné řešení", () => {
  const open = mock();
  const row = { ...entry, unassigned: true };
  render(<TaxBookView rows={[row]} homeCurrency="EUR" onUnassignedOpen={open} />);
  fireEvent.click(screen.getByRole("button", { name: "Vyřešit úhradu" }));
  expect(open).toHaveBeenCalledWith(row);
});
test("souhrn nepřepočítává hotový paušál a proklikne kategorii", () => {
  const open = mock();
  render(
    <TaxCategorySummary
      currency="EUR"
      rows={[
        {
          id: "s7",
          paragraph: "7",
          label: "Služby §7",
          income: 10000,
          expense: 100,
          percentage: 60,
          cap: 600,
          calculatedExpense: 599,
        },
      ]}
      onCategoryOpen={open}
    />,
  );
  fireEvent.doubleClick(screen.getByText("Služby §7"));
  expect(open).toHaveBeenCalledWith("s7");
  expect(screen.getAllByText("599,00").length).toBeGreaterThan(0);
});
test("souhrn má nezamlčený řádek nezařazených a proklik", () => {
  const open = mock();
  render(
    <TaxCategorySummary currency="EUR" rows={[]} unassignedAmount={1000} onUnassignedOpen={open} />,
  );
  fireEvent.doubleClick(screen.getByText("Nezařazená úhrada"));
  expect(open).toHaveBeenCalledTimes(1);
});
test("kontrola peněz používá přesný dodaný rozdíl bez nové matematiky", () => {
  const open = mock();
  render(
    <CashCheckPanel
      rows={[
        {
          id: "cash",
          label: "Pokladna A",
          currency: "EUR",
          opening: 100,
          movements: 20,
          closing: 119,
          difference: 9,
        },
      ]}
      onAccountOpen={open}
    />,
  );
  fireEvent.doubleClick(screen.getByText("Pokladna A"));
  expect(open).toHaveBeenCalledWith("cash");
  expect(screen.getByText("9,00")).toBeDefined();
});
test("zápisy v Propojených otevírají původní entry", () => {
  const open = mock();
  render(
    <TooltipProvider>
      <TaxBookEntriesPanel entries={[entry]} currency="EUR" onEntryOpen={open} />
    </TooltipProvider>,
  );
  fireEvent.click(screen.getByText("PO1"));
  expect(open.mock.calls[0]?.[0]).toBe(entry);
});
test("Nová firma volí DE přes řízený callback", () => {
  const change = mock();
  render(<BookkeepingModeSelect value="accrual" onChange={change} />);
  fireEvent.click(screen.getByRole("radio", { name: "Daňová evidence" }));
  expect(change).toHaveBeenCalledWith("tax_records");
});
test("nastavení knihy v DE účetní pole vůbec nevykreslí", () => {
  render(
    <BookkeepingSettingsFields
      scope="book"
      bookkeepingMode="tax_records"
      accountFields={<span>Tajná pokladna</span>}
      items={accounts}
      value={{}}
      onValueChange={() => {}}
    />,
  );
  expect(screen.queryByText("Tajná pokladna")).toBeNull();
  expect(screen.queryByRole("combobox")).toBeNull();
});
test("nastavení firmy v DE předá položku zaokrouhlení", async () => {
  const change = mock();
  render(
    <BookkeepingSettingsFields
      bookkeepingMode="tax_records"
      items={accounts}
      value={{}}
      onValueChange={change}
    />,
  );
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Zaokrouhlení – výdaj" }), { key: "M" });
  await waitFor(() => expect(screen.getByRole("option", { name: "Materiál" })).toBeDefined());
  fireEvent.click(screen.getByRole("option", { name: "Materiál" }));
  expect(change).toHaveBeenCalledWith({ expense: "501001" });
});
test("druh pohybu ID oznamuje přeřazení", async () => {
  const change = mock();
  render(<TaxMovementSelect value="non_cash_income" onChange={change} />);
  fireEvent.click(screen.getByRole("combobox"));
  await waitFor(() =>
    expect(screen.getByRole("option", { name: "Přeřazení mezi položkami" })).toBeDefined(),
  );
  fireEvent.click(screen.getByRole("option", { name: "Přeřazení mezi položkami" }));
  expect(change).toHaveBeenCalledWith("transfer");
});
test("posting v DE neschová technickou částku, ale schová účet", () => {
  render(
    <DocumentPostingGrid
      bookkeepingMode="tax_records"
      accounts={accounts}
      entries={[{ id: "p", debitAccount: "211001", creditAccount: "602001", amount: 123 }]}
    />,
  );
  expect(screen.queryByText("211.001")).toBeNull();
  expect(screen.queryByText("Tajná pokladna")).toBeNull();
  expect(screen.getByText("Tržby za služby")).toBeDefined();
});
test("FormIssue akce je nezávislá na odkazu na pole", () => {
  const act = mock();
  const select = mock();
  render(
    <FormIssuesBar
      issues={[
        {
          label: "Úhrada",
          message: "Není přiřazena",
          source: "server",
          severity: "warning",
          fieldId: "x",
          action: { label: "Spárovat", onClick: act },
        },
      ]}
      onSelect={select}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Spárovat" }));
  expect(act).toHaveBeenCalledTimes(1);
  expect(select).not.toHaveBeenCalled();
});
test("RecordDialog odstranění vyžaduje důvod a předá jej", async () => {
  const remove = mock();
  render(
    <RecordDialog
      open
      size="sm"
      title="Záznam"
      onOpenChange={() => {}}
      deleteAction={{
        onClick: remove,
        confirm: { title: "Odstranit záznam", reason: { label: "Důvod", required: true } },
      }}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Odstranit" }));
  const d = screen.getByRole("alertdialog");
  fireEvent.click(within(d).getByRole("button", { name: "Odstranit" }));
  expect(remove).not.toHaveBeenCalled();
  fireEvent.change(within(d).getByRole("textbox", { name: "Důvod" }), {
    target: { value: "  Oprava  " },
  });
  fireEvent.click(within(d).getByRole("button", { name: "Odstranit" }));
  await waitFor(() => expect(remove).toHaveBeenCalledWith("Oprava"));
});
test("podané období nahrazuje běžný štítek výstrahou", () => {
  render(<VatPeriodBadge label="Říjen" filed filedWarning="Období je podané" />);
  expect(screen.getByText("Období je podané")).toBeDefined();
  expect(screen.queryByText("Období DPH · Říjen")).toBeNull();
});
test("slovenské texty DE jsou zapojené do provideru", () => {
  render(
    <DsTextsProvider locale="sk">
      <BookkeepingModeSelect value="accrual" onChange={() => {}} />
    </DsTextsProvider>,
  );
  expect(screen.getByRole("radio", { name: "Daňová evidencia" })).toBeDefined();
});

test("technický účet není platná vybraná položka ani u přeřazení", () => {
  expect(
    taxItemAccountRequired(
      { id: "x", debitAccount: "211001", creditAccount: "602001" },
      { mode: "internal", taxMovementKind: "transfer", accounts },
    ),
  ).toEqual(["debitAccount"]);
});
test("DE povolené kategorie zůstávají navázané na položku", () => {
  const change = mock();
  render(
    <TooltipProvider>
      <JournalLinesEditor
        {...editor}
        bookkeepingMode="tax_records"
        categoriesEnabled
        categories={[{ id: "cat", name: "Provoz" }]}
        allowedCategories={() => ["cat"]}
        onChange={change}
      />
    </TooltipProvider>,
  );
  expect(change.mock.calls.some((c) => c[0][0]?.categoryId === "cat")).toBe(true);
});
