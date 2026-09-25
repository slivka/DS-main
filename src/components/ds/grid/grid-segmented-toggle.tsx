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

/** Segmentový filtr pro pravou část kontextového řádku gridu. */
export const GridSegmentedToggle = React.forwardRef<HTMLDivElement, GridSegmentedToggleProps>(function GridSegmentedToggle(
  { options, value, onChange, defaultValue, label, ariaLabel, className, ...props },
  ref,
) {
  const active = value !== defaultValue;
  const move = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
    const next = options[nextIndex];
    if (!next) return;
    onChange(next.value);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]?.focus();
  };

  return (
    <div ref={ref} className={cn("flex min-w-0 items-center gap-[0.35em]", className)} {...props}>
      {label ? <span className="font-normal text-muted-foreground">{label}</span> : null}
      <div
        role="radiogroup"
        aria-label={ariaLabel}
        className={cn("grid-toolbar-control inline-flex overflow-hidden border bg-card p-0", active && "grid-toolbar-active")}
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
              "h-full min-h-0 rounded-none border-0 px-[0.7em] text-[1em] shadow-none focus-visible:z-10",
              index > 0 && "border-l border-l-border",
              option.value === value && (active ? "bg-filter-active/15 text-filter-active" : "bg-muted text-foreground"),
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