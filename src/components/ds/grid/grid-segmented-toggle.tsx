import * as React from "react";

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export interface GridSegmentedToggleOption<Value extends string = string> {
  value: Value;
  label: string;
}

export interface GridSegmentedToggleProps<Value extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "defaultValue" | "onChange"> {
  options: GridSegmentedToggleOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  defaultValue: Value;
  label?: string;
  ariaLabel: string;
}

export function nextGridSegmentValue<Value extends string>(
  options: GridSegmentedToggleOption<Value>[],
  value: Value,
  direction: -1 | 1,
): Value {
  if (!options.length) return value;
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  return options[(index + direction + options.length) % options.length]?.value ?? value;
}

/** Segmentový filtr pro pravou část kontextového řádku gridu. */
export const GridSegmentedToggle = React.forwardRef<HTMLDivElement, GridSegmentedToggleProps>(function GridSegmentedToggle(
  { options, value, onChange, defaultValue, label, ariaLabel, className, ...props },
  ref,
) {
  const active = value !== defaultValue;
  const move = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextValue = nextGridSegmentValue(options, value, event.key === "ArrowRight" ? 1 : -1);
    const nextIndex = options.findIndex((option) => option.value === nextValue);
    onChange(nextValue);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
  };

  return (
    <div ref={ref} className={cn("flex min-w-0 items-center gap-[0.35em]", className)} {...props}>
      {label ? <span className="grid-context-label grid-segmented-label">{label}</span> : null}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn("grid-segmented grid-toolbar-control inline-flex overflow-hidden border border-grid-chrome bg-card p-0", active && "grid-toolbar-active")}
      >
        {options.map((option, index) => (
          <Button
            key={option.value}
            type="button"
            variant="ghost"
            role="radio"
            aria-checked={option.value === value}
            tabIndex={option.value === value ? 0 : -1}
            className={cn(
              "h-full min-h-0 rounded-none border-0 px-[0.7em] text-[1em] font-normal shadow-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
              index > 0 && "border-l border-l-grid-chrome",
              option.value === value && (active ? "bg-filter-active/15 font-semibold text-filter-active" : "bg-primary/10 font-semibold text-primary"),
            )}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => move(event, index)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
});

export type GridDirection = "all" | "in" | "out";

export const GRID_DIRECTION_OPTIONS: GridSegmentedToggleOption<GridDirection>[] = [
  { value: "all", label: "Vše" },
  { value: "in", label: "Příjmy" },
  { value: "out", label: "Výdaje" },
];

/** Filtruje příjmové a výdajové doklady; hodnota all vrací původní pole. */
export function filterByDirection<Row>(
  rows: Row[],
  value: GridDirection,
  getDirection: (row: Row) => Exclude<GridDirection, "all"> | null | undefined,
): Row[] {
  return value === "all" ? rows : rows.filter((row) => getDirection(row) === value);
}