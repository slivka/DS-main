/** Prázdný panel · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
import { cn } from "../../../lib/utils";
import { DEFAULT_PANE_TEXTS } from "./pane-layout-utils";
export interface PaneEmptyProps {
  hint?: string;
  className?: string;
}

/** Výchozí obsah prázdného panelu. */
export function PaneEmpty({ hint = DEFAULT_PANE_TEXTS.emptyHint, className }: PaneEmptyProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-40 items-center justify-center text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {hint}
    </div>
  );
}
