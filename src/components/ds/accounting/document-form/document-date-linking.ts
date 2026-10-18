/** Vazby hlavičky · vlastní čistý přepočet · nesmí ukládat ani odvozovat změny efektem. */
import type { DocumentHeaderValue } from "./document-form-types";

/** Doplní navázaná data při uživatelské změně hlavičky. */
export function applyDocumentDateLinks(
  value: DocumentHeaderValue,
  patch: Partial<DocumentHeaderValue>,
  accountingLinked: boolean,
  taxDateLinked: boolean,
): DocumentHeaderValue {
  const next = { ...value, ...patch };
  if (patch.issueDate !== undefined) {
    if (accountingLinked) next.accountingDate = patch.issueDate;
    if (taxDateLinked && patch.taxDate === undefined) next.taxDate = patch.issueDate;
  }
  return next;
}
