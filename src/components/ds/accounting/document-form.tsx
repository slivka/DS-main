/**
 * Veřejný vstup formuláře dokladu.
 * Zachovává importní cestu a exportuje rozdělenou implementaci beze změny API.
 */
export { DocumentForm } from "./document-form/DocumentForm";
export { DocumentActionBar, DocumentDirectionBadge } from "./document-form/document-form-actions";
export { documentIdentityVariantForType, type DocumentIdentityVariant } from "./document-fields";
export {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  vsFromDocumentNumber,
} from "./document-form/document-form-types";
export type {
  DocumentAccountingDateLink,
  DocumentDateField,
  DocumentDirection,
  DocumentFormError,
  DocumentFormProps,
  DocumentFormTab,
  DocumentFormTexts,
  DocumentHeaderField,
  DocumentHeaderValue,
  DocumentIdentity,
  DocumentMoreAction,
  DocumentPrimaryAction,
  DocumentSaveAction,
  DocumentSettingsAction,
  DocumentSuggestConfig,
  DocumentVatConfig,
  DocumentVatRateField,
} from "./document-form/document-form-types";
