/**
 * Hledatelná větev sdíleného výběru.
 * Vlastní: otevření nabídky, filtrování a klávesnicový výběr.
 * Nesmí: rozhodovat o doménovém významu hodnot.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Check, ChevronDown, X } from "lucide-react";

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
import type { SelectOption } from "./option-select";

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
    const needle = query.trim().toLocaleLowerCase("cs");
    if (!needle) return offered;
    return offered.filter((option) => {
      const text = typeof option.label === "string" ? option.label : option.searchText;
      return (text ?? option.value).toLocaleLowerCase("cs").includes(needle);
    });
  }, [offered, query]);
  const triggerLabel = selected
    ? (props.selectedLabel?.(selected) ?? selected.selectedLabel ?? selected.label)
    : props.value
      ? props.unknownValueLabel
      : props.emptyValueLabel;

  const choose = (value: string) => {
    props.onChange(value);
    setOpen(false);
    setQuery("");
  };

  return (
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
            "h-[var(--control-h)] w-full min-w-0 justify-between font-normal",
            props.value ? "text-foreground" : "text-muted-foreground",
            props.className,
          )}
          title={selected && typeof selected.label === "string" ? selected.label : undefined}
        >
          <span className="min-w-0 flex-1 truncate text-left">{triggerLabel}</span>
          <span className="flex shrink-0 items-center gap-1">
            {props.value && props.allowEmpty ? (
              <span
                role="button"
                tabIndex={0}
                aria-label={String(props.emptyValueLabel)}
                onClick={(event) => {
                  event.stopPropagation();
                  choose("");
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  event.stopPropagation();
                  choose("");
                }}
                className="rounded-md p-1 hover:bg-muted"
              >
                <X className="size-3.5" />
              </span>
            ) : null}
            <ChevronDown className="size-4 opacity-50" />
          </span>
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
  );
}
