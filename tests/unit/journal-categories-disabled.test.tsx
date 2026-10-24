/** Vypnuté kategorie · sloupce, validace a zachování řízených řádků v účetnictví. */
import { expect, mock, test } from "bun:test";
import { act, render, renderHook } from "@testing-library/react";
import { JournalLinesEditor } from "../../src/components/ds/accounting/journal-lines-editor";
import { useJournalEditorState } from "../../src/components/ds/accounting/useJournalEditorState";
import { DocumentForm } from "../../src/components/ds/accounting/document-form";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { updateGridLayout } from "../../src/lib/grid-prefs";
import type { JournalLine } from "../../src/components/ds/accounting/journal-lines";

const accounts = [
  { code: "518001", name: "Náklady", category: "ekonomicka_kategorie" },
  { code: "602001", name: "Výnosy", category: "ekonomicka_kategorie" },
];
const line: JournalLine = {
  id: "r", text: "Položka", debitAccount: "518001", creditAccount: "602001", amount: 100,
};
const base = {
  lines: [line], accounts, onChange: () => {},
  documentCurrency: "EUR", homeCurrency: "EUR", storageKey: "disabled-category-unit",
  categories: [{ id: "a", name: "Provoz" }],
};
const categoryIds = ["categoryId", "debitCategoryId", "creditCategoryId"];

for (const mode of ["internal", "mainAccount"] as const) {
  for (const categoryBySide of [true, false]) {
    test(`vypnutí vyřadí kategorie z gridu i nabídky (${mode}, strany ${categoryBySide})`, () => {
      updateGridLayout(`${base.storageKey}:v4`, {
        visible: Object.fromEntries(categoryIds.map((id) => [id, true])),
        visibilityOverrides: categoryIds,
      });
      const { result } = renderHook(() => useJournalEditorState({
        ...base, mode, categoryBySide, categoriesEnabled: false,
      }, null));
      expect(result.current.layout.columns.columns.some((c) => categoryIds.includes(c.id))).toBe(false);
      const view = render(<TooltipProvider><JournalLinesEditor
        {...base} mode={mode} categoryBySide={categoryBySide} categoriesEnabled={false}
      /></TooltipProvider>);
      expect(view.queryAllByRole("columnheader").some((c) => c.textContent?.includes("Kategorie"))).toBe(false);
    });
  }
}

test("bez volby jsou kategorie stále zapnuté", () => {
  const { result } = renderHook(() => useJournalEditorState(base, null));
  expect(result.current.layout.columns.columns.filter((c) => categoryIds.includes(c.id)).map((c) => c.id))
    .toEqual(["debitCategoryId", "creditCategoryId"]);
});

test("vypnutí potlačí povinnost účtu i vlastní pravidla, nikoli ostatní validaci", () => {
  const { result, rerender } = renderHook(({ enabled }) => useJournalEditorState({
    ...base, categoriesEnabled: enabled, categoryRequired: true,
    sideFieldRules: () => ({ categoryRequired: true, dimensionRequired: true, vsRequired: true }),
  }, null), { initialProps: { enabled: true } });
  expect(result.current.validations.get("r")?.debitCategoryId).toBeTruthy();
  rerender({ enabled: false });
  expect(result.current.validations.get("r")?.debitCategoryId).toBeUndefined();
  expect(result.current.validations.get("r")?.creditCategoryId).toBeUndefined();
  expect(result.current.validations.get("r")?.debitVs).toBeTruthy();
});

test("neplatná uložená kategorie se nekontroluje a změna účtu ji nesmaže", () => {
  const change = mock();
  const saved = { ...line, categoryId: "old", debitCategoryId: "old-md", creditCategoryId: "old-d" };
  const { result } = renderHook(() => useJournalEditorState({
    ...base, lines: [saved], categoriesEnabled: false, onChange: change,
    allowedCategories: () => ["a"],
  }, null));
  expect(result.current.validations.get("r")).toEqual({});
  expect(change).not.toHaveBeenCalled();
  act(() => result.current.patch("r", { debitAccount: "602001" }));
  expect(change.mock.calls.at(-1)?.[0]?.[0]).toMatchObject({
    categoryId: "old", debitCategoryId: "old-md", creditCategoryId: "old-d",
  });
});

test("přidání řádku při vypnutí automaticky nedoplní jedinou povolenou kategorii", () => {
  const { result } = renderHook(() => useJournalEditorState({
    ...base, categoriesEnabled: false, allowedCategories: () => ["a"],
    defaults: { debitAccount: "518001", creditAccount: "602001" },
  }, null));
  let added: JournalLine | undefined;
  act(() => { added = result.current.addLine(); });
  expect(added?.debitCategoryId).toBeUndefined();
  expect(added?.creditCategoryId).toBeUndefined();
});

test("DocumentForm předá false přednostně před vnořenou volbou true", () => {
  const view = render(<TooltipProvider><DocumentForm
    title="Doklad" documentType="ID" value={{ currency: "EUR", total: 100 }}
    onChange={() => {}} onLinesChange={() => {}} lines={[line]} accounts={accounts}
    homeCurrency="EUR" categoriesEnabled={false}
    linesEditorProps={{ categoriesEnabled: true, categories: base.categories }}
  /></TooltipProvider>);
  const editor = view.container.querySelector('[data-slot="journal-lines-editor"]');
  expect(editor).not.toBeNull();
  expect(editor?.querySelectorAll('[data-cell-key$="CategoryId"], [data-cell-key$=":categoryId"]').length).toBe(0);
  expect(editor?.textContent).not.toContain("Kategorie");
});