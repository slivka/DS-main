import * as React from "react";

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { Field } from "../layout/RecordDialog";

export interface SegmentedFieldOption<Value extends string = string> {
  value: Value;
  label: React.ReactNode;
}

export interface SegmentedFieldProps<Value extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> {
  options: SegmentedFieldOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  /** Volitelný viditelný popisek; bez něj použijte `ariaLabel`. */
  label?: string;
  ariaLabel?: string;
}

export function nextSegmentedFieldValue<Value extends string>(options: SegmentedFieldOption<Value>[], value: Value, direction: -1 | 1): Value {
  if (!options.length) return value;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const index = selectedIndex < 0 ? 0 : selectedIndex;
  return options[(index + direction + options.length) % options.length]?.value ?? value;
}

/** Přístupná segmentová volba 2–3 vzájemně výlučných typů ve formuláři. */
export function SegmentedField<Value extends string = string>({ options, value, onChange, disabled, label, ariaLabel, className, ...props }: SegmentedFieldProps<Value>) {
  const group = (
    <div role="radiogroup" aria-label={ariaLabel ?? label ?? "Výběr typu"} className={cn("inline-flex h-9 w-fit overflow-hidden rounded-md border border-input bg-background", className)} {...props}>
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
            "h-full min-h-0 rounded-none border-0 px-3 font-normal shadow-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            index > 0 && "border-l border-l-input",
            option.value === value && "bg-primary/10 font-semibold text-primary",
          )}
          onClick={() => onChange(option.value)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
            event.preventDefault();
            const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
            const nextValue = nextSegmentedFieldValue(options, value, direction);
            const nextIndex = options.findIndex((item) => item.value === nextValue);
            onChange(nextValue);
            event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
          }}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );

  return label ? <Field label={label}>{group}</Field> : group;
}