import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

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
import { formatCodeName } from "../../../lib/code-format";
import type { VatCodeOption } from "./journal-lines";

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
}

/** Filtrování kódů DPH podle kódu i názvu (nerozlišuje velikost písmen); neaktivní jen když jsou vybrané. */
export function filterVatCodes(
  codes: VatCodeOption[],
  query: string,
  selectedId?: string | null,
): VatCodeOption[] {
  const list = codes.filter((code) => !code.inactive || code.id === selectedId);
  const q = query.trim().toLocaleLowerCase("cs");
  if (!q) return list;
  return list.filter((code) =>
    formatCodeName(code.code, code.name).toLocaleLowerCase("cs").includes(q),
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
}: VatCodeSelectProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(initialSearch ?? "");
  // Po zavření Radix vrátí fokus na trigger – potlačíme okamžité znovuotevření.
  const suppressFocusOpen = useRef(false);
  // Fokus z kliknutí myší necháváme na Radix (sám přepne), jinak by klik zavřel.
  const pointerDown = useRef(false);

  useEffect(() => setQuery(initialSearch ?? ""), [initialSearch]);

  const changeOpen = (next: boolean) => {
    if (!next) suppressFocusOpen.current = true;
    setOpen(next);
    onOpenChange?.(next);
  };

  const filtered = useMemo(() => filterVatCodes(codes, query, value), [codes, query, value]);
  const selected = codes.find((code) => code.id === value);

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          onPointerDownCapture={() => {
            pointerDown.current = true;
          }}
          onPointerUp={() => {
            pointerDown.current = false;
          }}
          onFocus={() => {
            if (disabled || suppressFocusOpen.current || pointerDown.current) return;
            changeOpen(true);
          }}
          onBlur={() => {
            suppressFocusOpen.current = false;
            pointerDown.current = false;
          }}
          className={cn("w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? (
              <>
                <span className="font-mono tabular-nums">{selected.code}</span>
                <span className="ml-2 text-muted-foreground">{selected.name}</span>
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="ml-auto size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[280px] p-0" align="start">
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
            <CommandGroup>
              {filtered.map((code) => (
                <CommandItem
                  key={code.id}
                  value={`${code.code} ${code.name}`}
                  disabled={code.inactive}
                  onSelect={() => {
                    if (code.inactive) return;
                    onChange(code.id);
                    changeOpen(false);
                  }}
                  className={cn("gap-2", code.inactive && "opacity-50")}
                >
                  <span className="w-14 shrink-0 font-mono tabular-nums">{code.code}</span>
                  <span className="min-w-0 flex-1 truncate">{code.name}</span>
                  {selected?.id === code.id ? <Check className="size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
