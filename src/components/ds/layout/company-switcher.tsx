import { useState, type ComponentType } from "react";
import { InlineSearchInput as CommandInput } from "../form/inline-search";
import { Building2, Check, Plus } from "lucide-react";

import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import { cn } from "../../../lib/utils";
import { ContextPill, useContextPillClose } from "./context-pill";

export type CompanySwitcherItem = { id: string; name: string; ico?: string };

/** Doplňková akce pod oddělovačem (např. „Spravovat firmy…“ pro správce). */
export interface CompanySwitcherAction {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export interface CompanySwitcherProps {
  items: CompanySwitcherItem[];
  value: string;
  onChange: (id: string) => void;
  label?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: string;
  onCreate?: () => void;
  /** Akce pod oddělovačem, pod „Nová firma“. Bez nich vzhled i chování beze změny. */
  actions?: CompanySwitcherAction[];
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/** Obsah popoveru – je uvnitř ContextPill, takže může popover zavřít. */
function CompanySwitcherContent({
  items,
  value,
  onChange,
  searchPlaceholder,
  emptyText,
  createLabel,
  onCreate,
  actions = [],
  query,
  onQueryChange,
}: {
  items: CompanySwitcherItem[];
  value: string;
  onChange: (id: string) => void;
  searchPlaceholder: string;
  emptyText: string;
  createLabel: string;
  onCreate?: () => void;
  actions?: CompanySwitcherAction[];
  query: string;
  onQueryChange: (query: string) => void;
}) {
  const close = useContextPillClose();
  const row = (item: CompanySwitcherItem) => (
    <CommandItem
      key={item.id}
      value={`${item.name} ${item.ico ?? ""}`}
      onSelect={() => {
        onChange(item.id);
        close();
      }}
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.name}</span>
        {item.ico ? (
          <span className="block text-xs text-muted-foreground">IČO {item.ico}</span>
        ) : null}
      </span>
      {item.id === value ? <Check className="size-4 text-primary" /> : null}
    </CommandItem>
  );

  return (
    <>
      <Command>
        <CommandInput value={query} onValueChange={onQueryChange} placeholder={searchPlaceholder} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup>{items.map(row)}</CommandGroup>
        </CommandList>
      </Command>
      {onCreate ? (
        <div className="border-t p-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              close();
              onCreate();
            }}
          >
            <Plus className="size-4" />
            {createLabel}
          </Button>
        </div>
      ) : null}
      {actions.length ? (
        <div data-slot="company-switcher-actions" className="border-t p-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  close();
                  action.onSelect();
                }}
              >
                {Icon ? <Icon className="size-4" /> : <span className="size-4" />}
                <span className="min-w-0 truncate">{action.label}</span>
              </Button>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

/** Neutrální obrysový výběr firmy s hledáním v jednom seznamu. */
export function CompanySwitcher({
  items,
  value,
  onChange,
  label = "Firma",
  searchPlaceholder = "Hledat firmu…",
  emptyText = "Žádná firma nebyla nalezena.",
  createLabel = "Nová firma",
  onCreate,
  actions,
  className,
  open,
  onOpenChange,
}: CompanySwitcherProps) {
  const selected = items.find((item) => item.id === value);
  const [query, setQuery] = useState("");

  return (
    <ContextPill
      data-context-switcher="company"
      label={label}
      value={selected?.name ?? emptyText}
      compactValue={selected?.name ?? emptyText}
      icon={Building2}
      iconClassName="text-primary"
      tooltip={
        selected
          ? `${label}: ${selected.name}${selected.ico ? ` · IČO ${selected.ico}` : ""}`
          : `${label}: ${emptyText}`
      }
      valueClassName="text-base font-semibold"
      className={cn(
        "min-w-[4.5rem] max-w-[8.25rem] shrink border border-grid-chrome bg-background text-foreground shadow-sm hover:border-input hover:bg-surface-hover data-[state=open]:border-primary focus-visible:border-primary md:max-w-[17.5rem] xl:max-w-[23.75rem]",
        className,
      )}
      contentClassName="w-[380px]"
      open={open}
      onOpenChange={onOpenChange}
      onSearchChange={setQuery}
    >
      <CompanySwitcherContent
        items={items}
        value={value}
        onChange={onChange}
        searchPlaceholder={searchPlaceholder}
        emptyText={emptyText}
        createLabel={createLabel}
        onCreate={onCreate}
        actions={actions}
        query={query}
        onQueryChange={setQuery}
      />
    </ContextPill>
  );
}
