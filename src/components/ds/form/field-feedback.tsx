/**
 * Stav pole · vlastní přístupnou výstrahu uvnitř pole, ikonu nápovědy a sdílený stav chyby
 * · nesmí měnit hodnotu ani výšku pole a nesmí nic kreslit pod ovládáním.
 */
import { createContext, useContext, useId, type ReactNode } from "react";
import { AlertTriangle, Info } from "lucide-react";
import { TooltipProvider } from "../../ui/tooltip";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { cn } from "../../../lib/utils";

/** Zprávy sdílené mezi obalem a jeho ovládáním. */
export interface FieldFeedbackValue {
  /** Chyba má přednost před varováním. */
  error?: ReactNode;
  /** Nezabraňující upozornění. */
  warning?: ReactNode;
}

/** Jednotný stav pole: `error` má přednost před `warning`. */
export type FieldStatus = FieldFeedbackValue;

/** Kontext zabrání zdvojení výstrahy uvnitř jednoho pole. */
export const FieldFeedbackContext = createContext<FieldFeedbackValue>({});

/** Vrátí zprávu nejbližšího pole. */
export function useFieldFeedback() {
  return useContext(FieldFeedbackContext);
}

/** Výsledek `useFieldStatus` pro napojení ovládání. */
export interface FieldStatusResult {
  /** Tón stavu. */
  tone?: "error" | "warning";
  /** Zpráva s předností chyby. */
  message?: ReactNode;
  /** Id skrytého textu zprávy. */
  describedById?: string;
  /** Přístupné atributy ovládání. */
  controlProps: { "aria-invalid"?: true; "aria-describedby"?: string };
  /** Třída rámečku ovládání. */
  className: string;
}

/** Odvodí tón, rámeček a přístupné atributy pole z `error` a `warning`. */
export function useFieldStatus(status: FieldStatus): FieldStatusResult {
  const id = useId();
  const tone = status.error ? "error" : status.warning ? "warning" : undefined;
  const describedById = tone ? `${id}-status` : undefined;
  return {
    tone,
    message: status.error || status.warning,
    describedById,
    controlProps: {
      "aria-invalid": tone === "error" ? true : undefined,
      "aria-describedby": describedById,
    },
    className:
      tone === "error"
        ? "border-destructive ring-1 ring-destructive"
        : tone === "warning"
          ? "border-warning-strong ring-1 ring-warning-strong"
          : "",
  };
}

/** Vlastnosti ukazatele výstrahy. */
export interface FieldFeedbackIndicatorProps extends FieldFeedbackValue {
  /** Doplňkové umístění ukazatele před akcemi. */
  className?: string;
  /** Strana uvnitř pole; čísla zarovnaná doprava mají ikonu vlevo. */
  side?: "start" | "end";
  /** `inside` = uvnitř pole, `label` = za textem popisku (prvky bez místa uvnitř). */
  placement?: "inside" | "label";
  /** Původní informace pole; zobrazí se v téže bublině pod zprávou (jedna bublina). */
  extraInfo?: ReactNode;
  /** Id skrytého textu pro aria-describedby ovládání. */
  id?: string;
}

/** Výstraha dostupná myší, klávesnicí i klepnutím. */
export function FieldFeedbackIndicator({
  error,
  warning,
  className,
  side = "end",
  placement = "inside",
  extraInfo,
  id,
}: FieldFeedbackIndicatorProps) {
  const message = error || warning;
  if (!message) return null;
  const content = extraInfo ? (
    <span className="flex flex-col gap-1">
      <span>{message}</span>
      <span data-slot="field-feedback-extra" className="opacity-80">
        {extraInfo}
      </span>
    </span>
  ) : (
    message
  );
  return (
    <TooltipProvider>
      <DisabledReasonTooltip content={content} blocked openOnTouch>
        <span
          tabIndex={0}
          role="img"
          aria-label={typeof message === "string" ? message : undefined}
          data-slot="field-feedback"
          data-side={side}
          data-placement={placement}
          className={cn(
            "cursor-help rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            placement === "inside" &&
              "absolute top-[calc(var(--control-h)/2)] z-10 -translate-y-1/2",
            placement === "inside" &&
              (side === "start"
                ? "left-[0.5em]"
                : "right-[var(--field-feedback-offset,0.75rem)]"),
            placement === "label" && "inline-flex shrink-0 items-center",
            error ? "text-destructive" : "text-warning-strong",
            className,
          )}
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          <span id={id} className="sr-only">
            {message}
          </span>
        </span>
      </DisabledReasonTooltip>
    </TooltipProvider>
  );
}

/** Nový název ukazatele stavu pole; `FieldFeedbackIndicator` zůstává jako alias. */
export const FieldStatusIndicator = FieldFeedbackIndicator;

/** Vlastnosti ikony nápovědy. */
export interface FieldHintIconProps {
  /** Text nápovědy v bublině. */
  hint: ReactNode;
  /** Id skrytého textu nápovědy pro aria-describedby. */
  id?: string;
  /** Doplňkové třídy. */
  className?: string;
}

/** Nápověda pole jako ikona Info v řádku popisku – nikdy text pod polem. */
export function FieldHintIcon({ hint, id, className }: FieldHintIconProps) {
  return (
    <TooltipProvider>
      <DisabledReasonTooltip content={hint} blocked={false} openOnTouch>
        <span
          tabIndex={0}
          role="img"
          aria-label={typeof hint === "string" ? hint : undefined}
          data-slot="field-hint"
          className={cn(
            "inline-flex shrink-0 cursor-help items-center rounded-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Info className="size-3.5" aria-hidden="true" />
          <span id={id} className="sr-only">
            {hint}
          </span>
        </span>
      </DisabledReasonTooltip>
    </TooltipProvider>
  );
}
