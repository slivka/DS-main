/** Formulář dokladu · vlastní společný model a zobrazení · nesmí ukládat data aplikace. */
import type { DocumentFormProps } from "./document-form-types";
import { useDocumentFormModel } from "./use-document-form-model";
import { DocumentFormView } from "./document-form-view";
/** Kompletní formulář účetního dokladu; faktury i zálohové listy sdílejí stejnou cestu. */
export function DocumentForm(props: DocumentFormProps) {
  return <DocumentFormView props={props} model={useDocumentFormModel(props)} />;
}
