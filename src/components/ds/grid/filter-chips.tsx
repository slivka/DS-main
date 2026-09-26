import { forwardRef, type HTMLAttributes } from "react";
import { X } from "lucide-react";

import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";

export type FilterChip = {
  id: string;
  /** Název filtru, např. „Skupina“. */
  label: string;
  /** Hodnota filtru, např. „51 – Služby“. */
  value?: string;
  onRemove?: () => void;
};

export type FilterChipsTexts = {
  clearAll: string;
  removeLabel: (chip: string) => string;
};

export const DEFAULT_FILTER_CHIPS_TEXTS: FilterChipsTexts = {
  clearAll: "Zrušit vše",
  removeLabel: (chip) => `Zrušit filtr ${chip}`,
};

export interface FilterChipsProps extends HTMLAttributes<HTMLDivElement> {
  chips: FilterChip[];
  /** „Zrušit vše“ – zobrazí se od dvou štítků. */
  onClearAll?: () => void;
  size?: "sm" | "md";
  texts?: Partial<FilterChipsTexts>;
}

/** Odebíratelné štítky aktivních filtrů (název, hodnota, ✕) + „Zrušit vše“. */
export const FilterChips = forwardRef<HTMLDivElement, FilterChipsProps>(function FilterChips(
  { chips, onClearAll, size = "md", texts, className, ...props },
  ref,
) {
  const t = { ...DEFAULT_FILTER_CHIPS_TEXTS, ...texts };
  if (!chips.length) return null;
  return (
    <div
      ref={ref}
      data-slot="filter-chips"
      className={cn("flex flex-wrap items-center gap-1.5", size === "sm" ? "text-xs" : "text-sm", className)}
      {...props}
    >
      {chips.map((chip) => {
        const text = chip.value ? `${chip.label}: ${chip.value}` : chip.label;
        return (
          <span
            key={chip.id}
            data-chip-id={chip.id}
            className="inline-flex max-w-[22rem] items-center gap-1 rounded-full border border-filter-active/45 bg-filter-active/10 py-0.5 pr-1 pl-2.5 text-filter-active"
          >
            <span className="truncate">
              <span className="opacity-80">{chip.label}</span>
              {chip.value ? <span className="font-medium">: {chip.value}</span> : null}
            </span>
            {chip.onRemove ? (
              <button
                type="button"
                aria-label={t.removeLabel(text)}
                title={t.removeLabel(text)}
                onClick={chip.onRemove}
                className="flex size-5 items-center justify-center rounded-full hover:bg-filter-active/15 focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X className="size-3.5" />
              </button>
            ) : (
              <span className="w-1.5" />
            )}
          </span>
        );
      })}
      {chips.length > 1 && onClearAll ? (
        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onClearAll}>
          {t.clearAll}
        </Button>
      ) : null}
    </div>
  );
});
