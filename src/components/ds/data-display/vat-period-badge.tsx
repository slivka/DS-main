/** Období DPH; podané období nahrazuje běžný štítek výstrahou. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { Badge } from "../../ui/badge";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
export interface VatPeriodBadgeProps extends ComponentPropsWithoutRef<"div"> {
  label: string;
  filed?: boolean;
  filedWarning?: string;
}
export const VatPeriodBadge = forwardRef<HTMLDivElement, VatPeriodBadgeProps>(
  function VatPeriodBadge({ label, filed, filedWarning, className, ...props }, ref) {
    const t = useDsTexts();
    return (
      <Badge
        ref={ref}
        {...props}
        variant="outline"
        className={cn(filed && "border-warning bg-warning-soft text-warning-strong", className)}
      >
        {filed ? (filedWarning ?? t.vatReports.changed) : `${t.taxRecords.vatPeriod} · ${label}`}
      </Badge>
    );
  },
);
