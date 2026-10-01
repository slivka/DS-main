/**
 * Rám aplikace.
 * Vlastní: skládání horní lišty, menu, panelů a obsahu; stav sbalení menu (`app:menu-collapsed`),
 * otevřeného panelu (řízený i vlastní), mobilního menu a hledání; globální zkratky rámu
 * (Ctrl+B, „/“, Escape) přes jediný registr klávesnice.
 * Nesmí: vykreslovat části přímo (AppShellTopBar, AppShellSidebar, AppShellPanelHeader, ShellNav)
 * ani přidávat vlastní posluchače `keydown` – zkratky jdou přes `useGlobalShortcuts`.
 */
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { PanelLeftOpen } from "lucide-react";

import {
  effectiveViewportWidth,
  isAppZoomShortcut,
  useAppZoom,
  useAppZoomShortcuts,
} from "../../../lib/app-zoom";
import { useGlobalShortcuts } from "../../../lib/global-shortcuts";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { AppShellContentProvider } from "./page-layout";
import { ShellNav } from "./AppShellNav";
import { AppShellPanelHeader } from "./AppShellPanels";
import { AppShellSidebar } from "./AppShellSidebar";
import { AppShellTopBar } from "./AppShellTopBar";
import { useAppShellMenuWidth } from "./useAppShellMenuWidth";
import type { AppShellPanel, AppShellPanelView, AppShellProps } from "./app-shell-types";

export type { NavItem, NavGroup } from "./nav-items";
export * from "./app-shell-types";
export { badgeTotal } from "./AppShellNavGroup";
export { resolveMenuMaximum, resolveMenuWidth } from "./useAppShellMenuWidth";

/** Ve vývoji jednou upozorní na neplatnou část panelu nebo chybějící `onViewChange`. */
function usePanelViewWarnings(panel: AppShellPanel | null, matched: AppShellPanelView | undefined) {
  const warned = useRef(new Set<string>());
  useEffect(() => {
    if (!import.meta.env?.DEV || !panel?.views?.length) return;
    const invalidKey = `${panel.id}:invalid:${panel.activeView ?? ""}`;
    if (panel.activeView !== undefined && !matched && !warned.current.has(invalidKey)) {
      warned.current.add(invalidKey);
      console.warn(
        `[AppShell] Panel "${panel.id}": activeView "${panel.activeView}" neodpovídá žádné části, použije se první.`,
      );
    }
    const handlerKey = `${panel.id}:missing-handler`;
    if (panel.views.length >= 2 && !panel.onViewChange && !warned.current.has(handlerKey)) {
      warned.current.add(handlerKey);
      console.warn(
        `[AppShell] Panel "${panel.id}" má více částí bez onViewChange – přepínač nebude fungovat.`,
      );
    }
  }, [panel, matched]);
}

/** Šířka okna prohlížeče; při SSR 1280. */
function useViewportWidth() {
  const [width, setWidth] = useState(1280);
  useLayoutEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

/** Rám zabírá okno – dokument po dobu připojení neroluje. */
function useLockDocumentScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const previousHtml = html.style.overflow;
    const previousBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = previousHtml;
      body.style.overflow = previousBody;
    };
  }, []);
}

