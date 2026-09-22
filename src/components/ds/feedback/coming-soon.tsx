import type { ReactNode } from "react";
import { Hammer } from "lucide-react";

import { cn } from "../../../lib/utils";

/** Prázdný stav stránky, která se teprve připravuje. */
export function ComingSoon({
  title = "Připravujeme",
  description = "Tato část aplikace se právě připravuje. Dáme vám vědět, jakmile bude hotová.",
  actions,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-card px-6 py-16 text-center",
        className,
      )}
    >
      <Hammer aria-hidden="true" className="size-8 text-muted-foreground" />
      <h2 className="typo-title text-primary">{title}</h2>
      <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      {actions ? <div className="flex flex-wrap items-center gap-2 pt-2">{actions}</div> : null}
    </div>
  );
}
