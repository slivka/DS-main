/** Ikonové nástroje panelu · vlastní popisek a stav · nesmí měnit oprávnění. */
import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "../../ui/button";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { cn } from "../../../lib/utils";
/** Vnitřní sdílený ikonový ovladač. */
export interface PanelToolButtonProps extends ButtonProps {
  /** Přístupný název. */
  label: string;
  /** Symbol. */
  icon: LucideIcon;
  /** Důvod blokace. */
  blockedReason?: string;
}
/** Tlačítko stejné výšky jako řádek nástrojů. */
export const PanelToolButton = forwardRef<HTMLButtonElement, PanelToolButtonProps>(
  function PanelToolButton(
    { label, icon: Icon, blockedReason, className, children, ...props },
    ref,
  ) {
    return (
      <DisabledReasonTooltip blocked={Boolean(blockedReason)} content={blockedReason ?? label}>
        <Button
          ref={ref}
          type="button"
          variant="ghost"
          size="icon"
          {...props}
          aria-label={label}
          aria-disabled={Boolean(blockedReason) || props["aria-disabled"]}
          onClick={(event) => {
            if (!blockedReason) props.onClick?.(event);
          }}
          className={cn(
            "h-[var(--control-h)] w-[var(--control-h)] shrink-0",
            children && "w-auto gap-1 px-2",
            className,
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          {children}
        </Button>
      </DisabledReasonTooltip>
    );
  },
);
