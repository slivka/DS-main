import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { gridFontSize } from "./grid-zoom";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

export interface GridRefreshButtonProps {
  onRefresh: () => void | Promise<unknown>;
  refreshing?: boolean;
  zoom?: number;
  className?: string;
  texts?: Partial<GridTexts>;
}

/** Sdíjené tlačítko ručního obnovení dat v liště gridu. */
export function GridRefreshButton({ onRefresh, refreshing, zoom = 1, className, texts: textOverrides }: GridRefreshButtonProps) {
  const texts = resolveGridTexts(textOverrides);
  const [pending, setPending] = useState(false);
  const busy = refreshing === true || pending;
  const run = async () => {
    if (busy) return;
    setPending(true);
    try { await onRefresh(); } finally { setPending(false); }
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button type="button" variant="outline" size="sm" disabled={busy} aria-label={texts.refresh} className={cn("grid-toolbar-control shrink-0 px-[0.5em]", className)} style={{ fontSize: gridFontSize(zoom) }} onClick={() => void run()}>
              <RefreshCw className={cn("size-[1.25em]", busy && "animate-spin")} />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>{texts.refresh}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}