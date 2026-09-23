import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, X, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { cn } from "../../../lib/utils";
import { applyFontScale } from "../../../lib/font-scale";
import { useMediaQuery } from "../../../hooks/use-mobile";

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
};

function ShellNav({ groups, bottomItems = [], pathname, collapsed, collapsibleGroups, disabledHint, onNavigate }: ShellNavProps) {
  const isActive = (item: NavItem) => !item.disabled && (pathname === item.to || pathname.startsWith(`${item.to}/`));

  const navItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item);
    const content = (
      <>
        <span className={cn("absolute inset-y-1 left-0 w-0.5 rounded-r bg-primary transition-opacity", active ? "opacity-100" : "opacity-0")} />
        {Icon ? <Icon className="size-4 shrink-0" /> : <span className="size-4 shrink-0" />}
        {!collapsed ? <span className="min-w-0 flex-1 truncate">{item.label}</span> : null}
        {!collapsed && item.disabled ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-muted-foreground/40" /> : null}
        {!collapsed && item.badge != null ? <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.badge}</span> : null}
      </>
    );
    const base = cn(
      "relative flex h-9 items-center gap-2 rounded-md text-sm transition-colors hover-surface",
      collapsed ? "justify-center px-2" : "px-3",
      active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80",
      item.disabled && "cursor-not-allowed text-muted-foreground opacity-70",
    );
    const node = item.disabled ? (
      <span aria-disabled="true" className={base}>{content}</span>
    ) : (
      <Link to={item.to as never} search={item.search as never} onClick={onNavigate} className={base}>{content}</Link>
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
      <nav className="flex h-full flex-col gap-1 overflow-y-auto p-2">
        {groups.map((group) => <ShellNavGroup key={group.id} group={group} collapsed={collapsed} collapsible={collapsibleGroups} renderItem={navItem} />)}
        {bottomItems.length ? <div className="mt-auto flex flex-col gap-0.5 border-t pt-2">{bottomItems.map(navItem)}</div> : null}
      </nav>
    </TooltipProvider>
  );
}

function ShellNavGroup({ group, collapsed, collapsible, renderItem }: { group: NavGroup; collapsed: boolean; collapsible: boolean; renderItem: (item: NavItem) => ReactNode }) {
  const [groupCollapsed, setGroupCollapsed] = useState(group.defaultCollapsed === true);
  return (
    <div className="flex flex-col gap-0.5">
      {group.label && !collapsed ? (
        collapsible ? (
          <button type="button" onClick={() => setGroupCollapsed((value) => !value)} aria-expanded={!groupCollapsed} className="mb-1 mt-3 flex items-center gap-1 rounded-md px-3 py-1 text-sm font-normal text-muted-foreground hover:text-foreground">
            {groupCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            <span className="truncate">{group.label}</span>
          </button>
        ) : <div className="mb-1 mt-3 px-3 py-1 text-sm font-normal text-muted-foreground">{group.label}</div>
      ) : null}
      {groupCollapsed && !collapsed ? null : group.items.map((item) => <span key={`${item.to}-${item.label}`}>{renderItem(item)}</span>)}
    </div>
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
}: AppShellProps) {
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownCollapsed, setOwnCollapsed] = useState(false);
  const [ownActivePanel, setOwnActivePanel] = useState<string | null>(null);
  const [collapseWasChosen, setCollapseWasChosen] = useState(false);
  const isNarrow = useMediaQuery("(max-width: 1279px)");
  const collapsedRef = useRef(false);

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
    if (!currentPanel) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const visibleGroups = currentPanel?.nav ?? resolvedGroups;
  const nav = (compact: boolean) => (
    <ShellNav groups={visibleGroups} bottomItems={currentPanel ? [] : bottomItems} pathname={pathname} collapsed={compact} collapsibleGroups disabledHint={disabledHint} onNavigate={() => setMenuOpen(false)} />
  );
  const hasContext = Boolean(contextLeft);
  const hasActions = Boolean(actions);
  const hasPanels = resolvedPanels.length > 0;
  const hasNotifications = Boolean(notificationBell);
  const hasThemeToggle = Boolean(themeToggleButton);
  const hasUser = Boolean(userMenu);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="z-30 flex h-14 shrink-0 items-center overflow-hidden border-b bg-card">
        {showBrand ? <div className={cn("hidden h-full shrink-0 items-center gap-2 border-r px-4 transition-[width] md:flex", isCollapsed ? "w-14 justify-center px-2" : "w-60")}>
          {logo}
          {!isCollapsed ? <span className="truncate font-semibold tracking-tight">{appName}</span> : null}
        </div> : null}
        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden pl-3 pr-2 xl:gap-2 xl:pr-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="h-14 justify-center border-b px-4"><SheetTitle>{currentPanel?.title ?? appName}</SheetTitle></SheetHeader>
              {nav(false)}
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 shrink items-center gap-1 overflow-hidden xl:gap-2">{contextLeft}</div>
          {hasContext ? <Separator orientation="vertical" className="hidden h-6 shrink-0 xl:block" /> : null}
          <div className="hidden min-w-0 flex-1 2xl:block">{breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}</div>
          <div className="min-w-0 flex-1 2xl:hidden" />
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
      </header>

      {currentPanel ? (
        <div className={cn("flex h-11 shrink-0 items-center border-b px-3", currentPanel.accent === "warning" ? "bg-warning/10" : "bg-muted")}>
          <div className={cn("hidden shrink-0 items-center gap-2 md:flex", isCollapsed ? "w-14" : "w-60")}><currentPanel.icon className="size-4" /><span className="truncate font-semibold">{currentPanel.title}</span></div>
          <div className="flex flex-1 items-center md:hidden"><currentPanel.icon className="mr-2 size-4" /><span className="truncate font-semibold">{currentPanel.title}</span></div>
          <Button type="button" variant="default" size="sm" className="ml-auto" onClick={() => setPanel(null)}><X className="size-4" />{adminBackLabel ?? closeLabel}</Button>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1">
        <aside className={cn("hidden shrink-0 border-r bg-card transition-[width] md:flex md:flex-col", isCollapsed ? "w-14" : "w-60")}>
          <div className="min-h-0 flex-1">{nav(isCollapsed)}</div>
          <div className="border-t p-2">
            <TooltipProvider><Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className={cn(isCollapsed ? "w-full" : "ml-auto flex")} aria-label={isCollapsed ? expandLabel : collapseLabel} onClick={() => setCollapsed(!isCollapsed)}>{isCollapsed ? <PanelLeftOpen className="size-4" /> : <><PanelLeftClose className="size-4" /><span className="sr-only">{collapseLabel}</span></>}</Button></TooltipTrigger><TooltipContent side="right">{isCollapsed ? expandLabel : collapseLabel}</TooltipContent></Tooltip></TooltipProvider>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}