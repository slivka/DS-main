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
  /** Popisek vyrovnaného dokladu; výpis nulový rozdíl nevykresluje. */
  balancedLabel?: string;
  /** Značka měny dodaná aplikací. */
  currencySymbol?: string;
}

/** Stav rozdílu se stejnými tokeny v editoru řádků i výpisu. */
export const AmountDifference = forwardRef<HTMLSpanElement, AmountDifferenceProps>(
  function AmountDifference(
    { value, label, balancedLabel, currencySymbol, className, ...props },
    ref,
  ) {
    return (
      <span
        ref={ref}
        data-slot="amount-difference"
        className={cn(
          "inline-flex h-8 items-center rounded-md px-2 text-xs font-semibold tabular-nums",
          value === 0
            ? "bg-success-soft text-success-strong"
            : "bg-destructive-soft text-destructive-strong",
          className,
        )}
        {...props}
      >
        {value === 0 ? `✓ ${balancedLabel ?? label}` : `${label} ${formatAmount(value, 2)}`}
        {value !== 0 && currencySymbol ? ` ${currencySymbol}` : null}
      </span>
    );
  },
);
