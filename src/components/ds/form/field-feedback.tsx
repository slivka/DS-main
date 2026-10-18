/** Výstraha pole · vlastní přístupný ukazatel · nesmí měnit hodnotu ani výšku pole. */
import { createContext, useContext, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
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

/** Kontext zabrání zdvojení výstrahy uvnitř jednoho pole. */
export const FieldFeedbackContext = createContext<FieldFeedbackValue>({});

/** Vrátí zprávu nejbližšího pole. */
export function useFieldFeedback() {
  return useContext(FieldFeedbackContext);
}

/** Vlastnosti ukazatele výstrahy. */
export interface FieldFeedbackIndicatorProps extends FieldFeedbackValue {
  /** Doplňkové umístění ukazatele před akcemi. */
  className?: string;
}

/** Výstraha dostupná myší, klávesnicí i klepnutím. */
export function FieldFeedbackIndicator({ error, warning, className }: FieldFeedbackIndicatorProps) {
  const message = error || warning;
  if (!message) return null;
  return (
    <TooltipProvider><DisabledReasonTooltip content={message} blocked={false} openOnTouch>
      <span
        tabIndex={0}
        role="img"
        aria-label={typeof message === "string" ? message : undefined}
        data-slot="field-feedback"
        className={cn(
          "absolute right-[var(--field-feedback-offset,0.75rem)] top-[calc(var(--control-h)/2)] z-10 -translate-y-1/2 cursor-help rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          error ? "text-destructive" : "text-warning-strong",
          className,
        )}
      >
        <AlertTriangle className="size-4" aria-hidden="true" />
        <span className="sr-only">{message}</span>
      </span>
    </DisabledReasonTooltip></TooltipProvider>
  );
}
