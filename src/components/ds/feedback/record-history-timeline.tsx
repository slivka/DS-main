/**
 * Časová osa historie záznamu · vlastní režim, filtr typů a seskupení po dnech
 * · nesmí nic načítat ani zobrazovat surová data (jen zmapované události z props).
 */
import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { useDsTexts } from "../../../ds-texts";
import { formatUserDate, formatUserTime } from "../../../lib/date-time-preferences";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { StatusBadge } from "../data-display/status-badge";
import { TruncatedText } from "../data-display/truncated-text";
import { List, ListTree, Filter } from "lucide-react";
import { RecordPanelToolbar } from "../layout/record-panel-toolbar";
import { PanelToolButton } from "../layout/record-panel-tools";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuItem } from "../../ui/dropdown-menu";
import { HistoryEventDetail } from "./record-history-detail";
import { HISTORY_KINDS, countHistoryChanges, groupHistoryByDay, type HistoryEvent, type HistoryKind, type HistoryMode } from "./record-history-model";

export type {
  HistoryChange,
  HistoryDayGroup,
  HistoryEvent,
  HistoryKind,
  HistoryLineChange,
  HistoryMode,
  HistoryStatusChange,
} from "./record-history-model";
export { HistoryChangeTable, HistoryEventDetail } from "./record-history-detail";

/** Vlastnosti časové osy historie. */
export interface RecordHistoryTimelineProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  /** Zmapované události (české/slovenské popisky a hodnoty dodává aplikace). */
  events: HistoryEvent[];
  /** Režim zobrazení. */
  mode: HistoryMode;
  /** Změna režimu. */
  onModeChange: (mode: HistoryMode) => void;
  /** @deprecated Od 2.123.0 použijte hiddenKinds; prázdné = vše. */
  filter?: HistoryKind[];
  /** @deprecated Od 2.123.0 použijte onHiddenKindsChange. */
  onFilterChange?: (filter: HistoryKind[]) => void;
  /** Skryté typy; prázdné = vše. Má přednost před filter. */
  hiddenKinds?: HistoryKind[];
  /** Změna skrytých typů. */
  onHiddenKindsChange?: (kinds: HistoryKind[]) => void;
  /** Probíhá načítání v aplikaci. */
  loading?: boolean;
  /** Text prázdné historie. */
  emptyText?: string;
  /** Okamžik „teď“ pro skupiny Dnes/Včera (testy, náhledy). */
  now?: Date;
}

function EventItem({ event, mode }: { event: HistoryEvent; mode: HistoryMode }) {
  const texts = useDsTexts().recordHistory;
  const count = countHistoryChanges(event);
  const status = event.statusChange;
  return (
    <li className="min-w-0 border-l-2 border-border py-1 pl-3" data-history-kind={event.kind}>
      <div className="flex min-w-0 items-center gap-2">
        <TruncatedText
          text={event.title}
          className={cn("min-w-0 text-sm", status ? "font-semibold" : "font-medium")}
        />
        {status ? (
          <StatusBadge
            className="shrink-0"
            status="to"
            config={{ to: { label: status.to, tone: status.tone } }}
          />
        ) : null}
      </div>
      <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
        <span className="min-w-0 truncate">{event.author || texts.system}</span>
        <span className="shrink-0 tabular-nums">{formatUserTime(event.at)}</span>
        {mode === "basic" && count > 0 ? (
          <span className="shrink-0" data-testid="history-count">
            · {texts.changesCount(count)}
          </span>
        ) : null}
      </div>
      {mode === "detailed" ? <HistoryEventDetail event={event} /> : null}
    </li>
  );
}

/**
 * Historie záznamu jako časová osa; funguje i jako obsah záložky RecordSidePanel.
 * Komponenta nic nenačítá – stav režimu a filtru řídí aplikace.
 */
export const RecordHistoryTimeline = forwardRef<HTMLDivElement, RecordHistoryTimelineProps>(
  function RecordHistoryTimeline(
    {
      events,
      mode,
      onModeChange,
      filter = [],
      hiddenKinds,
      onHiddenKindsChange,
      onFilterChange,
      loading,
      emptyText,
      now,
      className,
      ...props
    },
    ref,
  ) {
    const texts = useDsTexts().recordHistory;
    const hidden =
      hiddenKinds ?? (filter.length ? HISTORY_KINDS.filter((kind) => !filter.includes(kind)) : []);
    const visible = events.filter((event) => !hidden.includes(event.kind));
    const groups = groupHistoryByDay(visible, now);
    const changeHidden = (next: HistoryKind[]) => {
      if (onHiddenKindsChange) onHiddenKindsChange(next);
      else
        onFilterChange?.(next.length ? HISTORY_KINDS.filter((kind) => !next.includes(kind)) : []);
    };
    const message = loading
      ? texts.loading
      : !events.length
        ? (emptyText ?? texts.empty)
        : !visible.length
          ? texts.emptyFiltered
          : null;
    return (
      <div ref={ref} className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
        <RecordPanelToolbar
          start={
            <>
              <PanelToolButton
                label={texts.basic}
                icon={List}
                aria-pressed={mode === "basic"}
                onClick={() => onModeChange("basic")}
              />
              <PanelToolButton
                label={texts.detailed}
                icon={ListTree}
                aria-pressed={mode === "detailed"}
                onClick={() => onModeChange("detailed")}
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PanelToolButton
                    label={texts.filterLabel}
                    icon={Filter}
                    className={hidden.length ? "text-filter-active" : undefined}
                  >
                    {hidden.length ? (
                      <span className="text-xs tabular-nums">
                        {HISTORY_KINDS.length - hidden.length}/{HISTORY_KINDS.length}
                      </span>
                    ) : null}
                  </PanelToolButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {HISTORY_KINDS.map((kind) => (
                    <DropdownMenuCheckboxItem
                      key={kind}
                      checked={!hidden.includes(kind)}
                      onCheckedChange={(checked) =>
                        changeHidden(
                          checked ? hidden.filter((item) => item !== kind) : [...hidden, kind],
                        )
                      }
                    >
                      {texts.kinds[kind]}
                    </DropdownMenuCheckboxItem>
                  ))}
                  <DropdownMenuItem onSelect={() => changeHidden([])}>
                    {texts.showAll}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />
        {message ? (
          <p
            role="status"
            aria-busy={loading || undefined}
            className="text-sm text-muted-foreground"
          >
            {message}
            {!loading && events.length > 0 && !visible.length ? (
              <Button type="button" variant="link" onClick={() => changeHidden([])}>
                {texts.showAll}
              </Button>
            ) : null}
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.day} className="min-w-0" data-history-day={group.day}>
              <h3 className="mb-1 truncate text-xs font-semibold uppercase text-muted-foreground">
                {group.relative === "today"
                  ? texts.today
                  : group.relative === "yesterday"
                    ? texts.yesterday
                    : formatUserDate(group.day)}
              </h3>
              <ol className="space-y-1">
                {group.events.map((event) => (
                  <EventItem key={event.id} event={event} mode={mode} />
                ))}
              </ol>
            </section>
          ))
        )}
      </div>
    );
  },
);
