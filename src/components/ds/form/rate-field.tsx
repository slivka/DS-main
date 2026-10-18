/** Pole kurzu · vlastní zdroj a upozornění · nesmí měnit kurz bez akce uživatele. */
import { forwardRef, useId, useState } from "react";
import { DS_TEXTS_CS, useDsTexts } from "../../../ds-texts";
import { Info, RefreshCw } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { DecimalInput } from "./decimal-input";
import { FieldFeedbackIndicator } from "./field-feedback";
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
  /** Starší nebo vlastní zdroj vyžaduje viditelné upozornění. */
  sourceAttention?: boolean;
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
  /** Chyba kurzu uvnitř pole. */
  error?: string;
  /** Upozornění kurzu uvnitř pole. */
  warning?: string;
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
export const RateField = forwardRef<HTMLDivElement, RateFieldProps>(function RateField(
  {
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
    sourceAttention = false,
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
    error,
    warning,
  }: RateFieldProps,
  ref,
) {
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

  const descriptionId = useId();
  const [sourceOpen, setSourceOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const sourceText = `${suffix}${source ? ` · ${source}` : ""}`;
  const attention = manual || sourceAttention;
  return (
    <TooltipProvider>
      <div ref={ref} className={cn("space-y-2", className)}>
        <span id={descriptionId} className="sr-only">
          {sourceText}
        </span>
        <div className="relative min-w-0">
          <Tooltip open={sourceOpen && !updateOpen} onOpenChange={setSourceOpen}>
            <TooltipTrigger asChild>
              <div
                className="relative min-w-0"
                tabIndex={readOnly || disabled ? 0 : undefined}
                aria-describedby={descriptionId}
              >
                {readOnly ? (
                  <FieldValue
                    id={id}
                    title=""
                    aria-describedby={descriptionId}
                    className={cn(
                      "bg-muted/40 border border-input text-muted-foreground opacity-100 font-sans text-right tabular-nums",
                      attention && "pl-9",
                      error
                        ? "border-destructive pr-9"
                        : warning
                          ? "border-warning pr-9"
                          : undefined,
                      inputClassName,
                    )}
                  >
                    {value == null ? "—" : formatAmount(value, 3)}
                  </FieldValue>
                ) : (
                  <DecimalInput
                    aria-invalid={Boolean(error) || undefined}
                    id={id}
                    value={value}
                    decimals={6}
                    displayDecimals={3}
                    disabled={disabled}
                    aria-describedby={descriptionId}
                    className={cn(
                      "h-[var(--control-h)]",
                      attention && "pl-9",
                      differs && "pr-9 border-destructive",
                      attention && differs && "pl-7",
                      error
                        ? "border-destructive pr-9"
                        : warning
                          ? "border-warning pr-9"
                          : undefined,
                      inputClassName,
                    )}
                    onChange={(next) => onChange(next === "" ? null : Number(next))}
                  />
                )}
                {attention ? (
                  <Info
                    aria-hidden="true"
                    data-slot="rate-source-attention"
                    className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                ) : null}
              </div>
            </TooltipTrigger>
            {sourceOpen && !updateOpen ? (
              <TooltipContent data-slot="rate-source-tooltip">
                {/* Jedna bublina: nahoře zpráva pole, pod ní původní informace o zdroji. */}
                {error || warning ? (
                  <span className="flex flex-col gap-1">
                    <span>{error || warning}</span>
                    <span data-slot="field-feedback-extra" className="opacity-80">
                      {sourceText}
                    </span>
                  </span>
                ) : (
                  sourceText
                )}
              </TooltipContent>
            ) : null}
          </Tooltip>
          <FieldFeedbackIndicator
            error={error}
            warning={warning}
            extraInfo={sourceText}
            className={differs ? "right-10" : undefined}
          />
          {!readOnly && differs ? (
            <Tooltip open={updateOpen} onOpenChange={setUpdateOpen}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={tooltip}
                  aria-disabled={disabled || undefined}
                  onPointerEnter={() => {
                    setSourceOpen(false);
                    setUpdateOpen(true);
                  }}
                  onFocus={() => {
                    setSourceOpen(false);
                    setUpdateOpen(true);
                  }}
                  onPointerLeave={() => setUpdateOpen(false)}
                  onBlur={() => setUpdateOpen(false)}
                  className={cn(
                    "absolute right-1 top-1/2 size-7 -translate-y-1/2",
                    disabled ? "text-muted-foreground" : "text-destructive",
                  )}
                  onClick={disabled ? undefined : onUseSuggested}
                >
                  <RefreshCw className="size-4" />
                </Button>
              </TooltipTrigger>
              {updateOpen ? <TooltipContent>{tooltip}</TooltipContent> : null}
            </Tooltip>
          ) : null}
        </div>
        {manual && showNote && !readOnly ? (
          <div className="space-y-1">
            <Label htmlFor={`${id}-note`}>{noteLabel ?? t?.note}</Label>
            <Input
              id={`${id}-note`}
              value={note}
              maxLength={200}
              required
              disabled={disabled}
              error={noteInvalid ? (requiredMessage ?? t?.required) : undefined}
              className={cn(noteInvalid && "border-destructive")}
              onChange={(event) => onNoteChange?.(event.target.value)}
            />
          </div>
        ) : null}
        {readOnly && manual && showNote && note ? (
          <p className="text-xs text-muted-foreground">{note}</p>
        ) : null}
      </div>
    </TooltipProvider>
  );
});
