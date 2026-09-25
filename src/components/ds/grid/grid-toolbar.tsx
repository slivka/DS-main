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

export const GridToolbarOverflowContext = React.createContext<0 | 1 | 2 | 3>(0);

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
  const ownRef = React.useRef<HTMLDivElement | null>(null);
  const [overflowLevel, setOverflowLevel] = React.useState<0 | 1 | 2 | 3>(0);
  const setRefs = React.useCallback((node: HTMLDivElement | null) => {
    ownRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  }, [ref]);
  React.useEffect(() => {
    const node = ownRef.current;
    if (!node) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const overflows = () => node.scrollWidth > node.clientWidth + 1;
        node.dataset.overflowLevel = "0";
        let next: 0 | 1 | 2 | 3 = node.clientWidth < 640 ? 2 : 0;
        node.dataset.overflowLevel = String(next);
        for (const level of [1, 2, 3] as const) {
          if (level <= next) continue;
          if (!overflows()) break;
          node.dataset.overflowLevel = String(level);
          next = level;
          void node.offsetWidth;
        }
        setOverflowLevel(next);
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    const mutations = new MutationObserver(update);
    mutations.observe(node, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class", "aria-expanded", "aria-pressed", "data-state"] });
    update();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); mutations.disconnect(); };
  }, []);
  return (
    <GridToolbarOverflowContext.Provider value={overflowLevel}>
    <div
      ref={setRefs}
      data-slot="grid-toolbar"
      data-density={density}
      className={cn(
        "zoom-filters grid-toolbar-row flex min-w-0 flex-nowrap items-center gap-2 border p-2",
        right ? "overflow-x-auto overflow-y-hidden" : "overflow-visible",
        className,
      )}
      style={{ fontSize: gridFontSize(zoom) }}
      {...props}
    >
      {left ?? children}
      {right ? <div data-slot="grid-toolbar-right" className="ml-auto flex min-w-0 flex-nowrap items-center justify-end gap-2 overflow-hidden">{right}</div> : null}
    </div>
    </GridToolbarOverflowContext.Provider>
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
  const overflowLevel = React.useContext(GridToolbarOverflowContext);
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
              <Button type="button" size="sm" disabled={action.disabled} onClick={action.onClick} aria-label={actionLabel} className="grid-toolbar-control grid-toolbar-primary shrink-0">
                <Plus className="size-[1.2em]" />
                <span className={cn("hidden @min-[640px]:inline", overflowLevel >= 3 && "@min-[640px]:hidden")}>{action.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        );
      })}
    </TooltipProvider>
  );
}