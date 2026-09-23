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
import { BookSelect, formatBook, type BookOption } from "./book-select";
import type { CurrencyOption } from "./currency-amount";
import { DocumentStatusBadge, type DocumentStatus } from "./document-status-badge";
import { documentFieldsForType, type DocumentFields } from "./document-fields";
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
  headerSection: string; datesSection: string; paymentSection: string; amountSection: string;
  book: string; number: string; numberPending: string; direction: string; directionIn: string; directionOut: string;
  accountingDate: string; issueDate: string; taxDate: string; dueDate: string; externalNumber: string;
  partner: string; variableSymbol: string; constantSymbol: string; specificSymbol: string; bankAccount: string;
  description: string; currency: string; rate: string; amountTotal: string; amountSum: string; rounding: string;
  mainAccount: string; mainSide: string; sideDebit: string; sideCredit: string;
  excludeFromPaymentOrders: string; linesTab: string; changedBy: string; changedAt: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Hlavička dokladu", datesSection: "Data", paymentSection: "Platební údaje", amountSection: "Částka",
  book: "Kniha", number: "Číslo dokladu", numberPending: "přidělí se při zařazení",
  direction: "Směr", directionIn: "Příjem", directionOut: "Výdej",
  accountingDate: "Datum účetního případu", issueDate: "Datum vystavení", taxDate: "Datum zdanitelného plnění",
  dueDate: "Datum splatnosti", externalNumber: "Externí číslo",
  partner: "Partner", variableSymbol: "Variabilní symbol", constantSymbol: "Konstantní symbol",
  specificSymbol: "Specifický symbol", bankAccount: "Bankovní účet",
  description: "Popis", currency: "Měna", rate: "Kurz", amountTotal: "Částka celkem",
  amountSum: "Částka celkem (součet řádků)", rounding: "Haléřové vyrovnání",
  mainAccount: "Hlavní účet", mainSide: "Strana", sideDebit: "MD", sideCredit: "DAL",
  excludeFromPaymentOrders: "Nezahrnovat do platebních příkazů",
  linesTab: "Řádky", changedBy: "Změnil", changedAt: "Změněno",
};

export interface DocumentFormProps {
  title: string;
  description?: ReactNode;
  value: DocumentHeaderValue;
  onChange: (value: DocumentHeaderValue) => void;
  /** Řádky zápisu ve tvaru JournalLinesEditoru (převod přes toJournalRow / fromJournalRow). */
  lines: JournalLine[];
  onLinesChange: (lines: JournalLine[]) => void;
  books: BookOption[];
  accounts: AccountOption[];
  partners?: PartnerOption[];
  dimensions?: DimensionOption[];
  currencies?: CurrencyOption[];
  /** Viditelné skupiny polí; výchozí documentFieldsForType("ID"). */
  fields?: Partial<DocumentFields>;
  /** Když je zadané, lze upravit jen tato pole hlavičky. */
  editableFields?: DocumentHeaderField[];
  /** Nový doklad – jen tehdy lze vybrat knihu. */
  isNew?: boolean;
  /** Strana hlavního účtu knihy (documents.main_account_side). */
  mainSide?: "MD" | "D";
  mainAccountLocked?: boolean;
  /** Další props JournalLinesEditoru (editableFields, dimensionRequired, showCurrency, onRoundingFill …). */
  linesEditorProps?: Partial<Omit<JournalLinesEditorProps, "lines" | "onChange" | "accounts" | "partners" | "dimensions" | "mode" | "mainSide" | "mainAccount">>;
  /** Další záložky pod hlavičkou; Řádky jsou vždy první. */
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

const ReadField = ({ id, value, muted, mono }: { id: string; value: ReactNode; muted?: boolean; mono?: boolean }) => (
  <div id={id} aria-readonly="true"
    className={cn("flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm", muted && "italic text-muted-foreground", mono && "font-mono tabular-nums")}>
    {value}
  </div>
);

/**
 * Celostránkový editor dokladu. Nic neukládá ani nečísluje – číslo a kurz jen zobrazuje,
 * akce (Uložit koncept, Zařadit, Zaúčtovat…) dodává aplikace přes `actions`.
 */
export function DocumentForm({
  title, description, value, onChange, lines, onLinesChange, books, accounts,
  partners = [], dimensions = [], currencies, fields, editableFields, isNew = false,
  mainSide, mainAccountLocked = false, linesEditorProps, tabs = [], status, approved,
  changedBy, changedAt, actions, readOnly = false, readOnlyReason, texts, className,
}: DocumentFormProps) {
  const t = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...texts };
  const f: DocumentFields = { ...documentFieldsForType("ID"), ...fields };
  const [tab, setTab] = useState("lines");
  const patch = (values: Partial<DocumentHeaderValue>) => onChange({ ...value, ...values });
  const can = (key: DocumentHeaderField) => !readOnly && (!editableFields || editableFields.includes(key));

