import { forwardRef, useState, type ComponentType, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "../../ui/command";
import { TruncatedText } from "../data-display/truncated-text";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";

export interface ContextSwitcherItem {
  id: string;
  label: string;
  /** Doplňující text vpravo (např. počet firem). */
  trailing?: string;
  /** Kontext, ve kterém aplikace právě pracuje – zelená tečka. */
  current?: boolean;
}

export interface ContextSwitcherAction {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  onSelect: () => void;
}

export interface ContextSwitcherProps {
  /** Název vybraného kontextu (tučně v tlačítku). */
  label: string;
  /** Menší šedý popis pod názvem. */
  description?: ReactNode;
  /** Vlastní ikona místo iniciál. */
  icon?: ReactNode;
  items: ContextSwitcherItem[];
  value: string | null;
  onValueChange: (id: string) => void;
  actions?: ContextSwitcherAction[];
  /** Hledání se zobrazí od tohoto počtu položek. Výchozí 6. */
  searchThreshold?: number;
  searchPlaceholder?: string;
  emptyText?: string;
  currentLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function contextInitials(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]!.toLocaleUpperCase("cs-CZ")).join("") || "?";
}

/** Přepínač kontextu (prostoru) nahoře v levém sloupci StandaloneShell. */
export const ContextSwitcher = forwardRef<HTMLButtonElement, ContextSwitcherProps>(function ContextSwitcher(
  { label, description, icon, items, value, onValueChange, actions = [], searchThreshold = 6, searchPlaceholder, emptyText, currentLabel, open, onOpenChange, className },
  ref,
) {
  const texts = useDsTexts().contextSwitcher;
  const [ownOpen, setOwnOpen] = useState(false);
  const isOpen = open ?? ownOpen;
  const setOpen = (next: boolean) => {
    if (open === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };
  const searchable = items.length >= searchThreshold;

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          data-slot="context-switcher"
          className={cn(
            "flex w-full min-w-0 items-center gap-2 rounded-md border border-grid-chrome bg-background p-2 text-left text-foreground shadow-sm transition-colors hover:border-input hover:bg-surface-hover focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=open]:border-primary",
            className,
          )}
        >
          <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground [&_svg]:size-4">
            {icon ?? contextInitials(label)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold" title={label}>{label}</span>
            {description ? <span className="block truncate text-xs text-muted-foreground">{description}</span> : null}
          </span>
          <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        data-slot="context-switcher-content"
        className="w-[max(var(--radix-popover-trigger-width),16rem)] max-w-[22rem] p-0 max-md:w-[calc(100vw-1rem)] max-md:max-w-[calc(100vw-1rem)]"
        onEscapeKeyDown={(event) => {
          // Esc zavře jen popover – nesmí se dostat k rámu (StandaloneShell).
          event.preventDefault();
          setOpen(false);
        }}
      >
        <Command>
          {searchable ? <CommandInput placeholder={searchPlaceholder ?? texts.search} /> : null}
          <CommandList>
            <CommandEmpty>{emptyText ?? texts.empty}</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem key={item.id} value={`${item.label} ${item.id}`} onSelect={() => { onValueChange(item.id); setOpen(false); }} data-selected-item={item.id === value || undefined}>
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    {item.id === value ? <Check aria-label={texts.selected} className="size-4 text-primary" /> : null}
                  </span>
                  <TruncatedText text={item.label} className="min-w-0 flex-1" />
                  {item.current ? <span role="img" aria-label={currentLabel ?? texts.current} title={currentLabel ?? texts.current} className="size-2 shrink-0 rounded-full bg-success" /> : null}
                  {item.trailing ? <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">{item.trailing}</span> : null}
                </CommandItem>
              ))}
            </CommandGroup>
            {actions.length ? (
              <>
                <CommandSeparator />
                <CommandGroup>
                  {actions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <CommandItem key={action.id} value={`__action ${action.label}`} onSelect={() => { setOpen(false); action.onSelect(); }}>
                        {Icon ? <Icon className="size-4 shrink-0" /> : <span className="size-4 shrink-0" />}
                        <span className="min-w-0 flex-1 truncate">{action.label}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
