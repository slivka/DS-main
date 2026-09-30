import * as React from "react";
import { AlertTriangle, CalendarIcon, Lock, LockOpen } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Calendar } from "../../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
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
  for (const length of lengths) {
    if (index >= digits.length) break;
    out.push(digits.slice(index, index + length));
    index += length;
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

export type DateFieldLink = {
  locked: boolean;
  onToggle: (locked: boolean) => void;
  toggleDisabled?: boolean;
  lockedHint?: string;
  unlockedHint?: string;
};

export type DateFieldProps = {
  id?: string;
  /** hodnota ve formátu YYYY-MM-DD */
  value?: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** třída pro samotný input */
  inputClassName?: string;
  /** Nejpozdější povolené datum (YYYY-MM-DD). */
  maxDate?: Date;
  /** Nejdříve povolené datum (YYYY-MM-DD). */
  minDate?: Date;
  /** Zoom gridu; škáluje také kalendář vykreslený mimo lištu v portálu. */
  gridZoom?: number;
  /** Informuje formulář nebo filtr o výsledku ruční validace. */
  onValidityChange?: (valid: boolean) => void;
  /** Řízené svázání se zdrojovým datem. */
  link?: DateFieldLink;
  /** Doplňující text pod polem. */
  hint?: string;
  /** Výstraha pod polem; má přednost před hintem. */
  warning?: string;
  /** Ve formuláři dokladu označí pole a zobrazí výstrahu jen v tooltipu. */
  warningDisplay?: "below" | "indicator";
};

/** Jednotná komponenta pro zadání data v celé aplikaci. */
export function DateField({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  inputClassName,
  maxDate,
  minDate,
  gridZoom,
  onValidityChange,
  link,
  hint,
  warning,
  warningDisplay = "below",
}: DateFieldProps) {
  const preferences = useDateTimePreferences();
  const dsTexts = useDsTexts();
  const { dateFormat, formatDate } = preferences;
  const resolvedPlaceholder = placeholder ?? dsTexts.date.chooseDate;
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);
  const [text, setText] = React.useState(value ? formatDate(value) : "");
  const [invalid, setInvalid] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const warningId = React.useId();
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

  const toggleLink = () => {
    if (!link) return;
    const nextLocked = !link.locked;
    link.onToggle(nextLocked);
    if (!nextLocked) requestAnimationFrame(() => inputRef.current?.focus());
  };

  const lockedHint = link?.lockedHint ?? dsTexts.date.sameAsIssue;
  const unlockedHint = link?.unlockedHint ?? dsTexts.date.relinkIssue;

  return (
    <TooltipProvider><div className={cn("min-w-0", className)}><div className="relative">
      <Input
        ref={inputRef}
        id={id}
        inputMode="numeric"
        disabled={disabled || link?.locked}
        readOnly={link?.locked}
        placeholder={resolvedPlaceholder === dsTexts.date.chooseDate ? dateFormat.toLowerCase() : resolvedPlaceholder}
        value={text}
        aria-invalid={invalid || undefined}
        aria-describedby={warning ? warningId : undefined}
        title={invalid ? dsTexts.date.invalidFormat(dateFormat.toLowerCase()) : undefined}
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
        className={cn("pr-[2.4em]", link && !link.locked && "pr-[4.2em]", warningDisplay === "indicator" && warning && !link && "pr-[3.7em]", warningDisplay === "indicator" && warning && link && !link.locked && "pr-[5.5em]", link?.locked && "bg-muted/40", warning && "border-warning ring-1 ring-warning/40", inputClassName)}
      />
      {warning ? <span id={warningId} className="sr-only">{warning}</span> : null}
      {warning && warningDisplay === "indicator" ? <Tooltip><TooltipTrigger asChild><span tabIndex={0} aria-label={warning} className={cn("absolute top-1/2 z-10 -translate-y-1/2 rounded-sm text-warning-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", link && !link.locked ? "right-[3.9em]" : "right-[2.1em]")}><AlertTriangle className="size-[1.05em]" /></span></TooltipTrigger><TooltipContent>{warning}</TooltipContent></Tooltip> : null}
      {link?.locked ? (
        <Tooltip><TooltipTrigger asChild><span className="absolute right-[0.3em] top-1/2 -translate-y-1/2"><Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || link.toggleDisabled}
          aria-label={lockedHint}
          aria-pressed="true"
          onClick={toggleLink}
          className="date-field-link size-[1.7em] rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
        ><Lock className="size-[1.05em]" /></Button></span></TooltipTrigger><TooltipContent>{lockedHint}</TooltipContent></Tooltip>
      ) : <>
      {link ? <Tooltip><TooltipTrigger asChild><Button
        type="button"
        variant="ghost"
        size="icon"
         disabled={disabled || link.toggleDisabled}
        aria-label={unlockedHint}
        aria-pressed="false"
        onClick={toggleLink}
        className="date-field-link absolute right-[2.1em] top-1/2 size-[1.7em] -translate-y-1/2 rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
      ><LockOpen className="size-[1.05em]" /></Button></TooltipTrigger><TooltipContent>{unlockedHint}</TooltipContent></Tooltip> : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label={dsTexts.date.openCalendar}
            className="date-field-trigger absolute right-[0.3em] top-1/2 size-[1.7em] -translate-y-1/2 rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
          >
            <CalendarIcon className="size-[1.05em]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("w-auto p-0", gridZoom != null && "grid-date-popover")}
          align="start"
          style={gridZoom != null ? { fontSize: `${(0.8125 * gridZoom).toFixed(4)}rem` } : undefined}
        >
          <Calendar
            mode="single"
            locale={dsTexts.dateLocale}
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
      </>}
    </div>{warning && warningDisplay === "below" ? <p className="field-overflow-hint mt-1 text-xs text-warning-strong">{warning}</p> : hint ? <p className="field-overflow-hint mt-1 text-xs text-muted-foreground">{hint}</p> : null}</div></TooltipProvider>
  );
}
