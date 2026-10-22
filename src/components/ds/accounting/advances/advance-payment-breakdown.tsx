/** Rozpad platby · vlastní dvě prezentační roviny · nesmí počítat ani měnit účetní párování. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../../ds-texts";
import { formatAmount } from "../../../../lib/format";
import { cn } from "../../../../lib/utils";
import { Button } from "../../../ui/button";
import { DisabledReasonTooltip } from "../../feedback/disabled-reason-tooltip";
import { LinkedRecordsPanel } from "../../data-display/linked-records-panel";
import { StatusBadge } from "../../data-display/status-badge";
import { TooltipProvider } from "../../../ui/tooltip";
import type { AdvanceCommand, AdvancePaymentPlane, AdvancePaymentTotals, AdvanceTaxStatus } from "./advance-types";
/** Řízené akce zálohy; otevření postupů zajišťuje APP. */
export interface AdvancePaymentActions {
  /** Přiřazení ZL. */ assignList?: AdvanceCommand;
  /** Storno zbytku s důvodem. */ cancelRemainder?: AdvanceCommand;
  /** Vystavení DD. */ issueTaxDocument?: AdvanceCommand;
  /** Otevření AdvanceReasonDialog. */ markNoTaxDocument?: AdvanceCommand;
}
/** Dvě roviny zmapované platby zálohy. */
export interface AdvancePaymentBreakdownProps extends ComponentPropsWithoutRef<"div"> {
  /** Souhrn jedné měny. */ totals: AdvancePaymentTotals;
  /** Značka měny. */ currency: string;
  /** Roviny ZL a DD používají SettlementBar uvnitř LinkedRecordsPanel. */ planes: {
    lists: AdvancePaymentPlane;
    taxDocuments: AdvancePaymentPlane;
  };
  /** Akce a oprávnění. */ actions?: AdvancePaymentActions;
  /** Stav DD z APP. */ taxStatus: AdvanceTaxStatus;
  /** Lhůta i překročení vypočtené APP. */ deadline: {
    days: number;
    label: string;
    overdue: boolean;
    warning?: string;
  };
}
/** Rozpad platby bez vlastní evidence vazeb a výpočtů. */
export const AdvancePaymentBreakdown = forwardRef<HTMLDivElement, AdvancePaymentBreakdownProps>(
  function AdvancePaymentBreakdown(
    { totals, currency, planes, actions = {}, taxStatus, deadline, className, ...props },
    ref,
  ) {
    const t = useDsTexts().advances;
    const keys: (keyof AdvancePaymentTotals)[] = [
      "amount",
      "listAmount",
      "cancelled",
      "withoutList",
      "taxAmount",
      "noTaxDocument",
      "withoutTaxDocument",
      "deducted",
      "refunded",
      "remaining",
    ];
    const command = (key: keyof AdvancePaymentActions) => {
      const action = actions[key];
      return action ? (
        <DisabledReasonTooltip
          key={key}
          blocked={!action.can}
          content={!action.can ? (action.reason ?? t.blocked) : undefined}
        >
          <Button
            type="button"
            variant="outline"
            aria-disabled={!action.can}
            onClick={() => {
              if (action.can) action.onClick();
            }}
          >
            {t[key]}
          </Button>
        </DisabledReasonTooltip>
      ) : null;
    };
    return (
      <TooltipProvider>
        <div ref={ref} className={cn("min-w-0 space-y-4", className)} {...props}>
          <h3 className="truncate text-base font-semibold" title={t.breakdown}>
            {t.breakdown}
          </h3>
          <dl className="grid grid-cols-2 gap-3 @lg:grid-cols-5">
            {keys.map((key) => (
              <div key={key} className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground" title={t[key]}>
                  {t[key]}
                </dt>
                <dd
                  className={cn(
                    "whitespace-nowrap text-sm font-mono tabular-nums",
                    totals[key] < 0 && "text-destructive",
                  )}
                >
                  {formatAmount(totals[key])} {currency}
                </dd>
              </div>
            ))}
          </dl>
          <section className="min-w-0 border-t pt-3">
            <h4 className="mb-2 text-sm font-semibold">{t.lists}</h4>
            <LinkedRecordsPanel {...planes.lists.links} settlement={planes.lists.settlement} />
            <div className="mt-2 flex flex-wrap gap-2">
              {command("assignList")}
              {command("cancelRemainder")}
            </div>
          </section>
          <section className="min-w-0 border-t pt-3">
            <div className="mb-2 flex min-w-0 flex-wrap items-center gap-2">
              <h4 className="text-sm font-semibold">{t.taxDocuments}</h4>
              <StatusBadge
                status={taxStatus}
                config={{
                  missing: { label: t.missing, tone: "warning" },
                  partial: { label: t.partial, tone: "warning" },
                  issued: { label: t.issued, tone: "success" },
                  notIssued: { label: t.notIssued, tone: "neutral" },
                }}
              />
            </div>
            <LinkedRecordsPanel
              {...planes.taxDocuments.links}
              settlement={planes.taxDocuments.settlement}
            />
            <p
              role={deadline.overdue ? "alert" : "status"}
              className={cn(
                "my-2 text-sm",
                deadline.overdue ? "text-warning-foreground" : "text-muted-foreground",
              )}
              title={deadline.warning}
            >
              {t.deadlineDays(deadline.days)} · {deadline.label}
              {deadline.overdue ? ` · ${deadline.warning ?? t.overdue}` : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {command("issueTaxDocument")}
              {command("markNoTaxDocument")}
            </div>
          </section>
        </div>
      </TooltipProvider>
    );
  },
);
