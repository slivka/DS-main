import { Minus, Plus, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_FONT_SIZES, useAppFontSize } from "@/hooks/useAppFontSize";

/** Volba velikosti písma aplikace – ukládá se do localStorage a řídí rem. */
export function AppFontSizeControl() {
  const { fontSize, setFontSize, defaultSize } = useAppFontSize();
  const min = APP_FONT_SIZES[0];
  const max = APP_FONT_SIZES[APP_FONT_SIZES.length - 1];

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card px-2 py-1.5 shadow-sm">
      <Type className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Velikost písma</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Zmenšit písmo"
          disabled={fontSize <= min}
          onClick={() => setFontSize(fontSize - 1)}
        >
          <Minus className="size-4" />
        </Button>
        <span className="w-12 text-center text-sm tabular-nums">{fontSize} px</span>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Zvětšit písmo"
          disabled={fontSize >= max}
          onClick={() => setFontSize(fontSize + 1)}
        >
          <Plus className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label="Výchozí velikost písma"
          disabled={fontSize === defaultSize}
          onClick={() => setFontSize(defaultSize)}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
