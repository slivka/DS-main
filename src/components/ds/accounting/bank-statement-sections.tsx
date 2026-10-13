/** Sekce výpisu · vlastní rozvržení polí · nesmí ukládat ani kontrolovat výpis. */
import { useCompactDateGeometry } from "../form/use-compact-date-geometry";
import { Check } from "lucide-react";
import type { BankStatementTexts } from "../../../ds-texts";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Input } from "../../ui/input";
import { AmountInput } from "./amount";
import { DateField } from "../form/date-field";
import { parseDecimalInput } from "../form/decimal-input";
import { FieldValue } from "../form/field-value";
import { Field, FieldGrid } from "../layout/form-field-layout";
import type { BankStatementBalances, BankStatementValue } from "./bank-statement-form";

/** Vnitřní údaje základní sekce. */
interface BasicSectionProps {
  id: string;
  value: BankStatementValue;
  patch: (next: Partial<BankStatementValue>) => void;
  locked: boolean;
  hasItems?: boolean;
  texts: BankStatementTexts;
}

/** Základní údaje se stejnými svislicemi jako zůstatky. */
export function BankStatementBasic({
  id,
  value,
  patch,
  locked,
  hasItems,
  texts: t,
}: BasicSectionProps) {
  const { containerRef, geometry } = useCompactDateGeometry(t.date);
  return (
    <FieldGrid cols={12}>
      <Field span={3}>
        <div ref={containerRef} className="document-dates-container">
          <div className="document-dates-compact" style={geometry}>
            <Field label={t.date} htmlFor={`${id}-date`}>
              <DateField
                id={`${id}-date`}
                value={value.date}
                onChange={(date) => patch({ date })}
                disabled={locked}
                inputClassName="min-w-0"
              />
            </Field>
          </div>
        </div>
      </Field>
      <Field
        label={t.number}
        htmlFor={hasItems || locked ? undefined : `${id}-number`}
        labelId={`${id}-number-label`}
        span={2}
      >
        {hasItems || locked ? (
          <FieldValue
            aria-labelledby={`${id}-number-label`}
            id={`${id}-number`}
            lockedReason={hasItems ? t.hasItems : undefined}
          >
            {value.number}
          </FieldValue>
        ) : (
          <Input
            id={`${id}-number`}
            value={value.number}
            onChange={(event) => patch({ number: event.target.value })}
          />
        )}
      </Field>
      <Field
        label={t.note}
        htmlFor={locked ? undefined : `${id}-note`}
        labelId={`${id}-note-label`}
        span={7}
      >
        {locked ? (
          <FieldValue aria-labelledby={`${id}-note-label`} id={`${id}-note`}>
            {value.note}
          </FieldValue>
        ) : (
          <Input
            id={`${id}-note`}
            value={value.note}
            onChange={(event) => patch({ note: event.target.value })}
          />
        )}
      </Field>
    </FieldGrid>
  );
}

/** Vnitřní údaje společné oběma měnám. */
interface BalancesSectionProps {
  id: string;
  balances: BankStatementBalances;
  symbol: string;
  bankClosing: number | null;
  onBankClosingChange: (value: number | null) => void;
  locked: boolean;
  texts: BankStatementTexts;
}

/** Součty a rozdíl, shodně pro původní i domácí měnu. */
export function BankStatementBalanceSection({
  id,
  balances,
  symbol,
  bankClosing,
  onBankClosingChange,
  locked,
  texts: t,
}: BalancesSectionProps) {
  const closing = balances.opening + balances.income - balances.expense;
  const difference = bankClosing === null ? null : Math.round((bankClosing - closing) * 100) / 100;
  return (
    <div className="space-y-3">
      <FieldGrid cols={12}>
        {(["opening", "income", "expense", "closing"] as const).map((key) => {
          const amount = key === "closing" ? closing : balances[key];
          return (
            <Field key={key} label={t[key]} labelId={`${id}-${key}-label`} span={3}>
              <FieldValue
                aria-labelledby={`${id}-${key}-label`}
                className={cn(
                  "text-right tabular-nums",
                  key === "closing" && "font-bold",
                  amount < 0 && "text-destructive",
                )}
              >
                {formatAmount(amount)} {symbol}
              </FieldValue>
            </Field>
          );
        })}
      </FieldGrid>
      <FieldGrid cols={12}>
        <Field
          label={t.bankClosing}
          htmlFor={locked ? undefined : `${id}-bankClosing`}
          labelId={`${id}-bankClosing-label`}
          span={6}
          className="@min-[40rem]:col-start-4"
        >
          {locked ? (
            <FieldValue
              aria-labelledby={`${id}-bankClosing-label`}
              id={`${id}-bankClosing`}
              className="text-right tabular-nums"
            >
              {bankClosing === null ? null : `${formatAmount(bankClosing)} ${symbol}`}
            </FieldValue>
          ) : (
            <AmountInput
              id={`${id}-bankClosing`}
              value={bankClosing}
              onChange={(next) => onBankClosingChange(parseDecimalInput(next))}
            />
          )}
        </Field>
        <Field label={t.difference} labelId={`${id}-difference-label`} span={3}>
          <FieldValue
            aria-labelledby={`${id}-difference-label`}
            data-slot="bank-statement-difference"
            className={cn(
              "text-right tabular-nums",
              difference !== null && difference !== 0 && "text-destructive",
            )}
          >
            {difference === null ? null : (
              <span
                className={cn(
                  "inline-flex items-center gap-1",
                  difference === 0 && "text-success-strong",
                )}
              >
                {difference === 0 ? (
                  <Check className="size-4" role="img" aria-label={t.matched} />
                ) : null}
                {formatAmount(difference)} {symbol}
              </span>
            )}
          </FieldValue>
        </Field>
      </FieldGrid>
    </div>
  );
}
