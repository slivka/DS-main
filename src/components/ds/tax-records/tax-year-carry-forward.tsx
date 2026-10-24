/** Převod do dalšího roku DE: stav a akce z APP. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Button } from "../../ui/button";
import { StatusBadge, type StatusConfig } from "../data-display/status-badge";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { TaxCarryForwardStatus } from "./tax-record-types";
export interface TaxYearCarryForwardProps extends ComponentPropsWithoutRef<"div"> {
  fromYear: number;
  status: TaxCarryForwardStatus;
  onCarryForward?: () => void;
  disabledReason?: string;
  busy?: boolean;
}
export const TaxYearCarryForward = forwardRef<HTMLDivElement, TaxYearCarryForwardProps>(
  function TaxYearCarryForward(
    { fromYear, status, onCarryForward, disabledReason, busy, className, ...props },
    ref,
  ) {
    const t = useDsTexts().taxYear;
    const s = t.carryForwardStatus;
    const config: StatusConfig<TaxCarryForwardStatus> = {
      not_started: { label: s.not_started, tone: "neutral" },
      ready: { label: s.ready, tone: "info" },
      done: { label: s.done, tone: "success" },
      blocked: { label: s.blocked, tone: "danger" },
    };
    const blocked = status === "blocked" || Boolean(disabledReason);
    const disabled = blocked || status === "done" || busy;
    return (
      <div
        ref={ref}
        {...props}
        className={cn("flex min-w-0 flex-wrap items-center gap-3", className)}
      >
        <span className="text-sm font-medium">
          {t.carryForward} {fromYear} → {fromYear + 1}
        </span>
        <StatusBadge status={status} config={config} />
        {status === "done" ? null : (
          <DisabledReasonTooltip blocked={blocked} content={disabledReason}>
            <Button
              variant="outline"
              aria-disabled={disabled || undefined}
              onClick={() => {
                if (!disabled) onCarryForward?.();
              }}
            >
              {t.carryForwardAction}
            </Button>
          </DisabledReasonTooltip>
        )}
      </div>
    );
  },
);
