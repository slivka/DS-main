/**
 * Primární akce Přidat v liště gridu.
 * Vlastní: kaskádu textů podle šířky, sloučení dvou a více akcí do nabídky a zkratku N.
 * Nesmí: znát doménu (příjem/výdaj) ani barvit akce podle směru.
 */
import * as React from "react";
import { ChevronDown, Plus, type LucideIcon } from "lucide-react";
import { DS_TEXTS_CS, useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { DisabledReasonMenuItem } from "../feedback/disabled-reason-menu-item";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useIsActivePane } from "../panes/pane-context";
import { GridAddLabelContext, GridToolbarOverflowContext } from "./grid-toolbar-context";

/** Primární akce lišty gridu. */
export interface GridAddAction {
  /** Plný text akce, např. „Nový příjem“. */
  label: string;
  /** Zkrácený text v užší liště, když jsou akce dvě a více, např. „Příjem“. */
  shortLabel?: string;
  /** Ikona položky ve sloučené nabídce nejužší lišty. */
  icon?: LucideIcon;
  /** Provede akci; z nabídky dostane událost výběru položky (metodová signatura kvůli kompatibilitě). */
  onClick(event: React.SyntheticEvent<HTMLElement> | Event): void;
  /** Zakáže akci. */
  disabled?: boolean;
  /** Důvod zakázání v tooltipu. */
  disabledReason?: string;
  /**
   * Obsah nabídky split tlačítka (položky DropdownMenu, např. DocumentNewMenuItems).
   * Přítomnost zapíná split režim: hlavní klik provede onClick, šipka otevře nabídku.
   * Ve sloučené nabídce „+ ▾“ se akce vykreslí jako podnabídka.
   */
  menu?: ReactNode;
}

/** Vlastnosti primárních akcí lišty. */
export interface GridAddActionsProps {
  /** Jedna nebo více primárních akcí. */
  actions: GridAddAction | GridAddAction[];
}

/**
 * Jedna akce: plný text od 640 px, jinak jen ikona.
 * Více akcí: změřený plný text → zkrácený text → jedno tlačítko „+ ▾“ s nabídkou
 * (úroveň 3 kaskády lišty). Text u dvou tlačítek nikdy úplně nezmizí.
 */
export function GridAddActions({ actions }: GridAddActionsProps) {
  const overflowLevel = React.useContext(GridToolbarOverflowContext);
  const texts = useDsTexts().grid;
  const addMenuLabel = texts.addMenu ?? DS_TEXTS_CS.grid.addMenu;
  const labelMode = React.useContext(GridAddLabelContext);
  const primaryActionRef = React.useRef<HTMLButtonElement>(null);
  const list = React.useMemo(() => (Array.isArray(actions) ? actions : [actions]), [actions]);
  const multiple = list.length > 1;
  const merged = multiple && overflowLevel >= 3;
  const reasonIdBase = React.useId();
  // Zkratka N reaguje jen v aktivním panelu a jen když není otevřený dialog,
  // aby jeden stisk neklikl na Přidat ve všech gridových lištách najednou.
  const paneActive = useIsActivePane();
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!paneActive || event.defaultPrevented) return;
      if (
        event.key.toLocaleLowerCase("cs") !== "n" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey
      )
        return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable=true], [role=combobox]"))
        return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      const action = list[0];
      if (!action || action.disabled) return;
      event.preventDefault();
      primaryActionRef.current?.click();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [list, paneActive]);
  return (
    <TooltipProvider delayDuration={250}>
      {list.map((action, index) => {
        const actionLabel = index === 0 ? `${action.label} (N)` : action.label;
        const tip = action.disabled && action.disabledReason ? action.disabledReason : actionLabel;
        // Zakázaná akce s důvodem zůstává fokusovatelná (aria-disabled), aby klik,
        // klepnutí i Enter/mezerník ukázaly důvod; bez důvodu stačí nativní disabled.
        const blocked = Boolean(action.disabled && action.disabledReason);
        const reasonId = `${reasonIdBase}-${index}`;
        const button = (
          <Button
            ref={index === 0 ? primaryActionRef : undefined}
            data-toolbar-add
            type="button"
            size="sm"
            disabled={blocked ? undefined : action.disabled}
            aria-disabled={blocked || undefined}
            aria-describedby={blocked ? reasonId : undefined}
            onClick={(event) => {
              if (blocked) {
                event.preventDefault();
                return;
              }
              action.onClick(event);
            }}
            aria-label={actionLabel}
            // Ve sloučeném stavu zůstává tlačítko v DOM skryté kvůli zkratce N a měření.
            className={cn(
              "grid-toolbar-control grid-toolbar-primary shrink-0",
              blocked && "cursor-not-allowed",
              merged && "hidden",
            )}
          >
            <Plus className="size-[1.2em]" />
            {multiple ? (
              <>
                <span
                  data-slot="grid-add-full"
                  className={labelMode === "full" ? "inline" : "hidden"}
                >
                  {action.label}
                </span>
                <span
                  data-slot="grid-add-short"
                  className={labelMode === "short" ? "inline" : "hidden"}
                >
                  {action.shortLabel ?? action.label}
                </span>
              </>
            ) : (
              <span
                className={cn(
                  "hidden @min-[640px]:inline",
                  overflowLevel >= 3 && "@min-[640px]:hidden",
                )}
              >
                {action.label}
              </span>
            )}
          </Button>
        );
        if (blocked)
          return (
            <React.Fragment key={action.label}>
              <DisabledReasonTooltip content={tip} blocked>
                {button}
              </DisabledReasonTooltip>
              <span id={reasonId} className="sr-only">
                {action.disabledReason}
              </span>
            </React.Fragment>
          );
        return (
          <Tooltip key={action.label}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{tip}</TooltipContent>
          </Tooltip>
        );
      })}
      {multiple ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  data-slot="grid-add-menu"
                  aria-hidden={!merged}
                  aria-label={addMenuLabel}
                  className={cn(
                    "grid-toolbar-control grid-toolbar-primary shrink-0 gap-0.5",
                    !merged && "hidden",
                  )}
                >
                  <Plus className="size-[1.2em]" />
                  <ChevronDown aria-hidden className="size-[0.85em]" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{addMenuLabel}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="start">
            {list.map((action) => {
              const Icon = action.icon ?? Plus;
              return (
                <DisabledReasonMenuItem
                  key={action.label}
                  disabled={action.disabled}
                  disabledReason={action.disabledReason}
                  onSelect={(event) => action.onClick(event)}
                >
                  <Icon aria-hidden className="size-[1.1em]" />
                  {action.shortLabel ?? action.label}
                </DisabledReasonMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </TooltipProvider>
  );
}
