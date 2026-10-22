/** Sdílené pole rozbalení řádku; stav nemění geometrii. */
import type * as React from "react";
import { cn } from "../../../lib/utils";
import { Label } from "../../ui/label";
import { FieldFeedbackContext, FieldFeedbackIndicator, useFieldStatus } from "../form/field-feedback";

/**
 * Popsané pole detailu: popisek nahoře, prvek pod ním, nic dalšího. Chyba i varování jsou
 * rámeček a ⚠ uvnitř pole s bublinou (čísla vlevo); plný text jde do pruhu formuláře.
 */
export function DetailField({
  label,
  width,
  error,
  warning,
  numeric,
  fieldKey,
  children,
  labelFeedback,
}: {
  /** Klíč `rowId:columnId` pro fokus ze souhrnu chyb. */
  fieldKey?: string;
  label: string;
  width: string;
  error?: string;
  warning?: string;
  numeric?: boolean;
  children: React.ReactNode;
  /** Stav prvku bez místa uvnitř patří k popisku. */
  labelFeedback?: boolean;
}) {
  const status = useFieldStatus({ error, warning });
  return (
    <div
      className={cn("flex min-w-0 flex-col gap-1", width)}
      data-slot="journal-detail-field"
      data-journal-field={fieldKey}
    >
      <span className="flex min-w-0 items-center gap-1">
        <Label
          title={label}
          className={cn(
            "min-w-0 truncate whitespace-nowrap text-xs",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {label}
        </Label>
        {labelFeedback ? (
          <FieldFeedbackIndicator error={error} warning={warning} placement="label" />
        ) : null}
      </span>
      <FieldFeedbackContext.Provider value={{}}>
        <div
          data-feedback={status.tone}
          aria-invalid={status.controlProps["aria-invalid"]}
          aria-describedby={status.describedById}
          className={cn(
            "relative h-[var(--control-h)] min-w-0 [--field-feedback-offset:1.5em]",
            status.tone &&
              (numeric
                ? "[&_input]:pl-[1.75em]!"
                : "[&_input]:pr-[1.75em]! [&_[role=combobox]]:pr-[2.75em]!"),
            status.tone &&
              "[&_input]:ring-1 [&_[role=combobox]]:ring-1 [&_[role=radiogroup]]:ring-1",
            error &&
              "[&_input]:border-destructive [&_[role=combobox]]:border-destructive [&_[role=radiogroup]]:border-destructive [&_input]:ring-destructive [&_[role=combobox]]:ring-destructive [&_[role=radiogroup]]:ring-destructive",
            !error &&
              warning &&
              "[&_input]:border-warning-strong [&_[role=combobox]]:border-warning-strong [&_[role=radiogroup]]:border-warning-strong [&_input]:ring-warning-strong [&_[role=combobox]]:ring-warning-strong [&_[role=radiogroup]]:ring-warning-strong",
          )}
        >
          {children}
          {!labelFeedback ? (
            <FieldFeedbackIndicator
              error={error}
              warning={warning}
              side={numeric ? "start" : "end"}
              id={status.describedById}
            />
          ) : null}
        </div>
      </FieldFeedbackContext.Provider>
    </div>
  );
}
