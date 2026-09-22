import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cs } from "date-fns/locale";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { parseUserDate, useDateTimePreferences } from "../../../lib/date-time-preferences";

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

/** Rozloží formát (např. DD.MM.YYYY) na oddělovač a délky jednotlivých částí. */
function maskParts(dateFormat: string) {
  const separator = dateFormat.replace(/[a-zA-Z]/g, "")[0] ?? ".";
  const lengths = dateFormat.split(separator).map((p) => p.length);
  return { separator, lengths: lengths.length === 3 ? lengths : [2, 2, 4] };
}

/**
 * Průběžné doplňování oddělovačů při ručním psaní data.
 * Uživatel píše jen číslice, tečky (nebo jiný oddělovač) se doplní samy.
 */
export function maskDateInput(raw: string, dateFormat: string, deleting: boolean): string {
  const { separator, lengths } = maskParts(dateFormat);
  if (!/^[\d\s]*$/.test(raw.split(separator).join(""))) return raw;
  const digits = raw.replace(/\D/g, "").slice(
    0,
    lengths.reduce((a, b) => a + b, 0),
  );
  const out: string[] = [];
  let index = 0;
  for (const len of lengths) {
    if (index >= digits.length) break;
    out.push(digits.slice(index, index + len));
    index += len;
  }
  let text = out.join(separator);
  // po dopsání části doplníme oddělovač, ať uživatel může rovnou psát dál
  if (!deleting && out.length < lengths.length && out.length > 0) {
    const filled = out.reduce((sum, part) => sum + part.length, 0);
    const expected = lengths.slice(0, out.length).reduce((a, b) => a + b, 0);
    if (filled === expected) text += separator;
  }
  return text;
}

type DateFieldProps = {
  id?: string;
  /** hodnota ve formátu YYYY-MM-DD */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** třída pro samotný input */
  inputClassName?: string;
  /** nejpozdější povolené datum (YYYY-MM-DD) */
  maxDate?: Date;
  /** nejdříve povolené datum (YYYY-MM-DD) */
  minDate?: Date;
  /** Zoom gridu; škáluje také kalendář vykreslený mimo lištu v portálu. */
  gridZoom?: number;
  /** Informuje formulář nebo filtr o výsledku ruční validace. */
  onValidityChange?: (valid: boolean) => void;
};

/** Jednotná komponenta pro zadání data v celé aplikaci. */
export function DateField({
  id,
  value,
  onChange,
  placeholder = "Vyberte datum",
  disabled,
  className,
  inputClassName,
  maxDate,
  minDate,
  gridZoom,
  onValidityChange,
}: DateFieldProps) {
  const preferences = useDateTimePreferences();
  const { dateFormat, formatDate } = preferences;
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);
  const [text, setText] = React.useState(value ? formatDate(value) : "");
  const [invalid, setInvalid] = React.useState(false);
  const disabledMatcher = React.useMemo(() => {
    if (maxDate && minDate) return { before: minDate, after: maxDate };
    if (maxDate) return { after: maxDate };
    if (minDate) return { before: minDate };
    return undefined;
  }, [maxDate, minDate]);

  React.useEffect(() => {
    setText(value ? formatDate(value) : "");
  }, [value, dateFormat]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Zpracuje ručně napsané datum ve formátu d.m.rrrr (i 1.1.90 nebo 01012000). */
  const commitText = () => {
    const raw = text.trim();
    if (!raw) {
      setInvalid(false);
      onValidityChange?.(true);
      onChange("");
      return;
    }
    const parsed = parseUserDate(raw, preferences);
    if (parsed === null) {
      setInvalid(true);
      onValidityChange?.(false);
      return;
    }
    const parsedDate = parseISO(parsed);
    if (!parsedDate || (minDate && parsedDate < minDate) || (maxDate && parsedDate > maxDate)) {
      setInvalid(true);
      onValidityChange?.(false);
      return;
    }
    setInvalid(false);
    onValidityChange?.(true);
    onChange(parsed);
    setText(formatDate(`${parsed}T00:00:00`));
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder === "Vyberte datum" ? dateFormat.toLowerCase() : placeholder}
        value={text}
        aria-invalid={invalid}
        title={invalid ? `Zadejte platné datum ve formátu ${dateFormat.toLowerCase()}.` : undefined}
        onChange={(e) => {
          const next = e.target.value;
          const masked = maskDateInput(next, dateFormat, next.length < text.length);
          setText(masked);
          if (invalid) setInvalid(false);
          // Živý přepočet: jakmile je zapsané datum úplné a platné, ohlásíme ho hned
          // (bez čekání na blur/Enter), aby se navázané přehledy překreslily.
          const digits = masked.replace(/\D/g, "");
          if (digits.length !== 8) return;
          const parsed = parseUserDate(masked, preferences);
          if (!parsed) return;
          const parsedDate = parseISO(parsed);
          if (!parsedDate || (minDate && parsedDate < minDate) || (maxDate && parsedDate > maxDate))
            return;
          onValidityChange?.(true);
          onChange(parsed);
        }}

        onBlur={commitText}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commitText();
          }
        }}
        className={cn("pr-[2.4em]", inputClassName)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Otevřít kalendář"
            className="date-field-trigger absolute right-[0.3em] top-1/2 size-[1.7em] -translate-y-1/2 rounded-[0.35em] !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
          >
            <CalendarIcon className="size-[1.05em]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-auto p-0", gridZoom != null && "grid-date-popover")}
          align="start"
          style={gridZoom != null ? { fontSize: `${(13 * gridZoom).toFixed(2)}px` } : undefined}
        >
          <Calendar
            mode="single"
            locale={cs}
            captionLayout="dropdown"
            startMonth={minDate ?? new Date(1900, 0)}
            endMonth={maxDate ?? new Date(new Date().getFullYear() + 10, 11)}
            disabled={disabledMatcher}
            defaultMonth={selected ?? maxDate}
            selected={selected}
            onSelect={(d) => {
              setInvalid(false);
              onValidityChange?.(true);
              onChange(d ? toISO(d) : "");
              setOpen(false);
            }}
            initialFocus
            className={cn("pointer-events-auto p-3", gridZoom != null && "grid-date-calendar")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
