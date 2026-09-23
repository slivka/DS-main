import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { cn } from "../../../lib/utils";

export interface ContextPillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  label: string;
  value: string;
  icon?: LucideIcon;
  children: ReactNode;
  contentClassName?: string;
  contentAlign?: "start" | "center" | "end";
}

/** Dvouřádkový kontextový přepínač do horní lišty aplikace. */
export const ContextPill = forwardRef<HTMLButtonElement, ContextPillProps>(
  ({ label, value, icon: Icon, children, className, contentClassName, contentAlign = "start", ...props }, ref) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="ghost"
          className={cn("h-11 min-w-[220px] max-w-[360px] justify-start gap-2 px-3 text-left", className)}
          {...props}
        >
          {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" /> : null}
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-xs font-normal text-muted-foreground">{label}</span>
            <span className="block truncate text-sm font-semibold text-foreground">{value}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align={contentAlign} className={cn("p-0", contentClassName)}>
        {children}
      </PopoverContent>
    </Popover>
  ),
);
ContextPill.displayName = "ContextPill";