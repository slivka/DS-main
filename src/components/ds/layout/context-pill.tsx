import { createContext, forwardRef, useContext, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
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
  tooltip?: string;
  valueClassName?: string;
  detail?: ReactNode;
  detailClassName?: string;
}

const ContextPillCloseContext = createContext<() => void>(() => {});

/** Zavře popover ContextPill z potomka (např. po výběru položky). */
export function useContextPillClose() {
  return useContext(ContextPillCloseContext);
}

/** Jednořádkový kontextový přepínač do horní lišty aplikace. */
export const ContextPill = forwardRef<HTMLButtonElement, ContextPillProps>(
  ({ label, value, icon: Icon, children, className, contentClassName, contentAlign = "start", valueMuted = false, statusIndicator, compactValue, tooltip, valueClassName, detail, detailClassName, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    return (
      <TooltipProvider>
        <Tooltip>
          <Popover open={open} onOpenChange={setOpen}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  ref={ref}
                  type="button"
                  variant="ghost"
                  aria-label={label}
                  className={cn("h-11 min-w-0 max-w-[360px] justify-start gap-2 px-2 text-left", className)}
                  {...props}
                >
                  {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
                  {statusIndicator}
                  <span className="flex min-w-0 flex-1 items-baseline gap-2 leading-tight">
                    <span className={cn("block min-w-0 truncate text-base font-semibold xl:text-lg", valueMuted ? "text-muted-foreground" : "text-foreground", valueClassName)}>
                      <span data-slot="context-pill-mobile-value" className="md:hidden">{compactValue ?? value}</span>
                      <span data-slot="context-pill-value" className="hidden md:inline">{value}</span>
                    </span>
                    {detail ? <span className={cn("hidden min-w-0 truncate text-sm font-normal text-muted-foreground 2xl:inline", detailClassName)}>{detail}</span> : null}
                  </span>
                  <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>{tooltip ?? `${label}: ${value}`}</TooltipContent>
            <PopoverContent align={contentAlign} className={cn("p-0", contentClassName)}>
              <ContextPillCloseContext.Provider value={() => setOpen(false)}>
                {children}
              </ContextPillCloseContext.Provider>
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
ContextPill.displayName = "ContextPill";
