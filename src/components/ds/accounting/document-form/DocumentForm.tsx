import { useEffect, useRef, useState } from "react";
import { Settings } from "lucide-react";
import { TooltipProvider } from "../../../ui/tooltip";
import { PageHeader } from "../../layout/page-header";
import { RecordActionBar } from "../../layout/record-action-bar";
import { ReadOnlyBanner } from "../../feedback/read-only-banner";
import { isValidCzIco } from "../../form/ico-link";
import { formatAccountCode } from "../account-code";
import { DocumentStatusBadge } from "../document-status-badge";
import {
  documentFieldsForType,
  partnerLabelForType,
  type DocumentFields,
} from "../document-fields";
import { CompanyAccountControl, ReceivedAccountControl } from "./BankAccountControls";
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
import { DocumentDatesSection } from "./DatesSection";
import { DocumentBasicSection } from "./BasicSection";
import { DocumentAmountSection } from "./AmountSection";
import { DocumentPaymentSection } from "./PaymentSection";
import { DocumentIdentityLine } from "./document-identity-line";
import { DocumentChangeMeta } from "./document-change-meta";
import { DocumentVatActionStatus } from "./document-vat-action-status";
import { changeDocumentRounding, useDocumentFormStickyTop } from "./use-document-form-layout";
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
  icoLinkTarget = "auto",
  handedOverBySuggest,
  descriptionSuggest,
  accountingDateLink,
  dateWarnings,
  vat,
  vatRateField,
  linesEditorProps,
  roundingLimit = 1,
  roundingLabel,
  tabs = [],
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
  const homeCurrencyDocument = isHomeCurrency ?? value.currency === homeCurrency;
  const t = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...dsTexts.documentForm, ...texts };
  const f: DocumentFields = { ...documentFieldsForType(documentType), ...fields };
  const [tab, setTab] = useState("lines");
  const [editingIdentityAccount, setEditingIdentityAccount] = useState(false);
  const [selectedIdentityAccount, setSelectedIdentityAccount] = useState<{
    code: string;
    label: string;
    sourceLabel?: string;
  } | null>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);
  const returnFocusToPencil = useRef(false);
  useEffect(() => {
    if (editingIdentityAccount || !returnFocusToPencil.current) return;
    returnFocusToPencil.current = false;
    pencilRef.current?.focus();
  }, [editingIdentityAccount]);
  const closeIdentityAccount = () => {
    returnFocusToPencil.current = true;
    setEditingIdentityAccount(false);
  };
  const formRef = useDocumentFormStickyTop();
  const patch = (values: Partial<DocumentHeaderValue>) => onChange({ ...value, ...values });
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
  const partnerLabel = texts?.partner ?? partnerLabelForType(documentType, value.direction);
  useEffect(() => {
    if (!selectedIdentityAccount) return;
    if (
      !sameAccount(selectedIdentityAccount.code, value.mainAccountId) ||
      effectiveIdentity.account?.label !== selectedIdentityAccount.sourceLabel
    ) {
      setSelectedIdentityAccount(null);
    }
  }, [effectiveIdentity.account?.label, sameAccount, selectedIdentityAccount, value.mainAccountId]);
  const identityAccountLabel =
    selectedIdentityAccount && sameAccount(selectedIdentityAccount.code, value.mainAccountId)
      ? selectedIdentityAccount.label
      : effectiveIdentity.account?.label;
  const actionMenu = settings
    ? [
        { id: "document-settings", label: t.settings, onClick: settings.onOpen, icon: Settings },
        ...moreActions.map((action, index) =>
          index === 0 ? { ...action, separatorBefore: true } : action,
        ),
      ]
    : moreActions;
  const { field, date, text, suggestedText } = useDocumentFieldRenderers({
    value,
    patch,
    can,
    dateWarnings,
    accountingDateLink,
  });
  const counterpartyIco = value.counterpartyIco ?? partner?.ico ?? "";
  const counterpartyDic = value.counterpartyDic ?? partner?.dic ?? "";
  const icoWarning =
    !Boolean(value.partnerId) &&
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
  const bankAccountField = field(
    "document-bankAccount",
    t.bankAccount,
    receivedDocument ? (
      <ReceivedAccountControl
        counterpartyInput={counterpartyInput}
        partnerAccountId={value.partnerBankAccountId}
        manualValue={value.manualBankAccount}
        options={bankAccountOptions}
        bankCodes={bankCodes}
        hasPartner={Boolean(value.partnerId)}
        isHomeCurrency={homeCurrencyDocument}
        paymentOrderEnabled={paymentOrderEnabled}
        onPaymentOrderEnabledChange={onPaymentOrderEnabledChange}
        onPartnerAccountChange={(partnerBankAccountId) => patch({ partnerBankAccountId })}
        onManualChange={(manualBankAccount) => patch({ manualBankAccount })}
        onValidationChange={onManualBankAccountValidationChange}
        onAddAccount={onAddBankAccount}
        disabled={!can("bankAccount")}
        texts={t}
      />
    ) : null,
    receivedDocument ? 14 : 6,
    false,
    receivedDocument ? "@min-[40rem]:col-span-14" : undefined,
  );
  const issuedBankAccountAbove =
    issuedDocument && ["FV", "ZFV"].includes(documentType.toUpperCase());
  const companyAccountField =
    issuedBankAccountAbove && f.bankAccount && companyBankAccountOptions
      ? (
          <CompanyAccountControl
            value={value.companyBankAccountId}
            onChange={(companyBankAccountId) => patch({ companyBankAccountId })}
            options={companyBankAccountOptions}
            disabled={!can("companyBankAccountId")}
            disabledReason={companyBankAccountDisabledReason}
            label={t.payToBankAccount}
          />
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
          title={title}
          titleBadge={
            <span
              data-slot="document-title-badges"
              className="inline-flex h-[1.625rem] shrink-0 items-center gap-1.5 whitespace-nowrap [&_[data-slot=badge]]:h-[1.625rem] [&_[data-slot=badge]]:px-2.5 [&_[data-slot=badge]]:text-sm"
            >
              {" "}
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
          error={error}
          notices={combinedNotices}
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
            onStartAccountEdit={() => setEditingIdentityAccount(true)}
            onAccountChange={(mainAccountId) => {
              const selected = allowedMainAccounts.find((item) =>
                sameAccount(item.code, mainAccountId),
              );
              if (!selected) return;
              setSelectedIdentityAccount({
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
          {companyAccountField ? (
            <div data-slot="company-bank-account-above" className="grid grid-cols-20 gap-3">
              {companyAccountField}
            </div>
          ) : null}
          {f.partner ? (
            <DocumentBasicSection
              f={f}
              t={t}
              value={value}
              patch={patch}
              partner={partner}
              partners={partners}
              partnerLabel={partnerLabel}
              counterpartyIco={counterpartyIco}
              counterpartyDic={counterpartyDic}
              linkedPartner={Boolean(value.partnerId)}
              icoWarning={icoWarning}
              icoLinkTarget={icoLinkTarget}
              can={can}
              onCreatePartner={onCreatePartner}
              field={field}
              suggestedText={suggestedText}
              handedOverBySuggest={handedOverBySuggest}
              descriptionSuggest={descriptionSuggest}
              externalNumberField={externalNumberField}
              receivedDocument={receivedDocument}
              bankAccountField={bankAccountField}
              counterpartyInput={counterpartyInput}
              onCounterpartyInputChange={onCounterpartyInputChange}
              counterpartyInputLockedReason={counterpartyInputLockedReason}
            />
          ) : null}
          <DocumentDatesSection
            t={t}
            f={f}
            showVatFields={showVatFields}
            vat={vat}
            filedVatDateWarning={filedVatDateWarning}
            dateWarnings={dateWarnings}
            date={date}
          />
          {!f.partner ? (
            <div className="mt-3 grid grid-cols-20 gap-3">
              {suggestedText("description", t.description, descriptionSuggest, 20)}
            </div>
          ) : null}
          <DocumentPaymentSection
            f={f}
            t={t}
            value={value}
            patch={patch}
            can={can}
            issuedDocument={issuedDocument}
            issuedBankAccountAbove={issuedBankAccountAbove}
            paymentOrderEnabled={paymentOrderEnabled}
            constantSymbolOptions={constantSymbolOptions}
            paymentMethodOptions={paymentMethodOptions}
            companyBankAccountOptions={companyBankAccountOptions}
            bankAccountField={bankAccountField}
            field={field}
            text={text}
          />
          <DocumentAmountSection
            t={t}
            value={value}
            patch={patch}
            can={can}
            foreign={foreign}
            total={total}
            totalMode={totalMode}
            forcedSum={forcedSum}
            currencySymbol={currencySymbol}
            homeCurrency={homeCurrency}
            homeCurrencySymbol={homeCurrencySymbol}
            rateAmount={rateAmount}
            vatRateField={vatRateField}
            readOnly={readOnly}
            currencyControl={currencyControl}
            field={field}
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
