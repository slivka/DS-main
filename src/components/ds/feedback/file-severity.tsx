/** Stav souboru/kontroly · vlastní významové ikony · nesmí vyhodnocovat kontrolu. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { CircleCheck, Info, TriangleAlert, CircleX, LoaderCircle } from "lucide-react";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
/** Obecná závažnost kontroly. */
export type CheckSeverity = "ok" | "info" | "warning" | "error";
/** Stav zpracování souboru. */
export type FileSeverity = CheckSeverity | "loading";
const ICONS = {
  ok: CircleCheck,
  info: Info,
  warning: TriangleAlert,
  error: CircleX,
  loading: LoaderCircle,
};
const TONES = {
  ok: "text-success-strong",
  info: "text-primary",
  warning: "text-warning-strong",
  error: "text-destructive",
  loading: "text-muted-foreground motion-safe:animate-spin",
};
/** Sdílená ikona závažnosti s vysvětlením. */
export interface FileSeverityIconProps extends ComponentPropsWithoutRef<"span"> {
  /** Stav dodaný APP. */ severity: FileSeverity;
  /** Vysvětlení od APP; jinak přeložený obecný název. */ message?: string;
}
/** Přístupná stavová ikona pro soubory a kontroly. */
export const FileSeverityIcon = forwardRef<HTMLSpanElement, FileSeverityIconProps>(
  function FileSeverityIcon({ severity, message, className, ...props }, ref) {
    const t = useDsTexts().fileImport;
    const label = message ?? t.severity[severity];
    const Icon = ICONS[severity];
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            ref={ref}
            {...props}
            role="img"
            aria-label={label}
            tabIndex={0}
            className={cn(
              "inline-flex shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              className,
            )}
          >
            <Icon aria-hidden="true" className={cn("size-4", TONES[severity])} />
          </span>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
  },
);
