/**
 * Ikonová tlačítka uvnitř pole výběru (tužka, křížek).
 * Vlastní: samostatná tlačítka vedle spouštěče – nikdy vnořená do jiného tlačítka.
 * Nesmí: otevírat nabídku výběru ani měnit hodnotu sama.
 */
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { useDsTexts } from "../../../ds-texts";
import { Pencil, X } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

/** Vlastnosti ikonových akcí v poli. */
export interface FieldInlineActionsProps extends ComponentPropsWithoutRef<"span"> {
  /** Upraví vybraný záznam; bez něj se tužka nezobrazí. */
  onEdit?: () => void;
  /** Přístupný název a tooltip tužky. */
  editLabel?: string;
  /** Vymaže hodnotu; bez něj se křížek nezobrazí. */
  onClear?: () => void;
  /** Přístupný název křížku. */
  clearLabel?: string;
  /** Umístění (výchozí vpravo před šipkou rozbalení). */
  className?: string;
}

/** Tlačítka tužky a křížku absolutně v pravé části pole. */
export const FieldInlineActions = forwardRef<HTMLSpanElement, FieldInlineActionsProps>(function FieldInlineActions({
  onEdit,
  editLabel,
  onClear,
  clearLabel,
  className,
  ...props
}: FieldInlineActionsProps, ref) {
  const texts = useDsTexts().documentForm;
  if (!onEdit && !onClear) return null;
  const item = (label: string | undefined, onClick: () => void, icon: ReactNode) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          onClick={onClick}
          className="size-7"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
  // Vlastní provider: pole funguje i mimo kořenový TooltipProvider aplikace.
  return (
    <TooltipProvider>
      <span
        ref={ref}
        {...props}
        data-slot="field-inline-actions"
        className={cn("absolute right-9 top-1/2 flex -translate-y-1/2 items-center gap-1", className)}
      >
        {onEdit ? item(editLabel ?? texts.editSelected, onEdit, <Pencil className="size-3.5" />) : null}
        {onClear ? item(clearLabel ?? texts.clear, onClear, <X className="size-3.5" />) : null}
      </span>
    </TooltipProvider>
  );
);
