/**
 * Souhrn návrhu z vytěžení ve slotu notices formuláře.
 * Vlastní: jednořádkový souhrn, akci Další ke kontrole (F8) a Zahodit návrh.
 * Nesmí: měnit hodnoty polí ani znát doménu; stav návrhů řídí rodič.
 */
import { type ReactNode } from "react";
import { useGlobalShortcuts } from "../../../lib/global-shortcuts";
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

/** Jednořádkový souhrn vytěžení s klávesou F8 pro obcházení polí ke kontrole. */
export function SuggestionSummary({
  method,
  uncertainCount,
  linesReference,
  onDiscard,
  className,
}: SuggestionSummaryProps) {
  const texts = useDsTexts().extraction;
  useGlobalShortcuts([
    {
      id: "suggestion-next",
      allowInEditing: true,
      match: (event) => event.key === "F8" && !event.defaultPrevented,
      run: (event) => {
        event.preventDefault();
        focusNextUncertainField();
      },
    },
  ]);
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
