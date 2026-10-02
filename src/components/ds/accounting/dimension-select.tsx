import React, { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, Pencil } from "lucide-react";

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
import { InactiveTag } from "../data-display/inactive-tag";
import { formatCodeName } from "../../../lib/code-format";
import { useDsTexts } from "../../../ds-texts";

export type DimensionOption = {
  id: string;
  parentId?: string | null;
  /** Kód zakázky nebo střediska. */
  code?: string;
  name: string;
  /** Nadřazené větve bývají vidět, ale nejdou vybrat. */
  selectable?: boolean;
  /** Vysvětlení, proč nejde vybrat. */
  reason?: string;
  /** Neaktivní položka se nenabízí; vybraná se ukáže se štítkem „neaktivní“. */
  active?: boolean;
};

const label = (option: DimensionOption) => formatCodeName(option.code, option.name);

/** Výběr zakázky nebo střediska ze stromu; nevolitelné uzly jsou vidět s vysvětlením. */
export function DimensionSelect({
  options: allOptions,
  value,
  onChange,
  placeholder = "Vyberte zakázku",
  searchPlaceholder = "Hledat zakázku…",
  emptyText = "Žádná zakázka nenalezena",
  defaultReason = "Na tuto větev nelze účtovat, vyberte podřízenou položku",
  allowClear = true,
  clearLabel = "— nevybráno —",
  disabled,
  initialSearch = "",
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  id,
  className,
  inactiveLabel = "neaktivní",
  onEditSelected,
  editSelectedLabel,
}: {
  options: DimensionOption[];
  inactiveLabel?: string;
  value: string | null | undefined;
  onChange: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  defaultReason?: string;
  allowClear?: boolean;
  clearLabel?: string;
  disabled?: boolean;
  initialSearch?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  id?: string;
  className?: string;
  /** Otevře úpravu vybraného záznamu. */
  onEditSelected?: (id: string) => void;
  /** Přístupný název tužky. */
  editSelectedLabel?: string;
}) {
  const resolvedEditSelectedLabel = editSelectedLabel ?? useDsTexts().documentForm.editSelected;
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(initialSearch);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // Po zavření Radix vrátí fokus na trigger – potlačíme okamžité znovuotevření.
  const suppressFocusOpen = useRef(false);
  // Fokus z kliknutí myší necháváme na Radix (sám přepne), jinak by klik zavřel.
  const pointerDown = useRef(false);

  const changeOpen = (next: boolean) => {
    if (!next) suppressFocusOpen.current = true;
    setOpen(next);
    onOpenChange?.(next);
  };

  const options = useMemo(
    () => allOptions.filter((option) => option.active !== false),
    [allOptions],
  );
  const selectedAny = value ? allOptions.find((option) => option.id === value) : undefined;
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
  const childrenOf = useMemo(() => {
    const map = new Map<string, DimensionOption[]>();
    for (const option of options) {
      const parent = option.parentId && byId.has(option.parentId) ? option.parentId : "";
      const list = map.get(parent) ?? [];
      list.push(option);
      map.set(parent, list);
    }
    return map;
  }, [byId, options]);

  const matched = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("cs");
    if (!needle) return null;
    const keep = new Set<string>();
    for (const option of options) {
      if (!label(option).toLocaleLowerCase("cs").includes(needle)) continue;
      keep.add(option.id);
      let parentId = option.parentId ?? null;
      let guard = 0;
      while (parentId && guard++ < 50) {
        keep.add(parentId);
        parentId = byId.get(parentId)?.parentId ?? null;
      }
    }
    return keep;
  }, [byId, options, query]);

  const selected = selectedAny;

  const renderCommandNode = (option: DimensionOption, level: number): React.ReactNode => {
    const children = childrenOf.get(option.id) ?? [];
    const isCollapsed = !matched && collapsed[option.id] === true;
    const blocked = option.selectable === false;

    const node = (
      <CommandItem
        key={option.id}
        value={`${option.code ?? ""} ${option.name} ${option.id}`}
        disabled={blocked}
        onSelect={() => {
          if (blocked) return;
          onChange(option.id);
          changeOpen(false);
        }}
        className={cn("flex items-center gap-1", blocked && "opacity-50")}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {children.length ? (
          <div
            className="flex size-5 shrink-0 items-center justify-center rounded-md hover:bg-accent/50"
            onClick={(event) => {
              event.stopPropagation();
              setCollapsed({ ...collapsed, [option.id]: !isCollapsed });
            }}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
          </div>
        ) : (
          <span className="size-5 shrink-0" />
        )}
        <span className="min-w-0 flex-1 truncate">{label(option)}</span>
        {blocked ? (
          <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {option.reason ?? defaultReason}
          </span>
        ) : null}
        {selected?.id === option.id ? <Check className="size-4 shrink-0" /> : null}
      </CommandItem>
    );

    if (isCollapsed) return node;

    const childNodes = children
      .filter((child) => !matched || matched.has(child.id))
      .map((child) => renderCommandNode(child, level + 1));

    return (
      <React.Fragment key={option.id}>
        {node}
        {childNodes}
      </React.Fragment>
    );
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
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
          className={cn("h-[var(--control-h)] w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? label(selected) : placeholder}
            {selected?.active === false ? (
              <InactiveTag label={inactiveLabel} className="ml-2" />
            ) : null}
          </span>
          {selected && onEditSelected && !disabled ? (
            <span
              role="button"
              tabIndex={0}
              title={resolvedEditSelectedLabel}
              aria-label={resolvedEditSelectedLabel}
              className="rounded-md p-1 hover:bg-muted"
              onClick={(event) => {
                event.stopPropagation();
                onEditSelected(selected.id);
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();
                event.stopPropagation();
                onEditSelected(selected.id);
              }}
            >
              <Pencil className="size-3.5" />
            </span>
          ) : null}
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
        <Command loop>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
            onKeyDown={onKeyDown}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            {allowClear && !query && (
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    onChange("");
                    changeOpen(false);
                  }}
                  className="text-muted-foreground"
                >
                  {clearLabel}
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup>
              {(childrenOf.get("") ?? [])
                .filter((option) => !matched || matched.has(option.id))
                .map((option) => renderCommandNode(option, 0))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
