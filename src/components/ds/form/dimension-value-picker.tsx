/** Výběr dimenze · vlastní hledání přes inline-search · nesmí znát doménu ani dědit hodnoty. */
import { useState } from "react";
import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import { InlineSearchPopover, InlineSearchTrigger, InlineSearchContent, InlineSearchInput } from "./inline-search";
import { useDimensionOptions } from "./use-dimension-options";
import { useDsTexts } from "../../../ds-texts";
import { formatCodeName } from "../../../lib/code-format";
import { cn } from "../../../lib/utils";
import type { DimensionOptionItem, DimensionType, DimensionValue, LoadDimensionOptions } from "./dimension-types";

/** Vnitřní props výběru. */
interface DimensionValuePickerProps {
  type: DimensionType;
  value: DimensionValue;
  loadOptions: LoadDimensionOptions;
  onSelect: (value: DimensionValue) => void;
  onRemove: () => void;
  disabled: boolean;
  defaultOpen?: boolean;
}
/** Sdílené hledatelné pole hodnoty dimenze. */
export function DimensionValuePicker({ type, value, loadOptions, onSelect, onRemove, disabled, defaultOpen = false }: DimensionValuePickerProps) {
  const t = useDsTexts().dimensions;
  const [open, setOpen] = useState(defaultOpen && !disabled);
  const [query, setQuery] = useState("");
  const result = useDimensionOptions(open ? type.id : undefined, query, loadOptions);
  const choose = (option: DimensionOptionItem) => {
    if (option.disabled || option.inactive) return;
    onSelect({ typeId: type.id, valueId: option.id, label: formatCodeName(option.code, option.label), kind: option.kind, inherited: false });
    setOpen(false);
  };
  return (
    <InlineSearchPopover open={open} onOpenChange={setOpen} onSearchChange={setQuery}>
      <InlineSearchTrigger asChild>
        <Button type="button" variant="ghost" role="combobox" aria-expanded={open}
          aria-label={`${type.label}: ${value.label || t.choose}`}
          disabled={disabled} title={value.inactive ? t.ended : undefined}
          data-inherited={value.inherited || undefined}
          className={cn("h-[var(--control-h)] min-w-0 justify-start rounded-none px-2 font-normal", (value.inherited || value.inactive) && "text-muted-foreground", value.inherited === false && "font-semibold text-primary")}
          onKeyDown={(event) => {
            if (!disabled && !open && ["Delete", "Backspace"].includes(event.key)) {
              event.preventDefault(); event.stopPropagation(); onRemove();
            }
          }}>
          <span className="truncate">{type.label}: {value.label || t.choose}</span>
        </Button>
      </InlineSearchTrigger>
      <InlineSearchContent align="start" className="ds-select-popover p-0">
        <Command shouldFilter={false}>
          <InlineSearchInput value={query} onValueChange={setQuery} />
          <CommandList aria-busy={result.loading}>
            <CommandEmpty>{result.loading ? t.loading : result.failed ? t.loadFailed : t.empty}</CommandEmpty>
            <CommandGroup>
              {result.options.filter((option) => !option.inactive).map((option) => (
                <CommandItem key={option.id} value={option.id} disabled={option.disabled}
                  title={option.disabledReason} onSelect={() => choose(option)}>
                  <span className="truncate">{formatCodeName(option.code, option.label)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </InlineSearchContent>
    </InlineSearchPopover>
  );
}
