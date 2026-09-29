import { useMemo, useState, type ComponentType } from "react";
import { Link } from "@tanstack/react-router";
import { Check, LogOut, Minus, Plus, Search } from "lucide-react";

import { Avatar, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import { useDsTexts } from "../../../ds-texts";
import { useAppZoom } from "../../../lib/app-zoom";

export type UserMenuWorkspace = { id: string; name: string };
export type UserMenuItem = {
  label: string;
  icon?: ComponentType<{ className?: string }>;
  to?: string;
  onSelect?: () => void;
};

export interface UserMenuProps {
  name: string;
  email: string;
  workspaces?: UserMenuWorkspace[];
  activeWorkspaceId?: string;
  onWorkspaceChange?: (id: string) => void;
  workspaceLabel?: string;
  workspaceSearchPlaceholder?: string;
  items?: UserMenuItem[];
  onSignOut?: () => void;
  signOutLabel?: string;
  menuLabel?: string;
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toLocaleUpperCase("cs") ?? "").join("");
}

/** Uživatelská nabídka s přímým výběrem pracovního prostoru. */
export function UserMenu({
  name,
  email,
  workspaces = [],
  activeWorkspaceId,
  onWorkspaceChange,
  workspaceLabel = "Pracovní prostor",
  workspaceSearchPlaceholder = "Hledat pracovní prostor…",
  items = [],
  onSignOut,
  signOutLabel = "Odhlásit",
  menuLabel = "Uživatelská nabídka",
}: UserMenuProps) {
  const texts = useDsTexts();
  const appZoom = useAppZoom();
  const [query, setQuery] = useState("");
  const visible = useMemo(
    () => workspaces.filter((workspace) => workspace.name.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs"))),
    [query, workspaces],
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon" aria-label={menuLabel}>
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>
          <span className="block truncate">{name}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center gap-1 px-2 py-1.5" onPointerDown={(event) => event.preventDefault()}>
          <span className="mr-auto text-sm">{texts.appZoom.label}</span>
          <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={texts.appZoom.decrease} disabled={appZoom.zoom <= appZoom.min} onClick={() => appZoom.setZoom(appZoom.zoom - appZoom.step)}><Minus className="size-3.5" /></Button>
          <span className="w-12 text-center text-sm tabular-nums">{Math.round(appZoom.zoom * 100)}&nbsp;%</span>
          <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={texts.appZoom.increase} disabled={appZoom.zoom >= appZoom.max} onClick={() => appZoom.setZoom(appZoom.zoom + appZoom.step)}><Plus className="size-3.5" /></Button>
          <Button type="button" variant="ghost" size="sm" onClick={appZoom.reset}>{texts.appZoom.reset}</Button>
        </div>
        {workspaces.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">{workspaceLabel}</DropdownMenuLabel>
            {workspaces.length > 8 ? (
              <div className="relative px-1 pb-1">
                <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={workspaceSearchPlaceholder} className="pl-8" />
              </div>
            ) : null}
            <DropdownMenuRadioGroup value={activeWorkspaceId} onValueChange={onWorkspaceChange}>
              {visible.map((workspace) => (
                <DropdownMenuRadioItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                  {workspace.id === activeWorkspaceId ? <Check className="ml-auto size-4" /> : null}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        ) : null}
        {items.length ? <DropdownMenuSeparator /> : null}
        {items.map((item) => {
          const Icon = item.icon;
          const content = <>{Icon ? <Icon className="size-4" /> : null}{item.label}</>;
          return item.to ? (
            <DropdownMenuItem key={item.label} asChild>
              <Link to={item.to as never}>{content}</Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={item.label} onSelect={item.onSelect}>{content}</DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="size-4" />
          {signOutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}