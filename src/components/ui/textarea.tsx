/** Víceřádkové pole · vlastní nativní vstup a stav u popisku · nesmí kreslit zprávu pod polem. */
import { ReadOnlyControlValue, useRecordReadOnly } from "../ds/form/record-read-only";
import * as React from "react";

import { cn } from "../../lib/utils";

import { FieldFeedbackIndicator, useFieldStatus } from "../ds/form/field-feedback";
import { Field } from "../ds/layout/form-field-layout";

/** Vlastnosti víceřádkového vstupu. */
export interface TextareaProps extends React.ComponentPropsWithoutRef<"textarea"> {
  /** Chyba má přednost před varováním. */
  error?: string;
  /** Nezabraňující upozornění. */
  warning?: string;
  /** Popisek a místo pro ikonu stavu. */
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, warning, label, ...props }, ref) => {
    const status = useFieldStatus({ error, warning });
    const readOnly = useRecordReadOnly();
    const control = readOnly ? (
      <ReadOnlyControlValue id={props.id} multiline>
        {String(props.value ?? props.defaultValue ?? "")}
      </ReadOnlyControlValue>
    ) : (
      <textarea
        className={cn(
          "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 typo-body flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-100",
          className,
          status.className,
        )}
        ref={ref}
        {...props}
        {...status.controlProps}
      />
    );
    return (
      <>
        {label ? (
          <Field
            htmlFor={props.id}
            label={
              <>
                <span title={label} className={cn("min-w-0 truncate", error && "text-destructive")}>
                  {label}
                </span>
                <FieldFeedbackIndicator error={error} warning={warning} placement="label" />
              </>
            }
          >
            {control}
          </Field>
        ) : (
          control
        )}
        <span id={status.describedById} className="sr-only">
          {status.message}
        </span>
      </>
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
