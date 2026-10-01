/**
 * Hlavička otevřeného panelu rámu aplikace.
 * Vlastní: přepínač částí panelu (radiogroup se šipkami, Home, End), nadpis se štítkem, kontext
 * panelu a tlačítko Zavřít; barvu pozadí podle `accent`.
 * Nesmí: rozhodovat o otevření panelu – zavření jen oznámí přes `onClose`.
 */
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { X } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { StatusBadge } from "../data-display/status-badge";
import { TruncatedText } from "../data-display/truncated-text";
import type { AppShellPanel, AppShellPanelView } from "./app-shell-types";

/** Props textu kontextu panelu. */
export interface PanelContextTextProps {
  /** Kontext panelu; prázdná hodnota nic nevykreslí. */
  value?: ReactNode;
  /** Třídy textu. */
  className?: string;
}

/** Kontext panelu: text i ReactNode se zkracují „…“ a mají tooltip. */
export function PanelContextText({ value, className }: PanelContextTextProps) {
  if (value == null || value === false || value === "") return null;
  if (typeof value === "string") return <TruncatedText className={className} text={value} />;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("min-w-0 truncate", className)}>{value}</div>
        </TooltipTrigger>
        <TooltipContent>{value}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Index další části panelu podle klávesy; -1 = klávesa přepínač nemění. */
function nextViewIndex(key: string, index: number, last: number) {
  if (key === "ArrowRight" || key === "ArrowDown") return index >= last ? 0 : index + 1;
  if (key === "ArrowLeft" || key === "ArrowUp") return index <= 0 ? last : index - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  return -1;
}

/** Props hlavičky panelu. */
export interface AppShellPanelHeaderProps {
  /** Otevřený panel. */
  panel: AppShellPanel;
  /** Aktivní část panelu, nebo null u panelu bez částí. */
  view: AppShellPanelView | null;
  /** Nadpis (část má přednost před panelem). */
  title: string;
  /** Kontext pod nadpisem. */
  context?: ReactNode;
  /** Text tlačítka zavření. */
  closeText: ReactNode;
  /** Přístupný název přepínače částí. */
  viewsLabel: string;
  /** Zavření panelu. */
  onClose: () => void;
}

/** Hlavička otevřeného panelu nad obsahem stránky. */
export function AppShellPanelHeader({
  panel,
  view,
  title,
  context,
  closeText,
  viewsLabel,
  onClose,
}: AppShellPanelHeaderProps) {
  const views = panel.views ?? [];
  const onViewKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = nextViewIndex(event.key, index, views.length - 1);
    const target = views[next];
    if (next < 0 || !target) return;
    event.preventDefault();
    panel.onViewChange?.(target.id);
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    buttons?.[next]?.focus();
  };
  return (
    <div
      data-slot="app-shell-panel-header"
      className={cn(
        "flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b px-3 py-1 md:flex-nowrap",
        panel.accent === "warning" ? "bg-warning/10" : "bg-muted",
      )}
    >
      {views.length >= 2 ? (
        <div
          data-slot="app-shell-panel-views"
          role="radiogroup"
          aria-label={viewsLabel}
          className="order-4 grid basis-full grid-flow-col auto-cols-fr overflow-hidden rounded-md border border-input bg-background md:order-2 md:basis-auto"
        >
          {views.map((item, index) => (
            <Button
              key={item.id}
              type="button"
              variant="ghost"
              role="radio"
              aria-checked={item.id === view?.id}
              tabIndex={item.id === view?.id ? 0 : -1}
              onKeyDown={(event) => onViewKeyDown(event, index)}
              className={cn(
                "h-8 min-h-0 w-full whitespace-nowrap rounded-none border-0 px-3 font-normal shadow-none",
                index > 0 && "border-l border-l-input",
                item.id === view?.id && "bg-primary/10 font-semibold text-primary",
              )}
              onClick={() => panel.onViewChange?.(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}
      <div data-slot="app-shell-panel-heading" className="order-2 min-w-0 flex-1 py-1 md:order-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate whitespace-nowrap font-semibold">{title}</span>
          {panel.badge ? (
            <StatusBadge
              status="panel"
              config={{ panel: panel.badge }}
              className="h-[1.625rem] shrink-0 px-2 text-[0.75rem]"
            />
          ) : null}
        </div>
        <PanelContextText
          value={context}
          className="max-w-full text-[0.75rem] leading-tight text-muted-foreground"
        />
      </div>
      <Button
        type="button"
        variant="default"
        size="sm"
        className="order-3 ml-auto shrink-0 whitespace-nowrap md:order-4"
        onClick={onClose}
      >
        <X className="size-4" />
        {closeText}
      </Button>
    </div>
  );
}
