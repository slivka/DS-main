import { Label } from "../../ui/label";
import { DecimalInput } from "../form/decimal-input";
import { OptionSelect } from "../form/option-select";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

export type CurrencyOption = { code: string; label?: string };

/** Přepočet částky dokladu do měny účetnictví. */
export function convertAmount(amount: number, rate: number, rateUnit = 1) {
  if (!Number.isFinite(amount) || !Number.isFinite(rate) || rateUnit === 0) return 0;
  return Math.round(((amount * rate) / rateUnit) * 100) / 100;
}

/**
 * Částka v měně dokladu, kurz (6 desetinných míst) a přepočet do měny
 * účetnictví (2 desetinná místa). Vše se předává přes props.
 */
export function CurrencyAmount({
  amount,
  onAmountChange,
  currency,
  onCurrencyChange,
  currencies,
  rate,
  onRateChange,
  rateUnit = 1,
  baseCurrency = "CZK",
  amountLabel = "Částka",
  currencyLabel = "Měna",
  rateLabel = "Kurz",
  baseLabel = "Částka v měně účetnictví",
  disabled,
  readOnly,
  className,
  idPrefix = "currency-amount",
}: {
  amount: number;
  onAmountChange: (value: number) => void;
  currency: string;
  onCurrencyChange?: (code: string) => void;
  currencies?: CurrencyOption[];
  rate: number;
  onRateChange?: (value: number) => void;
  /** Kurz je uveden za tento počet jednotek měny (např. 100 JPY). */
  rateUnit?: number;
  baseCurrency?: string;
  amountLabel?: string;
  currencyLabel?: string;
  rateLabel?: string;
  baseLabel?: string;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  idPrefix?: string;
}) {
  const isBase = currency === baseCurrency;
  const converted = isBase ? amount : convertAmount(amount, rate, rateUnit);

  return (
    <div className={cn("grid gap-3 sm:grid-cols-4", className)}>
      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-amount`}>{amountLabel}</Label>
        <DecimalInput
          id={`${idPrefix}-amount`}
          value={amount}
          onChange={(value) => onAmountChange(Number(value) || 0)}
          decimals={2}
          disabled={disabled || readOnly}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-currency`}>{currencyLabel}</Label>
        {currencies?.length && onCurrencyChange ? (
          <OptionSelect
            id={`${idPrefix}-currency`}
            value={currency}
            onChange={onCurrencyChange}
            allowEmpty={false}
            disabled={disabled || readOnly}
            options={currencies.map((item) => ({
              value: item.code,
              label: item.label ? `${item.code} – ${item.label}` : item.code,
            }))}
          />
        ) : (
          <div
            id={`${idPrefix}-currency`}
            className="flex h-9 items-center rounded-md border bg-muted/40 px-3 font-mono text-sm"
          >
            {currency}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-rate`}>
          {rateUnit === 1 ? rateLabel : `${rateLabel} (${formatAmount(rateUnit, 0)})`}
        </Label>
        <DecimalInput
          id={`${idPrefix}-rate`}
          value={isBase ? 1 : rate}
          onChange={(value) => onRateChange?.(Number(value) || 0)}
          decimals={6}
          disabled={disabled || readOnly || isBase || !onRateChange}
        />
      </div>

      <div className="flex flex-col gap-1">
        <Label htmlFor={`${idPrefix}-base`}>{`${baseLabel} (${baseCurrency})`}</Label>
        <output
          id={`${idPrefix}-base`}
          className="flex h-9 items-center justify-end rounded-md border bg-muted/40 px-3 font-sans text-sm tabular-nums"
        >
          {formatAmount(converted, 2)}
        </output>
      </div>
    </div>
  );
}
