import { Fragment, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, Pencil, Settings, Sigma } from "lucide-react";

import { Input } from "../../ui/input";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { PageHeader } from "../layout/page-header";
import { Field } from "../layout/RecordDialog";
import {
  RecordActionBar,
  type RecordMoreAction,
  type RecordPrimaryAction,
  type RecordSaveAction,
} from "../layout/record-action-bar";
import { CheckboxField } from "../form/checkbox-field";
import { SectionHeading } from "../layout/section-heading";
import { ReadOnlyBanner } from "../feedback/read-only-banner";
import { NoticeBar } from "../feedback/notice-bar";
import { VatStatusBadge, type VatStatus } from "../data-display/vat-status-badge";
import { DateField } from "../form/date-field";
import { DecimalInput } from "../form/decimal-input";
import { IcoLink, isValidCzIco, type IcoLinkTarget } from "../form/ico-link";
import { OptionSelect } from "../form/option-select";
import { RateField } from "../form/rate-field";
import { SuggestInput } from "../form/suggest-input";
import { AccountSelect, type AccountOption } from "./account-select";
import { formatAccountCode } from "./account-code";
import type { BookOption } from "./book-select";
import type { CurrencyOption } from "./currency-amount";
import { DocumentStatusBadge, type DocumentStatus } from "./document-status-badge";
import {
  documentFieldsForType,
  documentIdentityVariantForType,
  partnerLabelForType,
  type DocumentFields,
  type DocumentIdentityVariant,
  type DocumentTypeCode,
} from "./document-fields";

import { JournalLinesEditor, type JournalLinesEditorProps } from "./journal-lines-editor";
import type { JournalLine } from "./journal-lines";
import { computeJournalTotals } from "./journal-vat";
import type { DimensionOption } from "./dimension-select";
import type { PartnerOption } from "./partner-select";
import { CounterpartyField, type CounterpartySeed } from "./counterparty-field";
import { VsField } from "./vs-field";
import { BankAccountField, type BankAccountOption } from "./bank-account-field";
import { convertAmount } from "./currency-amount";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";
import { formatCodeName } from "../../../lib/code-format";
import {
  DocumentCounterpartyTab,
  DocumentPrintTab,
  type DocumentCounterpartyTabProps,
  type DocumentPrintTabProps,
  type DocumentPrintValue,
} from "./document-detail-tabs";

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
import {
  DEFAULT_DOCUMENT_FORM_TEXTS,
  vsFromDocumentNumber,
  type DocumentDateField,
  type DocumentDirection,
  type DocumentFormProps,
  type DocumentFormTab,
  type DocumentFormTexts,
  type DocumentHeaderField,
  type DocumentHeaderValue,
  type DocumentIdentity,
  type DocumentMoreAction,
  type DocumentPrimaryAction,
  type DocumentSaveAction,
  type DocumentSuggestConfig,
  type DocumentVatConfig,
} from "./document-form/document-form-types";

import { buildDocumentNotices } from "./document-form/build-document-notices";
import { useDocumentFieldRenderers } from "./document-form/use-document-field-renderers";
import { buildDocumentTabs } from "./document-form/build-document-tabs";
import { DocumentFormTabs } from "./document-form/Tabs";
import { DocumentDatesSection } from "./document-form/DatesSection";
import { DocumentBasicSection } from "./document-form/BasicSection";
import { DocumentAmountSection } from "./document-form/AmountSection";
import { DocumentPaymentSection } from "./document-form/PaymentSection";
import { DocumentDirectionBadge } from "./document-form/document-form-actions";
import { DocumentIdentityLine, ReadField } from "./document-form/document-identity-line";

