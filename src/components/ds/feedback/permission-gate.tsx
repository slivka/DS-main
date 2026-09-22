import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

/**
 * Obal podle oprávnění – obsah buď úplně skryje, nebo zobrazí zakázaný
 * (neaktivní a neklikatelný) s vysvětlením v nápovědě.
 */
export function PermissionGate({
  allowed,
  mode = "hide",
  reason = "Nemáte oprávnění k této akci",
  children,
  className,
}: {
  allowed: boolean;
  mode?: "hide" | "disable";
  /** Důvod zobrazený jako nápověda u zakázaného obsahu. */
  reason?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  if (allowed) return <>{children}</>;
  if (mode === "hide") return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            aria-disabled="true"
            className={cn(
              "pointer-events-none inline-flex cursor-not-allowed opacity-50 [&_*]:pointer-events-none",
              className,
            )}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent>{reason}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
