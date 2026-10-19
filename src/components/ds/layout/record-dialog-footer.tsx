/**
 * Patička a chybový pruh dialogu záznamu · vlastní pořadí akcí (Odstranit → doplňkové →
 * životní cyklus | Zrušit → Uložit), pruh chyb nad tlačítky a text „Ukládám…“
 * · nesmí sama zavírat dialog ani ukládat.
 */
import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "../../ui/button";
import { TooltipProvider } from "../../ui/tooltip";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { FieldErrorSummary, type FieldErrorLink } from "../feedback/field-error-summary";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

/** Vlastnosti tlačítka patičky s volitelným důvodem zákazu. */
interface FooterActionProps {
  /** Text tlačítka. */
  label: string;
  /** Vzhled tlačítka. */
  variant: "outline" | "outline-destructive";
  /** Datový slot pro testy a styly. */
  slot: string;
  /** Akce je zakázaná. */
  disabled?: boolean | undefined;
  /** Důvod zákazu – tlačítko zůstane zaměřitelné s vysvětlením. */
  disabledReason?: string | undefined;
  /** Spuštění akce. */
  onClick: () => void;
}

/** Tlačítko patičky; zakázané s důvodem má stejné chování jako akce životního cyklu. */
export function RecordDialogFooterAction(props: FooterActionProps) {
  const reasonId = useId();
  if (props.disabled && props.disabledReason) {
    return (
      <TooltipProvider>
        <DisabledReasonTooltip content={props.disabledReason} blocked>
          <Button
            type="button"
            variant={props.variant}
            data-slot={props.slot}
            aria-disabled
            aria-describedby={reasonId}
            className="cursor-not-allowed"
            onClick={(event) => event.preventDefault()}
          >
            {props.label}
          </Button>
        </DisabledReasonTooltip>
        <span id={reasonId} className="sr-only">
          {props.disabledReason}
        </span>
      </TooltipProvider>
    );
  }
  return (
    <Button
      type="button"
      variant={props.variant}
      data-slot={props.slot}
      disabled={props.disabled}
      onClick={props.onClick}
    >
      {props.label}
    </Button>
  );
}

/** Vlastnosti chybového pruhu. */
export interface RecordDialogErrorStripProps {
  /** Celková chyba uložení (z databáze). */
  error?: ReactNode;
  /** Chybná pole. */
  fieldErrors?: FieldErrorLink[] | undefined;
}

/** Pruh chyb nad tlačítky: nahoře celková chyba, pod ní seznam polí; nová chyba se ukáže. */
export function RecordDialogErrorStrip({ error, fieldErrors }: RecordDialogErrorStripProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasError = error !== null && error !== undefined && error !== false && error !== "";
  const visible = hasError || Boolean(fieldErrors?.length);
  useEffect(() => {
    // Synchronizace s DOM: nová chyba se posune do zorného pole posuvného obsahu.
    if (visible) ref.current?.scrollIntoView?.({ block: "nearest" });
  }, [visible, error, fieldErrors]);
  if (!visible) return null;
  return (
    <div
      ref={ref}
      role="alert"
      data-slot="record-dialog-field-errors"
      className="sticky bottom-0 z-10 space-y-1 border-l-4 border-destructive bg-destructive-soft px-3 py-2 text-destructive-strong"
    >
      {hasError ? <div data-slot="record-dialog-error">{error}</div> : null}
      {fieldErrors?.length ? <FieldErrorSummary errors={fieldErrors} /> : null}
    </div>
  );
}

/** Vlastnosti tlačítka Uložit. */
interface SubmitButtonProps {
  /** Text tlačítka. */
  label: string;
  /** Probíhá ukládání. */
  busy: boolean;
}

/** Uložit s pevnou šířkou: během ukládání ukáže „Ukládám…“ bez poskočení. */
export function RecordDialogSubmitButton({ label, busy }: SubmitButtonProps) {
  const saving = useDsTexts().recordDialog.saving;
  return (
    <Button type="submit" disabled={busy} aria-busy={busy || undefined} data-slot="record-submit">
      <span className="grid">
        <span className={cn("col-start-1 row-start-1", busy && "invisible")}>{label}</span>
        <span className={cn("col-start-1 row-start-1", !busy && "invisible")}>{saving}</span>
      </span>
    </Button>
  );
}
