import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Settings, X, type LucideIcon } from "lucide-react";

import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { ThemeToggle } from "./ThemeToggle";
import { FontSizeSetting } from "./FontSizeSetting";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";
import { cn } from "../../../lib/utils";
import { applyFontScale } from "../../../lib/font-scale";

export type NavItem = {
  to: string;
  label: string;
  icon?: ComponentType<{ className?: string }>;
  /** @deprecated Skupiny definujte přes `navGroups`. */
  section?: string;
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
  /** @deprecated Plochý seznam zůstává funkční; nové aplikace používají `navGroups`. */
  items?: NavItem[];
  navGroups?: NavGroup[];
  bottomItems?: NavItem[];
  appName?: string;
  logo?: ReactNode;
  breadcrumbs?: Crumb[];
  contextLeft?: ReactNode;
  actions?: ReactNode;
  panelButtons?: ReactNode;
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
  /** @deprecated Použijte `contextLeft`. */
  topBarLeft?: ReactNode;
  /** @deprecated Použijte `userMenu`, případně `actions`. */
  topBarRight?: ReactNode;
  /** @deprecated Použijte `panels`. Převede se na jeden panel administrace. */
  adminNav?: NavGroup[];
  /** @deprecated Použijte `panels[].title`. */
  adminTitle?: string;
  /** @deprecated Použijte `panels[].tooltip`. */
  adminButtonLabel?: string;
  /** @deprecated Nahrazeno pruhem panelu a `closeLabel`. */
  adminBackLabel?: string;
  /** @deprecated Slouží jen k automatickému otevření starého panelu administrace. */
  adminBasePath?: string;
  /** @deprecated Použijte `activePanel`. */
  adminMode?: boolean;
  /** @deprecated Použijte `onActivePanelChange`. */
  onAdminModeChange?: (open: boolean) => void;
  /** @deprecated Staré ovladače písma a motivu v liště zapínejte jen během přechodu. */
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
        {!collapsed ? <span className="truncate">{item.label}</span> : null}
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
  items = [],
  navGroups,
  bottomItems = [],
  appName = "Aplikace",
  logo,
  breadcrumbs,
  contextLeft,
  actions,
  panelButtons,
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
  topBarLeft,
  topBarRight,
  adminNav,
  adminTitle = "Administrace",
  adminButtonLabel = "Administrace",
  adminBasePath,
  adminMode,
  onAdminModeChange,
  showLegacyToolbar = false,
}: AppShellProps) {
  const pathname = useRouterState({ select: (state) => state.resolvedLocation?.pathname ?? state.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownCollapsed, setOwnCollapsed] = useState(false);
  const [ownActivePanel, setOwnActivePanel] = useState<string | null>(null);

  useEffect(() => { applyFontScale(); }, []);

  const legacyPanels = useMemo<AppShellPanel[]>(() => adminNav?.length ? [{ id: "administration", title: adminTitle, icon: Settings, tooltip: adminButtonLabel, nav: adminNav }] : [], [adminNav, adminTitle, adminButtonLabel]);
  const resolvedPanels = panels ?? legacyPanels;
  const inAdminPath = Boolean(adminBasePath && pathname.startsWith(adminBasePath));
  const legacyPanelId = legacyPanels[0]?.id ?? null;
  const resolvedActivePanel = activePanel !== undefined
    ? activePanel
    : panels
      ? ownActivePanel
      : adminMode === true || inAdminPath
        ? legacyPanelId
        : adminMode === false
          ? null
          : ownActivePanel;
  const currentPanel = resolvedPanels.find((panel) => panel.id === resolvedActivePanel) ?? null;
  const isCollapsed = collapsed ?? ownCollapsed;

  const setPanel = (id: string | null) => {
    onActivePanelChange?.(id);
    if (activePanel === undefined) setOwnActivePanel(id);
    if (!panels) onAdminModeChange?.(id !== null);
  };
  const setCollapsed = (next: boolean) => {
    onCollapsedChange?.(next);
    if (collapsed === undefined) setOwnCollapsed(next);
  };

  useEffect(() => {
    if (!currentPanel) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPanel(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const groups: NavGroup[] = navGroups ?? items.reduce<NavGroup[]>((result, item) => {
    const label = item.section ?? "";
    const last = result[result.length - 1];
    if (last?.label === label) last.items.push(item);
    else result.push({ id: `${label}-${result.length}`, label, items: [item] });
    return result;
  }, []);
  const visibleGroups = currentPanel?.nav ?? groups;
  const nav = (compact: boolean) => (
    <ShellNav groups={visibleGroups} bottomItems={currentPanel ? [] : bottomItems} pathname={pathname} collapsed={compact} collapsibleGroups={Boolean(currentPanel || navGroups)} disabledHint={disabledHint} onNavigate={() => setMenuOpen(false)} />
  );
  const hasContext = Boolean(contextLeft ?? topBarLeft);
  const hasActions = Boolean(actions || showLegacyToolbar);
  const hasPanels = Boolean(resolvedPanels.length || panelButtons);
  const hasUser = Boolean(userMenu ?? topBarRight);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="z-30 flex h-14 shrink-0 items-center border-b bg-card">
        <div className={cn("hidden h-full shrink-0 items-center gap-2 border-r px-4 transition-[width] md:flex", isCollapsed ? "w-14 justify-center px-2" : "w-60")}>
          {logo}
          {!isCollapsed ? <span className="truncate font-semibold tracking-tight">{appName}</span> : null}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label={menuLabel}><Menu className="size-5" /></Button></SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="h-14 justify-center border-b px-4"><SheetTitle>{currentPanel?.title ?? appName}</SheetTitle></SheetHeader>
              {nav(false)}
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2">{contextLeft ?? topBarLeft}</div>
          {hasContext ? <Separator orientation="vertical" className="hidden h-6 md:block" /> : null}
          <div className="min-w-0 flex-1">{breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}</div>
          {hasActions ? <Separator orientation="vertical" className="h-6" /> : null}
          <div className="flex items-center gap-2">{actions}{showLegacyToolbar ? <><FontSizeSetting className="flex items-center" /><ThemeToggle /></> : null}</div>
          {hasPanels ? <Separator orientation="vertical" className="h-6" /> : null}
          <div className="flex items-center gap-2">
            {resolvedPanels.map((panel) => {
              const Icon = panel.icon;
              const pressed = panel.id === currentPanel?.id;
              return <TooltipProvider key={panel.id}><Tooltip><TooltipTrigger asChild><Button type="button" variant={pressed ? "secondary" : "ghost"} size="icon" aria-label={panel.tooltip} aria-pressed={pressed} onClick={() => setPanel(pressed ? null : panel.id)}><Icon className="size-4" /></Button></TooltipTrigger><TooltipContent>{panel.tooltip}</TooltipContent></Tooltip></TooltipProvider>;
            })}
            {panelButtons}
          </div>
          {hasUser ? <Separator orientation="vertical" className="h-6" /> : null}
          <div className="flex items-center gap-2">{userMenu ?? topBarRight}</div>
        </div>
      </header>

      {currentPanel ? (
        <div className={cn("flex h-11 shrink-0 items-center border-b px-3", currentPanel.accent === "warning" ? "bg-warning/10" : "bg-muted")}>
          <div className={cn("hidden shrink-0 items-center gap-2 md:flex", isCollapsed ? "w-14" : "w-60")}><currentPanel.icon className="size-4" /><span className="truncate font-semibold">{currentPanel.title}</span></div>
          <div className="flex flex-1 items-center md:hidden"><currentPanel.icon className="mr-2 size-4" /><span className="truncate font-semibold">{currentPanel.title}</span></div>
          <Button type="button" variant="default" size="sm" className="ml-auto" onClick={() => setPanel(null)}><X className="size-4" />{closeLabel}</Button>
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