/** Společný rám aplikace s horní lištou, sbalitelnou navigací a přepínatelnými panely. */
export function AppShell({
  children,
  navGroups,
  bottomItems = [],
  appName = "Aplikace",
  manageDocumentTitle = false,
  logo,
  showBrand = false,
  breadcrumbs,
  contextLeft,
  subHeader,
  actions,
  notificationBell,
  themeToggleButton,
  userMenu,
  panels,
  activePanel,
  onActivePanelChange,
  closeLabel = "Zavřít",
  menuLabel = "Menu",
  collapseLabel = "Sbalit menu",
  expandLabel = "Rozbalit menu",
  disabledHint,
  items,
  adminNav,
  adminMode,
  adminTitle = "Administrace",
  adminButtonLabel = "Administrace",
  adminBackLabel,
  onAdminModeChange,
  navStateKey,
  navSearch = true,
  navSearchPlaceholder,
  navSearchEmptyText,
  navSearchMenu,
  contextDisabledHint,
}: AppShellProps) {
  const dsTexts = useDsTexts();
  const pathname = useRouterState({
    select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownCollapsed, setOwnCollapsed] = useState(() => {
    try {
      return localStorage.getItem("app:menu-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const appZoom = useAppZoom();
  const effectiveWidth = effectiveViewportWidth(useViewportWidth(), appZoom.zoom);
  const [ownActivePanel, setOwnActivePanel] = useState<string | null>(null);
  const [collapseWasChosen, setCollapseWasChosen] = useState(false);
  const isMobile = effectiveWidth < 768;
  const [searchOverlay, setSearchOverlay] = useState(false);
  const [focusSearch, setFocusSearch] = useState(0);
  const [hasPaneLayout, setHasPaneLayout] = useState(false);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const shellBodyRef = useRef<HTMLDivElement>(null);

  // Zoom aplikace (start, klávesy, kolečko) sdílí AppShell i StandaloneShell.
  useAppZoomShortcuts();
  useLockDocumentScroll();
  useEffect(() => {
    if (manageDocumentTitle) document.title = appName;
  }, [appName, manageDocumentTitle]);

  const resolvedGroups = navGroups ?? (items ? [{ id: "main", label: "", items }] : []);
  const legacyPanel: AppShellPanel | null = adminNav
    ? {
        id: "admin",
        title: adminTitle,
        icon: PanelLeftOpen,
        tooltip: adminButtonLabel,
        nav: [{ id: "admin", label: "", items: adminNav }],
      }
    : null;
  const resolvedPanels = panels ?? (legacyPanel ? [legacyPanel] : []);
  const resolvedActivePanel =
    activePanel !== undefined
      ? activePanel
      : adminMode !== undefined
        ? adminMode
          ? "admin"
          : null
        : ownActivePanel;
  const currentPanel = resolvedPanels.find((panel) => panel.id === resolvedActivePanel) ?? null;
  const matchedView = currentPanel?.views?.find((view) => view.id === currentPanel.activeView);
  const currentView = matchedView ?? currentPanel?.views?.[0] ?? null;
  usePanelViewWarnings(currentPanel, matchedView);
  const currentPanelTitle = currentView?.title ?? currentPanel?.title ?? "";
  const currentPanelContext = currentView?.context ?? currentPanel?.context;
  const currentScope = currentView?.scope ?? currentPanel?.scope ?? "company";
  const sidebarTone = currentPanel?.sidebarTone ?? (currentPanel ? "panel" : "app");
  const contextDisabled = Boolean(currentPanel && currentScope !== "company");
  const isCollapsed = collapseWasChosen ? ownCollapsed : effectiveWidth < 1280 || ownCollapsed;
  const menu = useAppShellMenuWidth({
    bodyRef: shellBodyRef,
    collapsed: isCollapsed,
    hasPaneLayout,
    zoom: appZoom.zoom,
  });

  const setPanel = (id: string | null) => {
    onActivePanelChange?.(id);
    onAdminModeChange?.(id === "admin");
    if (activePanel === undefined && adminMode === undefined) setOwnActivePanel(id);
  };
  const setCollapsed = (next: boolean) => {
    setCollapseWasChosen(true);
    setOwnCollapsed(next);
    try {
      localStorage.setItem("app:menu-collapsed", String(next));
    } catch {
      /* úložiště nemusí být dostupné */
    }
  };

  useGlobalShortcuts([
    {
      id: "toggle-menu",
      match: (event) =>
        !isAppZoomShortcut(event) &&
        event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        event.key.toLowerCase() === "b",
      run: (event) => {
        event.preventDefault();
        setCollapsed(!isCollapsed);
      },
    },
    {
      id: "menu-search",
      enabled: navSearch,
      match: (event) => event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey,
      run: (event) => {
        event.preventDefault();
        if (isMobile) setMenuOpen(true);
        else if (isCollapsed) setSearchOverlay(true);
        setFocusSearch((value) => value + 1);
      },
    },
    {
      id: "close-panel",
      enabled: Boolean(currentPanel),
      allowInEditing: true,
      match: (event) => event.key === "Escape",
      run: () => setPanel(null),
    },
  ]);

  useEffect(() => {
    if (!searchOverlay) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        searchOverlayRef.current &&
        event.target instanceof Node &&
        !searchOverlayRef.current.contains(event.target)
      )
        setSearchOverlay(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [searchOverlay]);

  // Přepnutí panelu zavře překryv hledání (překryv patří menu předchozího panelu).
  useEffect(() => setSearchOverlay(false), [resolvedActivePanel]);

  const visibleGroups = currentPanel
    ? (currentView?.nav ?? currentPanel.nav ?? [])
    : resolvedGroups;
  const resolvedNavStateKey = currentPanel
    ? `${navStateKey ?? appName}:${currentPanel.id}${currentView ? `:${currentView.id}` : ""}`
    : (navStateKey ?? appName);
  const nav = (
    compact: boolean,
    onNavigate = () => setMenuOpen(false),
    onDismissSearch?: () => void,
  ) => (
    <ShellNav
      groups={visibleGroups}
      bottomItems={currentPanel ? [] : bottomItems}
      pathname={pathname}
      collapsed={compact}
      collapsibleGroups
      disabledHint={disabledHint ?? dsTexts.appShell.disabledHint}
      onNavigate={onNavigate}
      navStateKey={resolvedNavStateKey}
      searchEnabled={navSearch}
      searchPlaceholder={navSearchPlaceholder ?? dsTexts.appShell.searchPlaceholder}
      searchEmptyText={navSearchEmptyText ?? dsTexts.appShell.searchEmpty}
      onExpandSearch={() => {
        setSearchOverlay(true);
        setFocusSearch((value) => value + 1);
      }}
      focusSearch={focusSearch}
      onDismissSearch={onDismissSearch}
      searchMenu={navSearchMenu}
      clearSearchLabel={dsTexts.appShell.clearSearch}
      mainMenuLabel={dsTexts.appShell.mainMenu}
      containsActivePageLabel={dsTexts.appShell.containsActivePage}
    />
  );
  const closeOverlay = () => setSearchOverlay(false);

  return (
    <div
      data-slot="app-shell"
      className="app-shell-root flex flex-col overflow-hidden bg-background"
    >
      <AppShellTopBar
        brand={
          showBrand
            ? {
                logo,
                appName,
                collapsed: isCollapsed,
                width: menu.menuWidth,
                dragging: menu.menuDragging,
              }
            : undefined
        }
        sheet={{
          open: menuOpen,
          onOpenChange: setMenuOpen,
          label: menuLabel,
          tone: sidebarTone,
          title: currentPanelTitle || appName,
          context: currentPanelContext,
          nav: nav(false),
        }}
        contextLeft={contextLeft}
        contextDisabled={contextDisabled}
        contextDisabledHint={contextDisabledHint ?? dsTexts.appShell.contextDisabledHint}
        breadcrumbs={breadcrumbs}
        actions={actions}
        panels={resolvedPanels}
        activePanelId={currentPanel?.id ?? null}
        onPanelToggle={setPanel}
        notificationBell={notificationBell}
        themeToggleButton={themeToggleButton}
        userMenu={userMenu}
      />

      {!currentPanel ? <div className="shrink-0">{subHeader}</div> : null}

      <div ref={shellBodyRef} className="flex min-h-0 flex-1 overflow-hidden">
        <AppShellSidebar
          tone={sidebarTone}
          collapsed={isCollapsed}
          width={menu.menuWidth}
          maximum={menu.menuMaximum}
          dragging={menu.menuDragging}
          renderNav={(compact) => nav(compact)}
          searchOverlay={searchOverlay ? nav(false, closeOverlay, closeOverlay) : null}
          searchOverlayRef={searchOverlayRef}
          collapseLabel={collapseLabel}
          expandLabel={expandLabel}
          resizeLabel={dsTexts.appShell.resizeMenu}
          onToggleCollapsed={() => setCollapsed(!isCollapsed)}
          onDividerPointerDown={menu.onDividerPointerDown}
          onDividerKeyDown={menu.onDividerKeyDown}
          onDividerReset={menu.resetMenuWidth}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {currentPanel ? (
            <AppShellPanelHeader
              panel={currentPanel}
              view={currentView}
              title={currentPanelTitle}
              context={currentPanelContext}
              closeText={adminBackLabel ?? closeLabel}
              viewsLabel={dsTexts.appShell.panelView}
              onClose={() => setPanel(null)}
            />
          ) : null}
          <main
            data-slot="app-shell-main"
            className={cn(
              "ds-scroll-area flex min-h-0 min-w-0 flex-1 flex-col overscroll-contain",
              hasPaneLayout ? "overflow-hidden" : "overflow-y-auto p-4",
            )}
          >
            <AppShellContentProvider value={setHasPaneLayout}>{children}</AppShellContentProvider>
          </main>
        </div>
      </div>
    </div>
  );
}
