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
import { GridSegmentedToggle } from "../grid/grid-segmented-toggle";
import { HistoryEventDetail } from "./record-history-detail";
import {
  HISTORY_KINDS,
  countHistoryChanges,
  filterHistory,
  groupHistoryByDay,
  type HistoryEvent,
  type HistoryKind,
  type HistoryMode,
} from "./record-history-model";

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
  /** Vybrané typy; prázdné pole = vše. */
  filter: HistoryKind[];
  /** Změna filtru typů. */
  onFilterChange: (filter: HistoryKind[]) => void;
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
      filter,
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
    const visible = filterHistory(events, filter);
    const groups = groupHistoryByDay(visible, now);
    const toggle = (kind: HistoryKind) =>
      onFilterChange(filter.includes(kind) ? filter.filter((k) => k !== kind) : [...filter, kind]);
    const message = loading
      ? texts.loading
      : !events.length
        ? (emptyText ?? texts.empty)
        : !visible.length
          ? texts.emptyFiltered
          : null;
    return (
      <div ref={ref} className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <GridSegmentedToggle
            ariaLabel={texts.modeLabel}
            value={mode}
            defaultValue="basic"
            onChange={(next) => onModeChange(next as HistoryMode)}
            options={[
              { value: "basic", label: texts.basic },
              { value: "detailed", label: texts.detailed },
            ]}
          />
          <div
            role="group"
            aria-label={texts.filterLabel}
            className="grid-segmented grid-toolbar-control inline-flex max-w-full overflow-x-auto border border-grid-chrome bg-card p-0"
          >
            {HISTORY_KINDS.map((kind, index) => {
              const pressed = filter.includes(kind);
              return (
                <Button
                  key={kind}
                  type="button"
                  variant="ghost"
                  aria-pressed={pressed}
                  onClick={() => toggle(kind)}
                  className={cn(
                    "h-full min-h-0 shrink-0 rounded-none border-0 px-[0.7em] text-[1em] font-normal shadow-none focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    index > 0 && "border-l border-l-grid-chrome",
                    pressed && "bg-filter-active/15 font-semibold text-filter-active",
                  )}
                >
                  {texts.kinds[kind]}
                </Button>
              );
            })}
          </div>
        </div>
        {message ? (
          <p
            role="status"
            aria-busy={loading || undefined}
            className="text-sm text-muted-foreground"
          >
            {message}
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
