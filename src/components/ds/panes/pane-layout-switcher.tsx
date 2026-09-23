import { Columns2, Columns3, Square } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import type { PaneLayoutCount } from "./pane-state";

export type LayoutSwitcherTexts = {
  one: string;
  two: string;
  three: string;
  /** {width} se nahradí potřebnou šířkou v px. */
  needsWidth: string;
};

export const DEFAULT_LAYOUT_SWITCHER_TEXTS: LayoutSwitcherTexts = {
  one: "Jedno okno",
  two: "Dvě okna",
  three: "Tři okna",
  needsWidth: "Pro {count} okna je potřeba šířka alespoň {width} px",
};

/** Přepínač počtu panelů (1 / 2 / 3) do horní lišty aplikace. */
export function LayoutSwitcher({
  value,
  onChange,
  maxLayout = 3,
  requiredWidths,
  texts,
  className,
}: {
  value: PaneLayoutCount;
  onChange: (layout: PaneLayoutCount) => void;
  /** Nejvyšší dostupné rozložení podle šířky okna. */
  maxLayout?: PaneLayoutCount;
  /** Potřebná šířka v px pro rozložení 2 a 3 (pro tooltip). */
  requiredWidths?: { 2: number; 3: number };
  texts?: Partial<LayoutSwitcherTexts>;
  className?: string;
}) {
  const t = { ...DEFAULT_LAYOUT_SWITCHER_TEXTS, ...texts };
  const options: { layout: PaneLayoutCount; label: string; icon: typeof Square }[] = [
    { layout: 1, label: t.one, icon: Square },
    { layout: 2, label: t.two, icon: Columns2 },
    { layout: 3, label: t.three, icon: Columns3 },
  ];

  return (
    <TooltipProvider>
      <div className={cn("flex shrink-0 items-center gap-0.5", className)} role="group" aria-label={t.two}>
        {options.map(({ layout, label, icon: Icon }) => {
          const disabled = layout > maxLayout;
          const required = requiredWidths && layout > 1 ? requiredWidths[layout as 2 | 3] : undefined;
          const tooltip = disabled && required
            ? t.needsWidth.replace("{count}", String(layout)).replace("{width}", String(Math.round(required)))
            : label;
          return (
            <Tooltip key={layout}>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    type="button"
                    size="icon"
                    variant={value === layout ? "secondary" : "ghost"}
                    aria-label={label}
                    aria-pressed={value === layout}
                    disabled={disabled}
                    className={cn(disabled && "text-muted-foreground opacity-50")}
                    onClick={() => onChange(layout)}
                  >
                    <Icon className="size-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>{tooltip}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
