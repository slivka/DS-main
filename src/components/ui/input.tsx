/** Vstup DS; vlastní nativní props a vzor formátu, nesmí přidávat popisnou nápovědu. */
import * as React from "react";

import { cn } from "../../lib/utils";

/** Vlastnosti vstupu včetně krátkého vzoru zápisu (nikoli příkladu hodnoty). */
export interface InputProps extends React.ComponentProps<"input"> {
  /** Krátký vzor formátu prázdného vstupu; text dodává aplikace z DsTexts. */
  formatPattern?: string;
}

/** Vstup s pojmenovanou podporou vzoru formátu. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, formatPattern, placeholder, ...props }, ref) => {
    return (
      <input
        type={type}
        placeholder={formatPattern ?? placeholder}
        className={cn(
          "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 typo-body flex h-[var(--control-h)] w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted/40 disabled:opacity-100",
          className,
        )}
        ref={ref}
        data-control-height="standard"
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
