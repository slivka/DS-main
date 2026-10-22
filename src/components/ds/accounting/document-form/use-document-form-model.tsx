/** Formulář dokladu · vlastní skládání sekcí · nesmí ukládat data aplikace. */
import { useState } from "react";
import { useDocumentDateLinks } from "./use-document-date-links";
import { toggleInvalidDate, useDocumentCounterpartyWarnings } from "./document-validation-feedback";
import {
  reportingLinesChange,
  reportingPatch,
  useDocumentFormFeedback,
} from "./use-document-form-issues";
import { documentFieldsForType } from "../document-fields";
import { useDsTexts } from "../../../../ds-texts";
import {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  type DocumentDateField,
  type DocumentFormProps,
  type DocumentHeaderField,
  type DocumentHeaderValue,
} from "./document-form-types";
import { useCurrencyControl } from "./use-currency-control";
import { useDocumentPaymentFields } from "./use-document-payment-fields";
import { useVariableSymbolLink } from "./use-variable-symbol-link";
import { deriveDocumentForm } from "./derive-document-form";
import { buildDocumentNotices } from "./build-document-notices";
import { useDocumentHeaderFields } from "./use-document-field-renderers";
import { buildDocumentTabs } from "./build-document-tabs";
import { useDetailTab } from "./document-form-top";
import { changeDocumentRounding, useDocumentFormStickyTop } from "./use-document-form-layout";
import { useIdentityAccountSelection } from "./use-identity-account-selection";
import { buildDocumentActionMenu } from "./document-action-menu";
import { documentFormInputs } from "./document-form-inputs";
/** Kompletní formulář účetního dokladu. */
export function useDocumentFormModel(props: DocumentFormProps) {
  const {
    title,
    identity,
    value,
    onChange,
    lines,
    onLinesChange,
    books,
    accounts,
    mainAccountOptions,
    partners,
    dimensions,
    currencies,
    constantSymbolOptions,
    paymentMethodOptions,
    counterpartyInput,
    onCounterpartyInputChange,
    counterpartyInputLockedReason,
    counterpartyTab,
    printTab,
    documentType,
    fields,
    editableFields,
    mainSide,
    mainAccountLocked,
    rateAmount,
    homeCurrency,
    homeCurrencySymbol,
    currencyLocked,
    currencyDisabledReason,
    onCreatePartner,
    onEditCounterparty,
    icoLinkTarget,
    handedOverBySuggest,
    descriptionSuggest,
    accountingDateLink,
    accountingDateLinked,
    onAccountingDateLinkedChange,
    taxDocumentNumberWarning,
    fieldErrors,
    dateWarnings,
    vat,
    vatRateField,
    linesEditorProps,
    roundingLimit,
    roundingLabel,
    tabs,
    activeDetailTab,
    changedBy,
    changedAt,
    moreActions,
    error,
    appIssues,
    validationActive,
    onFieldChange,
    notices,
    readOnly,
    texts,
    className,
  } = documentFormInputs(props);
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
  const patch = reportingPatch(datePatch, onFieldChange);
  const [tab, setTab] = useDetailTab(activeDetailTab, props.onActiveDetailTabChange);
  const formRef = useDocumentFormStickyTop();
  const can = (key: DocumentHeaderField) =>
    !readOnly && (!editableFields || editableFields.includes(key));
  // Obecný zámek pole (2.128.0): jen pole mimo editableFields s dodaným důvodem aplikace.
  const lockReason = (key: DocumentHeaderField) =>
    !can(key) ? props.fieldLockedReasons?.[key] : undefined;
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
  const [invalidDates, setInvalidDates] = useState<Partial<Record<DocumentDateField, true>>>({});
  const { counterpartyIco, counterpartyDic, icoWarning, effectiveFieldWarnings } =
    useDocumentCounterpartyWarnings({
      value,
      partner,
      internal,
      counterpartyInput,
      fieldWarnings: props.fieldWarnings,
      internalManualPartner: dsTexts.documentEdit.internalManualPartner,
    });
  const filedVatDateWarning = vat?.periodFiled ? (vat.filedWarning ?? t.filedWarning) : undefined;
  const vatRelevant = value.vatRelevant !== false;
  const showVatFields = Boolean(vat?.visible && vatRelevant);
  const combinedNotices = buildDocumentNotices({
    value,
    dateWarnings,
    f,
    showVatFields,
    filedVatDateWarning,
    notices,
    bankAccountOptions: props.bankAccountOptions ?? [],
    t,
  });
  const showTaxNumber =
    ["FV", "ZFV"].includes(code) || (showVatFields && ["BA", "ID"].includes(code));
  const vsLink = useVariableSymbolLink(code, value, patch, dsTexts.documentEdit);
  const {
    issues: formIssueList,
    onValidationChange,
    issueFieldErrors,
    issueFieldWarnings,
    cellIssues,
  } = useDocumentFormFeedback({
    validation: {
      code,
      value,
      foreign,
      vatRateField,
      t,
      fieldErrors,
      fieldWarnings: effectiveFieldWarnings,
      taxDocumentNumberWarning,
      icoWarning,
      readOnly,
      invalidDates: Object.keys(invalidDates) as DocumentDateField[],
      variableSymbolWarning: vsLink.warning,
      variableSymbolLabel: t.variableSymbol,
      taxNumberLabel: dsTexts.documentEdit.taxNumber,
      fieldLabels: {
        taxDocumentNumber: dsTexts.documentEdit.taxNumber,
        counterpartyCountry: dsTexts.documentForm.country,
        bankCode: dsTexts.documentEdit.bankCode,
        bankIban: dsTexts.documentEdit.iban,
        bankSwift: dsTexts.documentEdit.swift,
        bankAccountKind: dsTexts.documentEdit.accountKind,
      },
    },
    issues: appIssues,
    error,
    validationActive,
    rowLabel: dsTexts.journalEditor.row,
    onValidationChange: linesEditorProps?.onValidationChange,
  });
  const { field, date, suggestedText, taxNumberField } = useDocumentHeaderFields({
    value: effectiveValue,
    patch,
    can,
    dateWarnings,
    accountingDateLink: effectiveAccountingLink,
    bankMovement,
    showTaxNumber,
    taxDocumentNumberWarning,
    // Neaktivní validace skrývá jen klientské chyby; projekce ponechá server i varování.
    fieldErrors: { ...(validationActive === false ? {} : fieldErrors), ...issueFieldErrors },
    fieldWarnings: { ...effectiveFieldWarnings, ...issueFieldWarnings },
    lockReason,
    onInvalidDate: (key, invalid) =>
      setInvalidDates((prev) => toggleInvalidDate(prev, key, invalid)),
  });
  const {
    externalNumberField,
    bankAccountField,
    issuedBankAccountAbove,
    symbolsDisabledReason,
    companyAccountField,
  } = useDocumentPaymentFields(props, {
    f,
    t,
    value,
    patch,
    can,
    field,
    receivedDocument,
    issuedDocument,
    showVatFields,
    sourcePatch: vsLink.sourcePatch,
  });
  const changeRounding = (roundingAmount: number) => {
    patch({ roundingAmount });
    onLinesChange(changeDocumentRounding(lines, roundingAmount, roundingLabel ?? t.rounding));
  };
  const allTabs = buildDocumentTabs({
    lines,
    onLinesChange: reportingLinesChange(lines, onLinesChange, onFieldChange),
    accounts,
    dimensions,
    partners,
    mode,
    mainSide,
    value,
    totalMode,
    currencies,
    homeCurrency,
    homeCurrencySymbol,
    rateAmount,
    linesEditorProps: {
      ...linesEditorProps,
      onValidationChange,
      cellIssues,
    },
    readOnly,
    f,
    lineRounding,
    total,
    can,
    changeRounding,
    roundingLabel,
    t,
    roundingLimit,
    vatTotals,
    tabs,
    issuedDocument,
    counterpartyTab,
    printTab,
  });
  const currencyControl = useCurrencyControl({
    value,
    patch,
    can,
    currencyLocked,
    readOnly,
    identityVariant,
    currencyDisabledReason,
    lockedReason: lockReason("currency"),
    currencyOptions,
    currenciesPresent: Boolean(currencies),
    t,
  });
  return {
    formRef,
    className,
    bankMovement,
    dsTexts,
    title,
    actionMenu,
    formIssueList,
    combinedNotices,
    vatRelevant,
    receivedDocument,
    counterpartyInput,
    patch,
    code,
    t,
    effectiveIdentity,
    identityAccount,
    value,
    canEditIdentityAccount,
    allowedMainAccounts,
    sameAccount,
    companyAccountField,
    f,
    partner,
    partners,
    texts,
    documentType,
    counterpartyIco,
    counterpartyDic,
    icoWarning,
    icoLinkTarget,
    can,
    onCreatePartner,
    onEditCounterparty,
    readOnly,
    field,
    suggestedText,
    handedOverBySuggest,
    descriptionSuggest,
    externalNumberField,
    bankAccountField,
    paymentMethodOptions,
    onCounterpartyInputChange,
    taxNumberField,
    internal,
    counterpartyInputLockedReason,
    showVatFields,
    vat,
    filedVatDateWarning,
    dateWarnings,
    date,
    lockReason,
    issueFieldErrors,
    issueFieldWarnings,
    issuedDocument,
    issuedBankAccountAbove,
    symbolsDisabledReason,
    constantSymbolOptions,
    vsLink,
    foreign,
    total,
    totalMode,
    forcedSum,
    currencySymbol,
    homeCurrency,
    homeCurrencySymbol,
    rateAmount,
    vatRateField,
    currencyControl,
    allTabs,
    tab,
    setTab,
    changedBy,
    changedAt,
  };
}
