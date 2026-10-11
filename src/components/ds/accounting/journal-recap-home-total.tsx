/** Celek dokladu v domácí měně; vlastní přepočet, nesčítá účetní strany. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "./document-form/document-form-types";
import { convertAmount } from "./currency-amount";
import { formatAmount } from "../../../lib/format";
export interface JournalRecapHomeTotalProps extends ComponentPropsWithoutRef<"span"> {
  /** Celek v měně dokladu. */
  total: number;
  /** Přepis popisku formuláře, včetně tokenu {symbol}. */
  labelTemplate?: string;
  /** Kurz dokladu. */
  rate?: number | null;
  /** Počet jednotek kurzu. */
  rateAmount?: number;
  /** Značka domácí měny z dat. */
  symbol: string;
}
/** Tučný přepočet celku v záhlaví rekapitulace. */
export const JournalRecapHomeTotal = forwardRef<HTMLSpanElement, JournalRecapHomeTotalProps>(
  function JournalRecapHomeTotal(
    { total, rate, rateAmount = 1, symbol, labelTemplate, className, children, ...props },
    ref,
  ) {
    const texts = useDsTexts().documentForm;
    const label = (labelTemplate ?? texts.totalHome ?? DEFAULT_DOCUMENT_FORM_TEXTS.totalHome).replace(
      "{symbol}",
      symbol,
    );
    const amount = rate == null || !Number.isFinite(rate) || rate <= 0
      ? "—"
      : formatAmount(convertAmount(total, rate, rateAmount), 2);
    return (
      <span
        {...props}
        ref={ref}
        data-slot="journal-recap-home-total"
        className={cn(
          "mx-2 flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-bold tabular-nums",
          className,
        )}
        title={label}
        aria-label={`${label}: ${amount}`}
      >
        <span className="hidden @min-[48rem]:inline">{label}:</span>
        <span className="@min-[48rem]:hidden">{symbol}:</span>
        <span>
          {amount}
        </span>
        {children}
      </span>
    );
  },
);
