import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";

import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../../ui/command";
import { ContextPill, useContextPillClose } from "./context-pill";

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

/** Obsah popoveru – je uvnitř ContextPill, takže může popover zavřít. */
function CompanySwitcherContent({
  items,
  value,
  onChange,
  recent,
  openKey,
  searchPlaceholder,
  recentLabel,
  allLabel,
  emptyText,
  createLabel,
  onCreate,
}: {
  items: CompanySwitcherItem[];
  value: string;
  onChange: (id: string) => void;
  recent: CompanySwitcherItem[];
  openKey: number;
  searchPlaceholder: string;
  recentLabel: string;
  allLabel: string;
  emptyText: string;
  createLabel: string;
  onCreate?: () => void;
}) {
  const close = useContextPillClose();
  const recentSet = new Set(recent.map((item) => item.id));
  const others = items.filter((item) => !recentSet.has(item.id));

  const row = (item: CompanySwitcherItem) => (
    <CommandItem key={`${openKey}-${item.id}`} value={`${item.name} ${item.ico ?? ""}`} onSelect={() => { onChange(item.id); close(); }}>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.name}</span>
        {item.ico ? <span className="block text-xs text-muted-foreground">IČO {item.ico}</span> : null}
      </span>
      {item.id === value ? <Check className="size-4 text-primary" /> : null}
    </CommandItem>
  );

  return (
    <>
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
          <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => { close(); onCreate(); }}>
            <Plus className="size-4" />
            {createLabel}
          </Button>
        </div>
      ) : null}
    </>
  );
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
  // Aktuálně vybraná firma se v „Posledních“ nezobrazuje – je vidět v hlavičce.
  const recent = useMemo(
    () =>
      recentIds
        .filter((id) => id !== value)
        .map((id) => items.find((item) => item.id === id))
        .filter((item): item is CompanySwitcherItem => Boolean(item)),
    [items, recentIds, value],
  );
  const [openKey, setOpenKey] = useState(0);

  return (
    <ContextPill
      label={label}
      value={selected?.name ?? emptyText}
      compactValue={selected?.name ?? emptyText}
      tooltip={selected ? `${label}: ${selected.name}${selected.ico ? ` · IČO ${selected.ico}` : ""}` : `${label}: ${emptyText}`}
      valueClassName="text-sm font-semibold xl:text-sm"
      className={`h-9 max-w-[72px] px-1.5 md:max-w-[240px] xl:max-w-[360px] ${className ?? ""}`}
      contentClassName="w-[380px]"
      onClick={() => setOpenKey((key) => key + 1)}
    >
      <CompanySwitcherContent
        items={items}
        value={value}
        onChange={onChange}
        recent={recent}
        openKey={openKey}
        searchPlaceholder={searchPlaceholder}
        recentLabel={recentLabel}
        allLabel={allLabel}
        emptyText={emptyText}
        createLabel={createLabel}
        onCreate={onCreate}
      />
    </ContextPill>
  );
}
