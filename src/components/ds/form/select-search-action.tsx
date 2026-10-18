/** Akce hledání · vlastní přidání v řádku · nesmí zakládat ani ukládat záznam. */
import { TooltipProvider } from "../../ui/tooltip";
import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";

/** Vlastnosti sdílené akce vytvoření. */
export interface SelectSearchActionProps {
  /** Přístupný název akce z DsTexts nebo aplikace. */
  label: string;
  /** Vyvolá vytvoření s aktuálním dotazem. */
  onCreate: () => void;
  /** Důvod chybějícího oprávnění. */
  disabledReason?: string;
  /** Probíhající akce nebo jiná nepřístupnost. */
  disabled?: boolean;
}

/** Tlačítko + na pravém okraji hledání. */
export function SelectSearchAction({
  label,
  onCreate,
  disabledReason,
  disabled,
}: SelectSearchActionProps) {
  return (
    <TooltipProvider>
      <DisabledReasonTooltip
        content={disabledReason ? `${label}: ${disabledReason}` : label}
        blocked={Boolean(disabledReason)}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          disabled={disabledReason ? undefined : disabled}
          aria-disabled={disabledReason ? true : undefined}
          className="size-8 shrink-0 p-0"
          onClick={() => {
            if (!disabledReason && !disabled) onCreate();
          }}
        >
          <Plus className="size-4" />
        </Button>
      </DisabledReasonTooltip>
    </TooltipProvider>
  );
}
