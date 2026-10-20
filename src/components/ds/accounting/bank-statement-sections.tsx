/** Sekce výpisu · vlastní rozvržení polí · nesmí ukládat ani kontrolovat výpis. */
import type { ReactNode } from "react";
import { IdentityLine } from "../layout/identity-line";
import { Input } from "../../ui/input";
import { useCompactDateGeometry } from "../form/use-compact-date-geometry";
import type { BankStatementTexts } from "../../../ds-texts";
import { formatAmount } from "../../../lib/format";
import { exactSum, roundHalfAwayFromZero } from "../../../lib/decimal-round";
import { cn } from "../../../lib/utils";
import { AmountInput } from "./amount";
import { Sigma } from "lucide-react";
import { FieldToggleButton } from "../form/field-toggle-button";
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
  /** Značka měny – jen do textu varování rozdílu; pole značku nezobrazují. */
  symbol: string;
  /** Jazykové texty. */
  texts: BankStatementTexts;
}

/** Konečný zůstatek z pohybů zaokrouhlený na haléře. */
export function statementClosing(balances: BankStatementBalances): number {
  return roundHalfAwayFromZero(exactSum([balances.opening, balances.income, -balances.expense]), 2);
}

/** Rozdíl zůstatku na výpise proti pohybům; null = Σ (počítá se z pohybů). */
export function statementDifference(
  bankClosing: number | null,
  balances: BankStatementBalances,
): number | null {
  if (bankClosing === null) return null;
  const difference = roundHalfAwayFromZero(exactSum([bankClosing, -statementClosing(balances)]), 2);
  return difference === 0 ? null : difference;
}

/**
 * Základní údaje jedním řádkem na mřížce 20 (po 4): datum, počáteční, příjmy, výdaje a
 * zůstatek na výpise. Pod 40 rem se pole skládají pod sebe ve stejném pořadí.
 */
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
    <FieldGrid cols={20}>
      <Field span={4}>
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
      {(["opening", "income", "expense"] as const).map((key) => (
        <Field key={key} label={texts[key]} labelId={`${id}-${key}-label`} span={4}>
          <FieldValue
            aria-labelledby={`${id}-${key}-label`}
            data-bank-statement-value={`bank-statement-${key}`}
            className={cn(
              "justify-end text-right tabular-nums",
              balances[key] < 0 && "text-destructive",
            )}
          >
            {formatAmount(balances[key])}
          </FieldValue>
        </Field>
      ))}
      <BankStatementBankClosing
        id={id}
        bankClosing={value.bankClosing}
        onChange={(bankClosing) => patch({ bankClosing })}
        locked={locked}
        balances={balances}
        symbol={symbol}
        texts={texts}
      />
    </FieldGrid>
  );
}

/** Vnitřní vlastnosti zůstatku na výpise. */
interface BankClosingProps {
  /** Identifikátor pole. */
  id: string;
  /** Zadaný zůstatek z banky; null = Σ z pohybů. */
  bankClosing: number | null;
  /** Změna zůstatku. */
  onChange: (value: number | null) => void;
  /** Zamčená hodnota. */
  locked: boolean;
  /** Součty pohybů. */
  balances: BankStatementBalances;
  /** Značka měny – jen do textu varování rozdílu; pole značku nezobrazují. */
  symbol: string;
  /** Jazykové texty. */
  texts: BankStatementTexts;
}

/**
 * Zůstatek na výpise s přepínačem Σ (vzor Celkem za doklad): Σ zapnuto = konečný zůstatek
 * z pohybů jen ke čtení; vypnuto = zadaný zůstatek z banky. Rozdíl = varování v poli.
 */
export function BankStatementBankClosing({
  id,
  bankClosing,
  onChange,
  locked,
  balances,
  symbol,
  texts: t,
}: BankClosingProps) {
  const closing = statementClosing(balances);
  const sum = bankClosing === null;
  const difference = statementDifference(bankClosing, balances);
  const warning =
    difference === null
      ? undefined
      : t.differenceWarning.replace("{amount}", `${formatAmount(difference)} ${symbol}`);
  return (
    <Field
      label={t.bankClosing}
      htmlFor={sum ? undefined : `${id}-bankClosing`}
      labelId={`${id}-bankClosing-label`}
      span={4}
      warning={warning}
      className="min-w-0"
    >
      <div className="relative min-w-0" data-slot="bank-statement-bank-closing">
        {sum || locked ? (
          <FieldValue
            aria-labelledby={`${id}-bankClosing-label`}
            className="justify-end pr-[var(--field-toggle-space)] text-right font-bold tabular-nums"
          >
            {formatAmount(sum ? closing : bankClosing)}
          </FieldValue>
        ) : (
          <>
            <AmountInput
              id={`${id}-bankClosing`}
              value={bankClosing}
              onChange={(next) => onChange(parseDecimalInput(next))}
              className="pr-[var(--field-toggle-space)] font-bold"
            />
          </>
        )}
        <FieldToggleButton
          icon={Sigma}
          pressed={sum}
          label={t.bankClosingToggle}
          pressedTooltip={t.bankClosingSum}
          unpressedTooltip={t.bankClosingEntered}
          disabled={locked}
          onPressedChange={(pressed) => onChange(pressed ? null : closing)}
        />
      </div>
    </Field>
  );
}

/**
 * @deprecated 2.108.0 – sekce Zůstatky dle pohybů je zrušená; formulář ji nevykresluje.
 * Odstraní se v nejbližší major verzi.
 */
export function BankStatementBalanceSection() {
  return null;
}

/** Vnitřní řízené číslo v identifikačním řádku. */
interface StatementIdentityProps {
  /** Identifikátor vstupu. */
  id: string;
  /** Části identity. */
  items: ReactNode[];
  /** Číslo výpisu. */
  number: string;
  /** Důvod neměnnosti čísla. */
  lockedReason?: string;
  /** Změna čísla. */
  onNumberChange: (number: string) => void;
  /** Přístupný název vstupu. */
  label: string;
}

/** Sdílená identita s číslem výpisu bez duplicitního pole v základních údajích. */
export function BankStatementIdentity({
  id,
  items,
  number,
  lockedReason,
  onNumberChange,
  label,
}: StatementIdentityProps) {
  return (
    <IdentityLine
      data-slot="bank-statement-identity"
      items={items}
      numberContent={
        lockedReason ? (
          <FieldValue
            variant="plain"
            aria-label={label}
            lockedReason={lockedReason}
            className="text-right font-mono text-[length:inherit]! font-bold tabular-nums"
          >
            {number}
          </FieldValue>
        ) : (
          <Input
            id={`${id}-number`}
            aria-label={label}
            value={number}
            onChange={(event) => onNumberChange(event.target.value)}
            className="w-40 max-w-full text-right font-mono text-[length:inherit]! font-bold tabular-nums"
          />
        )
      }
    />
  );
}
