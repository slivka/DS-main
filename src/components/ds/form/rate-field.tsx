import { DS_TEXTS_CS, useDsTexts } from "../../../ds-texts";
import { RefreshCw } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { DecimalInput } from "./decimal-input";
import { FieldValue } from "./field-value";

export interface RateFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  currency: string;
  homeCurrency: string;
  homeCurrencySymbol?: string;
  currencySymbol?: string;
  rateAmount: number;
  suggestedRate?: number | null;
  suggestedInfo?: string;
  manual: boolean;
  onUseSuggested?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  note?: string;
  onNoteChange?: (value: string) => void;
  noteLabel?: string;
  sourceLabel?: string;
  manualSourceLabel?: string;
  suggestedTooltip?: (info: string, rate: string) => string;
  requiredMessage?: string;
  showNote?: boolean;
  id?: string;
  className?: string;
  /** Výška a vzhled vstupu i hodnoty jen ke čtení. */
  inputClassName?: string;
}

export function rateValuesDiffer(
  value: number | null,
  suggestedRate: number | null | undefined,
): boolean {
  return (
    suggestedRate != null && Number(suggestedRate.toFixed(6)) !== Number((value ?? 0).toFixed(6))
  );
}

/** Kurz cizí měny s doporučenou hodnotou a povinným důvodem ruční změny. */
export function RateField({
  value,
  onChange,
  currency,
  homeCurrency,
  homeCurrencySymbol,
  currencySymbol,
  rateAmount,
  suggestedRate,
  suggestedInfo,
  manual,
  onUseSuggested,
  disabled,
  readOnly,
  note = "",
  onNoteChange,
  noteLabel,
  sourceLabel,
  manualSourceLabel,
  suggestedTooltip,
  requiredMessage,
  showNote = true,
  id = "rate",
  className,
  inputClassName,
}: RateFieldProps) {
  const t = useDsTexts().rateField ?? DS_TEXTS_CS.rateField;
  const unit = Number.isInteger(rateAmount)
    ? formatAmount(rateAmount, 0)
    : formatAmount(rateAmount, 3);
  const suffix = `${homeCurrencySymbol ?? homeCurrency} ${t?.unit} ${unit} ${currencySymbol ?? currency}`;
  const differs = rateValuesDiffer(value, suggestedRate);
  const source = manual ? (manualSourceLabel ?? t?.manual) : (sourceLabel ?? suggestedInfo);
  const tooltip =
    suggestedRate == null
      ? ""
      : ((suggestedTooltip ?? t?.suggested)?.(
          suggestedInfo ?? t?.withoutDate ?? "",
          formatAmount(suggestedRate, 3),
        ) ?? "");
  const noteInvalid = manual && !note.trim();

  if (readOnly) {
    return (
      <div className={cn("space-y-1", className)}>
        <FieldValue id={id} className={cn("font-sans text-right tabular-nums", inputClassName)}>
          {value == null ? "—" : formatAmount(value, 3)}
        </FieldValue>
        <p className="field-overflow-hint text-xs text-muted-foreground">
          {suffix}
          {source ? ` · ${source}` : ""}
        </p>
        {manual && showNote && note ? (
          <p className="text-xs text-muted-foreground">{note}</p>
        ) : null}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-2", className)}>
        <div className="relative min-w-0">
          <DecimalInput
            id={id}
            value={value}
            decimals={6}
            displayDecimals={3}
            disabled={disabled}
            className={cn(
              "h-[var(--control-h)]",
              differs && "pr-9 border-destructive",
              inputClassName,
            )}
            onChange={(next) => onChange(next === "" ? null : Number(next))}
          />
          {differs ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={tooltip}
                  aria-disabled={disabled || undefined}
                  className={cn(
                    "absolute right-1 top-1/2 size-7 -translate-y-1/2",
                    disabled ? "text-muted-foreground" : "text-destructive",
                  )}
                  onClick={disabled ? undefined : onUseSuggested}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <p className="field-overflow-hint text-xs text-muted-foreground">
          {suffix}
          {source ? ` · ${source}` : ""}
        </p>
        {manual && showNote ? (
          <div className="space-y-1">
            <Label htmlFor={`${id}-note`}>{noteLabel ?? t?.note}</Label>
            <Input
              id={`${id}-note`}
              value={note}
              maxLength={200}
              required
              disabled={disabled}
              aria-invalid={noteInvalid}
              className={cn(noteInvalid && "border-destructive")}
              onChange={(event) => onNoteChange?.(event.target.value)}
            />
            {noteInvalid ? (
              <p role="alert" className="text-xs font-medium text-destructive">
                {requiredMessage ?? t?.required}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
