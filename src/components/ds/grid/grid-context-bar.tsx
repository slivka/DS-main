import * as React from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { DateRangeField } from "../form/date-range-field";
import type { BookOption } from "../accounting/book-select";
import { GridToolbarSeparator } from "./grid-toolbar";
import {
  gridPeriodLabel,
  gridPeriodRange,
  moveGridPeriod,
  type GridPeriodKind,
  type GridPeriodValue,
} from "./grid-period";
import { gridFontSize, useGridZoomContext, type GridDensity } from "./grid-zoom";

export interface GridPeriodTexts {
  all: string;
  month: string;
  quarter: string;
  half: string;
  ytd: string;
  custom: string;
  thisMonth: string;
  previousMonth: string;
  thisQuarter: string;
  previous: string;
  next: string;
  clear: string;
}
export const DEFAULT_GRID_PERIOD_TEXTS: GridPeriodTexts = {
  all: "Celé období",
  month: "Měsíc",
  quarter: "Čtvrtletí",
  half: "Pololetí",
  ytd: "Od začátku roku do dnes",
  custom: "Vlastní",
  thisMonth: "Tento měsíc",
  previousMonth: "Minulý měsíc",
  thisQuarter: "Toto čtvrtletí",
  previous: "Předchozí období",
  next: "Následující období",
  clear: "Celé období",
};
export interface GridPeriodConfig {
  fiscalFrom: string;
  fiscalTo: string;
  value: GridPeriodValue;
  onChange: (value: GridPeriodValue) => void;
  texts?: Partial<GridPeriodTexts>;
  today?: string;
  controlId?: string;
  ariaLabelledBy?: string;
}
export interface GridBookDisplayConfig {
  books: BookOption[];
  value: string | "all";
  onChange?: (value: string | "all") => void;
  allowAll?: boolean;
  allBooksLabel?: string;
  readOnly?: boolean;
  controlId?: string;
  ariaLabelledBy?: string;
}
export interface GridBookConfig<Row = unknown> extends GridBookDisplayConfig {
  getRowBookId?: (row: Row) => string | null | undefined;
}
export interface GridContextBarProps extends React.ComponentPropsWithoutRef<"div"> {
  period?: GridPeriodConfig;
  book?: GridBookDisplayConfig;
  /** Volitelný obsah na pravém okraji, typicky další kontextový filtr. */
  contextRight?: React.ReactNode;
  texts?: Partial<GridContextBarTexts>;
  /** Měřítko řádku; bez zadání se převezme z nejbližšího GridZoomContext. */
  zoom?: number;
  /** Hustota řádku; bez zadání se převezme z nejbližšího GridZoomContext. */
  density?: GridDensity;
}

export interface GridContextBarTexts {
  bookLabel: string;
  periodLabel: string;
}

export const DEFAULT_GRID_CONTEXT_BAR_TEXTS: GridContextBarTexts = {
  bookLabel: "Kniha:",
  periodLabel: "Období:",
};

