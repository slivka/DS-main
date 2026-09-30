import * as React from "react";

import { cn } from "../../../lib/utils";

export interface FieldValueProps extends React.ComponentPropsWithoutRef<"div"> {
  /** Volitelný obsah zarovnaný vpravo, typicky ikonová akce. */
  trailing?: React.ReactNode;
}

/** Hodnota jen ke čtení zarovnaná stejně jako vstupní pole, ale bez jeho rámečku. */
export const FieldValue = React.forwardRef<HTMLDivElement, FieldValueProps>(function FieldValue(
  { children, trailing, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="field-value"
      className={cn("typo-body flex h-9 min-w-0 items-center gap-2 text-sm", className)}
      {...props}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {trailing ? (
        <div data-slot="field-value-trailing" className="flex shrink-0 items-center">
          {trailing}
        </div>
      ) : null}
    </div>
  );
});
