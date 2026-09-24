import { useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Download, Plus } from "lucide-react";

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

export type PartnerOption = {
  id: string;
  name: string;
  /** IČO partnera (jen číslice). */
  ico?: string;
  active?: boolean;
};

/** Zobrazení partnera v jednom řádku: „Název · IČO“. */
export function formatPartner(partner: Pick<PartnerOption, "name" | "ico"> | null | undefined) {
  if (!partner) return "";
  return partner.ico ? `${partner.name} · ${partner.ico}` : partner.name;
}

/** Výběr obchodního partnera – hledání podle názvu i IČO, bez vazby na databázi. */
export function PartnerSelect({
  partners,
  value,
  onChange,
  onCreate,
  onLoadFromAres,
  placeholder = "Vyberte partnera",
  searchPlaceholder = "Hledat název nebo IČO…",
  emptyText = "Žádný partner nenalezen",
  createLabel = "Nový partner",
  aresLabel = "Načíst z ARES",
  disabled,
  id,
  className,
}: {
  partners: PartnerOption[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  /** Akce „Nový partner“ – bez ní se volba nezobrazí. */
  onCreate?: (query: string) => void;
  /** Akce „Načíst z ARES“ – bez ní se volba nezobrazí. */
  onLoadFromAres?: (query: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: string;
  aresLabel?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Po zavření Radix vrátí fokus na trigger – potlačíme okamžité znovuotevření.
  const suppressFocusOpen = useRef(false);

  const changeOpen = (next: boolean) => {
    if (!next) suppressFocusOpen.current = true;
    setOpen(next);
  };

  const list = useMemo(
    () => partners.filter((partner) => partner.active !== false),
    [partners],
  );
  const selected = list.find((partner) => partner.id === value);

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          onFocus={() => {
            if (disabled || suppressFocusOpen.current) return;
            changeOpen(true);
          }}
          onBlur={() => {
            suppressFocusOpen.current = false;
          }}
          className={cn("h-9 w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? formatPartner(selected) : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {list.map((partner) => (
                <CommandItem
                  key={partner.id}
                  value={`${partner.name} ${partner.ico ?? ""}`}
                  onSelect={() => {
                    onChange(partner.id);
                    setOpen(false);
                  }}
                  className="gap-2"
                >
                  <span className="min-w-0 flex-1 truncate">{partner.name}</span>
                  {partner.ico ? (
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {partner.ico}
                    </span>
                  ) : null}
                  {selected?.id === partner.id ? <Check className="size-4" /> : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreate || onLoadFromAres ? (
              <div className="flex flex-wrap gap-2 border-t p-2">
                {onCreate ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      onCreate(query);
                    }}
                  >
                    <Plus className="size-4" />
                    {createLabel}
                  </Button>
                ) : null}
                {onLoadFromAres ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setOpen(false);
                      onLoadFromAres(query);
                    }}
                  >
                    <Download className="size-4" />
                    {aresLabel}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
