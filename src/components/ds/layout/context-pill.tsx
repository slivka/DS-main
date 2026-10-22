import { createContext, forwardRef, useContext, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { InlineSearchPopover, InlineSearchContent, InlineSearchTrigger } from "../form/inline-search";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";

export interface ContextPillProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
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
  valueContainerClassName?: string;
  detail?: ReactNode;
  detailClassName?: string;
  iconClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Zapne hledání přímo v kontextovém poli; dotaz řídí hostitel. */
  onSearchChange?: (query: string) => void;
  /**
   * Hodnota se nikdy nezkrátí (např. období); `detail` se zobrazí jen celý, když se vejde,
   * jinak se skryje bez trojtečky – rozhoduje místo v tlačítku, ne šířka okna.
   */
  keepValue?: boolean;
}

const ContextPillCloseContext = createContext<() => void>(() => {});

/** Zavře popover ContextPill z potomka (např. po výběru položky). */
export function useContextPillClose() {
  return useContext(ContextPillCloseContext);
}

/** Jednořádkový kontextový přepínač do horní lišty aplikace. */
export const ContextPill = forwardRef<HTMLButtonElement, ContextPillProps>(
  (
    {
      label,
      value,
      icon: Icon,
      children,
      className,
      contentClassName,
      contentAlign = "start",
      valueMuted = false,
      statusIndicator,
      compactValue,
      tooltip,
      valueClassName,
      valueContainerClassName,
      detail,
      detailClassName,
      iconClassName,
      open,
      onOpenChange,
      onSearchChange,
      keepValue = false,
      ...props
    },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const resolvedOpen = open ?? internalOpen;
    const setOpen = (next: boolean) => {
      if (open === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    };
    const Root = onSearchChange ? InlineSearchPopover : Popover;
    const Trigger = onSearchChange ? InlineSearchTrigger : PopoverTrigger;
    const Content = onSearchChange ? InlineSearchContent : PopoverContent;
    return (
      <TooltipProvider>
        <Tooltip>
          <Root
            open={resolvedOpen}
            onOpenChange={setOpen}
            {...(onSearchChange ? { onSearchChange } : {})}
          >
            <TooltipTrigger asChild>
              <Trigger asChild>
                <Button
                  ref={ref}
                  type="button"
                  variant="ghost"
                  aria-label={label}
                  role={onSearchChange ? "combobox" : undefined}
                  className={cn(
                    "h-9 min-w-0 max-w-[22.5rem] justify-start gap-2 rounded-md px-2.5 py-1 text-left",
                    className,
                  )}
                  {...props}
                >
                  {Icon ? (
                    <Icon className={cn("size-4 shrink-0 text-muted-foreground", iconClassName)} />
                  ) : null}
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 items-center gap-2",
                      valueContainerClassName,
                    )}
                  >
                    {statusIndicator}
                    <span
                      data-slot="context-pill-text"
                      className={cn(
                        "flex min-w-0 flex-1 items-baseline gap-x-2 leading-tight",
                        // Detail, který se nevejde, se zalomí na skrytý druhý řádek.
                        keepValue && "h-[1.25rem] flex-wrap overflow-hidden",
                      )}
                    >
                      <span
                        className={cn(
                          "block text-base font-semibold",
                          keepValue ? "shrink-0 whitespace-nowrap" : "min-w-0 truncate",
                          valueMuted ? "text-muted-foreground" : "text-foreground",
                          valueClassName,
                        )}
                      >
                        <span data-slot="context-pill-mobile-value" className="md:hidden">
                          {compactValue ?? value}
                        </span>
                        <span data-slot="context-pill-value" className="hidden md:inline">
                          {value}
                        </span>
                      </span>
                      {detail ? (
                        <span
                          data-slot="context-pill-detail"
                          className={cn(
                            "text-sm font-normal text-muted-foreground",
                            keepValue
                              ? "shrink-0 whitespace-nowrap"
                              : "hidden min-w-0 truncate 2xl:inline",
                            detailClassName,
                          )}
                        >
                          {detail}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground md:block" />
                </Button>
              </Trigger>
            </TooltipTrigger>
            <TooltipContent>{tooltip ?? `${label}: ${value}`}</TooltipContent>
            <Content align={contentAlign} className={cn("p-0", contentClassName)}>
              <ContextPillCloseContext.Provider value={() => setOpen(false)}>
                {children}
              </ContextPillCloseContext.Provider>
            </Content>
          </Root>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
ContextPill.displayName = "ContextPill";
