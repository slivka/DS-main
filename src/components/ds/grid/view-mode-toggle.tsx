import { ListTree, Table } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

export type GridViewMode = "grid" | "tree";

/**
 * Prepínač medzi tabuľkovým a stromovým zobrazením hierarchických číselníkov.
 * Ikona sa mení podľa toho, na aké zobrazenie sa prepne.
 */
export function ViewModeToggle({
  mode,
  onChange,
  texts: textOverrides,
}: {
  mode: GridViewMode;
  onChange: (mode: GridViewMode) => void;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const next: GridViewMode = mode === "grid" ? "tree" : "grid";
  const label = next === "tree" ? texts.treeView : texts.tableView;
  const Icon = next === "tree" ? ListTree : Table;
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
