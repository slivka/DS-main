/** Datumové pole · vlastní vstup a vazbu data · nesmí měnit rozměry dokumentové oblasti. */
import { ReadOnlyControlValue, useRecordReadOnly } from "./record-read-only";
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
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { shiftDocumentDate } from "../../../lib/date-quick-options";

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

/** Řízená vazba na zdrojové datum. */
export type DateFieldLink = {
  /** Stálý přístupný název; výchozí fieldToggle.dateLink. */
  label?: string;
  locked: boolean;
  onToggle: (locked: boolean) => void;
  toggleDisabled?: boolean;
  /** Důvod zamčení přepínače vazby. */
  lockedReason?: string;
  lockedHint?: string;
  unlockedHint?: string;
};

export type DateFieldProps = {
  /** Výchozí datum relativního zápisu a rychlých voleb, ISO. */
  baseDate?: string;
  /** Rychlé volby uvnitř kalendáře, výpočet dostane ISO základ. */
  quickOptions?: Array<{ label: string; compute: (base: string) => string }>;
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
  /** Nápověda; uvnitř `Field` patří do `Field.hint` (ikona v popisku), zde jen přístupný text. */
  hint?: string;
  /** Varování uvnitř pole s bublinou; nikdy pod polem. */
  warning?: string;
  /**
   * @deprecated 2.107.0 – bez účinku, výstraha je vždy uvnitř pole. Odstraní se ve 3.0.0.
   */
  warningDisplay?: "below" | "indicator";
  /** Chyba pole uvnitř před jeho akcemi. */
  error?: string;
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
  error,
  baseDate,
  quickOptions,
}: DateFieldProps) {
  const readOnly = useRecordReadOnly();
  const preferences = useDateTimePreferences();
  const dsTexts = useDsTexts();
  const { dateFormat, formatDate } = preferences;
  const [open, setOpen] = React.useState(false);
  const selected = parseISO(value);
  const [text, setText] = React.useState(value ? formatDate(value) : "");
  const [invalid, setInvalid] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const warningId = React.useId();
  const fieldError =
    error ?? (invalid ? dsTexts.date.invalidFormat(dateFormat.toLowerCase()) : undefined);
  const visibleIcons = 1 + (link && !link.locked ? 1 : 0) + (warning || fieldError ? 1 : 0);
  const inputStyle: React.CSSProperties & Record<"--date-field-icons", number> = {
    "--date-field-icons": visibleIcons,
  };
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
    const parsed =
      /^\+\d+$/.test(raw) && baseDate
        ? shiftDocumentDate(baseDate, Number(raw.slice(1)))
        : parseUserDate(raw, preferences);
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
    if (!link || disabled || link.toggleDisabled || link.lockedReason) return;
    const nextLocked = !link.locked;
    link.onToggle(nextLocked);
    if (!nextLocked) requestAnimationFrame(() => inputRef.current?.focus());
  };

  const lockedHint = link?.lockedHint ?? dsTexts.date.sameAsIssue;
  const unlockedHint = link?.unlockedHint ?? dsTexts.date.relinkIssue;
  const linkDescriptionId = React.useId();
  const linkDescription =
    link?.lockedReason ??
    (link?.lockedHint && (link.locked || link.toggleDisabled)
      ? link.lockedHint
      : disabled || link?.toggleDisabled
        ? dsTexts.fieldToggle.dateLocked
        : link?.locked
          ? lockedHint
          : unlockedHint);

  if (readOnly) {
    return <ReadOnlyControlValue id={id}>{value ? formatDate(value) : ""}</ReadOnlyControlValue>;
  }

  return (
    <TooltipProvider>
      <div className={cn("min-w-0", className)}>
        {link ? (
          <span id={linkDescriptionId} className="sr-only">
            {linkDescription}
          </span>
        ) : null}
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            inputMode="numeric"
            disabled={disabled || link?.locked}
            readOnly={link?.locked}
            placeholder={placeholder}
            value={text}
            aria-invalid={invalid || Boolean(error) || undefined}
            aria-describedby={warning ? warningId : undefined}
            title={invalid ? dsTexts.date.invalidFormat(dateFormat.toLowerCase()) : undefined}
            onChange={(e) => {
              const next = e.target.value;
              const masked =
                baseDate && next.startsWith("+")
                  ? next.replace(/[^+\d]/g, "")
                  : maskDateInput(next, dateFormat, next.length < text.length);
              setText(masked);
              if (invalid) setInvalid(false);
              // Živý přepočet: jakmile je zapsané datum úplné a platné, ohlásíme ho hned
              // (bez čekání na blur/Enter), aby se navázané přehledy překreslily.
              const digits = masked.replace(/\D/g, "");
              if (digits.length !== 8) return;
              const parsed = parseUserDate(masked, preferences);
              if (!parsed) return;
              const parsedDate = parseISO(parsed);
              if (
                !parsedDate ||
                (minDate && parsedDate < minDate) ||
                (maxDate && parsedDate > maxDate)
              )
                return;
              onValidityChange?.(true);
              onChange(parsed);
            }}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (!e.ctrlKey && !e.metaKey) e.preventDefault();
                commitText();
              }
            }}
            data-visible-icons={visibleIcons}
            style={inputStyle}
            className={cn(
              "min-w-[calc(7.5rem+var(--date-field-icons)*1.9rem)]",
              "pr-[calc(0.5em+var(--date-field-icons)*1.9em)]",
              link?.locked && "bg-muted/40",
              fieldError
                ? "border-destructive"
                : warning && "border-warning ring-1 ring-warning/40",
              inputClassName,
            )}
          />
          {warning ? (
            <span id={warningId} className="sr-only">
              {warning}
            </span>
          ) : null}
          {warning || fieldError ? (
            <DisabledReasonTooltip content={fieldError ?? warning} blocked>
              <span
                tabIndex={0}
                aria-label={fieldError ?? warning}
                className={cn(
                  "absolute top-1/2 z-10 -translate-y-1/2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  fieldError ? "text-destructive" : "text-warning-strong",
                  link && !link.locked
                    ? "right-[calc(var(--document-date-icon-offset,0.3em)+2*var(--document-date-icon-step,1.8em))]"
                    : "right-[calc(var(--document-date-icon-offset,0.3em)+var(--document-date-icon-step,1.8em))]",
                )}
              >
                <AlertTriangle className="size-[var(--document-date-icon-size,1.05em)]" />
              </span>
            </DisabledReasonTooltip>
          ) : null}
          {link?.locked ? (
            <Tooltip>
              <span className="absolute right-[var(--document-date-icon-offset,0.3em)] top-1/2 -translate-y-1/2">
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-disabled={
                      Boolean(disabled || link.toggleDisabled || link.lockedReason) || undefined
                    }
                    aria-label={link.label ?? dsTexts.fieldToggle.dateLink}
                    aria-describedby={linkDescriptionId}
                    aria-pressed="true"
                    onClick={toggleLink}
                    className="ds-disabled-control date-field-link size-[1.7em] rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
                  >
                    <Lock className="size-[var(--document-date-icon-size,1.05em)]" />
                  </Button>
                </TooltipTrigger>
              </span>
              <TooltipContent>{linkDescription}</TooltipContent>
            </Tooltip>
          ) : (
            <>
              {link ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-disabled={
                        Boolean(disabled || link.toggleDisabled || link.lockedReason) || undefined
                      }
                      aria-label={link.label ?? dsTexts.fieldToggle.dateLink}
                      aria-describedby={linkDescriptionId}
                      aria-pressed="false"
                      onClick={toggleLink}
                      className="ds-disabled-control date-field-link absolute right-[calc(var(--document-date-icon-offset,0.3em)+var(--document-date-icon-step,1.8em))] top-1/2 size-[1.7em] -translate-y-1/2 rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
                    >
                      <LockOpen className="size-[var(--document-date-icon-size,1.05em)]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{linkDescription}</TooltipContent>
                </Tooltip>
              ) : null}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    aria-label={dsTexts.date.openCalendar}
                    className="ds-disabled-control disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100 date-field-trigger absolute right-[var(--document-date-icon-offset,0.3em)] top-1/2 size-[1.7em] -translate-y-1/2 rounded-sm !p-0 text-muted-foreground transition-colors hover-surface hover:text-foreground"
                  >
                    <CalendarIcon className="size-[var(--document-date-icon-size,1.05em)]" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className={cn("w-auto p-0", gridZoom != null && "grid-date-popover")}
                  align="start"
                  style={
                    gridZoom != null
                      ? { fontSize: `${(0.8125 * gridZoom).toFixed(4)}rem` }
                      : undefined
                  }
                >
                  <Calendar
                    mode="single"
                    locale={dsTexts.dateLocale}
                    baseDate={parseISO(baseDate)}
                    minDate={minDate}
                    maxDate={maxDate}
                    onClose={() => setOpen(false)}
                    onToday={(d) => {
                      onChange(toISO(d));
                      setText(formatDate(toISO(d)));
                      setInvalid(false);
                      setOpen(false);
                    }}
                    startMonth={minDate ?? new Date(1900, 0)}
                    endMonth={maxDate ?? new Date(new Date().getFullYear() + 10, 11)}
                    disabled={disabledMatcher}
                    defaultMonth={selected ?? parseISO(baseDate) ?? maxDate}
                    selected={selected}
                    onSelect={(d) => {
                      setInvalid(false);
                      onValidityChange?.(true);
                      onChange(d ? toISO(d) : "");
                      setOpen(false);
                    }}
                    initialFocus
                    className={cn(
                      "pointer-events-auto p-3",
                      gridZoom != null && "grid-date-calendar",
                    )}
                    footerActions={
                      quickOptions?.length && baseDate ? (
                        <div className="flex flex-wrap gap-1">
                          {quickOptions.map((option) => (
                            <Button
                              key={option.label}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const next = option.compute(baseDate);
                                const date = parseISO(next);
                                if (
                                  !date ||
                                  (minDate && date < minDate) ||
                                  (maxDate && date > maxDate)
                                )
                                  return;
                                onChange(next);
                                setText(formatDate(next));
                                setInvalid(false);
                                setOpen(false);
                              }}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      ) : undefined
                    }
                  />
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
        {hint ? <span className="sr-only">{hint}</span> : null}
      </div>
    </TooltipProvider>
  );
}
