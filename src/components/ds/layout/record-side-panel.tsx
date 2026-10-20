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
  header: ReactNode;
  /** Zobrazený stav připnutí k záznamu. */
  pinned?: boolean;
  /** Žádost o změnu připnutí. */
  onPinnedChange?: (pinned: boolean) => void;
  /** Šířka panelu. */
  width?: "default" | "wide";
  /** Žádost o změnu šířky. */
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
    const t = useDsTexts().recordPanel;
    useEffect(() => {
      const element = host.current;
      if (!element) return;
      const measure = () => setNarrow(element.getBoundingClientRect().width < 640);
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(element);
      return () => observer.disconnect();
    }, []);
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
      <div ref={ref} {...props} className={cn("min-w-0", className)}>
        <div
          ref={host}
          className="relative flex min-w-0 items-stretch"
          data-slot="record-panel-layout"
          data-overlay={(narrow && open) || undefined}
        >
          <div className="min-w-0 flex-1" inert={narrow && open ? true : undefined}>
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
                aria-labelledby={titleId}
                tabIndex={-1}
                onKeyDown={focus}
                data-slot="record-side-panel"
                data-width={width}
                className={cn(
                  "flex min-w-0 flex-col border-l border-border bg-card outline-none",
                  narrow
                    ? "absolute inset-y-0 right-0 z-40 w-full max-w-[var(--record-panel-width)] shadow-panel"
                    : width === "wide"
                      ? "w-[var(--record-panel-wide)] shrink-0"
                      : "w-[var(--record-panel-width)] max-w-[50%] shrink-0",
                )}
              >
                <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-card p-2">
                  <h2
                    id={titleId}
                    className="min-w-0 flex-1 truncate text-sm font-semibold"
                    title={typeof header === "string" ? header : undefined}
                  >
                    {header}
                  </h2>
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
                    {onOpenInAdjacentPane
                      ? action(t.adjacent, ArrowLeftRight, onOpenInAdjacentPane)
                      : null}
                    {action(t.close, X, () => onOpenChange(false))}
                  </div>
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={onActiveTabChange}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-muted p-1">
                    {tabs.map(({ id, label, icon: Icon, count }) => (
                      <TabsTrigger
                        key={id}
                        value={id}
                        className="shrink-0 gap-1 whitespace-nowrap"
                        title={label}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        {label}
                        {count ? (
                          <span className="text-xs tabular-nums">{fmtAmount(count, 0)}</span>
                        ) : null}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {tabs.map((tab) => (
                    <TabsContent
                      key={tab.id}
                      value={tab.id}
                      className="min-h-0 flex-1 overflow-auto p-3"
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
