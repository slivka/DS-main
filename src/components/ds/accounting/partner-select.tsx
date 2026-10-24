import { useMemo, useState } from "react";
import { Check, ChevronDown, Download, Star } from "lucide-react";
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
import { InactiveTag } from "../data-display/inactive-tag";
import { useDsTexts } from "../../../ds-texts";

export type PartnerOption = {
  id: string;
  name: string;
  /** IČO partnera (jen číslice). */
  ico?: string;
  /** DIČ partnera. */
  dic?: string;
  /** Země partnera, obvykle ISO kód CZ. */
  country?: string;
  /** Právnická nebo fyzická osoba pro volbu veřejného registru. */
  kind?: "company" | "person";
  active?: boolean;
};

/** Zobrazení partnera v jednom řádku: „Název · IČO“. */
export function formatPartner(partner: Pick<PartnerOption, "name" | "ico"> | null | undefined) {
  if (!partner) return "";
  return partner.ico ? `${partner.name} · ${partner.ico}` : partner.name;
}

/** Výběr obchodního partnera – hledání podle názvu i IČO, bez vazby na databázi. */
export function PartnerSelect({
  partners,
  value,
  onChange,
  onCreate,
  onLoadFromAres,
  placeholder = "Vyberte partnera",
  searchPlaceholder = "Hledat název nebo IČO…",
  emptyText = "Žádný partner nenalezen",
  createLabel,
  createDisabledReason,
  aresLabel = "Načíst z ARES",
  inactiveLabel = "neaktivní",
  disabled,
  initialSearch = "",
  defaultOpen = false,
  onOpenChange,
  onKeyDown,
  id,
  className,
  onEditSelected,
  editSelectedLabel,
}: {
  partners: PartnerOption[];
  value: string | null | undefined;
  onChange: (id: string) => void;
  /** Akce „Nový partner“ – bez ní se volba nezobrazí. */
  onCreate?: (query: string) => void;
  /** Akce „Načíst z ARES“ – bez ní se volba nezobrazí. */
  onLoadFromAres?: (query: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  createLabel?: string;
  /** Důvod zakázání vytvoření partnera. */
  createDisabledReason?: string;
  aresLabel?: string;
  inactiveLabel?: string;
  disabled?: boolean;
  initialSearch?: string;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  id?: string;
  className?: string;
  /** Otevře úpravu právě vybraného partnera. */
  onEditSelected?: (id: string) => void;
  /** Přístupný název tužky. */
  editSelectedLabel?: string;
  /** Oblíbení partneři – řadí se nahoře a mají hvězdičku. */
  favoriteIds?: string[];
  /** Přepnutí oblíbeného partnera hvězdičkou v nabídce. */
  onToggleFavorite?: (id: string) => void;
}) {
  const dsTexts = useDsTexts();
  const resolvedEditSelectedLabel = editSelectedLabel ?? dsTexts.documentForm.editSelected;
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState(initialSearch);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  const favorites = useMemo(() => new Set(favoriteIds ?? []), [favoriteIds]);
  const list = useMemo(
    () =>
      partners
        .filter((partner) => partner.active !== false)
        .sort(
          (a, b) =>
            Number(favorites.has(b.id)) - Number(favorites.has(a.id)) ||
            a.name.localeCompare(b.name, "cs"),
        ),
    [favorites, partners],
  );
  const selected = partners.find((partner) => partner.id === value);

  return (
    <div className="relative flex min-w-0 items-center">
      <Popover onSearchChange={setQuery} open={open} onOpenChange={changeOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100",
              "relative h-[var(--control-h)] w-full min-w-0 justify-between pr-9 font-normal",
              selected &&
                onEditSelected &&
                !disabled &&
                "pr-[calc(1rem+1rem+0.25rem+1.75rem+0.25rem)]",
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
              {selected ? formatPartner(selected) : placeholder}
            </span>
            {selected?.active === false ? <InactiveTag label={inactiveLabel} /> : null}
            <ChevronDown
              data-slot="select-chevron"
              className="absolute right-4 top-1/2 size-4 -translate-y-1/2 opacity-50"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="ds-select-popover p-0" align="start">
          <Command>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
              onKeyDown={onKeyDown}
              trailingAction={
                onCreate ? (
                  <SelectSearchAction
                    label={createLabel ?? dsTexts.selectCreate.partner}
                    disabledReason={createDisabledReason}
                    onCreate={() => {
                      onCreate(query);
                      changeOpen(false);
                    }}
                  />
                ) : undefined
              }
            />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {list.map((partner) => (
                  <CommandItem
                    key={partner.id}
                    value={`${partner.name} ${partner.ico ?? ""}`}
                    onSelect={() => {
                      onChange(partner.id);
                      changeOpen(false);
                    }}
                    className="gap-2"
                  >
                    <span className="min-w-0 flex-1 truncate" title={partner.name}>
                      {partner.name}
                    </span>
                    {partner.ico ? (
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {partner.ico}
                      </span>
                    ) : null}
                    {favorites.has(partner.id) || onToggleFavorite ? (
                      <button
                        type="button"
                        aria-label={
                          favorites.has(partner.id)
                            ? dsTexts.selectCreate.favoriteRemove
                            : dsTexts.selectCreate.favoriteAdd
                        }
                        title={
                          favorites.has(partner.id)
                            ? dsTexts.selectCreate.favoriteRemove
                            : dsTexts.selectCreate.favoriteAdd
                        }
                        aria-pressed={favorites.has(partner.id)}
                        disabled={!onToggleFavorite}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          onToggleFavorite?.(partner.id);
                        }}
                        className="shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:hover:text-muted-foreground"
                      >
                        <Star
                          className={cn(
                            "size-3.5",
                            favorites.has(partner.id) && "fill-amber-400 text-amber-400",
                          )}
                        />
                      </button>
                    ) : null}
                    {selected?.id === partner.id ? <Check className="size-4" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
              {onLoadFromAres ? (
                <div className="flex flex-wrap gap-2 border-t p-2">
                  {onLoadFromAres ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        changeOpen(false);
                        onLoadFromAres(query);
                      }}
                    >
                      <Download className="size-4" />
                      {aresLabel}
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selected && onEditSelected && !disabled ? (
        <FieldInlineActions
          onEdit={() => onEditSelected(selected.id)}
          editLabel={resolvedEditSelectedLabel}
        />
      ) : null}
    </div>
  );
}
