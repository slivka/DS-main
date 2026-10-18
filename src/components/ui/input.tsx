/** Vstup DS; vlastní nativní props a vzor formátu, nesmí přidávat popisnou nápovědu. */
import * as React from "react";

import { cn } from "../../lib/utils";
import { FieldFeedbackIndicator, useFieldFeedback } from "../ds/form/field-feedback";

/** Vlastnosti vstupu včetně krátkého vzoru zápisu (nikoli příkladu hodnoty). */
export interface InputProps extends React.ComponentProps<"input"> {
  /** Krátký vzor formátu prázdného vstupu; text dodává aplikace z DsTexts. */
  formatPattern?: string;
  /** Chyba v rámečku a tooltipu uvnitř pole. */
  error?: string;
  /** Varování v rámečku a tooltipu uvnitř pole. */
  warning?: string;
}

/** Vstup s pojmenovanou podporou vzoru formátu. */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (allProps, ref) => {
    const { className, type, formatPattern, placeholder, error, warning, ...props } = allProps;
    // Předaný (i prázdný) error/warning drží stálý obal, aby se vstup při objevení
    // výstrahy znovu nepřipojil a neztratil fokus.
    const feedbackSlot = "error" in allProps || "warning" in allProps;
    const inherited = useFieldFeedback();
    const invalid = error || inherited.error;
    const attention = warning || inherited.warning;
    const control = (
      <input
        type={type}
        placeholder={formatPattern ?? placeholder}
        className={cn(
          "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 typo-body flex h-[var(--control-h)] w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed",
          className,
          invalid ? "border-destructive" : attention ? "border-warning" : undefined,
          (error || warning) && "pr-9",
        )}
        ref={ref}
        data-control-height="standard"
        {...props}
        aria-invalid={invalid ? true : props["aria-invalid"]}
      />
    );
    return feedbackSlot || error || warning ? (
      <span className="relative block min-w-0">
        {control}
        <FieldFeedbackIndicator error={error} warning={warning} />
      </span>
    ) : (
      control
    );
  },
);
Input.displayName = "Input";

export { Input };
