/** Formulář dokladu · vlastní skládání sekcí · nesmí ukládat data aplikace. */
import { DocumentSections } from "./document-sections";
import { useState } from "react";
import { useDocumentDateLinks } from "./use-document-date-links";
import { toggleInvalidDate, useDocumentCounterpartyWarnings } from "./document-validation-feedback";
import {
  reportingLinesChange,
  reportingPatch,
  useDocumentFormFeedback,
} from "./use-document-form-issues";
import { TooltipProvider } from "../../../ui/tooltip";
import { formatAccountCode } from "../account-code";
import { documentFieldsForType, partnerLabelForType } from "../document-fields";
import { cn } from "../../../../lib/utils";
import { useDsTexts } from "../../../../ds-texts";
import { formatCodeName } from "../../../../lib/code-format";
import {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  type DocumentDateField,
  type DocumentFormProps,
  type DocumentHeaderField,
  type DocumentHeaderValue,
} from "./document-form-types";
import { useCurrencyControl } from "./use-currency-control";
import { useDocumentPaymentFields } from "./use-document-payment-fields";
import { variableSymbolLinkState } from "./use-variable-symbol-link";
import { deriveDocumentForm } from "./derive-document-form";
import { buildDocumentNotices } from "./build-document-notices";
import { useDocumentHeaderFields } from "./use-document-field-renderers";
import { buildDocumentTabs } from "./build-document-tabs";
import { DocumentFormTabs } from "./Tabs";
import { DocumentIdentityLine } from "./document-identity-line";
import { DocumentChangeMeta } from "./document-change-meta";
import { DocumentFormTop, handleDocumentSaveShortcut, useDetailTab } from "./document-form-top";
import { changeDocumentRounding, useDocumentFormStickyTop } from "./use-document-form-layout";
import { useIdentityAccountSelection } from "./use-identity-account-selection";
import { buildDocumentActionMenu } from "./document-action-menu";
/** Kompletní formulář účetního dokladu. */
export function DocumentForm(props: DocumentFormProps) {
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
    partners = [],
    dimensions = [],
    currencies,
    constantSymbolOptions,
    paymentMethodOptions,
    counterpartyInput = "partner",
    onCounterpartyInputChange,
    counterpartyInputLockedReason,
    counterpartyTab,
    printTab,
    documentType = "ID",
    fields,
    editableFields,
    mainSide,
    mainAccountLocked = false,
    rateAmount = 1,
    homeCurrency,
    homeCurrencySymbol,
    currencyLocked = false,
    currencyDisabledReason,
    onCreatePartner,
    onEditCounterparty,
    icoLinkTarget = "auto",
    handedOverBySuggest,
    descriptionSuggest,
    accountingDateLink,
    accountingDateLinked = true,
    onAccountingDateLinkedChange,
    taxDocumentNumberWarning,
    fieldErrors,
    dateWarnings,
    vat,
    vatRateField,
    linesEditorProps,
    roundingLimit = 1,
    roundingLabel,
    tabs = [],
    activeDetailTab,
    changedBy,
    changedAt,
    moreActions = [],
    error,
    issues: appIssues,
    validationActive,
    onFieldChange,
    notices,
    readOnly = false,
    texts,
    className,
  } = props;
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
    ["FV", "ZFV"].includes(code) || (showVatFields && ["BA", "ID", "PO"].includes(code));
  const vsLink = variableSymbolLinkState(code, value, patch, dsTexts.documentEdit);
  // Živý pruh + projekce položek do polí (rámeček + ikona + bublina) a buněk řádků.
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
    currencyOptions,
    currenciesPresent: Boolean(currencies),
    t,
  });
  return (
    <TooltipProvider>
      <div
        ref={formRef}
        className={cn("@container space-y-4", className)}
        onKeyDown={(event) => handleDocumentSaveShortcut(event, props.saveAction)}
      >
        <DocumentFormTop
          props={props}
          title={bankMovement ? dsTexts.documentEdit.movementTitle : title}
          moreActions={actionMenu}
          issues={formIssueList}
          notices={combinedNotices}
          vatRelevant={vatRelevant}
          onVatRelevantChange={(next) => patch({ vatRelevant: next })}
          t={t}
        />
        <section className="rounded-lg border bg-card p-4">
          <DocumentIdentityLine
            identity={effectiveIdentity}
            direction={props.directionBadge}
            fallback={t.numberPending}
            texts={t}
            accountLabel={identityAccount.identityAccountLabel}
            accountValue={value.mainAccountId}
            editingAccount={identityAccount.editingIdentityAccount}
            canEditAccount={canEditIdentityAccount}
            pencilRef={identityAccount.pencilRef}
            onStartAccountEdit={identityAccount.startAccountEdit}
            onAccountChange={(mainAccountId) => {
              const selected = allowedMainAccounts.find((item) =>
                sameAccount(item.code, mainAccountId),
              );
              if (!selected) return;
              identityAccount.selectIdentityAccount({
                code: mainAccountId,
                label: formatCodeName(formatAccountCode(selected.code), selected.name),
                sourceLabel: effectiveIdentity.account?.label,
              });
              patch({ mainAccountId });
              identityAccount.closeIdentityAccount();
            }}
            onAccountClose={identityAccount.closeIdentityAccount}
            accountOptions={allowedMainAccounts}
          />
          <DocumentSections
            companyAccountField={companyAccountField}
            basic={
              f.partner
                ? {
                    f,
                    t,
                    value,
                    patch,
                    partner,
                    partners,
                    partnerLabel:
                      texts?.partner ?? partnerLabelForType(documentType, value.direction),
                    counterpartyIco,
                    counterpartyDic,
                    linkedPartner: Boolean(value.partnerId),
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
                    receivedDocument,
                    bankAccountField,
                    paymentMethodOptions:
                      receivedDocument && code !== "DDPOZ" ? paymentMethodOptions : undefined,
                    paymentMethodLabel: t.paymentMethod,
                    counterpartyInput,
                    onCounterpartyInputChange,
                    taxNumberField,
                    internal,
                    counterpartyInputLockedReason,
                  }
                : undefined
            }
            dates={{
              t: bankMovement ? { ...t, issueDate: dsTexts.documentEdit.movementDate } : t,
              bankMovement,
              f,
              showVatFields,
              vat,
              filedVatDateWarning,
              dateWarnings,
              date,
            }}
            description={
              !f.partner ? (
                <>
                  {suggestedText(
                    "description",
                    t.description,
                    descriptionSuggest,
                    taxNumberField ? 14 : 20,
                  )}
                  {taxNumberField}
                </>
              ) : undefined
            }
            bank={
              bankMovement
                ? {
                    value,
                    patch,
                    bankCodes: props.bankCodes,
                    bankCodeOptions: props.bankCodeOptions,
                    disabled: !can("bankAccount"),
                    // Projekce chyb a varování do polí protiúčtu (Druh účtu, Číslo/IBAN, Kód/SWIFT).
                    fieldErrors: issueFieldErrors,
                    fieldWarnings: issueFieldWarnings,
                  }
                : undefined
            }
            payment={{
              f: bankMovement ? { ...f, bankAccount: false } : f,
              t: bankMovement ? { ...t, paymentSection: "" } : t,
              value,
              patch,
              can,
              issuedDocument,
              receivedDocument,
              issuedBankAccountAbove,
              symbolsDisabledReason,
              constantSymbolOptions,
              paymentMethodOptions:
                companyAccountField || receivedDocument ? undefined : paymentMethodOptions,
              companyBankAccountOptions: props.companyBankAccountOptions,
              bankAccountField,
              field,
              vsLink,
              layout: bankMovement ? "grid20" : "flex",
              // „Přidělí se při zařazení“ jen u vydaných dokladů ve stavu koncept.
              vsPendingText:
                ["FV", "ZFV", "DDPZ"].includes(code) && (props.status ?? "draft") === "draft"
                  ? dsTexts.documentEdit.numberPending
                  : undefined,
            }}
            amount={{
              t,
              value,
              patch,
              can,
              foreign,
              total,
              totalMode,
              forcedSum,
              currencySymbol,
              homeCurrency,
              homeCurrencySymbol,
              rateAmount,
              vatRateField,
              readOnly,
              currencyControl,
              field,
            }}
          />
        </section>
        <DocumentFormTabs
          tabs={allTabs}
          value={tab}
          onValueChange={setTab}
          linesLabel={t.linesTab}
        />
        <DocumentChangeMeta
          changedBy={changedBy}
          changedAt={changedAt}
          changedByLabel={t.changedBy}
          changedAtLabel={t.changedAt}
        />
      </div>
    </TooltipProvider>
  );
}
