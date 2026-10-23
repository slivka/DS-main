/** Návrhy polí · vlastní volitelné přiřazení podle id · nesmí znát doménu ani měnit hodnoty. */
import { createContext } from "react";
import type { FieldSuggestion } from "./field-feedback";

/** Nadřazený formulář přiřadí návrh sdílenému poli podle id jeho ovládání. */
export const FieldSuggestionContext = createContext<
  ((id: string) => FieldSuggestion | undefined) | undefined
>(undefined);