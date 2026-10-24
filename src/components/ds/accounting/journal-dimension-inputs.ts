/** Přechod názvu dimensions · vlastní rozlišení B1 aliasu a B2 hodnot · bez mutace. */
import type { CategoryOption } from "./category-select";
import type { DimensionValue } from "../form/dimension-types";
/** Starý dimensions číselník kategorie rozpoznáme podle struktury; prázdný seznam je neutrální. */
export function legacyDimensionCategories(values?: CategoryOption[] | DimensionValue[]): CategoryOption[] {
  return values?.filter((value): value is CategoryOption => "name" in value) ?? [];
}
/** Skutečné dimenze B2 rozpoznáme podle typeId; bez zapojení zůstává undefined. */
export function headerDimensionValues(values?: CategoryOption[] | DimensionValue[], enabled = false): DimensionValue[] | undefined {
  if (!values) return enabled ? [] : undefined;
  if (values.length === 0) return enabled ? [] : undefined;
  return "typeId" in (values[0] ?? {}) ? values.filter((value): value is DimensionValue => "typeId" in value) : undefined;
}
