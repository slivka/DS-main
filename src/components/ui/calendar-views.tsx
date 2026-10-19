/** Pohled měsíců a let · vlastní navigaci mřížky · nesmí měnit vybrané datum. */
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { useDsTexts } from "../../ds-texts";

/** Vlastnosti vnitřního pohledu kalendáře. */
export interface CalendarViewsProps {
  view: "months" | "years";
  month: Date;
  selected?: Date;
  today: Date;
  isAllowed: (from: Date, to: Date) => boolean;
  onMonth: (month: Date) => void;
  /** Výběr konkrétního měsíce. */
  onMonthSelect?: (month: Date) => void;
  onView: (view: "days" | "months" | "years") => void;
}
/** Celá jména měsíců v prvním pádě. */
export function calendarMonthNames(locale: string) {
  return Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { month: "long" }).format(new Date(2026, i, 1)),
  );
}
/** Mřížka zachovává fokus a vrací se vždy o jedinou úroveň. */
export function CalendarViews({
  view,
  month,
  selected,
  today,
  isAllowed,
  onMonth,
  onMonthSelect,
  onView,
}: CalendarViewsProps) {
  const ds = useDsTexts();
  const ref = useRef<HTMLDivElement>(null);
  const year = month.getFullYear();
  const start = Math.floor(year / 12) * 12;
  const names = calendarMonthNames(ds.intlLocale);
  useEffect(() => {
    const target =
      ref.current?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:not(:disabled)') ??
      ref.current?.querySelector<HTMLButtonElement>("button:not(:disabled)");
    target?.focus();
  }, [view, year]);
  const move = (direction: number) =>
    onMonth(new Date(year + direction * (view === "years" ? 12 : 1), month.getMonth(), 1));
  return (
    <div className="calendar-alternate p-3">
      <div className="flex h-8 items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label={ds.date.previous}
          onClick={() => move(-1)}
          disabled={
            !isAllowed(
              new Date(view === "years" ? start - 12 : year - 1, 0, 1),
              new Date(view === "years" ? start - 1 : year - 1, 11, 31),
            )
          }
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="ghost"
          size="control"
          onClick={() => onView("years")}
          disabled={view === "years"}
        >
          {view === "years" ? `${start} – ${start + 11}` : year}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ds.date.next}
          onClick={() => move(1)}
          disabled={
            !isAllowed(
              new Date(view === "years" ? start + 12 : year + 1, 0, 1),
              new Date(view === "years" ? start + 23 : year + 1, 11, 31),
            )
          }
        >
          <ChevronRight />
        </Button>
      </div>
      <div
        ref={ref}
        role="grid"
        aria-label={view === "months" ? ds.date.month : ds.date.year}
        className="calendar-view-grid grid grid-cols-3 gap-2"
        onKeyDown={(event) => {
          const buttons = Array.from(
            ref.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
          );
          const index = buttons.indexOf(event.target as HTMLButtonElement);
          const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[event.key];
          if (step != null) {
            event.preventDefault();
            let next = index + step;
            while (next >= 0 && next < buttons.length && buttons[next]?.disabled) next += step;
            buttons[next]?.focus();
          }
        }}
      >
        {Array.from({ length: 12 }, (_, i) => {
          const y = view === "years" ? start + i : year;
          const m = view === "months" ? i : 0;
          const chosen =
            selected?.getFullYear() === y && (view === "years" || selected.getMonth() === m);
          const current = today.getFullYear() === y && (view === "years" || today.getMonth() === m);
          return (
            <Button
              key={i}
              variant={chosen ? "default" : "ghost"}
              size="control"
              aria-pressed={chosen || false}
              data-today={current || undefined}
              disabled={
                !isAllowed(new Date(y, m, 1), new Date(y, view === "years" ? 12 : m + 1, 0))
              }
              className={cn("h-full px-1 text-sm", current && "border border-primary")}
              onClick={() => {
                const next = new Date(y, view === "years" ? month.getMonth() : m, 1);
                onMonth(next);
                if (view === "months") onMonthSelect?.(next);
                onView(view === "years" ? "months" : "days");
              }}
            >
              {view === "months" ? names[i] : y}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