export function DocumentForm({
  title,
  titleBadges,
  description: _description,
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
  vatPartnerStatus,
  counterpartyTab,
  printTab,
  bankCodes,
  documentType = "ID",
  fields,
  editableFields,
  isNew = false,
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
  const t = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...dsTexts.documentForm, ...texts };
  const f: DocumentFields = { ...documentFieldsForType(documentType), ...fields };
  const [tab, setTab] = useState("lines");
  const [editingIdentityAccount, setEditingIdentityAccount] = useState(false);
  // Dočasný popisek platí jen do chvíle, než aplikace vrátí nový popisek identity.
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
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = formRef.current;
    const bar = root?.querySelector<HTMLElement>('[data-slot="document-action-bar"]');
    if (!root || !bar) return;
    const update = () =>
      root.style.setProperty("--pane-sticky-top", `${bar.getBoundingClientRect().height}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);
  const patch = (values: Partial<DocumentHeaderValue>) => onChange({ ...value, ...values });
  const can = (key: DocumentHeaderField) =>
    !readOnly && (!editableFields || editableFields.includes(key));
  const normalizedType = documentType.toUpperCase();
  const receivedDocument =
    normalizedType === "FP" || normalizedType === "ZFP" || normalizedType === "DDPOZ";
  const issuedDocument =
    normalizedType === "FV" || normalizedType === "ZFV" || normalizedType === "DDPZ";
  const forcedSum =
    normalizedType === "ID" ||
    normalizedType === "UZ" ||
    normalizedType === "KR" ||
    normalizedType === "ZAP";
  const totalMode = forcedSum ? "sum" : value.totalMode;
  const linesSum =
    Math.round(
      lines
        .filter((line) => !line.isRounding && !line.isFxRounding)
        .reduce((sum, line) => sum + (line.amount || 0), 0) * 100,
    ) / 100;
  const documentLinesSum =
    Math.round(
      lines
        .filter((line) => !line.isRounding && !line.isFxRounding)
        .reduce((sum, line) => sum + (line.foreignAmount ?? line.amount ?? 0), 0) * 100,
    ) / 100;
  const lineRounding = lines.find((line) => line.isRounding)?.amount;
  const roundedLinesSum =
    Math.round((linesSum + (lineRounding ?? value.roundingAmount ?? 0)) * 100) / 100;
  const editorVat = linesEditorProps?.vat;
  const vatTotals = computeJournalTotals(lines, {
    vat: editorVat?.enabled ? editorVat : null,
    readOnly: readOnly || linesEditorProps?.editableFields?.length === 0,
    mainAccount: f.mainAccount && mainSide ? value.mainAccountId : null,
    mainSide,
    foreign: value.currency !== homeCurrency,
    rate: value.rate,
    rateAmount,
  });
  const sumTotal = editorVat?.enabled
    ? value.currency !== homeCurrency
      ? vatTotals.gross
      : Math.round(
          (vatTotals.grossHome +
            (lineRounding ?? value.roundingAmount ?? 0) +
            lines
              .filter((line) => line.isFxRounding)
              .reduce((sum, line) => sum + (line.amount || 0), 0)) *
            100,
        ) / 100
    : value.currency !== homeCurrency
      ? documentLinesSum
      : roundedLinesSum;
  const total = totalMode === "sum" ? sumTotal : value.amountTotal;
  const partner = partners.find((item) => item.id === value.partnerId);
  const sameAccount = (a?: string | null, b?: string | null) =>
    !!a && !!b && a.replace(/\D/g, "") === b.replace(/\D/g, "");
  const allowedMainAccounts = mainAccountOptions ?? [];
  const account = [...allowedMainAccounts, ...accounts].find(
    (item) => item.code.replace(/\D/g, "") === (value.mainAccountId ?? "").replace(/\D/g, ""),
  );
  const mode = f.mainAccount && value.mainAccountId && mainSide ? "mainAccount" : "internal";
  const partnerLabel = texts?.partner ?? partnerLabelForType(documentType, value.direction);
  const foreign = value.currency !== homeCurrency;
  const currencySymbol = currencies?.find((item) => item.code === value.currency)?.symbol;
  const currencyOptions = (currencies ?? []).map((item) => ({
    value: item.code,
    label: formatCodeName(item.code, item.label),
    selectedLabel: item.code,
  }));
  const currentBook = books.find((item) => item.id === value.bookId);
  const identityVariant = identity?.variant ?? documentIdentityVariantForType(documentType);
  const effectiveIdentity: DocumentIdentity = identity ?? {
    variant: identityVariant,
    book: currentBook ? formatCodeName(currentBook.code, currentBook.name) : "—",
    period: value.accountingDate?.slice(0, 4) || "—",
    ...(f.mainAccount && value.mainAccountId && mainSide
      ? {
          account: {
            side: mainSide === "MD" ? "MD" : "DAL",
            label: account
              ? formatCodeName(formatAccountCode(account.code), account.name)
              : formatAccountCode(value.mainAccountId),
          },
        }
      : {}),
    number: value.number,
  };
  useEffect(() => {
    if (!selectedIdentityAccount) return;
    if (
      !sameAccount(selectedIdentityAccount.code, value.mainAccountId) ||
      effectiveIdentity.account?.label !== selectedIdentityAccount.sourceLabel
    ) {
      setSelectedIdentityAccount(null);
    }
  }, [effectiveIdentity.account?.label, selectedIdentityAccount, value.mainAccountId]);
  const identityAccountLabel =
    selectedIdentityAccount && sameAccount(selectedIdentityAccount.code, value.mainAccountId)
      ? selectedIdentityAccount.label
      : effectiveIdentity.account?.label;
  const canEditIdentityAccount =
    effectiveIdentity.variant === "invoice" &&
    !!effectiveIdentity.account?.editable &&
    !mainAccountLocked &&
    can("mainAccountId") &&
    allowedMainAccounts.length > 0;
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
  const linkedPartner = !!value.partnerId;
  const counterpartyIco = value.counterpartyIco ?? partner?.ico ?? "";
  const counterpartyDic = value.counterpartyDic ?? partner?.dic ?? "";
  const icoWarning =
    !linkedPartner &&
    /^\d{8}$/.test(counterpartyIco.replace(/\s/g, "")) &&
    !isValidCzIco(counterpartyIco);
  const filedVatDateWarning = vat?.periodFiled ? (vat.filedWarning ?? t.filedWarning) : undefined;
  const vatRelevant = value.vatRelevant !== false;
  const showVatFields = vat?.visible && vatRelevant;
  const externalNumberDigits = (value.externalNumber ?? "").replace(/\D/g, "");
  const externalNumberVsWarning =
    receivedDocument && externalNumberDigits.length > 10 ? t.documentNumberTooLongForVs : undefined;
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
  const initialSuggestedVs = vsFromDocumentNumber(value.externalNumber ?? "");
  const automaticVsRef = useRef<string | null>(
    value.variableSymbol === initialSuggestedVs ? initialSuggestedVs : null,
  );
  // Při přepnutí na jiný doklad znovu odvodíme, zda je VS automatický.
  useEffect(() => {
    const suggested = vsFromDocumentNumber(value.externalNumber ?? "");
    automaticVsRef.current =
      suggested !== null && value.variableSymbol === suggested ? suggested : null;
  }, [value.id, value.number]); // eslint-disable-line react-hooks/exhaustive-deps
  const changeExternalNumber = (externalNumber: string) => {
    const previousSuggested = vsFromDocumentNumber(value.externalNumber ?? "");
    const nextSuggested = vsFromDocumentNumber(externalNumber);
    const currentVs = value.variableSymbol ?? "";
    const mayUpdateVs =
      can("variableSymbol") &&
      (!currentVs || currentVs === previousSuggested || currentVs === automaticVsRef.current);
    const nextDigits = externalNumber.replace(/\D/g, "");
    const canApplySuggestion = nextSuggested !== null || nextDigits.length === 0;
    if (receivedDocument && mayUpdateVs && canApplySuggestion) {
      automaticVsRef.current = nextSuggested;
      const variableSymbol = nextSuggested ?? null;
      if ((value.variableSymbol || null) !== variableSymbol) {
        patch({ externalNumber, variableSymbol });
        return;
      }
    }
    patch({ externalNumber });
  };
  const externalNumberField = field(
    "document-externalNumber",
    receivedDocument
      ? showVatFields
        ? t.supplierTaxDocumentNumber
        : t.supplierNumber
      : t.externalNumber,
    <>
      <Input
        id="document-externalNumber"
        value={value.externalNumber ?? ""}
        onChange={(event) => changeExternalNumber(event.target.value)}
        disabled={!can("externalNumber")}
        className="h-9 font-mono tabular-nums"
      />
      {externalNumberVsWarning ? (
        <p
          data-slot="document-external-number-vs-warning"
          className="mt-1 whitespace-nowrap text-xs text-warning-strong"
        >
          {externalNumberVsWarning}
        </p>
      ) : null}
    </>,
    6,
    false,
    receivedDocument || !f.handedOverBy ? "@min-[40rem]:col-start-15" : undefined,
  );
  const bankAccountField = field(
    "document-bankAccount",
    t.bankAccount,
    <BankAccountField
      id="document-bankAccount"
      aria-label={t.bankAccount}
      value={receivedDocument ? (value.partnerBankAccountId ?? "") : (value.bankAccount ?? "")}
      onChange={(next) =>
        receivedDocument ? patch({ partnerBankAccountId: next }) : patch({ bankAccount: next })
      }
      disabled={!can("bankAccount") || (receivedDocument && !value.partnerId)}
      options={bankAccountOptions}
      bankCodes={bankCodes}
      invalidAccountText={t.bankAccountInvalid}
      invalidBankCodeText={t.bankCodeInvalid}
      otherAccountText={t.otherBankAccount}
      selectionOnly={receivedDocument}
      onAddAccount={receivedDocument ? onAddBankAccount : undefined}
      addAccountText={t.addBankAccount}
      disabledReason={receivedDocument && !value.partnerId ? t.selectSupplierFirst : undefined}
    />,
    receivedDocument ? 20 : 6,
    false,
    undefined,
  );
  const changeRounding = (roundingAmount: number) => {
    patch({ roundingAmount });
    const roundingLine = lines.find((line) => line.isRounding);
    if (roundingLine)
      onLinesChange(
        lines.map((line) =>
          line.id === roundingLine.id ? { ...line, amount: roundingAmount } : line,
        ),
      );
    else if (roundingAmount)
      onLinesChange([
        ...lines,
        {
          id: `rounding-${Date.now()}`,
          amount: roundingAmount,
          text: roundingLabel ?? t.rounding,
          isRounding: true,
        },
      ]);
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
    total,
  });

  const currencyReasonId = useId();
  const currencyFixed =
    currencyLocked ||
    readOnly ||
    !can("currency") ||
    identityVariant === "cashBank" ||
    Boolean(currencyDisabledReason);
  const currencyReason =
    currencyDisabledReason ?? (!readOnly && !can("currency") ? t.currencyDisabled : undefined);
  const fixedCurrency = (
    <div
      id="document-currency"
      aria-readonly="true"
      aria-describedby={currencyReason ? currencyReasonId : undefined}
      className="flex h-11 items-center px-3 font-mono text-sm font-bold tabular-nums"
    >
      {value.currency}
    </div>
  );
  const currencyControl = currencyFixed ? (
    currencyReason ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <div tabIndex={0} aria-describedby={currencyReasonId}>
            {fixedCurrency}
            <span id={currencyReasonId} className="sr-only">
              {currencyReason}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>{currencyReason}</TooltipContent>
      </Tooltip>
    ) : (
      fixedCurrency
    )
  ) : currencies ? (
    <OptionSelect
      id="document-currency"
      allowEmpty={false}
      value={value.currency}
      onChange={(currency) => patch({ currency })}
      options={currencyOptions}
      triggerClassName="h-11"
    />
  ) : (
    fixedCurrency
  );

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
              <div className="flex min-w-0 items-center gap-2">
                <label className="flex items-center gap-2 whitespace-nowrap text-sm font-medium">
                  <Switch
                    checked={vatRelevant}
                    disabled={vat.relevantReadOnly}
                    onCheckedChange={(next) => patch({ vatRelevant: next })}
                    aria-label={t.vatRelevant}
                  />
                  {t.vatRelevant}
                </label>
                {vatRelevant && vatPartnerStatus ? (
                  <span className="flex min-w-0 items-center gap-2 overflow-hidden">
                    <VatStatusBadge status={vatPartnerStatus.status} />
                    {vatPartnerStatus.checkedAt ? (
                      <span
                        className="hidden truncate text-xs text-muted-foreground @min-[44rem]:inline"
                        title={t.vatVerified(vatPartnerStatus.checkedAt)}
                      >
                        {t.vatVerified(vatPartnerStatus.checkedAt)}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
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
              linkedPartner={linkedPartner}
              icoWarning={icoWarning}
              icoLinkTarget={icoLinkTarget}
              can={can}
              onCreatePartner={onCreatePartner}
              field={field}
              suggestedText={suggestedText}
              handedOverBySuggest={handedOverBySuggest}
              descriptionSuggest={descriptionSuggest}
              externalNumberField={externalNumberField}
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
            receivedDocument={receivedDocument}
            issuedDocument={issuedDocument}
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
        {changedBy || changedAt ? (
          <div className="flex flex-wrap justify-end gap-x-4 text-xs text-muted-foreground">
            {changedBy ? <span>{`${t.changedBy}: ${changedBy}`}</span> : null}
            {changedAt ? <span>{`${t.changedAt}: ${changedAt}`}</span> : null}
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

export { DocumentActionBar, DocumentDirectionBadge } from "./document-form/document-form-actions";
