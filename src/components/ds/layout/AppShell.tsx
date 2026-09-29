import { Link, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Search, X, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { cn } from "../../../lib/utils";
import { applyAppZoom, effectiveViewportWidth, getAppZoom, isAppZoomShortcut, useAppZoom } from "../../../lib/app-zoom";
import { isResizeLocked, RESIZE_END_EVENT, startPointerDrag } from "../../../lib/resize-lock";
import { usePaneTabs, useActivePaneTab } from "../panes/pane-context";
import { handlePaneLinkEvent } from "../panes/pane-link";
import type { OpenTabTarget } from "../panes/pane-state";
import { filterNavGroups, highlightNavMatch, withNavSections } from "./nav-search";
import { StatusBadge, type StatusTone } from "../data-display/status-badge";
import { TruncatedText } from "../data-display/truncated-text";
import { useDsTexts } from "../../../ds-texts";
import { AppShellContentProvider } from "./page-layout";

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
  /** Volitelný stavový štítek vedle názvu panelu. */
  badge?: { label: string; tone: Extract<StatusTone, "neutral" | "info" | "warning" | "accent"> };
  /** Název prostoru, firmy nebo jiného objektu, kterého se panel týká. */
  context?: string;
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
  menuLabel?: string;
  collapseLabel?: string;
  expandLabel?: string;
  disabledHint?: string;
  /** Klíč uloženého sbajení skupin; výchozí je appName. */
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
  clearSearchLabel: string;
  mainMenuLabel: string;
  containsActivePageLabel: string;
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

function ShellNav({ groups, bottomItems = [], pathname, collapsed, collapsibleGroups, disabledHint, onNavigate, navStateKey, searchEnabled, searchPlaceholder, searchEmptyText, onExpandSearch, focusSearch = 0, onDismissSearch, searchMenu, clearSearchLabel, mainMenuLabel, containsActivePageLabel }: ShellNavProps) {
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
  const navRef = useRef<HTMLElement>(null);
  const [navEdges, setNavEdges] = useState({ top: false, bottom: false });

  const updateNavEdges = useCallback(() => {
    const node = navRef.current;
    if (!node) return;
    setNavEdges({ top: node.scrollTop > 1, bottom: node.scrollTop + node.clientHeight < node.scrollHeight - 1 });
  }, []);

  useEffect(() => {
    setQuery("");
    setHighlighted(0);
  }, [navStateKey]);
  useEffect(() => {
    if (focusSearch > 0) requestAnimationFrame(() => inputRef.current?.focus());
  }, [focusSearch]);
  useEffect(() => setHighlighted(0), [query]);
  useEffect(() => {
    updateNavEdges();
    const node = navRef.current;
    if (!node) return;
    const observer = new ResizeObserver(updateNavEdges);
    observer.observe(node);
    const content = node.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [filteredGroups, collapsed, updateNavEdges]);

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
            <div className="flex items-center gap-1"><div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/60 px-2 text-sidebar-foreground focus-within:ring-1 focus-within:ring-sidebar-indicator"><Search className="size-4 shrink-0" /><input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={onSearchKeyDown} placeholder={searchPlaceholder} aria-label={searchPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-sidebar-muted" />{query ? <Button type="button" variant="ghost" size="icon" className="size-7 text-sidebar-foreground" aria-label={clearSearchLabel} onClick={() => { setQuery(""); inputRef.current?.focus(); }}><X className="size-3.5" /></Button> : null}</div>{searchMenu}</div>
          </div>
        ) : null}
        <div className="relative min-h-0 flex-1">
          <nav ref={navRef} onScroll={updateNavEdges} className="ds-scroll-area flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain p-2" aria-label={mainMenuLabel}>
            <div className="flex min-h-full flex-col">
              {sectionedGroups.map(({ group, sectionStart }, index) => <ShellNavGroup key={`${navStateKey}:${group.id}`} group={group} groupIndex={index} sectionStart={sectionStart} active={group.items.some(isActive)} forcedOpen={Boolean(query)} query={query} collapsed={collapsed} collapsible={collapsibleGroups} navStateKey={navStateKey} renderItem={(item) => navItem(item, group.label)} containsActivePageLabel={containsActivePageLabel} />)}
              {query && filteredGroups.length === 0 ? <p className="px-3 py-6 text-center text-sm text-sidebar-muted">{searchEmptyText}</p> : null}
              {!query && bottomItems.length ? <div className="mt-auto flex flex-col gap-0.5 border-t pt-2">{bottomItems.map((item) => navItem(item, ""))}</div> : null}
            </div>
          </nav>
          <span aria-hidden data-nav-fade="top" data-visible={navEdges.top || undefined} />
          <span aria-hidden data-nav-fade="bottom" data-visible={navEdges.bottom || undefined} />
        </div>
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

function ShellNavGroup({ group, groupIndex, sectionStart, active, forcedOpen, query, collapsed, collapsible, navStateKey, renderItem, containsActivePageLabel }: { group: NavGroup; groupIndex: number; sectionStart: string | null; active: boolean; forcedOpen: boolean; query: string; collapsed: boolean; collapsible: boolean; navStateKey: string; renderItem: (item: NavItem) => ReactNode; containsActivePageLabel: string }) {
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
              {hidden && active ? <span className="size-2 rounded-full bg-sidebar-indicator" aria-label={containsActivePageLabel} /> : null}
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
const formatMenuRem = (value: number) => value.toLocaleString("cs-CZ", { maximumFractionDigits: 2 });

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
}: AppShellProps) {
  const dsTexts = useDsTexts();
  const resolvedDisabledHint = disabledHint ?? dsTexts.appShell.disabledHint;
  const resolvedSearchPlaceholder = navSearchPlaceholder ?? dsTexts.appShell.searchPlaceholder;
  const resolvedSearchEmptyText = navSearchEmptyText ?? dsTexts.appShell.searchEmpty;
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownCollapsed, setOwnCollapsed] = useState(() => { try { return localStorage.getItem("app:menu-collapsed") === "true"; } catch { return false; } });
  const [storedMenuWidth, setStoredMenuWidth] = useState(() => { try { return Number(localStorage.getItem("app:menu-width")) || 15; } catch { return 15; } });
  const [draftMenuWidth, setDraftMenuWidth] = useState<number | null>(null);
  const [menuMaximum, setMenuMaximum] = useState(26.25);
  const appZoom = useAppZoom();
  const [viewportWidth, setViewportWidth] = useState(() => typeof window === "undefined" ? 1280 : window.innerWidth);
  const effectiveWidth = effectiveViewportWidth(viewportWidth, appZoom.zoom);
  const [ownActivePanel, setOwnActivePanel] = useState<string | null>(null);
  const [collapseWasChosen, setCollapseWasChosen] = useState(false);
  const isNarrow = effectiveWidth < 1280;
  const isMobile = effectiveWidth < 768;
  const collapsedRef = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);
  const contextSeparatorRef = useRef<HTMLSpanElement>(null);
  const rightControlsRef = useRef<HTMLDivElement>(null);
  const [centerContext, setCenterContext] = useState(true);
  const [searchOverlay, setSearchOverlay] = useState(false);
  const [focusSearch, setFocusSearch] = useState(0);
  const [hasPaneLayout, setHasPaneLayout] = useState(false);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const shellBodyRef = useRef<HTMLDivElement>(null);

  // Zoom aplikace se aplikuje jen jednou při startu; další změny dělá setAppZoom / resetAppZoom.
  useLayoutEffect(() => { applyAppZoom(getAppZoom()); }, []);
  useEffect(() => {
    document.title = appName;
  }, [appName]);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
  const requestedCollapsed = ownCollapsed;
  const isCollapsed = collapseWasChosen ? requestedCollapsed : isNarrow || requestedCollapsed;
  collapsedRef.current = isCollapsed;

  const setPanel = (id: string | null) => {
    onActivePanelChange?.(id);
    onAdminModeChange?.(id === "admin");
    if (activePanel === undefined && adminMode === undefined) setOwnActivePanel(id);
  };
  const setCollapsed = (next: boolean) => {
    setCollapseWasChosen(true);
    setOwnCollapsed(next);
    try { localStorage.setItem("app:menu-collapsed", String(next)); } catch { /* úložiště nemusí být dostupné */ }
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target;
      const isEditing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      const zoomAction = isAppZoomShortcut(event);
      if (zoomAction && !isEditing) {
        event.preventDefault();
        if (zoomAction === "increase") appZoom.setZoom(appZoom.zoom + appZoom.step);
        else if (zoomAction === "decrease") appZoom.setZoom(appZoom.zoom - appZoom.step);
        else appZoom.reset();
        return;
      }
      if (!event.ctrlKey || event.altKey || event.metaKey || event.key.toLowerCase() !== "b" || isEditing) return;
      event.preventDefault();
      setCollapsed(!collapsedRef.current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [appZoom, isCollapsed]);

  useLayoutEffect(() => {
    const body = shellBodyRef.current;
    if (!body || isCollapsed) { setMenuMaximum(26.25); return; }
    const update = () => {
      if (isResizeLocked()) return;
      const required = Number(body.querySelector<HTMLElement>('[data-slot="pane-layout"]')?.dataset["requiredWidth"]);
      if (!required) { setMenuMaximum(26.25); return; }
      const rootPx = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setMenuMaximum(Math.max(12.5, Math.min(26.25, (body.getBoundingClientRect().width - required - 4) / rootPx)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(body);
    window.addEventListener(RESIZE_END_EVENT, update);
    return () => { observer.disconnect(); window.removeEventListener(RESIZE_END_EVENT, update); };
  }, [isCollapsed, hasPaneLayout, appZoom.zoom]);

  const [menuDragging, setMenuDragging] = useState(false);
  const menuWidth = Math.min(menuMaximum, Math.max(12.5, draftMenuWidth ?? storedMenuWidth));
  const saveMenuWidth = (width: number) => {
    setStoredMenuWidth(width);
    try { localStorage.setItem("app:menu-width", String(width)); } catch { /* úložiště nemusí být dostupné */ }
  };
  const onMenuDividerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = menuWidth;
    let finalWidth = startWidth;
    setMenuDragging(true);
    startPointerDrag(event, {
      onMove: (moveEvent) => {
        finalWidth = Math.min(menuMaximum, Math.max(12.5, startWidth + (moveEvent.clientX - startX) / 16 / appZoom.zoom));
        setDraftMenuWidth(finalWidth);
      },
      onEnd: () => {
        setDraftMenuWidth(null);
        setMenuDragging(false);
        saveMenuWidth(finalWidth);
      },
    });
  };
  const onMenuDividerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    saveMenuWidth(Math.min(menuMaximum, Math.max(12.5, menuWidth + (event.key === "ArrowRight" ? 0.5 : -0.5))));
  };

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
    <ShellNav groups={visibleGroups} bottomItems={currentPanel ? [] : bottomItems} pathname={pathname} collapsed={compact} collapsibleGroups disabledHint={resolvedDisabledHint} onNavigate={onNavigate} navStateKey={resolvedNavStateKey} searchEnabled={navSearch} searchPlaceholder={resolvedSearchPlaceholder} searchEmptyText={resolvedSearchEmptyText} onExpandSearch={() => { setSearchOverlay(true); setFocusSearch((value) => value + 1); }} focusSearch={focusSearch} onDismissSearch={onDismissSearch} searchMenu={navSearchMenu} clearSearchLabel={dsTexts.appShell.clearSearch} mainMenuLabel={dsTexts.appShell.mainMenu} containsActivePageLabel={dsTexts.appShell.containsActivePage} />
  );
  const hasContext = Boolean(contextLeft);
  const hasActions = Boolean(actions);
  const hasPanels = resolvedPanels.length > 0;
  const hasNotifications = Boolean(notificationBell);
  const hasThemeToggle = Boolean(themeToggleButton);
  const hasUser = Boolean(userMenu);
  const panelHeading = currentPanel ? (
    <div className="min-w-0 flex-1 py-1">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-semibold">{currentPanel.title}</span>
        {currentPanel.badge ? (
          <StatusBadge
            status="panel"
            config={{ panel: currentPanel.badge }}
            className="h-[1.625rem] shrink-0 px-2 text-[0.75rem]"
          />
        ) : null}
      </div>
      {currentPanel.context ? (
        <TruncatedText className="max-w-full text-[0.75rem] leading-tight text-muted-foreground" text={currentPanel.context} />
      ) : null}
    </div>
  ) : null;

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

    const company = context.querySelector<HTMLElement>('[data-context-switcher="company"]');
    const period = context.querySelector<HTMLElement>('[data-context-switcher="period"]');
    const separator = contextSeparatorRef.current;
    if (company && period && window.matchMedia("(min-width: 768px)").matches) {
      const periodWidth = period.getBoundingClientRect().width;
      const maxWidth = Number.parseFloat(window.getComputedStyle(company).maxWidth);
      company.style.minWidth = `${Number.isFinite(maxWidth) ? Math.min(periodWidth, maxWidth) : periodWidth}px`;
      const contextLeft = context.getBoundingClientRect().left;
      const gapCenter = (company.getBoundingClientRect().right + period.getBoundingClientRect().left) / 2;
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
    updateContextPosition();
    const observer = new ResizeObserver(updateContextPosition);
    if (headerRef.current) observer.observe(headerRef.current);
    if (contextRef.current) {
      observer.observe(contextRef.current);
      contextRef.current.querySelectorAll<HTMLElement>('[data-context-switcher]').forEach((node) => observer.observe(node));
    }
    if (rightControlsRef.current) observer.observe(rightControlsRef.current);
    window.addEventListener("resize", updateContextPosition);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateContextPosition);
    };
  }, [updateContextPosition]);

  return (
    <div data-slot="app-shell" className="app-shell-root flex flex-col overflow-hidden bg-background">
      <header ref={headerRef} className="relative z-30 flex h-14 shrink-0 items-center overflow-hidden border-b bg-card">
        {showBrand ? <div className={cn("hidden h-full shrink-0 items-center gap-2 border-r px-4 md:flex", !menuDragging && "transition-[width]", isCollapsed && "w-14 justify-center px-2")} style={!isCollapsed ? { width: `${menuWidth}rem` } : undefined}>
          {logo}
          {!isCollapsed ? <span className="truncate font-semibold tracking-tight">{appName}</span> : null}
        </div> : null}
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden pl-3 pr-2 xl:gap-2 xl:pr-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="shell-sidebar flex w-72 flex-col gap-0 p-0">
              <SheetHeader className="min-h-14 shrink-0 justify-center border-b px-4"><SheetTitle>{currentPanel?.title ?? appName}</SheetTitle>{currentPanel?.context ? <TruncatedText text={currentPanel.context} className="text-xs font-normal text-sidebar-muted" /> : null}</SheetHeader>
              <div data-slot="app-shell-sheet-nav" className="flex min-h-0 flex-1 flex-col">{nav(false)}</div>
            </SheetContent>
          </Sheet>
          <div
            ref={contextRef}
            className={cn(
              "relative z-10 flex min-w-0 shrink items-center gap-1 overflow-hidden md:gap-5",
              centerContext && "absolute left-1/2 -translate-x-1/2",
            )}
          >
            <span ref={contextSeparatorRef} hidden aria-hidden className="pointer-events-none absolute top-1/2 h-6 w-px -translate-x-1/2 -translate-y-1/2 bg-border" />
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

      {!currentPanel ? <div className="shrink-0">{subHeader}</div> : null}

      {currentPanel ? (
        <div data-slot="app-shell-panel-header" className={cn("flex min-h-11 shrink-0 items-center gap-2 border-b px-3", currentPanel.accent === "warning" ? "bg-warning/10" : "bg-muted")}>
          <div className={cn("hidden shrink-0 items-center md:flex", isCollapsed ? "w-11 justify-center" : "w-[14.25rem]")}><currentPanel.icon className="size-4" /></div>
          <div className="flex min-w-0 flex-1 items-center gap-2 md:hidden"><currentPanel.icon className="size-4 shrink-0" />{panelHeading}</div>
          <div className="hidden min-w-0 flex-1 md:flex">{panelHeading}</div>
          <Button type="button" variant="default" size="sm" className="ml-auto shrink-0" onClick={() => setPanel(null)}><X className="size-4" />{adminBackLabel ?? closeLabel}</Button>
        </div>
      ) : null}

      <div ref={shellBodyRef} className="flex min-h-0 flex-1 overflow-hidden">
        <aside className={cn("shell-sidebar relative hidden shrink-0 border-r md:flex md:flex-col", !menuDragging && "transition-[width]", isCollapsed && "w-14")} style={!isCollapsed ? { width: `${menuWidth}rem` } : undefined}>
          <div className="min-h-0 flex-1">{nav(isCollapsed)}</div>
          <div className="border-t p-2">
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className={cn(isCollapsed ? "w-full" : "ml-auto flex")} aria-label={isCollapsed ? expandLabel : collapseLabel} onClick={() => setCollapsed(!isCollapsed)}>{isCollapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /><span className="sr-only">{collapseLabel}</span></>}</Button></TooltipTrigger><TooltipContent side="right">{isCollapsed ? expandLabel : collapseLabel}</TooltipContent></Tooltip></TooltipProvider>
          </div>
        </aside>
        {!isCollapsed ? <div role="separator" aria-orientation="vertical" aria-label={dsTexts.appShell.resizeMenu} aria-valuemin={12.5} aria-valuemax={Number(menuMaximum.toFixed(2))} aria-valuenow={Number(menuWidth.toFixed(2))} aria-valuetext={`${formatMenuRem(menuWidth)} rem`} tabIndex={0} onPointerDown={onMenuDividerDown} onKeyDown={onMenuDividerKeyDown} onDoubleClick={() => saveMenuWidth(15)} className="hidden w-2 shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40 focus-visible:bg-primary/40 focus-visible:outline-none md:block" /> : null}
        {isCollapsed && searchOverlay ? <div ref={searchOverlayRef} className="shell-sidebar fixed bottom-0 left-14 top-14 z-40 hidden min-h-0 w-60 flex-col overflow-hidden border-r shadow-panel md:flex">{nav(false, () => setSearchOverlay(false), () => setSearchOverlay(false))}</div> : null}
        <main data-slot="app-shell-main" className={cn("ds-scroll-area flex min-h-0 min-w-0 flex-1 flex-col overscroll-contain", hasPaneLayout ? "overflow-hidden" : "overflow-y-auto p-4")}>
          <AppShellContentProvider value={setHasPaneLayout}>{children}</AppShellContentProvider>
        </main>
      </div>
    </div>
  );
}