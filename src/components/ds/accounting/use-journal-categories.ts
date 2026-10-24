/** Kategorie editoru · vlastní zamčení, změny účtů a hlášení · bez vykreslování. */
import * as React from "react";
import type { JournalLinesEditorProps } from "./journal-editor-types";
import type { AccountOption } from "./account-select";
import type { JournalLine } from "./journal-lines";
import type { JournalPins } from "./useJournalPins";
import {
  categoryCellState,
  reconcileCategories,
  selectableCategories,
  type CategoryColumn,
} from "./journal-category-model";
import type { DsTexts } from "../../../ds-texts";
/** Sdílená synchronizace kategorií editoru. */
export function useJournalCategories(
  props: JournalLinesEditorProps,
  accountByCode: Map<string, AccountOption>,
  editable: ReadonlySet<string>,
  pins: JournalPins,
  touchedRows: React.RefObject<Set<string>>,
  clearSuggestions: (line: JournalLine, values: Partial<JournalLine>) => void,
  dsTexts: DsTexts,
) {
  const { lines, onChange } = props;
  const categoryContext = {
    categories: props.categories ?? [],
    accountByCode,
    categoryBySide: props.categoryBySide,
    allowedCategories: props.allowedCategories,
  };
  const categoryState = (line: JournalLine, column: CategoryColumn) =>
    categoryCellState(line, column, categoryContext);
  const categoryWarnings = React.useRef(new Map<string, Partial<Record<CategoryColumn, string>>>());
  const createCategory = (line: JournalLine, column: CategoryColumn) => {
    const callback = props.onCreateCategory;
    if (!callback) return undefined;
    return (query: string) => {
      const result = callback(query);
      if (!result || typeof result.then !== "function") return result;
      return result.then((created) => {
        if (!created) return created;
        const state = categoryState(line, column);
        const accountCode = (state.side === "MD" ? line.debitAccount : line.creditAccount) ?? "";
        const allowed = props.allowedCategories?.(accountCode, state.side) ?? null;
        return selectableCategories([...categoryContext.categories, created], allowed).some(
          (item) => item.id === created.id,
        )
          ? created
          : null;
      });
    };
  };
  const patch = (id: string, values: Partial<JournalLine>) => {
    touchedRows.current.add(id);
    const current = lines.find((line) => line.id === id);
    if (current) clearSuggestions(current, values);
    if (current) pins.releaseInherited(current, values);
    const accountChanged =
      !!current &&
      ["debitAccount", "creditAccount"].some(
        (key) =>
          key in values && values[key as keyof JournalLine] !== current[key as keyof JournalLine],
      );
    const warnings = categoryWarnings.current.get(id);
    if (warnings) for (const key of Object.keys(values)) delete warnings[key as CategoryColumn];
    const next = current ? { ...current, ...values, isBlank: false } : undefined;
    if (!next) return;
    const changedSides = new Set<"MD" | "D">();
    if (current && "debitAccount" in values && values.debitAccount !== current.debitAccount)
      changedSides.add("MD");
    if (current && "creditAccount" in values && values.creditAccount !== current.creditAccount)
      changedSides.add("D");
    const reconciled = reconcileCategories(next, categoryContext, accountChanged, changedSides);
    if (accountChanged && reconciled.changed.length)
      categoryWarnings.current.set(
        id,
        Object.fromEntries(
          reconciled.changed.map((column) => [column, dsTexts.economicCategory.accountChanged]),
        ),
      );
    pins.markInherited(
      id,
      reconciled.changed.filter((column) => !!reconciled.values[column]),
    );
    onChange(lines.map((line) => (line.id === id ? { ...next, ...reconciled.values } : line)));
  };
  const singleUpdates = lines
    .map((line) => ({ line, ...reconcileCategories(line, categoryContext, false) }))
    .filter((item) => item.changed.length > 0);
  const singleSignature = JSON.stringify(singleUpdates.map((item) => [item.line.id, item.values]));
  const appliedSingle = React.useRef("");
  React.useLayoutEffect(() => {
    if (
      props.categoriesEnabled === false ||
      editable.size === 0 ||
      !singleUpdates.length ||
      appliedSingle.current === singleSignature
    )
      return;
    appliedSingle.current = singleSignature;
    for (const item of singleUpdates) pins.markInherited(item.line.id, item.changed);
    const byId = new Map(singleUpdates.map((item) => [item.line.id, item.values]));
    onChange(lines.map((line) => ({ ...line, ...byId.get(line.id) })));
  }, [singleSignature, editable.size, props.categoriesEnabled]); // eslint-disable-line react-hooks/exhaustive-deps -- synchronizace nové nabídky účtu do řízených dat, jen při konkrétní změně
  return { patch, categoryState, categoryContext, categoryWarnings, createCategory };
}
