import * as React from "react";
import { DisabledReasonMenuItem } from "../feedback/disabled-reason-menu-item";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PanelRight,
  Pin,
  PinOff,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "../../ui/button";
import { usePageLayoutVariant } from "./page-layout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import {
  DEFAULT_PANE_CHROME_TEXTS,
  usePaneChrome,
  type PaneChrome,
  type PaneChromeTexts,
} from "../panes/pane-context";

export interface PageHeaderProps extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  title: React.ReactNode;
  /** Vlastní identifikační řádek místo viditelného nadpisu; `title` zůstává pro čtečky. */
  titleSlot?: React.ReactNode;
  /** Stavový štítek bezprostředně za nadpisem. */
  titleBadge?: React.ReactNode;
  /** @deprecated Kontext patří do GridContextBar nebo horní lišty. */
  description?: React.ReactNode;
  actions?: React.ReactNode;
  /** Tlačítko panelu za nabídkou a před zavřením. */
  panelToggle?: React.ReactNode;
  /** Akce celé stránky; uvnitř panelu se zobrazí nahoře v menu ⋯. */
  menuActions?: PageHeaderMenuAction[];
  /** Texty ovládání panelu (jen uvnitř PaneLayout). */
  paneTexts?: Partial<PaneChromeTexts>;
}

export interface PageHeaderMenuAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
  destructive?: boolean;
}

/**
 * Hlavička stránky – nadpis a akce vpravo.
 * Uvnitř PaneLayout navíc vykreslí ovládání záznamu, historie, maximalizaci a menu ⋯.
 */
