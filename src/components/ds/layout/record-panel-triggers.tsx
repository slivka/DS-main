/** Spouštěče panelu · vlastní ikony a počty · nesmí určovat záložky ani výběr záznamu. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { fmtAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
/** Jeden obecný indikátor dodaný aplikací. */
export interface RecordIndicator {
  /** Identifikátor záložky. */
  id: string;
  /** Popisek i přístupný název. */
  label: string;
  /** Ikona významu dodaná aplikací. */
  icon: LucideIcon;
  /** Počet, nula nezobrazuje číslo. */
  count?: number;
}
/** Skupina ikon pro otevření panelu. */
export interface RecordPanelTriggersProps extends ComponentPropsWithoutRef<"div"> {
  /** Pouze dostupné indikátory ve stanoveném pořadí. */
  indicators: readonly RecordIndicator[];
  /** Otevře panel na konkrétní záložce. */
  onIndicatorClick: (id: string) => void;
  /** Aktivní záložka otevřeného panelu. */
  activeTab?: string;
  /** Velikost tlačítek. */
  size?: "default" | "compact";
}
/** Sdílené ikonové spouštěče pro formuláře, dialogy a buňky gridu. */
export const RecordPanelTriggers = forwardRef<HTMLDivElement, RecordPanelTriggersProps>(
  function RecordPanelTriggers(
    { indicators, onIndicatorClick, activeTab, size = "default", className, ...props },
    ref,
  ) {
    return (
      <div
        ref={ref}
        {...props}
        className={cn("inline-flex shrink-0 items-center gap-1", className)}
      >
        {indicators.map(({ id, label, icon: Icon, count = 0 }) => (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={activeTab === id ? "outline" : "ghost"}
                size="icon"
                className={cn(
                  "shrink-0 gap-1",
                  size === "compact"
                    ? "h-7 w-[var(--record-indicator-slot)]"
                    : "h-[var(--control-h)] w-[var(--record-indicator-slot)]",
                  count === 0 && "text-muted-foreground",
                )}
                aria-label={count > 0 ? `${label}: ${fmtAmount(count, 0)}` : label}
                aria-pressed={activeTab === id}
                onDoubleClick={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onIndicatorClick(id);
                }}
              >
                <Icon aria-hidden="true" className="size-4 shrink-0" />
                {count > 0 ? (
                  <span className="truncate text-xs tabular-nums">{fmtAmount(count, 0)}</span>
                ) : null}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    );
  },
);
