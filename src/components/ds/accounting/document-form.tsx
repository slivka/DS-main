import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Loader2, MoreHorizontal, Save, Sigma, type LucideIcon } from "lucide-react";

import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Switch } from "../../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { PageHeader } from "../layout/page-header";
import { SectionHeading } from "../layout/section-heading";
import { ReadOnlyBanner } from "../feedback/read-only-banner";
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
import { documentFieldsForType, mainAccountLabelForType, partnerLabelForType, type DocumentFields, type DocumentTypeCode } from "./document-fields";
import { JournalLinesEditor, type JournalLinesEditorProps } from "./journal-lines-editor";
import type { JournalLine } from "./journal-lines";
import type { DimensionOption } from "./dimension-select";
import type { PartnerOption } from "./partner-select";
import { CounterpartyField, type CounterpartySeed } from "./counterparty-field";
import { VsField } from "./vs-field";
import { convertAmount } from "./currency-amount";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

export type DocumentDirection = "in" | "out";

export type DocumentHeaderValue = {
  bookId?: string | null;
  number?: string | null;
  direction?: DocumentDirection | null;
  accountingDate?: string | null;
  issueDate?: string | null;
  taxDate?: string | null;
  vatDate?: string | null;
  vatRelevant?: boolean;
  dueDate?: string | null;
  externalNumber?: string | null;
  partnerId?: string | null;
  counterpartyName?: string | null;
  counterpartyIco?: string | null;
  counterpartyDic?: string | null;
  handedOverBy?: string | null;
  variableSymbol?: string | null;
  constantSymbol?: string | null;
  specificSymbol?: string | null;
  bankAccount?: string | null;
  description?: string | null;
  currency: string;
  rate?: number | null;
  rateInfo?: string | null;
  rateManual?: boolean;
  rateNote?: string | null;
  suggestedRate?: number | null;
  suggestedRateInfo?: string | null;
  amountTotal: number;
  totalMode: "entered" | "sum";
  roundingAmount?: number | null;
  mainAccountId?: string | null;
  excludeFromPaymentOrders?: boolean;
};

export type DocumentHeaderField = keyof DocumentHeaderValue;
export type DocumentFormTab = { id: string; label: string; content: ReactNode; badge?: ReactNode };
export type DocumentSaveAction = { onSave: () => void; disabled?: boolean; busy?: boolean; dirty?: boolean };
export type DocumentPrimaryAction = { label: string; onClick: () => void; disabled?: boolean; busy?: boolean; icon?: LucideIcon };
export type DocumentMoreAction = { id: string; label: string; onClick: () => void; icon?: LucideIcon; destructive?: boolean; disabled?: boolean; disabledReason?: string; separatorBefore?: boolean };
export type DocumentIdentityItem = ReactNode | { side?: "MD" | "DAL"; text: ReactNode };
export type DocumentIdentity = { items: DocumentIdentityItem[]; number?: string | null; numberPending?: string };
export type DocumentSuggestConfig = { enabled: boolean; onEnabledChange: (enabled: boolean) => void; load: (query: string) => Promise<string[]> };
export type DocumentAccountingDateLink = { locked: boolean; onToggle: (locked: boolean) => void; hint?: string };
export type DocumentVatConfig = {
  visible: boolean;
  relevantReadOnly?: boolean;
  periodLabel?: string;
  periodFiled?: boolean;
  dateLink?: { locked: boolean; onToggle: (locked: boolean) => void; lockedHint?: string; unlockedHint?: string };
  dateLockReadOnly?: boolean;
  filedWarning?: string;
};

