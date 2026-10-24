/** Uzavření roku DE: kontroly z APP → potvrzení → výsledek. Bez účetních kroků, DS nic nezpracovává. */
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
import { CheckList } from "../feedback/check-list";
import { NoticeBar } from "../feedback/notice-bar";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { SectionHeading } from "../layout/section-heading";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { TaxYearCheck } from "./tax-record-types";
export interface TaxYearCloseWizardProps extends ComponentPropsWithoutRef<"div"> {
  year: number;
  checks: TaxYearCheck[];
  onCloseYear: () => void;
  busy?: boolean;
  result?: { status: "success" | "error"; message?: string } | null;
}
export function taxYearCloseBlocked(checks: readonly TaxYearCheck[]) {
  return checks.some((c) => c.severity === "blocking");
}
export const TaxYearCloseWizard = forwardRef<HTMLDivElement, TaxYearCloseWizardProps>(
  function TaxYearCloseWizard(
    { year, checks, onCloseYear, busy, result, className, ...props },
    ref,
  ) {
    const t = useDsTexts().taxYear;
    const [confirmed, setConfirmed] = useState(false);
    const blocked = taxYearCloseBlocked(checks);
    const disabled = blocked || !confirmed || busy;
    return (
      <div ref={ref} {...props} className={cn("min-w-0 space-y-4", className)}>
        <h2 className="typo-title text-lg font-semibold">
          {t.yearClose} {year}
        </h2>
        <section>
          <SectionHeading>{t.checks}</SectionHeading>
          <CheckList
            items={checks.map((c) => ({
              id: c.id,
              title: c.title,
              detail: c.detail,
              severity: c.severity === "blocking" ? "error" : c.severity,
              action:
                c.onAction && c.actionLabel
                  ? { label: c.actionLabel, onClick: c.onAction }
                  : undefined,
            }))}
          />
        </section>
        {result ? (
          <section>
            <SectionHeading>{t.result}</SectionHeading>
            <NoticeBar tone={result.status === "success" ? "success" : "danger"}>
              {result.message ?? (result.status === "success" ? t.resultSuccess : t.resultError)}
            </NoticeBar>
          </section>
        ) : (
          <section className="space-y-3">
            <SectionHeading>{t.confirm}</SectionHeading>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={confirmed}
                disabled={blocked}
                onCheckedChange={(v) => setConfirmed(v === true)}
              />
              {t.confirmLabel}
            </label>
            <DisabledReasonTooltip
              blocked={blocked}
              content={blocked ? t.blockedReason : undefined}
            >
              <Button
                aria-disabled={disabled || undefined}
                onClick={() => {
                  if (!disabled) onCloseYear();
                }}
              >
                {t.closeYear}
              </Button>
            </DisabledReasonTooltip>
          </section>
        )}
      </div>
    );
  },
);
