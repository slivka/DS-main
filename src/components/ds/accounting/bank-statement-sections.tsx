/** Sekce výpisu · vlastní rozvržení polí · nesmí ukládat ani kontrolovat výpis. */
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
  return (
    <FieldGrid cols={12}>
      <Field label={t.date} htmlFor={`${id}-date`} span={3} className="col-span-2">
        <DateField
          id={`${id}-date`}
          value={value.date}
          onChange={(date) => patch({ date })}
          disabled={locked}
          className="w-[calc(7.5rem+1.9rem)] max-w-full"
          inputClassName="min-w-0"
        />
      </Field>
      <Field label={t.number} htmlFor={`${id}-number`} span={2} className="col-span-2">
        {hasItems || locked ? (
          <FieldValue id={`${id}-number`} lockedReason={hasItems ? t.hasItems : undefined}>
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
      <Field label={t.note} htmlFor={`${id}-note`} span={7} className="col-span-2">
        {locked ? (
          <FieldValue id={`${id}-note`}>{value.note}</FieldValue>
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
            <Field key={key} label={t[key]} span={3} className="col-span-2">
              <FieldValue
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
          htmlFor={`${id}-bankClosing`}
          span={6}
          className="col-span-2 @min-[40rem]:col-start-4"
        >
          {locked ? (
            <FieldValue id={`${id}-bankClosing`} className="text-right tabular-nums">
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
        <Field label={t.difference} span={3} className="col-span-2">
          <FieldValue
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
