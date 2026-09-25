import * as React from "react";
import { CalendarClock, Check, ChevronsDownUp, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { DateField } from "../form/date-field";
import { gridFontSize, type GridDensity } from "./grid-zoom";

export interface GridToolbarProps extends React.ComponentPropsWithoutRef<"div"> {
  left?: React.ReactNode;
  right?: React.ReactNode;
  zoom?: number;
  density?: GridDensity;
}

/** Jednotný, zalamovací řádek akcí pro tabulky, stromy i vlastní obsah. */
export const GridToolbar = React.forwardRef<HTMLDivElement, GridToolbarProps>(function GridToolbar(
  { left, right, zoom = 1, density = "normal", className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="grid-toolbar"
      data-density={density}
      className={cn(
        "zoom-filters grid-toolbar-row flex min-w-0 flex-wrap items-center gap-2 border p-2",
        className,
      )}
      style={{ fontSize: gridFontSize(zoom) }}
      {...props}
    >
      {left ?? children}
      {right ? <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2">{right}</div> : null}
    </div>
  );
});

/** Oddělovač skupin v řádku akcí. */
export function GridToolbarSeparator({ density = "normal" }: { density?: GridDensity }) {
  return (
    <span
      aria-hidden
      className={cn(
        "w-px shrink-0 self-center bg-border",
        density === "compact" ? "mx-0.5 h-[1.1em]" : "mx-1 h-[1.4em]",
      )}
    />
  );
}

export interface GridToggleButtonProps extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "variant"> {
  pressed: boolean;
  tone?: "mode" | "grouping";
  icon?: React.ReactNode;
}

/** Textový přepínač hlavního režimu (modrý) nebo seskupení dat (oranžový). */
export const GridToggleButton = React.forwardRef<HTMLButtonElement, GridToggleButtonProps>(function GridToggleButton(
  { pressed, tone = "mode", icon, className, children, ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      type="button"
      size="sm"
      variant={pressed && tone === "mode" ? "default" : "outline"}
      aria-pressed={pressed}
      className={cn("grid-toolbar-control", pressed && tone === "grouping" && "grid-toolbar-active", className)}
      {...props}
    >
      {icon}
      {children}
    </Button>
  );
});

export interface AsOfDateTexts {
  label: string;
  dateLabel: string;
}

export interface AsOfDateConfig {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  value?: string | null;
  onChange: (value: string) => void;
  minDate?: Date;
  maxDate?: Date;
  defaultDate?: string;
  texts?: Partial<AsOfDateTexts>;
}

/** Přepínač „Stav k datu“ s navazujícím polem data. */
export function AsOfDateToggle({
  enabled,
  onEnabledChange,
  value,
  onChange,
  minDate,
  maxDate,
  defaultDate,
  texts,
}: AsOfDateConfig) {
  const t: AsOfDateTexts = { label: "Stav k datu", dateLabel: "Datum stavu", ...texts };
  const toggle = () => {
    const next = !enabled;
    if (next && !value && defaultDate) onChange(defaultDate);
    onEnabledChange(next);
  };
  return (
    <div className="grid-toolbar-group flex min-w-0 items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant={enabled ? "default" : "outline"}
        aria-pressed={enabled}
        onClick={toggle}
        className="grid-toolbar-control shrink-0"
      >
        <CalendarClock className="size-[1.2em]" />
        {t.label}
      </Button>
      {enabled ? (
        <DateField
          value={value ?? ""}
          onChange={onChange}
          minDate={minDate}
          maxDate={maxDate}
          placeholder={t.dateLabel}
          className="w-[11.5em]"
          inputClassName="grid-toolbar-control"
        />
      ) : null}
    </div>
  );
}

export interface GridExpandLevel {
  id: string;
  label: string;
  depth: number;
}

export function GridExpandControls({
  levels,
  activeDepth,
  disabled,
  onExpand,
  onCollapse,
  expandLabel = "Rozbalit",
  collapseLabel = "Sbalit",
}: {
  levels: GridExpandLevel[];
  activeDepth?: number | null;
  disabled?: boolean;
  onExpand: (depth: number) => void;
  onCollapse: () => void;
  expandLabel?: string;
  collapseLabel?: string;
}) {
  const trigger = (
    <Button type="button" variant="outline" size="icon" className="grid-toolbar-icon-control" disabled={disabled} aria-label={expandLabel}>
      <ChevronsUpDown className="size-[1.2em]" />
    </Button>
  );
  return (
    <TooltipProvider delayDuration={250}>
      <div className="grid-toolbar-group flex items-center gap-1">
        {levels.length <= 1 ? (
          <Tooltip>
            <TooltipTrigger asChild>{React.cloneElement(trigger, { onClick: () => onExpand(levels[0]?.depth ?? 99) })}</TooltipTrigger>
            <TooltipContent>{expandLabel}</TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild><DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger></TooltipTrigger>
              <TooltipContent>{expandLabel}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="start">
              {levels.map((level) => (
                <DropdownMenuItem key={level.id} onSelect={() => onExpand(level.depth)}>
                  <span className="flex size-4 items-center justify-center">{activeDepth === level.depth ? <Check className="size-4" /> : null}</span>
                  {level.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="outline" size="icon" className="grid-toolbar-icon-control" disabled={disabled} aria-label={collapseLabel} onClick={onCollapse}>
              <ChevronsDownUp className="size-[1.2em]" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{collapseLabel}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export interface GridAddAction {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  disabledReason?: string;
}

/** Primární akce Přidat; pod 640 px ponechá jen ikonu a nápovědu. */
export function GridAddActions({ actions }: { actions: GridAddAction | GridAddAction[] }) {
  const list = React.useMemo(() => Array.isArray(actions) ? actions : [actions], [actions]);
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.key.toLocaleLowerCase("cs") !== "n" || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true], [role=combobox]")) return;
      const action = list[0];
      if (!action || action.disabled) return;
      event.preventDefault();
      action.onClick(event as unknown as React.MouseEvent<HTMLButtonElement>);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [list]);
  return (
    <TooltipProvider delayDuration={250}>
      {list.map((action) => {
        const actionLabel = `${action.label} (N)`;
        const label = action.disabled && action.disabledReason ? action.disabledReason : actionLabel;
        return (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>
              <Button type="button" size="sm" disabled={action.disabled} onClick={action.onClick} aria-label={actionLabel} className="grid-toolbar-control shrink-0">
                <Plus className="size-[1.2em]" />
                <span className="hidden @min-[640px]:inline">{action.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </TooltipProvider>
  );
}