import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../../lib/utils";
import { InactiveTag } from "../data-display/inactive-tag";

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
  placeholder = "— nevybráno —",
  emptyLabel = "— nevybráno —",
  placeholderValueLabel,
  allowEmpty = true,
  disabled,
  id,
  className,
  triggerClassName,
  ariaLabel,
  inactiveLabel = "neaktivní",
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
}) {
  const current = value ?? "";
  const known = options.some((o) => o.value === current);
  const selectedOption = options.find((option) => option.value === current);
  const emptyValueLabel = placeholderValueLabel ?? emptyLabel;
  const selectedLabel =
    current === "" && allowEmpty ? (
      emptyValueLabel
    ) : selectedOption?.inactive ? (
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate">{selectedOption.label}</span>
        <InactiveTag label={inactiveLabel} />
      </span>
    ) : (
      (selectedOption?.selectedLabel ?? selectedOption?.label)
    );
  const offered = options.filter((option) => !option.inactive || option.value === current);

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
        <SelectValue placeholder={placeholder}>
          <span className="block min-w-0 truncate">
            {selectedLabel ?? (current || placeholder)}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty ? <SelectItem value={EMPTY}>{emptyValueLabel}</SelectItem> : null}
        {!known && current !== "" ? (
          <SelectItem value={current} disabled>
            {current}
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
                <InactiveTag label={inactiveLabel} />
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
