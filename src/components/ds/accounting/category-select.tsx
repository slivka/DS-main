/** Kategorie · vlastní stromový výběr · nesmí rozhodovat o povolení účtu. */
import { ReadOnlyControlValue, useRecordReadOnly } from "../form/record-read-only";
import React, { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
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
import { formatCodeName } from "../../../lib/code-format";
import { useDsTexts } from "../../../ds-texts";

import type { CategoryOption, CategorySelectProps } from "./category-select-types";
export type { CategoryOption, CategorySelectProps } from "./category-select-types";

const label = (option: CategoryOption) => formatCodeName(option.code, option.name);

/** Výběr ekonomické kategorie; hledání a Enter sdílí inline-search. */
export const CategorySelect = React.forwardRef<HTMLButtonElement, CategorySelectProps>(
  function CategorySelect(
    {
      options: givenOptions,
      value,
      onChange,
      onCreate,
      createLabel,
      createDisabledReason,
      placeholder,
      searchPlaceholder,
      emptyText,
      defaultReason,
      allowClear,
      allowEmpty,
      emptyLabel,
      noResultsText,
      variant = "field",
      clearLabel,
      disabled,
      initialSearch = "",
      defaultOpen = false,
      onOpenChange,
      onKeyDown,
      id,
      className,
      inactiveLabel,
      onEditSelected,
      editSelectedLabel,
      ...buttonProps
    }: CategorySelectProps,
    ref: React.ForwardedRef<HTMLButtonElement>,
  ) {
    const readOnly = useRecordReadOnly();
    const dsTexts = useDsTexts();
    const resolvedEditSelectedLabel = editSelectedLabel ?? dsTexts.documentForm.editSelected;
    const [open, setOpen] = useState(defaultOpen);
    const [query, setQuery] = useState(initialSearch);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const changeOpen = (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    };

    // Nově založené položky, které rodič ještě nedoplnil do voleb.
    const [created, setCreated] = useState<CategoryOption[]>([]);
    const mergedOptions = useMemo(() => {
      const known = new Set(givenOptions.map((option) => option.id));
      const extra = created.filter((option) => !known.has(option.id));
      return extra.length ? [...givenOptions, ...extra] : givenOptions;
    }, [givenOptions, created]);
    const allOptions = mergedOptions;
    const runCreate = (text: string) => {
      if (!onCreate) return;
      const result = onCreate(text);
      if (!result || typeof result.then !== "function") return;
      result.then(
        (option) => {
          if (!option || option.postable === false || option.selectable === false) return;
          setCreated((list) => [...list.filter((item) => item.id !== option.id), option]);
          onChange(option.id);
        },
        // Zamítnutí = aplikace zakládání zrušila nebo chybu ukázala sama; výběr se nemění.
        () => {},
      );
    };

    const options = useMemo(
      () => allOptions.filter((option) => option.active !== false && option.is_active !== false),
      [allOptions],
    );
    const selectedAny = value ? allOptions.find((option) => option.id === value) : undefined;
    const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);
    const childrenOf = useMemo(() => {
      const map = new Map<string, CategoryOption[]>();
      for (const option of options) {
        const parentId = option.parentId ?? option.parent_id;
        const parent = parentId && byId.has(parentId) ? parentId : "";
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
        let parentId = option.parentId ?? option.parent_id ?? null;
        let guard = 0;
        while (parentId && guard++ < 50) {
          keep.add(parentId);
          parentId = byId.get(parentId)?.parentId ?? byId.get(parentId)?.parent_id ?? null;
        }
      }
      return keep;
    }, [byId, options, query]);

    const selected = selectedAny;

    const renderCommandNode = (option: CategoryOption, level: number): React.ReactNode => {
      const children = childrenOf.get(option.id) ?? [];
      const isCollapsed = !matched && collapsed[option.id] === true;
      const blocked = option.selectable === false || option.postable === false;

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
          style={{ paddingLeft: `${level + 0.5}rem` }}
        >
          {children.length ? (
            <div
              className="flex size-5 shrink-0 items-center justify-center rounded-md hover:bg-accent/50"
              onClick={(event) => {
                event.stopPropagation();
                setCollapsed({ ...collapsed, [option.id]: !isCollapsed });
              }}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </div>
          ) : (
            <span className="size-5 shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate" title={label(option)}>
            {label(option)}
          </span>
          {blocked ? (
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {option.reason ?? defaultReason ?? dsTexts.economicCategory.notPostable}
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

    if (readOnly) {
      return (
        <ReadOnlyControlValue id={id}>
          {selected ? formatCodeName(selected.code, selected.name) : ""}
        </ReadOnlyControlValue>
      );
    }

    return (
      <div className="relative min-w-0">
        <Popover onSearchChange={setQuery} open={open} onOpenChange={changeOpen}>
          <PopoverTrigger asChild>
            <Button
              {...buttonProps}
              ref={ref}
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
                variant === "cell" && "journal-cell-editor",
                className,
              )}
            >
              <span
                data-placeholder={!value ? "" : undefined}
                className={cn(
                  "min-w-0 flex-1 truncate text-left",
                  !selected && "text-muted-foreground",
                )}
              >
                {selected ? label(selected) : (placeholder ?? dsTexts.economicCategory.choose)}
                {selected?.active === false ? (
                  <InactiveTag
                    label={inactiveLabel ?? dsTexts.optionSelect.inactive}
                    className="ml-2"
                  />
                ) : null}
              </span>
              <ChevronDown
                data-slot="select-chevron"
                className="absolute right-4 top-1/2 size-4 -translate-y-1/2 opacity-50"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="ds-select-popover p-0" align="start">
            <Command loop>
              <CommandInput
                placeholder={searchPlaceholder ?? dsTexts.economicCategory.search}
                value={query}
                onValueChange={setQuery}
                onKeyDown={onKeyDown}
                trailingAction={
                  onCreate ? (
                    <SelectSearchAction
                      label={createLabel ?? dsTexts.selectCreate.category}
                      disabledReason={createDisabledReason}
                      onCreate={() => {
                        runCreate(query);
                        changeOpen(false);
                      }}
                    />
                  ) : undefined
                }
              />
              <CommandList>
                <CommandEmpty>
                  {emptyText ?? noResultsText ?? dsTexts.economicCategory.empty}
                </CommandEmpty>
                {(allowClear ?? allowEmpty ?? true) && !query && (
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        onChange("");
                        changeOpen(false);
                      }}
                      className="text-muted-foreground"
                    >
                      {clearLabel ?? emptyLabel ?? dsTexts.optionSelect.emptyValue}
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
        {selected && onEditSelected && !disabled ? (
          <FieldInlineActions
            onEdit={() => onEditSelected(selected.id)}
            editLabel={resolvedEditSelectedLabel}
          />
        ) : null}
      </div>
    );
  },
);
