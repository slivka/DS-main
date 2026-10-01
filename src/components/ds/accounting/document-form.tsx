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

const ReadField = ({
  id,
  value,
  muted,
  mono,
}: {
  id: string;
  value: ReactNode;
  muted?: boolean;
  mono?: boolean;
}) => (
  <div
    id={id}
    aria-readonly="true"
    className={cn(
      "flex min-h-9 items-center text-sm",
      muted && "italic text-muted-foreground",
      mono && "font-mono tabular-nums",
    )}
  >
    {value}
  </div>
);

function DocumentIdentityLine({
  identity,
  direction,
  fallback,
  texts,
  accountLabel,
  accountValue,
  editingAccount,
  canEditAccount,
  pencilRef,
  onStartAccountEdit,
  onAccountChange,
  onAccountClose,
  accountOptions,
}: {
  identity: DocumentIdentity;
  direction?: DocumentDirection;
  fallback: string;
  texts: DocumentFormTexts;
  accountLabel?: string;
  accountValue?: string | null;
  editingAccount: boolean;
  canEditAccount: boolean;
  pencilRef: React.RefObject<HTMLButtonElement | null>;
  onStartAccountEdit: () => void;
  onAccountChange: (code: string) => void;
  onAccountClose: () => void;
  accountOptions: AccountOption[];
}) {
  const number = identity.number || null;
  // Interní doklad účet nikdy nezobrazuje, i když jej aplikace pošle.
  const account = identity.variant === "internal" ? undefined : identity.account;
  const items: ReactNode[] = [
    <span key="book" className="whitespace-nowrap">
      {identity.book}
    </span>,
    <span key="period" className="whitespace-nowrap">
      {identity.period}
    </span>,
  ];
  const pencil =
    !editingAccount && canEditAccount && account ? (
      account.disabledReason ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              aria-label={`${texts.changeAccount}: ${account.disabledReason}`}
              data-slot="document-identity-account-locked"
              className="inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label={texts.changeAccount}
                tabIndex={-1}
                disabled
              >
                <Pencil className="size-3.5" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>{account.disabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={pencilRef}
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={texts.changeAccount}
              onClick={onStartAccountEdit}
            >
              <Pencil className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{texts.changeAccount}</TooltipContent>
        </Tooltip>
      )
    ) : null;
  if (account)
    items.push(
      <span key="account" className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
        <span className="inline-flex h-[1.5em] items-center rounded-sm border border-border px-1 font-mono text-xs font-semibold uppercase text-muted-foreground">
          {account.side}
        </span>
        {editingAccount ? (
          <span className="w-[18rem] max-w-full">
            <AccountSelect
              ariaLabel={texts.mainAccountSelect}
              accounts={accountOptions}
              value={accountValue}
              onChange={onAccountChange}
              defaultOpen
              onOpenChange={(open) => {
                if (!open) onAccountClose();
              }}
            />
          </span>
        ) : (
          <span data-slot="document-identity-account" className="truncate">
            {accountLabel ?? account.label}
          </span>
        )}
        {pencil}
      </span>,
    );
  return (
    <div data-slot="document-identity" className="mb-3 border-b border-border pb-3">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-y-1 text-[0.9375rem] font-semibold text-foreground">
          {direction ? (
            <DocumentDirectionBadge
              direction={direction}
              inLabel={texts.directionIn}
              outLabel={texts.directionOut}
            />
          ) : null}
          {items[0] != null ? (
            <span className="flex min-w-0 items-center">
              {direction ? <span aria-hidden="true" className="mx-2 h-4 w-px bg-border" /> : null}
              {items[0]}
            </span>
          ) : null}
          {items.length > 1 ? (
            <span className="flex min-w-0 flex-wrap items-center @max-[40rem]:basis-full">
              {items.slice(1).map((item, index) => (
                <span key={index} className="flex min-w-0 items-center">
                  <span
                    aria-hidden="true"
                    className={cn("mx-2 h-4 w-px bg-border", index === 0 && "@max-[40rem]:hidden")}
                  />
                  {item}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        {identity ? (
          <span
            className={cn(
              "self-center shrink-0 text-right font-mono text-xl font-bold tabular-nums",
              !number &&
                "max-w-48 font-sans text-sm font-normal italic leading-tight text-muted-foreground",
            )}
          >
            {number ?? identity.numberPending ?? fallback}
          </span>
        ) : null}
      </div>
    </div>
  );
}

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

  const field = (
    id: string,
    label: ReactNode,
    control: ReactNode,
    span = 3,
    mobileHalf = false,
    className?: string,
  ) => (
    <Field
      htmlFor={id}
      label={label}
      span={span as 3 | 4 | 5 | 6 | 14 | 20}
      className={cn("col-span-20", mobileHalf && "col-span-10", className)}
    >
      {control}
    </Field>
  );
  const date = (
    key: DocumentDateField,
    label: string,
    className?: string,
    options?: {
      link?: React.ComponentProps<typeof DateField>["link"];
      hint?: string;
      warning?: string;
    },
  ) => {
    const warning = options?.warning ?? dateWarnings?.[key];
    return field(
      `document-${key}`,
      label,
      <DateField
        id={`document-${key}`}
        value={value[key] ?? ""}
        onChange={(next) => patch({ [key]: next || null })}
        disabled={!can(key)}
        link={
          options?.link ??
          (key === "accountingDate" && accountingDateLink
            ? {
                locked: accountingDateLink.locked,
                onToggle: accountingDateLink.onToggle,
                lockedHint: accountingDateLink.hint,
              }
            : undefined)
        }
        hint={options?.hint}
        warning={warning}
        warningDisplay="indicator"
      />,
      3,
      false,
      className,
    );
  };
  const text = (
    key: "constantSymbol" | "specificSymbol" | "handedOverBy",
    label: string,
    span = 3,
    className?: string,
  ) =>
    field(
      `document-${key}`,
      label,
      <Input
        id={`document-${key}`}
        value={value[key] ?? ""}
        onChange={(event) => patch({ [key]: event.target.value })}
        disabled={!can(key)}
        className="h-9 font-mono tabular-nums"
      />,
      span,
      false,
      className,
    );
  const suggestedText = (
    key: "handedOverBy" | "description",
    label: string,
    config: DocumentSuggestConfig | undefined,
    span: number,
    className?: string,
  ) =>
    field(
      `document-${key}`,
      label,
      config ? (
        <SuggestInput
          id={`document-${key}`}
          value={value[key] ?? ""}
          onChange={(next) => patch({ [key]: next })}
          loadSuggestions={config.load}
          enabled={config.enabled}
          onEnabledChange={config.onEnabledChange}
          disabled={!can(key)}
          maxLength={key === "description" ? 500 : 200}
        />
      ) : key === "description" ? (
        <Textarea
          id={`document-${key}`}
          rows={2}
          value={value[key] ?? ""}
          onChange={(event) => patch({ [key]: event.target.value })}
          disabled={!can(key)}
        />
      ) : (
        <Input
          id={`document-${key}`}
          value={value[key] ?? ""}
          onChange={(event) => patch({ [key]: event.target.value })}
          disabled={!can(key)}
        />
      ),
      span,
      false,
      className,
    );
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
  const dateWarningEntries: Array<[DocumentDateField, string, string | undefined]> = [
    ["issueDate", t.issueDate, dateWarnings?.issueDate],
    ["accountingDate", t.accountingDate, dateWarnings?.accountingDate],
    ["dueDate", t.dueDate, f.dueDate ? dateWarnings?.dueDate : undefined],
    ["taxDate", t.taxDate, showVatFields && f.taxDate ? dateWarnings?.taxDate : undefined],
    ["vatDate", t.vatDate, showVatFields ? filedVatDateWarning : undefined],
    ["vatDate", t.vatDate, showVatFields ? dateWarnings?.vatDate : undefined],
  ];
  const dateNoticeBars = dateWarningEntries
    .filter((entry): entry is [DocumentDateField, string, string] => Boolean(entry[2]))
    .map(([key, label, warning], index) => (
      <NoticeBar key={`${key}-${index}`} tone="warning" title={label}>
        {warning}
      </NoticeBar>
    ));
  const selectedPartnerBankAccount = bankAccountOptions.find(
    (option) => (option.id ?? `${option.number}/${option.bankCode}`) === value.partnerBankAccountId,
  );
  const invalidBankAccountNotice = selectedPartnerBankAccount?.invalid ? (
    <NoticeBar tone="warning">{t.invalidBankAccountWarning}</NoticeBar>
  ) : null;
  const combinedNotices =
    notices || dateNoticeBars.length || invalidBankAccountNotice ? (
      <>
        {notices}
        {dateNoticeBars}
        {invalidBankAccountNotice}
      </>
    ) : undefined;
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

  const allTabs: DocumentFormTab[] = [
    {
      id: "lines",
      label: t.linesTab,
      badge: vatTotals.visibleLineCount || undefined,
      content: (
        <JournalLinesEditor
          lines={lines}
          onChange={onLinesChange}
          accounts={accounts}
          dimensions={dimensions}
          partners={partners}
          mode={mode}
          mainSide={mainSide}
          mainAccount={value.mainAccountId}
          totalAmount={totalMode === "entered" ? value.amountTotal : undefined}
          documentCurrency={value.currency}
          documentCurrencySymbol={currencies?.find((item) => item.code === value.currency)?.symbol}
          homeCurrency={homeCurrency}
          homeCurrencySymbol={homeCurrencySymbol}
          rate={value.rate}
          rateAmount={rateAmount}
          totalMode={totalMode === "entered" ? "entered" : "computed"}
          {...linesEditorProps}
          editableFields={readOnly ? [] : linesEditorProps?.editableFields}
          rounding={
            f.rounding
              ? {
                  value: lineRounding ?? value.roundingAmount ?? 0,
                  onChange: can("roundingAmount") ? changeRounding : undefined,
                  readOnly: !can("roundingAmount"),
                  label: roundingLabel ?? t.rounding,
                  limit: roundingLimit,
                }
              : undefined
          }
        />
      ),
    },
    ...tabs.filter((item) => item.id !== "lines"),
    ...(issuedDocument && counterpartyTab
      ? [
          {
            id: "counterparty",
            label: t.counterpartyTab,
            content: (
              <DocumentCounterpartyTab
                {...counterpartyTab}
                partnerId={value.partnerId}
                readOnly={readOnly}
              />
            ),
          },
        ]
      : []),
    ...(issuedDocument && printTab
      ? [
          {
            id: "print",
            label: t.printTab,
            content: <DocumentPrintTab {...printTab} readOnly={readOnly} />,
          },
        ]
      : []),
  ];

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

  const renderAmountSection = () => (
    <Fragment>
      <SectionHeading>{t.amountOnlySection}</SectionHeading>
      <div
        data-slot="document-amount-currency"
        data-section="document-amount-section"
        className="flex max-w-full flex-wrap items-start justify-end min-w-0 gap-3"
      >
        {foreign ? (
          <div
            data-slot="document-foreign-amounts"
            className="order-2 flex min-w-0 max-w-full flex-wrap items-start justify-end gap-3 @min-[48rem]:order-1"
          >
            <div className="w-[9rem] shrink-0">
              {field(
                "document-rate",
                t.rate,
                <RateField
                  id="document-rate"
                  value={value.rate ?? null}
                  currency={value.currency}
                  currencySymbol={currencySymbol}
                  homeCurrency={homeCurrency}
                  homeCurrencySymbol={homeCurrencySymbol}
                  rateAmount={rateAmount}
                  suggestedRate={value.suggestedRate}
                  suggestedInfo={value.suggestedRateInfo ?? value.rateInfo ?? undefined}
                  manual={!!value.rateManual}
                  note={value.rateNote ?? ""}
                  showNote={false}
                  noteLabel={t.rateNote}
                  manualSourceLabel={t.manualRate}
                  requiredMessage={t.rateNoteRequired}
                  disabled={!can("rate")}
                  readOnly={!can("rate") && !can("rateNote")}
                  onChange={(rate) => patch({ rate, rateManual: true })}
                  onNoteChange={(rateNote) => patch({ rateNote })}
                  onUseSuggested={() =>
                    patch({ rate: value.suggestedRate, rateManual: false, rateNote: null })
                  }
                  className="w-full"
                />,
                3,
                false,
                "[&_p]:truncate @min-[30rem]:[&_p]:overflow-visible",
              )}
            </div>
            <div className="w-[9rem] shrink-0 text-right @min-[30rem]:w-[11.5rem]">
              {field(
                "document-total-home",
                <span className="whitespace-nowrap">
                  {t.totalHome.replace("{symbol}", homeCurrencySymbol ?? homeCurrency)}
                </span>,
                <div
                  id="document-total-home"
                  aria-readonly="true"
                  className="flex h-11 items-center justify-end rounded-md border bg-muted/40 px-3 font-semibold tabular-nums"
                >
                  {formatAmount(convertAmount(total, value.rate ?? 0, rateAmount), 2)}
                </div>,
                3,
                false,
                "text-right [&_label]:text-right",
              )}
            </div>
          </div>
        ) : null}
        <div
          data-slot="document-total-currency-pair"
          className="order-1 flex min-w-0 max-w-full shrink-0 items-start gap-3"
        >
          <div
            data-slot="document-amount-total"
            className="min-w-[9rem] flex-[0_1_18rem] @min-[30rem]:min-w-[11.5rem]"
          >
            {field(
              "document-amountTotal",
              <span className="flex min-w-0 items-center justify-between gap-2 whitespace-nowrap">
                <span>{t.amountTotal}</span>
                {totalMode === "sum" ? (
                  <span
                    className="shrink-0 whitespace-nowrap text-xs font-normal text-muted-foreground"
                    title={t.sumFromLines}
                  >
                    {t.sumFromLines}
                  </span>
                ) : null}
              </span>,
              <>
                <div className="relative">
                  <DecimalInput
                    id="document-amountTotal"
                    value={total}
                    onChange={(next) => patch({ amountTotal: next === "" ? 0 : Number(next) })}
                    readOnly={totalMode === "sum" || !can("amountTotal")}
                    className={cn(
                      "h-11 pr-12 text-right text-xl font-bold tabular-nums",
                      totalMode === "sum" && "bg-muted",
                    )}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={totalMode === "sum" ? "default" : "outline"}
                        size="icon"
                        aria-label={t.sumFromLines}
                        aria-pressed={totalMode === "sum"}
                        disabled={forcedSum || !can("totalMode")}
                        onClick={() =>
                          patch({ totalMode: totalMode === "sum" ? "entered" : "sum" })
                        }
                        className="absolute right-1 top-1 size-9"
                      >
                        <span className="relative">
                          <Sigma className="size-4" />
                          {totalMode !== "sum" ? (
                            <span
                              aria-hidden
                              className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current"
                            />
                          ) : null}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {totalMode === "sum" ? t.sumFromLines : t.amountTotal}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>,
              6,
            )}
          </div>
          <div className="w-[6.5rem] shrink-0">
            {field("document-currency", t.currency, currencyControl, 3)}
          </div>
        </div>
      </div>
      {foreign ? (
        <div data-slot="document-rate-details" className="mt-3 grid grid-cols-20 gap-3">
          {foreign && vatRateField
            ? field(
                "document-vat-rate",
                t.vatRate,
                vatRateField.sameAsDocument ? (
                  <ReadField
                    id="document-vat-rate"
                    value={<span className="text-muted-foreground">{t.vatRateSameAsDocument}</span>}
                  />
                ) : (
                  <>
                    <RateField
                      id="document-vat-rate"
                      value={vatRateField.value ?? null}
                      currency={value.currency}
                      currencySymbol={currencySymbol}
                      homeCurrency={homeCurrency}
                      homeCurrencySymbol={homeCurrencySymbol}
                      rateAmount={vatRateField.rateAmount ?? rateAmount}
                      suggestedRate={vatRateField.suggestedRate}
                      suggestedInfo={vatRateField.suggestedInfo}
                      manual={!!vatRateField.manual}
                      note={vatRateField.note ?? ""}
                      showNote={false}
                      noteLabel={t.vatRateNote}
                      manualSourceLabel={t.manualRate}
                      requiredMessage={t.rateNoteRequired}
                      disabled={readOnly || vatRateField.readOnly}
                      readOnly={readOnly || vatRateField.readOnly}
                      onChange={(rate) => vatRateField.onChange({ rate, manual: true })}
                      onNoteChange={(note) => vatRateField.onChange({ note })}
                      onUseSuggested={() =>
                        vatRateField.onChange({
                          rate: vatRateField.suggestedRate ?? null,
                          manual: false,
                          note: null,
                        })
                      }
                      className="w-full @min-[40rem]:w-36"
                    />
                    {!vatRateField.manual &&
                    vatRateField.suggestedRate == null &&
                    !(readOnly || vatRateField.readOnly) ? (
                      <p
                        role="status"
                        data-slot="document-vat-rate-missing"
                        className="text-xs font-medium text-destructive"
                      >
                        {t.vatRateMissing}
                      </p>
                    ) : null}
                  </>
                ),
                3,
              )
            : null}
          {foreign && vatRateField && !vatRateField.sameAsDocument && vatRateField.manual
            ? field(
                "document-vat-rate-note",
                t.vatRateNote,
                <>
                  <Input
                    id="document-vat-rate-note"
                    value={vatRateField.note ?? ""}
                    maxLength={200}
                    required
                    aria-invalid={!vatRateField.note?.trim()}
                    disabled={readOnly || vatRateField.readOnly}
                    onChange={(event) => vatRateField.onChange({ note: event.target.value })}
                  />
                  {!vatRateField.note?.trim() ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {t.rateNoteRequired}
                    </p>
                  ) : null}
                </>,
                14,
              )
            : null}
          {value.rateManual
            ? field(
                "document-rate-note",
                t.rateNote,
                <>
                  <Input
                    id="document-rate-note"
                    value={value.rateNote ?? ""}
                    maxLength={200}
                    required
                    aria-invalid={!value.rateNote?.trim()}
                    disabled={!can("rateNote")}
                    onChange={(event) => patch({ rateNote: event.target.value })}
                  />
                  {!value.rateNote?.trim() ? (
                    <p role="alert" className="text-xs font-medium text-destructive">
                      {t.rateNoteRequired}
                    </p>
                  ) : null}
                </>,
                14,
              )
            : null}
        </div>
      ) : null}
    </Fragment>
  );

  const renderPaymentSection = () =>
    f.symbols || f.bankAccount || f.paymentOrders ? (
      <Fragment>
        <SectionHeading>{t.paymentSection}</SectionHeading>
        <div data-slot="document-payment-section" className="grid grid-cols-20 items-start gap-3">
          {f.symbols
            ? field(
                "document-variableSymbol",
                t.variableSymbol,
                <VsField
                  id="document-variableSymbol"
                  value={value.variableSymbol ?? ""}
                  onChange={(variableSymbol) => patch({ variableSymbol })}
                  disabled={!can("variableSymbol")}
                />,
              )
            : null}
          {f.symbols
            ? field(
                "document-constantSymbol",
                t.constantSymbol,
                constantSymbolOptions ? (
                  <OptionSelect
                    id="document-constantSymbol"
                    value={value.constantSymbol}
                    onChange={(constantSymbol) => patch({ constantSymbol })}
                    disabled={!can("constantSymbol")}
                    options={constantSymbolOptions}
                  />
                ) : (
                  <Input
                    id="document-constantSymbol"
                    value={value.constantSymbol ?? ""}
                    onChange={(event) => patch({ constantSymbol: event.target.value })}
                    disabled={!can("constantSymbol")}
                    className="font-mono tabular-nums"
                  />
                ),
              )
            : null}
          {f.symbols ? text("specificSymbol", t.specificSymbol) : null}
          {paymentMethodOptions
            ? field(
                "document-paymentMethodId",
                t.paymentMethod,
                <OptionSelect
                  id="document-paymentMethodId"
                  value={value.paymentMethodId}
                  onChange={(paymentMethodId) => patch({ paymentMethodId })}
                  options={paymentMethodOptions}
                  disabled={!can("paymentMethodId")}
                />,
              )
            : null}
          {f.bankAccount && receivedDocument ? bankAccountField : null}
          {f.bankAccount && issuedDocument && companyBankAccountOptions
            ? field(
                "document-companyBankAccountId",
                t.companyBankAccount,
                <OptionSelect
                  id="document-companyBankAccountId"
                  value={value.companyBankAccountId}
                  onChange={(companyBankAccountId) => patch({ companyBankAccountId })}
                  options={companyBankAccountOptions.map((option) => ({
                    value: option.id,
                    label: [option.label, option.account, option.currency].join(" · "),
                  }))}
                  disabled={!can("companyBankAccountId")}
                />,
                20,
              )
            : f.bankAccount && !receivedDocument
              ? bankAccountField
              : null}
          {f.paymentOrders ? (
            <CheckboxField
              id="document-exclude-payment-orders"
              className={cn(
                "col-span-20",
                receivedDocument &&
                  "@min-[40rem]:col-span-6 @min-[40rem]:mt-4 @min-[40rem]:flex @min-[40rem]:h-9 @min-[40rem]:items-center [&_label]:whitespace-nowrap",
              )}
              label={t.excludeFromPaymentOrders}
              checked={!!value.excludeFromPaymentOrders}
              disabled={!can("excludeFromPaymentOrders")}
              onCheckedChange={(checked) => patch({ excludeFromPaymentOrders: checked })}
            />
          ) : null}
        </div>
      </Fragment>
    ) : null;

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
            <>
              <SectionHeading>{t.headerSection}</SectionHeading>
              <div className="grid grid-cols-20 gap-3">
                {field(
                  "document-partner",
                  partnerLabel,
                  <CounterpartyField
                    id="document-partner"
                    partners={partners}
                    value={{
                      name: value.counterpartyName ?? partner?.name ?? "",
                      partnerId: value.partnerId ?? null,
                      ico: counterpartyIco,
                      dic: counterpartyDic,
                    }}
                    onChange={(next) =>
                      patch({
                        counterpartyName: next.name,
                        partnerId: next.partnerId,
                        counterpartyIco: next.ico ?? null,
                        counterpartyDic: next.dic ?? null,
                      })
                    }
                    onCreatePartner={
                      onCreatePartner
                        ? (seed) =>
                            onCreatePartner({
                              ...seed,
                              ico: counterpartyIco || seed.ico,
                              dic: counterpartyDic || seed.dic,
                            })
                        : undefined
                    }
                    disabled={!can("partnerId")}
                  />,
                  14,
                  false,
                  "@min-[40rem]:pr-3",
                )}
                {field(
                  "document-partner-ico",
                  t.ico,
                  linkedPartner ? (
                    <ReadField
                      id="document-partner-ico"
                      mono
                      value={
                        counterpartyIco ? (
                          <IcoLink
                            ico={counterpartyIco}
                            country={partner?.country}
                            kind={partner?.kind}
                            target={icoLinkTarget}
                          />
                        ) : (
                          "—"
                        )
                      }
                    />
                  ) : (
                    <>
                      <Input
                        id="document-partner-ico"
                        value={counterpartyIco}
                        onChange={(event) =>
                          patch({ counterpartyIco: event.target.value.replace(/\s/g, "") })
                        }
                        disabled={!can("counterpartyIco")}
                        className="h-9 font-mono tabular-nums"
                      />
                      {icoWarning ? (
                        <p role="alert" className="text-xs font-medium text-warning-strong">
                          {t.invalidIco}
                        </p>
                      ) : null}
                    </>
                  ),
                  3,
                  true,
                )}
                {field(
                  "document-partner-dic",
                  t.dic,
                  linkedPartner ? (
                    <ReadField id="document-partner-dic" mono value={counterpartyDic || "—"} />
                  ) : (
                    <Input
                      id="document-partner-dic"
                      value={counterpartyDic}
                      onChange={(event) =>
                        patch({
                          counterpartyDic: event.target.value.replace(/\s/g, "").toUpperCase(),
                        })
                      }
                      disabled={!can("counterpartyDic")}
                      className="h-9 font-mono uppercase tabular-nums"
                    />
                  ),
                  3,
                  true,
                )}
                {f.handedOverBy
                  ? suggestedText(
                      "handedOverBy",
                      value.direction === "in" ? t.handedOverByIn : t.handedOverByOut,
                      handedOverBySuggest,
                      14,
                      "@min-[40rem]:pr-3",
                    )
                  : null}
                {f.externalNumber ? externalNumberField : null}
                {suggestedText("description", t.description, descriptionSuggest, 20)}
              </div>
            </>
          ) : null}

          <SectionHeading>{t.datesSection}</SectionHeading>
          <div data-slot="document-dates" className="flex flex-wrap items-start gap-3">
            <div className="flex flex-wrap items-start gap-3">
              {date("issueDate", t.issueDate, "flex-none w-max")}
              {date("accountingDate", t.accountingDate, "flex-none w-max")}
              {f.dueDate ? date("dueDate", t.dueDate, "flex-none w-max") : null}
            </div>
            <div
              data-slot="document-vat-dates"
              className="ml-auto flex flex-wrap items-start justify-end gap-3"
            >
              {showVatFields && f.taxDate ? date("taxDate", t.taxDate, "flex-none w-max") : null}
              {showVatFields
                ? date(
                    "vatDate",
                    t.vatDate,
                    "relative flex-none w-max [&_.field-overflow-hint]:absolute [&_.field-overflow-hint]:right-0 [&_.field-overflow-hint]:w-max [&_.field-overflow-hint]:max-w-none [&_.field-overflow-hint]:whitespace-nowrap [&_.field-overflow-hint]:text-right",
                    {
                      link: vat?.dateLink
                        ? {
                            ...vat.dateLink,
                            toggleDisabled: vat.dateLockReadOnly,
                            lockedHint: vat.dateLockReadOnly
                              ? t.vatDateLockedHint
                              : vat.dateLink.lockedHint,
                          }
                        : undefined,
                      hint: vat?.periodLabel,
                      warning:
                        [filedVatDateWarning, dateWarnings?.vatDate].filter(Boolean).join(" · ") ||
                        undefined,
                    },
                  )
                : null}
            </div>
          </div>
          {!f.partner ? (
            <div className="mt-3 grid grid-cols-20 gap-3">
              {suggestedText("description", t.description, descriptionSuggest, 20)}
            </div>
          ) : null}

          {renderPaymentSection()}
          {renderAmountSection()}
        </section>

        {allTabs.length === 1 ? (
          <>
            <SectionHeading>{t.linesTab}</SectionHeading>
            <div className="mt-2">{allTabs[0]?.content}</div>
          </>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <TabsList className="h-10 gap-1 rounded-none border-b bg-transparent p-0">
                {allTabs.map((item) => (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="h-10 gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none"
                  >
                    {item.label}
                    {item.badge != null ? (
                      <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {allTabs.map((item) => (
              <TabsContent key={item.id} value={item.id} className="mt-2">
                {item.content}
              </TabsContent>
            ))}
          </Tabs>
        )}
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

export function DocumentDirectionBadge({
  direction,
  inLabel = "Příjem",
  outLabel = "Výdej",
}: {
  direction: DocumentDirection;
  inLabel?: string;
  outLabel?: string;
}) {
  const Icon = direction === "in" ? ArrowDownLeft : ArrowUpRight;
  return (
    <span
      data-slot="document-direction-badge"
      className={cn(
        "inline-flex h-[1.625rem] items-center gap-1 rounded-md px-2 text-sm font-semibold",
        direction === "in"
          ? "bg-success-soft text-success-strong"
          : "bg-destructive-soft text-destructive-strong",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {direction === "in" ? inLabel : outLabel}
    </span>
  );
}

export function DocumentActionBar({
  vat,
  vatRelevant,
  onVatRelevantChange,
  saveAction,
  primaryAction,
  moreActions = [],
  texts = DEFAULT_DOCUMENT_FORM_TEXTS,
}: {
  vat?: DocumentVatConfig;
  vatRelevant: boolean;
  onVatRelevantChange: (value: boolean) => void;
  saveAction?: DocumentSaveAction;
  primaryAction?: DocumentPrimaryAction;
  moreActions?: DocumentMoreAction[];
  texts?: DocumentFormTexts;
}) {
  // Disabled reason rendering remains delegated unchanged: action.disabled && action.disabledReason.
  return (
    <RecordActionBar
      leftContent={
        vat?.visible ? (
          <label className="flex items-center gap-2 text-sm font-medium">
            <Switch
              checked={vatRelevant}
              disabled={vat.relevantReadOnly}
              onCheckedChange={onVatRelevantChange}
              aria-label={texts.vatRelevant}
            />
            {texts.vatRelevant}
          </label>
        ) : null
      }
      saveAction={saveAction}
      primaryAction={primaryAction}
      moreActions={moreActions}
      saveLabel="Uložit"
      moreActionsLabel="Další akce"
      dataSlot="document-action-bar"
    />
  );
}
