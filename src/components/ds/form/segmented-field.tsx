/** Segmentová volba · vlastní výběr a stav pole · nesmí měnit výšku při chybě. */
import { ReadOnlyControlValue, useRecordReadOnly } from "./record-read-only";
import * as React from "react";

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { Field } from "../layout/RecordDialog";
import { FieldFeedbackIndicator, useFieldStatus } from "./field-feedback";

/** Jedna pojmenovaná volba skupiny. */
export interface SegmentedFieldOption<Value extends string = string> {
  /** Stabilní hodnota. */
  value: Value;
  /** Text volby. */
  label: React.ReactNode;
}

/** Vlastnosti segmentového pole. */
export interface SegmentedFieldProps<Value extends string = string> extends Omit<
  React.ComponentPropsWithoutRef<"div">,
  "defaultValue" | "onChange"
> {
  /** Nabízené volby. */
  options: SegmentedFieldOption<Value>[];
  /** Vybraná hodnota. */
  value: Value;
  /** Změna vybrané hodnoty. */
  onChange: (value: Value) => void;
  /** Zakázané ovládání. */
  disabled?: boolean;
  /** Volitelný viditelný popisek; bez něj použijte `ariaLabel`. */
  label?: string;
  /** Přístupný název bez viditelného popisku. */
  ariaLabel?: string;
  /** Chyba pole; má přednost před varováním. */
  error?: string;
  /** Varování bez změny výšky. */
  warning?: string;
  /** Ref na skupinu voleb. */
  ref?: React.Ref<HTMLDivElement>;
}

/** Další volba pro ovládání šipkami. */
export function nextSegmentedFieldValue<Value extends string>(
  options: SegmentedFieldOption<Value>[],
  value: Value,
  direction: -1 | 1,
): Value {
  if (!options.length) return value;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const index = selectedIndex < 0 ? 0 : selectedIndex;
  return options[(index + direction + options.length) % options.length]?.value ?? value;
}

/** Přístupná segmentová volba 2–3 vzájemně výlučných typů ve formuláři. */
export function SegmentedField<Value extends string = string>({
  options,
  value,
  onChange,
  disabled,
  label,
  ariaLabel,
  className,
  error,
  warning,
  ref,
  ...props
}: SegmentedFieldProps<Value>) {
  const status = useFieldStatus({ error, warning });
  const readOnly = useRecordReadOnly();
  const group = readOnly ? (
    <ReadOnlyControlValue id={id}>
      {options.find((option) => option.value === value)?.label}
    </ReadOnlyControlValue>
  ) : (
    <div
      ref={ref}
      role="radiogroup"
      data-slot="segmented"
      aria-label={ariaLabel ?? label}
      className={cn(
        "inline-flex h-[var(--control-h)] w-fit overflow-hidden rounded-md border border-input bg-background",
        status.className,
        className,
      )}
      {...props}
      {...status.controlProps}
    >
      <span id={status.describedById} className="sr-only">
        {status.message}
      </span>
      {options.map((option, index) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          disabled={disabled}
          className={cn(
            "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 h-full min-h-0 rounded-none border-0 px-3 font-normal shadow-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            index > 0 && "border-l border-l-input",
            option.value === value &&
              (disabled
                ? "font-semibold disabled:bg-muted disabled:text-foreground"
                : "bg-primary/10 font-semibold text-primary"),
          )}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            if (
              event.key !== "ArrowLeft" &&
              event.key !== "ArrowRight" &&
              event.key !== "ArrowUp" &&
              event.key !== "ArrowDown"
            )
              return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
            const nextValue = nextSegmentedFieldValue(options, value, direction);
            const nextIndex = options.findIndex((item) => item.value === nextValue);
            onChange(nextValue);
            const buttons =
              event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
                '[role="radio"]',
              );
            buttons?.[nextIndex]?.focus();
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );

  return label ? (
    <Field
      label={
        <>
          <span title={label} className={cn("min-w-0 truncate", error && "text-destructive")}>
            {label}
          </span>
          <FieldFeedbackIndicator error={error} warning={warning} placement="label" />
        </>
      }
    >
      {group}
    </Field>
  ) : (
    group
  );
}
