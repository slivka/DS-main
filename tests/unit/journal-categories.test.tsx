/** Ekonomické kategorie · aliasy, DB, omezení a skutečné chování editoru. */
import { describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { act, fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import { CategorySelect, type CategoryOption } from "../../src/components/ds/accounting/category-select";
import { DimensionSelect } from "../../src/components/ds/accounting/dimension-select";
import { toJournalRow, fromJournalRow, sideFieldRules, type JournalLine } from "../../src/components/ds/accounting/journal-lines";
import { categoryCellState, categoryLabel, normalizeCategoryLine, reconcileCategories, selectableCategories, type CategoryContext } from "../../src/components/ds/accounting/journal-category-model";
import { journalCategoryInputs } from "../../src/components/ds/accounting/journal-category-inputs";
import { JournalLinesEditor } from "../../src/components/ds/accounting/journal-lines-editor";
import { useJournalEditorState } from "../../src/components/ds/accounting/useJournalEditorState";
import { TooltipProvider } from "../../src/components/ui/tooltip";

const categories: CategoryOption[] = [
  { id: "root", code: null, name: "Provoz", postable: false },
  { id: "a", parentId: "root", code: "A", name: "Služby" },
  { id: "b", parentId: "root", code: null, name: "Materiál" },
  { id: "c", parentId: "a", name: "Podpora" },
  { id: "inactive", parentId: "root", name: "Archiv", active: false },
  { id: "other", code: "X", name: "Ostatní" },
];
const accounts = [
  { code: "518001", name: "Náklady", category: "ekonomicka_kategorie" },
  { code: "602001", name: "Výnosy", category: "ekonomicka_kategorie" },
  { code: "211001", name: "Pokladna" },
];
const context: CategoryContext = { categories, accountByCode: new Map(accounts.map((a) => [a.code, a])), categoryBySide: true };
const line: JournalLine = { id: "r", debitAccount: "518001", creditAccount: "602001", amount: 100 };
const base = { lines: [line], onChange: () => {}, accounts, documentCurrency: "EUR", homeCurrency: "EUR" };

describe("Kategorie – kompatibilita", () => {
  it("DimensionSelect je identický alias", () => expect(DimensionSelect).toBe(CategorySelect));
  it("nové id má přednost včetně null", () => {
    expect(normalizeCategoryLine({ ...line, dimensionId: "a", categoryId: null }).categoryId).toBeNull();
    expect(normalizeCategoryLine({ ...line, debitDimensionId: "a" }).debitCategoryId).toBe("a");
  });
  it("nové props mají přednost i při prázdném seznamu a false", () => {
    const newer = mock(); const older = mock();
    const props = journalCategoryInputs({ ...base, categories: [], dimensions: categories, onEditCategory: newer, onEditDimension: older, categoryRequired: false, dimensionRequired: true });
    expect(props.categories).toEqual([]); expect(props.categoryRequired).toBe(false);
    props.onEditCategory?.("a"); expect(newer).toHaveBeenCalledWith("a"); expect(older).not.toHaveBeenCalled();
  });
  it("rowSuggestions.category má přednost před dimension", () => {
    const props = journalCategoryInputs({ ...base, rowSuggestions: { r: { category: { source: "new" }, dimension: { source: "old" } } } });
    expect(props.rowSuggestions?.r?.category?.source).toBe("new");
    expect(journalCategoryInputs({ ...base, rowSuggestions: { r: { dimension: { source: "old" } } } }).rowSuggestions?.r?.category?.source).toBe("old");
  });
  it("DB výstup výchozí category, legacy jen výslovně", () => {
    const row = toJournalRow({ ...line, debitDimensionId: "a", creditCategoryId: "b" });
    expect(row.debit_category_id).toBe("a"); expect(row.credit_category_id).toBe("b");
    expect("debit_dimension_id" in row).toBe(false);
    const legacy = toJournalRow({ ...line, categoryId: "a" }, { categoryFormat: "dimension" });
    expect(legacy.debit_dimension_id).toBe("a"); expect("debit_category_id" in legacy).toBe(false);
  });
  it("DB čte oba tvary, nový null nepřepíše stará hodnota", () => {
    const row = toJournalRow(line);
    expect(fromJournalRow({ ...row, debit_category_id: undefined, debit_dimension_id: "a" }).debitCategoryId).toBe("a");
    expect(fromJournalRow({ ...row, debit_category_id: null, debit_dimension_id: "a" }).debitCategoryId).toBeNull();
    expect(fromJournalRow({ ...row, credit_category_id: "b", credit_dimension_id: "a" }).creditCategoryId).toBe("b");
  });
  it("výslovně prázdná strana nevychází ze společné kategorie", () => {
    expect(toJournalRow({ ...line, categoryId: "a", debitCategoryId: null }).debit_category_id).toBeNull();
  });
  it("pravidla účtu přijmou nový i starý druh a nové false", () => {
    for (const category of ["bilance", "ekonomicka_kategorie"]) expect(sideFieldRules({ category }, { categoryRequired: true }).categoryRequired).toBe(true);
    expect(sideFieldRules({ category: "bilance" }, { categoryRequired: false, dimensionRequired: true }).categoryRequired).toBe(false);
  });
});
describe("Kategorie – povolení", () => {
  it("kód null zobrazí pouze název", () => { expect(categoryLabel(categories, "b")).toBe("Materiál"); expect(categoryLabel(categories, "a")).toBe("A – Služby"); });
  it("povolení větve zahrne vykazovatelné potomky", () => expect(selectableCategories(categories, ["root"]).map((a) => a.id)).toEqual(["a", "b", "c"]));
  it("null nabídne všechny, prázdný seznam žádnou", () => { expect(selectableCategories(categories, null).map((a) => a.id)).toEqual(["a", "b", "c", "other"]); expect(selectableCategories(categories, [])).toEqual([]); });
  it("jedinou doplní a uzamkne", () => {
    const ctx = { ...context, allowedCategories: () => ["b"] };
    expect(categoryCellState(line, "debitCategoryId", ctx).single?.id).toBe("b");
    expect(reconcileCategories(line, ctx, false).values).toEqual({ debitCategoryId: "b", creditCategoryId: "b" });
  });
  it("nevykazovatelná nebo nepovolená uložená hodnota je chyba, ne tiché přepsání", () => {
    const ctx = { ...context, allowedCategories: () => ["b"] };
    const saved = { ...line, debitCategoryId: "a" };
    expect(categoryCellState(saved, "debitCategoryId", ctx).invalid).toBe(true);
    expect(reconcileCategories(saved, ctx, false).values.debitCategoryId).toBeUndefined();
    expect(categoryCellState({ ...line, debitCategoryId: "root" }, "debitCategoryId", context).invalid).toBe(true);
  });
  it("categoryBySide aktivuje pouze správnou stranu", () => {
    const row = { ...line, creditAccount: "211001" };
    expect(categoryCellState(row, "debitCategoryId", context).enabled).toBe(true);
    expect(categoryCellState(row, "creditCategoryId", context).enabled).toBe(false);
    expect(categoryCellState(row, "categoryId", context).side).toBe("MD");
  });
  it("změna účtu zachová kategorii povolenou na novém účtu", () => {
    expect(reconcileCategories({ ...line, debitCategoryId: "a" }, { ...context, allowedCategories: () => ["root"] }, true).values.debitCategoryId).toBeUndefined();
  });
  it("změna účtu odstraní nepovolenou kategorii, nebo ji nahradí jedinou", () => {
    const row = { ...line, debitCategoryId: "other" };
    expect(reconcileCategories(row, { ...context, allowedCategories: () => ["root"] }, true).values.debitCategoryId).toBeNull();
    expect(reconcileCategories(row, { ...context, allowedCategories: () => ["b"] }, true).values.debitCategoryId).toBe("b");
  });
  it("změna na běžný účet vyprázdní kategorii jen této strany", () => {
    expect(reconcileCategories({ ...line, debitAccount: "211001", debitCategoryId: "a", creditCategoryId: "b" }, context, true).values).toEqual({ debitCategoryId: null });
  });
});
describe("Kategorie – editor", () => {
  it("ID má dva sloupce, ostatní doklad jeden", () => {
    const view = render(<TooltipProvider><JournalLinesEditor {...base} categories={categories} /></TooltipProvider>);
    expect(view.container.querySelector('[data-cell-key="r:debitCategoryId"]')).not.toBeNull();
    expect(view.container.querySelector('[data-cell-key="r:creditCategoryId"]')).not.toBeNull();
    view.rerender(<TooltipProvider><JournalLinesEditor {...base} categories={categories} categoryBySide={false} /></TooltipProvider>);
    expect(view.container.querySelector('[data-cell-key="r:categoryId"]')).not.toBeNull();
    expect(view.container.querySelector('[data-cell-key="r:debitCategoryId"]')).toBeNull();
  });
  it("jediná se skutečně doplní do řízených řádků a má zámek", async () => {
    let latest: JournalLine[] = [];
    function Demo() { const [lines, setLines] = useState([line]); return <JournalLinesEditor {...base} lines={lines} onChange={(next) => { latest = next; setLines(next); }} categories={categories} allowedCategories={() => ["b"]} />; }
    const view = render(<TooltipProvider><Demo /></TooltipProvider>);
    await waitFor(() => expect(latest[0]?.debitCategoryId).toBe("b"));
    expect(view.getAllByRole("button", { name: "Jediná povolená kategorie účtu" }).length).toBe(2);
  });
  it("zamčený doklad se samotným otevřením nezmění", () => {
    const change = mock(); render(<TooltipProvider><JournalLinesEditor {...base} onChange={change} editableFields={[]} categories={categories} allowedCategories={() => ["b"]} /></TooltipProvider>);
    expect(change).not.toHaveBeenCalled();
  });
  it("změna účtu v editoru zapíše novou kategorii a výstrahu", () => {
    const change = mock();
    const { result } = renderHook(() => useJournalEditorState({ ...base, onChange: change, categories, allowedCategories: (code) => code === "602001" ? ["b"] : null, lines: [{ ...line, debitCategoryId: "a", creditCategoryId: "b" }] }, null));
    act(() => result.current.patch("r", { debitAccount: "602001" }));
    expect(change.mock.calls.at(-1)?.[0]?.[0]?.debitCategoryId).toBe("b");
    expect(result.current.vatWarnings.get("r")?.debitCategoryId).toBeTruthy();
  });
  it("nevykazovatelný uzel ve výběru není možné potvrdit", async () => {
    const change = mock(); const view = render(<TooltipProvider><CategorySelect options={categories} value={null} onChange={change} defaultOpen /></TooltipProvider>);
    const node = await view.findByRole("option", { name: /Provoz/ });
    fireEvent.click(node); expect(change).not.toHaveBeenCalled();
  });
});