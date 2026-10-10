/**
 * Hledatelná větev sdíleného výběru.
 * Vlastní: otevření nabídky, filtrování a klávesnicový výběr.
 * Nesmí: rozhodovat o doménovém významu hodnot.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";
import { FieldInlineActions } from "./field-inline-actions";

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
import { InactiveTag } from "../data-display/inactive-tag";
import { UnknownValue, type SelectOption } from "./option-select";
import { useDsTexts } from "../../../ds-texts";

/** Text pro hledání bez ohledu na diakritiku a velikost písmen. */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("cs");
}

/** Vlastnosti hledatelné větve OptionSelect. */
export interface SearchableOptionSelectProps {
  /** Aktuální hodnota. */
  value: string;
  /** Nabízené položky. */
  options: SelectOption[];
  /** Změna hodnoty. */
  onChange: (value: string) => void;
  /** Text prázdné hodnoty. */
  emptyValueLabel: ReactNode;
  /** Text při nenalezení položky. */
  noResultsLabel: string;
  /** Výzva vyhledávání. */
  searchPlaceholder: string;
  /** Popisek neaktivní položky. */
  inactiveLabel: string;
  /** Náhrada neznámé hodnoty. */
  unknownValueLabel: string;
  /** Povolit vymazání. */
  allowEmpty: boolean;
  /** Zakázat výběr. */
  disabled?: boolean;
  /** Identifikátor. */
  id?: string;
  /** Přístupný název. */
  ariaLabel?: string;
  /** Doplňkové třídy. */
  className?: string;
  /** Text vybrané položky. */
  selectedLabel?: (option: SelectOption) => ReactNode;
}

/** Hledatelný seznam s krátkou hodnotou ve spouštěči. */
export function SearchableOptionSelect(props: SearchableOptionSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = props.options.find((option) => option.value === props.value);
  const offered = props.options.filter(
    (option) => !option.inactive || option.value === props.value,
  );
  const filtered = useMemo(() => {
    const needle = normalizeSearchText(query.trim());
    if (!needle) return offered;
    return offered.filter((option) => {
      const text = [
        option.value,
        option.searchText,
        typeof option.label === "string" ? option.label : "",
      ]
        .filter(Boolean)
        .join(" ");
      return normalizeSearchText(text).includes(needle);
    });
  }, [offered, query]);
  const triggerLabel = selected ? (
    (props.selectedLabel?.(selected) ?? selected.selectedLabel ?? selected.label)
  ) : props.value ? (
    <UnknownValue value={props.value} label={props.unknownValueLabel} />
  ) : (
    props.emptyValueLabel
  );
  const clearLabel = useDsTexts().documentForm.clear;
  const showClear = Boolean(props.value && props.allowEmpty && !props.disabled);

  const choose = (value: string) => {
    props.onChange(value);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative min-w-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={props.id}
            type="button"
            variant="outline"
            role="combobox"
            aria-label={props.ariaLabel}
            aria-expanded={open}
            disabled={props.disabled}
            className={cn(
              "relative h-[var(--control-h)] w-full min-w-0 justify-between pr-9 font-normal",
              props.value ? "text-foreground" : "text-muted-foreground",
              showClear && "pr-[calc(1rem+1rem+0.25rem+1.75rem+0.25rem)]",
              props.className,
            )}
            title={selected && typeof selected.label === "string" ? selected.label : undefined}
          >
            <span
              className="min-w-0 flex-1 truncate text-left"
              title={!props.value && typeof triggerLabel === "string" ? triggerLabel : undefined}
            >
              {triggerLabel}
            </span>
            <span className="flex shrink-0 items-center gap-1">
              {selected?.trailingLabel && !selected.inactive ? (
                <span className="text-xs">{selected.trailingLabel}</span>
              ) : null}
            </span>
            <ChevronDown
              data-slot="select-chevron"
              className="absolute right-4 top-1/2 size-4 -translate-y-1/2 opacity-50"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-64 p-0">
          <Command shouldFilter={false}>
            <CommandInput
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder={props.searchPlaceholder}
            />
            <CommandList>
              <CommandEmpty>{props.noResultsLabel}</CommandEmpty>
              <CommandGroup>
                {filtered.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.searchText ?? String(option.label)}
                    disabled={option.disabled || option.inactive}
                    onSelect={() => choose(option.value)}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                    {option.inactive ? <InactiveTag label={props.inactiveLabel} /> : null}
                    {option.value === props.value ? <Check className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {showClear ? <FieldInlineActions onClear={() => choose("")} clearLabel={clearLabel} /> : null}
    </div>
  );
}
