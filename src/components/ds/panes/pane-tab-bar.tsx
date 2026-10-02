import { Fragment, useEffect, useRef, useState, type ComponentType } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronsRight, X } from "lucide-react";

import { Button } from "../../ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";
import { buildTabMenuActions, type PaneChromeTexts, type PaneTabsApi } from "./pane-context";
import type { PaneTab, TabPane } from "./pane-state";

export type PaneTabBarTexts = {
  overflow: string;
  closeTab: string;
  unsaved: string;
  untitled: string;
};

export const DEFAULT_PANE_TAB_BAR_TEXTS: PaneTabBarTexts = {
  overflow: "Další záložky",
  closeTab: "Zavřít",
  unsaved: "Neuložené změny",
  untitled: "Bez názvu",
};

/** Minimální a maximální šířka záložky v rem. */
export const PANE_TAB_MIN_WIDTH_REM = 7.5;
export const PANE_TAB_MAX_WIDTH_REM = 12.5;

export interface PaneTabBarProps {
  pane: TabPane;
  paneIndex: number;
  paneCount: number;
  api: PaneTabsApi;
  getTabIcon?: (tab: PaneTab) => ComponentType<{ className?: string }> | undefined;
  /** Dvojklik na prázdné místo lišty. */
  onToggleMaximize?: () => void;
  texts?: Partial<PaneTabBarTexts & PaneChromeTexts>;
  className?: string;
}

/** Rozdělí záložky podle viditelné kapacity; aktivní a nejnovější rozepsané mají přednost. */
export function resolvePaneTabVisibility(
  pane: TabPane,
  capacity: number,
  dirty: (tabId: string) => boolean,
) {
  if (pane.tabs.length <= capacity) return { visible: pane.tabs, hidden: [] as PaneTab[] };
  const slots = Math.max(1, capacity - 1);
  const priority = [...pane.tabs].sort((left, right) => {
    const leftActive = left.id === pane.activeTab;
    const rightActive = right.id === pane.activeTab;
    if (leftActive !== rightActive) return leftActive ? -1 : 1;
    const leftDirty = dirty(left.id);
    const rightDirty = dirty(right.id);
    if (leftDirty !== rightDirty) return leftDirty ? -1 : 1;
    return right.lastUsed - left.lastUsed;
  });
  const visibleIds = new Set(priority.slice(0, slots).map((tab) => tab.id));
  return {
    visible: pane.tabs.filter((tab) => visibleIds.has(tab.id)),
    hidden: pane.tabs
      .filter((tab) => !visibleIds.has(tab.id))
      .sort((left, right) => Number(dirty(right.id)) - Number(dirty(left.id))),
  };
}

