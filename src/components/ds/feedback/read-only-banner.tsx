import type { ReactNode } from "react";
import { Lock } from "lucide-react";

import { cn } from "../../../lib/utils";

/** Pruh nad formulářem s důvodem, proč je záznam jen pro čtení. */
export function ReadOnlyBanner({
  reason,
  title = "Jen pro čtení",
  actions,
  className,
}: {
  /** Důvod, např. „Doklad je uzamčen“ nebo „Účetní období je uzavřené“. */
  reason: ReactNode;
  title?: ReactNode;
  /** Volitelné akce vpravo (např. „Požádat o odemčení“). */
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100",
        className,
      )}
    >
      <Lock aria-hidden="true" className="size-4 shrink-0" />
      <span className="font-semibold">{title}</span>
      <span className="min-w-0 flex-1">{reason}</span>
      {actions ? <span className="flex items-center gap-2">{actions}</span> : null}
    </div>
  );
}
