import { useMemo, useState } from "react";
import { Building2, Check, Plus } from "lucide-react";

import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command";
import { ContextPill } from "./context-pill";

export type CompanySwitcherItem = { id: string; name: string; ico?: string };

export interface CompanySwitcherProps {
  items: CompanySwitcherItem[];
  value: string;
  onChange: (id: string) => void;
  recentIds?: string[];
  label?: string;
  searchPlaceholder?: string;
  recentLabel?: string;
  allLabel?: string;
  emptyText?: string;
  createLabel?: string;
  onCreate?: () => void;
  className?: string;
}

/** Výběr firmy s hledáním a naposledy použitými firmami. */
export function CompanySwitcher({
  items,
  value,
  onChange,
  recentIds = [],
  label = "Firma",
  searchPlaceholder = "Hledat firmu…",
  recentLabel = "Poslední",
  allLabel = "Všechny firmy",
  emptyText = "Žádná firma nebyla nalezena.",
  createLabel = "Nová firma",
  onCreate,
  className,
}: CompanySwitcherProps) {
  const selected = items.find((item) => item.id === value);
  const recent = useMemo(
    () => recentIds.map((id) => items.find((item) => item.id === id)).filter((item): item is CompanySwitcherItem => Boolean(item)),
    [items, recentIds],
  );
  const recentSet = new Set(recent.map((item) => item.id));
  const others = items.filter((item) => !recentSet.has(item.id));
  const [openKey, setOpenKey] = useState(0);

  const row = (item: CompanySwitcherItem) => (
    <CommandItem key={`${openKey}-${item.id}`} value={`${item.name} ${item.ico ?? ""}`} onSelect={() => onChange(item.id)}>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.name}</span>
        {item.ico ? <span className="block text-xs text-muted-foreground">IČO {item.ico}</span> : null}
      </span>
      {item.id === value ? <Check className="size-4 text-primary" /> : null}
    </CommandItem>
  );

  return (
    <ContextPill
      label={label}
      value={selected?.name ?? emptyText}
      icon={Building2}
      compactValue={selected?.name ?? emptyText}
      className={`max-w-[128px] md:max-w-[200px] xl:max-w-[360px] ${className ?? ""}`}
      contentClassName="w-[380px]"
      onClick={() => setOpenKey((key) => key + 1)}
    >
      <Command>
        <CommandInput placeholder={searchPlaceholder} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          {recent.length ? <CommandGroup heading={recentLabel}>{recent.map(row)}</CommandGroup> : null}
          <CommandGroup heading={allLabel}>{others.map(row)}</CommandGroup>
        </CommandList>
      </Command>
      {onCreate ? (
        <div className="border-t p-2">
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={onCreate}>
            <Plus className="size-4" />
            {createLabel}
          </Button>
        </div>
      ) : null}
    </ContextPill>
  );
}