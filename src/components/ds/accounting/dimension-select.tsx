import React, { useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react";

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
};

const label = (option: DimensionOption) =>
  option.code ? `${option.code} – ${option.name}` : option.name;

/** Výběr zakázky nebo střediska ze stromu; nevolitelné uzly jsou vidět s vysvětlením. */
export function DimensionSelect({
  options,
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
  id,
  className,
}: {
  options: DimensionOption[];
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
  id?: string;
  className?: string;
}) {
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
  };

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

  const selected = value ? byId.get(value) : undefined;

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
            className="flex size-5 shrink-0 items-center justify-center rounded hover:bg-accent/50"
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
          className={cn("h-9 w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? label(selected) : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-0" align="start">
        <Command loop>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
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
