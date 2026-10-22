import { useState } from "react";
import { Check, Plus } from "lucide-react";

import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Command } from "../../ui/command";
import {
  InlineSearchPopover as Popover,
  InlineSearchContent as PopoverContent,
  InlineSearchTrigger as PopoverTrigger,
  InlineSearchInput,
} from "./inline-search";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";
import { SelectSearchAction } from "./select-search-action";

export type TagOption = {
  id: string;
  name: string;
  /** Barva štítku jako CSS hodnota; bez ní se použije výchozí odstín. */
  color?: string | null;
};

/**
 * Výběr štítků k záznamu. Seznam štítků i případné zakládání nového
 * dodává aplikace přes props – komponenta nic nenačítá.
 */
export function TagPicker({
  tags,
  value,
  onChange,
  onCreate,
  placeholder = "Hledat štítek…",
  addLabel = "Štítky",
  createLabel,
  createDisabledReason,
  emptyLabel = "Žádné štítky",
  className,
}: {
  tags: TagOption[];
  value: string[];
  onChange: (next: string[]) => void;
  onCreate?: (name: string) => void | Promise<void>;
  placeholder?: string;
  addLabel?: string;
  /** Přístupný název ＋ v řádku hledání; výchozí DsTexts.selectCreate.tag. */
  createLabel?: string;
  /** Důvod zašedlého ＋ (např. chybějící oprávnění). */
  createDisabledReason?: string;
  emptyLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ds = useDsTexts();

  const selected = tags.filter((t) => value.includes(t.id));
  const filtered = tags.filter((t) => t.name.toLowerCase().includes(query.trim().toLowerCase()));
  const duplicate = tags.some((t) => t.name.trim().toLowerCase() === query.trim().toLowerCase());
  const canCreate = Boolean(onCreate && query.trim() && !duplicate);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {selected.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          style={tag.color ? { backgroundColor: tag.color, color: "#fff" } : undefined}
        >
          {tag.name}
        </Badge>
      ))}
      <Popover onSearchChange={setQuery} open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" size="sm" role="combobox" aria-label={addLabel}>
            <Plus className="size-3.5" />
            {addLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <Command shouldFilter={false}>
            <InlineSearchInput
              value={query}
              onValueChange={setQuery}
              placeholder={placeholder}
              className="h-8 min-w-0 flex-1"
              trailingAction={
                onCreate ? (
                  <SelectSearchAction
                    label={createLabel ?? ds.selectCreate.tag}
                    disabled={!canCreate}
                    disabledReason={
                      createDisabledReason ??
                      (!query.trim()
                        ? ds.selectCreate.emptyQuery
                        : duplicate
                          ? ds.selectCreate.duplicate
                          : undefined)
                    }
                    onCreate={async () => {
                      await onCreate(query.trim());
                      setQuery("");
                    }}
                  />
                ) : null
              }
            />
            <ul className="mt-2 max-h-56 space-y-0.5 overflow-auto">
              {filtered.length === 0 && !canCreate ? (
                <li className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</li>
              ) : null}
              {filtered.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover-surface"
                    onClick={() => toggle(tag.id)}
                  >
                    <span>{tag.name}</span>
                    {value.includes(tag.id) ? <Check className="size-4" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
