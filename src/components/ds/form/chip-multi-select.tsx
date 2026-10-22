/** Vícenásobný výběr · vlastní zaškrtnutí a klávesnici · nemění data aplikace. */
import { forwardRef, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { Check, Plus, X } from "lucide-react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Command, CommandItem, CommandList } from "../../ui/command";
import {
  InlineSearchPopover as Popover,
  InlineSearchContent as PopoverContent,
  InlineSearchTrigger as PopoverTrigger,
  InlineSearchInput,
} from "./inline-search";

export type ChipOption = { value: string; label: string };

/** Vlastnosti vícenásobného výběru. */
export interface ChipMultiSelectProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange" | "placeholder"
> {
  options: ChipOption[];
  value: string[];
  onChange: (next: string[]) => void;
  addLabel?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  allLabel?: string;
  clearLabel?: string;
  /** Text zobrazený, keď ne je nič vybrané. */
  placeholder?: string;
}

/**
 * Sdílený výber viacerých hodnot v štýle štítkov – vybrané hodnoty sú chipy,
 * přidávání přes popover se zaškrtávacím seznamem, hledáním a volbou „vybrat vše“.
 */
export const ChipMultiSelect = forwardRef<HTMLDivElement, ChipMultiSelectProps>(
  function ChipMultiSelect(
    {
      options,
      value,
      onChange,
      addLabel,
      searchPlaceholder,
      emptyLabel,
      allLabel,
      clearLabel,
      className,
      placeholder,
      ...props
    }: ChipMultiSelectProps,
    ref,
  ) {
    const texts = useDsTexts();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);

    const filtered = useMemo(() => {
      const q = search.trim().toLowerCase();
      if (!q) return options;
      return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, search]);

    const toggle = (v: string) =>
      onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

    return (
      <div ref={ref} {...props} className={cn("flex flex-wrap items-center gap-2", className)}>
        {value.length === 0 && placeholder ? (
          <span className="text-sm text-muted-foreground">{placeholder}</span>
        ) : null}

        {options
          .filter((o) => value.includes(o.value))
          .map((o) => (
            <Button
              type="button"
              size="sm"
              aria-label={`${o.label} · ${clearLabel ?? texts.grid.clear}`}
              key={o.value}
              variant="secondary"
              className="cursor-pointer gap-1"
              onClick={() => toggle(o.value)}
            >
              {o.label}
              <X className="size-3 opacity-70" />
            </Button>
          ))}

        <Popover multiple open={open} onOpenChange={setOpen} onSearchChange={setSearch}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" size="sm" role="combobox">
              <Plus className="size-3.5" />
              {addLabel ?? texts.multiSelect.add}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 space-y-2 p-2">
            <Command shouldFilter={false}>
              <InlineSearchInput
                value={search}
                placeholder={searchPlaceholder ?? texts.contextSwitcher.search}
                onValueChange={setSearch}
                className="h-8"
              />
              <div
                onKeyDown={(event) => {
                  if (
                    event.target instanceof HTMLButtonElement &&
                    (event.key === "Enter" || event.key === " ")
                  )
                    event.stopPropagation();
                }}
                className="flex items-center justify-between border-b border-border pb-1 text-xs"
              >
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => onChange(options.map((o) => o.value))}
                >
                  {allLabel ?? texts.multiSelect.selectAll}
                </Button>
                <Button
                  variant="link"
                  size="sm"
                  type="button"
                  className="text-muted-foreground hover:underline"
                  onClick={() => onChange([])}
                >
                  {clearLabel ?? texts.multiSelect.clear}
                </Button>
              </div>
              <CommandList aria-multiselectable className="max-h-56 space-y-1 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="px-1 py-1 text-sm text-muted-foreground">
                    {emptyLabel ?? texts.multiSelect.noValues}
                  </p>
                ) : (
                  filtered.map((o) => {
                    const checked = value.includes(o.value);
                    return (
                      <CommandItem
                        key={o.value}
                        value={o.value}
                        aria-checked={checked}
                        onSelect={() => toggle(o.value)}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-sm hover-surface"
                      >
                        <span
                          className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-input"
                          }`}
                        >
                          {checked ? <Check className="size-3" /> : null}
                        </span>
                        <span className="truncate">{o.label}</span>
                      </CommandItem>
                    );
                  })
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);
