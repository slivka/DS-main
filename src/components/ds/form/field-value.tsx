/** Hodnota pole · vlastní čtený obsah a důvod zamčení · nesmí měnit hodnotu. */
import * as React from "react";
import { Lock } from "lucide-react";

import { cn } from "../../../lib/utils";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { Button } from "../../ui/button";

/** Vlastnosti hodnoty pouze ke čtení. */
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
      role="group"
      data-slot="field-value"
      data-control-height="standard"
      className={cn(
        "typo-body flex h-[var(--control-h)] min-w-0 items-center gap-2 text-sm",
        variant === "field" && "rounded-md bg-muted px-2.5",
        className,
      )}
      title={resolvedTitle || undefined}
      {...props}
    >
      <div className="min-w-0 flex-1 truncate whitespace-nowrap">{children}</div>
      {lockedReason ? (
        <DisabledReasonTooltip content={lockedReason} blocked>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-slot="field-value-lock"
            aria-label={lockedReason}
            className="size-4 shrink-0 p-0 text-muted-foreground"
          >
            <Lock className="size-4" aria-hidden="true" />
          </Button>
        </DisabledReasonTooltip>
      ) : null}
      {trailing ? (
        <div data-slot="field-value-trailing" className="flex shrink-0 items-center">
          {trailing}
        </div>
      ) : null}
    </div>
  );
});
