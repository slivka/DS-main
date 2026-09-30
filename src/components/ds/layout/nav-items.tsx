import type { ComponentType, ReactNode } from "react";

import { cn } from "../../../lib/utils";

/** Položka menu – sdílený typ pro AppShell i StandaloneNav. */
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

/** Aktivní položka podle trasy (stejné pravidlo v AppShell i StandaloneNav). */
export function isNavItemActive(item: NavItem, path: string) {
  return !item.disabled && (path === item.to || path.startsWith(`${item.to}/`));
}

/** Třídy řádku položky menu. */
export function navItemClassName({ active, collapsed = false, disabled = false }: { active: boolean; collapsed?: boolean; disabled?: boolean }) {
  return cn(
    "shell-nav-item relative flex h-9 items-center gap-2 rounded-md text-sm transition-colors hover-surface",
    collapsed ? "justify-center px-2" : "px-3",
    active ? "bg-sidebar-active font-semibold text-sidebar-active-foreground" : "text-sidebar-foreground/90",
    disabled && "cursor-not-allowed text-sidebar-muted opacity-80",
  );
}

/** Vnitřek položky menu: indikátor, ikona, popisek, značka nedostupnosti a odznak. */
export function NavItemContent({ item, active, collapsed = false, label }: { item: NavItem; active: boolean; collapsed?: boolean; label?: ReactNode }) {
  const Icon = item.icon;
  return (
    <>
      <span className={cn("shell-nav-indicator absolute inset-y-1 left-0 w-0.5 rounded-r bg-sidebar-indicator transition-opacity", active ? "opacity-100" : "opacity-0")} />
      {Icon ? <Icon className="size-4 shrink-0" /> : <span className="size-4 shrink-0" />}
      {!collapsed ? <span className="min-w-0 flex-1 truncate" title={item.label}>{label ?? item.label}</span> : null}
      {!collapsed && item.disabled ? <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-sidebar-muted/50" /> : null}
      {!collapsed && item.badge != null ? <span data-slot="shell-nav-badge" className="ml-auto shrink-0 rounded-full bg-sidebar-badge px-2 py-0.5 text-xs font-medium text-sidebar-badge-foreground">{item.badge}</span> : null}
    </>
  );
}

/** Nadpis sekce menu verzálkami (neklikací). */
export function NavSectionLabel({ label, first, children }: { label: string; first: boolean; children?: ReactNode }) {
  return (
    <div data-nav-section={label} className={cn(!first && "mt-4 border-t border-sidebar-border pt-4")}>
      <div className="flex h-7 items-center px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-sidebar-muted">
        <span className="truncate" title={label}>{children ?? label}</span>
      </div>
    </div>
  );
}
