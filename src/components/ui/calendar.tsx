"use client";

import * as React from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames, dateMatchModifiers } from "react-day-picker";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "./button";
import { CalendarViews } from "./calendar-views";
import { calendarEscapeEvent } from "./calendar-escape";
import { useDsTexts } from "../../ds-texts";

// Stabilní typy podkomponent: vnořené definice by při každém vykreslení remountovaly
// celý DayPicker a fokus šipky měsíce by spadl na body.
const CalendarCaptionContext = React.createContext<{
  locale: string;
  open: (date: Date) => void;
} | null>(null);
type DayPickerComponents = NonNullable<React.ComponentProps<typeof DayPicker>["components"]>;
const CalendarRoot: NonNullable<DayPickerComponents["Root"]> = ({
  className,
  rootRef,
  ...props
}) => <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
const CalendarChevron: NonNullable<DayPickerComponents["Chevron"]> = ({
  className,
  orientation,
  ...props
}) => {
  if (orientation === "left")
    return <ChevronLeftIcon className={cn("size-4", className)} {...props} />;
  if (orientation === "right")
    return <ChevronRightIcon className={cn("size-4", className)} {...props} />;
  return <ChevronDownIcon className={cn("size-4", className)} {...props} />;
};
const CalendarMonthCaption: NonNullable<DayPickerComponents["MonthCaption"]> = ({
  calendarMonth,
}) => {
  const context = React.useContext(CalendarCaptionContext);
  const caption = new Intl.DateTimeFormat(context?.locale, {
    month: "long",
    year: "numeric",
  }).format(calendarMonth.date);
  return (
    <div className="flex h-(--cell-size) items-center justify-center px-(--cell-size)">
      <Button
        variant="ghost"
        size="control"
        className="capitalize font-semibold text-base"
        onClick={() => context?.open(calendarMonth.date)}
      >
        {caption}
        <ChevronDownIcon />
      </Button>
    </div>
  );
};
const CalendarWeekNumber: NonNullable<DayPickerComponents["WeekNumber"]> = ({
  children,
  ...props
}) => (
  <td {...props}>
    <div className="flex size-(--cell-size) items-center justify-center text-center">
      {children}
    </div>
  </td>
);