/** Lišta záložek panelu: jen záložky a nabídka „»“ (historie a menu ⋯ jsou od 2.16.0 v PageHeader). */
export function PaneTabBar({
  pane,
  paneIndex,
  api,
  getTabIcon,
  onToggleMaximize,
  texts,
  className,
}: PaneTabBarProps) {
  const t = { ...DEFAULT_PANE_TAB_BAR_TEXTS, ...texts };
  const stripRef = useRef<HTMLDivElement | null>(null);
  const [capacity, setCapacity] = useState(pane.tabs.length || 1);
  const { setNodeRef: setBarDropRef, isOver } = useDroppable({
    id: `bar:${pane.id}`,
    data: { paneId: pane.id },
  });

  useEffect(() => {
    const element = stripRef.current;
    if (!element) return;
    const measure = () => {
      const rootSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setCapacity(
        Math.max(1, Math.floor(element.clientWidth / (PANE_TAB_MIN_WIDTH_REM * rootSize))),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { visible, hidden } = resolvePaneTabVisibility(pane, capacity, api.isTabDirty);
  const hiddenDirtyCount = hidden.filter((tab) => api.isTabDirty(tab.id)).length;
  const titleOf = (tab: PaneTab) => tab.title ?? t.untitled;
  const dsTexts = useDsTexts();

  return (
    <TooltipProvider>
      <div
        ref={setBarDropRef}
        role="toolbar"
        aria-label={`Panel ${paneIndex + 1}`}
        className={cn(
          "flex h-9 shrink-0 items-stretch gap-1 border-b bg-muted/60 pl-1 pr-1",
          isOver && "bg-primary/10",
          className,
        )}
        onDoubleClick={(event) => {
          if (
            event.target === event.currentTarget ||
            (event.target as HTMLElement).dataset.tabStrip !== undefined
          )
            onToggleMaximize?.();
        }}
      >
        <div
          ref={stripRef}
          role="tablist"
          data-tab-strip=""
          className="flex min-w-0 flex-1 items-stretch overflow-hidden"
        >
          <SortableContext
            items={visible.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            {visible.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                paneId={pane.id}
                active={tab.id === pane.activeTab}
                dirty={api.isTabDirty(tab.id)}
                paneActive={api.state.active === pane.id}
                attention={api.attentionTabIds.includes(tab.id)}
                unsavedLabel={dsTexts.panes.unsavedChanges}
                Icon={getTabIcon?.(tab)}
                api={api}
                texts={t}
                title={titleOf(tab)}
              />
            ))}
          </SortableContext>
        </div>
        {hidden.length ? (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="my-1 h-7 gap-1 px-2 text-xs"
                    aria-label={t.overflow}
                  >
                    <ChevronsRight className="size-4" />
                    {hiddenDirtyCount ? (
                      <span
                        role="img"
                        aria-label={t.unsaved}
                        className="size-2 rounded-full bg-primary"
                      />
                    ) : null}
                    {hidden.length}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t.overflow}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end" className="max-w-72">
              {hidden.map((tab) => {
                const Icon = getTabIcon?.(tab);
                return (
                  <DropdownMenuItem key={tab.id} onSelect={() => api.activateTab(tab.id)}>
                    {Icon ? <Icon className="size-4" /> : null}
                    <span className="truncate">{titleOf(tab)}</span>
                    {api.isTabDirty(tab.id) ? (
                      <span
                        aria-label={t.unsaved}
                        className="ml-auto size-2 rounded-full bg-primary"
                      />
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

function SortableTab({
  tab,
  paneId,
  active,
  dirty,
  paneActive,
  attention,
  unsavedLabel,
  Icon,
  api,
  texts,
  title,
}: {
  tab: PaneTab;
  paneId: string;
  active: boolean;
  dirty: boolean;
  /** Panel záložky je aktivní – aktivní záložka výrazně, jinak tlumeně. */
  paneActive: boolean;
  /** Záložka je dotčená dialogem neuložených změn. */
  attention: boolean;
  /** Přístupný název tečky neuložených změn. */
  unsavedLabel: string;
  Icon?: ComponentType<{ className?: string }>;
  api: PaneTabsApi;
  texts: PaneTabBarTexts & Partial<PaneChromeTexts>;
  title: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tab.id,
    data: { paneId, tabId: tab.id },
  });
  const label = tab.shortTitle ?? title;
  const actions = buildTabMenuActions(api, tab.id, texts);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          data-tab-id={tab.id}
          style={{
            transform: CSS.Translate.toString(transform),
            transition,
            flex: `1 1 ${PANE_TAB_MAX_WIDTH_REM}rem`,
            minWidth: `${PANE_TAB_MIN_WIDTH_REM}rem`,
            maxWidth: `${PANE_TAB_MAX_WIDTH_REM}rem`,
          }}
          className={cn(
            "group relative flex items-center border-r text-sm transition-colors",
            active && paneActive
              ? "bg-card font-semibold text-foreground shadow-[inset_0_2px_0_var(--primary)]"
              : active
                ? "bg-card/70 text-foreground/80 shadow-[inset_0_2px_0_var(--border)]"
                : "text-muted-foreground hover-surface",
            attention && "ring-2 ring-inset ring-destructive",
            isDragging && "z-10 opacity-70",
          )}
          onAuxClick={(event) => {
            if (event.button !== 1) return;
            event.preventDefault();
            api.closeTab(tab.id);
          }}
          onMouseDown={(event) => {
            if (event.button === 1) event.preventDefault();
          }}
          {...attributes}
          {...listeners}
          role="presentation"
          data-active-pane={active && paneActive ? "" : undefined}
          data-attention={attention ? "" : undefined}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="tab"
                aria-selected={active}
                className="flex h-full min-w-0 flex-1 items-center gap-1.5 pl-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => api.activateTab(tab.id)}
              >
                {dirty ? (
                  <span
                    role="img"
                    aria-label={unsavedLabel}
                    className="size-2 shrink-0 rounded-full bg-primary"
                  />
                ) : null}
                {Icon ? <Icon className="size-3.5 shrink-0" /> : null}
                <span className="truncate">{label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{title}</TooltipContent>
          </Tooltip>
          <button
            type="button"
            aria-label={
              dirty
                ? `${texts.closeTab} (${texts.unsaved.charAt(0).toLocaleLowerCase("cs")}${texts.unsaved.slice(1)})`
                : texts.closeTab
            }
            className="relative mr-1 flex size-5 shrink-0 items-center justify-center rounded-full text-foreground/70 hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            onPointerDown={(event) => event.stopPropagation()}
            onDoubleClick={(event) => event.stopPropagation()}
            onClick={() => api.closeTab(tab.id)}
          >
            <X className={cn("size-3.5", active && "text-foreground")} />
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {actions.map((action) => (
          <Fragment key={action.id}>
            {action.separatorBefore ? <ContextMenuSeparator /> : null}
            <ContextMenuItem disabled={action.disabled} onSelect={action.onSelect}>
              {action.label}
              {action.shortcut ? (
                <ContextMenuShortcut>{action.shortcut}</ContextMenuShortcut>
              ) : null}
            </ContextMenuItem>
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
