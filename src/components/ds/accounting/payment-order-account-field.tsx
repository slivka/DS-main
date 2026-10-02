/**
 * Účet přijatého dokladu s přepínačem platebního příkazu.
 * Vlastní: vizuální stav zahrnutí a zpřístupnění obsahu pole.
 * Nesmí: měnit hodnotu účtu při vypnutí.
 */
import type { ReactNode } from "react";
import { Landmark } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { FieldValue } from "../form/field-value";

/** Vlastnosti účtu s přepínačem platebního příkazu. */
export interface PaymentOrderAccountFieldProps {
  /** Zapnuté zahrnutí do platebních příkazů. */
  enabled: boolean;
  /** Změna stavu. */
  onEnabledChange?: (enabled: boolean) => void;
  /** Obsah aktivního pole. */
  children: ReactNode;
  /** Tooltip zapnutého stavu. */
  enabledLabel: string;
  /** Tooltip vypnutého stavu. */
  disabledLabel: string;
  /** Důvod prázdného zakázaného pole. */
  disabledReason: string;
}

/** Pole účtu s ikonou banky, která funguje stejně jako Σ u částky. */
export function PaymentOrderAccountField(props: PaymentOrderAccountFieldProps) {
  const label = props.enabled ? props.enabledLabel : props.disabledLabel;
  const action = (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant={props.enabled ? "default" : "outline"}
          size="icon"
          aria-label={label}
          aria-pressed={props.enabled}
          disabled={!props.onEnabledChange}
          onClick={() => props.onEnabledChange?.(!props.enabled)}
          className="absolute right-1 top-1 size-[calc(var(--control-h)-0.5rem)]"
        >
          <span className="relative">
            <Landmark className="size-4" />
            {!props.enabled ? (
              <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
            ) : null}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
  return (
    <div data-slot="payment-order-account" data-enabled={props.enabled} className="relative min-w-0">
      {props.enabled ? (
        <div className="[&_[role=combobox]]:pr-11 [&_input]:pr-11">{props.children}</div>
      ) : (
        <FieldValue lockedReason={props.disabledReason} className="pr-11" />
      )}
      {action}
    </div>
  );
}