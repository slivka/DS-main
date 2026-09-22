import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";

export type CategoryOption = {
  id: string;
  name: string;
  parent_id?: string | null;
  is_active?: boolean | null;
};

type FlatOption = { id: string; name: string; level: number; path: string };

/** Zoradí kategórie do stromového poradia (rodič, potom jeho potomkovia). */
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
  // osirené položky (rodič mimo zoznamu) doplníme na koniec
  const seen = new Set(out.map((o) => o.id));
  for (const o of options) {
    if (!seen.has(o.id)) out.push({ id: o.id, name: o.name, level: 0, path: o.name });
  }
  return out;
}

/** Názov kategórie vrátane cesty od koreňa. */
export function categoryPath(options: CategoryOption[], id: string | null | undefined) {
  if (!id) return "";
  return flattenCategories(options).find((o) => o.id === id)?.path ?? "";
}

/**
 * Zdieľaný výber kategórie – vlastný komponent (nie systémový select),
 * zobrazuje stromovú štruktúru s odsadením a vyhľadávaním.
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
  /** "cell" = vzhľad bunky gridu (bez rámčeka), "field" = bežné pole formulára. */
  variant?: "cell" | "field";
  disabled?: boolean;
  className?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
}) {
  const [open, setOpen] = useState(false);
  const flat = useMemo(() => flattenCategories(options), [options]);
  const selected = flat.find((o) => o.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          aria-expanded={open}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "w-full justify-between font-normal",
            variant === "cell"
              ? "h-7 rounded-none border-transparent bg-transparent px-1 text-[1em] shadow-none hover:bg-transparent focus-visible:border-input focus-visible:bg-background"
              : "h-9",
            !selected && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{selected ? selected.name : allowEmpty ? emptyLabel : placeholder}</span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => {
          // Ruční posun – v modálním dialógu sa kolečko myši môže zablokovať,
          // preto zoznam posunieme priamo.
          const list = e.currentTarget.querySelector<HTMLElement>("[cmdk-list]");
          if (list) list.scrollTop += e.deltaY;
        }}
      >
        <Command
          filter={(itemValue, search) =>
            itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput placeholder={searchPlaceholder} />
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
                  <span style={{ paddingLeft: `${o.level * 14}px` }} className={cn(o.level === 0 && "font-medium")}>
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
