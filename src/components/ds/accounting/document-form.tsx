import type { ReactNode } from "react";

import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Textarea } from "../../ui/textarea";
import { PageHeader } from "../layout/page-header";
import { ReadOnlyBanner } from "../feedback/read-only-banner";
import { DateField } from "../form/date-field";
import { BookSelect, type BookOption } from "./book-select";
import { CurrencyAmount, type CurrencyOption } from "./currency-amount";
import { DocumentStatusBadge, type DocumentStatus } from "./document-status-badge";
import { JournalLinesEditor, type JournalLine } from "./journal-lines-editor";
import type { AccountOption } from "./account-select";
import type { DimensionOption } from "./dimension-select";
import { PartnerSelect, type PartnerOption } from "./partner-select";
import { VsField } from "./vs-field";
import { cn } from "../../../lib/utils";

export type DocumentHeaderValue = {
  bookId?: string | null;
  number?: string;
  issueDate?: string;
  taxDate?: string;
  dueDate?: string;
  partnerId?: string | null;
  vs?: string;
  description?: string;
  currency: string;
  rate: number;
  amount: number;
};

export type DocumentFormTexts = {
  headerSection: string;
  linesSection: string;
  statusSection: string;
  book: string;
  number: string;
  issueDate: string;
  taxDate: string;
  dueDate: string;
  partner: string;
  vs: string;
  description: string;
  changedBy: string;
  changedAt: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Hlavička dokladu",
  linesSection: "Řádky zápisu",
  statusSection: "Stav dokladu",
  book: "Kniha",
  number: "Číslo dokladu",
  issueDate: "Datum vystavení",
  taxDate: "Datum zdanitelného plnění",
  dueDate: "Datum splatnosti",
  partner: "Partner",
  vs: "Variabilní symbol",
  description: "Popis",
  changedBy: "Změnil",
  changedAt: "Změněno",
};

/**
 * Celostránkový editor dokladu. Číselníky se editují v `RecordDialog`,
 * doklady vždy v `DocumentForm`. Akční tlačítka dodává aplikace přes `actions`.
 */
export function DocumentForm({
  title,
  description,
  value,
  onChange,
  lines,
  onLinesChange,
  books,
  accounts,
  partners = [],
  dimensions = [],
  currencies,
  baseCurrency = "CZK",
  status,
  approved,
  changedBy,
  changedAt,
  actions,
  readOnly = false,
  readOnlyReason,
  texts,
  className,
}: {
  title: string;
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
  baseCurrency?: string;
  status: DocumentStatus;
  approved?: boolean;
  changedBy?: string;
  changedAt?: string;
  /** Akční tlačítka podle stavu (Uložit koncept, Zařadit, Zaúčtovat…). */
  actions?: ReactNode;
  readOnly?: boolean;
  readOnlyReason?: ReactNode;
  texts?: Partial<DocumentFormTexts>;
  className?: string;
}) {
  const t = { ...DEFAULT_DOCUMENT_FORM_TEXTS, ...texts };
  const patch = (values: Partial<DocumentHeaderValue>) => onChange({ ...value, ...values });

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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t.headerSection}
        </h2>
        <div className="grid gap-3 @min-[40rem]:grid-cols-2 @min-[64rem]:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-book">{t.book}</Label>
            <BookSelect
              id="document-book"
              books={books}
              value={value.bookId ?? ""}
              onChange={(bookId) => patch({ bookId })}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-number">{t.number}</Label>
            <Input
              id="document-number"
              value={value.number ?? ""}
              onChange={(event) => patch({ number: event.target.value })}
              disabled={readOnly}
              className="h-9 font-mono tabular-nums"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-issue-date">{t.issueDate}</Label>
            <DateField
              id="document-issue-date"
              value={value.issueDate ?? ""}
              onChange={(issueDate) => patch({ issueDate: issueDate ?? "" })}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-tax-date">{t.taxDate}</Label>
            <DateField
              id="document-tax-date"
              value={value.taxDate ?? ""}
              onChange={(taxDate) => patch({ taxDate: taxDate ?? "" })}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-due-date">{t.dueDate}</Label>
            <DateField
              id="document-due-date"
              value={value.dueDate ?? ""}
              onChange={(dueDate) => patch({ dueDate: dueDate ?? "" })}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-partner">{t.partner}</Label>
            <PartnerSelect
              id="document-partner"
              partners={partners}
              value={value.partnerId ?? ""}
              onChange={(partnerId) => patch({ partnerId })}
              disabled={readOnly || partners.length === 0}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="document-vs">{t.vs}</Label>
            <VsField
              id="document-vs"
              value={value.vs ?? ""}
              onChange={(vs) => patch({ vs })}
              disabled={readOnly}
            />
          </div>
          <div className="flex flex-col gap-1 @min-[40rem]:col-span-2 @min-[64rem]:col-span-4">
            <Label htmlFor="document-description">{t.description}</Label>
            <Textarea
              id="document-description"
              rows={2}
              value={value.description ?? ""}
              onChange={(event) => patch({ description: event.target.value })}
              disabled={readOnly}
            />
          </div>
        </div>

        <CurrencyAmount
          className="mt-3"
          amount={value.amount}
          onAmountChange={(amount) => patch({ amount })}
          currency={value.currency}
          onCurrencyChange={(currency) => patch({ currency })}
          currencies={currencies}
          rate={value.rate}
          onRateChange={(rate) => patch({ rate })}
          baseCurrency={baseCurrency}
          readOnly={readOnly}
          idPrefix="document-amount"
        />
      </section>

      <section className="space-y-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t.linesSection}
          </h2>
          {changedBy ? (
            <span className="text-xs text-muted-foreground">{`${t.changedBy}: ${changedBy}`}</span>
          ) : null}
          {changedAt ? (
            <span className="text-xs text-muted-foreground">{`${t.changedAt}: ${changedAt}`}</span>
          ) : null}
        </div>
        <JournalLinesEditor
          lines={lines}
          onChange={onLinesChange}
          accounts={accounts}
          dimensions={dimensions}
          partners={partners}
          editableFields={readOnly ? [] : undefined}
          totalAmount={value.amount}
        />
      </section>
    </div>
  );
}
