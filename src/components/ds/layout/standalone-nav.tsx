import { Fragment, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../../ui/select";
import { cn } from "../../../lib/utils";
import { useEffectiveIsMobile } from "../../../lib/app-zoom";
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
  const isMobile = useEffectiveIsMobile();
  const navLabel = label ?? texts.standalone.pages;
  const items = groups.flatMap((group) => group.items);
  const active = items.find((item) => isNavItemActive(item, path));

  if (isMobile) {
    return (
      <nav aria-label={navLabel} data-slot="standalone-nav" className={cn("w-full", className)}>
        <Select
          value={active?.to ?? ""}
          onValueChange={(to) => {
            const item = items.find((candidate) => candidate.to === to);
            if (item) void navigate({ to: item.to as never, search: item.search as never });
          }}
        >
          <SelectTrigger data-slot="standalone-nav-select" aria-label={navLabel} className="w-full bg-background text-foreground">
            <SelectValue placeholder={selectPlaceholder ?? texts.standalone.pagesSelect} />
          </SelectTrigger>
          <SelectContent>
            {withNavSections(groups).map(({ group, sectionStart }) => (
              <SelectGroup key={group.id}>
                {sectionStart ? <SelectLabel className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{sectionStart}</SelectLabel> : null}
                {group.items.map((item) => <SelectItem key={item.to} value={item.to} disabled={item.disabled}>{item.label}</SelectItem>)}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </nav>
    );
  }

  return (
    <nav aria-label={navLabel} data-slot="standalone-nav" className={cn("flex flex-col", className)}>
      {withNavSections(groups).map(({ group, sectionStart }, index): ReactNode => (
        <Fragment key={group.id}>
          {sectionStart ? <NavSectionLabel label={sectionStart} first={index === 0} truncatedTooltip /> : null}
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const itemActive = isNavItemActive(item, path);
              const className = navItemClassName({ active: itemActive, disabled: item.disabled });
              const content = <NavItemContent item={item} active={itemActive} truncatedTooltip />;
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
