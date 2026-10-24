/** Kontroly výkazu · zobrazuje stav od APP · nesmí kontroly vyhodnocovat. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { AmountCell } from "../accounting/amount";
import type { StatementCheck } from "./statement-types";

/** Parametry pruhu kontrol. */
export interface StatementChecksBarProps extends ComponentPropsWithoutRef<"div"> {
  /** Stavy kontrol od APP. */
  checks: StatementCheck[];
  /** Počet desetinných míst rozdílu. */
  decimals?: number;
}

/** Pruh „Aktiva = Pasiva“ a „HV rozvaha = HV výsledovka“. */
export const StatementChecksBar = forwardRef<HTMLDivElement, StatementChecksBarProps>(
  function StatementChecksBar({ checks, decimals = 2, className, ...props }, ref) {
    const t = useDsTexts().statements;
    if (!checks.length) return null;
    return (
      <div
        ref={ref}
        role="group"
        aria-label={t.checksLabel}
        data-slot="statement-checks"
        {...props}
        className={cn("flex flex-wrap gap-2 text-sm", className)}
      >
        {checks.map((check) => (
          <div
            key={check.kind}
            data-check={check.kind}
            data-ok={check.ok}
            className={cn(
              "flex items-center gap-2 rounded-md border px-3 py-1",
              check.ok
                ? "border-success/40 bg-success/10 text-success"
                : "border-destructive/40 bg-destructive/10 text-destructive",
            )}
          >
            <span className="font-medium">{t.checks[check.kind]}</span>
            <span>{check.ok ? t.checkOk : t.checkFailed}</span>
            {!check.ok && check.difference != null ? (
              <span className="flex items-center gap-1">
                {t.difference}: <AmountCell value={check.difference} decimals={decimals} />
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  },
);
