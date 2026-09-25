import { useState, type ReactNode } from "react";

import { Checkbox } from "../../ui/checkbox";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";
import { PageHeader } from "../layout/page-header";
import { ReadOnlyBanner } from "../feedback/read-only-banner";
import { DateField } from "../form/date-field";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { AccountSelect, type AccountOption } from "./account-select";
import { formatAccountCode } from "./account-code";
import { BookSelect, formatBook, type BookOption } from "./book-select";
import type { CurrencyOption } from "./currency-amount";
import { DocumentStatusBadge, type DocumentStatus } from "./document-status-badge";
import {
  documentFieldsForType,
  mainAccountLabelForType,
  partnerLabelForType,
  type DocumentFields,
  type DocumentTypeCode,
} from "./document-fields";
import { JournalLinesEditor, type JournalLinesEditorProps } from "./journal-lines-editor";
import type { JournalLine } from "./journal-lines";
import type { DimensionOption } from "./dimension-select";
import { PartnerSelect, type PartnerOption } from "./partner-select";
import { VsField } from "./vs-field";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

export type DocumentDirection = "in" | "out";

/** Hlavička dokladu – camelCase obraz tabulky documents. */
export type DocumentHeaderValue = {
  bookId?: string | null;
  /** Číslo přiděluje databáze při zařazení – jen zobrazení. */
  number?: string | null;
  /** Směr u pokladny / banky – jen zobrazení. */
  direction?: DocumentDirection | null;
  accountingDate?: string | null;
  issueDate?: string | null;
  taxDate?: string | null;
  dueDate?: string | null;
  externalNumber?: string | null;
  partnerId?: string | null;
  variableSymbol?: string | null;
  constantSymbol?: string | null;
  specificSymbol?: string | null;
  bankAccount?: string | null;
  description?: string | null;
  currency: string;
  /** Kurz se odvozuje (ČNB) – jen zobrazení. */
  rate?: number | null;
  /** Zdroj kurzu, např. „ČNB 23. 9. 2026“. */
  rateInfo?: string | null;
  amountTotal: number;
  /** "entered" = částka zadaná v hlavičce, "sum" = součet řádků. */
  totalMode: "entered" | "sum";
  roundingAmount?: number | null;
  mainAccountId?: string | null;
  excludeFromPaymentOrders?: boolean;
};

export type DocumentHeaderField = keyof DocumentHeaderValue;
export type DocumentFormTab = { id: string; label: string; content: ReactNode; badge?: ReactNode };

export type DocumentFormTexts = {
  headerSection: string; datesSection: string; paymentSection: string; propertiesSection: string; rateSection: string; amountSection: string;
  book: string; period: string; number: string; numberPending: string; direction: string; directionIn: string; directionOut: string;
  status: string; approved: string; yes: string; no: string;
  accountingDate: string; issueDate: string; taxDate: string; dueDate: string; externalNumber: string;
  partner: string; ico: string; dic: string; variableSymbol: string; constantSymbol: string; specificSymbol: string; bankAccount: string;
  description: string; currency: string; rate: string; amountTotal: string; amountSum: string; sumFromLines: string; rounding: string;
  mainAccount: string; mainSide: string; sideDebit: string; sideCredit: string;
  excludeFromPaymentOrders: string; linesTab: string; changedBy: string; changedAt: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Základní údaje", datesSection: "Data", paymentSection: "Platební údaje", propertiesSection: "Vlastnosti dokladu",
  rateSection: "Kurz dokladu", amountSection: "Částka dokladu",
  book: "Kniha", period: "Období", number: "Číslo dokladu", numberPending: "přidělí se při zařazení",
  direction: "Směr", directionIn: "Příjem", directionOut: "Výdej", status: "Stav", approved: "Schváleno", yes: "Ano", no: "Ne",
  accountingDate: "Datum účetního případu", issueDate: "Datum vystavení", taxDate: "DUZP",
  dueDate: "Datum splatnosti", externalNumber: "Externí číslo",
  partner: "Partner", ico: "IČ", dic: "DIČ", variableSymbol: "Variabilní symbol", constantSymbol: "Konstantní symbol",
  specificSymbol: "Specifický symbol", bankAccount: "Bankovní účet",
  description: "Popis", currency: "Měna", rate: "Kurz", amountTotal: "Celkem za doklad",
  amountSum: "Celkem za doklad", sumFromLines: "Sčítat z rozpisu", rounding: "Haléřové vyrovnání",
  mainAccount: "Hlavní účet", mainSide: "Strana", sideDebit: "MD", sideCredit: "DAL",
  excludeFromPaymentOrders: "Nezahrnovat do platebních příkazů",
  linesTab: "Řádky", changedBy: "Změnil", changedAt: "Změněno",
};

