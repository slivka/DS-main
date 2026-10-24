/** Formulář dokladu · vlastní skládání sekcí · nesmí ukládat data aplikace. */
import { useDocumentDateLinks } from "./use-document-date-links";
import { reportingPatch } from "./use-document-form-issues";
import { documentFieldsForType } from "../document-fields";
import { useDsTexts } from "../../../../ds-texts";
import {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  type DocumentFormProps,
  type DocumentHeaderField,
} from "./document-form-types";
import { deriveDocumentForm } from "./derive-document-form";
import { useDetailTab } from "./document-form-top";
import { useDocumentFormStickyTop } from "./use-document-form-layout";
import { useIdentityAccountSelection } from "./use-identity-account-selection";
import { buildDocumentActionMenu } from "./document-action-menu";
import { documentFormInputs } from "./document-form-inputs";
import { clearChangedHeaderSuggestions, useSuggestionClear } from "./document-suggestions";
/** Kompletní formulář účetního dokladu. */
export function useDocumentFormBase(props: DocumentFormProps) {
  const inputs = documentFormInputs(props);
  const {
    identity,
    value,
    onChange,
    lines,
    books,
    accounts,
    mainAccountOptions,
    partners,
    currencies,
    documentType,
    fields,
    editableFields,
    mainSide,
    mainAccountLocked,
    rateAmount,
    homeCurrency,
    accountingDateLink,
    accountingDateLinked,
    onAccountingDateLinkedChange,
    linesEditorProps,
    activeDetailTab,
    moreActions,
    onFieldChange,
    readOnly,
    texts,
  } = inputs;
  const dsTexts = useDsTexts();
  const t = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...dsTexts.documentForm, ...texts };
  const code = documentType.toUpperCase();
  const bankMovement = code === "BA";
  const internal = code === "ID";
  const f = {
    ...documentFieldsForType(documentType),
    ...fields,
    ...(internal ? { partner: true, taxDate: true } : {}),
  };
  const {
    patch: datePatch,
    effectiveValue,
    link: effectiveAccountingLink,
  } = useDocumentDateLinks({
    code,
    value,
    onChange,
    accountingDateLink,
    accountingDateLinked,
    onAccountingDateLinkedChange,
    onFieldChange: (fieldId) => onFieldChange?.(fieldId),
    readOnly: readOnly || ["posted", "locked", "cancelled"].includes(props.status ?? ""),
  });
  const clearSuggestion = useSuggestionClear(props.fieldSuggestions, props.onSuggestionCleared);
  const patch = reportingPatch((next) => {
    datePatch(next);
    clearChangedHeaderSuggestions(value, next, clearSuggestion);
  }, onFieldChange);
  const [tab, setTab] = useDetailTab(activeDetailTab, props.onActiveDetailTabChange);
  const formRef = useDocumentFormStickyTop();
  const explicitLock = (key: DocumentHeaderField) => props.lockedReason?.[key];
  const vatDateLock = (key: DocumentHeaderField) =>
    key === "vatDate" && props.vat?.dateLockReadOnly ? t.vatDateLockedHint : undefined;
  const can = (key: DocumentHeaderField) =>
    !readOnly && !explicitLock(key) && !vatDateLock(key) &&
    (!editableFields || editableFields.includes(key));
  // Nový kontrakt zamyká přímo; původní alias zachovává pravidlo editableFields.
  const lockReason = (key: DocumentHeaderField) =>
    explicitLock(key) ?? (!can(key) ? props.fieldLockedReasons?.[key] : undefined) ?? vatDateLock(key);
  const {
    receivedDocument,
    issuedDocument,
    forcedSum,
    totalMode,
    lineRounding,
    vatTotals,
    total,
    partner,
    sameAccount,
    allowedMainAccounts,
    mode,
    foreign,
    currencySymbol,
    currencyOptions,
    identityVariant,
    effectiveIdentity,
    canEditIdentityAccount,
  } = deriveDocumentForm({
    documentType,
    value,
    lines,
    linesEditorProps,
    readOnly,
    f,
    mainSide,
    homeCurrency,
    rateAmount,
    partners,
    accounts,
    mainAccountOptions,
    currencies,
    books,
    identity,
    can,
    mainAccountLocked,
  });
  const identityAccount = useIdentityAccountSelection(
    value.mainAccountId,
    effectiveIdentity.account?.label,
    sameAccount,
  );
  const actionMenu = buildDocumentActionMenu(moreActions, props.settings, t.settings);
  return {
    inputs,
    dsTexts,
    t,
    code,
    bankMovement,
    internal,
    f,
    effectiveValue,
    effectiveAccountingLink,
    patch,
    tab,
    setTab,
    formRef,
    can,
    lockReason,
    receivedDocument,
    issuedDocument,
    forcedSum,
    totalMode,
    lineRounding,
    vatTotals,
    total,
    partner,
    sameAccount,
    allowedMainAccounts,
    mode,
    foreign,
    currencySymbol,
    currencyOptions,
    identityVariant,
    effectiveIdentity,
    canEditIdentityAccount,
    identityAccount,
    actionMenu,
  };
}
