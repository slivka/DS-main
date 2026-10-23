/** Formulář dokladu · vlastní společný model a zobrazení · nesmí ukládat data aplikace. */
import type { DocumentFormProps } from "./document-form-types";
import { useDocumentFormModel } from "./use-document-form-model";
import { DocumentFormView } from "./document-form-view";
import { FieldSuggestionContext } from "../../form/field-suggestion-context";
import { documentFieldSuggestion } from "./document-suggestions";
/** Kompletní formulář účetního dokladu; faktury i zálohové listy sdílejí stejnou cestu. */
export function DocumentForm(props: DocumentFormProps) {
  const model = useDocumentFormModel(props);
  return (
    <FieldSuggestionContext.Provider value={(id) => documentFieldSuggestion(props, id)}>
      <DocumentFormView props={props} model={model} />
    </FieldSuggestionContext.Provider>
  );
}
