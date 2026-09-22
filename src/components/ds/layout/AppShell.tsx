import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { Menu } from "lucide-react";

import { Button } from "../../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../ui/sheet";
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
};

/** Společný rám aplikace – boční navigace, horní lišta a obsah stránky. */
export function AppShell({
  children,
  items,
  bottomItems = [],
  appName = "Aplikace",
  logo,
  breadcrumbs,
  topBarLeft,
  topBarRight,
}: {
  children: ReactNode;
  items: NavItem[];
  bottomItems?: NavItem[];
  appName?: string;
  logo?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Obsah vlevo v horní liště (např. přepínač workspace a firmy). */
  topBarLeft?: ReactNode;
  /** Obsah vpravo v horní liště (např. uživatel, odhlášení). */
  topBarRight?: ReactNode;
}) {
  const pathname = useRouterState({
    select: (s) => s.resolvedLocation?.pathname ?? s.location.pathname,
  });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    applyFontScale();
  }, []);

  const groups = items.reduce<{ section?: string; items: NavItem[] }[]>((acc, item) => {
    const last = acc[acc.length - 1];
    if (last && last.section === item.section) last.items.push(item);
    else acc.push({ section: item.section, items: [item] });
    return acc;
  }, []);

  const isActive = (item: NavItem) => pathname === item.to || pathname.startsWith(`${item.to}/`);

  const NavLink = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    return (
      <Link
        to={item.to as never}
        search={item.search as never}
        onClick={() => setMenuOpen(false)}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover-surface",
          isActive(item) ? "bg-primary/10 font-semibold text-primary" : "text-foreground/80",
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  const Nav = (
    <nav className="flex h-full flex-col gap-1 p-2">
      {groups.map((group, i) => (
        <div key={`${group.section ?? "main"}-${i}`} className="flex flex-col gap-0.5">
          {group.section ? (
            <div className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              {group.section}
            </div>
          ) : null}
          {group.items.map((item) => (
            <NavLink key={`${item.to}-${item.label}`} item={item} />
          ))}
        </div>
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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b px-4">
          {logo}
          <span className="truncate font-semibold tracking-tight">{appName}</span>
        </div>
        {Nav}
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
                <SheetTitle>{appName}</SheetTitle>
              </SheetHeader>
              {Nav}
            </SheetContent>
          </Sheet>

          {topBarLeft}
          <div className="min-w-0 flex-1">
            {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
          </div>
          <FontSizeSetting />
          <ThemeToggle />
          {topBarRight}
        </header>

        <main className="min-w-0 flex-1 p-4">{children}</main>
      </div>
    </div>
  );
}
