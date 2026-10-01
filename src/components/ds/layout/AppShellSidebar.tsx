/**
 * Levý postranní panel rámu aplikace.
 * Vlastní: sloupec menu s tlačítkem sbalení, oddělovač šířky a překryv hledání ve sbaleném menu.
 * Nesmí: držet stav – šířku, sbalení i překryv dostává od AppShell.
 */
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  RefObject,
} from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { formatMenuRem } from "./useAppShellMenuWidth";

/** Props postranního panelu. */
export interface AppShellSidebarProps {
  /** Tón menu: aplikace (tmavé) nebo panel (šedé). */
  tone: "app" | "panel";
  /** Sbalené menu. */
  collapsed: boolean;
  /** Šířka rozbaleného menu v rem. */
  width: number;
  /** Maximum šířky v rem. */
  maximum: number;
  /** Probíhá tažení – bez animace šířky. */
  dragging: boolean;
  /** Vykreslí menu; `compact` = sbalená podoba. */
  renderNav: (compact: boolean) => ReactNode;
  /** Menu v překryvu hledání ve sbaleném stavu; null = překryv zavřený. */
  searchOverlay: ReactNode;
  /** Kontejner překryvu (klik mimo ho zavře). */
  searchOverlayRef: RefObject<HTMLDivElement | null>;
  /** Text tlačítka sbalení. */
  collapseLabel: string;
  /** Text tlačítka rozbalení. */
  expandLabel: string;
  /** Přístupný název oddělovače šířky. */
  resizeLabel: string;
  /** Přepnutí sbalení. */
  onToggleCollapsed: () => void;
  /** Začátek tažení oddělovače. */
  onDividerPointerDown: (event: ReactPointerEvent) => void;
  /** Šipky na oddělovači. */
  onDividerKeyDown: (event: ReactKeyboardEvent) => void;
  /** Dvojklik vrátí výchozí šířku. */
  onDividerReset: () => void;
}

/** Sloupec menu, oddělovač a překryv hledání. */
export function AppShellSidebar({
  tone,
  collapsed,
  width,
  maximum,
  dragging,
  renderNav,
  searchOverlay,
  searchOverlayRef,
  collapseLabel,
  expandLabel,
  resizeLabel,
  onToggleCollapsed,
  onDividerPointerDown,
  onDividerKeyDown,
  onDividerReset,
}: AppShellSidebarProps) {
  return (
    <>
      <aside
        data-sidebar-tone={tone}
        className={cn(
          "shell-sidebar relative hidden shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col",
          !dragging && "transition-[width]",
          collapsed && "w-14",
        )}
        style={!collapsed ? { width: `${width}rem` } : undefined}
      >
        <div className="min-h-0 flex-1">{renderNav(collapsed)}</div>
        <div className="border-t p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(collapsed ? "w-full" : "ml-auto flex")}
                  aria-label={collapsed ? expandLabel : collapseLabel}
                  onClick={onToggleCollapsed}
                >
                  {collapsed ? (
                    <PanelLeftOpen className="size-4" />
                  ) : (
                    <>
                      <PanelLeftClose className="size-4" />
                      <span className="sr-only">{collapseLabel}</span>
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? expandLabel : collapseLabel}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>
      {!collapsed ? (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={resizeLabel}
          aria-valuemin={12.5}
          aria-valuemax={Number(maximum.toFixed(2))}
          aria-valuenow={Number(width.toFixed(2))}
          aria-valuetext={`${formatMenuRem(width)} rem`}
          tabIndex={0}
          onPointerDown={onDividerPointerDown}
          onKeyDown={onDividerKeyDown}
          onDoubleClick={onDividerReset}
          className="hidden w-2 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40 focus-visible:bg-primary/40 focus-visible:outline-none md:block"
        />
      ) : null}
      {collapsed && searchOverlay ? (
        <div
          ref={searchOverlayRef}
          data-sidebar-tone={tone}
          className="shell-sidebar fixed bottom-0 left-14 top-14 z-40 hidden min-h-0 w-60 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-panel md:flex"
        >
          {searchOverlay}
        </div>
      ) : null}
    </>
  );
}
