/**
 * Jednotný přepínač uvnitř pole.
 * Vlastní: vsazenou geometrii, stav a přístupnost ikony.
 * Nesmí: měnit hodnotu pole ani při zamčení volat změnu.
 */
import { forwardRef, useId, type ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

/** Vlastnosti jednotného přepínače v poli. */
export interface FieldToggleButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children" | "onChange" | "onClick"
> {
  /** Neměnná ikona obou stavů. */
  icon: LucideIcon;
  /** Zapnutý stav. */
  pressed: boolean;
  /** Požadavek změny; zamčení jej nikdy nevolá. */
  onPressedChange?: (pressed: boolean) => void;
  /** Stálý přístupný název akce. */
  label: string;
  /** Vysvětlení zapnutého stavu. */
  pressedTooltip: string;
  /** Vysvětlení vypnutého stavu. */
  unpressedTooltip: string;
  /** Důvod zamčení; ovládání zůstává dostupné fokusem. */
  lockedReason?: string;
  /** Zakázaný stav; ovládání zůstává dostupné fokusem. */
  disabled?: boolean;
}

/** Přepínač v poli; okolní vstup rezervuje prostor přes --field-toggle-space. */
export const FieldToggleButton = forwardRef<HTMLButtonElement, FieldToggleButtonProps>(
  function FieldToggleButton(
    {
      icon: Icon,
      pressed,
      onPressedChange,
      label,
      pressedTooltip,
      unpressedTooltip,
      lockedReason,
      disabled,
      className,
      onMouseDown,
      ...rest
    },
    ref,
  ) {
    const reasonId = useId();
    const locked = Boolean(disabled || lockedReason || !onPressedChange);
    const tooltip = lockedReason ?? (pressed ? pressedTooltip : unpressedTooltip);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              {...rest}
              ref={ref}
              type="button"
              variant={pressed ? "default" : "outline"}
              size="icon"
              data-slot="field-toggle-button"
              aria-label={label}
              aria-pressed={pressed}
              aria-disabled={locked || undefined}
              aria-describedby={lockedReason ? reasonId : rest["aria-describedby"]}
              onMouseDown={onMouseDown}
              onClick={() => {
                if (!locked) onPressedChange?.(!pressed);
              }}
              className={cn(
                "ds-disabled-control absolute right-1 top-1 size-[calc(var(--control-h)-0.5rem)]",
                className,
              )}
            >
              <span className="relative" aria-hidden="true">
                <Icon className="size-4" />
                {!pressed ? (
                  <span className="absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                ) : null}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
          {lockedReason ? (
            <span id={reasonId} className="sr-only">
              {lockedReason}
            </span>
          ) : null}
        </Tooltip>
      </TooltipProvider>
    );
  },
);
