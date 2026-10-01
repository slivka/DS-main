/**
 * Skupina a oddíl levého menu.
 * Vlastní: sbalení skupiny (uložené v prohlížeči pod klíčem menu), součet číselných odznaků, oddíly.
 * Nesmí: znát panely ani hledání – dostává hotové položky a vykreslovač položky.
 */
import { useEffect, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { highlightNavMatch } from "./nav-search";
import { NavSectionLabel, type NavGroup, type NavItem } from "./nav-items";

/** Uložené sbalení skupiny; mimo prohlížeč nebo bez úložiště vrací výchozí hodnotu. */
function readGroupCollapsed(storageKey: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored == null ? fallback : stored === "true";
  } catch {
    return fallback;
  }
}

/** Součet číselných odznaků skupiny; nečíselné odznaky se nepočítají. Bez součtu vrací null. */
export function badgeTotal(group: NavGroup) {
  const values = group.items.map((item) =>
    typeof item.badge === "number"
      ? item.badge
      : typeof item.badge === "string" && /^\d+$/.test(item.badge)
        ? Number(item.badge)
        : 0,
  );
  const total = values.reduce((sum, value) => sum + value, 0);
  return total > 0 ? total : null;
}

/** Nadpis oddílu menu; ve sbaleném menu jen čára s tooltipem. */
function ShellNavSection({
  label,
  first,
  collapsed,
  query = "",
}: {
  label: string;
  first: boolean;
  collapsed: boolean;
  query?: string;
}) {
  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            data-nav-section={label}
            className={cn("flex h-6 items-center px-1", !first && "mt-3")}
          >
            <span className="h-0.5 w-full bg-sidebar-border" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }
  return (
    <NavSectionLabel label={label} first={first}>
      {query ? highlightNavMatch(label, query) : label}
    </NavSectionLabel>
  );
}

/** Skupina menu s volitelným sbalením a oddílem nad ní. */
export function ShellNavGroup({
  group,
  groupIndex,
  sectionStart,
  active,
  forcedOpen,
  query,
  collapsed,
  collapsible,
  navStateKey,
  renderItem,
  containsActivePageLabel,
}: {
  group: NavGroup;
  groupIndex: number;
  sectionStart: string | null;
  active: boolean;
  forcedOpen: boolean;
  query: string;
  collapsed: boolean;
  collapsible: boolean;
  navStateKey: string;
  renderItem: (item: NavItem) => ReactNode;
  containsActivePageLabel: string;
}) {
  const storageKey = `ds:nav-groups:${navStateKey}:${group.id}`;
  const canCollapse = collapsible && Boolean(group.label);
  const [groupCollapsed, setGroupCollapsed] = useState(
    Boolean(group.label) && group.defaultCollapsed === true,
  );
  useEffect(
    () =>
      setGroupCollapsed(
        canCollapse && readGroupCollapsed(storageKey, group.defaultCollapsed === true),
      ),
    [storageKey, group.defaultCollapsed, canCollapse],
  );
  const setStoredCollapsed = () => {
    const next = !groupCollapsed;
    setGroupCollapsed(next);
    try {
      window.localStorage.setItem(storageKey, String(next));
    } catch {
      /* úložiště nemusí být dostupné */
    }
  };
  const total = badgeTotal(group);
  const hidden = canCollapse && groupCollapsed && !forcedOpen;
  return (
    <>
      {sectionStart ? (
        <ShellNavSection
          label={sectionStart}
          first={groupIndex === 0}
          collapsed={collapsed}
          query={query}
        />
      ) : null}
      <div
        className={cn(
          "flex flex-col",
          group.label &&
            groupIndex > 0 &&
            !sectionStart &&
            "mt-2 border-t border-sidebar-border pt-2",
        )}
      >
        {group.label && !collapsed ? (
          canCollapse ? (
            <button
              type="button"
              onClick={setStoredCollapsed}
              aria-expanded={!hidden}
              className="shell-nav-group mb-1 flex h-8 w-full items-center gap-2 rounded-md px-3 text-left text-[0.8rem] font-semibold text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-foreground"
            >
              <span className="min-w-0 flex-1 truncate">
                {query ? highlightNavMatch(group.label, query) : group.label}
              </span>
              {hidden && total ? (
                <span className="rounded-md bg-sidebar-badge px-1.5 py-0.5 text-xs font-medium text-sidebar-badge-foreground">
                  {total}
                </span>
              ) : null}
              {hidden && active ? (
                <span
                  className="size-2 rounded-full bg-sidebar-indicator"
                  aria-label={containsActivePageLabel}
                />
              ) : null}
              <ChevronRight
                className={cn(
                  "size-3.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none",
                  !hidden && "rotate-90",
                )}
              />
            </button>
          ) : (
            <div className="shell-nav-group mb-1 flex h-8 items-center px-3 text-[0.8rem] font-semibold text-sidebar-muted">
              {group.label}
            </div>
          )
        ) : null}
        {hidden && !collapsed ? null : (
          <div
            className={cn(
              "flex flex-col gap-0.5",
              !collapsed && group.label && "ml-2 border-l border-sidebar-border pl-2",
            )}
          >
            {group.items.map((item) => (
              <span key={`${item.to}-${item.label}`}>{renderItem(item)}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
