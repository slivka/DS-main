/**
 * Levé menu rámu aplikace.
 * Vlastní: hledání v menu (šipky, Enter, Escape), zvýraznění výsledku, okraje rolování, otevírání do záložek.
 * Nesmí: znát panely, šířku menu ani globální zkratky – fokus hledání řídí rodič přes `focusSearch`.
 */
import { Link } from "@tanstack/react-router";
import type { LinkProps } from "@tanstack/react-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { Search, X } from "lucide-react";

import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { usePaneTabs, useActivePaneTab } from "../panes/pane-context";
import { handlePaneLinkEvent } from "../panes/pane-link";
import type { OpenTabTarget } from "../panes/pane-state";
import { filterNavGroups, highlightNavMatch, withNavSections } from "./nav-search";
import {
  isNavItemActive,
  navItemClassName,
  NavItemContent,
  type NavGroup,
  type NavItem,
} from "./nav-items";
import { ShellNavGroup } from "./AppShellNavGroup";

/** Props levého menu; všechny texty dodává AppShell z DsTexts. */
export type ShellNavProps = {
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

/** Levé menu s hledáním; stejné pro postranní panel, mobilní menu i překryv hledání. */
export function ShellNav({
  groups,
  bottomItems = [],
  pathname,
  collapsed,
  collapsibleGroups,
  disabledHint,
  onNavigate,
  navStateKey,
  searchEnabled,
  searchPlaceholder,
  searchEmptyText,
  onExpandSearch,
  focusSearch = 0,
  onDismissSearch,
  searchMenu,
  clearSearchLabel,
  mainMenuLabel,
  containsActivePageLabel,
}: ShellNavProps) {
  // V režimu záložek otevírá navigace stránky do záložek (Cmd/Ctrl + klik = nová záložka, + Shift = sousední panel).
  const paneTabs = usePaneTabs();
  const activeTab = useActivePaneTab();
  const currentPath = paneTabs ? (activeTab?.route ?? "") : pathname;
  const isActive = (item: NavItem) => isNavItemActive(item, currentPath);
  const paneOpen = (item: NavItem) =>
    paneTabs
      ? (target: OpenTabTarget) =>
          paneTabs.openTab(item.to, item.search, { target, title: item.label })
      : null;

  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const filteredGroups = useMemo(() => filterNavGroups(groups, query), [groups, query]);
  const sectionedGroups = useMemo(() => withNavSections(filteredGroups), [filteredGroups]);
  const enabledResults = filteredGroups
    .flatMap((group) => group.items)
    .filter((item) => !item.disabled);
  const [highlighted, setHighlighted] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const [navEdges, setNavEdges] = useState({ top: false, bottom: false });

  const updateNavEdges = useCallback(() => {
    const node = navRef.current;
    if (!node) return;
    setNavEdges({
      top: node.scrollTop > 1,
      bottom: node.scrollTop + node.clientHeight < node.scrollHeight - 1,
    });
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
    const index = filteredGroups
      .flatMap((group) => group.items)
      .findIndex((candidate) => candidate === item);
    resultRefs.current[index]?.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      }),
    );
  };

  const onSearchKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted(
        (value) => (value + direction + enabledResults.length) % Math.max(enabledResults.length, 1),
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      activateResult(event);
    } else if (event.key === "Escape") {
      if (query) setQuery("");
      else {
        inputRef.current?.blur();
        onDismissSearch?.();
      }
    }
  };

  let resultIndex = -1;
  const navItem = (item: NavItem, groupLabel: string) => {
    resultIndex += 1;
    const flatIndex = resultIndex;
    const enabledIndex = enabledResults.indexOf(item);
    const active = isActive(item);
    const content = (
      <NavItemContent
        item={item}
        active={active}
        collapsed={collapsed}
        label={query ? highlightNavMatch(item.label, query) : item.label}
      />
    );
    const base = navItemClassName({ active, collapsed, disabled: item.disabled });
    const node = item.disabled ? (
      <span aria-disabled="true" data-active="false" className={base}>
        {content}
      </span>
    ) : (
      <Link
        to={item.to as LinkProps["to"]}
        search={item.search as LinkProps["search"]}
        ref={(node) => {
          resultRefs.current[flatIndex] = node;
        }}
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
        className={cn(
          base,
          query && enabledIndex === highlighted && "ring-1 ring-sidebar-indicator",
        )}
      >
        {content}
      </Link>
    );
    if (!collapsed && !item.disabled) return node;
    return (
      <Tooltip key={`${item.to}-${item.label}`}>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">
          {item.disabled ? (item.disabledHint ?? disabledHint) : item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        {searchEnabled ? (
          collapsed ? (
            <div className="flex shrink-0 flex-col gap-1 p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-full text-sidebar-foreground"
                    aria-label={searchPlaceholder}
                    onClick={onExpandSearch}
                  >
                    <Search className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{searchPlaceholder}</TooltipContent>
              </Tooltip>
              {searchMenu}
            </div>
          ) : (
            <div className="shrink-0 px-2 pb-1 pt-2">
              <div className="flex items-center gap-1">
                <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-input px-2 text-sidebar-foreground focus-within:ring-1 focus-within:ring-sidebar-indicator">
                  <Search className="size-4 shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={onSearchKeyDown}
                    placeholder={searchPlaceholder}
                    aria-label={searchPlaceholder}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-sidebar-muted"
                  />
                  {query ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 text-sidebar-foreground"
                      aria-label={clearSearchLabel}
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                    >
                      <X className="size-3.5" />
                    </Button>
                  ) : null}
                </div>
                {searchMenu}
              </div>
            </div>
          )
        ) : null}
        <div className="relative min-h-0 flex-1">
          <nav
            ref={navRef}
            onScroll={updateNavEdges}
            className="ds-scroll-area flex h-full min-h-0 flex-col overflow-y-auto overscroll-contain p-2"
            aria-label={mainMenuLabel}
          >
            <div className="flex min-h-full flex-col">
              {sectionedGroups.map(({ group, sectionStart }, index) => (
                <ShellNavGroup
                  key={`${navStateKey}:${group.id}`}
                  group={group}
                  groupIndex={index}
                  sectionStart={sectionStart}
                  active={group.items.some(isActive)}
                  forcedOpen={Boolean(query)}
                  query={query}
                  collapsed={collapsed}
                  collapsible={collapsibleGroups}
                  navStateKey={navStateKey}
                  renderItem={(item) => navItem(item, group.label)}
                  containsActivePageLabel={containsActivePageLabel}
                />
              ))}
              {query && filteredGroups.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-sidebar-muted">
                  {searchEmptyText}
                </p>
              ) : null}
              {!query && bottomItems.length ? (
                <div className="mt-auto flex flex-col gap-0.5 border-t pt-2">
                  {bottomItems.map((item) => navItem(item, ""))}
                </div>
              ) : null}
            </div>
          </nav>
          <span aria-hidden data-nav-fade="top" data-visible={navEdges.top || undefined} />
          <span aria-hidden data-nav-fade="bottom" data-visible={navEdges.bottom || undefined} />
        </div>
      </div>
    </TooltipProvider>
  );
}
