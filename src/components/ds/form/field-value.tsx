import * as React from "react";
import { Lock } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";

export interface FieldValueProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Volitelný obsah zarovnaný vpravo, typicky ikonová akce. */
  trailing?: React.ReactNode;
  /** Vzhled hodnoty: `field` odpovídá poli formuláře, `plain` je bez podkladu. */
  variant?: "field" | "plain";
  /** Důvod, proč hodnotu nelze po založení změnit. */
  lockedReason?: string;
}

/** Jednořádková hodnota jen ke čtení ve stejné výšce jako vstupní pole. */
export const FieldValue = React.forwardRef<HTMLDivElement, FieldValueProps>(function FieldValue(
  { children, trailing, variant = "field", lockedReason, className, title, ...props },
  ref,
) {
  const resolvedTitle = title ?? (typeof children === "string" ? children : undefined);
  return (
    <div
      ref={ref}
      data-slot="field-value"
      data-control-height="standard"
      className={cn(
        "typo-body flex h-[var(--control-h)] min-w-0 items-center gap-2 text-sm",
        variant === "field" && "rounded-md bg-muted px-2.5",
        className,
      )}
      title={resolvedTitle}
      {...props}
    >
      <div className="min-w-0 flex-1 truncate whitespace-nowrap">{children}</div>
      {lockedReason ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span tabIndex={0} aria-label={lockedReason} className="shrink-0 text-muted-foreground">
              <Lock className="size-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent>{lockedReason}</TooltipContent>
        </Tooltip>
      ) : null}
      {trailing ? (
        <div data-slot="field-value-trailing" className="flex shrink-0 items-center">
          {trailing}
        </div>
      ) : null}
    </div>
  );
});