export type DocumentFormTexts = {
  headerSection: string; datesSection: string; paymentSection: string; propertiesSection: string; rateSection: string; currencySection: string; periodHint: string; amountSection: string; amountOnlySection: string; accountingSection: string;
  book: string; period: string; number: string; numberPending: string; direction: string; directionIn: string; directionOut: string;
  status: string; approved: string; yes: string; no: string;
  accountingDate: string; issueDate: string; taxDate: string; vatRelevant: string; vatDate: string; dueDate: string; externalNumber: string; supplierNumber: string;
  partner: string; ico: string; dic: string; handedOverByIn: string; handedOverByOut: string; invalidIco: string; variableSymbol: string; constantSymbol: string; specificSymbol: string; bankAccount: string;
  description: string; currency: string; rate: string; amountTotal: string; totalHome: string; amountSum: string; sumFromLines: string; rounding: string; vatDateLockedHint: string;
  mainAccount: string; mainSide: string; sideDebit: string; sideCredit: string;
  excludeFromPaymentOrders: string; linesTab: string; changedBy: string; changedAt: string;
  rateNote: string; manualRate: string; rateNoteRequired: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Základní údaje", datesSection: "Datumy", paymentSection: "Platební údaje", propertiesSection: "Vlastnosti dokladu",
  rateSection: "Kurz dokladu", currencySection: "Měna", periodHint: "Období se řídí datem účetního případu", amountSection: "Částka dokladu", amountOnlySection: "Částka", accountingSection: "Účtování a částka",
  book: "Kniha", period: "Období", number: "Číslo dokladu", numberPending: "Koncept – číslo při zařazení",
  direction: "Směr", directionIn: "Příjem", directionOut: "Výdej", status: "Stav", approved: "Schváleno", yes: "Ano", no: "Ne",
  accountingDate: "Datum účetního případu", issueDate: "Datum vystavení", taxDate: "DUZP", vatRelevant: "Vstupuje do DPH", vatDate: "Datum DPH", dueDate: "Splatnost", externalNumber: "Externí číslo", supplierNumber: "Číslo dokladu dodavatele",
  partner: "Partner", ico: "IČ", dic: "DIČ", handedOverByIn: "Přijato od", handedOverByOut: "Vyplaceno komu", invalidIco: "IČ neprošlo kontrolou CZ – zkontrolujte ho.", variableSymbol: "Variabilní symbol", constantSymbol: "Konstantní symbol", specificSymbol: "Specifický symbol", bankAccount: "Bankovní účet",
  description: "Popis", currency: "Měna", rate: "Kurz", amountTotal: "Celkem za doklad", totalHome: "Celkem v {symbol}", amountSum: "Celkem za doklad", sumFromLines: "Sčítá se z rozpisu", rounding: "Zaokrouhlení", vatDateLockedHint: "Daň na výstupu patří do období DUZP",
  mainAccount: "Hlavní účet", mainSide: "Strana", sideDebit: "MD", sideCredit: "DAL", excludeFromPaymentOrders: "Nezahrnovat do platebních příkazů",
  linesTab: "Řádky", changedBy: "Změnil", changedAt: "Změněno", rateNote: "Důvod ručního kurzu", manualRate: "Ruční kurz", rateNoteRequired: "Uveďte důvod ručního kurzu.",
};

export interface DocumentFormProps {
  title: string;
  description?: ReactNode;
  identity?: DocumentIdentity;
  directionBadge?: DocumentDirection;
  value: DocumentHeaderValue;
  onChange: (value: DocumentHeaderValue) => void;
  lines: JournalLine[];
  onLinesChange: (lines: JournalLine[]) => void;
  books: BookOption[];
  accounts: AccountOption[];
  partners?: PartnerOption[];
  dimensions?: DimensionOption[];
  currencies?: CurrencyOption[];
  documentType?: DocumentTypeCode | string;
  fields?: Partial<DocumentFields>;
  editableFields?: DocumentHeaderField[];
  isNew?: boolean;
  mainSide?: "MD" | "D";
  mainAccountLocked?: boolean;
  rateAmount?: number;
  homeCurrency: string;
  homeCurrencySymbol?: string;
  currencyLocked?: boolean;
  onCreatePartner?: (seed: CounterpartySeed) => void;
  icoLinkTarget?: IcoLinkTarget;
  handedOverBySuggest?: DocumentSuggestConfig;
  descriptionSuggest?: DocumentSuggestConfig;
  accountingDateLink?: DocumentAccountingDateLink;
  vat?: DocumentVatConfig;
  linesEditorProps?: Partial<Omit<JournalLinesEditorProps, "lines" | "onChange" | "accounts" | "partners" | "dimensions" | "mode" | "mainSide" | "mainAccount">>;
  roundingLimit?: number;
  roundingLabel?: string;
  tabs?: DocumentFormTab[];
  status: DocumentStatus;
  approved?: boolean;
  changedBy?: string;
  changedAt?: string;
  saveAction?: DocumentSaveAction;
  primaryAction?: DocumentPrimaryAction;
  moreActions?: DocumentMoreAction[];
  readOnly?: boolean;
  readOnlyReason?: ReactNode;
  texts?: Partial<DocumentFormTexts>;
  className?: string;
}

