/** Kategorie řádku · vlastní aliasy, povolení a změny účtů · nesmí ukládat ani držet UI stav. */
import type { CategoryOption } from "./category-select";
import type { AccountOption } from "./account-select";
import type { JournalLine } from "./journal-lines";
import { formatCodeName } from "../../../lib/code-format";

/** Povolené uzly účtu; null znamená všechny. */
export type AllowedCategories = (accountCode: string, side: "MD" | "D") => string[] | null;
/** Datové sloupce kategorií. */
export type CategoryColumn = "categoryId" | "debitCategoryId" | "creditCategoryId";
/** Rozpozná kanonický nebo původní druh účtu. */
export const isCategoryAccount = (account: AccountOption | undefined) =>
  account?.category === "ekonomicka_kategorie" || account?.category === "bilance";
/** Nový název má přednost, také při výslovném null. */
export function normalizeCategoryLine(line: JournalLine): JournalLine {
  return {
    ...line,
    categoryId: line.categoryId !== undefined ? line.categoryId : line.dimensionId,
    debitCategoryId:
      line.debitCategoryId !== undefined ? line.debitCategoryId : line.debitDimensionId,
    creditCategoryId:
      line.creditCategoryId !== undefined ? line.creditCategoryId : line.creditDimensionId,
  };
}
/** Popisek s nepovinným kódem. */
export function categoryLabel(options: CategoryOption[], id: string | null | undefined) {
  const item = options.find((option) => option.id === id);
  return item ? formatCodeName(item.code, item.name) : "";
}
/** Nabídne vykazovatelné aktivní uzly včetně potomků povolené větve; chrání cykly. */
export function selectableCategories(options: CategoryOption[], allowed: string[] | null) {
  const byId = new Map(options.map((item) => [item.id, item]));
  const permitted = allowed === null ? null : new Set(allowed);
  return options.filter((item) => {
    if (
      item.postable === false ||
      item.selectable === false ||
      item.active === false ||
      item.is_active === false
    )
      return false;
    if (permitted === null) return true;
    let current: CategoryOption | undefined = item;
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      if (permitted.has(current.id)) return true;
      visited.add(current.id);
      current = byId.get(current.parentId ?? current.parent_id ?? "");
    }
    return false;
  });
}
/** Kontext stejný pro buňku, detail, validaci i změnu účtu. */
export interface CategoryContext {
  categories: CategoryOption[];
  accountByCode: Map<string, AccountOption>;
  categoryBySide?: boolean;
  allowedCategories?: AllowedCategories;
}
/** Odpovídající strana: sdílená kategorie patří první straně ekonomického účtu. */
export function categorySide(line: JournalLine, column: CategoryColumn, ctx: CategoryContext) {
  if (column === "debitCategoryId") return "MD" as const;
  if (column === "creditCategoryId") return "D" as const;
  return isCategoryAccount(ctx.accountByCode.get(line.debitAccount ?? ""))
    ? ("MD" as const)
    : ("D" as const);
}
/** Stav a nabídka kategorie konkrétní strany. */
export function categoryCellState(line: JournalLine, column: CategoryColumn, ctx: CategoryContext) {
  const side = categorySide(line, column, ctx);
  const accountCode = (side === "MD" ? line.debitAccount : line.creditAccount) ?? "";
  const enabled = isCategoryAccount(ctx.accountByCode.get(accountCode));
  const allowed = ctx.allowedCategories?.(accountCode, side) ?? null;
  const options = enabled ? selectableCategories(ctx.categories, allowed) : [];
  const value = normalizeCategoryLine(line)[column];
  const single = enabled && allowed !== null && options.length === 1 ? options[0] : undefined;
  return {
    side,
    enabled,
    options,
    single,
    value,
    invalid: !!value && enabled && !options.some((item) => item.id === value),
  };
}
/** Úprava po změně účtu a doplnění jediné povolené; zachová jinak uložená data. */
export function reconcileCategories(
  line: JournalLine,
  ctx: CategoryContext,
  accountChanged: boolean,
) {
  const values: Partial<JournalLine> = {};
  const changed: CategoryColumn[] = [];
  const columns: CategoryColumn[] = ctx.categoryBySide
    ? ["debitCategoryId", "creditCategoryId"]
    : ["categoryId"];
  for (const column of columns) {
    const state = categoryCellState(line, column, ctx);
    const next =
      state.single?.id ??
      (accountChanged && (!state.enabled || state.invalid) ? null : state.value);
    if (next !== state.value) {
      values[column] = next;
      changed.push(column);
    }
  }
  return { values, changed };
}
