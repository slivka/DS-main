import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

export interface ContextPillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  value: string;
  icon?: LucideIcon;
  children: ReactNode;
  contentClassName?: string;
  contentAlign?: "start" | "center" | "end";
  valueMuted?: boolean;
  statusIndicator?: ReactNode;
  compactValue?: string;
}

/** Dvouřádkový kontextový přepínač do horní lišty aplikace. */
export const ContextPill = forwardRef<HTMLButtonElement, ContextPillProps>(
  ({ label, value, icon: Icon, children, className, contentClassName, contentAlign = "start", valueMuted = false, statusIndicator, compactValue, ...props }, ref) => (
    <TooltipProvider>
      <Tooltip>
        <Popover>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                ref={ref}
                type="button"
                variant="ghost"
                className={cn("h-11 min-w-0 max-w-[360px] justify-start gap-2 px-3 text-left xl:min-w-[220px]", className)}
                {...props}
              >
                {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
                {statusIndicator}
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="hidden truncate text-xs font-normal text-muted-foreground xl:block">{label}</span>
                  <span className={cn("block truncate text-sm font-semibold", valueMuted ? "text-muted-foreground" : "text-foreground")}>
                    <span className="md:hidden">{compactValue ?? value}</span>
                    <span className="hidden md:inline">{value}</span>
                  </span>
                </span>
                <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground xl:block" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="xl:hidden">{label}</TooltipContent>
          <PopoverContent align={contentAlign} className={cn("p-0", contentClassName)}>
            {children}
          </PopoverContent>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  ),
);
ContextPill.displayName = "ContextPill";