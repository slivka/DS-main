/** Další scénáře DocumentForm (preview-only): přijaté faktury, kurzové rozdíly, seskupení. */
import { DocumentFormSecondaryScenarios } from "./document-form-secondary-scenarios";
import { useDocumentFormShowcaseState } from "./use-document-form-showcase-state";

export function DocumentFormSecondaryShowcase() {
  const state = useDocumentFormShowcaseState();
  return <DocumentFormSecondaryScenarios state={state} />;
}
