import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { SelectSearchAction } from "../form/select-search-action";
import { FieldInlineActions } from "../form/field-inline-actions";

import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "../../ui/command";
import {
  InlineSearchPopover as Popover,
  InlineSearchContent as PopoverContent,
  InlineSearchTrigger as PopoverTrigger,
  InlineSearchInput as CommandInput,
} from "../form/inline-search";
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
  /** Důvod zakázání založení jednotky. */
  createDisabledReason?: string;
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
  createDisabledReason,
  disabled,
  initialSearch = "",
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  placeholder = "Vyberte MJ",
  searchPlaceholder = "Hledat kód nebo název…",
  emptyText = "Žádná měrná jednotka nenalezena",
  createLabel,
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
  const duplicate = options.some((item) =>
    [item.code, item.name].some((text) => text.trim().toLocaleLowerCase("cs") === normalized),
  );
  const canCreate = Boolean(onCreateUnit && query.trim() && !duplicate);

  return (
    <div className="relative h-[var(--control-h)] min-w-0 in-[td]:h-full">
      <Popover
        onSearchChange={setQuery}
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
              "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100",
              // Kompaktní buňka: šipka 0,875rem na 0,125rem od okraje, tužka 1,5rem těsně vlevo od ní.
              "relative h-full w-full min-w-0 justify-between rounded-md px-1 pr-[1.25rem] font-normal",
              selected &&
                onEditSelected &&
                !disabled &&
                "pr-[calc(0.125rem+0.875rem+0.125rem+1.5rem+0.125rem)]",
              className,
            )}
          >
            <span
              data-placeholder={!selected ? "" : undefined}
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
        <PopoverContent align="start" className="ds-select-popover p-0">
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              onKeyDown={onKeyDown}
              trailingAction={
                onCreateUnit ? (
                  <SelectSearchAction
                    label={createLabel?.(query.trim()) ?? dsTexts.selectCreate.unit}
                    disabled={creating || !canCreate}
                    disabledReason={
                      createDisabledReason ??
                      (!query.trim()
                        ? dsTexts.selectCreate.emptyQuery
                        : duplicate
                          ? dsTexts.selectCreate.duplicate
                          : undefined)
                    }
                    onCreate={() => {
                      if (!onCreateUnit) return;
                      setCreating(true);
                      void onCreateUnit(query)
                        .then((created) => {
                          onChange(created.id);
                          setOpen(false);
                          setQuery("");
                        })
                        .finally(() => setCreating(false));
                    }}
                  />
                ) : undefined
              }
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