/** Vlastnosti společné navigace kalendáře. */
export interface CalendarNavigationProps {
  /** @deprecated 2.110.0 – bez účinku; hlavička používá pohledy měsíců a let. Odstranění v 3.0.0. */
  captionLayout?: React.ComponentProps<typeof DayPicker>["captionLayout"];
  /** Počáteční pohled, například výběr měsíce. */
  initialView?: "days" | "months" | "years";
  /** Samostatný výběr měsíce bez výběru dne. */
  onMonthSelect?: (month: Date) => void;
  /** Základ výchozího měsíce. */
  baseDate?: Date;
  /** Dolní mez výběru. */
  minDate?: Date;
  /** Horní mez výběru. */
  maxDate?: Date;
  /** Výběr dneška; poskytuje hostitel se správným režimem single/range. */
  onToday?: (date: Date) => void;
  /** Zavření kalendáře klávesou Escape. */
  onClose?: () => void;
  /** Rychlé volby ve společné patičce. */
  footerActions?: React.ReactNode;
}
/** Společný kalendář se stabilními pohledy dnů, měsíců a let. */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout: _captionLayout,
  initialView = "days",
  onMonthSelect,
  baseDate,
  minDate,
  maxDate,
  onToday,
  onClose,
  footerActions,
  buttonVariant = "ghost",
  formatters,
  components,
  locale,
  ...props
}: React.ComponentProps<typeof DayPicker> &
  CalendarNavigationProps & {
    buttonVariant?: React.ComponentProps<typeof Button>["variant"];
  }) {
  void _captionLayout;
  const defaultClassNames = getDefaultClassNames();
  const dsTexts = useDsTexts();
  const today = props.today ?? new Date();
  const selection = "selected" in props ? props.selected : undefined;
  const selected =
    selection instanceof Date
      ? selection
      : Array.isArray(selection)
        ? selection[0]
        : selection?.from;
  const [ownMonth, setOwnMonth] = React.useState(
    props.month ?? props.defaultMonth ?? selected ?? baseDate ?? maxDate ?? today,
  );
  const month = props.month ?? ownMonth;
  const [view, setView] = React.useState<"days" | "months" | "years">(initialView);
  const [focusView, setFocusView] = React.useState(Boolean(props.autoFocus ?? props.initialFocus));
  const changeView = (next: "days" | "months" | "years") => {
    setFocusView(true);
    setView(next);
  };
  const shell = React.useRef<HTMLDivElement>(null);
  const boundsStart = minDate ?? props.startMonth;
  const boundsEnd = maxDate ?? props.endMonth;
  const allowed = (from: Date, to: Date) =>
    !(boundsStart && to < boundsStart) && !(boundsEnd && from > boundsEnd);
  const changeMonth = (next: Date) => {
    setOwnMonth(next);
    props.onMonthChange?.(next);
  };
  const todayAllowed =
    allowed(today, today) && (!props.disabled || !dateMatchModifiers(today, props.disabled));
  React.useEffect(() => {
    if (view !== "days" || !focusView) return;
    const buttons = Array.from(
      shell.current?.querySelectorAll<HTMLButtonElement>(
        'button[data-day]:not(:disabled):not([data-outside="true"])',
      ) ?? [],
    );
    (
      buttons.find((button) => button.dataset.selectedSingle === "true") ??
      buttons.find((button) => button.dataset.today === "true") ??
      buttons[0]
    )?.focus();
    // Listování šipkami fokus nepřesouvá; jen otevření a návrat do dnů.
  }, [view, focusView]);
  const escapeView = React.useCallback(() => {
    if (onMonthSelect || view === "days") onClose?.();
    else {
      setFocusView(true);
      setView(view === "years" ? "months" : "days");
    }
  }, [onMonthSelect, onClose, view]);
  React.useEffect(() => {
    const element = shell.current;
    element?.addEventListener(calendarEscapeEvent, escapeView);
    return () => element?.removeEventListener(calendarEscapeEvent, escapeView);
  }, [escapeView]);
  return (
    <div
      ref={shell}
      data-slot="calendar-shell"
      data-view={view}
      className={cn("calendar-shell", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          escapeView();
        }
      }}
    >
      <div className="calendar-body">
        {view !== "days" ? (
          <CalendarViews
            view={view}
            month={month}
            selected={selected}
            today={today}
            autoFocus={focusView}
            isAllowed={allowed}
            onMonth={changeMonth}
            onMonthSelect={onMonthSelect}
            onView={(next) => {
              if (!(next === "days" && onMonthSelect)) changeView(next);
            }}
          />
        ) : null}
        {view === "days" ? (
          <div>
            <CalendarCaptionContext.Provider
              value={{
                locale: dsTexts.intlLocale,
                open: (date) => {
                  changeMonth(date);
                  changeView("months");
                },
              }}
            >
              <DayPicker
                locale={locale ?? dsTexts.dateLocale}
                showOutsideDays={showOutsideDays}
                className={cn(
                  "bg-background group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
                  String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
                  String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
                )}
                captionLayout="label"
                fixedWeeks
                formatters={{
                  formatMonthDropdown: (date) =>
                    date.toLocaleString(dsTexts.intlLocale, { month: "short" }),
                  ...formatters,
                }}
                classNames={{
                  root: cn("w-fit", defaultClassNames.root),
                  months: cn("relative flex flex-col gap-4 md:flex-row", defaultClassNames.months),
                  month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
                  nav: cn(
                    "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
                    defaultClassNames.nav,
                  ),
                  button_previous: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
                    defaultClassNames.button_previous,
                  ),
                  button_next: cn(
                    buttonVariants({ variant: buttonVariant }),
                    "h-(--cell-size) w-(--cell-size) select-none p-0 aria-disabled:opacity-50",
                    defaultClassNames.button_next,
                  ),
                  month_caption: cn(
                    "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)",
                    defaultClassNames.month_caption,
                  ),
                  dropdowns: cn(
                    "flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium",
                    defaultClassNames.dropdowns,
                  ),
                  dropdown_root: cn(
                    "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
                    defaultClassNames.dropdown_root,
                  ),
                  dropdown: cn("bg-popover absolute inset-0 opacity-0", defaultClassNames.dropdown),
                  caption_label: cn(
                    "select-none font-medium",
                    "text-sm",
                    defaultClassNames.caption_label,
                  ),
                  table: "w-full border-collapse",
                  weekdays: cn("flex", defaultClassNames.weekdays),
                  weekday: cn(
                    "text-muted-foreground flex-1 select-none rounded-md text-[0.8rem] font-normal",
                    defaultClassNames.weekday,
                  ),
                  week: cn("mt-2 flex w-full", defaultClassNames.week),
                  week_number_header: cn(
                    "w-(--cell-size) select-none",
                    defaultClassNames.week_number_header,
                  ),
                  week_number: cn(
                    "text-muted-foreground select-none text-[0.8rem]",
                    defaultClassNames.week_number,
                  ),
                  day: cn(
                    "group/day relative aspect-square h-full w-full select-none p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md",
                    defaultClassNames.day,
                  ),
                  range_start: cn("bg-accent rounded-l-md", defaultClassNames.range_start),
                  range_middle: cn("rounded-none", defaultClassNames.range_middle),
                  range_end: cn("bg-accent rounded-r-md", defaultClassNames.range_end),
                  today: cn("rounded-md", defaultClassNames.today),
                  outside: cn(
                    "text-muted-foreground aria-selected:text-muted-foreground",
                    defaultClassNames.outside,
                  ),
                  disabled: cn("text-muted-foreground opacity-50", defaultClassNames.disabled),
                  hidden: cn("invisible", defaultClassNames.hidden),
                  ...classNames,
                }}
                components={{
                  Root: CalendarRoot,
                  Chevron: CalendarChevron,
                  MonthCaption: CalendarMonthCaption,
                  DayButton: CalendarDayButton,
                  WeekNumber: CalendarWeekNumber,
                  ...components,
                }}
                {...props}
                // Fokus řídí efekt výše; DayPicker by jej při listování přesouval do mřížky.
                autoFocus={false}
                initialFocus={false}
                month={month}
                onMonthChange={changeMonth}
                startMonth={boundsStart}
                endMonth={boundsEnd}
                disabled={[
                  ...(Array.isArray(props.disabled)
                    ? props.disabled
                    : props.disabled != null
                      ? [props.disabled]
                      : []),
                  ...(minDate ? [{ before: minDate }] : []),
                  ...(maxDate ? [{ after: maxDate }] : []),
                ]}
              />
            </CalendarCaptionContext.Provider>
          </div>
        ) : null}
      </div>
      {onToday || footerActions ? (
        <div className="calendar-footer grid grid-cols-[1fr_auto_1fr] items-center gap-1 border-t p-2">
          <span />
          {onToday && todayAllowed ? (
            <Button
              variant="outline"
              size="sm"
              className="text-primary font-semibold"
              onClick={() => onToday(today)}
            >
              {dsTexts.date.today}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex justify-end gap-1">{footerActions}</div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-today={modifiers.today || undefined}
      data-outside={modifiers.outside || undefined}
      data-day={`${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, "0")}-${String(day.date.getDate()).padStart(2, "0")}`}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "border border-transparent data-[today=true]:border-primary data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground flex aspect-square h-auto w-full min-w-(--cell-size) flex-col gap-1 font-normal leading-none data-[range-end=true]:rounded-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
