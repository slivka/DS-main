/** Formulář dokladu · vlastní skládání sekcí · nesmí ukládat data aplikace. */
import { DocumentSections } from "./document-sections";
import { useState } from "react";
import { useDocumentDateLinks } from "./use-document-date-links";
import { documentValidationFeedback } from "./document-validation-feedback";
import { TaxDocumentNumberField } from "./tax-document-number-field";
import { TooltipProvider } from "../../../ui/tooltip";
import { PageHeader } from "../../layout/page-header";
import { RecordActionBar } from "../../layout/record-action-bar";
import { ReadOnlyBanner } from "../../feedback/read-only-banner";
import { isValidCzIco } from "../../form/ico-link";
import { formatAccountCode } from "../account-code";
import { DocumentStatusBadge } from "../document-status-badge";
import { documentFieldsForType, partnerLabelForType } from "../document-fields";
import { companyAccountControlForForm } from "./BankAccountControls";
import { useBankAccountField } from "./use-bank-account-field";
import { cn } from "../../../../lib/utils";
import { useDsTexts } from "../../../../ds-texts";
import { formatCodeName } from "../../../../lib/code-format";
import {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  type DocumentFormProps,
  type DocumentHeaderField,
  type DocumentHeaderValue,
} from "./document-form-types";
import { useCurrencyControl } from "./use-currency-control";
import { useExternalNumberField } from "./use-external-number-field";
import { deriveDocumentForm } from "./derive-document-form";
import { buildDocumentNotices } from "./build-document-notices";
import { useDocumentFieldRenderers } from "./use-document-field-renderers";
import { buildDocumentTabs } from "./build-document-tabs";
import { DocumentFormTabs } from "./Tabs";
import { DocumentIdentityLine } from "./document-identity-line";
import { DocumentChangeMeta } from "./document-change-meta";
import { DocumentVatActionStatus } from "./document-vat-action-status";
import { changeDocumentRounding, useDocumentFormStickyTop } from "./use-document-form-layout";
import { useIdentityAccountSelection } from "./use-identity-account-selection";
import { buildDocumentActionMenu } from "./document-action-menu";
/** Kompletní formulář účetního dokladu. */
export function DocumentForm({
  title,
  titleBadges,
  identity,
  directionBadge,
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
  bankAccountOptions = [],
  constantSymbolOptions,
  paymentMethodOptions,
  companyBankAccountOptions,
  onAddBankAccount,
  counterpartyInput = "partner",
  onCounterpartyInputChange,
  counterpartyInputLockedReason,
  paymentOrderEnabled = true,
  onPaymentOrderEnabledChange,
  isHomeCurrency,
  onManualBankAccountValidationChange,
  companyBankAccountDisabledReason,
  receivedAccountDisabledReason,
  vatPartnerStatus,
  counterpartyTab,
  printTab,
  bankCodes,
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
  fieldWarnings,
  dateWarnings,
  vat,
  vatRateField,
  linesEditorProps,
  roundingLimit = 1,
  roundingLabel,
  tabs = [],
  activeDetailTab,
  onActiveDetailTabChange,
  status,
  approved,
  changedBy,
  changedAt,
  saveAction,
  primaryAction,
  moreActions = [],
  settings,
  error,
  notices,
  readOnly = false,
  readOnlyReason,
  readOnlyTitle,
  readOnlyActions,
  texts,
  className,
}: DocumentFormProps) {
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
    patch,
    effectiveValue,
    link: effectiveAccountingLink,
  } = useDocumentDateLinks({
    code,
    value,
    onChange,
    accountingDateLink,
    accountingDateLinked,
    onAccountingDateLinkedChange,
  });
  const [uncontrolledTab, setUncontrolledTab] = useState("lines");
  const tab = activeDetailTab ?? uncontrolledTab;
  const setTab = (next: string) => {
    if (activeDetailTab === undefined) setUncontrolledTab(next);
    onActiveDetailTabChange?.(next);
  };
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
  const {
    editingIdentityAccount,
    pencilRef,
    closeIdentityAccount,
    startAccountEdit,
    selectIdentityAccount,
    identityAccountLabel,
  } = useIdentityAccountSelection(
    value.mainAccountId,
    effectiveIdentity.account?.label,
    sameAccount,
  );
  const actionMenu = buildDocumentActionMenu(moreActions, settings, t.settings);
  const { field, date, suggestedText } = useDocumentFieldRenderers({
    value: effectiveValue,
    patch,
    can,
    dateWarnings,
    accountingDateLink: effectiveAccountingLink,
    fieldErrors,
    fieldWarnings,
  });
  const counterpartyIco = value.counterpartyIco ?? partner?.ico ?? "";
  const counterpartyDic = value.counterpartyDic ?? partner?.dic ?? "";
  const icoWarning =
    !value.partnerId &&
    /^\d{8}$/.test(counterpartyIco.replace(/\s/g, "")) &&
    !isValidCzIco(counterpartyIco);
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
    bankAccountOptions,
    t,
  });
  const showTaxNumber =
    ["FV", "ZFV"].includes(code) || (showVatFields && ["BA", "ID", "PO"].includes(code));
  const taxNumberField = showTaxNumber
    ? field(
        "document-taxDocumentNumber",
        dsTexts.documentEdit.taxNumber,
        <TaxDocumentNumberField
          value={value}
          patch={patch}
          warning={taxDocumentNumberWarning}
          disabled={!can("taxDocumentNumber")}
        />,
        6,
      )
    : null;
  const { error: effectiveError, notices: validationNotices } = documentValidationFeedback({
    value,
    foreign,
    vatRateField,
    t,
    notices: combinedNotices,
    error,
    fieldErrors,
    fieldWarnings,
    taxDocumentNumberWarning,
    icoWarning,
  });
  const receivedAccountReason = ["FP", "ZFP"].includes(documentType.toUpperCase())
    ? receivedAccountDisabledReason
    : undefined;
  const paymentOrderOn = !receivedAccountReason && (!f.paymentOrders || paymentOrderEnabled);
  const externalNumberField = useExternalNumberField({
    value,
    patch,
    can,
    receivedDocument,
    showVatFields,
    f,
    t,
    field,
  });
  const bankAccountField = useBankAccountField({
    value,
    patch,
    can,
    t,
    field,
    receivedDocument,
    counterpartyInput,
    bankAccountOptions,
    bankCodes,
    isHomeCurrency: isHomeCurrency ?? value.currency === homeCurrency,
    paymentOrdersApplicable: Boolean(f.paymentOrders),
    paymentOrderEnabled: paymentOrderOn,
    onPaymentOrderEnabledChange,
    onManualBankAccountValidationChange,
    onAddBankAccount,
    receivedAccountDisabledReason: receivedAccountReason,
  });
  const issuedBankAccountAbove =
    issuedDocument && ["FV", "ZFV"].includes(documentType.toUpperCase());
  const symbolsDisabledReason = receivedDocument
    ? (receivedAccountReason ?? (!paymentOrderOn ? t.paymentOrderDisabled : undefined))
    : issuedBankAccountAbove
      ? companyBankAccountDisabledReason
      : undefined;
  const companyAccountField =
    issuedBankAccountAbove && f.bankAccount
      ? companyAccountControlForForm(
          {
            value,
            companyBankAccountOptions,
            companyBankAccountDisabledReason,
          },
          patch,
          can,
          t.payToBankAccount,
          paymentMethodOptions,
          t.paymentMethod,
        )
      : null;
  const changeRounding = (roundingAmount: number) => {
    patch({ roundingAmount });
    onLinesChange(changeDocumentRounding(lines, roundingAmount, roundingLabel ?? t.rounding));
  };
  const allTabs = buildDocumentTabs({
    lines,
    onLinesChange,
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
    linesEditorProps,
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
        onKeyDown={(event) => {
          if (
            (event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s" &&
            saveAction &&
            !saveAction.disabled &&
            !saveAction.busy
          ) {
            event.preventDefault();
            saveAction.onSave();
          }
        }}
      >
        <PageHeader
          title={bankMovement ? dsTexts.documentEdit.movementTitle : title}
          titleBadge={
            <span
              data-slot="document-title-badges"
              className="inline-flex h-[1.625rem] shrink-0 items-center gap-1.5 whitespace-nowrap [&_[data-slot=badge]]:h-[1.625rem] [&_[data-slot=badge]]:px-2.5 [&_[data-slot=badge]]:text-sm"
            >
              <DocumentStatusBadge status={status} approved={approved} size="md" />
              {titleBadges}
            </span>
          }
        />
        <RecordActionBar
          leftContent={
            vat?.visible ? (
              <DocumentVatActionStatus
                checked={vatRelevant}
                readOnly={vat.relevantReadOnly}
                onCheckedChange={(next) => patch({ vatRelevant: next })}
                status={vatPartnerStatus}
                texts={t}
              />
            ) : null
          }
          saveAction={saveAction}
          primaryAction={primaryAction}
          moreActions={actionMenu}
          error={effectiveError}
          notices={validationNotices}
          saveLabel={dsTexts.common.save}
          moreActionsLabel={dsTexts.recordAction.moreActions}
          errorTitle={t.errorTitle}
          closeErrorLabel={t.closeError}
          dataSlot="document-action-bar"
          errorDataSlot="document-form-error"
          noticesDataSlot="document-form-notices"
        />
        {readOnly && readOnlyReason ? (
          <ReadOnlyBanner reason={readOnlyReason} title={readOnlyTitle} actions={readOnlyActions} />
        ) : null}
        <section className="rounded-lg border bg-card p-4">
          <DocumentIdentityLine
            identity={effectiveIdentity}
            direction={directionBadge}
            fallback={t.numberPending}
            texts={t}
            accountLabel={identityAccountLabel}
            accountValue={value.mainAccountId}
            editingAccount={editingIdentityAccount}
            canEditAccount={canEditIdentityAccount}
            pencilRef={pencilRef}
            onStartAccountEdit={startAccountEdit}
            onAccountChange={(mainAccountId) => {
              const selected = allowedMainAccounts.find((item) =>
                sameAccount(item.code, mainAccountId),
              );
              if (!selected) return;
              selectIdentityAccount({
                code: mainAccountId,
                label: formatCodeName(formatAccountCode(selected.code), selected.name),
                sourceLabel: effectiveIdentity.account?.label,
              });
              patch({ mainAccountId });
              closeIdentityAccount();
            }}
            onAccountClose={closeIdentityAccount}
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
              t: bankMovement ? { ...t, accountingDate: dsTexts.documentEdit.movementDate } : t,
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
            bank={bankMovement ? { value, patch, bankCodes, disabled: readOnly } : undefined}
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
              companyBankAccountOptions,
              bankAccountField,
              field,
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
