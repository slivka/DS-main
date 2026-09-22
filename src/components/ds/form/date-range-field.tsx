import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";
import { useDateTimePreferences } from "../../../lib/date-time-preferences";

/** Rozsah dat v kanonickém formátu YYYY-MM-DD; null = nevybráno. */
export type DateRangeValue = {
  from: string | null;
  to: string | null;
};

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
 * Výběr rozsahu dat (Od–Do) v jednom ovládání – kalendář otevřený
 * z jednoho tlačítka. Hodí se do filtrů přehledů.
 */
export function DateRangeField({
  value,
  onChange,
  placeholder = "Vyberte období",
  months = 1,
  disabled,
  minDate,
  maxDate,
  className,
  label = "Rozsah dat",
}: {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  /** Počet měsíců zobrazených vedle sebe v kalendáři. */
  months?: number;
  disabled?: boolean;
  /** Nejpozdější povolené datum (YYYY-MM-DD). */
  maxDate?: Date;
  /** Nejdříve povolené datum (YYYY-MM-DD). */
  minDate?: Date;
  className?: string;
  /** Přístupný název ovládání. */
  label?: string;
}) {
  const preferences = useDateTimePreferences();
  const { formatDate } = preferences;
  const [open, setOpen] = React.useState(false);

  const selected = {
    from: parseISO(value.from),
    to: parseISO(value.to),
  };
  const text = value.from
    ? value.to && value.to !== value.from
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : formatDate(value.from)
    : "";
  const disabledMatcher = React.useMemo(() => {
    if (minDate && maxDate) return { before: minDate, after: maxDate };
    if (minDate) return { before: minDate };
    if (maxDate) return { after: maxDate };
    return undefined;
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
          mode="range"
          numberOfMonths={months}
          selected={selected}
          defaultMonth={selected.from ?? maxDate}
          disabled={disabledMatcher}
          onSelect={(range) => {
            if (!range?.from) {
              onChange({ from: null, to: null });
              return;
            }
            onChange({
              from: toISO(range.from),
              to: range.to ? toISO(range.to) : toISO(range.from),
            });
            // Zavřeme až po vybrání konce rozsahu (první klik volí jen začátek).
            if (range.from && range.to && range.to > range.from) setOpen(false);
          }}
          initialFocus
          className="p-3"
        />
        <div className="flex items-center justify-between border-t px-3 py-2">
          {value.from ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-muted-foreground"
              onClick={() => onChange({ from: null, to: null })}
            >
              Vymazat
            </Button>
          ) : (
            <span />
          )}
          {value.from && value.to ? (
            <span className="text-xs text-muted-foreground">
              {formatDate(value.from)} – {formatDate(value.to)}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Vyberte konec rozsahu</span>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
