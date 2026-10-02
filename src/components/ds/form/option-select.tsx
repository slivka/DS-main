import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../../lib/utils";
import { InactiveTag } from "../data-display/inactive-tag";
import { useDsTexts } from "../../../ds-texts";
import { SearchableOptionSelect } from "./searchable-option-select";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  muted?: boolean;
  trailingLabel?: ReactNode;
  /** Kratší text ve spouštěči vybrané položky (v nabídce zůstává `label`). */
  selectedLabel?: ReactNode;
  /** Neaktivní položka se nenabízí; vybraná se ukáže se štítkem „neaktivní“. */
  inactive?: boolean;
  /** Text použitý pro hledání, pokud `label` není řetězec. */
  searchText?: string;
};

const EMPTY = "__empty__";

/**
 * Sdílený výběr ze seznamu (nahrazuje nativní <select>).
 * Prázdná hodnota sa mapuje na interní klíč, lebo Radix Select nepodporuje prázdný value.
 */
export function OptionSelect({
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  placeholderValueLabel,
  allowEmpty = true,
  disabled,
  id,
  className,
  triggerClassName,
  ariaLabel,
  inactiveLabel,
  unknownValueLabel,
  searchable,
  searchPlaceholder,
  noResultsLabel,
  selectedLabel,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  /** Text prázdné položky i zobrazené prázdné hodnoty, např. „Neověřeno“. */
  placeholderValueLabel?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  triggerClassName?: string;
  /** Přístupný název výběru, pokud jej neposkytuje navázaný popisek. */
  ariaLabel?: string;
  inactiveLabel?: string;
  /** Čitelná náhrada za hodnotu, která už není v nabídce. */
  unknownValueLabel?: string;
  /** Zapne hledání; bez hodnoty se zapne od osmi položek. */
  searchable?: boolean;
  /** Výzva v hledání. */
  searchPlaceholder?: string;
  /** Text prázdného výsledku hledání. */
  noResultsLabel?: string;
  /** Určí zkrácený obsah vybrané hodnoty. */
  selectedLabel?: (option: SelectOption) => ReactNode;
}) {
  const texts = useDsTexts().optionSelect;
  const resolvedPlaceholder = placeholder ?? texts.emptyValue;
  const resolvedEmptyLabel = emptyLabel ?? texts.emptyValue;
  const resolvedInactiveLabel = inactiveLabel ?? texts.inactive;
  const resolvedUnknownValueLabel = unknownValueLabel ?? texts.unknownValue;
  const current = value ?? "";
  const known = options.some((o) => o.value === current);
  const selectedOption = options.find((option) => option.value === current);
  const emptyValueLabel = placeholderValueLabel ?? resolvedEmptyLabel;
  const selectedLabel =
    current === "" && allowEmpty ? (
      emptyValueLabel
    ) : selectedOption?.inactive ? (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{selectedOption.label}</span>
        <InactiveTag label={resolvedInactiveLabel} />
      </span>
    ) : (
      (selectedOption?.selectedLabel ?? selectedOption?.label)
    );
  const triggerLabel = known || current === "" ? selectedLabel : resolvedUnknownValueLabel;
  const offered = options.filter((option) => !option.inactive || option.value === current);
  const useSearch = searchable ?? options.length >= 8;

  if (useSearch)
    return (
      <SearchableOptionSelect
        id={id}
        value={current}
        options={options}
        onChange={onChange}
        allowEmpty={allowEmpty}
        disabled={disabled}
        ariaLabel={ariaLabel}
        className={cn(className, triggerClassName)}
        emptyValueLabel={emptyValueLabel}
        inactiveLabel={resolvedInactiveLabel}
        unknownValueLabel={resolvedUnknownValueLabel}
        searchPlaceholder={searchPlaceholder ?? texts.searchPlaceholder}
        noResultsLabel={noResultsLabel ?? texts.noResults}
        selectedLabel={selectedLabel}
      />
    );

  return (
    <Select
      value={current === "" ? (allowEmpty ? EMPTY : "") : current}
      onValueChange={(v) => onChange(v === EMPTY ? "" : v)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={cn(
          "h-[var(--control-h)] w-full min-w-0",
          current === "" ? "text-muted-foreground" : "text-foreground",
          className,
          triggerClassName,
        )}
      >
        <SelectValue placeholder={resolvedPlaceholder}>
          <span className="flex min-w-0 items-center justify-between gap-3">
            <span className="truncate">{triggerLabel ?? resolvedPlaceholder}</span>
            {selectedOption?.trailingLabel && !selectedOption.inactive ? (
              <span className="shrink-0 text-xs">{selectedOption.trailingLabel}</span>
            ) : null}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty ? <SelectItem value={EMPTY}>{emptyValueLabel}</SelectItem> : null}
        {!known && current !== "" ? (
          <SelectItem value={current} disabled>
            {resolvedUnknownValueLabel}
          </SelectItem>
        ) : null}
        {offered.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            disabled={o.disabled || o.inactive}
            className={cn(o.muted && "text-muted-foreground")}
          >
            <span className="flex min-w-0 items-center justify-between gap-3">
              <span className="truncate">{o.label}</span>
              {o.inactive ? (
                <InactiveTag label={resolvedInactiveLabel} />
              ) : o.trailingLabel ? (
                <span className="shrink-0 text-xs">{o.trailingLabel}</span>
              ) : null}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
