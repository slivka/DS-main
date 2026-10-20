/** Souhrn vypořádání · vlastní zobrazení · částky ani měny nepočítá. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Progress } from "../../ui/progress";
import { TruncatedText } from "./truncated-text";
import type { SettlementRow } from "./linked-record-types";

export interface SettlementBarProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** Jeden řádek na měnu, částky již formátované aplikací. */
  rows: SettlementRow[];
}
/** Úhrada nebo zúčtování s progresním pruhem pro každou měnu zvlášť. */
export const SettlementBar = forwardRef<HTMLDivElement, SettlementBarProps>(function SettlementBar(
  { rows, className, ...props }, ref,
) {
  const texts = useDsTexts().linkedRecords;
  return (
    <div ref={ref} className={cn("min-w-0 space-y-3", className)} {...props}>
      {rows.map(row => {
        const text = `${row.label} ${row.settled} ${texts.of} ${row.total} ${row.currency} – ${texts.remaining} ${row.remaining}`;
        return <div key={row.id} className="min-w-0 space-y-1" data-settlement={row.id}>
          <TruncatedText text={text} className="text-sm font-medium" />
          <Progress value={Math.max(0, Math.min(100, row.progress))} aria-label={text} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0, Math.min(100, row.progress))} />
        </div>;
      })}
    </div>
  );
});
