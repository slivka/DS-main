import * as React from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { InactiveTag } from "../data-display/inactive-tag";

export interface UnitOption {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface UnitSelectProps {
  options: UnitOption[];
  value?: string | null;
  onChange: (id: string) => void;
  onCreateUnit?: (code: string) => Promise<UnitOption>;
  disabled?: boolean;
  initialSearch?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: (code: string) => string;
  className?: string;
  inactiveLabel?: string;
}

/** Výběr měrné jednotky s možností založit chybějící kód. */
export function UnitSelect({
  options,
  value,
  onChange,
  onCreateUnit,
  disabled,
  initialSearch = "",
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  placeholder = "Vyberte MJ",
  searchPlaceholder = "Hledat kód nebo název…",
  emptyText = "Žádná měrná jednotka nenalezena",
  createLabel = (code) => `Přidat MJ „${code}“`,
  className,
  inactiveLabel = "neaktivní",
}: UnitSelectProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState(initialSearch);
  const [creating, setCreating] = React.useState(false);
  const selected = options.find((item) => item.id === value);
  const normalized = query.trim().toLocaleLowerCase("cs");
  const filtered = options.filter((item) => item.isActive && (!normalized || `${item.code} ${item.name}`.toLocaleLowerCase("cs").includes(normalized)));
  const canCreate = Boolean(onCreateUnit && query.trim() && !options.some((item) => item.code.toLocaleLowerCase("cs") === normalized));

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); onOpenChange?.(next); }}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" disabled={disabled} className={cn("h-full w-full justify-between rounded-sm px-1 font-normal", className)}>
          <span className={cn("truncate", !selected && "text-muted-foreground")}>{selected?.code ?? placeholder}</span>{selected && !selected.isActive ? <InactiveTag label={inactiveLabel} /> : null}
          <ChevronsUpDown className="size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-64 p-0">
        <Command shouldFilter={false}>
          <CommandInput value={query} onValueChange={setQuery} placeholder={searchPlaceholder} onKeyDown={onKeyDown} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {filtered.map((item) => <CommandItem key={item.id} value={`${item.code} ${item.name}`} onSelect={() => { onChange(item.id); setOpen(false); }}>
                <span className="w-16 font-mono font-semibold">{item.code}</span><span className="min-w-0 flex-1 truncate">{item.name}</span>{item.id === value ? <Check /> : null}
              </CommandItem>)}
            </CommandGroup>
            {canCreate ? <><CommandSeparator /><CommandGroup><CommandItem disabled={creating} onSelect={async () => {
              const code = query.trim();
              if (!onCreateUnit) return;
              setCreating(true);
              try { const created = await onCreateUnit(code); onChange(created.id); setOpen(false); setQuery(""); } finally { setCreating(false); }
            }}><Plus />{createLabel(query.trim())}</CommandItem></CommandGroup></> : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}