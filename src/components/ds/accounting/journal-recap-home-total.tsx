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
    { total, rate, rateAmount = 1, symbol, className, children, ...props },
    ref,
  ) {
    const texts = useDsTexts().documentForm;
    const label = (texts.totalHome ?? DEFAULT_DOCUMENT_FORM_TEXTS.totalHome).replace(
      "{symbol}",
      symbol,
    );
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
      >
        <span className="hidden @min-[48rem]:inline">{label}:</span>
        <span className="@min-[48rem]:hidden">{symbol}:</span>
        <span>
          {rate == null || !Number.isFinite(rate) || rate <= 0
            ? "—"
            : formatAmount(convertAmount(total, rate, rateAmount), 2)}
        </span>
        {children}
      </span>
    );
  },
);
