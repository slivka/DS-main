import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Search, X, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { cn } from "../../../lib/utils";
import { applyFontScale } from "../../../lib/font-scale";
import { useMediaQuery } from "../../../hooks/use-mobile";
import { usePaneTabs, useActivePaneTab } from "../panes/pane-context";
import { handlePaneLinkEvent } from "../panes/pane-link";
import type { OpenTabTarget } from "../panes/pane-state";
import { filterNavGroups, highlightNavMatch, withNavSections } from "./nav-search";

export type NavItem = {
  to: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  search?: Record<string, string>;
  badge?: ReactNode;
  disabled?: boolean;
  disabledHint?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
  defaultCollapsed?: boolean;
  /** Nadpis vizuálního bloku; po sobě jdoucí skupiny se stejnou hodnotou tvoří jeden blok. */
  section?: string;
};

export type AppShellPanel = {
  id: string;
  title: string;
  icon: LucideIcon;
  tooltip: string;
  nav: NavGroup[];
  accent?: "default" | "warning";
};

export const NAV_DISABLED_HINT = "Připravujeme";

export interface AppShellProps {
  children: ReactNode;
  navGroups?: NavGroup[];
  bottomItems?: NavItem[];
  appName?: string;
  logo?: ReactNode;
  showBrand?: boolean;
  breadcrumbs?: Crumb[];
  contextLeft?: ReactNode;
  /** Lišta pod horní lištou; při otevřeném panelu Nastavení/Administrace se skryje. */
  subHeader?: ReactNode;
  actions?: ReactNode;
  notificationBell?: ReactNode;
  themeToggleButton?: ReactNode;
  userMenu?: ReactNode;
  panels?: AppShellPanel[];
  activePanel?: string | null;
  onActivePanelChange?: (id: string | null) => void;
  closeLabel?: string;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  menuLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  disabledHint?: string;
  /** Klíč uloženého sbalení skupin; výchozí je appName. */
  navStateKey?: string;
  /** Zobrazit hledání v menu. */
  navSearch?: boolean;
  navSearchPlaceholder?: string;
  navSearchEmptyText?: string;
  /** Nabídka uložených rozložení vedle hledání v menu. */
  navSearchMenu?: ReactNode;
  /** @deprecated Použijte navGroups. */
  items?: NavItem[];
  /** @deprecated Použijte panels. */
  adminNav?: NavItem[];
  /** @deprecated Použijte activePanel. */
  adminMode?: boolean;
  /** @deprecated Použijte title v panels. */
  adminTitle?: string;
  /** @deprecated Použijte tooltip v panels. */
  adminButtonLabel?: string;
  /** @deprecated Použijte closeLabel. */
  adminBackLabel?: string;
  /** @deprecated Cestu určují položky panels.nav. */
  adminBasePath?: string;
  /** @deprecated Použijte onActivePanelChange. */
  onAdminModeChange?: (active: boolean) => void;
  /** @deprecated Ovládání vzhledu skládejte do samostatných slotů. */
  showLegacyToolbar?: boolean;
}

type ShellNavProps = {
  groups: NavGroup[];
  bottomItems?: NavItem[];
  pathname: string;
  collapsed: boolean;
  collapsibleGroups: boolean;
  disabledHint: string;
  onNavigate: () => void;
  navStateKey: string;
  searchEnabled: boolean;
  searchPlaceholder: string;
  searchEmptyText: string;
  onExpandSearch?: () => void;
  focusSearch?: number;
  onDismissSearch?: () => void;
  searchMenu?: ReactNode;
};

