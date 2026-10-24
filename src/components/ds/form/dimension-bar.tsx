/** Lišta dimenzí · vlastní řízené chipy a výběr typu · nesmí znát účetnictví ani persistovat. */
import * as React from "react";
import { RotateCcw, X } from "lucide-react";
import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import {
  InlineSearchPopover,
  InlineSearchTrigger,
  InlineSearchContent,
  InlineSearchInput,
} from "./inline-search";
import { normalizeSearchText } from "./searchable-option-select";
import { DimensionValuePicker } from "./dimension-value-picker";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { DimensionType, DimensionValue, LoadDimensionOptions } from "./dimension-types";
export type {
  DimensionType,
  DimensionValue,
  DimensionOptionItem,
  LoadDimensionOptions,
} from "./dimension-types";

/** Props obecné lišty; data a persistence patří aplikaci. */
export interface DimensionBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Typy v pořadí aplikace. */
  types: DimensionType[];
  /** Přidané typy; null valueId = k vyplnění. */
  value: DimensionValue[];
  /** Nový řízený seznam. */
  onChange: (value: DimensionValue[]) => void;
  /** Hledání hodnot aplikací. */
  loadOptions: LoadDimensionOptions;
  /** Zakázaná editace. */
  disabled?: boolean;
  /** Pouze zobrazení. */
  readOnly?: boolean;
  /** Počet řádků s výjimkou. */
  overrides?: Record<string, number>;
  /** Vrácení ruční hodnoty; callback vlastní rodič. */
  onReset?: (typeId: string) => void;
  /** Styl lišty nebo vloženého detailu. */
  variant?: "bar" | "inline";
  /** Výška ze svého prostředí. */
  size?: "default" | "sm";
}
/** Řízená lišta dimenzí, stejné uspořádání jako seskupovací lišta. */
export const DimensionBar = React.forwardRef<HTMLDivElement, DimensionBarProps>(
  function DimensionBar(
    {
      types,
      value,
      onChange,
      loadOptions,
      disabled = false,
      readOnly = false,
      overrides,
      onReset,
      variant = "bar",
      size = "default",
      className,
      onKeyDown,
      ...props
    },
    ref,
  ) {
    const t = useDsTexts().dimensions;
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [newType, setNewType] = React.useState<string>();
    const locked = disabled || readOnly;
    const ordered = [...types].sort((a, b) => a.order - b.order);
    const available = ordered.filter((type) => !value.some((item) => item.typeId === type.id));
    const remove = (typeId: string) => {
      if (!locked) onChange(value.filter((item) => item.typeId !== typeId));
    };
    return (
      <div
        ref={ref}
        role="group"
        aria-label={t.title}
        data-slot="dimension-bar"
        {...props}
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-2",
          variant === "bar" && "zoom-filters border-y border-dashed bg-card p-2 shadow-panel",
          size === "sm" && "[--control-h:var(--f-h)]",
          className,
        )}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          // Ani Enter nabídky, ani odstranění chipu nesmí spouštět zkratky řádků.
          if (["Enter", "Escape", "Delete", "Backspace"].includes(event.key))
            event.stopPropagation();
        }}
      >
        {ordered.flatMap((type) => {
          const item = value.find((entry) => entry.typeId === type.id);
          if (!item) return [];
          const count = overrides?.[type.id] ?? 0;
          return [
            <div
              key={type.id}
              data-slot="dimension-chip"
              data-type-id={type.id}
              className="inline-flex min-w-0 max-w-full items-center rounded-md border bg-muted/40 text-sm"
            >
              <DimensionValuePicker
                type={type}
                value={item}
                disabled={locked}
                defaultOpen={newType === type.id}
                loadOptions={loadOptions}
                onRemove={() => remove(type.id)}
                onSelect={(next) =>
                  onChange(value.map((entry) => (entry.typeId === type.id ? next : entry)))
                }
              />
              {count > 0 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span tabIndex={0} className="shrink-0 px-1 text-muted-foreground">
                      {t.more}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t.overrides(count)}</TooltipContent>
                </Tooltip>
              ) : null}
              {!locked && item.inherited === false && onReset ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-[var(--control-h)] shrink-0 rounded-none"
                  title={t.reset}
                  aria-label={t.reset}
                  onClick={() => onReset(type.id)}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              ) : null}
              {!locked ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-[var(--control-h)] shrink-0 rounded-l-none"
                  aria-label={t.remove(type.label)}
                  title={t.remove(type.label)}
                  onClick={() => remove(type.id)}
                >
                  <X className="size-3.5" />
                </Button>
              ) : null}
            </div>,
          ];
        })}
        {!readOnly && available.length > 0 ? (
          <InlineSearchPopover open={open} onOpenChange={setOpen} onSearchChange={setQuery}>
            <InlineSearchTrigger asChild>
              <Button
                type="button"
                role="combobox"
                aria-label={t.add}
                aria-expanded={open}
                variant="outline"
                disabled={disabled}
                className="h-[var(--control-h)] border-dashed"
              >
                {t.add}
              </Button>
            </InlineSearchTrigger>
            <InlineSearchContent align="start" className="ds-select-popover p-0">
              <Command shouldFilter={false}>
                <InlineSearchInput value={query} onValueChange={setQuery} />
                <CommandList>
                  <CommandEmpty>{t.empty}</CommandEmpty>
                  <CommandGroup>
                    {available
                      .filter((type) =>
                        normalizeSearchText(type.label).includes(normalizeSearchText(query)),
                      )
                      .map((type) => (
                        <CommandItem
                          key={type.id}
                          value={type.id}
                          onSelect={() => {
                            onChange([...value, { typeId: type.id, valueId: null, label: "" }]);
                            setNewType(type.id);
                            setOpen(false);
                          }}
                        >
                          {type.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </InlineSearchContent>
          </InlineSearchPopover>
        ) : null}
      </div>
    );
  },
);
