/** Vstupy kategorií · vlastní přednost nových názvů · nesmí měnit původní props. */
import type { JournalLinesEditorProps } from "./journal-editor-types";
import { legacyDimensionCategories } from "./journal-dimension-inputs";
import { normalizeCategoryLine } from "./journal-category-model";
/** Převod uložených id sloupců a editovatelných polí. */
export function categoryColumnAlias(column: string) {
  return column === "dimensionId"
    ? "categoryId"
    : column === "debitDimensionId"
      ? "debitCategoryId"
      : column === "creditDimensionId"
        ? "creditCategoryId"
        : column;
}
/** Kompatibilní vstup editoru; nový název platí i při prázdném seznamu. */
export function journalCategoryInputs(props: JournalLinesEditorProps): JournalLinesEditorProps {
  const suggestions =
    props.rowSuggestions &&
    Object.fromEntries(
      Object.entries(props.rowSuggestions).map(([id, row]) => [
        id,
        { ...row, category: row.category ?? row.dimension },
      ]),
    );
  return {
    ...props,
    onChange: (lines) =>
      props.onChange(
        lines.map((line) => {
          const original = props.lines.find((item) => item.id === line.id);
          if (
            legacyDimensionCategories(props.dimensions).length === 0 &&
            !original?.dimensionId &&
            !original?.debitDimensionId &&
            !original?.creditDimensionId
          )
            return line;
          return {
            ...line,
            dimensionId: line.categoryId,
            debitDimensionId: line.debitCategoryId,
            creditDimensionId: line.creditCategoryId,
          };
        }),
      ),
    lines: props.lines.map(normalizeCategoryLine),
    categories: props.categories ?? legacyDimensionCategories(props.dimensions),
    onEditCategory: props.onEditCategory ?? props.onEditDimension,
    onCreateCategory: props.onCreateCategory ?? props.onCreateDimension,
    categoryRequired: props.categoriesEnabled === false ? false : props.categoryRequired ?? props.dimensionRequired,
    categoryBySide: props.bookkeepingMode === "tax_records" ? false : props.categoryBySide ?? (props.mode ?? "internal") === "internal",
    rowSuggestions: suggestions,
    onSuggestionCleared: (key, rowId) =>
      props.onSuggestionCleared?.(
        key === "category" &&
          rowId &&
          !props.rowSuggestions?.[rowId]?.category &&
          props.rowSuggestions?.[rowId]?.dimension
          ? "dimension"
          : key,
        rowId,
      ),
    editableFields: props.editableFields?.map(
      (column) => categoryColumnAlias(column) as typeof column,
    ),
  };
}
