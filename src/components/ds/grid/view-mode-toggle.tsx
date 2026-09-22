import { ListTree, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type GridViewMode = "grid" | "tree";

/**
 * Prepínač medzi tabuľkovým a stromovým zobrazením hierarchických číselníkov.
 * Ikona sa mení podľa toho, na aké zobrazenie sa prepne.
 */
export function ViewModeToggle({
  mode,
  onChange,
}: {
  mode: GridViewMode;
  onChange: (mode: GridViewMode) => void;
}) {
  const next: GridViewMode = mode === "grid" ? "tree" : "grid";
  const label = next === "tree" ? "Stromové zobrazení" : "Tabulkové zobrazení";
  const Icon = next === "tree" ? ListTree : Table2;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label={label}
          className="grid-toolbar-icon-control"
          onClick={() => onChange(next)}
        >
          <Icon className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
