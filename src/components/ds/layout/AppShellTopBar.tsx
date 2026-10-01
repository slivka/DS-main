/**
 * Horní lišta rámu aplikace.
 * Vlastní: značku, mobilní menu (Sheet), kontext firmy a období (vystředění a zarovnání oddělovače
 * podle místa), drobečky a pravou skupinu akcí, tlačítek panelů, upozornění, motivu a uživatele.
 * Nesmí: držet stav panelů ani menu – dostává ho od AppShell.
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { PanelContextText } from "./AppShellPanels";
import type { AppShellPanel } from "./app-shell-types";

/** Props horní lišty. */
export interface AppShellTopBarProps {
  /** Značka vlevo nad menu. */
  brand?: {
    logo?: ReactNode;
    appName: string;
    collapsed: boolean;
    width: number;
    dragging: boolean;
  };
  /** Mobilní menu. */
  sheet: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    label: string;
    tone: "app" | "panel";
    title: string;
    context?: ReactNode;
    nav: ReactNode;
  };
  /** Kontext firmy a období. */
  contextLeft?: ReactNode;
  /** Kontext je mimo rozsah panelu zakázaný. */
  contextDisabled: boolean;
  /** Nápověda zakázaného kontextu. */
  contextDisabledHint: ReactNode;
  /** Drobečková navigace. */
  breadcrumbs?: Crumb[];
  /** Akce vpravo. */
  actions?: ReactNode;
  /** Tlačítka panelů. */
  panels: AppShellPanel[];
  /** Otevřený panel. */
  activePanelId: string | null;
  /** Klik na tlačítko panelu (otevře, nebo zavře otevřený). */
  onPanelToggle: (id: string | null) => void;
  /** Upozornění. */
  notificationBell?: ReactNode;
  /** Přepínač motivu. */
  themeToggleButton?: ReactNode;
  /** Uživatelské menu. */
  userMenu?: ReactNode;
}

