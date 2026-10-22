/** Panel záznamu · vlastní rozložení a záložky · nesmí načítat data ani řídit připnutí. */
import {
  forwardRef,
  useId,
  useRef,
  useState,
  useEffect,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import {
  ArrowLeftRight,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";
import { fmtAmount } from "../../../lib/format";
import { PanelResize, panelSizeBounds, clampPanelSize } from "./record-side-panel/panel-resize";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useRecordPanelFocus } from "./record-side-panel/use-record-panel-focus";
/** Záložka obecného panelu. */
export interface RecordSidePanelTab {
  /** Identifikátor. */
  id: string;
  /** Popisek. */
  label: string;
  /** Ikona dodaná aplikací. */
  icon: LucideIcon;
  /** Počet záznamů. */
  count?: number;
  /** Obsah záložky. */
  content: ReactNode;
}
/** Řízený panel a jeho hlavní obsah v children. */
export interface RecordSidePanelProps extends Omit<ComponentPropsWithoutRef<"div">, "header"> {
  /** Otevřený panel. */
  open: boolean;
  /** Žádost otevřít či zavřít. */
  onOpenChange: (open: boolean) => void;
  /** Aktivní záložka. */
  activeTab: string;
  /** Změna záložky uživatelem. */
  onActiveTabChange: (id: string) => void;
  /** Pořadí a obsah záložek. */
  tabs: readonly RecordSidePanelTab[];
  /** Trvale viditelný název záznamu. */
  header?: ReactNode;
  /** Řízená velikost v px. */
  size?: number;
  /** Žádost o změnu velikosti. */
  onSizeChange?: (size: number) => void;
  /** Ukládejte šířku zde: jednou po puštění táhla, klávese nebo dvojkliku. */
  onSizeCommit?: (size: number) => void;
  /** Velikost při dvojkliku na táhlo. */
  defaultSize?: number;
  /** Vysvětlení blokovaného přesunu při rozepsaném obsahu. */
  blockedReason?: string;
  /** Zobrazený stav připnutí k záznamu. */
  pinned?: boolean;
  /** Žádost o změnu připnutí. */
  onPinnedChange?: (pinned: boolean) => void;
  /** @deprecated Od 2.123.0 použijte size; wide odpovídá 50 %. */
  width?: "default" | "wide";
  /** @deprecated Od 2.123.0 použijte onSizeChange. */
  onWidthChange?: (width: "default" | "wide") => void;
  /** Volitelné otevření v sousedním okně. */
  onOpenInAdjacentPane?: () => void;
}
/** Panel odsunující hlavní obsah, v úzkém prostředí místní překryv. */
export const RecordSidePanel = forwardRef<HTMLDivElement, RecordSidePanelProps>(
  function RecordSidePanel(
    {
      open,
      onOpenChange,
      activeTab,
      onActiveTabChange,
      tabs,
      header,
      size,
      onSizeChange,
      onSizeCommit,
      defaultSize,
      blockedReason,
      pinned = false,
      onPinnedChange,
      width = "default",
      onWidthChange,
      onOpenInAdjacentPane,
      children,
      className,
      ...props
    },
    ref,
  ) {
    const host = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLElement>(null);
    const [narrow, setNarrow] = useState(false);
    const titleId = useId();
    const [bounds, setBounds] = useState({ min: 320, max: 960 });
    const [baseSize, setBaseSize] = useState(384);
    const t = useDsTexts().recordPanel;
    useEffect(() => {
      const element = host.current;
      if (!element) return;
      const measure = () => {
        setNarrow(element.clientWidth < 640);
        const font = parseFloat(getComputedStyle(element).fontSize) || 16;
        setBounds(panelSizeBounds(element.clientWidth, font));
        setBaseSize(24 * font);
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }, []);
    const resolvedSize = clampPanelSize(size ?? defaultSize ?? baseSize, bounds.min, bounds.max);
    const focus = useRecordPanelFocus(panel, open, narrow, () => onOpenChange(false));
    const action = (label: string, Icon: LucideIcon, onClick: () => void, pressed?: boolean) => (
      <Tooltip key={label}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            aria-pressed={pressed}
            className="h-[var(--control-h)] w-[var(--control-h)] shrink-0"
            onClick={onClick}
          >
            <Icon className="size-4" aria-hidden="true" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    );
    return (
      <div ref={ref} {...props} className={cn("h-full min-h-0 min-w-0", className)}>
        <div
          ref={host}
          className="relative flex h-full min-h-0 min-w-0 items-stretch"
          data-slot="record-panel-layout"
          data-overlay={(narrow && open) || undefined}
        >
          <div
            className="min-h-0 min-w-0 flex-1 overflow-auto"
            inert={narrow && open ? true : undefined}
          >
            {children}
          </div>
          {open ? (
            <>
              {narrow ? (
                <div
                  className="absolute inset-0 z-30 bg-foreground/40"
                  aria-hidden="true"
                  onPointerDown={() => onOpenChange(false)}
                />
              ) : null}
              <aside
                ref={panel}
                role={narrow ? "dialog" : "region"}
                aria-modal={narrow || undefined}
                aria-labelledby={header ? titleId : undefined}
                aria-label={header ? undefined : t.panel}
                tabIndex={-1}
                onKeyDown={focus}
                data-slot="record-side-panel"
                data-width={width}
                style={
                  !narrow && (size !== undefined || onSizeChange)
                    ? { width: resolvedSize }
                    : undefined
                }
                className={cn(
                  "relative flex min-w-0 flex-col border-l border-border bg-card outline-none",
                  narrow
                    ? "absolute inset-y-0 right-0 z-40 w-full max-w-[var(--record-panel-width)] shadow-panel"
                    : size !== undefined || onSizeChange
                      ? "shrink-0"
                      : width === "wide"
                        ? "w-[var(--record-panel-wide)] shrink-0"
                        : "w-[var(--record-panel-width)] max-w-[50%] shrink-0",
                )}
              >
                {onSizeChange && !narrow ? (
                  <PanelResize
                    host={host}
                    size={resolvedSize}
                    defaultSize={defaultSize ?? baseSize}
                    min={bounds.min}
                    max={bounds.max}
                    onSizeChange={onSizeChange}
                    onSizeCommit={onSizeCommit}
                  />
                ) : null}
                <Tabs
                  value={activeTab}
                  onValueChange={onActiveTabChange}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <div className="sticky top-0 z-10 flex flex-col border-b bg-card">
                    <div className="flex min-w-0 items-center gap-1 p-2">
                      {header ? (
                        <h2
                          id={titleId}
                          className="min-w-0 flex-1 truncate text-sm font-semibold"
                          title={typeof header === "string" ? header : undefined}
                        >
                          {header}
                        </h2>
                      ) : (
                        <PanelTabs tabs={tabs} />
                      )}
                      <div className="flex shrink-0 items-center">
                        {onPinnedChange
                          ? action(
                              pinned ? t.unpin : t.pin,
                              pinned ? PinOff : Pin,
                              () => onPinnedChange(!pinned),
                              pinned,
                            )
                          : null}
                        {onWidthChange
                          ? action(
                              width === "wide" ? t.narrow : t.widen,
                              width === "wide" ? Minimize2 : Maximize2,
                              () => onWidthChange(width === "wide" ? "default" : "wide"),
                            )
                          : null}
                        {onOpenInAdjacentPane ? (
                          <DisabledReasonTooltip
                            blocked={Boolean(blockedReason)}
                            content={blockedReason ?? t.adjacent}
                          >
                            {action(t.adjacent, ArrowLeftRight, () => {
                              if (!blockedReason) onOpenInAdjacentPane();
                            })}
                          </DisabledReasonTooltip>
                        ) : null}
                        {action(t.close, X, () => onOpenChange(false))}
                      </div>
                    </div>
                    {header ? <PanelTabs tabs={tabs} /> : null}
                  </div>
                  {tabs.map((tab) => (
                    <TabsContent
                      key={tab.id}
                      value={tab.id}
                      className="flex min-h-0 flex-1 flex-col overflow-auto p-3"
                    >
                      {tab.content}
                    </TabsContent>
                  ))}
                </Tabs>
              </aside>
            </>
          ) : null}
        </div>
      </div>
    );
  },
);

/** Ikonová navigace bez zalamování a se skutečným přístupným názvem. */
function PanelTabs({ tabs }: { tabs: readonly RecordSidePanelTab[] }) {
  return (
    <TabsList className="h-[var(--control-h)] min-w-0 flex-1 justify-start gap-1 overflow-x-auto rounded-none bg-muted p-1">
      {tabs.map(({ id, label, icon: Icon, count }) => {
        const name = count && count > 0 ? `${label}: ${fmtAmount(count, 0)}` : label;
        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <TabsTrigger
                value={id}
                aria-label={name}
                className="h-full shrink-0 gap-1 whitespace-nowrap px-2"
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {count && count > 0 ? (
                  <span className="text-xs tabular-nums">{fmtAmount(count, 0)}</span>
                ) : null}
              </TabsTrigger>
            </TooltipTrigger>
            <TooltipContent>{name}</TooltipContent>
          </Tooltip>
        );
      })}
    </TabsList>
  );
}