const parse = (value: string) => new Date(`${value}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);
const monthIndex = (fiscalFrom: string, date: Date) =>
  (date.getUTCFullYear() - parse(fiscalFrom).getUTCFullYear()) * 12 +
  date.getUTCMonth() -
  parse(fiscalFrom).getUTCMonth();

export function GridPeriodFilter({
  fiscalFrom,
  fiscalTo,
  value,
  onChange,
  texts,
  today = iso(new Date()),
  controlId,
  ariaLabelledBy,
}: GridPeriodConfig) {
  const t = { ...DEFAULT_GRID_PERIOD_TEXTS, ...texts };
  const [open, setOpen] = React.useState(false);
  const movable = value.kind === "month" || value.kind === "quarter" || value.kind === "half";
  const start = parse(fiscalFrom);
  const end = parse(fiscalTo);
  const fiscalMonths =
    (end.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    end.getUTCMonth() -
    start.getUTCMonth() +
    1;
  const span =
    value.kind === "month"
      ? 1
      : value.kind === "quarter"
        ? 3
        : value.kind === "half"
          ? 6
          : fiscalMonths;
  const maxIndex = Math.max(0, Math.ceil(fiscalMonths / span) - 1);
  const setKind = (kind: GridPeriodKind, index = 0) => {
    onChange(gridPeriodRange(fiscalFrom, fiscalTo, kind, index, today));
    if (kind !== "custom") setOpen(false);
  };
  const now = parse(today);
  const currentMonth = monthIndex(fiscalFrom, now);
  const previousMonth = currentMonth - 1;
  const currentQuarter = Math.floor(currentMonth / 3);
  const inFiscal = (from: string, to: string) => from >= fiscalFrom && to <= fiscalTo;
  const quick = [
    { label: t.thisMonth, kind: "month" as const, index: currentMonth },
    { label: t.previousMonth, kind: "month" as const, index: previousMonth },
    { label: t.thisQuarter, kind: "quarter" as const, index: currentQuarter },
  ].filter(
    (item) =>
      item.index >= 0 &&
      inFiscal(
        gridPeriodRange(fiscalFrom, fiscalTo, item.kind, item.index).from,
        gridPeriodRange(fiscalFrom, fiscalTo, item.kind, item.index).to,
      ),
  );
  const selectedLabel = gridPeriodLabel(value);
  const shortWidthLabels = [
    t.all,
    ...Array.from({ length: 12 }, (_, index) =>
      gridPeriodLabel(gridPeriodRange(fiscalFrom, fiscalTo, "month", index, today)),
    ),
    ...Array.from({ length: 4 }, (_, index) =>
      gridPeriodLabel(gridPeriodRange(fiscalFrom, fiscalTo, "quarter", index, today)),
    ),
    ...Array.from({ length: 2 }, (_, index) =>
      gridPeriodLabel(gridPeriodRange(fiscalFrom, fiscalTo, "half", index, today)),
    ),
  ];
  const expandsForValue = value.kind === "ytd" || value.kind === "custom";
  const widthLabels = expandsForValue ? [selectedLabel, ...shortWidthLabels] : shortWidthLabels;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="flex min-w-0 items-center gap-1">
        {movable ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="grid-toolbar-icon-control"
                aria-label={t.previous}
                disabled={(value.index ?? 0) <= 0}
                onClick={() => onChange(moveGridPeriod(fiscalFrom, fiscalTo, value, -1))}
              >
                <ChevronLeft className="size-[1.2em]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.previous}</TooltipContent>
          </Tooltip>
        ) : null}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={controlId}
              aria-labelledby={ariaLabelledBy}
              type="button"
              variant="outline"
              title={selectedLabel}
              className={cn(
                "grid-toolbar-control max-w-[12em] justify-between bg-card text-left font-medium @min-[640px]:max-w-[20em]",
                expandsForValue && "w-auto",
                value.kind !== "all" && "grid-toolbar-active",
              )}
            >
              <div className="grid min-w-0 justify-items-start text-left">
                {widthLabels.map((label, index) => (
                  <span
                    key={`${label}-${index}`}
                    aria-hidden={label !== selectedLabel}
                    className={cn(
                      "[grid-area:1/1] max-w-full truncate",
                      label !== selectedLabel && "invisible",
                    )}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <ChevronDown className="size-[1em] shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[22rem] p-3"
            onKeyDown={(event) => {
              if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight"))
                event.stopPropagation();
            }}
          >
            {quick.length ? (
              <div className="mb-3 flex flex-wrap gap-1 border-b pb-3">
                {quick.map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setKind(item.kind, item.index)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            ) : null}
            <div className="grid gap-2">
              <Button
                type="button"
                variant={value.kind === "all" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setKind("all")}
              >
                {t.all}
              </Button>
              <PeriodGrid
                label={t.month}
                count={12}
                active={value.kind === "month" ? value.index : undefined}
                columns={4}
                render={(index) =>
                  new Intl.DateTimeFormat("cs-CZ", { month: "short", timeZone: "UTC" }).format(
                    parse(gridPeriodRange(fiscalFrom, fiscalTo, "month", index).from),
                  )
                }
                onSelect={(index) => setKind("month", index)}
              />
              <PeriodGrid
                label={t.quarter}
                count={4}
                active={value.kind === "quarter" ? value.index : undefined}
                columns={4}
                render={(index) => `Q${index + 1}`}
                onSelect={(index) => setKind("quarter", index)}
              />
              <PeriodGrid
                label={t.half}
                count={2}
                active={value.kind === "half" ? value.index : undefined}
                columns={2}
                render={(index) => `${index + 1}. pololetí`}
                onSelect={(index) => setKind("half", index)}
              />
              <Button
                type="button"
                variant={value.kind === "ytd" ? "secondary" : "ghost"}
                className="justify-start"
                onClick={() => setKind("ytd")}
              >
                {t.ytd}
              </Button>
              <div className="border-t pt-2">
                <div className="mb-2 text-sm font-medium">{t.custom}</div>
                <DateRangeField
                  value={
                    value.kind === "custom"
                      ? { from: value.from, to: value.to }
                      : { from: null, to: null }
                  }
                  onChange={(range) => {
                    if (range.from && range.to)
                      onChange({ kind: "custom", from: range.from, to: range.to });
                  }}
                  minDate={parse(fiscalFrom)}
                  maxDate={parse(fiscalTo)}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {value.kind !== "all" ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="grid-toolbar-icon-control text-filter-active"
                aria-label={t.clear}
                onClick={() => onChange(gridPeriodRange(fiscalFrom, fiscalTo, "all"))}
              >
                <X className="size-[1.2em]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.clear}</TooltipContent>
          </Tooltip>
        ) : null}
        {movable ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="grid-toolbar-icon-control"
                aria-label={t.next}
                disabled={(value.index ?? 0) >= maxIndex}
                onClick={() => onChange(moveGridPeriod(fiscalFrom, fiscalTo, value, 1))}
              >
                <ChevronRight className="size-[1.2em]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.next}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </TooltipProvider>
  );
}

function PeriodGrid({
  label,
  count,
  active,
  columns,
  render,
  onSelect,
}: {
  label: string;
  count: number;
  active?: number;
  columns: 2 | 4;
  render: (index: number) => string;
  onSelect: (index: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 text-sm font-medium">{label}</div>
      <div className={cn("grid gap-1", columns === 4 ? "grid-cols-4" : "grid-cols-2")}>
        {Array.from({ length: count }, (_, index) => (
          <Button
            key={index}
            type="button"
            size="sm"
            variant={active === index ? "secondary" : "ghost"}
            className="justify-center"
            onClick={() => onSelect(index)}
          >
            {render(index)}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function GridBookSelect({
  books,
  value,
  onChange,
  allowAll = true,
  allBooksLabel = "Všechny knihy",
  readOnly = false,
  controlId,
  ariaLabelledBy,
}: GridBookDisplayConfig) {
  const active = books.filter((book) => book.active !== false);
  const selected = active.find((book) => book.id === value);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const textOnly = active.length === 1 || readOnly || !onChange;
  const textBook = active.length === 1 ? active[0] : selected;
  if (textOnly)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <strong
              id={controlId}
              aria-labelledby={ariaLabelledBy}
              className="block max-w-[16em] truncate text-left"
            >
              {value === "all" ? allBooksLabel : (textBook?.name ?? allBooksLabel)}
            </strong>
          </TooltipTrigger>
          {textBook?.code ? <TooltipContent>{textBook.code}</TooltipContent> : null}
        </Tooltip>
      </TooltipProvider>
    );
  const options = active.filter((book) =>
    `${book.name} ${book.code}`.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs")),
  );
  const selectedLabel = value === "all" ? allBooksLabel : (selected?.name ?? allBooksLabel);
  const widthLabels = [allBooksLabel, ...active.map((book) => book.name)];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={controlId}
          aria-labelledby={ariaLabelledBy}
          type="button"
          variant="outline"
          title={selectedLabel}
          className="grid-toolbar-control max-w-[20em] justify-between bg-card text-left font-semibold"
        >
          <div className="grid min-w-0 justify-items-start text-left">
            {widthLabels.map((label, index) => (
              <span
                key={`${label}-${index}`}
                aria-hidden={label !== selectedLabel}
                className={cn("[grid-area:1/1] truncate", label !== selectedLabel && "invisible")}
              >
                {label}
              </span>
            ))}
          </div>
          <ChevronDown className="size-[1em] shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-1">
        <div className="relative mb-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Hledat knihu…"
            className="pl-8"
            autoFocus
          />
        </div>
        {allowAll ? (
          <BookOptionButton
            selected={value === "all"}
            label={allBooksLabel}
            onSelect={() => {
              onChange("all");
              setOpen(false);
            }}
          />
        ) : null}
        {options.map((book) => (
          <BookOptionButton
            key={book.id}
            selected={value === book.id}
            label={`${book.name} (${book.code})`}
            onSelect={() => {
              onChange(book.id);
              setOpen(false);
            }}
          />
        ))}
      </PopoverContent>
    </Popover>
  );
}
function BookOptionButton({
  selected,
  label,
  onSelect,
}: {
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <Button
      type="button"
      role="option"
      aria-selected={selected}
      variant="ghost"
      className="w-full justify-start gap-2 px-2 font-normal"
      onClick={onSelect}
    >
      <span className="size-4">{selected ? <Check className="size-4" /> : null}</span>
      <span className="truncate">{label}</span>
    </Button>
  );
}

export const GridContextBar = React.forwardRef<HTMLDivElement, GridContextBarProps>(
  function GridContextBar(
    { period, book, contextRight, texts, zoom, density, className, style, ...props },
    ref,
  ) {
    const context = useGridZoomContext();
    const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
    const t = { ...DEFAULT_GRID_CONTEXT_BAR_TEXTS, ...texts };
    const bookLabelId = `grid-book-label-${uid}`;
    const bookControlId = `grid-book-control-${uid}`;
    const periodLabelId = `grid-period-label-${uid}`;
    const periodControlId = `grid-period-control-${uid}`;
    const resolvedZoom = zoom ?? context?.zoom ?? 1;
    const resolvedDensity = density ?? context?.density ?? "normal";
    if (!period && !book && !contextRight) return null;
    return (
      <div
        ref={ref}
        data-slot="grid-context-bar"
        data-density={resolvedDensity}
        className={cn(
          "zoom-filters grid-context-row flex min-w-0 flex-wrap items-center gap-2 border",
          className,
        )}
        style={{ ...style, fontSize: gridFontSize(resolvedZoom) }}
        {...props}
      >
        {book ? (
          <div className="flex min-w-0 items-center gap-[0.35em]">
            <label id={bookLabelId} htmlFor={bookControlId} className="grid-context-label">
              {t.bookLabel}
            </label>
            <GridBookSelect {...book} controlId={bookControlId} ariaLabelledBy={bookLabelId} />
          </div>
        ) : null}
        {book && period ? <GridToolbarSeparator density={resolvedDensity} /> : null}
        {period ? (
          <div className="flex min-w-0 items-center gap-[0.35em]">
            <label id={periodLabelId} htmlFor={periodControlId} className="grid-context-label">
              {t.periodLabel}
            </label>
            <GridPeriodFilter
              {...period}
              controlId={periodControlId}
              ariaLabelledBy={periodLabelId}
            />
          </div>
        ) : null}
        {contextRight ? (
          <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 [&_.grid-segmented-label]:text-[1em]">
            {contextRight}
          </div>
        ) : null}
      </div>
    );
  },
);

export const GRID_BOOK_COLUMN_ID = "__grid_book__";
export function createGridBookColumn<Row>(book: GridBookConfig<Row>) {
  const names = new Map(book.books.map((item) => [item.id, item.name]));
  return {
    id: GRID_BOOK_COLUMN_ID,
    label: "Kniha",
    value: (row: Row) => names.get(book.getRowBookId?.(row) ?? "") ?? "",
    locked: true,
    fitContent: true,
    transient: true,
  } as const;
}
export function placeGridBookColumnFirst<Column extends { id: string }>(
  columns: Column[],
): Column[] {
  return [
    ...columns.filter((column) => column.id === GRID_BOOK_COLUMN_ID),
    ...columns.filter((column) => column.id !== GRID_BOOK_COLUMN_ID),
  ];
}
