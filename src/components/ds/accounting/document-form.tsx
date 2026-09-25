import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Loader2, MoreHorizontal, Save, type LucideIcon } from "lucide-react";

import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
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
import { IcoLink, type IcoLinkTarget } from "../form/ico-link";
import { OptionSelect } from "../form/option-select";
import { RateField } from "../form/rate-field";
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
  dueDate?: string | null;
  externalNumber?: string | null;
  partnerId?: string | null;
  counterpartyName?: string | null;
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
export type DocumentIdentity = { items: ReactNode[]; number?: string | null; numberPending?: string };

export type DocumentFormTexts = {
  headerSection: string; datesSection: string; paymentSection: string; propertiesSection: string; rateSection: string; currencySection: string; periodHint: string; amountSection: string; accountingSection: string;
  book: string; period: string; number: string; numberPending: string; direction: string; directionIn: string; directionOut: string;
  status: string; approved: string; yes: string; no: string;
  accountingDate: string; issueDate: string; taxDate: string; dueDate: string; externalNumber: string; supplierNumber: string;
  partner: string; ico: string; dic: string; variableSymbol: string; constantSymbol: string; specificSymbol: string; bankAccount: string;
  description: string; currency: string; rate: string; amountTotal: string; amountSum: string; sumFromLines: string; rounding: string;
  mainAccount: string; mainSide: string; sideDebit: string; sideCredit: string;
  excludeFromPaymentOrders: string; linesTab: string; changedBy: string; changedAt: string;
  rateNote: string; manualRate: string; rateNoteRequired: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Základní údaje", datesSection: "Data", paymentSection: "Platební údaje", propertiesSection: "Vlastnosti dokladu",
  rateSection: "Kurz dokladu", currencySection: "Měna", periodHint: "Období se řídí datem účetního případu", amountSection: "Částka dokladu", accountingSection: "Účtování a částka",
  book: "Kniha", period: "Období", number: "Číslo dokladu", numberPending: "Koncept – číslo při zařazení",
  direction: "Směr", directionIn: "Příjem", directionOut: "Výdej", status: "Stav", approved: "Schváleno", yes: "Ano", no: "Ne",
  accountingDate: "Datum účetního případu", issueDate: "Datum vystavení", taxDate: "DUZP", dueDate: "Splatnost", externalNumber: "Externí číslo", supplierNumber: "Číslo dokladu dodavatele",
  partner: "Partner", ico: "IČ", dic: "DIČ", variableSymbol: "Variabilní symbol", constantSymbol: "Konstantní symbol", specificSymbol: "Specifický symbol", bankAccount: "Bankovní účet",
  description: "Popis", currency: "Měna", rate: "Kurz", amountTotal: "Celkem za doklad", amountSum: "Celkem za doklad", sumFromLines: "Sčítat z rozpisu", rounding: "Haléřové vyrovnání",
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
  periodLabel?: ReactNode;
  rateAmount?: number;
  homeCurrency?: string;
  currencyLocked?: boolean;
  onCreatePartner?: (seed: CounterpartySeed) => void;
  icoLinkTarget?: IcoLinkTarget;
  linesEditorProps?: Partial<Omit<JournalLinesEditorProps, "lines" | "onChange" | "accounts" | "partners" | "dimensions" | "mode" | "mainSide" | "mainAccount">>;
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

function DocumentIdentityLine({ identity, fallback }: { identity: DocumentIdentity; fallback: string }) {
  const number = identity.number || null;
  return (
    <div data-slot="document-identity" className="flex min-w-0 flex-1 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center text-sm font-medium text-foreground">
        {identity.items.map((item, index) => (
          <span key={index} className={cn("flex min-w-0 items-center gap-2", index > 0 && "@max-[40rem]:hidden")}>
            {index > 0 ? <span aria-hidden="true" className="mx-2 text-border">|</span> : null}
            <span className="truncate">{item}</span>
          </span>
        ))}
      </div>
      <span className={cn("shrink-0 font-mono text-xl font-bold tabular-nums", !number && "font-sans text-sm font-normal italic text-muted-foreground")}>
        {number ?? identity.numberPending ?? fallback}
      </span>
    </div>
  );
}

export function DocumentForm({
  title, description: _description, identity, directionBadge, value, onChange, lines, onLinesChange, books, accounts,
  partners = [], dimensions = [], currencies, documentType = "ID", fields, editableFields, isNew = false,
  mainSide, mainAccountLocked = false, periodLabel, rateAmount = 1, homeCurrency = "CZK", currencyLocked = false,
  onCreatePartner, icoLinkTarget = "auto", linesEditorProps, tabs = [], status, approved, changedBy, changedAt,
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
  const linesSum = Math.round(lines.reduce((sum, line) => sum + (line.amount || 0), 0) * 100) / 100;
  const total = totalMode === "sum" ? linesSum : value.amountTotal;
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

  const field = (id: string, label: string, control: ReactNode, span = 3, mobileHalf = false) => (
    <div className={cn("col-span-12 flex min-w-0 flex-col gap-1 @min-[40rem]:col-span-3", mobileHalf && "col-span-6", span === 2 && "@min-[40rem]:col-span-2", span === 4 && "@min-[40rem]:col-span-4", span === 6 && "@min-[40rem]:col-span-6", span === 12 && "@min-[40rem]:col-span-12")}>
      <Label htmlFor={id}>{label}</Label>{control}
    </div>
  );
  const date = (key: "accountingDate" | "issueDate" | "taxDate" | "dueDate", label: string) => field(`document-${key}`, label, <DateField id={`document-${key}`} value={value[key] ?? ""} onChange={(next) => patch({ [key]: next || null })} disabled={!can(key)} />, 3, true);
  const text = (key: "externalNumber" | "constantSymbol" | "specificSymbol" | "bankAccount", label: string, span = 3) => field(`document-${key}`, label, <Input id={`document-${key}`} value={value[key] ?? ""} onChange={(event) => patch({ [key]: event.target.value })} disabled={!can(key)} className="h-9 font-mono tabular-nums" />, span);

  const allTabs: DocumentFormTab[] = [{
    id: "lines", label: t.linesTab, badge: lines.length || undefined,
    content: <JournalLinesEditor lines={lines} onChange={onLinesChange} accounts={accounts} dimensions={dimensions} partners={partners}
      mode={mode} mainSide={mainSide} mainAccount={value.mainAccountId} totalAmount={totalMode === "entered" ? value.amountTotal : undefined}
      totalMode={totalMode === "entered" ? "entered" : "computed"} {...linesEditorProps} editableFields={readOnly ? [] : linesEditorProps?.editableFields} />,
  }, ...tabs.filter((item) => item.id !== "lines")];

  return (
    <div className={cn("@container space-y-4", className)} onKeyDown={(event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && saveAction && !saveAction.disabled && !saveAction.busy) { event.preventDefault(); saveAction.onSave(); }
    }}>
      <PageHeader title={title} titleSlot={identity ? <DocumentIdentityLine identity={identity} fallback={t.numberPending} /> : undefined} />
      <DocumentActionBar status={status} approved={approved} direction={directionBadge} saveAction={saveAction} primaryAction={primaryAction} moreActions={moreActions} texts={t} />
      {readOnly && readOnlyReason ? <ReadOnlyBanner reason={readOnlyReason} /> : null}

      <section className="rounded-lg border bg-card p-4">
        {f.partner ? (
          <>
            <SectionHeading>{partnerLabel}</SectionHeading>
            <div className="grid grid-cols-12 gap-3">
              {field("document-partner", partnerLabel, <CounterpartyField id="document-partner" partners={partners} value={{ name: value.counterpartyName ?? partner?.name ?? "", partnerId: value.partnerId ?? null }} onChange={(next) => patch({ counterpartyName: next.name, partnerId: next.partnerId })} onCreatePartner={onCreatePartner} disabled={!can("partnerId")} />, 6)}
              {field("document-partner-ico", t.ico, <ReadField id="document-partner-ico" mono value={partner?.ico ? <IcoLink ico={partner.ico} country={partner.country} kind={partner.kind} target={icoLinkTarget} /> : "—"} />, 2)}
              {field("document-partner-dic", t.dic, <ReadField id="document-partner-dic" mono value={partner?.dic || "—"} />, 2)}
              {f.externalNumber && (normalizedType === "FP" || normalizedType === "ZFP") ? text("externalNumber", t.supplierNumber, 2) : null}
              {field("document-description", t.description, <Textarea id="document-description" rows={2} value={value.description ?? ""} onChange={(event) => patch({ description: event.target.value })} disabled={!can("description")} />, 12)}
            </div>
          </>
        ) : null}

        <SectionHeading>{t.datesSection}</SectionHeading>
        <div className="grid grid-cols-12 gap-3">
          {date("accountingDate", t.accountingDate)}
          {date("issueDate", t.issueDate)}
          {f.taxDate ? date("taxDate", t.taxDate) : null}
          {f.dueDate ? date("dueDate", t.dueDate) : null}
          {f.externalNumber && normalizedType === "PO" ? text("externalNumber", t.externalNumber, 3) : null}
          {!f.partner ? field("document-description", t.description, <Textarea id="document-description" rows={2} value={value.description ?? ""} onChange={(event) => patch({ description: event.target.value })} disabled={!can("description")} />, 12) : null}
        </div>

        <SectionHeading>{t.accountingSection}</SectionHeading>
        <div className="grid grid-cols-12 gap-3">
          {f.mainAccount && !hideIdentityAccount ? field("document-main-account", mainAccountLabel, accountLocked ? <ReadField id="document-main-account" value={<div className="flex min-w-0 items-center gap-2"><span className="min-w-0 truncate"><span className="font-mono tabular-nums">{account ? formatAccountCode(account.code) : value.mainAccountId ? formatAccountCode(value.mainAccountId) : "—"}</span>{account ? <span>{` - ${account.name}`}</span> : null}</span>{side}</div>} /> : <AccountSelect accounts={accounts} value={value.mainAccountId ?? ""} suffix={side} onChange={(mainAccountId) => patch({ mainAccountId })} />, 6) : null}
          {!hideIdentityCurrency ? field("document-currency", t.currency, currencies && can("currency") ? <OptionSelect id="document-currency" allowEmpty={false} value={value.currency} onChange={(currency) => patch({ currency })} options={currencies.map((item) => ({ value: item.code, label: item.label ? `${item.code} – ${item.label}` : item.code }))} /> : <ReadField id="document-currency" mono value={value.currency} />, 2) : null}
          {foreign ? field("document-rate", t.rate, <RateField id="document-rate" value={value.rate ?? null} currency={value.currency} homeCurrency={homeCurrency} rateAmount={rateAmount} suggestedRate={value.suggestedRate} suggestedInfo={value.suggestedRateInfo ?? value.rateInfo ?? undefined} manual={!!value.rateManual} note={value.rateNote ?? ""} noteLabel={t.rateNote} manualSourceLabel={t.manualRate} requiredMessage={t.rateNoteRequired} disabled={!can("rate")} readOnly={!can("rate") && !can("rateNote")} onChange={(rate) => patch({ rate, rateManual: true })} onNoteChange={(rateNote) => patch({ rateNote })} onUseSuggested={() => patch({ rate: value.suggestedRate, rateManual: false, rateNote: null })} />, 4) : null}
          <div className="col-span-12 flex flex-wrap items-end gap-4">
            <label className="flex min-h-9 items-center gap-2 text-sm"><Checkbox checked={totalMode === "sum"} disabled={forcedSum || !can("totalMode")} onCheckedChange={(checked) => patch({ totalMode: checked === true ? "sum" : "entered" })} />{t.sumFromLines}</label>
            <div className="min-w-64 flex-1">{field("document-amountTotal", t.amountTotal, totalMode === "entered" && can("amountTotal") ? <DecimalInput id="document-amountTotal" className="h-9 tabular-nums" value={value.amountTotal} onChange={(next) => patch({ amountTotal: next === "" ? 0 : Number(next) })} /> : <ReadField id="document-amountTotal" mono value={<span className="ml-auto">{formatAmount(total, 2)}</span>} />, 12)}</div>
            {foreign && value.rate != null ? <span className="min-h-9 py-2 text-sm tabular-nums text-muted-foreground">{`= ${formatAmount(convertAmount(total, value.rate, rateAmount), 2)} ${homeCurrency}`}</span> : null}
            {f.rounding ? <div className="min-w-48 flex-1">{field("document-roundingAmount", t.rounding, can("roundingAmount") ? <DecimalInput id="document-roundingAmount" className="h-9 tabular-nums" value={value.roundingAmount ?? 0} onChange={(next) => patch({ roundingAmount: next === "" ? 0 : Number(next) })} /> : <ReadField id="document-roundingAmount" mono value={<span className="ml-auto">{formatAmount(value.roundingAmount ?? 0, 2)}</span>} />, 12)}</div> : null}
          </div>
        </div>

        {f.symbols || f.bankAccount || f.paymentOrders ? <>
          <SectionHeading>{t.paymentSection}</SectionHeading>
          <div className="grid grid-cols-12 gap-3">
            {f.symbols ? field("document-variableSymbol", t.variableSymbol, <VsField id="document-variableSymbol" value={value.variableSymbol ?? ""} onChange={(variableSymbol) => patch({ variableSymbol })} disabled={!can("variableSymbol")} />) : null}
            {f.symbols ? text("constantSymbol", t.constantSymbol) : null}
            {f.symbols ? text("specificSymbol", t.specificSymbol) : null}
            {f.bankAccount ? text("bankAccount", t.bankAccount) : null}
            {f.paymentOrders ? <label className="col-span-12 flex items-center gap-2 text-sm"><Checkbox checked={!!value.excludeFromPaymentOrders} disabled={!can("excludeFromPaymentOrders")} onCheckedChange={(checked) => patch({ excludeFromPaymentOrders: checked === true })} />{t.excludeFromPaymentOrders}</label> : null}
          </div>
        </> : null}
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1"><TabsList className="h-10 gap-1 rounded-none border-b bg-transparent p-0">
          {allTabs.map((item) => <TabsTrigger key={item.id} value={item.id} className="h-10 gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-base font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none">{item.label}{item.badge != null ? <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{item.badge}</span> : null}</TabsTrigger>)}
        </TabsList>{changedBy ? <span className="text-xs text-muted-foreground">{`${t.changedBy}: ${changedBy}`}</span> : null}{changedAt ? <span className="text-xs text-muted-foreground">{`${t.changedAt}: ${changedAt}`}</span> : null}</div>
        {allTabs.map((item) => <TabsContent key={item.id} value={item.id} className="mt-2">{item.content}</TabsContent>)}
      </Tabs>
    </div>
  );
}

function CompactActionButton({ label, icon: Icon, busy, compact, children, ...props }: { label: string; icon: LucideIcon; busy?: boolean; compact: boolean } & React.ComponentPropsWithoutRef<typeof Button>) {
  return <Tooltip><TooltipTrigger asChild><Button type="button" {...props} aria-label={label} className={cn(compact && "size-9 px-0", props.className)}>{busy ? <Loader2 className="animate-spin" /> : <Icon />}<span className={cn(compact && "sr-only")}>{busy ? `${label}…` : label}</span>{children}</Button></TooltipTrigger>{compact ? <TooltipContent>{label}</TooltipContent> : null}</Tooltip>;
}

export function DocumentDirectionBadge({ direction, inLabel = "Příjem", outLabel = "Výdej" }: { direction: DocumentDirection; inLabel?: string; outLabel?: string }) {
  const Icon = direction === "in" ? ArrowDownLeft : ArrowUpRight;
  return <span data-slot="document-direction-badge" className={cn("inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold", direction === "in" ? "bg-success-soft text-success-strong" : "bg-destructive-soft text-destructive-strong")}><Icon className="size-4" aria-hidden="true" />{direction === "in" ? inLabel : outLabel}</span>;
}

export function DocumentActionBar({ status, approved, direction, saveAction, primaryAction, moreActions = [], texts = DEFAULT_DOCUMENT_FORM_TEXTS }: {
  status: DocumentStatus; approved?: boolean; direction?: DocumentDirection; saveAction?: DocumentSaveAction; primaryAction?: DocumentPrimaryAction; moreActions?: DocumentMoreAction[]; texts?: DocumentFormTexts;
}) {
  const PrimaryIcon = primaryAction?.icon ?? CheckCircle2;
  const barRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => { const node = barRef.current; if (!node) return; const update = () => setCompact(node.getBoundingClientRect().width < 640); update(); const observer = new ResizeObserver(update); observer.observe(node); return () => observer.disconnect(); }, []);
  return <TooltipProvider><div ref={barRef} data-slot="document-action-bar" data-compact={compact || undefined} className="sticky top-0 z-30 -mx-1 flex min-h-12 items-center justify-between gap-3 border-b bg-card/95 px-1 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/90">
    <div>{direction ? <DocumentDirectionBadge direction={direction} inLabel={texts.directionIn} outLabel={texts.directionOut} /> : null}</div>
    <div className="flex shrink-0 items-center gap-2"><DocumentStatusBadge status={status} approved={approved} />
      {saveAction ? <CompactActionButton label="Uložit" icon={Save} compact={compact} busy={saveAction.busy} disabled={saveAction.disabled || saveAction.busy} onClick={saveAction.onSave}>{saveAction.dirty ? <span aria-label="Neuložené změny" className="size-1.5 rounded-full bg-primary-foreground" /> : null}</CompactActionButton> : null}
      {primaryAction ? <CompactActionButton label={primaryAction.label} icon={PrimaryIcon} compact={compact} variant="outline" busy={primaryAction.busy} disabled={primaryAction.disabled || primaryAction.busy} onClick={primaryAction.onClick} /> : null}
      {moreActions.length ? <DropdownMenu><DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" aria-label="Další akce"><MoreHorizontal /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="min-w-56">{moreActions.map((action) => { const Icon = action.icon; return <span key={action.id}>{action.separatorBefore ? <DropdownMenuSeparator /> : null}<DropdownMenuItem disabled={action.disabled} onSelect={action.onClick} className={cn("flex-col items-start gap-0.5", action.destructive && "text-destructive focus:text-destructive")}><span className="flex items-center gap-2">{Icon ? <Icon /> : null}{action.label}</span>{action.disabled && action.disabledReason ? <span className="text-xs font-normal text-muted-foreground">{action.disabledReason}</span> : null}</DropdownMenuItem></span>; })}</DropdownMenuContent></DropdownMenu> : null}
    </div>
  </div></TooltipProvider>;
}