  const linesSum = Math.round(lines.reduce((sum, line) => sum + (line.amount || 0), 0) * 100) / 100;
  const total = value.totalMode === "sum" ? linesSum : value.amountTotal;
  const book = books.find((b) => b.id === value.bookId);
  const mode = f.mainAccount && value.mainAccountId && mainSide ? "mainAccount" : "internal";

  const field = (id: string, label: string, control: ReactNode, wide?: boolean) => (
    <div className={cn("flex flex-col gap-1", wide && "@min-[40rem]:col-span-2 @min-[64rem]:col-span-4")}>
      <Label htmlFor={id}>{label}</Label>
      {control}
    </div>
  );
  const date = (key: "accountingDate" | "issueDate" | "taxDate" | "dueDate", label: string) =>
    field(`document-${key}`, label, (
      <DateField id={`document-${key}`} value={value[key] ?? ""} onChange={(v) => patch({ [key]: v ?? null })} disabled={!can(key)} />
    ));
  const text = (key: "externalNumber" | "constantSymbol" | "specificSymbol" | "bankAccount", label: string, mono = true) =>
    field(`document-${key}`, label, (
      <Input id={`document-${key}`} value={value[key] ?? ""} onChange={(e) => patch({ [key]: e.target.value })}
        disabled={!can(key)} className={cn("h-9", mono && "font-mono tabular-nums")} />
    ));

