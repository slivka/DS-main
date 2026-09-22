import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Menu, Settings } from "lucide-react";

import { Button } from "../../ui/button";
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
  /** Volitelná sekce – položky se stejnou sekcí se seskupí pod nadpis. */
  section?: string;
  search?: Record<string, string>;
  /** Krátký štítek vpravo (např. počet položek). */
  badge?: ReactNode;
  /** Položka je vidět, ale nejde na ni přejít. */
  disabled?: boolean;
  /** Vysvětlení u zakázané položky; výchozí „Připravujeme“. */
  disabledHint?: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
  /** Skupina je při prvním zobrazení sbalená. */
  defaultCollapsed?: boolean;
};

/** Výchozí popisek u položek, které se teprve připravují. */
export const NAV_DISABLED_HINT = "Připravujeme";

/** Společný rám aplikace – boční navigace, horní lišta a obsah stránky. */
export function AppShell({
  children,
  items = [],
  navGroups,
  bottomItems = [],
  appName = "Aplikace",
  logo,
  breadcrumbs,
  topBarLeft,
  topBarRight,
  adminNav,
  adminTitle = "Administrace",
  adminButtonLabel = "Administrace",
  adminBackLabel = "Zpět do aplikace",
  adminBasePath,
  adminMode,
  onAdminModeChange,
}: {
  children: ReactNode;
  /** Plochý seznam položek (starší zápis). Pro skupiny použijte `navGroups`. */
  items?: NavItem[];
  /** Sbalovací skupiny bočního menu. */
  navGroups?: NavGroup[];
  bottomItems?: NavItem[];
  appName?: string;
  logo?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Obsah vlevo v horní liště (např. přepínač workspace a firmy). */
  topBarLeft?: ReactNode;
  /** Obsah vpravo v horní liště (např. uživatel, odhlášení). */
  topBarRight?: ReactNode;
  /** Položky administrace – teprve jejich předání zobrazí tlačítko Administrace. */
  adminNav?: NavGroup[];
  adminTitle?: string;
  adminButtonLabel?: string;
  adminBackLabel?: string;
  /** Cesta, pod kterou se administrace zapne automaticky, např. „/admin“. */
  adminBasePath?: string;
  /** Řízený režim administrace. Bez něj si ho AppShell drží sám. */
  adminMode?: boolean;
  onAdminModeChange?: (open: boolean) => void;
}) {
  const pathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownAdminMode, setOwnAdminMode] = useState(false);

  useEffect(() => {
    applyFontScale();
  }, []);

  const inAdminPath = Boolean(adminBasePath && pathname.startsWith(adminBasePath));
  const adminOpen = Boolean(adminNav?.length) && (adminMode ?? (ownAdminMode || inAdminPath));
  const setAdminOpen = (open: boolean) => {
    if (onAdminModeChange) onAdminModeChange(open);
    if (adminMode === undefined) setOwnAdminMode(open);
  };

  useEffect(() => {
    if (!adminOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAdminOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminOpen]);

  const groups: NavGroup[] =
    navGroups ??
    items.reduce<NavGroup[]>((acc, item) => {
      const label = item.section ?? "";
      const last = acc[acc.length - 1];
      if (last && last.label === label) last.items.push(item);
      else acc.push({ id: `${label}-${acc.length}`, label, items: [item] });
      return acc;
    }, []);

  const isActive = (item: NavItem) =>
    !item.disabled && (pathname === item.to || pathname.startsWith(`${item.to}/`));

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const content = (
      <>
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        <span className="truncate">{item.label}</span>
        {item.badge != null ? (
          <span className="ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
            {item.badge}
          </span>
        ) : null}
      </>
    );
    const base =
      "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover-surface";

    if (item.disabled) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                aria-disabled="true"
                className={cn(base, "cursor-not-allowed text-muted-foreground opacity-70")}
              >
                {content}
              </span>
            </TooltipTrigger>
            <TooltipContent>{item.disabledHint ?? NAV_DISABLED_HINT}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <Link
        to={item.to as never}
        search={item.search as never}
        onClick={() => setMenuOpen(false)}
        className={cn(base, isActive(item) ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80")}
      >
        {content}
      </Link>
    );
  };

  const NavGroupBlock = ({ group, collapsible }: { group: NavGroup; collapsible: boolean }) => {
    const [collapsed, setCollapsed] = useState(group.defaultCollapsed === true);
    const showHeader = Boolean(group.label);
    return (
      <div className="flex flex-col gap-0.5">
        {showHeader ? (
          collapsible ? (
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-expanded={!collapsed}
              className="mb-1 mt-3 flex items-center gap-1 rounded px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {collapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
              <span className="truncate">{group.label}</span>
            </button>
          ) : (
            <div className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </div>
          )
        ) : null}
        {collapsed
          ? null
          : group.items.map((item) => <NavLink key={`${item.to}-${item.label}`} item={item} />)}
      </div>
    );
  };

  const Nav = (
    <nav className="flex h-full flex-col gap-1 overflow-y-auto p-2">
      {groups.map((group) => (
        <NavGroupBlock key={group.id} group={group} collapsible={Boolean(navGroups)} />
      ))}
      {bottomItems.length ? (
        <div className="mt-auto flex flex-col gap-0.5 border-t pt-2">
          {bottomItems.map((item) => (
            <NavLink key={`${item.to}-${item.label}`} item={item} />
          ))}
        </div>
      ) : null}
    </nav>
  );

  const AdminNav = (
    <div className="flex h-full flex-col">
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {(adminNav ?? []).map((group) => (
          <NavGroupBlock key={group.id} group={group} collapsible />
        ))}
      </nav>
      <div className="border-t p-2">
        <Button variant="outline" className="w-full" onClick={() => setAdminOpen(false)}>
          {adminBackLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          {adminOpen ? (
            <span className="truncate font-semibold tracking-tight text-primary">{adminTitle}</span>
          ) : (
            <>
              {logo}
              <span className="truncate font-semibold tracking-tight">{appName}</span>
            </>
          )}
        </div>
        {adminOpen ? AdminNav : Nav}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="h-14 justify-center border-b px-4">
                <SheetTitle>{adminOpen ? adminTitle : appName}</SheetTitle>
              </SheetHeader>
              {adminOpen ? AdminNav : Nav}
            </SheetContent>
          </Sheet>

          {topBarLeft}
          <div className="min-w-0 flex-1">
            {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
          </div>
          {adminNav?.length ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={adminOpen ? "secondary" : "ghost"}
                    size="icon"
                    aria-label={adminButtonLabel}
                    aria-pressed={adminOpen}
                    onClick={() => setAdminOpen(!adminOpen)}
                  >
                    <Settings className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{adminButtonLabel}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
          <FontSizeSetting />
          <ThemeToggle />
          {topBarRight}
        </header>

        <main className="min-w-0 flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
