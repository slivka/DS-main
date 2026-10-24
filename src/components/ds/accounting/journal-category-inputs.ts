/** Vstupy kategorií · vlastní přednost nových názvů · nesmí měnit původní props. */
import type { JournalLinesEditorProps } from "./journal-editor-types";
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
    lines: props.lines.map(normalizeCategoryLine),
    categories: props.categories ?? props.dimensions ?? [],
    onEditCategory: props.onEditCategory ?? props.onEditDimension,
    onCreateCategory: props.onCreateCategory ?? props.onCreateDimension,
    categoryRequired: props.categoryRequired ?? props.dimensionRequired,
    categoryBySide: props.categoryBySide ?? (props.mode ?? "internal") === "internal",
    rowSuggestions: suggestions,
    editableFields: props.editableFields?.map(
      (column) => categoryColumnAlias(column) as typeof column,
    ),
  };
}