function readGroupCollapsed(storageKey: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored == null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

function badgeTotal(group: NavGroup) {
  const values = group.items.map((item) => typeof item.badge === "number" ? item.badge : typeof item.badge === "string" && /^\d+$/.test(item.badge) ? Number(item.badge) : item.badge ? 1 : 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  return total > 0 ? total : null;
}

function ShellNav({ groups, bottomItems = [], pathname, collapsed, collapsibleGroups, disabledHint, onNavigate, navStateKey, searchEnabled, searchPlaceholder, searchEmptyText, onExpandSearch, focusSearch = 0, onDismissSearch, searchMenu }: ShellNavProps) {
  // V režimu záložek otevírá navigace stránky do záložek (Cmd/Ctrl + klik = nová záložka, + Shift = sousední panel).
  const paneTabs = usePaneTabs();
  const activeTab = useActivePaneTab();
  const currentPath = paneTabs ? activeTab?.route ?? "" : pathname;
  const isActive = (item: NavItem) => !item.disabled && (currentPath === item.to || currentPath.startsWith(`${item.to}/`));
  const paneOpen = (item: NavItem) =>
    paneTabs ? (target: OpenTabTarget) => paneTabs.openTab(item.to, item.search, { target, title: item.label }) : null;

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const filteredGroups = useMemo(() => filterNavGroups(groups, query), [groups, query]);
  const sectionedGroups = useMemo(() => withNavSections(filteredGroups), [filteredGroups]);
  const enabledResults = filteredGroups.flatMap((group) => group.items).filter((item) => !item.disabled);
  const [highlighted, setHighlighted] = useState(0);

  useEffect(() => {
    setQuery("");
    setHighlighted(0);
  }, [navStateKey]);
  useEffect(() => {
    if (focusSearch > 0) requestAnimationFrame(() => inputRef.current?.focus());
  }, [focusSearch]);
  useEffect(() => setHighlighted(0), [query]);

  const activateResult = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    const item = enabledResults[highlighted];
    if (!item) return;
    const index = filteredGroups.flatMap((group) => group.items).findIndex((candidate) => candidate === item);
    resultRefs.current[index]?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey }));
  };

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((value) => (value + direction + enabledResults.length) % Math.max(enabledResults.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateResult(event);
    } else if (event.key === "Escape") {
      if (query) setQuery("");
      else { inputRef.current?.blur(); onDismissSearch?.(); }
    }
  };

  let resultIndex = -1;
  const navItem = (item: NavItem, groupLabel: string) => {
    resultIndex += 1;
    const flatIndex = resultIndex;
    const enabledIndex = enabledResults.indexOf(item);
    const Icon = item.icon;
    const active = isActive(item);
    const content = (
      <>
        <span className={cn("shell-nav-indicator absolute inset-y-1 left-0 w-0.5 rounded-r bg-primary transition-opacity", active ? "opacity-100" : "opacity-0")} />
        {Icon ? <Icon className="size-4 shrink-0" /> : <span className="size-4 shrink-0" />}
        {!collapsed ? <span className="min-w-0 flex-1 truncate">{query ? highlightNavMatch(item.label, query) : item.label}</span> : null}
        {!collapsed && item.disabled ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" /> : null}
        {!collapsed && item.badge != null ? <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.badge}</span> : null}
      </>
    );
    const base = cn(
      "shell-nav-item relative flex h-9 items-center gap-2 rounded-md text-sm transition-colors hover-surface",
      collapsed ? "justify-center px-2" : "px-3",
      active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80",
      item.disabled && "cursor-not-allowed text-muted-foreground opacity-70",
    );
    const node = item.disabled ? (
      <span aria-disabled="true" data-active="false" className={base}>{content}</span>
    ) : (
      <Link
        to={item.to as never}
        search={item.search as never}
        ref={(node) => { resultRefs.current[flatIndex] = node; }}
        onClick={(event) => {
          handlePaneLinkEvent(event, paneOpen(item));
          setQuery("");
          onNavigate();
        }}
        onAuxClick={(event) => handlePaneLinkEvent(event, paneOpen(item))}
        onMouseDown={(event) => {
          if (paneTabs && event.button === 1) event.preventDefault();
        }}
        data-active={active ? "true" : "false"}
        className={cn(base, query && enabledIndex === highlighted && "ring-1 ring-sidebar-indicator")}
      >
        {content}
      </Link>
    );
    if (!collapsed && !item.disabled) return node;
    return (
      <Tooltip key={`${item.to}-${item.label}`}>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">{item.disabled ? item.disabledHint ?? disabledHint : item.label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        {searchEnabled ? collapsed ? (
          <div className="flex shrink-0 flex-col gap-1 p-2"><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="w-full text-sidebar-foreground" aria-label={searchPlaceholder} onClick={onExpandSearch}><Search className="size-4" /></Button></TooltipTrigger><TooltipContent side="right">{searchPlaceholder}</TooltipContent></Tooltip>{searchMenu}</div>
        ) : (
          <div className="shrink-0 px-2 pb-1 pt-2">
            <div className="flex items-center gap-1"><div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/60 px-2 text-sidebar-foreground focus-within:ring-1 focus-within:ring-sidebar-indicator"><Search className="size-4 shrink-0" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onSearchKeyDown} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-sidebar-muted" />{query ? <Button type="button" variant="ghost" size="icon" className="size-7 text-sidebar-foreground" aria-label="Smazat hledání" onClick={() => { setQuery(""); inputRef.current?.focus(); }}><X className="size-3.5" /></Button> : null}</div>{searchMenu}</div>
          </div>
        ) : null}
        <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2" aria-label="Hlavní menu">
          {sectionedGroups.map(({ group, sectionStart }, index) => <ShellNavGroup key={`${navStateKey}:${group.id}`} group={group} groupIndex={index} sectionStart={sectionStart} active={group.items.some(isActive)} forcedOpen={Boolean(query)} query={query} collapsed={collapsed} collapsible={collapsibleGroups} navStateKey={navStateKey} renderItem={(item) => navItem(item, group.label)} />)}
          {query && filteredGroups.length === 0 ? <p className="px-3 py-6 text-center text-sm text-sidebar-muted">{searchEmptyText}</p> : null}
          {!query && bottomItems.length ? <div className="mt-auto flex flex-col gap-0.5 border-t pt-2">{bottomItems.map((item) => navItem(item, ""))}</div> : null}
        </nav>
      </div>
    </TooltipProvider>
  );
}

