import type { ReactNode } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../../lib/utils";

export type SelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  muted?: boolean;
  trailingLabel?: ReactNode;
};

const EMPTY = "__empty__";

/**
 * Sdílený výběr ze seznamu (nahrazuje nativní <select>).
 * Prázdna hodnota sa mapuje na interný kľúč, lebo Radix Select nepodporuje prázdny value.
 */
export function OptionSelect({
  value,
  onChange,
  options,
  placeholder = "— nevybráno —",
  emptyLabel = "— nevybráno —",
  allowEmpty = true,
  disabled,
  id,
  className,
  triggerClassName,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  emptyLabel?: string;
  allowEmpty?: boolean;
  disabled?: boolean;
  id?: string;
  className?: string;
  triggerClassName?: string;
}) {
  const current = value ?? "";
  const known = options.some((o) => o.value === current);
  const selectedLabel = options.find((option) => option.value === current)?.label;

  return (
    <Select
      value={current === "" ? (allowEmpty ? EMPTY : "") : current}
      onValueChange={(v) => onChange(v === EMPTY ? "" : v)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className={cn("h-9 w-full min-w-0", className, triggerClassName)}>
        <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {allowEmpty ? <SelectItem value={EMPTY}>{emptyLabel}</SelectItem> : null}
        {!known && current !== "" ? <SelectItem value={current}>{current}</SelectItem> : null}
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} disabled={o.disabled} className={cn(o.muted && "text-muted-foreground")}>
            <span className="flex min-w-0 items-center justify-between gap-3"><span className="truncate">{o.label}</span>{o.trailingLabel ? <span className="shrink-0 text-xs">{o.trailingLabel}</span> : null}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
