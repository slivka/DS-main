import { useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { DndContext, PointerSensor, closestCenter, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";

import { cn } from "../../../lib/utils";
import { PaneApiContext, usePaneTabs, type PaneApi, type PaneTabsApi } from "./pane-context";
import { PaneTabBar, type PaneTabBarTexts } from "./pane-tab-bar";
import { evenWidths, findTab, type PaneLayoutCount, type PaneTab, type TabPane } from "./pane-state";

export type PaneLayoutTexts = PaneTabBarTexts & {
  emptyHint: string;
};

export const DEFAULT_PANE_TEXTS: Pick<PaneLayoutTexts, "emptyHint"> = {
  emptyHint: "Otevřete položku z menu",
};

export const PANE_DIVIDER_WIDTH = 8;

/** Nejvyšší dostupné rozložení pro danou šířku a měřítko písma. */
export function maxPaneLayout(width: number, minPaneWidth: number, fontScale = 1): PaneLayoutCount {
  if (width < 768) return 1;
  const effective = width / (fontScale || 1);
  const fits = (count: number) => effective >= count * minPaneWidth + (count - 1) * PANE_DIVIDER_WIDTH;
  if (fits(3)) return 3;
  if (fits(2)) return 2;
  return 1;
}

/** Potřebná šířka okna (v px) pro dané rozložení. */
export function requiredPaneWidth(count: number, minPaneWidth: number, fontScale = 1) {
  return (count * minPaneWidth + (count - 1) * PANE_DIVIDER_WIDTH) * (fontScale || 1);
}

function useFontScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const read = () => {
      const size = parseFloat(getComputedStyle(document.documentElement).fontSize || "16");
      setScale(size / 16 || 1);
    };
    read();
    window.addEventListener("app:font-scale", read as EventListener);
    return () => window.removeEventListener("app:font-scale", read as EventListener);
  }, []);
  return scale;
}

export interface PaneLayoutProps {
  /** Obsah aktivní záložky. Záložky na pozadí se nevykreslují – stav držte přes useTabDraft. */
  renderTab: (tab: PaneTab, pane: PaneApi) => ReactNode;
  /** Ikona záložky podle jejího `icon` nebo route. */
  getTabIcon?: (tab: PaneTab) => ComponentType<{ className?: string }> | undefined;
  /** Vlastní obsah prázdného panelu. */
  renderEmpty?: (pane: TabPane) => ReactNode;
  /** Připnutí aktivní záložky (položka v menu ⋯). */
  isPinned?: (tab: PaneTab) => boolean;
  onTogglePin?: (tab: PaneTab) => void;
  minPaneWidth?: number;
  texts?: Partial<PaneLayoutTexts>;
  className?: string;
}

/** Režim více oken – 1 až 3 panely se záložkami. Musí být uvnitř PaneTabsProvider. */
export function PaneLayout({ renderTab, getTabIcon, renderEmpty, isPinned, onTogglePin, minPaneWidth = 560, texts, className }: PaneLayoutProps) {
  const api = usePaneTabs();
  if (!api) throw new Error("PaneLayout musí být uvnitř PaneTabsProvider.");
  return (
    <PaneLayoutInner
      api={api}
      renderTab={renderTab}
      getTabIcon={getTabIcon}
      renderEmpty={renderEmpty}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      minPaneWidth={minPaneWidth}
      texts={texts}
      className={className}
    />
  );
}

