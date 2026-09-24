import * as React from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Copy, Maximize2, Minimize2, MoreHorizontal, Pin, PinOff } from "lucide-react";

import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { DEFAULT_PANE_CHROME_TEXTS, usePaneChrome, type PaneChrome, type PaneChromeTexts } from "../panes/pane-context";

export interface PageHeaderProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Texty ovládání panelu (jen uvnitř PaneLayout). */
  paneTexts?: Partial<PaneChromeTexts>;
}

/**
 * Hlavička stránky – nadpis, popis a akce vpravo.
 * Uvnitř PaneLayout navíc vykreslí ovládání záložky (historie, ponechání, listování, maximalizace, menu ⋯).
 */
export function PageHeader({ title, description, actions, paneTexts, className, ...props }: PageHeaderProps) {
  const chrome = usePaneChrome();
  const t = { ...DEFAULT_PANE_CHROME_TEXTS, ...paneTexts };

  return (
    <div className={cn("@container flex flex-wrap items-start justify-between gap-x-6 gap-y-3", className)} {...props}>
      <div className="flex min-w-0 items-start gap-2">
        {chrome ? <HistoryButtons chrome={chrome} t={t} /> : null}
        <div className="min-w-0 space-y-1">
          <div className="flex min-w-0 items-center gap-1.5">
            {chrome ? (
              <h1
                {...chrome.dragHandleProps}
                className="typo-title min-w-0 cursor-grab truncate text-primary active:cursor-grabbing"
                onDoubleClick={chrome.keep}
                title={chrome.pinned ? undefined : t.keep}
              >
                {title}
              </h1>
            ) : (
              <h1 className="typo-title text-primary">{title}</h1>
            )}
            {chrome ? <TitleStatus chrome={chrome} t={t} /> : null}
          </div>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions || chrome ? (
        <div className="flex flex-wrap items-center gap-2">
          {chrome?.recordNav ? <RecordNavButtons chrome={chrome} t={t} /> : null}
          {actions}
          {chrome ? <PaneButtons chrome={chrome} t={t} /> : null}
        </div>
      ) : null}
    </div>
  );
}

type ChromeProps = { chrome: PaneChrome; t: PaneChromeTexts };

function IconButton({ label, onClick, disabled, children, ...rest }: { label: string; onClick?: () => void; disabled?: boolean; children: React.ReactNode } & React.ComponentPropsWithoutRef<"button">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={label} disabled={disabled} onClick={onClick} {...rest}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** ← → ; podržení 400 ms nebo pravé tlačítko na ← otevře seznam kroků historie. */
function HistoryButtons({ chrome, t }: ChromeProps) {
  const [open, setOpen] = React.useState(false);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const opened = React.useRef(false);
  const steps = [...chrome.history].reverse();

  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={t.back}
              title={t.back}
              disabled={!chrome.canBack && chrome.history.length < 2}
              onPointerDown={(event) => {
                // Radix by menu otevřel hned – otevřeme ho jen podržením.
                event.preventDefault();
                if (event.button !== 0) return;
                opened.current = false;
                holdTimer.current = setTimeout(() => {
                  opened.current = true;
                  setOpen(true);
                }, 400);
              }}
              onPointerUp={() => clearTimeout(holdTimer.current)}
              onPointerLeave={() => clearTimeout(holdTimer.current)}
              onClick={(event) => {
                event.preventDefault();
                if (opened.current) return;
                if (chrome.canBack) chrome.back();
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
            >
              <ArrowLeft className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>{t.history}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {steps.map((step) => {
              const Icon = chrome.getIcon?.(step.icon);
              return (
                <DropdownMenuItem key={step.index} className="gap-2 pr-1" disabled={step.current} onSelect={() => chrome.goToHistory(step.index)}>
                  {Icon ? <Icon className="size-4" /> : null}
                  <span className={cn("min-w-0 flex-1 truncate", step.current && "font-semibold")}>{step.title}</span>
                  {!step.current ? (
                    <button
                      type="button"
                      aria-label={t.openAsKept}
                      title={t.openAsKept}
                      className="flex size-6 items-center justify-center rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        chrome.openFromHistory(step.index);
                        setOpen(false);
                      }}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <IconButton label={t.forward} disabled={!chrome.canForward} onClick={chrome.forward}>
          <ArrowRight className="size-4" />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}

/** ● při neuložených změnách a špendlík (obrys = dočasná, plná = ponechaná). */
function TitleStatus({ chrome, t }: ChromeProps) {
  return (
    <TooltipProvider>
      <span className="flex shrink-0 items-center gap-1">
        {chrome.dirty ? <span role="img" aria-label={t.unsaved} title={t.unsaved} className="size-2 rounded-full bg-primary" /> : null}
        <IconButton
          label={chrome.pinned ? t.release : t.keep}
          aria-pressed={chrome.pinned}
          onClick={() => (chrome.pinned ? chrome.release() : chrome.keep())}
          className={cn("size-7", chrome.pinned ? "text-primary" : "text-muted-foreground")}
        >
          {chrome.pinned ? <Pin className="size-4 fill-current" /> : <PinOff className="size-4" />}
        </IconButton>
      </span>
    </TooltipProvider>
  );
}

/** ↑ n / N ↓ – listování záznamy v pořadí seznamu. */
function RecordNavButtons({ chrome, t }: ChromeProps) {
  const nav = chrome.recordNav!;
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        <IconButton label={t.prevRecord} disabled={nav.index <= 0} onClick={nav.prev}>
          <ArrowUp className="size-4" />
        </IconButton>
        <span className="min-w-12 text-center text-sm tabular-nums text-muted-foreground">
          {(nav.index + 1).toLocaleString("cs-CZ")} / {nav.total.toLocaleString("cs-CZ")}
        </span>
        <IconButton label={t.nextRecord} disabled={nav.index >= nav.total - 1} onClick={nav.next}>
          <ArrowDown className="size-4" />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}

/** Maximalizace (jen při 2–3 panelech) a menu ⋯. */
function PaneButtons({ chrome, t }: ChromeProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        {chrome.canMaximize || chrome.maximized ? (
          <IconButton label={chrome.maximized ? t.restore : t.maximize} onClick={chrome.toggleMaximize}>
            {chrome.maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </IconButton>
        ) : null}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t.more}>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t.more}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-64">
            {chrome.menuActions.map((action) => (
              <React.Fragment key={action.id}>
                {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem disabled={action.disabled} onSelect={action.onSelect}>
                  {action.label}
                  {action.shortcut ? <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut> : null}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