const ReadField = ({ id, value, muted, mono }: { id: string; value: ReactNode; muted?: boolean; mono?: boolean }) => (
  <div id={id} aria-readonly="true" className={cn("flex min-h-9 items-center text-sm", muted && "italic text-muted-foreground", mono && "font-mono tabular-nums")}>{value}</div>
);

export const SideBadge = ({ side, texts = DEFAULT_DOCUMENT_FORM_TEXTS }: { side: "MD" | "D"; texts?: DocumentFormTexts }) => (
  <span title={texts.mainSide} className="rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
    {side === "MD" ? texts.sideDebit : texts.sideCredit}
  </span>
);

function DocumentIdentityLine({ identity, direction, fallback, texts }: { identity?: DocumentIdentity; direction?: DocumentDirection; fallback: string; texts: DocumentFormTexts }) {
  const number = identity?.number || null;
  const [firstItem, ...remainingItems] = identity?.items ?? [];
  const renderItem = (item: DocumentIdentityItem) => {
    if (typeof item === "object" && item !== null && !Array.isArray(item) && "text" in item) return <span className="inline-flex min-w-0 items-center gap-1.5">{item.side ? <span className="inline-flex h-[1.5em] items-center rounded-sm border border-border px-1 font-mono text-xs font-semibold uppercase text-muted-foreground">{item.side}</span> : null}<span className="min-w-0 break-words">{item.text}</span></span>;
    return <span className="min-w-0 break-words">{item}</span>;
  };
  return (
    <div data-slot="document-identity" className="mb-3 border-b border-border pb-3">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-y-1 text-[0.9375rem] font-semibold text-foreground">
          {direction ? <DocumentDirectionBadge direction={direction} inLabel={texts.directionIn} outLabel={texts.directionOut} /> : null}
          {firstItem != null ? <span className="flex min-w-0 items-center">
            {direction ? <span aria-hidden="true" className="mx-2 h-4 w-px bg-border" /> : null}
            {renderItem(firstItem)}
          </span> : null}
          {remainingItems.length ? <span className="flex min-w-0 flex-wrap items-center @max-[40rem]:basis-full">
            {remainingItems.map((item, index) => <span key={index} className="flex min-w-0 items-center">
              <span aria-hidden="true" className={cn("mx-2 h-4 w-px bg-border", index === 0 && "@max-[40rem]:hidden")} />
               {renderItem(item)}
            </span>)}
          </span> : null}
        </div>
        {identity ? <span className={cn("shrink-0 text-right font-mono text-xl font-bold tabular-nums", !number && "max-w-48 font-sans text-sm font-normal italic leading-tight text-muted-foreground")}>
          {number ?? identity.numberPending ?? fallback}
        </span> : null}
      </div>
    </div>
  );
}

