import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, ChevronsUpDown } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
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
  id?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

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

  const renderNodes = (parentId: string, level: number): React.ReactNode[] =>
    (childrenOf.get(parentId) ?? [])
      .filter((option) => !matched || matched.has(option.id))
      .flatMap((option) => {
        const children = childrenOf.get(option.id) ?? [];
        const isCollapsed = !matched && collapsed[option.id] === true;
        const blocked = option.selectable === false;
        const row = (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-1 rounded-md px-1 py-1 text-sm",
              !blocked && "hover-surface cursor-pointer",
              blocked && "text-muted-foreground",
            )}
            style={{ paddingLeft: `${level * 16 + 4}px` }}
            onClick={() => {
              if (blocked) return;
              onChange(option.id);
              setOpen(false);
            }}
          >
            {children.length ? (
              <button
                type="button"
                aria-label={isCollapsed ? "Rozbalit" : "Sbalit"}
                className="flex size-5 shrink-0 items-center justify-center rounded"
                onClick={(event) => {
                  event.stopPropagation();
                  setCollapsed({ ...collapsed, [option.id]: !isCollapsed });
                }}
              >
                {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
              </button>
            ) : (
              <span className="size-5 shrink-0" />
            )}
            <span className="min-w-0 flex-1 truncate">{label(option)}</span>
            {blocked ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px]">
                      {option.reason ?? defaultReason}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{option.reason ?? defaultReason}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : null}
            {selected?.id === option.id ? <Check className="size-4 shrink-0" /> : null}
          </div>
        );
        return isCollapsed ? [row] : [row, ...renderNodes(option.id, level + 1)];
      });

  const nodes = renderNodes("", 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          disabled={disabled}
          className={cn("h-9 w-full justify-between font-normal", className)}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? label(selected) : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[320px] p-2" align="start">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          className="mb-2 h-9"
        />
        <div className="max-h-72 overflow-y-auto">
          {allowClear && !query ? (
            <div
              className="hover-surface cursor-pointer rounded-md px-2 py-1 text-sm text-muted-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              {clearLabel}
            </div>
          ) : null}
          {nodes.length ? nodes : <p className="p-2 text-sm text-muted-foreground">{emptyText}</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
