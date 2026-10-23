/** Vstup DS; vlastní nativní props a vzor formátu, nesmí přidávat popisnou nápovědu. */
import * as React from "react";

import { cn } from "../../lib/utils";
import { ReadOnlyControlValue, useRecordReadOnly } from "../ds/form/record-read-only";
import {
  FieldFeedbackIndicator,
  FieldSuggestionIndicator,
  useFieldFeedback,
  type FieldSuggestion,
} from "../ds/form/field-feedback";

/** Vlastnosti vstupu včetně krátkého vzoru zápisu (nikoli příkladu hodnoty). */
export interface InputProps extends React.ComponentProps<"input"> {
  /** Krátký vzor formátu prázdného vstupu; text dodává aplikace z DsTexts. */
  formatPattern?: string;
  /** Chyba v rámečku a tooltipu uvnitř pole. */
  error?: string;
  /** Varování v rámečku a tooltipu uvnitř pole. */
  warning?: string;
  /** Návrh hodnoty z vytěžení; zobrazí se jen bez chyby a varování. */
  suggestion?: FieldSuggestion;
}

/** Vstup s pojmenovanou podporou vzoru formátu. */
const InputControl = React.forwardRef<HTMLInputElement, InputProps>((allProps, ref) => {
  const { className, type, formatPattern, placeholder, error, warning, suggestion, ...props } =
    allProps;
  // Předaný (i prázdný) error/warning drží stálý obal, aby se vstup při objevení
  // výstrahy znovu nepřipojil a neztratil fokus.
  const feedbackSlot = "error" in allProps || "warning" in allProps || "suggestion" in allProps;
  const inherited = useFieldFeedback();
  const invalid = error || inherited.error;
  const attention = warning || inherited.warning;
  // Návrh se vykreslí jen u čistého pole; vlastní prop má přednost před obalem.
  const activeSuggestion =
    !invalid && !attention ? (suggestion ?? inherited.suggestion) : undefined;
  const control = (
    <input
      type={type}
      placeholder={formatPattern ?? placeholder}
      className={cn(
        "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 typo-body flex h-[var(--control-h)] w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed",
        className,
        invalid
          ? "border-destructive"
          : attention || activeSuggestion?.uncertain
            ? "border-warning"
            : undefined,
        activeSuggestion && !activeSuggestion.uncertain && "bg-suggestion-soft",
        (error || warning || activeSuggestion?.uncertain) && "pr-9",
      )}
      ref={ref}
      data-control-height="standard"
      data-suggestion={
        suggestion ? (activeSuggestion?.uncertain ? "uncertain" : "suggested") : undefined
      }
      {...props}
      aria-invalid={invalid ? true : props["aria-invalid"]}
    />
  );
  return feedbackSlot || error || warning ? (
    <span className="relative block min-w-0">
      {control}
      <FieldFeedbackIndicator error={error} warning={warning} />
      <FieldSuggestionIndicator suggestion={activeSuggestion} />
    </span>
  ) : (
    control
  );
});
InputControl.displayName = "InputControl";

/** Typy, které jsou hodnotou záznamu; `search`, `hidden`, `file` aj. zůstávají ovládáním. */
const VALUE_TYPES = new Set(["text", "email", "tel", "url", "number", "password"]);
/** Maska hesla v režimu jen pro čtení – heslo se nikdy nezobrazí. */
const PASSWORD_MASK = "••••";

/** Vrací `true`, pokud se vstup daného typu v režimu jen pro čtení vykreslí jako hodnota. */
export function isReadOnlyValueInputType(type: string | undefined): boolean {
  return type === undefined || VALUE_TYPES.has(type);
}

/** Vstup DS; v RecordDialog jen pro čtení se textový vstup vykreslí jako hodnota pole. */
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const readOnly = useRecordReadOnly();
  if (readOnly && isReadOnlyValueInputType(props.type)) {
    const raw = String(props.value ?? props.defaultValue ?? "");
    return (
      <ReadOnlyControlValue id={props.id} numeric={props.type === "number"}>
        {props.type === "password" && raw ? PASSWORD_MASK : raw}
      </ReadOnlyControlValue>
    );
  }
  return <InputControl ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