export function DocumentForm({
  title, description: _description, identity, directionBadge, value, onChange, lines, onLinesChange, books, accounts,
  partners = [], dimensions = [], currencies, documentType = "ID", fields, editableFields, isNew = false,
  mainSide, mainAccountLocked = false, rateAmount = 1, homeCurrency, homeCurrencySymbol, currencyLocked = false,
  onCreatePartner, icoLinkTarget = "auto", handedOverBySuggest, descriptionSuggest, accountingDateLink, vat, linesEditorProps, roundingLimit = 1, roundingLabel,
  tabs = [], status, approved, changedBy, changedAt,
  saveAction, primaryAction, moreActions = [], readOnly = false, readOnlyReason, texts, className,
}: DocumentFormProps) {
  const t = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...texts };
  const f: DocumentFields = { ...documentFieldsForType(documentType), ...fields };
  const [tab, setTab] = useState("lines");
  const patch = (values: Partial<DocumentHeaderValue>) => onChange({ ...value, ...values });
  const can = (key: DocumentHeaderField) => !readOnly && (!editableFields || editableFields.includes(key));
  const normalizedType = documentType.toUpperCase();
  const forcedSum = normalizedType === "ID" || normalizedType === "UZ";
  const totalMode = forcedSum ? "sum" : value.totalMode;
  const linesSum = Math.round(lines.filter((line) => !line.isRounding && !line.isFxRounding).reduce((sum, line) => sum + (line.amount || 0), 0) * 100) / 100;
  const documentLinesSum = Math.round(lines.filter((line) => !line.isRounding && !line.isFxRounding).reduce((sum, line) => sum + (line.foreignAmount ?? line.amount ?? 0), 0) * 100) / 100;
  const lineRounding = lines.find((line) => line.isRounding)?.amount;
  const roundedLinesSum = Math.round((linesSum + (lineRounding ?? value.roundingAmount ?? 0)) * 100) / 100;
  const total = totalMode === "sum" ? (value.currency !== homeCurrency ? documentLinesSum : roundedLinesSum) : value.amountTotal;
  const partner = partners.find((item) => item.id === value.partnerId);
  const account = accounts.find((item) => item.code.replace(/\D/g, "") === (value.mainAccountId ?? "").replace(/\D/g, ""));
  const mode = f.mainAccount && value.mainAccountId && mainSide ? "mainAccount" : "internal";
  const side = mainSide ? <SideBadge side={mainSide} texts={t} /> : null;
  const mainAccountLabel = texts?.mainAccount ?? mainAccountLabelForType(documentType);
  const partnerLabel = texts?.partner ?? partnerLabelForType(documentType, value.direction);
  const accountLocked = mainAccountLocked || !can("mainAccountId");
  const foreign = value.currency !== homeCurrency;
  const hideIdentityAccount = !!identity && mainAccountLocked;
  const hideIdentityCurrency = !!identity && currencyLocked;

  const field = (id: string, label: ReactNode, control: ReactNode, span = 3, mobileHalf = false, className?: string) => (
    <div className={cn("col-span-20 flex min-w-0 flex-col gap-1 @min-[40rem]:col-span-3", mobileHalf && "col-span-10", span === 4 && "@min-[40rem]:col-span-4", span === 5 && "@min-[40rem]:col-span-5", span === 6 && "@min-[40rem]:col-span-6", span === 14 && "@min-[40rem]:col-span-14", span === 20 && "@min-[40rem]:col-span-20", className)}>
      <Label htmlFor={id}>{label}</Label>{control}
    </div>
  );
  const date = (key: "accountingDate" | "issueDate" | "taxDate" | "vatDate" | "dueDate", label: string, className?: string, options?: { link?: React.ComponentProps<typeof DateField>["link"]; hint?: string; warning?: string }) => field(`document-${key}`, label, <DateField id={`document-${key}`} value={value[key] ?? ""} onChange={(next) => patch({ [key]: next || null })} disabled={!can(key)} link={options?.link ?? (key === "accountingDate" && accountingDateLink ? { locked: accountingDateLink.locked, onToggle: accountingDateLink.onToggle, lockedHint: accountingDateLink.hint } : undefined)} hint={options?.hint} warning={options?.warning} />, 3, false, className);
  const text = (key: "externalNumber" | "constantSymbol" | "specificSymbol" | "bankAccount" | "handedOverBy", label: string, span = 3, className?: string) => field(`document-${key}`, label, <Input id={`document-${key}`} value={value[key] ?? ""} onChange={(event) => patch({ [key]: event.target.value })} disabled={!can(key)} className="h-9 font-mono tabular-nums" />, span, false, className);
  const suggestedText = (key: "handedOverBy" | "description", label: string, config: DocumentSuggestConfig | undefined, span: number, className?: string) => field(`document-${key}`, label, config ? <SuggestInput id={`document-${key}`} value={value[key] ?? ""} onChange={(next) => patch({ [key]: next })} loadSuggestions={config.load} enabled={config.enabled} onEnabledChange={config.onEnabledChange} disabled={!can(key)} maxLength={key === "description" ? 500 : 200} /> : key === "description" ? <Textarea id={`document-${key}`} rows={2} value={value[key] ?? ""} onChange={(event) => patch({ [key]: event.target.value })} disabled={!can(key)} /> : <Input id={`document-${key}`} value={value[key] ?? ""} onChange={(event) => patch({ [key]: event.target.value })} disabled={!can(key)} />, span, false, className);
  const linkedPartner = !!value.partnerId;
  const counterpartyIco = value.counterpartyIco ?? partner?.ico ?? "";
  const counterpartyDic = value.counterpartyDic ?? partner?.dic ?? "";
  const icoWarning = !linkedPartner && /^\d{8}$/.test(counterpartyIco.replace(/\s/g, "")) && !isValidCzIco(counterpartyIco);
  const showMainAccount = f.mainAccount && !hideIdentityAccount;
  const vatDateWarning = vat?.periodFiled ? vat.filedWarning ?? "Období je podané – doklad půjde do dodatečného přiznání" : undefined;
  const vatRelevant = value.vatRelevant !== false;
  const showVatFields = vat?.visible && vatRelevant;
  const changeRounding = (roundingAmount: number) => {
    patch({ roundingAmount });
    const roundingLine = lines.find((line) => line.isRounding);
    if (roundingLine) onLinesChange(lines.map((line) => line.id === roundingLine.id ? { ...line, amount: roundingAmount } : line));
    else if (roundingAmount) onLinesChange([...lines, { id: `rounding-${Date.now()}`, amount: roundingAmount, text: roundingLabel ?? t.rounding, isRounding: true }]);
  };

  const allTabs: DocumentFormTab[] = [{
    id: "lines", label: t.linesTab, badge: lines.length || undefined,
    content: <JournalLinesEditor lines={lines} onChange={onLinesChange} accounts={accounts} dimensions={dimensions} partners={partners}
      mode={mode} mainSide={mainSide} mainAccount={value.mainAccountId} totalAmount={totalMode === "entered" ? value.amountTotal : undefined}
      documentCurrency={value.currency} documentCurrencySymbol={currencies?.find((item) => item.code === value.currency)?.symbol} homeCurrency={homeCurrency} homeCurrencySymbol={homeCurrencySymbol} rate={value.rate} rateAmount={rateAmount}
      totalMode={totalMode === "entered" ? "entered" : "computed"} {...linesEditorProps} editableFields={readOnly ? [] : linesEditorProps?.editableFields}
      rounding={f.rounding ? { value: lineRounding ?? value.roundingAmount ?? 0, onChange: can("roundingAmount") ? changeRounding : undefined, readOnly: !can("roundingAmount"), label: roundingLabel ?? t.rounding, limit: roundingLimit } : undefined} />,
  }, ...tabs.filter((item) => item.id !== "lines")];

  return (
    <TooltipProvider><div className={cn("@container space-y-4", className)} onKeyDown={(event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && saveAction && !saveAction.disabled && !saveAction.busy) { event.preventDefault(); saveAction.onSave(); }
    }}>
      <PageHeader title={title} titleBadge={<DocumentStatusBadge status={status} approved={approved} size="md" />} />
      <DocumentActionBar vat={vat} vatRelevant={vatRelevant} onVatRelevantChange={(vatRelevant) => patch({ vatRelevant })} saveAction={saveAction} primaryAction={primaryAction} moreActions={moreActions} texts={t} />
      {readOnly && readOnlyReason ? <ReadOnlyBanner reason={readOnlyReason} /> : null}

      <section className="rounded-lg border bg-card p-4">
        {identity || directionBadge ? <DocumentIdentityLine identity={identity} direction={directionBadge} fallback={t.numberPending} texts={t} /> : null}
        {f.partner ? (
          <>
             <SectionHeading>{t.headerSection}</SectionHeading>
            <div className="grid grid-cols-20 gap-3">
              {field("document-partner", partnerLabel, <CounterpartyField id="document-partner" partners={partners} value={{ name: value.counterpartyName ?? partner?.name ?? "", partnerId: value.partnerId ?? null, ico: counterpartyIco, dic: counterpartyDic }} onChange={(next) => patch({ counterpartyName: next.name, partnerId: next.partnerId, counterpartyIco: next.ico ?? null, counterpartyDic: next.dic ?? null })} onCreatePartner={onCreatePartner ? (seed) => onCreatePartner({ ...seed, ico: counterpartyIco || seed.ico, dic: counterpartyDic || seed.dic }) : undefined} disabled={!can("partnerId")} />, 14, false, "@min-[40rem]:pr-3")}
              {field("document-partner-ico", t.ico, linkedPartner ? <ReadField id="document-partner-ico" mono value={counterpartyIco ? <IcoLink ico={counterpartyIco} country={partner?.country} kind={partner?.kind} target={icoLinkTarget} /> : "—"} /> : <><Input id="document-partner-ico" value={counterpartyIco} onChange={(event) => patch({ counterpartyIco: event.target.value.replace(/\s/g, "") })} disabled={!can("counterpartyIco")} className="h-9 font-mono tabular-nums" />{icoWarning ? <p role="alert" className="text-xs font-medium text-warning-strong">{t.invalidIco}</p> : null}</>, 3, true)}
              {field("document-partner-dic", t.dic, linkedPartner ? <ReadField id="document-partner-dic" mono value={counterpartyDic || "—"} /> : <Input id="document-partner-dic" value={counterpartyDic} onChange={(event) => patch({ counterpartyDic: event.target.value.replace(/\s/g, "").toUpperCase() })} disabled={!can("counterpartyDic")} className="h-9 font-mono uppercase tabular-nums" />, 3, true)}
               {f.handedOverBy ? suggestedText("handedOverBy", value.direction === "in" ? t.handedOverByIn : t.handedOverByOut, handedOverBySuggest, 14, "@min-[40rem]:pr-3") : null}
              {f.externalNumber ? text("externalNumber", normalizedType === "FP" || normalizedType === "ZFP" ? t.supplierNumber : t.externalNumber, 3, f.handedOverBy ? undefined : "@min-[40rem]:col-start-15") : null}
               {suggestedText("description", t.description, descriptionSuggest, 20)}
            </div>
          </>
        ) : null}

        <SectionHeading>{t.datesSection}</SectionHeading>
        <div data-slot="document-dates" className="grid grid-cols-20 gap-3">
          {date("issueDate", t.issueDate)}
          {date("accountingDate", t.accountingDate)}
          {f.dueDate ? date("dueDate", t.dueDate) : null}
          {showVatFields && f.taxDate ? date("taxDate", t.taxDate, "@min-[40rem]:col-start-15") : null}
          {showVatFields ? date("vatDate", t.vatDate, "@min-[40rem]:col-start-15", { link: vat?.dateLink ? { ...vat.dateLink, toggleDisabled: vat.dateLockReadOnly, lockedHint: vat.dateLockReadOnly ? t.vatDateLockedHint : vat.dateLink.lockedHint } : undefined, hint: vatDateWarning ? undefined : vat?.periodLabel, warning: vatDateWarning ? `${vatDateWarning}${vat?.periodLabel ? ` · ${vat.periodLabel}` : ""}` : undefined }) : null}
           {!f.partner ? suggestedText("description", t.description, descriptionSuggest, 20) : null}
        </div>

        <SectionHeading>{showMainAccount ? t.accountingSection : t.amountOnlySection}</SectionHeading>
        <div className="grid grid-cols-20 gap-3">
          {showMainAccount ? field("document-main-account", mainAccountLabel, accountLocked ? <ReadField id="document-main-account" value={<div className="flex min-w-0 items-center gap-2"><span className="min-w-0 truncate"><span className="font-mono tabular-nums">{account ? formatAccountCode(account.code) : value.mainAccountId ? formatAccountCode(value.mainAccountId) : "—"}</span>{account ? <span>{` - ${account.name}`}</span> : null}</span>{side}</div>} /> : <AccountSelect accounts={accounts} value={value.mainAccountId ?? ""} suffix={side} onChange={(mainAccountId) => patch({ mainAccountId })} />, 20) : null}
           {!hideIdentityCurrency ? field("document-currency", t.currency, currencies && can("currency") ? <OptionSelect id="document-currency" allowEmpty={false} value={value.currency} onChange={(currency) => patch({ currency })} options={currencies.map((item) => ({ value: item.code, label: item.label ? `${item.code} – ${item.label}` : item.code }))} /> : <ReadField id="document-currency" mono value={value.currency} />, 3) : null}
            {foreign ? field("document-rate", t.rate, <RateField id="document-rate" value={value.rate ?? null} currency={value.currency} currencySymbol={currencies?.find((item) => item.code === value.currency)?.symbol} homeCurrency={homeCurrency} homeCurrencySymbol={homeCurrencySymbol} rateAmount={rateAmount} suggestedRate={value.suggestedRate} suggestedInfo={value.suggestedRateInfo ?? value.rateInfo ?? undefined} manual={!!value.rateManual} note={value.rateNote ?? ""} showNote={false} noteLabel={t.rateNote} manualSourceLabel={t.manualRate} requiredMessage={t.rateNoteRequired} disabled={!can("rate")} readOnly={!can("rate") && !can("rateNote")} onChange={(rate) => patch({ rate, rateManual: true })} onNoteChange={(rateNote) => patch({ rateNote })} onUseSuggested={() => patch({ rate: value.suggestedRate, rateManual: false, rateNote: null })} className="w-full @min-[40rem]:w-36" />, 3) : null}
          {foreign && value.rateManual ? field("document-rate-note", t.rateNote, <><Input id="document-rate-note" value={value.rateNote ?? ""} maxLength={200} required aria-invalid={!value.rateNote?.trim()} disabled={!can("rateNote")} onChange={(event) => patch({ rateNote: event.target.value })} />{!value.rateNote?.trim() ? <p role="alert" className="text-xs font-medium text-destructive">{t.rateNoteRequired}</p> : null}</>, 14, false, "@min-[40rem]:col-start-1") : null}
            {foreign ? field("document-total-home", t.totalHome.replace("{symbol}", homeCurrencySymbol ?? homeCurrency), <div className="text-right"><ReadField id="document-total-home" value={<span className="ml-auto font-semibold tabular-nums">{formatAmount(convertAmount(total, value.rate ?? 0, rateAmount), 2)}</span>} /></div>, 3, false, "text-right [&_label]:text-right") : null}
            {field("document-amountTotal", <span className="flex w-full items-center justify-between gap-2"><span>{`${t.amountTotal} (${currencies?.find((item) => item.code === value.currency)?.symbol ?? value.currency})`}</span>{totalMode === "sum" ? <span className="text-xs font-normal text-muted-foreground">{t.sumFromLines}</span> : null}</span>, <div className="relative"><DecimalInput id="document-amountTotal" value={total} onChange={(next) => patch({ amountTotal: next === "" ? 0 : Number(next) })} readOnly={totalMode === "sum" || !can("amountTotal")} className={cn("h-11 pr-12 text-right text-xl font-bold tabular-nums", totalMode === "sum" && "bg-muted")} /><Tooltip><TooltipTrigger asChild><Button type="button" variant={totalMode === "sum" ? "default" : "outline"} size="icon" aria-label={t.sumFromLines} aria-pressed={totalMode === "sum"} disabled={forcedSum || !can("totalMode")} onClick={() => patch({ totalMode: totalMode === "sum" ? "entered" : "sum" })} className="absolute right-1 top-1 size-9"><span className="relative"><Sigma className="size-4" />{totalMode !== "sum" ? <span aria-hidden className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" /> : null}</span></Button></TooltipTrigger><TooltipContent>{forcedSum ? "U tohoto druhu dokladu se vždy sčítá" : totalMode === "sum" ? "Částka se sčítá z řádků rozpisu" : "Částka je zadaná ručně"}</TooltipContent></Tooltip></div>, 6, false, "@min-[40rem]:col-start-15")}
        </div>

        {f.symbols || f.bankAccount || f.paymentOrders ? <>
          <SectionHeading>{t.paymentSection}</SectionHeading>
          <div className="grid grid-cols-20 gap-3">
            {f.symbols ? field("document-variableSymbol", t.variableSymbol, <VsField id="document-variableSymbol" value={value.variableSymbol ?? ""} onChange={(variableSymbol) => patch({ variableSymbol })} disabled={!can("variableSymbol")} />) : null}
            {f.symbols ? text("constantSymbol", t.constantSymbol) : null}
            {f.symbols ? text("specificSymbol", t.specificSymbol) : null}
            {f.bankAccount ? text("bankAccount", t.bankAccount, 6) : null}
            {f.paymentOrders ? <label className="col-span-20 flex items-center gap-2 text-sm"><Checkbox checked={!!value.excludeFromPaymentOrders} disabled={!can("excludeFromPaymentOrders")} onCheckedChange={(checked) => patch({ excludeFromPaymentOrders: checked === true })} />{t.excludeFromPaymentOrders}</label> : null}
          </div>
        </> : null}
      </section>

      {allTabs.length === 1 ? <><SectionHeading>{t.linesTab}</SectionHeading><div className="mt-2">{allTabs[0]?.content}</div></> : <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1"><TabsList className="h-10 gap-1 rounded-none border-b bg-transparent p-0">
          {allTabs.map((item) => <TabsTrigger key={item.id} value={item.id} className="h-10 gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-base font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none">{item.label}{item.badge != null ? <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{item.badge}</span> : null}</TabsTrigger>)}
        </TabsList></div>
        {allTabs.map((item) => <TabsContent key={item.id} value={item.id} className="mt-2">{item.content}</TabsContent>)}
      </Tabs>}
      {changedBy || changedAt ? <div className="flex flex-wrap justify-end gap-x-4 text-xs text-muted-foreground">{changedBy ? <span>{`${t.changedBy}: ${changedBy}`}</span> : null}{changedAt ? <span>{`${t.changedAt}: ${changedAt}`}</span> : null}</div> : null}
    </div></TooltipProvider>
  );
}

function CompactActionButton({ label, icon: Icon, busy, compact, children, ...props }: { label: string; icon: LucideIcon; busy?: boolean; compact: boolean } & React.ComponentPropsWithoutRef<typeof Button>) {
  return <Tooltip><TooltipTrigger asChild><Button type="button" {...props} aria-label={label} className={cn(compact && "size-9 px-0", props.className)}>{busy ? <Loader2 className="animate-spin" /> : <Icon />}<span className={cn(compact && "sr-only")}>{busy ? `${label}…` : label}</span>{children}</Button></TooltipTrigger>{compact ? <TooltipContent>{label}</TooltipContent> : null}</Tooltip>;
}

export function DocumentDirectionBadge({ direction, inLabel = "Příjem", outLabel = "Výdej" }: { direction: DocumentDirection; inLabel?: string; outLabel?: string }) {
  const Icon = direction === "in" ? ArrowDownLeft : ArrowUpRight;
  return <span data-slot="document-direction-badge" className={cn("inline-flex h-[1.625rem] items-center gap-1 rounded-md px-2 text-sm font-semibold", direction === "in" ? "bg-success-soft text-success-strong" : "bg-destructive-soft text-destructive-strong")}><Icon className="size-3.5" aria-hidden="true" />{direction === "in" ? inLabel : outLabel}</span>;
}

export function DocumentActionBar({ vat, vatRelevant, onVatRelevantChange, saveAction, primaryAction, moreActions = [], texts = DEFAULT_DOCUMENT_FORM_TEXTS }: {
  vat?: DocumentVatConfig; vatRelevant: boolean; onVatRelevantChange: (value: boolean) => void; saveAction?: DocumentSaveAction; primaryAction?: DocumentPrimaryAction; moreActions?: DocumentMoreAction[]; texts?: DocumentFormTexts;
}) {
  const PrimaryIcon = primaryAction?.icon ?? CheckCircle2;
  const barRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => { const node = barRef.current; if (!node) return; const update = () => setCompact(node.getBoundingClientRect().width < 640); update(); const observer = new ResizeObserver(update); observer.observe(node); return () => observer.disconnect(); }, []);
  return <TooltipProvider><div ref={barRef} data-slot="document-action-bar" data-compact={compact || undefined} className="sticky top-0 z-30 -mx-1 flex min-h-12 items-center justify-between gap-3 bg-card/95 px-1 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/90">
    <div>{vat?.visible ? <label className="flex items-center gap-2 text-sm font-medium"><Switch checked={vatRelevant} disabled={vat.relevantReadOnly} onCheckedChange={onVatRelevantChange} aria-label={texts.vatRelevant} />{texts.vatRelevant}</label> : null}</div>
    <div className="flex shrink-0 items-center gap-2">
      {saveAction ? <CompactActionButton label="Uložit" icon={Save} compact={compact} busy={saveAction.busy} disabled={saveAction.disabled || saveAction.busy} onClick={saveAction.onSave}>{saveAction.dirty ? <span aria-label="Neuložené změny" className="size-1.5 rounded-full bg-primary-foreground" /> : null}</CompactActionButton> : null}
      {primaryAction ? <CompactActionButton label={primaryAction.label} icon={PrimaryIcon} compact={compact} variant="outline" busy={primaryAction.busy} disabled={primaryAction.disabled || primaryAction.busy} onClick={primaryAction.onClick} /> : null}
      {moreActions.length ? <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label="Další akce"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-56">{moreActions.map((action) => { const Icon = action.icon; return <span key={action.id}>{action.separatorBefore ? <DropdownMenuSeparator /> : null}<DropdownMenuItem disabled={action.disabled} onSelect={action.onClick} className={cn("flex-col items-start gap-0.5", action.destructive && "text-destructive focus:text-destructive")}><span className="flex items-center gap-2">{Icon ? <Icon /> : null}{action.label}</span>{action.disabled && action.disabledReason ? <span className="text-xs font-normal text-muted-foreground">{action.disabledReason}</span> : null}</DropdownMenuItem></span>; })}</DropdownMenuContent></DropdownMenu> : null}
    </div>
  </div></TooltipProvider>;
}
