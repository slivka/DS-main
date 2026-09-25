import { CheckSquare } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { gridFontSize } from "./grid-zoom";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

/**
 * Přepínač režimu hromadného výběru řádků v gridu.
 * Nahrazuje dřívější zapínání výběru přes menu „…“.
 */
export function GridSelectionToggle({
  active,
  onToggle,
  count = 0,
  zoom = 1,
  className = "",
  texts: textOverrides,
}: {
  active: boolean;
  onToggle: (next: boolean) => void;
  count?: number;
  zoom?: number;
  className?: string;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const fontSize = gridFontSize(zoom);
  const label = active ? texts.cancelSelection : texts.selectMore;
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild><Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      aria-pressed={active}
      aria-label={label}
      className={`grid-toolbar-control shrink-0 px-[0.5em] ${className}`}
      style={{ fontSize }}
      onClick={() => onToggle(!active)}
    >
      <CheckSquare className="size-[1.25em]" />
      {active && count > 0 ? <span className="ml-[0.35em]">{count}</span> : null}
    </Button></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip></TooltipProvider>
  );
}
