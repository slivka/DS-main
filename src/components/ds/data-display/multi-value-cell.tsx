/** Více hodnot · vlastní kompaktní buňku a bublinu · nesmí odvozovat doménové vazby. */
import * as React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Hodnota obecné buňky. */
export interface MultiValueItem {
  /** Název hodnoty. */
  label: string;
  /** Ztlumená ukončená hodnota. */
  inactive?: boolean;
}
/** Props buňky s více hodnotami. */
export interface MultiValueCellProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Hodnoty v pořadí aplikace. */
  values: MultiValueItem[];
  /** Další hodnoty mimo zobrazený seznam. */
  additionalCount?: number;
  /** Kompaktní nebo všechny hodnoty. */
  variant?: "compact" | "all";
}
/** První hodnota a + další; plný seznam je dostupný myší i klávesnicí. */
export const MultiValueCell = React.forwardRef<HTMLSpanElement, MultiValueCellProps>(function MultiValueCell(
  { values, additionalCount = 0, variant = "compact", className, ...props }, ref,
) {
  const t = useDsTexts().dimensions;
  const count = Math.max(0, values.length - 1) + additionalCount;
  const label = variant === "all" ? values.map((item) => item.label).join(", ") : values[0]?.label ?? "";
  return <Tooltip><TooltipTrigger asChild><span ref={ref} tabIndex={0} {...props}
    className={cn("inline-flex max-w-full min-w-0 items-center gap-1", values[0]?.inactive && "text-muted-foreground", className)}>
    <span className="truncate">{label}</span>{variant === "compact" && count > 0 ? <span className="shrink-0 text-muted-foreground">{t.more}</span> : null}
  </span></TooltipTrigger><TooltipContent>{values.map((item, index) => <div key={index}>{item.label}{item.inactive ? ` · ${t.ended}` : ""}</div>)}</TooltipContent></Tooltip>;
});
