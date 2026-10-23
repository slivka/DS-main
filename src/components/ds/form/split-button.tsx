/**
 * Rozdělené tlačítko · vlastní jeden společný obrys, jemnou dělicí čáru a oddělené funkce
 * (hlavní akce | nabídka) · nesmí znát doménu ani obsah nabídky.
 */
import {
  forwardRef,
  useId,
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";

type PartProps = Omit<ComponentPropsWithoutRef<"button">, "onClick" | "disabled" | "children">;

/** Vlastnosti rozděleného tlačítka. */
export interface SplitButtonProps {
  /** Viditelný obsah hlavní části (text, případně s dalšími prvky). */
  label: ReactNode;
  /** Název akce pro přístupné popisky („Další možnosti – <akce>“). */
  actionName: string;
  /** Volitelná ikona před textem hlavní části. */
  icon?: ReactNode;
  /** Hlavní akce (velká plocha). */
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Položky nabídky šipky (DropdownMenuItem…). */
  menu: ReactNode;
  /** Vzhled: primary = plné tlačítko, outline = obrysové. */
  variant?: "primary" | "outline";
  /** Zakázané obě části. */
  disabled?: boolean;
  /** Důvod zákazu; obě části zůstanou fokusovatelné a ukážou ho v bublině. */
  disabledReason?: ReactNode;
  /** Bublina hlavní části (např. text se zkratkou). */
  tooltip?: ReactNode;
  /** Zarovnání nabídky. */
  menuAlign?: "start" | "end";
  /** Doplňkové atributy hlavní části (data-*, aria-*, className). */
  mainProps?: PartProps;
  /** Doplňkové atributy šipky. */
  menuProps?: PartProps;
  /** Doplňkové třídy obalu. */
  className?: string;
}

/** Jedno tlačítko se dvěma funkcemi: hlavní akce a šipka s nabídkou, oddělené jemnou čarou. */
export const SplitButton = forwardRef<HTMLButtonElement, SplitButtonProps>(function SplitButton(
  {
    label,
    actionName,
    icon,
    onClick,
    menu,
    variant = "primary",
    disabled,
    disabledReason,
    tooltip,
    menuAlign = "start",
    mainProps,
    menuProps,
    className,
  },
  ref,
) {
  const t = useDsTexts().recordAction;
  const reasonId = useId();
  const blocked = Boolean(disabled && disabledReason);
  const nativeDisabled = blocked ? undefined : disabled;
  const blockedProps = blocked
    ? { "aria-disabled": true as const, "aria-describedby": reasonId }
    : undefined;
  const main = (
    <Button
      {...mainProps}
      {...blockedProps}
      ref={ref}
      type="button"
      size="sm"
      variant={variant === "primary" ? "default" : "outline"}
      disabled={nativeDisabled}
      onClick={(event) => {
        if (blocked) event.preventDefault();
        else onClick(event);
      }}
      className={cn("ds-split-main", blocked && "cursor-not-allowed", mainProps?.className)}
    >
      {icon}
      {label}
    </Button>
  );
  const arrow = (
    <Button
      {...menuProps}
      {...blockedProps}
      type="button"
      size="sm"
      variant={variant === "primary" ? "default" : "outline"}
      disabled={nativeDisabled}
      aria-label={t.moreOptionsFor(actionName)}
      className={cn("ds-split-menu", blocked && "cursor-not-allowed", menuProps?.className)}
    >
      <ChevronDown aria-hidden="true" className="size-4" />
    </Button>
  );
  return (
    <TooltipProvider delayDuration={250}>
      <DropdownMenu>
        <div
          role="group"
          aria-label={actionName}
          data-slot="split-button"
          data-variant={variant}
          className={cn("ds-split-button", className)}
        >
          {blocked ? (
            <>
              <DisabledReasonTooltip content={disabledReason} blocked>
                {main}
              </DisabledReasonTooltip>
              <DisabledReasonTooltip content={disabledReason} blocked>
                {arrow}
              </DisabledReasonTooltip>
              <span id={reasonId} className="sr-only">
                {disabledReason}
              </span>
            </>
          ) : (
            <>
              {tooltip ? (
                <Tooltip>
                  <TooltipTrigger asChild>{main}</TooltipTrigger>
                  <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
              ) : (
                main
              )}
              <DropdownMenuTrigger asChild disabled={disabled}>
                {arrow}
              </DropdownMenuTrigger>
            </>
          )}
        </div>
        <DropdownMenuContent align={menuAlign}>{menu}</DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
});
