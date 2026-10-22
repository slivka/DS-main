/** Sloupec panelu · vlastní vnitřní kompozici · nesmí měnit veřejný kontrakt. */
import { useCallback, useEffect, useRef, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import { cn } from "../../../lib/utils";

import {
  buildTabMenuActions,
  PaneApiContext,
  PaneChromeContext,
  PaneScrollContext,
  type PaneApi,
  type PaneChrome,
  type PaneTabsApi,
} from "./pane-context";
import { PaneTabBar } from "./pane-tab-bar";
import { paneKey, type TabPane } from "./pane-state";
import { useTabScrollRestore } from "./pane-tab-store";

import type { PaneLayoutTexts } from "./pane-layout-utils";
import type { PaneLayoutProps } from "./pane-layout-types";
import { PANE_FOCUS_EXCLUDED, shouldFocusPaneScroll } from "./pane-layout-utils";
import { PaneEmpty } from "./pane-empty";
export function PaneColumn({
  pane,
  paneIndex,
  api,
  renderTab,
  renderLinkedPanel,
  renderEmpty,
  getTabIcon,
  emptyHint,
  texts,
  maximized,
  flashing,
  getIconByName,
}: {
  pane: TabPane;
  paneIndex: number;
  api: PaneTabsApi;
  renderTab: PaneLayoutProps["renderTab"];
  renderLinkedPanel?: PaneLayoutProps["renderLinkedPanel"];
  renderEmpty?: PaneLayoutProps["renderEmpty"];
  getTabIcon?: PaneLayoutProps["getTabIcon"];
  emptyHint: string;
  texts?: Partial<PaneLayoutTexts>;
  maximized: boolean;
  flashing: boolean;
  getIconByName: PaneChrome["getIcon"];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `area:${pane.id}`, data: { paneId: pane.id } });
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  // Stabilní ref callback – inline funkce by se v React 19 při každém commitu odpojila a znovu připojila.
  const setScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      scrollRef.current = node;
      setScrollElement((current) => (current === node ? current : node));
    },
    [setNodeRef],
  );
  const activeId = pane.activeTab;
  const drag = useDraggable({
    id: `header:${activeId ?? pane.id}`,
    data: { tabId: activeId, paneId: pane.id },
    disabled: !activeId,
  });
  const isActive = api.state.active === pane.id;
  const tab = pane.tabs.find((item) => item.id === pane.activeTab) ?? null;
  // Pozice rolování per krok historie záložky – nová stránka začne nahoře, Zpět vrátí pozici.
  useTabScrollRestore(
    tab?.id,
    scrollRef,
    tab ? `pane-scroll:${tab.historyIndex}:${paneKey(tab)}` : "pane-scroll",
  );
  const sectionRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!isActive) return;
    const focused = document.activeElement;
    const section = sectionRef.current;
    // Fokus už je v panelu (pole, tlačítko…) nebo v dialogu / výběru – nebereme ho.
    if (
      focused instanceof HTMLElement &&
      focused !== document.body &&
      focused !== scrollRef.current &&
      (section?.contains(focused) || focused.closest(PANE_FOCUS_EXCLUDED))
    )
      return;
    scrollRef.current?.focus({ preventScroll: true });
  }, [isActive, tab?.id]);
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
  const paneCount = api.state.panes.length;
  const toggleMaximize = () => api.toggleMaximize(paneIndex);
  const linked = tab?.linked;
  const chrome: PaneChrome | null = tab
    ? {
        tabId: tab.id,
        paneIndex,
        title: tab.title ?? texts?.untitled ?? "",
        canBack: tab.historyIndex > 0,
        canForward: tab.historyIndex < tab.history.length - 1,
        back: () => api.back(tab.id),
        forward: () => api.forward(tab.id),
        history: tab.history.map((entry, index) => ({
          index,
          title: entry.title ?? entry.route,
          icon: entry.icon ?? tab.icon,
          current: index === tab.historyIndex,
        })),
        goToHistory: (index) => api.goToHistory(tab.id, index),
        openFromHistory: (index) => api.openFromHistory(tab.id, index),
        dirty: api.isTabDirty(tab.id),
        recordNav: api.getRecordNav(tab.id),
        canMaximize: paneCount > 1,
        maximized,
        toggleMaximize,
        closePane: () => api.closePane(pane.id),
        closeTab: () => api.closeTab(tab.id),
        linked: linked
          ? {
              sectionLabel: linked.sectionLabel,
              pinned: linked.pinned,
              togglePin: () => api.setLinkedPinned(tab.id, !linked.pinned),
              returnToPanel: () => api.returnLinkedTab(tab.id),
            }
          : undefined,
        menuActions: buildTabMenuActions(api, tab.id, texts, "header"),
        dragHandleProps: { ref: drag.setNodeRef, ...drag.attributes, ...drag.listeners },
        getIcon: getIconByName,
      }
    : null;

  return (
    <section
      ref={sectionRef}
      data-pane={pane.id}
      data-active={isActive ? "true" : undefined}
      onPointerDownCapture={(event) => {
        if (!isActive && sectionRef.current?.contains(event.target as Node))
          api.activatePane(pane.id);
      }}
      onClick={(event) => {
        // Až po kliku: prohlížeč už fokus přesunul, pokud cíl fokus přijímá.
        const section = sectionRef.current;
        if (
          section &&
          shouldFocusPaneScroll(
            section,
            event.target,
            document.activeElement,
            document.body,
            scrollRef.current,
          )
        )
          scrollRef.current?.focus({ preventScroll: true });
      }}
      data-flash={flashing ? "true" : undefined}
      className={cn(
        "@container relative flex min-w-0 flex-1 flex-col overflow-hidden border-r bg-background last:border-r-0",
        isActive ? "border-t-2 border-t-primary" : "border-t-2 border-t-transparent",
        flashing && "pane-flash",
      )}
    >
      {pane.tabs.length >= 2 ? (
        <PaneTabBar
          pane={pane}
          paneIndex={paneIndex}
          paneCount={paneCount}
          api={api}
          getTabIcon={getTabIcon}
          onToggleMaximize={paneCount > 1 ? toggleMaximize : undefined}
          texts={texts}
        />
      ) : null}
      <div
        ref={setScrollRef}
        data-pane-scroll
        tabIndex={-1}
        className={cn(
          "ds-scroll-area min-h-0 flex-1 overflow-auto overscroll-contain p-4 outline-none",
          isOver && "bg-primary/5 outline-2 -outline-offset-2 outline-dashed outline-primary/40",
        )}
      >
        {tab && tabApi ? (
          <PaneApiContext.Provider value={tabApi}>
            <PaneChromeContext.Provider value={chrome}>
              <PaneScrollContext.Provider value={scrollElement}>
                <div key={`${tab.id}:${tab.historyIndex}:${paneKey(tab)}`} className="contents">
                  {tab.linked?.kind === "panel" && tab.recordKey && renderLinkedPanel
                    ? renderLinkedPanel(tab.recordKey, tab.linked.activeSection ?? "", (section) =>
                        api.setLinkedPanelSection(tab.id, section),
                      )
                    : renderTab(tab, tabApi)}
                </div>
              </PaneScrollContext.Provider>
            </PaneChromeContext.Provider>
          </PaneApiContext.Provider>
        ) : (
          (renderEmpty?.(pane) ?? <PaneEmpty hint={emptyHint} />)
        )}
      </div>
    </section>
  );
}
