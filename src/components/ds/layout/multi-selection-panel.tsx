/** Hromadný výběr · vlastní souhrn a slot · nesmí provádět hromadné akce. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { fmtAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
/** Vlastnosti souhrnu výběru. */
export interface MultiSelectionPanelProps extends ComponentPropsWithoutRef<"section"> {
  /** Počet vybraných řádků. */
  count: number;
  /** Vlastní nadpis pro jinou doménu. */
  label?: (count: string) => string;
}
/** Souhrn více záznamů; children obsahuje hromadnou akci aplikace. */
export const MultiSelectionPanel = forwardRef<HTMLElement, MultiSelectionPanelProps>(
  function MultiSelectionPanel({ count, label, children, className, ...props }, ref) {
    const texts = useDsTexts();
    return (
      <section ref={ref} {...props} className={cn("space-y-3 p-4", className)}>
        <h3 className="truncate text-sm font-semibold">
          {(label ?? texts.recordPanel.selected)(fmtAmount(count, 0))}
        </h3>
        {children}
      </section>
    );
  },
);
