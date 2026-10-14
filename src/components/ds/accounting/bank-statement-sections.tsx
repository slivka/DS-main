/** Sekce výpisu · vlastní rozvržení polí · nesmí ukládat ani kontrolovat výpis. */
import { useCompactDateGeometry } from "../form/use-compact-date-geometry";
import type { BankStatementTexts } from "../../../ds-texts";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { AmountInput } from "./amount";
import { AmountDifference } from "./amount-difference";
import { DateField } from "../form/date-field";
import { parseDecimalInput } from "../form/decimal-input";
import { FieldValue } from "../form/field-value";
import { Field, FieldGrid } from "../layout/form-field-layout";
import type { BankStatementBalances, BankStatementValue } from "./bank-statement-form";

/** Vnitřní údaje základní sekce. */
interface BasicSectionProps {
  /** Identifikátor sekce. */
  id: string;
  /** Hodnoty výpisu. */
  value: BankStatementValue;
  /** Změna výpisu. */
  patch: (next: Partial<BankStatementValue>) => void;
  /** Zamčený výpis. */
  locked: boolean;
  /** Součty pohybů. */
  balances: BankStatementBalances;
  /** Značka měny. */
  symbol: string;
  /** Jazykové texty. */
  texts: BankStatementTexts;
}

/** Základní údaje: datum vlevo, porovnání s bankou vpravo. */
export function BankStatementBasic({
  id,
  value,
  patch,
  locked,
  balances,
  symbol,
  texts,
}: BasicSectionProps) {
  const { containerRef, geometry } = useCompactDateGeometry(texts.date);
  return (
    <FieldGrid cols={12}>
      <Field span={3}>
        <div ref={containerRef} className="document-dates-container">
          <div className="document-dates-compact" style={geometry}>
            <Field label={texts.date} htmlFor={`${id}-date`}>
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
      <Field span={9}>
        <BankStatementBankClosing
          id={id}
          bankClosing={value.bankClosing}
          onChange={(bankClosing) => patch({ bankClosing })}
          locked={locked}
          balances={balances}
          symbol={symbol}
          texts={texts}
        />
      </Field>
    </FieldGrid>
  );
}

/** Vnitřní porovnání bankovního zůstatku s pohyby. */
interface BankClosingProps {
  /** Identifikátor pole. */
  id: string;
  /** Nepovinný bankovní zůstatek. */
  bankClosing: number | null;
  /** Změna zůstatku. */
  onChange: (value: number | null) => void;
  /** Zamčená hodnota. */
  locked: boolean;
  /** Součty pohybů. */
  balances: BankStatementBalances;
  /** Značka měny. */
  symbol: string;
  /** Jazykové texty. */
  texts: BankStatementTexts;
}

/** Bankovní zůstatek vpravo; pouze nenulový rozdíl vlevo. */
export function BankStatementBankClosing({
  id,
  bankClosing,
  onChange,
  locked,
  balances,
  symbol,
  texts: t,
}: BankClosingProps) {
  const closing = balances.opening + balances.income - balances.expense;
  const difference = bankClosing === null ? null : Math.round((bankClosing - closing) * 100) / 100;
  return (
    <div className="flex min-w-0 flex-wrap items-end justify-end gap-3">
      {difference !== null && difference !== 0 ? (
        <AmountDifference
          data-slot="bank-statement-difference"
          value={difference}
          label={t.difference}
          currencySymbol={symbol}
        />
      ) : null}
      <Field
        label={t.bankClosing}
        htmlFor={locked ? undefined : `${id}-bankClosing`}
        labelId={`${id}-bankClosing-label`}
        className="min-w-0 flex-1"
      >
        {locked ? (
          <FieldValue
            aria-labelledby={`${id}-bankClosing-label`}
            className="text-right tabular-nums"
          >
            {bankClosing === null ? null : `${formatAmount(bankClosing)} ${symbol}`}
          </FieldValue>
        ) : (
          <div className="relative">
            <AmountInput
              id={`${id}-bankClosing`}
              value={bankClosing}
              onChange={(next) => onChange(parseDecimalInput(next))}
              className="pr-10"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground"
            >
              {symbol}
            </span>
          </div>
        )}
      </Field>
    </div>
  );
}

/** Vnitřní údaje společné oběma měnám. */
interface BalancesSectionProps {
  /** Identifikátor sekce. */
  id: string;
  /** Součty pohybů. */
  balances: BankStatementBalances;
  /** Značka měny. */
  symbol: string;
  /** Jazykové texty. */
  texts: BankStatementTexts;
}

/** Čtyři zůstatky dle pohybů; porovnání s bankou sem nepatří. */
export function BankStatementBalanceSection({
  id,
  balances,
  symbol,
  texts: t,
}: BalancesSectionProps) {
  const closing = balances.opening + balances.income - balances.expense;
  return (
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
  );
}
