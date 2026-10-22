import { useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import { InlineSearchPopover as Popover, InlineSearchContent as PopoverContent, InlineSearchTrigger as PopoverTrigger, InlineSearchInput as CommandInput } from "../form/inline-search";
import { cn } from "../../../lib/utils";
import { formatCodeName } from "../../../lib/code-format";
import { useDsTexts } from "../../../ds-texts";
import type { VatCodeOption } from "./journal-lines";
import { groupVatCodes, vatCodeMenuLabel, type VatDirection } from "./vat-code-labels";

export interface VatCodeSelectProps {
  codes: VatCodeOption[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Otevřít hned při vykreslení – editace buňky v gridu. */
  defaultOpen?: boolean;
  /** Počáteční hledaný text (první napsaný znak v buňce gridu). */
  initialSearch?: string;
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  className?: string;
  /** Doklad bez pevného směru: skupiny Výstup / Vstup a směr v textu pole (2.118.0). */
  bidirectional?: boolean;
  /** Výchozí směr – jeho skupina je v nabídce první (pokladna, banka). */
  defaultDirection?: VatDirection;
}

/** Filtrování kódů DPH podle kódu, názvu i sazby (nerozlišuje velikost písmen); neaktivní jen když jsou vybrané. */
export function filterVatCodes(
  codes: VatCodeOption[],
  query: string,
  selectedId?: string | null,
): VatCodeOption[] {
  const list = codes.filter((code) => !code.inactive || code.id === selectedId);
  const q = query.trim().toLocaleLowerCase("cs");
  if (!q) return list;
  return list.filter((code) =>
    `${formatCodeName(code.code, code.name)} ${vatCodeMenuLabel(code)}`
      .toLocaleLowerCase("cs")
      .includes(q),
  );
}

/** Výběr kódu DPH – kód a název; v buňce gridu se otevírá hned při vstupu do editace a psaní filtruje. */
export function VatCodeSelect({
  codes,
  value,
  onChange,
  placeholder = "Vyberte kód DPH",
  searchPlaceholder = "Hledat kód nebo název…",
  emptyText = "Žádný kód DPH nenalezen",
  disabled,
  defaultOpen = false,
  initialSearch,
  onOpenChange,
  onKeyDown,
  className,
  bidirectional = false,
  defaultDirection,
}: VatCodeSelectProps) {
  const texts = useDsTexts().vatFive;
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(initialSearch ?? "");

  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const filtered = useMemo(() => filterVatCodes(codes, query, value), [codes, query, value]);
  const selected = codes.find((code) => code.id === value);
  const groups = useMemo(
    () => groupVatCodes(filtered, texts, { bidirectional, defaultDirection }),
    [filtered, texts, bidirectional, defaultDirection],
  );

  return (
    <Popover onSearchChange={setQuery} open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn(
            "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100",
            "w-full justify-between font-normal",
            className,
          )}
        >
          <span
            data-placeholder={!selected ? "" : undefined}
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected
              ? bidirectional
                ? `${vatCodeMenuLabel(selected)} · ${selected.direction === "in" ? texts.directionInShort : texts.directionOutShort}`
                : vatCodeMenuLabel(selected)
              : placeholder}
          </span>
          <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ds-select-popover p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            autoFocus
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
            onKeyDown={onKeyDown}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.key} heading={group.label} data-vat-group={group.key}>
                {group.codes.map((code) => (
                  <CommandItem
                    key={code.id}
                    value={code.id}
                    disabled={code.inactive}
                    onSelect={() => {
                      if (code.inactive) return;
                      onChange(code.id);
                      changeOpen(false);
                    }}
                    className={cn("gap-2", code.inactive && "opacity-50")}
                  >
                    <span title={vatCodeMenuLabel(code)} className="min-w-0 flex-1 truncate">
                      {vatCodeMenuLabel(code)}
                    </span>
                    {selected?.id === code.id ? <Check className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