  const allTabs: DocumentFormTab[] = [
    {
      id: "lines", label: t.linesTab, badge: lines.length || undefined,
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
          totalAmount={value.totalMode === "entered" ? value.amountTotal : undefined}
          totalMode={value.totalMode === "entered" ? "entered" : "computed"}
          {...linesEditorProps}
          editableFields={readOnly ? [] : linesEditorProps?.editableFields}
        />
      ),
    },
    ...tabs.filter((item) => item.id !== "lines"),
  ];

  return (
    <div className={cn("@container space-y-4", className)}>
      <PageHeader
        title={title}
        description={description}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DocumentStatusBadge status={status} approved={approved} />
            {actions}
          </div>
        }
      />

      {readOnly && readOnlyReason ? <ReadOnlyBanner reason={readOnlyReason} /> : null}

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t.headerSection}</h2>
        <div className="grid gap-3 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-4">
          {field("document-book", t.book, isNew && can("bookId") ? (
            <BookSelect id="document-book" books={books} value={value.bookId ?? ""} onChange={(bookId) => patch({ bookId })} />
          ) : <ReadField id="document-book" value={book ? formatBook(book) : "—"} />)}
          {field("document-number", t.number, (
            <ReadField id="document-number" mono={!!value.number} muted={!value.number} value={value.number || t.numberPending} />
          ))}
          {f.direction ? field("document-direction", t.direction, (
            <ReadField id="document-direction" value={value.direction === "in" ? t.directionIn : value.direction === "out" ? t.directionOut : "—"} />
          )) : null}
          {f.externalNumber ? text("externalNumber", t.externalNumber) : null}
          {f.partner ? field("document-partner", t.partner, (
            <PartnerSelect id="document-partner" partners={partners} value={value.partnerId ?? ""}
              onChange={(partnerId) => patch({ partnerId })} disabled={!can("partnerId") || partners.length === 0} />
          )) : null}
          {f.mainAccount ? field("document-main-account", t.mainAccount, (
            <div className="flex items-center gap-2">
              <AccountSelect accounts={accounts} value={value.mainAccountId ?? ""} className="min-w-0 flex-1"
                onChange={(mainAccountId) => patch({ mainAccountId })} disabled={mainAccountLocked || !can("mainAccountId")} />
              {mainSide ? (
                <span title={t.mainSide} className="shrink-0 rounded-sm bg-muted px-2 py-1 text-xs font-semibold text-muted-foreground">
                  {mainSide === "MD" ? t.sideDebit : t.sideCredit}
                </span>
              ) : null}
            </div>
          )) : null}
          {field("document-description", t.description, (
            <Textarea id="document-description" rows={2} value={value.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })} disabled={!can("description")} />
          ), true)}
        </div>

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.datesSection}</h3>
        <div className="grid gap-3 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-4">
          {date("accountingDate", t.accountingDate)}
          {date("issueDate", t.issueDate)}
          {f.taxDate ? date("taxDate", t.taxDate) : null}
          {f.dueDate ? date("dueDate", t.dueDate) : null}
        </div>

        {f.symbols || f.bankAccount || f.paymentOrders ? (
          <>
            <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.paymentSection}</h3>
            <div className="grid gap-3 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-4">
              {f.symbols ? field("document-variableSymbol", t.variableSymbol, (
                <VsField id="document-variableSymbol" value={value.variableSymbol ?? ""}
                  onChange={(variableSymbol) => patch({ variableSymbol })} disabled={!can("variableSymbol")} />
              )) : null}
              {f.symbols ? text("constantSymbol", t.constantSymbol) : null}
              {f.symbols ? text("specificSymbol", t.specificSymbol) : null}
              {f.bankAccount ? text("bankAccount", t.bankAccount) : null}
              {f.paymentOrders ? (
                <label className="flex items-center gap-2 text-sm @min-[40rem]:col-span-2">
                  <Checkbox checked={!!value.excludeFromPaymentOrders} disabled={!can("excludeFromPaymentOrders")}
                    onCheckedChange={(checked) => patch({ excludeFromPaymentOrders: checked === true })} />
                  {t.excludeFromPaymentOrders}
                </label>
              ) : null}
            </div>
          </>
        ) : null}

        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.amountSection}</h3>
        <div className="grid gap-3 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-4">
          {field("document-currency", t.currency, currencies && can("currency") ? (
            <OptionSelect id="document-currency" allowEmpty={false} value={value.currency}
              onChange={(currency) => patch({ currency })}
              options={currencies.map((c) => ({ value: c.code, label: c.label ? `${c.code} – ${c.label}` : c.code }))} />
          ) : <ReadField id="document-currency" value={value.currency} />)}
          {field("document-rate", t.rate, (
            <ReadField id="document-rate" mono
              value={<span>{value.rate != null ? formatAmount(value.rate, 3) : "—"}{value.rateInfo ? <span className="ml-2 font-sans text-xs text-muted-foreground">{value.rateInfo}</span> : null}</span>} />
          ))}
          {field("document-amountTotal", value.totalMode === "sum" ? t.amountSum : t.amountTotal,
            value.totalMode === "entered" && can("amountTotal") ? (
              <DecimalInput id="document-amountTotal" className="h-9 tabular-nums" value={value.amountTotal}
                onChange={(v) => patch({ amountTotal: v === "" ? 0 : Number(v) })} />
            ) : <ReadField id="document-amountTotal" mono value={<span className="ml-auto">{formatAmount(total, 2)}</span>} />)}
          {f.rounding ? field("document-roundingAmount", t.rounding, can("roundingAmount") ? (
            <DecimalInput id="document-roundingAmount" className="h-9 tabular-nums" value={value.roundingAmount ?? 0}
              onChange={(v) => patch({ roundingAmount: v === "" ? 0 : Number(v) })} />
          ) : <ReadField id="document-roundingAmount" mono value={<span className="ml-auto">{formatAmount(value.roundingAmount ?? 0, 2)}</span>} />) : null}
        </div>
      </section>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <TabsList>
            {allTabs.map((item) => (
              <TabsTrigger key={item.id} value={item.id} className="gap-1.5">
                {item.label}
                {item.badge != null ? <span className="rounded-sm bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{item.badge}</span> : null}
              </TabsTrigger>
            ))}
          </TabsList>
          {changedBy ? <span className="text-xs text-muted-foreground">{`${t.changedBy}: ${changedBy}`}</span> : null}
          {changedAt ? <span className="text-xs text-muted-foreground">{`${t.changedAt}: ${changedAt}`}</span> : null}
        </div>
        {allTabs.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-2">{item.content}</TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
