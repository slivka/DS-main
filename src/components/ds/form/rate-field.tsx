import { RefreshCw } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { DecimalInput } from "./decimal-input";

export interface RateFieldProps {
  value: number | null;
  onChange: (value: number | null) => void;
  currency: string;
  homeCurrency: string;
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
  id?: string;
  className?: string;
}

export function rateValuesDiffer(value: number | null, suggestedRate: number | null | undefined): boolean {
  return suggestedRate != null && Number(suggestedRate.toFixed(6)) !== Number((value ?? 0).toFixed(6));
}

/** Kurz cizí měny s doporučenou hodnotou a povinným důvodem ruční změny. */
export function RateField({
  value,
  onChange,
  currency,
  homeCurrency,
  rateAmount,
  suggestedRate,
  suggestedInfo,
  manual,
  onUseSuggested,
  disabled,
  readOnly,
  note = "",
  onNoteChange,
  noteLabel = "Důvod ručního kurzu",
  sourceLabel,
  manualSourceLabel = "Ruční kurz",
  suggestedTooltip = (info, rate) => `Kurz v databázi (${info}) je ${rate} – kliknutím použít`,
  requiredMessage = "Uveďte důvod ručního kurzu.",
  id = "rate",
  className,
}: RateFieldProps) {
  const unit = Number.isInteger(rateAmount) ? formatAmount(rateAmount, 0) : formatAmount(rateAmount, 3);
  const suffix = `${homeCurrency} za ${unit} ${currency}`;
  const differs = rateValuesDiffer(value, suggestedRate);
  const source = manual ? manualSourceLabel : sourceLabel ?? suggestedInfo;
  const tooltip = suggestedRate == null ? "" : suggestedTooltip(suggestedInfo ?? "bez data", formatAmount(suggestedRate, 3));
  const noteInvalid = manual && !note.trim();

  if (readOnly) {
    return (
    <TooltipProvider><div className={cn("space-y-1", className)}>
        <div id={id} aria-readonly="true" className="min-h-9 text-sm font-mono tabular-nums">
          {value == null ? "—" : `${formatAmount(value, 3)} ${suffix}`}
        </div>
        {source ? <p className="text-xs text-muted-foreground">{source}</p> : null}
        {manual && note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex min-w-0 items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <DecimalInput
            id={id}
            value={value}
            decimals={6}
            displayDecimals={3}
            disabled={disabled}
            className={cn("h-9 pr-9", differs && "border-destructive")}
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
                  className={cn("absolute right-1 top-1/2 size-7 -translate-y-1/2", disabled ? "text-muted-foreground" : "text-destructive")}
                  onClick={disabled ? undefined : onUseSuggested}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <span className="shrink-0 text-sm text-muted-foreground">{suffix}</span>
      </div>
      {source ? <p className="text-xs text-muted-foreground">{source}</p> : null}
      {manual ? (
        <div className="space-y-1">
          <Label htmlFor={`${id}-note`}>{noteLabel}</Label>
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
          {noteInvalid ? <p role="alert" className="text-xs font-medium text-destructive">{requiredMessage}</p> : null}
        </div>
      ) : null}
    </div></TooltipProvider>
  );
}