/**
 * Souhrn návrhu z vytěžení ve slotu notices formuláře.
 * Vlastní: jednořádkový souhrn, akci Další ke kontrole (F8) a Zahodit návrh.
 * Nesmí: měnit hodnoty polí ani znát doménu; stav návrhů řídí rodič.
 */
import { useEffect, type ReactNode } from "react";
import { Button } from "../../ui/button";
import { NoticeBar } from "../feedback/notice-bar";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { focusNextUncertainField } from "./focus-uncertain";

/** Odkaz na řádky, podle kterých se pole vyplnila. */
export interface SuggestionLinesReference {
  /** Popisek odkazu (např. označení řádků). */
  label: string;
  /** Otevření řádků v panelu. */
  onOpen: () => void;
}

/** Vlastnosti souhrnu návrhu. */
export interface SuggestionSummaryProps {
  /** Metoda vytěžení (např. „AI návrh“); text dodává aplikace. */
  method: string;
  /** Počet polí ke kontrole; skloňuje se. */
  uncertainCount: number;
  /** Odkaz na řádky, podle kterých se vyplnila pole. */
  linesReference?: SuggestionLinesReference;
  /** Zahození celého návrhu. */
  onDiscard: () => void;
  /** Doplňkové třídy obalu. */
  className?: string;
}

/** Přesune fokus na další pole se stavem ke kontrole (cyklicky). */
export function focusNextUncertainField(): void {
  const fields = Array.from(
    document.querySelectorAll<HTMLElement>('[data-suggestion="uncertain"]'),
  );
  if (!fields.length) return;
  const active = document.activeElement;
  const current = fields.findIndex((field) => field === active || field.contains(active));
  const next = fields[(current + 1) % fields.length];
  const control = next.matches("input,select,textarea,button,[tabindex]")
    ? next
    : next.querySelector<HTMLElement>("input,select,textarea,button,[tabindex]");
  control?.focus();
}

/** Jednořádkový souhrn vytěžení s klávesou F8 pro obcházení polí ke kontrole. */
export function SuggestionSummary({
  method,
  uncertainCount,
  linesReference,
  onDiscard,
  className,
}: SuggestionSummaryProps) {
  const texts = useDsTexts().extraction;
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "F8") return;
      event.preventDefault();
      focusNextUncertainField();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const parts: ReactNode[] = [
    texts.summaryFilled(method),
    texts.summaryFieldsToCheck(uncertainCount),
  ];
  return (
    <NoticeBar
      tone="info"
      data-slot="suggestion-summary"
      className={cn(className)}
      actions={
        <>
          <Button type="button" variant="outline" size="sm" onClick={focusNextUncertainField}>
            {texts.nextToCheck}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDiscard}>
            {texts.discardSuggestion}
          </Button>
        </>
      }
    >
      <span className="whitespace-nowrap">{parts.join(" · ")}</span>
      {linesReference ? (
        <>
          {" · "}
          {texts.summaryLinesFrom}{" "}
          <button
            type="button"
            className="underline underline-offset-2 hover:text-foreground"
            onClick={linesReference.onOpen}
          >
            {linesReference.label}
          </button>
        </>
      ) : null}
    </NoticeBar>
  );
}