export interface DocumentFormProps {
  title: string;
  /** @deprecated Pod nadpisem formuláře se doplňkový text nezobrazuje. */
  description?: ReactNode;
  value: DocumentHeaderValue;
  onChange: (value: DocumentHeaderValue) => void;
  lines: JournalLine[];
  onLinesChange: (lines: JournalLine[]) => void;
  books: BookOption[];
  accounts: AccountOption[];
  partners?: PartnerOption[];
  dimensions?: DimensionOption[];
  currencies?: CurrencyOption[];
  /** Druh dokladu; určuje výchozí pole a účetní popisky. */
  documentType?: DocumentTypeCode | string;
  /** Viditelné skupiny polí; bez zadání se odvodí z documentType. */
  fields?: Partial<DocumentFields>;
  /** Když je zadané, lze upravit jen tato pole hlavičky. */
  editableFields?: DocumentHeaderField[];
  isNew?: boolean;
  mainSide?: "MD" | "D";
  mainAccountLocked?: boolean;
  /** Zobrazené účetní období dokladu. */
  periodLabel?: ReactNode;
  /** Množství cizí měny, pro které je uveden kurz. */
  rateAmount?: number;
  linesEditorProps?: Partial<Omit<JournalLinesEditorProps, "lines" | "onChange" | "accounts" | "partners" | "dimensions" | "mode" | "mainSide" | "mainAccount">>;
  tabs?: DocumentFormTab[];
  status: DocumentStatus;
  approved?: boolean;
  changedBy?: string;
  changedAt?: string;
  actions?: ReactNode;
  readOnly?: boolean;
  readOnlyReason?: ReactNode;
  texts?: Partial<DocumentFormTexts>;
  className?: string;
}

/** Pole jen pro čtení = čistý text bez rámečku a plochy, zarovnaný k sousedním polím. */
const ReadField = ({ id, value, muted, mono }: { id: string; value: ReactNode; muted?: boolean; mono?: boolean }) => (
  <div id={id} aria-readonly="true" className={cn(
    "flex min-h-9 items-center text-sm",
    muted && "italic text-muted-foreground",
    mono && "font-mono tabular-nums",
  )}>{value}</div>
);

const SideBadge = ({ side, texts }: { side: "MD" | "D"; texts: DocumentFormTexts }) => (
  <span title={texts.mainSide} className="rounded-sm border border-border bg-muted/60 px-1.5 py-0.5 text-xs font-semibold text-muted-foreground">
    {side === "MD" ? texts.sideDebit : texts.sideCredit}
  </span>
);

