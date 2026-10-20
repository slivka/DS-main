import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { InlineSearchPopover as Popover, InlineSearchContent as PopoverContent, InlineSearchTrigger as PopoverTrigger, InlineSearchInput as CommandInput } from "./inline-search";
import { cn } from "../../../lib/utils";

export type CategoryOption = {
  id: string;
  name: string;
  parent_id?: string | null;
  is_active?: boolean | null;
};

type FlatOption = { id: string; name: string; level: number; path: string };

/** Seřadí kategorie do stromového pořadí (rodič, potom jeho potomci). */
export function flattenCategories(options: CategoryOption[]): FlatOption[] {
  const byParent = new Map<string | null, CategoryOption[]>();
  for (const o of options) {
    const key = o.parent_id ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), o]);
  }
  for (const list of byParent.values()) list.sort((a, b) => a.name.localeCompare(b.name, "cs"));

  const out: FlatOption[] = [];
  const walk = (parent: string | null, level: number, prefix: string) => {
    for (const o of byParent.get(parent) ?? []) {
      const path = prefix ? `${prefix} / ${o.name}` : o.name;
      out.push({ id: o.id, name: o.name, level, path });
      walk(o.id, level + 1, path);
    }
  };
  walk(null, 0, "");
  // osirené položky (rodič mimo zoznamu) doplníme na konec
  const seen = new Set(out.map((o) => o.id));
  for (const o of options) {
    if (!seen.has(o.id)) out.push({ id: o.id, name: o.name, level: 0, path: o.name });
  }
  return out;
}

/** Název kategorie včetně cesty od kořene. */
export function categoryPath(options: CategoryOption[], id: string | null | undefined) {
  if (!id) return "";
  return flattenCategories(options).find((o) => o.id === id)?.path ?? "";
}

/**
 * Sdílený výběr kategorie – vlastní komponenta (nikoli systémový select),
 * zobrazuje stromovú štruktúru s odsadením a vyhledáváním.
 */
export function CategorySelect({
  value,
  onChange,
  options,
  allowEmpty = true,
  emptyLabel = "Bez kategorie",
  placeholder = "Vyberte kategorii",
  variant = "field",
  disabled = false,
  className,
  searchPlaceholder = "Hledat kategorii…",
  noResultsText = "Nic nenalezeno",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  options: CategoryOption[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  placeholder?: string;
  /** "cell" = vzhled buňky gridu (bez rámečku), "field" = běžné pole formulára. */
  variant?: "cell" | "field";
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const flat = useMemo(() => flattenCategories(options), [options]);
  const selected = flat.find((o) => o.id === value) ?? null;

  return (
    <Popover onSearchChange={setQuery} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100",
            "w-full justify-between font-normal",
            variant === "cell"
              ? "h-7 rounded-none border-transparent bg-transparent px-1 text-[1em] shadow-none hover:bg-transparent focus-visible:border-input focus-visible:bg-background"
              : "h-[var(--control-h)]",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span data-placeholder={!selected ? "" : undefined} className="truncate">
            {selected ? selected.name : allowEmpty ? emptyLabel : placeholder}
          </span>
          <ChevronDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="ds-select-popover p-0"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Ruční posun – v modálním dialogu sa kolečko myši může zablokovat,
          // preto zoznam posuneme priamo.
          const list = e.currentTarget.querySelector<HTMLElement>("[cmdk-list]");
          if (list) list.scrollTop += e.deltaY;
        }}
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
          <CommandList className="max-h-72 overflow-y-auto overscroll-contain">
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {allowEmpty ? (
                <CommandItem
                  value={emptyLabel}
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 size-4", value ? "opacity-0" : "opacity-100")} />
                  <span className="text-muted-foreground">{emptyLabel}</span>
                </CommandItem>
              ) : null}
              {flat.map((o) => (
                <CommandItem
                  key={o.id}
                  value={o.path}
                  onSelect={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 size-4", value === o.id ? "opacity-100" : "opacity-0")}
                  />
                  <span
                    style={{ paddingLeft: `${o.level * 0.875}rem` }}
                    title={o.name}
                    className={cn("min-w-0 truncate", o.level === 0 && "font-medium")}
                  >
                    {o.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
