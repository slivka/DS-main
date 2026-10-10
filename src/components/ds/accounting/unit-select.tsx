import * as React from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { FieldInlineActions } from "../form/field-inline-actions";

import { Button } from "../../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { formatCodeName } from "../../../lib/code-format";
import { InactiveTag } from "../data-display/inactive-tag";
import { useDsTexts } from "../../../ds-texts";

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
  /** Otevře úpravu vybrané měrné jednotky. */
  onEditSelected?: (id: string) => void;
  /** Přístupný název tužky. */
  editSelectedLabel?: string;
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
  onEditSelected,
  editSelectedLabel,
}: UnitSelectProps) {
  const dsTexts = useDsTexts();
  const resolvedEditSelectedLabel = editSelectedLabel ?? dsTexts.documentForm.editSelected;
  const [open, setOpen] = React.useState(defaultOpen);
  const [query, setQuery] = React.useState(initialSearch);
  const [creating, setCreating] = React.useState(false);
  const selected = options.find((item) => item.id === value);
  const normalized = query.trim().toLocaleLowerCase("cs");
  const filtered = options.filter(
    (item) =>
      item.isActive &&
      (!normalized ||
        formatCodeName(item.code, item.name).toLocaleLowerCase("cs").includes(normalized)),
  );
  const canCreate = Boolean(
    onCreateUnit &&
    query.trim() &&
    !options.some((item) => item.code.toLocaleLowerCase("cs") === normalized),
  );

  return (
    <div className="relative h-full min-w-0">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              // Kompaktní buňka: šipka 0,875rem na 0,125rem od okraje, tužka 1,5rem těsně vlevo od ní.
              "relative h-full w-full min-w-0 justify-between rounded-sm px-1 pr-[1.25rem] font-normal",
              selected &&
                onEditSelected &&
                !disabled &&
                "pr-[calc(0.125rem+0.875rem+0.125rem+1.5rem+0.125rem)]",
              className,
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-left",
                !selected && "text-muted-foreground",
              )}
            >
              {selected?.code ?? placeholder}
            </span>
            {selected && !selected.isActive ? <InactiveTag label={inactiveLabel} /> : null}
            <ChevronDown
              data-slot="select-chevron"
              className="absolute right-0.5 top-1/2 size-3.5 -translate-y-1/2 opacity-50"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-64 p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              onKeyDown={onKeyDown}
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {filtered.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={formatCodeName(item.code, item.name)}
                    onSelect={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1 truncate font-mono font-semibold">
                      {formatCodeName(item.code, item.name)}
                    </span>
                    {item.id === value ? <Check /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              {canCreate ? (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      disabled={creating}
                      onSelect={async () => {
                        const code = query.trim();
                        if (!onCreateUnit) return;
                        setCreating(true);
                        try {
                          const created = await onCreateUnit(code);
                          onChange(created.id);
                          setOpen(false);
                          setQuery("");
                        } finally {
                          setCreating(false);
                        }
                      }}
                    >
                      <Plus />
                      {createLabel(query.trim())}
                    </CommandItem>
                  </CommandGroup>
                </>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && onEditSelected && !disabled ? (
        <FieldInlineActions
          size="compact"
          className="right-[calc(0.125rem+0.875rem+0.125rem)]"
          onEdit={() => onEditSelected(selected.id)}
          editLabel={resolvedEditSelectedLabel}
        />
      ) : null}
    </div>
  );
}
