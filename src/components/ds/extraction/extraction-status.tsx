/**
 * Kompaktní stav vytěžení souboru.
 * Vlastní: pruh do záložky Zdroj panelu záznamu a do slotu notices formuláře.
 * Nesmí: spouštět vytěžení ani znát doménu; akce hlásí callbacky aplikaci.
 */
import { Button } from "../../ui/button";
import { NoticeBar, type NoticeBarTone } from "../feedback/notice-bar";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { ExtractionState } from "./extraction-types";

/** Vlastnosti pruhu stavu vytěžení. */
export interface ExtractionStatusProps {
  /** Aktuální stav vytěžení. */
  state: ExtractionState;
  /** Metoda vytěžení pro stav Hotovo (např. „AI návrh“); text dodává aplikace. */
  method?: string;
  /** Zrušení probíhajícího vytěžení. */
  onCancel?: () => void;
  /** Opakování po nezdaru. */
  onRetry?: () => void;
  /** Otevření původního dokladu u duplicitního souboru. */
  onOpenOriginal?: () => void;
  /** Doplňkové třídy obalu. */
  className?: string;
}

const TONES: Record<ExtractionState, NoticeBarTone> = {
  extracting: "info",
  done: "success",
  failed: "danger",
  duplicate: "warning",
};

/** Pruh stavu vytěžení s akcemi Zrušit / Zkusit znovu / Otevřít původní doklad. */
export function ExtractionStatus({
  state,
  method,
  onCancel,
  onRetry,
  onOpenOriginal,
  className,
}: ExtractionStatusProps) {
  const texts = useDsTexts().extraction;
  const label =
    state === "extracting"
      ? texts.statusExtracting
      : state === "done"
        ? texts.statusDone(method ?? "")
        : state === "failed"
          ? texts.statusFailed
          : texts.statusDuplicate;
  const actions =
    state === "extracting" && onCancel ? (
      <Button type="button" variant="outline" size="sm" onClick={onCancel}>
        {texts.cancel}
      </Button>
    ) : state === "failed" && onRetry ? (
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        {texts.retry}
      </Button>
    ) : state === "duplicate" && onOpenOriginal ? (
      <Button type="button" variant="outline" size="sm" onClick={onOpenOriginal}>
        {texts.openOriginal}
      </Button>
    ) : undefined;
  return (
    <NoticeBar
      tone={TONES[state]}
      actions={actions}
      data-slot="extraction-status"
      data-state={state}
      className={cn(className)}
    >
      {label}
    </NoticeBar>
  );
}
