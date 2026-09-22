import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gridFontSize } from "@/components/ds/grid/grid-zoom";

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
}: {
  active: boolean;
  onToggle: (next: boolean) => void;
  count?: number;
  zoom?: number;
  className?: string;
}) {
  const fontSize = gridFontSize(zoom);
  return (
    <Button
      type="button"
      variant={active ? "default" : "outline"}
      size="sm"
      aria-pressed={active}
      aria-label="Výběr více položek"
      title={active ? "Ukončit výběr více položek" : "Vybrat více položek"}
      className={`shrink-0 px-[0.5em] ${className}`}
      style={{ fontSize }}
      onClick={() => onToggle(!active)}
    >
      <CheckSquare className="size-[1.25em]" />
      {active && count > 0 ? <span className="ml-[0.35em]">{count}</span> : null}
    </Button>
  );
}