function ShellNavSection({ label, first, collapsed }: { label: string; first: boolean; collapsed: boolean }) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div data-nav-section={label} className={cn("flex h-6 items-center px-1", !first && "mt-3")}>
            <span className="h-0.5 w-full bg-sidebar-border" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <div data-nav-section={label} className={cn(!first && "mt-4 border-t border-sidebar-border pt-4")}>
      <div className="flex h-7 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-sidebar-muted">
        <span className="truncate">{label}</span>
      </div>
    </div>
  );
}

function ShellNavGroup({ group, groupIndex, sectionStart, active, forcedOpen, query, collapsed, collapsible, navStateKey, renderItem }: { group: NavGroup; groupIndex: number; sectionStart: string | null; active: boolean; forcedOpen: boolean; query: string; collapsed: boolean; collapsible: boolean; navStateKey: string; renderItem: (item: NavItem) => ReactNode }) {
  const storageKey = `ds:nav-groups:${navStateKey}:${group.id}`;
  const [groupCollapsed, setGroupCollapsed] = useState(group.defaultCollapsed === true);
  useEffect(() => setGroupCollapsed(readGroupCollapsed(storageKey, group.defaultCollapsed === true)), [storageKey, group.defaultCollapsed]);
  const setStoredCollapsed = () => {
    const next = !groupCollapsed;
    setGroupCollapsed(next);
    try { window.localStorage.setItem(storageKey, String(next)); } catch { /* úložiště nemusí být dostupné */ }
  };
  const total = badgeTotal(group);
  const hidden = groupCollapsed && !forcedOpen;
  return (
    <>
      {sectionStart ? <ShellNavSection label={sectionStart} first={groupIndex === 0} collapsed={collapsed} /> : null}
      <div className={cn("flex flex-col", group.label && groupIndex > 0 && !sectionStart && "mt-2 border-t border-sidebar-border pt-2")}>
        {group.label && !collapsed ? (
          collapsible ? (
            <button type="button" onClick={setStoredCollapsed} aria-expanded={!hidden} className="shell-nav-group mb-1 flex h-8 w-full items-center gap-2 rounded-md px-3 text-left text-[0.8rem] font-semibold text-sidebar-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground">
              <span className="min-w-0 flex-1 truncate">{query ? highlightNavMatch(group.label, query) : group.label}</span>
              {hidden && total ? <span className="rounded-md bg-sidebar-accent px-1.5 py-0.5 text-xs text-sidebar-foreground">{total}</span> : null}
              {hidden && active ? <span className="size-2 rounded-full bg-sidebar-indicator" aria-label="Obsahuje aktivní stránku" /> : null}
              <ChevronRight className={cn("size-3.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none", !hidden && "rotate-90")} />
            </button>
          ) : <div className="shell-nav-group mb-1 flex h-8 items-center px-3 text-[0.8rem] font-semibold text-sidebar-muted">{group.label}</div>
        ) : null}
        {hidden && !collapsed ? null : <div className={cn("flex flex-col gap-0.5", !collapsed && group.label && "ml-2 border-l border-sidebar-border pl-2")}>{group.items.map((item) => <span key={`${item.to}-${item.label}`}>{renderItem(item)}</span>)}</div>}
      </div>
    </>
  );
}

