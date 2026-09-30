import { Fragment, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../../lib/utils";
import { useIsMobile } from "../../../hooks/use-mobile";
import { useDsTexts } from "../../../ds-texts";
import { withNavSections } from "./nav-search";
import { isNavItemActive, navItemClassName, NavItemContent, NavSectionLabel, type NavGroup } from "./nav-items";

export interface StandaloneNavProps {
  groups: NavGroup[];
  /** Aktuální cesta; výchozí z routeru. */
  pathname?: string;
  /** Přístupnostní název menu / výběru stránek. */
  label?: string;
  /** Zástupný text výběru na úzké obrazovce. */
  selectPlaceholder?: string;
  className?: string;
}

/** Menu stránek pro levý sloupec StandaloneShell; pod `md` výběr stránek. */
export function StandaloneNav({ groups, pathname, label, selectPlaceholder, className }: StandaloneNavProps) {
  const texts = useDsTexts();
  const routerPath = useRouterState({ select: (state) => state.location.pathname });
  const navigate = useNavigate();
  const path = pathname ?? routerPath;
  const isMobile = useIsMobile();
  const navLabel = label ?? texts.standalone.pages;
  const items = groups.flatMap((group) => group.items);
  const active = items.find((item) => isNavItemActive(item, path));

  if (isMobile) {
    return (
      <Select
        value={active?.to}
        onValueChange={(to) => {
          const item = items.find((candidate) => candidate.to === to);
          if (item) void navigate({ to: item.to as never, search: item.search as never });
        }}
      >
        <SelectTrigger data-slot="standalone-nav-select" aria-label={navLabel} className={cn("w-full bg-background text-foreground", className)}>
          <SelectValue placeholder={selectPlaceholder ?? texts.standalone.pagesSelect} />
        </SelectTrigger>
        <SelectContent>
          {groups.map((group) => (
            <SelectGroup key={group.id}>
              {group.section || group.label ? <SelectLabel className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{group.section || group.label}</SelectLabel> : null}
              {group.items.map((item) => <SelectItem key={item.to} value={item.to} disabled={item.disabled}>{item.label}</SelectItem>)}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <nav aria-label={navLabel} data-slot="standalone-nav" className={cn("flex flex-col", className)}>
      {withNavSections(groups).map(({ group, sectionStart }, index): ReactNode => (
        <Fragment key={group.id}>
          {sectionStart ? <NavSectionLabel label={sectionStart} first={index === 0} /> : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const itemActive = isNavItemActive(item, path);
              const className = navItemClassName({ active: itemActive, disabled: item.disabled });
              const content = <NavItemContent item={item} active={itemActive} />;
              return item.disabled ? (
                <span key={item.to} aria-disabled="true" title={item.disabledHint} className={className}>{content}</span>
              ) : (
                <Link key={item.to} to={item.to as never} search={item.search as never} aria-current={itemActive ? "page" : undefined} data-active={itemActive ? "true" : "false"} className={className}>{content}</Link>
              );
            })}
          </div>
        </Fragment>
      ))}
    </nav>
  );
}
