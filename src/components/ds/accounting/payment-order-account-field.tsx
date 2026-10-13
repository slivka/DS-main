/**
 * Účet přijatého dokladu s přepínačem platebního příkazu.
 * Vlastní: vizuální stav zahrnutí a zpřístupnění obsahu pole.
 * Nesmí: měnit hodnotu účtu při vypnutí.
 */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Landmark } from "lucide-react";

import { FieldToggleButton } from "../form/field-toggle-button";
import { LockedAccountValue } from "./locked-account-value";
import { cn } from "../../../lib/utils";

/** Vlastnosti účtu s přepínačem platebního příkazu. */
export interface PaymentOrderAccountFieldProps extends ComponentPropsWithoutRef<"div"> {
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
  /** Důvod zamčení přepínače (např. způsob platby); jen ten je přístupný popis. */
  lockedReason?: string;
}

/** Pole účtu s ikonou banky, která funguje stejně jako Σ u částky. */
export const PaymentOrderAccountField = forwardRef<HTMLDivElement, PaymentOrderAccountFieldProps>(
  function PaymentOrderAccountField(
    {
      enabled,
      onEnabledChange,
      children,
      enabledLabel,
      disabledLabel,
      disabledReason,
      lockedReason,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <div
        {...rest}
        ref={ref}
        data-slot="payment-order-account"
        data-enabled={enabled}
        className={cn("relative min-w-0", className)}
      >
        {enabled ? (
          <div className="[&_[role=combobox]]:pr-[calc(var(--field-toggle-space)+1.5rem)] [&_[data-slot=select-chevron]]:right-[var(--field-toggle-space)] [&_input]:pr-[var(--field-toggle-space)]">
            {children}
          </div>
        ) : (
          <LockedAccountValue reason={disabledReason} className="pr-[var(--field-toggle-space)]" />
        )}
        <FieldToggleButton
          icon={Landmark}
          pressed={enabled}
          onPressedChange={onEnabledChange}
          label={enabledLabel}
          pressedTooltip={enabledLabel}
          unpressedTooltip={disabledLabel}
          lockedReason={lockedReason}
        />
      </div>
    );
  },
);