function PaneLayoutInner({
  api,
  renderTab,
  getTabIcon,
  renderEmpty,
  isPinned,
  onTogglePin,
  minPaneWidth,
  texts,
  className,
}: PaneLayoutProps & { api: PaneTabsApi; minPaneWidth: number }) {
  const { state } = api;
  const emptyHint = texts?.emptyHint ?? DEFAULT_PANE_TEXTS.emptyHint;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const fontScale = useFontScale();
  const [maximized, setMaximized] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => setContainerWidth(entries[0].contentRect.width));
    observer.observe(element);
    setContainerWidth(element.getBoundingClientRect().width);
    return () => observer.disconnect();
  }, []);

  const maxLayout = containerWidth ? maxPaneLayout(containerWidth, minPaneWidth, fontScale) : null;
  useEffect(() => {
    if (maxLayout) api.reportMaxLayout(maxLayout);
  }, [maxLayout, state.layout]);

  // Tisk jen aktivního panelu.
  useEffect(() => {
    const onBefore = () => {
      document.querySelectorAll<HTMLElement>("[data-pane]").forEach((element) => {
        element.setAttribute("data-print-hide", element.dataset.pane === state.active ? "false" : "true");
      });
    };
    const onAfter = () => document.querySelectorAll<HTMLElement>("[data-pane]").forEach((element) => element.removeAttribute("data-print-hide"));
    window.addEventListener("beforeprint", onBefore);
    window.addEventListener("afterprint", onAfter);
    return () => {
      window.removeEventListener("beforeprint", onBefore);
      window.removeEventListener("afterprint", onAfter);
    };
  }, [state.active]);

  const shownPanes = maximized && state.panes.some((pane) => pane.id === maximized) ? state.panes.filter((pane) => pane.id === maximized) : state.panes;
  const resolvedWidths = useMemo(() => {
    if (shownPanes.length === 1) return [1];
    const base = state.widths && state.widths.length === shownPanes.length ? state.widths : evenWidths(shownPanes.length);
    const sum = base.reduce((total, value) => total + value, 0) || 1;
    return base.map((value) => value / sum);
  }, [state.widths, shownPanes.length]);

  const onDividerDown = (index: number) => (event: React.PointerEvent) => {
    event.preventDefault();
    const start = { x: event.clientX, widths: resolvedWidths };
    const onMove = (moveEvent: PointerEvent) => {
      if (!containerRef.current) return;
      const total = containerRef.current.getBoundingClientRect().width;
      const delta = (moveEvent.clientX - start.x) / total;
      const next = [...start.widths];
      const minShare = (minPaneWidth * fontScale) / total;
      const left = next[index] + delta;
      const right = next[index + 1] - delta;
      if (left < minShare || right < minShare) return;
      next[index] = left;
      next[index + 1] = right;
      api.activatePane(api.state.active);
      onWidths(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const widthsRef = useRef<(widths: number[]) => void>(() => {});
  widthsRef.current = (widths) => {
    // Šířky nejsou akce záložek – mění se přímo ve stavu.
    (api as PaneTabsApi & { __setWidths?: (w: number[]) => void }).__setWidths?.(widths);
  };
  const onWidths = (widths: number[]) => widthsRef.current(widths);

  const onDragEnd = (event: DragEndEvent) => {
    const tabId = String(event.active.id);
    const over = event.over;
    if (!over) return;
    const overId = String(over.id);
    if (overId === tabId) return;
    if (overId.startsWith("bar:") || overId.startsWith("area:")) {
      const paneId = overId.slice(overId.indexOf(":") + 1);
      api.moveTab(tabId, paneId);
      return;
    }
    const target = findTab(api.state, overId);
    if (!target) return;
    const source = findTab(api.state, tabId);
    let index = target.tabIndex;
    if (source && source.pane.id === target.pane.id && source.tabIndex < target.tabIndex) index = target.tabIndex;
    api.moveTab(tabId, target.pane.id, index);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div ref={containerRef} className={cn("flex min-h-0 w-full flex-1 items-stretch", className)}>
        {shownPanes.map((pane, index) => (
          <div key={pane.id} className="flex min-w-0" style={{ flex: `${resolvedWidths[index] ?? 1} 1 0%` }}>
            <PaneColumn
              pane={pane}
              paneIndex={state.panes.indexOf(pane)}
              api={api}
              renderTab={renderTab}
              renderEmpty={renderEmpty}
              getTabIcon={getTabIcon}
              isPinned={isPinned}
              onTogglePin={onTogglePin}
              emptyHint={emptyHint}
              texts={texts}
              maximized={maximized === pane.id}
              onToggleMaximize={() => setMaximized(maximized === pane.id ? null : pane.id)}
            />
            {index < shownPanes.length - 1 ? (
              <div
                role="separator"
                aria-orientation="vertical"
                onPointerDown={onDividerDown(index)}
                onDoubleClick={() => onWidths(evenWidths(shownPanes.length))}
                className="w-2 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40"
              />
            ) : null}
          </div>
        ))}
      </div>
    </DndContext>
  );
}

function PaneColumn({
  pane,
  paneIndex,
  api,
  renderTab,
  renderEmpty,
  getTabIcon,
  isPinned,
  onTogglePin,
  emptyHint,
  texts,
  maximized,
  onToggleMaximize,
}: {
  pane: TabPane;
  paneIndex: number;
  api: PaneTabsApi;
  renderTab: PaneLayoutProps["renderTab"];
  renderEmpty?: PaneLayoutProps["renderEmpty"];
  getTabIcon?: PaneLayoutProps["getTabIcon"];
  isPinned?: PaneLayoutProps["isPinned"];
  onTogglePin?: PaneLayoutProps["onTogglePin"];
  emptyHint: string;
  texts?: Partial<PaneLayoutTexts>;
  maximized: boolean;
  onToggleMaximize: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `area:${pane.id}`, data: { paneId: pane.id } });
  const isActive = api.state.active === pane.id;
  const tab = pane.tabs.find((item) => item.id === pane.activeTab) ?? null;
  const tabApi: PaneApi | null = tab
    ? {
        paneId: pane.id,
        tabId: tab.id,
        isActive,
        navigate: (route, params, title) => {
          if (!isActive) api.activatePane(pane.id);
          api.activateTab(tab.id);
          api.openTab(route, params, { target: "replace", title });
        },
        back: () => api.back(tab.id),
        forward: () => api.forward(tab.id),
        canBack: tab.historyIndex > 0,
        canForward: tab.historyIndex < tab.history.length - 1,
        setTitle: (title, shortTitle) => api.setTabTitle(tab.id, title, shortTitle),
        close: () => api.closeTab(tab.id),
      }
    : null;

  return (
    <section
      data-pane={pane.id}
      data-active={isActive ? "true" : undefined}
      onPointerDownCapture={() => {
        if (!isActive) api.activatePane(pane.id);
      }}
      className={cn(
        "@container relative flex min-w-0 flex-1 flex-col overflow-hidden border-r bg-background last:border-r-0",
        isActive ? "border-t-2 border-t-primary" : "border-t-2 border-t-transparent",
      )}
    >
      <PaneTabBar
        pane={pane}
        paneIndex={paneIndex}
        paneCount={api.state.panes.length}
        api={api}
        getTabIcon={getTabIcon}
        maximized={maximized}
        onToggleMaximize={onToggleMaximize}
        {...(tab && onTogglePin ? { pinned: isPinned?.(tab) === true, onTogglePin: () => onTogglePin(tab) } : {})}
        texts={texts}
      />
      <div ref={setNodeRef} className={cn("min-h-0 flex-1 overflow-auto p-4", isOver && "bg-primary/5 outline-2 -outline-offset-2 outline-dashed outline-primary/40")}>
        {tab && tabApi ? (
          <PaneApiContext.Provider value={tabApi}>
            <div key={tab.id} className="contents">
              {renderTab(tab, tabApi)}
            </div>
          </PaneApiContext.Provider>
        ) : (
          renderEmpty?.(pane) ?? <PaneEmpty hint={emptyHint} />
        )}
      </div>
    </section>
  );
}

export interface PaneEmptyProps {
  hint?: string;
  className?: string;
}

/** Výchozí obsah prázdného panelu. */
export function PaneEmpty({ hint = DEFAULT_PANE_TEXTS.emptyHint, className }: PaneEmptyProps) {
  return <div className={cn("flex h-full min-h-40 items-center justify-center text-center text-sm text-muted-foreground", className)}>{hint}</div>;
}
