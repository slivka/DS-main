/** Rozdíl částek · vlastní společný stav rozepsání · nesmí dopočítávat ani měnit data. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/utils";
import { formatAmount } from "../../../lib/format";

/** Vlastnosti společného rozdílu dokladu a výpisu. */
export interface AmountDifferenceProps extends ComponentPropsWithoutRef<"span"> {
  /** Rozdíl v měně dokladu. */
  value: number;
  /** Popisek nenulového rozdílu z jazykové sady. */
  label: string;
  /** Popisek záporného rozdílu (rozpis převyšuje částku); jinak `label`. */
  overLabel?: string;
  /**
   * @deprecated 2.108.0 – nulový rozdíl se nevykresluje vůbec (rozhodnutí 18. 10.); ignorováno.
   * Odstraní se v nejbližší major verzi.
   */
  balancedLabel?: string;
  /** Značka měny dodaná aplikací. */
  currencySymbol?: string;
}

/** Nenulový rozdíl (nula = nic) se stejnými tokeny v editoru řádků i výpisu. */
export const AmountDifference = forwardRef<HTMLSpanElement, AmountDifferenceProps>(
  function AmountDifference(
    { value, label, overLabel, balancedLabel: _balancedLabel, currencySymbol, className, ...props },
    ref,
  ) {
    if (value === 0) return null;
    return (
      <span
        ref={ref}
        data-slot="amount-difference"
        className={cn(
          "inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold tabular-nums",
          "bg-destructive-soft text-destructive-strong",
          className,
        )}
        {...props}
      >
        {`${value < 0 && overLabel ? overLabel : label} ${formatAmount(Math.abs(value), 2)}`}
        {currencySymbol ? ` ${currencySymbol}` : null}
      </span>
    );
  },
);