/** Celostránkový editor účetního dokladu s hlavičkou ve stylu Money. */
export function DocumentForm({
  title, description: _description, value, onChange, lines, onLinesChange, books, accounts,
  partners = [], dimensions = [], currencies, documentType = "ID", fields, editableFields, isNew = false,
  mainSide, mainAccountLocked = false, periodLabel, rateAmount = 1, linesEditorProps, tabs = [], status, approved,
  changedBy, changedAt, actions, readOnly = false, readOnlyReason, texts, className,
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
  const book = books.find((item) => item.id === value.bookId);
  const partner = partners.find((item) => item.id === value.partnerId);
  const account = accounts.find((item) => item.code.replace(/\D/g, "") === (value.mainAccountId ?? "").replace(/\D/g, ""));
  const mode = f.mainAccount && value.mainAccountId && mainSide ? "mainAccount" : "internal";
  const side = mainSide ? <SideBadge side={mainSide} texts={t} /> : null;
  const mainAccountLabel = texts?.mainAccount ?? mainAccountLabelForType(documentType);
  const partnerLabel = texts?.partner ?? partnerLabelForType(documentType, value.direction);
  const accountLocked = mainAccountLocked || !can("mainAccountId");

  const field = (id: string, label: string, control: ReactNode, wide = false) => (
    <div className={cn("flex min-w-0 flex-col gap-1", wide && "@min-[40rem]:col-span-2")}>
      <Label htmlFor={id}>{label}</Label>{control}
    </div>
  );
  const date = (key: "accountingDate" | "issueDate" | "taxDate" | "dueDate", label: string) =>
    field(`document-${key}`, label, <DateField id={`document-${key}`} value={value[key] ?? ""} onChange={(next) => patch({ [key]: next ?? null })} disabled={!can(key)} />);
  const text = (key: "externalNumber" | "constantSymbol" | "specificSymbol" | "bankAccount", label: string, mono = true) =>
    field(`document-${key}`, label, <Input id={`document-${key}`} value={value[key] ?? ""} onChange={(event) => patch({ [key]: event.target.value })} disabled={!can(key)} className={cn("h-9", mono && "font-mono tabular-nums")} />);
  const property = (id: string, label: string, content: ReactNode, mono = false) => (
    <div className="grid min-w-0 grid-cols-[minmax(7rem,0.8fr)_minmax(0,1.2fr)] items-center gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div id={id} className={cn("min-w-0 font-medium", mono && "font-mono tabular-nums")}>{content}</div>
    </div>
  );
  const rateText = value.currency === "CZK" || value.rate == null
    ? "—"
    : `${formatAmount(value.rate, 3)} CZK za ${formatAmount(rateAmount, Number.isInteger(rateAmount) ? 0 : 3)} ${value.currency}`;

  const allTabs: DocumentFormTab[] = [{
    id: "lines", label: t.linesTab, badge: lines.length || undefined,
    content: <JournalLinesEditor lines={lines} onChange={onLinesChange} accounts={accounts} dimensions={dimensions} partners={partners}
      mode={mode} mainSide={mainSide} mainAccount={value.mainAccountId}
      totalAmount={totalMode === "entered" ? value.amountTotal : undefined}
      totalMode={totalMode === "entered" ? "entered" : "computed"} {...linesEditorProps}
      editableFields={readOnly ? [] : linesEditorProps?.editableFields} />,
  }, ...tabs.filter((item) => item.id !== "lines")];

  return (
    <div className={cn("@container space-y-4", className)}>
      <PageHeader title={title} actions={<div className="flex flex-wrap items-center gap-2"><DocumentStatusBadge status={status} approved={approved} />{actions}</div>} />
      {readOnly && readOnlyReason ? <ReadOnlyBanner reason={readOnlyReason} /> : null}

      <section className="rounded-lg border bg-card">
        <div className="grid @min-[64rem]:grid-cols-[minmax(0,2fr)_minmax(19rem,1fr)]">
          <div className="p-4 @min-[64rem]:pr-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t.headerSection}</h2>
            <div className="grid gap-3 @min-[40rem]:grid-cols-2">
              {f.mainAccount ? field("document-main-account", mainAccountLabel, accountLocked ? (
                <ReadField id="document-main-account" value={<div className="flex min-w-0 items-center gap-2"><span className="min-w-0 truncate"><span className="font-mono tabular-nums">{account ? formatAccountCode(account.code) : value.mainAccountId ? formatAccountCode(value.mainAccountId) : "—"}</span>{account ? <span>{` - ${account.name}`}</span> : null}</span>{side}</div>} />
              ) : <AccountSelect accounts={accounts} value={value.mainAccountId ?? ""} suffix={side} onChange={(mainAccountId) => patch({ mainAccountId })} />) : null}
              {date("accountingDate", t.accountingDate)}
              {date("issueDate", t.issueDate)}
              {f.taxDate ? date("taxDate", t.taxDate) : null}
              {f.dueDate ? date("dueDate", t.dueDate) : null}
              {f.externalNumber ? text("externalNumber", t.externalNumber) : null}
              {f.partner ? field("document-partner", partnerLabel, <PartnerSelect id="document-partner" partners={partners} value={value.partnerId ?? ""} onChange={(partnerId) => patch({ partnerId })} disabled={!can("partnerId") || partners.length === 0} />, true) : null}
              {f.partner ? field("document-partner-ico", t.ico, <ReadField id="document-partner-ico" mono value={partner?.ico || "—"} />) : null}
              {f.partner ? field("document-partner-dic", t.dic, <ReadField id="document-partner-dic" mono value={partner?.dic || "—"} />) : null}
              {field("document-description", t.description, <Textarea id="document-description" rows={2} value={value.description ?? ""} onChange={(event) => patch({ description: event.target.value })} disabled={!can("description")} />, true)}
            </div>

            {f.symbols || f.bankAccount || f.paymentOrders ? <>
              <h3 className="mb-2 mt-5 text-sm font-semibold text-foreground">{t.paymentSection}</h3>
              <div className="grid gap-3 @min-[40rem]:grid-cols-2">
                {f.symbols ? field("document-variableSymbol", t.variableSymbol, <VsField id="document-variableSymbol" value={value.variableSymbol ?? ""} onChange={(variableSymbol) => patch({ variableSymbol })} disabled={!can("variableSymbol")} />) : null}
                {f.symbols ? text("constantSymbol", t.constantSymbol) : null}
                {f.symbols ? text("specificSymbol", t.specificSymbol) : null}
                {f.bankAccount ? text("bankAccount", t.bankAccount) : null}
                {f.paymentOrders ? <label className="flex items-center gap-2 text-sm @min-[40rem]:col-span-2"><Checkbox checked={!!value.excludeFromPaymentOrders} disabled={!can("excludeFromPaymentOrders")} onCheckedChange={(checked) => patch({ excludeFromPaymentOrders: checked === true })} />{t.excludeFromPaymentOrders}</label> : null}
              </div>
            </> : null}
          </div>

          <aside className="border-t bg-muted/20 p-4 @min-[64rem]:border-l @min-[64rem]:border-t-0">
            <h2 className="mb-3 text-sm font-semibold text-foreground">{t.propertiesSection}</h2>
            <div className="space-y-2.5">
              {property("document-book", t.book, isNew && can("bookId") ? <BookSelect id="document-book" books={books} value={value.bookId ?? ""} onChange={(bookId) => patch({ bookId })} /> : <span>{book ? formatBook(book) : "—"}</span>)}
              {property("document-period", t.period, periodLabel ?? "—")}
              {property("document-number", t.number, <span className={cn("font-mono tabular-nums", !value.number && "font-sans font-normal italic text-muted-foreground")}>{value.number || t.numberPending}</span>)}
              {f.direction ? property("document-direction", t.direction, value.direction === "in" ? t.directionIn : value.direction === "out" ? t.directionOut : "—") : null}
              {property("document-status", t.status, <DocumentStatusBadge status={status} />)}
              {property("document-approved", t.approved, approved ? t.yes : t.no)}
            </div>

            <h3 className="mb-2 mt-5 border-t pt-4 text-sm font-semibold text-foreground">{t.rateSection}</h3>
            <div className="space-y-2.5">
              {property("document-currency", t.currency, currencies && can("currency") ? <OptionSelect id="document-currency" allowEmpty={false} value={value.currency} onChange={(currency) => patch({ currency })} options={currencies.map((item) => ({ value: item.code, label: item.label ? `${item.code} – ${item.label}` : item.code }))} /> : value.currency)}
              {property("document-rate", t.rate, <><span className="font-mono tabular-nums">{rateText}</span>{value.rateInfo ? <span className="mt-1 block text-xs font-normal text-muted-foreground">{value.rateInfo}</span> : null}</>)}
            </div>

            <h3 className="mb-2 mt-5 border-t pt-4 text-sm font-semibold text-foreground">{t.amountSection}</h3>
            <label className="mb-3 flex items-center gap-2 text-sm"><Checkbox checked={totalMode === "sum"} disabled={forcedSum || !can("totalMode")} onCheckedChange={(checked) => patch({ totalMode: checked === true ? "sum" : "entered" })} />{t.sumFromLines}</label>
            <div className="space-y-3">
              {field("document-amountTotal", t.amountTotal, totalMode === "entered" && can("amountTotal") ? <DecimalInput id="document-amountTotal" className="h-9 tabular-nums" value={value.amountTotal} onChange={(next) => patch({ amountTotal: next === "" ? 0 : Number(next) })} /> : <ReadField id="document-amountTotal" mono value={<span className="ml-auto">{formatAmount(total, 2)}</span>} />)}
              {f.rounding ? field("document-roundingAmount", t.rounding, can("roundingAmount") ? <DecimalInput id="document-roundingAmount" className="h-9 tabular-nums" value={value.roundingAmount ?? 0} onChange={(next) => patch({ roundingAmount: next === "" ? 0 : Number(next) })} /> : <ReadField id="document-roundingAmount" mono value={<span className="ml-auto">{formatAmount(value.roundingAmount ?? 0, 2)}</span>} />) : null}
            </div>
          </aside>
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <TabsList className="h-10 gap-1 rounded-none border-b bg-transparent p-0">
            {allTabs.map((item) => <TabsTrigger key={item.id} value={item.id} className="h-10 gap-1.5 rounded-none border-b-2 border-transparent px-3 py-2 text-base font-medium shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-none">{item.label}{item.badge != null ? <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{item.badge}</span> : null}</TabsTrigger>)}
          </TabsList>
          {changedBy ? <span className="text-xs text-muted-foreground">{`${t.changedBy}: ${changedBy}`}</span> : null}
          {changedAt ? <span className="text-xs text-muted-foreground">{`${t.changedAt}: ${changedAt}`}</span> : null}
        </div>
        {allTabs.map((item) => <TabsContent key={item.id} value={item.id} className="mt-2">{item.content}</TabsContent>)}
      </Tabs>
    </div>
  );
}
