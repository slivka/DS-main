import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { fmtAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { parseDecimalInput } from "../form/decimal-input";
import { nextEditorIndex } from "./grid-selection";

export interface GridAmountEditorProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange" | "type" | "max"> {
  /** Aktuální částka (null = nevyplněno). */
  value: number | null;
  /** Potvrzená částka – volá se při Enter, Tab nebo opuštění pole. */
  onChange: (value: number | null) => void;
  /** Nejvyšší povolená částka; převýšení hlásí aplikace přes `invalid` (viz `exceedsMax`). */
  max?: number | undefined;
  /** Značka měny z dat, zobrazená za číslem. */
  currencySymbol?: string | undefined;
  /** Počet desetinných míst (výchozí 2). */
  decimals?: number | undefined;
  /** Chybná hodnota – červený roh buňky. */
  invalid?: boolean | undefined;
  /** Text chyby v tooltipu. */
  invalidMessage?: string | undefined;
  /** Přístupný název pole. */
  ariaLabel: string;
}

/** True, když částka převyšuje povolené maximum (s tolerancí haléřového zaokrouhlení). */
export function exceedsMax(value: number | null | undefined, max: number | null | undefined): boolean {
  if (value == null || max == null) return false;
  return Math.round(value * 100) > Math.round(max * 100);
}

/**
 * Číselný editor v buňce obecného DataGrid (sloupec s `editor`).
 * Vpravo zarovnané číslo bez rámečku, chyba = červený roh + tooltip,
 * Tab / Shift+Tab přechází mezi editory gridu, Enter potvrdí, Esc vrátí.
 */
export const GridAmountEditor = React.forwardRef<HTMLInputElement, GridAmountEditorProps>(function GridAmountEditor(
  { value, onChange, max, currencySymbol, decimals = 2, invalid, invalidMessage, ariaLabel, className, onKeyDown, onFocus, onBlur, onClick, ...props },
  ref,
) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const original = React.useRef<number | null>(value);
  const skipCommit = React.useRef(false);
  const shown = draft ?? (value == null ? "" : fmtAmount(value, decimals));

  const commit = () => {
    if (draft === null) return;
    const parsed = parseDecimalInput(draft);
    const rounded = parsed == null ? null : Math.round(parsed * 10 ** decimals) / 10 ** decimals;
    setDraft(null);
    if (rounded !== value) onChange(rounded);
  };

  const input = (
    <input
      ref={ref}
      type="text"
      inputMode="decimal"
      data-grid-editor=""
      data-grid-interactive=""
      aria-label={ariaLabel}
      aria-invalid={invalid || undefined}
      {...(max !== undefined ? { "data-max": max } : {})}
      className={cn("grid-amount-editor num w-full min-w-0 bg-transparent text-right tabular-nums outline-none", className)}
      value={shown}
      onClick={(event) => { event.stopPropagation(); onClick?.(event); }}
      onFocus={(event) => {
        original.current = value;
        setDraft(value == null ? "" : String(value).replace(".", ","));
        event.currentTarget.select();
        onFocus?.(event);
      }}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => {
        if (skipCommit.current) {
          skipCommit.current = false;
          setDraft(null);
        } else commit();
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key === "Enter") {
          event.preventDefault();
          commit();
        } else if (event.key === "Escape") {
          event.preventDefault();
          skipCommit.current = true;
          setDraft(null);
          if (original.current !== value) onChange(original.current);
          event.currentTarget.blur();
        } else if (event.key === "Tab") {
          const scope = event.currentTarget.closest("table") ?? event.currentTarget.ownerDocument;
          const editors = Array.from(scope.querySelectorAll<HTMLInputElement>("input[data-grid-editor]"));
          const target = nextEditorIndex(editors.indexOf(event.currentTarget), editors.length, event.shiftKey);
          if (target !== null) {
            event.preventDefault();
            commit();
            editors[target]?.focus();
          }
        }
      }}
      {...props}
    />
  );

  const cell = (
    <span data-slot="grid-amount-editor" data-invalid={invalid || undefined} className="grid-amount-editor-cell relative flex w-full items-center gap-1">
      {input}
      {currencySymbol ? <span className="shrink-0 text-muted-foreground">{currencySymbol}</span> : null}
    </span>
  );
  // Tooltip vykreslujeme vždy, aby se input při změně platnosti nepřemontoval.
  const showError = Boolean(invalid && invalidMessage);
  return (
    <Tooltip {...(showError ? {} : { open: false })}>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      {showError ? <TooltipContent>{invalidMessage}</TooltipContent> : null}
    </Tooltip>
  );
});
