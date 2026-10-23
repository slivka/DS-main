/** Tlačítko panelu · vlastní otevřený stav a indikátor · nesmí přemisťovat obsah. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Ovladač panelu za nabídkou v liště akcí formuláře, v gridu za Obnovit. */
export interface PanelToggleButtonProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "onToggle"
> {
  /** Otevřený panel v tomto okně. */
  open: boolean;
  /** Žádost o změnu otevření. */
  onToggle: () => void;
  /** Tečka upozornění dodaná aplikací. */
  indicator?: boolean;
  /** Doplňující informace z aplikace pod akcí bubliny (např. počty příloh). */
  tooltip?: string;
  /** Umístění panelu; bez hodnoty se použije open. */
  state?: "closed" | "open" | "elsewhere";
  /** Zaměření panelu v sousedním okně. */
  onFocusElsewhere?: () => void;
}
/** Stisknutý stav znamená otevřený panel, včetně sousedního okna. */
export const PanelToggleButton = forwardRef<HTMLButtonElement, PanelToggleButtonProps>(
  function PanelToggleButton(
    { open, onToggle, indicator, tooltip, state, onFocusElsewhere, className, ...props },
    ref,
  ) {
    const active = state ? state !== "closed" : open;
    // Zavřený panel: šipka k obsahu (←, „Otevřít panel“); otevřený: šipka ven (→, „Zavřít panel“).
    const Icon = active ? PanelRightClose : PanelRightOpen;
    const t = useDsTexts().recordPanel;
    const action = active && state !== "elsewhere" ? t.close : t.open;
    const extra = tooltip && tooltip !== t.panel ? tooltip : undefined;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            type="button"
            variant="outline"
            size="icon"
            {...props}
            className={cn("relative h-[var(--control-h)] w-[var(--control-h)] shrink-0", className)}
            aria-label={action}
            data-direction={active ? "close" : "open"}
            aria-pressed={active}
            onClick={() => (state === "elsewhere" ? onFocusElsewhere?.() : onToggle())}
          >
            <Icon className="size-4" aria-hidden="true" />
            {indicator ? (
              <span
                aria-hidden="true"
                className="absolute right-1 top-1 size-1.5 rounded-full bg-accent"
              />
            ) : null}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="flex flex-col gap-0.5">
            <span>{action}</span>
            {extra ? <span className="opacity-80">{extra}</span> : null}
          </span>
        </TooltipContent>
      </Tooltip>
    );
  },
);
