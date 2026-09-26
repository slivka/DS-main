import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { useDateTimePreferences } from "../../../lib/date-time-preferences";

function parseISO(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Samostatný kalendář pro výběr dne – datum se vybírá pouze kliknutím,
 * bez ručního psaní. Pro zadávání psaním slouží DateField.
 */
export function CalendarPicker({
  value,
  onChange,
  placeholder = "Vyberte datum",
  disabled,
  minDate,
  maxDate,
  className,
  label = "Výběr data",
}: {
  /** Hodnota ve formátu YYYY-MM-DD, prázdný řetězec = nevybráno. */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  /** Nejpozdější povojené datum (YYYY-MM-DD). */
  maxDate?: Date;
  /** Nejdříve povojené datum (YYYY-MM-DD). */
  minDate?: Date;
  className?: string;
  /** Přístupný název ovládání. */
  label?: string;
}) {
  const preferences = useDateTimePreferences();
  const { formatDate } = preferences;
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);
  const text = value ? formatDate(value) : "";
  const disabledMatcher = React.useMemo(() => {
    if (minDate && maxDate) return { before: minDate, after: maxDate };
    if (minDate) return { before: minDate };
    if (maxDate) return { after: maxDate };
    return undefined;
  }, [minDate, maxDate]);
  // Meze rozbalovacího výběru roku v hlavičce kalendáře.
  const [startMonth, endMonth] = React.useMemo(() => {
    const now = new Date();
    return [
      minDate ?? new Date(now.getFullYear() - 15, 0, 1),
      maxDate ?? new Date(now.getFullYear() + 5, 11, 1),
    ] as const;
  }, [minDate, maxDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label={label}
          className={cn(
            "h-9 w-full justify-start gap-2 px-3 font-normal",
            !text && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{text || placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          selected={selected}
          defaultMonth={selected ?? maxDate}
          disabled={disabledMatcher}
          onSelect={(d) => {
            onChange(d ? toISO(d) : "");
            setOpen(false);
          }}
          initialFocus
          className="p-3"
        />
      </PopoverContent>
    </Popover>
  );
}