export function PageHeader({
  title,
  titleSlot,
  titleBadge,
  description,
  actions,
  menuActions = [],
  paneTexts,
  panelToggle,
  className,
  ...props
}: PageHeaderProps) {
  const chrome = usePaneChrome();
  const dsTexts = useDsTexts();
  const t = { ...DEFAULT_PANE_CHROME_TEXTS, ...(dsTexts.paneChrome ?? {}), ...paneTexts };
  React.useEffect(() => {
    if (import.meta.env.DEV && chrome && actions)
      console.warn("PageHeader: v panelu použijte menuActions místo actions.");
    if (import.meta.env.DEV && description)
      console.warn(
        "PageHeader: description se nezobrazuje – kontext patří do GridContextBar / horní lišty.",
      );
  }, [chrome, actions, description]);

  // Ve formulářové stránce se hlavička s akcemi přilepí nahoru; stín dostane po odrolování (PageLayout).
  const layoutVariant = usePageLayoutVariant();
  const sticky = layoutVariant === "form" && (!!actions || menuActions.length > 0);
  return (
    <div
      data-slot="page-header"
      data-sticky={sticky ? "true" : undefined}
      className={cn(
        "@container flex flex-wrap items-start justify-between gap-x-6 gap-y-3",
        sticky && "sticky top-0 z-30 -mx-4 -mt-4 bg-background px-4 pt-4 pb-2 transition-shadow",
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <div className="min-w-0 flex-1">
          {titleSlot ? <h1 className="sr-only">{title}</h1> : null}
          <div className="page-title-line min-w-0">
            {titleSlot ? (
              titleSlot
            ) : chrome ? (
              <h1
                title={typeof title === "string" ? title : undefined}
                {...chrome.dragHandleProps}
                className="typo-title min-w-0 cursor-grab truncate text-primary leading-[1.3] active:cursor-grabbing"
              >
                {title}
              </h1>
            ) : (
              <h1
                title={typeof title === "string" ? title : undefined}
                className="typo-title min-w-0 truncate text-primary leading-[1.3]"
              >
                {title}
              </h1>
            )}
            {titleBadge ? (
              <span className="page-title-badge-slot ml-3">
                {"\u200b"}
                <span className="page-title-badge inline-flex items-center">{titleBadge}</span>
              </span>
            ) : null}
            {chrome?.dirty ? (
              // Stejné pravidlo jako štítek: střed na účaří + ½ x-výšky nadpisu.
              <span className="page-title-badge-slot ml-2" data-slot="page-title-dirty-slot">
                {"\u200b"}
                <span
                  role="img"
                  aria-label={t.unsaved}
                  title={t.unsaved}
                  data-slot="page-title-dirty"
                  className="page-title-badge inline-block size-2 rounded-full bg-primary"
                />
              </span>
            ) : null}
          </div>
        </div>
      </div>
      {actions || chrome || panelToggle ? (
        <div className="flex flex-wrap items-center gap-2">
          {chrome?.recordNav ? <RecordNavButtons chrome={chrome} t={t} /> : null}
          {!chrome ? (
            <>
              {actions}
              {panelToggle}
            </>
          ) : null}
          {chrome ? <HistoryButtons chrome={chrome} t={t} /> : null}
          {chrome ? (
            <PaneButtons
              chrome={chrome}
              t={t}
              pageActions={menuActions}
              panelToggle={panelToggle}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type ChromeProps = { chrome: PaneChrome; t: PaneChromeTexts };

function IconButton({
  label,
  onClick,
  disabled,
  children,
  ...rest
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<"button">) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label={label}
          disabled={disabled}
          onClick={onClick}
          {...rest}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

/** ← → ; podržení 400 ms nebo pravé tlačítko na ← otevře seznam kroků historie. */
function HistoryButtons({ chrome, t }: ChromeProps) {
  const [open, setOpen] = React.useState(false);
  const holdTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const opened = React.useRef(false);
  const steps = [...chrome.history].reverse();

  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label={t.back}
              title={t.back}
              disabled={!chrome.canBack && chrome.history.length < 2}
              onPointerDown={(event) => {
                // Radix by menu otevřel hned – otevřeme ho jen podržením.
                event.preventDefault();
                if (event.button !== 0) return;
                opened.current = false;
                holdTimer.current = setTimeout(() => {
                  opened.current = true;
                  setOpen(true);
                }, 400);
              }}
              onPointerUp={() => clearTimeout(holdTimer.current)}
              onPointerLeave={() => clearTimeout(holdTimer.current)}
              onClick={(event) => {
                event.preventDefault();
                if (opened.current) return;
                if (chrome.canBack) chrome.back();
              }}
              onContextMenu={(event) => {
                event.preventDefault();
                setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
            >
              <ArrowLeft className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72">
            <DropdownMenuLabel>{t.history}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {steps.map((step) => {
              const Icon = chrome.getIcon?.(step.icon);
              return (
                <DropdownMenuItem
                  key={step.index}
                  className="gap-2 pr-1"
                  disabled={step.current}
                  onSelect={() => chrome.goToHistory(step.index)}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  <span className={cn("min-w-0 flex-1 truncate", step.current && "font-semibold")}>
                    {step.title}
                  </span>
                  {!step.current ? (
                    <button
                      type="button"
                      aria-label={t.openInNewTab}
                      title={t.openInNewTab}
                      className="flex size-6 items-center justify-center rounded hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        event.preventDefault();
                        chrome.openFromHistory(step.index);
                        setOpen(false);
                      }}
                    >
                      <Copy className="size-3.5" />
                    </button>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
        <IconButton label={t.forward} disabled={!chrome.canForward} onClick={chrome.forward}>
          <ArrowRight className="size-4" />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}

/** ↑ n / N ↓ – listování záznamy v pořadí seznamu. */
function RecordNavButtons({ chrome, t }: ChromeProps) {
  const nav = chrome.recordNav;
  if (!nav) return null;
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        <IconButton label={t.prevRecord} disabled={nav.index <= 0} onClick={nav.prev}>
          <ArrowUp className="size-4" />
        </IconButton>
        <span className="min-w-12 text-center text-sm tabular-nums text-muted-foreground">
          {(nav.index + 1).toLocaleString()} / {nav.total.toLocaleString()}
        </span>
        <IconButton label={t.nextRecord} disabled={nav.index >= nav.total - 1} onClick={nav.next}>
          <ArrowDown className="size-4" />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}

/** Maximalizace (jen při 2–3 panelech) a menu ⋯. */
function PaneButtons({
  chrome,
  t,
  pageActions,
  panelToggle,
}: ChromeProps & { pageActions: PageHeaderMenuAction[]; panelToggle?: React.ReactNode }) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5">
        {chrome.linked ? (
          <>
            <IconButton
              label={chrome.linked.pinned ? t.unpinLinked : t.pinLinked}
              onClick={chrome.linked.togglePin}
              aria-pressed={chrome.linked.pinned}
            >
              {chrome.linked.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </IconButton>
            <IconButton label={t.returnToPanel} onClick={chrome.linked.returnToPanel}>
              <PanelRight className="size-4" />
            </IconButton>
          </>
        ) : null}
        {chrome.canMaximize || chrome.maximized ? (
          <IconButton
            label={chrome.maximized ? t.restore : t.maximize}
            onClick={chrome.toggleMaximize}
          >
            {chrome.maximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </IconButton>
        ) : null}
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t.more}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>{t.more}</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="min-w-64">
            {pageActions.length ? <DropdownMenuLabel>{t.pageActions}</DropdownMenuLabel> : null}
            {pageActions.map((action) => {
              const Icon = action.icon;
              if (!action.disabledReason)
                return (
                  <DropdownMenuItem
                    key={action.label}
                    disabled={action.disabled}
                    onSelect={() => action.onClick()}
                    className={cn(action.destructive && "text-destructive focus:text-destructive")}
                  >
                    {Icon ? <Icon className="size-4" /> : null}
                    {action.label}
                  </DropdownMenuItem>
                );
              return (
                <DisabledReasonMenuItem
                  key={action.label}
                  disabled={action.disabled}
                  disabledReason={action.disabledReason}
                  className={cn(action.destructive && "text-destructive focus:text-destructive")}
                  onSelect={() => action.onClick()}
                >
                  {Icon ? <Icon className="size-4" /> : null}
                  {action.label}
                </DisabledReasonMenuItem>
              );
            })}
            {pageActions.length ? <DropdownMenuSeparator /> : null}
            {chrome.menuActions.map((action) => (
              <React.Fragment key={action.id}>
                {action.separatorBefore ? <DropdownMenuSeparator /> : null}
                <DropdownMenuItem disabled={action.disabled} onSelect={action.onSelect}>
                  {action.label}
                  {action.shortcut ? (
                    <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                  ) : null}
                </DropdownMenuItem>
              </React.Fragment>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {panelToggle}
        <IconButton
          label={`${t.closeHeader} (Alt+W)`}
          aria-label={t.closeHeader}
          onClick={chrome.closeTab}
        >
          <X className="size-4" />
        </IconButton>
      </div>
    </TooltipProvider>
  );
}