/** Společný rám aplikace s horní lištou, sbalitelnou navigací a přepínatelnými panely. */
export function AppShell({
  children,
  navGroups,
  bottomItems = [],
  appName = "Aplikace",
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
  collapsed,
  onCollapsedChange,
  menuLabel = "Menu",
  collapseLabel = "Sbalit menu",
  expandLabel = "Rozbalit menu",
  disabledHint = NAV_DISABLED_HINT,
  items,
  adminNav,
  adminMode,
  adminTitle = "Administrace",
  adminButtonLabel = "Administrace",
  adminBackLabel,
  onAdminModeChange,
  navStateKey,
  navSearch = true,
  navSearchPlaceholder = "Hledat v menu…",
  navSearchEmptyText = "Nic nenalezeno",
  navSearchMenu,
}: AppShellProps) {
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownCollapsed, setOwnCollapsed] = useState(false);
  const [ownActivePanel, setOwnActivePanel] = useState<string | null>(null);
  const [collapseWasChosen, setCollapseWasChosen] = useState(false);
  const isNarrow = useMediaQuery("(max-width: 1279px)");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const collapsedRef = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const rightControlsRef = useRef<HTMLDivElement>(null);
  const [centerContext, setCenterContext] = useState(true);
  const [searchOverlay, setSearchOverlay] = useState(false);
  const [focusSearch, setFocusSearch] = useState(0);
  const searchOverlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    applyFontScale();
    document.title = appName;
  }, [appName]);

  const resolvedGroups = navGroups ?? (items ? [{ id: "main", label: "", items }] : []);
  const legacyPanel: AppShellPanel | null = adminNav ? {
    id: "admin",
    title: adminTitle,
    icon: PanelLeftOpen,
    tooltip: adminButtonLabel,
    nav: [{ id: "admin", label: "", items: adminNav }],
  } : null;
  const resolvedPanels = panels ?? (legacyPanel ? [legacyPanel] : []);
  const legacyActivePanel = adminMode ? "admin" : null;
  const resolvedActivePanel = activePanel !== undefined ? activePanel : adminMode !== undefined ? legacyActivePanel : ownActivePanel;
  const currentPanel = resolvedPanels.find((panel) => panel.id === resolvedActivePanel) ?? null;
  const requestedCollapsed = collapsed ?? ownCollapsed;
  const isCollapsed = collapseWasChosen ? requestedCollapsed : isNarrow || requestedCollapsed;
  collapsedRef.current = isCollapsed;

  const setPanel = (id: string | null) => {
    onActivePanelChange?.(id);
    onAdminModeChange?.(id === "admin");
    if (activePanel === undefined && adminMode === undefined) setOwnActivePanel(id);
  };
  const setCollapsed = (next: boolean) => {
    setCollapseWasChosen(true);
    onCollapsedChange?.(next);
    if (collapsed === undefined) setOwnCollapsed(next);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (!event.ctrlKey || event.altKey || event.metaKey || event.key.toLowerCase() !== "b" || isEditing) return;
      event.preventDefault();
      setCollapsed(!collapsedRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || isEditing || !navSearch) return;
      event.preventDefault();
      if (isMobile) setMenuOpen(true);
      else if (isCollapsed) setSearchOverlay(true);
      setFocusSearch((value) => value + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isCollapsed, isMobile, navSearch]);

  useEffect(() => {
    if (!searchOverlay) return;
    const onPointerDown = (event: PointerEvent) => {
      if (searchOverlayRef.current && event.target instanceof Node && !searchOverlayRef.current.contains(event.target)) setSearchOverlay(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [searchOverlay]);

  useEffect(() => setSearchOverlay(false), [resolvedActivePanel]);

  useEffect(() => {
    if (!currentPanel) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const visibleGroups = currentPanel?.nav ?? resolvedGroups;
  const resolvedNavStateKey = currentPanel ? `${navStateKey ?? appName}:${currentPanel.id}` : navStateKey ?? appName;
  const nav = (compact: boolean, onNavigate = () => setMenuOpen(false), onDismissSearch?: () => void) => (
    <ShellNav groups={visibleGroups} bottomItems={currentPanel ? [] : bottomItems} pathname={pathname} collapsed={compact} collapsibleGroups disabledHint={disabledHint} onNavigate={onNavigate} navStateKey={resolvedNavStateKey} searchEnabled={navSearch} searchPlaceholder={navSearchPlaceholder} searchEmptyText={navSearchEmptyText} onExpandSearch={() => { setSearchOverlay(true); setFocusSearch((value) => value + 1); }} focusSearch={focusSearch} onDismissSearch={onDismissSearch} searchMenu={navSearchMenu} />
  );
  const hasContext = Boolean(contextLeft);
  const hasActions = Boolean(actions);
  const hasPanels = resolvedPanels.length > 0;
  const hasNotifications = Boolean(notificationBell);
  const hasThemeToggle = Boolean(themeToggleButton);
  const hasUser = Boolean(userMenu);

  const updateContextPosition = useCallback(() => {
    const header = headerRef.current;
    const context = contextRef.current;
    const rightControls = rightControlsRef.current;
    if (!header || !context || !rightControls || !hasContext) return;

    const headerRect = header.getBoundingClientRect();
    const contextWidth = context.getBoundingClientRect().width;
    const rightControlsLeft = rightControls.getBoundingClientRect().left;
    const centeredRight = headerRect.left + headerRect.width / 2 + contextWidth / 2;
    setCenterContext(centeredRight + 16 <= rightControlsLeft);
  }, [hasContext]);

  useEffect(() => {
    updateContextPosition();
    const observer = new ResizeObserver(updateContextPosition);
    if (headerRef.current) observer.observe(headerRef.current);
    if (contextRef.current) observer.observe(contextRef.current);
    if (rightControlsRef.current) observer.observe(rightControlsRef.current);
    window.addEventListener("resize", updateContextPosition);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateContextPosition);
    };
  }, [updateContextPosition]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header ref={headerRef} className="relative z-30 flex h-14 shrink-0 items-center overflow-hidden border-b bg-card">
        {showBrand ? <div className={cn("hidden h-full shrink-0 items-center gap-2 border-r px-4 transition-[width] md:flex", isCollapsed ? "w-14 justify-center px-2" : "w-60")}>
          {logo}
          {!isCollapsed ? <span className="truncate font-semibold tracking-tight">{appName}</span> : null}
        </div> : null}
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden pl-3 pr-2 xl:gap-2 xl:pr-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="shell-sidebar w-72 p-0">
              <SheetHeader className="h-14 justify-center border-b px-4"><SheetTitle>{currentPanel?.title ?? appName}</SheetTitle></SheetHeader>
              {nav(false)}
            </SheetContent>
          </Sheet>
          <div
            ref={contextRef}
            className={cn(
              "z-10 flex min-w-0 shrink items-center gap-1 overflow-hidden xl:gap-2",
              centerContext && "absolute left-1/2 -translate-x-1/2",
            )}
          >
            {contextLeft}
          </div>
          {hasContext && !centerContext ? <Separator orientation="vertical" className="hidden h-6 shrink-0 xl:block" /> : null}
          <div className="hidden min-w-0 flex-1 2xl:block">{breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}</div>
          <div className="min-w-0 flex-1 2xl:hidden" />
          <div ref={rightControlsRef} className="flex shrink-0 items-center gap-1 xl:gap-2">
            {hasActions ? <Separator orientation="vertical" className="hidden h-6 shrink-0 sm:block" /> : null}
            <div className="flex shrink-0 items-center gap-1 xl:gap-2">{actions}</div>
            {hasActions && hasPanels ? <Separator orientation="vertical" className="h-6" /> : null}
            <div className="flex shrink-0 items-center gap-1 xl:gap-2">
              {resolvedPanels.map((panel) => {
                const Icon = panel.icon;
                const pressed = panel.id === currentPanel?.id;
                return <TooltipProvider key={panel.id}><Tooltip><TooltipTrigger asChild><Button type="button" variant={pressed ? "secondary" : "ghost"} size="icon" aria-label={panel.tooltip} aria-pressed={pressed} onClick={() => setPanel(pressed ? null : panel.id)}><Icon className="size-4" /></Button></TooltipTrigger><TooltipContent>{panel.tooltip}</TooltipContent></Tooltip></TooltipProvider>;
              })}
            </div>
            {(hasActions || hasPanels) && hasNotifications ? <Separator orientation="vertical" className="h-6" /> : null}
            <div className="flex shrink-0 items-center">{notificationBell}</div>
            {(hasActions || hasPanels || hasNotifications) && hasThemeToggle ? <Separator orientation="vertical" className="h-6" /> : null}
            <div className="hidden shrink-0 items-center sm:flex">{themeToggleButton}</div>
            {(hasActions || hasPanels || hasNotifications || hasThemeToggle) && hasUser ? <Separator orientation="vertical" className="h-6" /> : null}
            <div className="hidden shrink-0 items-center gap-2 md:flex">{userMenu}</div>
          </div>
        </div>
      </header>

      {!currentPanel ? subHeader : null}

      {currentPanel ? (
        <div className={cn("flex h-11 shrink-0 items-center border-b px-3", currentPanel.accent === "warning" ? "bg-warning/10" : "bg-muted")}>
          <div className={cn("hidden shrink-0 items-center gap-2 md:flex", isCollapsed ? "w-14" : "w-60")}><currentPanel.icon className="size-4" /><span className="truncate font-semibold">{currentPanel.title}</span></div>
          <div className="flex flex-1 items-center md:hidden"><currentPanel.icon className="mr-2 size-4" /><span className="truncate font-semibold">{currentPanel.title}</span></div>
          <Button type="button" variant="default" size="sm" className="ml-auto" onClick={() => setPanel(null)}><X className="size-4" />{adminBackLabel ?? closeLabel}</Button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside className={cn("shell-sidebar relative hidden shrink-0 border-r transition-[width] md:flex md:flex-col", isCollapsed ? "w-14" : "w-60")}>
          <div className="min-h-0 flex-1">{nav(isCollapsed)}</div>
          <div className="border-t p-2">
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className={cn(isCollapsed ? "w-full" : "ml-auto flex")} aria-label={isCollapsed ? expandLabel : collapseLabel} onClick={() => setCollapsed(!isCollapsed)}>{isCollapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /><span className="sr-only">{collapseLabel}</span></>}</Button></TooltipTrigger><TooltipContent side="right">{isCollapsed ? expandLabel : collapseLabel}</TooltipContent></Tooltip></TooltipProvider>
          </div>
        </aside>
        {isCollapsed && searchOverlay ? <div ref={searchOverlayRef} className="shell-sidebar fixed bottom-0 left-14 top-14 z-40 hidden w-60 flex-col border-r shadow-panel md:flex">{nav(false, () => setSearchOverlay(false), () => setSearchOverlay(false))}</div> : null}
        <main className="min-w-0 flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}