/** Vystředí kontext, pokud se vejde, a srovná šířku firmy s obdobím a oddělovač mezi nimi. */
function useContextPosition(hasContext: boolean) {
  const headerRef = useRef<HTMLElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLSpanElement>(null);
  const rightControlsRef = useRef<HTMLDivElement>(null);
  const [centerContext, setCenterContext] = useState(true);

  const update = useCallback(() => {
    const header = headerRef.current;
    const context = contextRef.current;
    const rightControls = rightControlsRef.current;
    if (!header || !context || !rightControls || !hasContext) return;

    const headerRect = header.getBoundingClientRect();
    const contextWidth = context.getBoundingClientRect().width;
    const rightControlsLeft = rightControls.getBoundingClientRect().left;
    const centeredRight = headerRect.left + headerRect.width / 2 + contextWidth / 2;
    setCenterContext(centeredRight + 16 <= rightControlsLeft);

    const company = context.querySelector<HTMLElement>('[data-context-switcher="company"]');
    const period = context.querySelector<HTMLElement>('[data-context-switcher="period"]');
    const separator = separatorRef.current;
    if (company && period && window.matchMedia("(min-width: 768px)").matches) {
      const periodWidth = period.getBoundingClientRect().width;
      const maxWidth = Number.parseFloat(window.getComputedStyle(company).maxWidth);
      company.style.minWidth = `${Number.isFinite(maxWidth) ? Math.min(periodWidth, maxWidth) : periodWidth}px`;
      const contextLeft = context.getBoundingClientRect().left;
      const gapCenter =
        (company.getBoundingClientRect().right + period.getBoundingClientRect().left) / 2;
      if (separator) {
        separator.style.left = `${gapCenter - contextLeft}px`;
        separator.hidden = false;
      }
    } else {
      company?.style.removeProperty("min-width");
      if (separator) separator.hidden = true;
    }
  }, [hasContext]);

  useEffect(() => {
    update();
    const observer = new ResizeObserver(update);
    if (headerRef.current) observer.observe(headerRef.current);
    if (contextRef.current) {
      observer.observe(contextRef.current);
      contextRef.current
        .querySelectorAll<HTMLElement>("[data-context-switcher]")
        .forEach((node) => observer.observe(node));
    }
    if (rightControlsRef.current) observer.observe(rightControlsRef.current);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [update]);

  return { headerRef, contextRef, separatorRef, rightControlsRef, centerContext };
}

/** Horní lišta rámu. */
export function AppShellTopBar({
  brand,
  sheet,
  contextLeft,
  contextDisabled,
  contextDisabledHint,
  breadcrumbs,
  actions,
  panels,
  activePanelId,
  onPanelToggle,
  notificationBell,
  themeToggleButton,
  userMenu,
}: AppShellTopBarProps) {
  const hasContext = Boolean(contextLeft);
  const { headerRef, contextRef, separatorRef, rightControlsRef, centerContext } =
    useContextPosition(hasContext);
  const contextHintId = useId();
  const hasActions = Boolean(actions);
  const hasPanels = panels.length > 0;
  const hasNotifications = Boolean(notificationBell);
  const hasThemeToggle = Boolean(themeToggleButton);
  const hasUser = Boolean(userMenu);
  return (
    <header
      ref={headerRef}
      className="relative z-30 flex h-14 shrink-0 items-center overflow-hidden border-b bg-card"
    >
      {brand ? (
        <div
          className={cn(
            "hidden h-full shrink-0 items-center gap-2 border-r px-4 md:flex",
            !brand.dragging && "transition-[width]",
            brand.collapsed && "w-14 justify-center px-2",
          )}
          style={!brand.collapsed ? { width: `${brand.width}rem` } : undefined}
        >
          {brand.logo}
          {!brand.collapsed ? (
            <span className="truncate font-semibold tracking-tight">{brand.appName}</span>
          ) : null}
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden pl-3 pr-2 xl:gap-2 xl:pr-3">
        <Sheet open={sheet.open} onOpenChange={sheet.onOpenChange}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label={sheet.label}>
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            data-sidebar-tone={sheet.tone}
            className="shell-sidebar flex w-72 flex-col gap-0 bg-sidebar p-0 text-sidebar-foreground"
          >
            <SheetHeader className="min-h-14 shrink-0 justify-center border-b border-sidebar-border px-4">
              <SheetTitle className="text-sidebar-foreground">{sheet.title}</SheetTitle>
              <PanelContextText
                value={sheet.context}
                className="text-xs font-normal text-sidebar-muted"
              />
            </SheetHeader>
            <div data-slot="app-shell-sheet-nav" className="flex min-h-0 flex-1 flex-col">
              {sheet.nav}
            </div>
          </SheetContent>
        </Sheet>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                ref={contextRef}
                aria-disabled={contextDisabled || undefined}
                tabIndex={contextDisabled ? 0 : undefined}
                aria-describedby={contextDisabled ? contextHintId : undefined}
                className={cn(
                  "relative z-10 flex min-w-0 shrink items-center overflow-hidden focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  centerContext && "absolute left-1/2 -translate-x-1/2",
                )}
              >
                <span
                  ref={separatorRef}
                  hidden
                  aria-hidden
                  className="pointer-events-none absolute top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-border"
                />
                <span
                  inert={contextDisabled || undefined}
                  data-slot="app-shell-context"
                  className={cn(
                    "flex min-w-0 items-center gap-1 md:gap-5",
                    contextDisabled && "pointer-events-none opacity-45",
                  )}
                >
                  {contextLeft}
                </span>
                {contextDisabled ? (
                  <span id={contextHintId} className="sr-only">
                    {contextDisabledHint}
                  </span>
                ) : null}
              </div>
            </TooltipTrigger>
            {contextDisabled ? <TooltipContent>{contextDisabledHint}</TooltipContent> : null}
          </Tooltip>
        </TooltipProvider>
        {hasContext && !centerContext ? (
          <Separator orientation="vertical" className="hidden h-6 shrink-0 xl:block" />
        ) : null}
        <div className="hidden min-w-0 flex-1 2xl:block">
          {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        </div>
        <div className="min-w-0 flex-1 2xl:hidden" />
        <div ref={rightControlsRef} className="flex shrink-0 items-center gap-1 xl:gap-2">
          {hasActions ? (
            <Separator orientation="vertical" className="hidden h-6 shrink-0 sm:block" />
          ) : null}
          <div className="flex shrink-0 items-center gap-1 xl:gap-2">{actions}</div>
          {hasActions && hasPanels ? <Separator orientation="vertical" className="h-6" /> : null}
          <div className="flex shrink-0 items-center gap-1 xl:gap-2">
            {panels.map((panel) => {
              const Icon = panel.icon;
              const pressed = panel.id === activePanelId;
              return (
                <TooltipProvider key={panel.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={pressed ? "secondary" : "ghost"}
                        size="icon"
                        aria-label={panel.tooltip}
                        aria-pressed={pressed}
                        onClick={() => onPanelToggle(pressed ? null : panel.id)}
                      >
                        <Icon className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{panel.tooltip}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          {(hasActions || hasPanels) && hasNotifications ? (
            <Separator orientation="vertical" className="h-6" />
          ) : null}
          <div className="flex shrink-0 items-center">{notificationBell}</div>
          {(hasActions || hasPanels || hasNotifications) && hasThemeToggle ? (
            <Separator orientation="vertical" className="h-6" />
          ) : null}
          <div className="hidden shrink-0 items-center sm:flex">{themeToggleButton}</div>
          {(hasActions || hasPanels || hasNotifications || hasThemeToggle) && hasUser ? (
            <Separator orientation="vertical" className="h-6" />
          ) : null}
          <div className="hidden shrink-0 items-center gap-2 md:flex">{userMenu}</div>
        </div>
      </div>
    </header>
  );
}
