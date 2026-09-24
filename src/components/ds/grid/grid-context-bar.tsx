import * as React from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { cn } from "../../../lib/utils";
import { DateRangeField } from "../form/date-range-field";
import type { BookOption } from "../accounting/book-select";
import { gridPeriodLabel, gridPeriodRange, moveGridPeriod, type GridPeriodKind, type GridPeriodValue } from "./grid-period";

export interface GridPeriodTexts {
  all: string; month: string; quarter: string; half: string; ytd: string; custom: string;
  thisMonth: string; previousMonth: string; thisQuarter: string; previous: string; next: string; clear: string;
}
export const DEFAULT_GRID_PERIOD_TEXTS: GridPeriodTexts = {
  all: "Celé období", month: "Měsíc", quarter: "Čtvrtletí", half: "Pololetí", ytd: "Od začátku roku do dnes", custom: "Vlastní",
  thisMonth: "Tento měsíc", previousMonth: "Minulý měsíc", thisQuarter: "Toto čtvrtletí", previous: "Předchozí období", next: "Následující období", clear: "Celé období",
};
export interface GridPeriodConfig {
  fiscalFrom: string; fiscalTo: string; value: GridPeriodValue; onChange: (value: GridPeriodValue) => void; texts?: Partial<GridPeriodTexts>; today?: string;
}
export interface GridBookConfig<Row = unknown> {
  books: BookOption[]; value: string | "all"; onChange: (value: string | "all") => void; allowAll?: boolean; allBooksLabel?: string; getRowBookId?: (row: Row) => string | null | undefined;
}
export interface GridContextBarProps<Row = unknown> extends React.ComponentPropsWithoutRef<"div"> {
  period?: GridPeriodConfig; book?: GridBookConfig<Row>;
}

const parse = (value: string) => new Date(`${value}T00:00:00Z`);
const iso = (date: Date) => date.toISOString().slice(0, 10);
const monthIndex = (fiscalFrom: string, date: Date) => (date.getUTCFullYear() - parse(fiscalFrom).getUTCFullYear()) * 12 + date.getUTCMonth() - parse(fiscalFrom).getUTCMonth();

export function GridPeriodFilter({ fiscalFrom, fiscalTo, value, onChange, texts, today = iso(new Date()) }: GridPeriodConfig) {
  const t = { ...DEFAULT_GRID_PERIOD_TEXTS, ...texts };
  const [open, setOpen] = React.useState(false);
  const movable = value.kind === "month" || value.kind === "quarter" || value.kind === "half";
  const maxIndex = value.kind === "month" ? 11 : value.kind === "quarter" ? 3 : value.kind === "half" ? 1 : 0;
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
  ].filter((item) => item.index >= 0 && inFiscal(gridPeriodRange(fiscalFrom, fiscalTo, item.kind, item.index).from, gridPeriodRange(fiscalFrom, fiscalTo, item.kind, item.index).to));

  return <TooltipProvider delayDuration={250}><div className="flex min-w-0 items-center gap-1">
    {movable ? <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t.previous} disabled={(value.index ?? 0) <= 0} onClick={() => onChange(moveGridPeriod(fiscalFrom, fiscalTo, value, -1))}><ChevronLeft className="size-4" /></Button></TooltipTrigger><TooltipContent>{t.previous}</TooltipContent></Tooltip> : null}
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild><Button type="button" variant="outline" size="sm" className={cn("max-w-[20rem] gap-1.5 font-medium", value.kind !== "all" && "grid-toolbar-active")}><span className="truncate">{gridPeriodLabel(value)}</span><ChevronDown className="size-3.5 shrink-0" /></Button></PopoverTrigger>
      <PopoverContent align="start" className="w-[22rem] p-3" onKeyDown={(event) => { if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) event.stopPropagation(); }}>
        {quick.length ? <div className="mb-3 flex flex-wrap gap-1 border-b pb-3">{quick.map((item) => <Button key={item.label} type="button" size="sm" variant="ghost" onClick={() => setKind(item.kind, item.index)}>{item.label}</Button>)}</div> : null}
        <div className="grid gap-2">
          <Button type="button" variant={value.kind === "all" ? "secondary" : "ghost"} className="justify-start" onClick={() => setKind("all")}>{t.all}</Button>
          <PeriodGrid label={t.month} count={12} active={value.kind === "month" ? value.index : undefined} columns={4} render={(index) => new Intl.DateTimeFormat("cs-CZ", { month: "short", timeZone: "UTC" }).format(parse(gridPeriodRange(fiscalFrom, fiscalTo, "month", index).from))} onSelect={(index) => setKind("month", index)} />
          <PeriodGrid label={t.quarter} count={4} active={value.kind === "quarter" ? value.index : undefined} columns={4} render={(index) => `Q${index + 1}`} onSelect={(index) => setKind("quarter", index)} />
          <PeriodGrid label={t.half} count={2} active={value.kind === "half" ? value.index : undefined} columns={2} render={(index) => `${index + 1}. pololetí`} onSelect={(index) => setKind("half", index)} />
          <Button type="button" variant={value.kind === "ytd" ? "secondary" : "ghost"} className="justify-start" onClick={() => setKind("ytd")}>{t.ytd}</Button>
          <div className="border-t pt-2"><div className="mb-2 text-sm font-medium">{t.custom}</div><DateRangeField value={value.kind === "custom" ? { from: value.from, to: value.to } : { from: null, to: null }} onChange={(range) => { if (range.from && range.to) onChange({ kind: "custom", from: range.from, to: range.to }); }} minDate={parse(fiscalFrom)} maxDate={parse(fiscalTo)} /></div>
        </div>
      </PopoverContent>
    </Popover>
    {value.kind !== "all" ? <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-8 text-filter-active" aria-label={t.clear} onClick={() => onChange(gridPeriodRange(fiscalFrom, fiscalTo, "all"))}><X className="size-4" /></Button></TooltipTrigger><TooltipContent>{t.clear}</TooltipContent></Tooltip> : null}
    {movable ? <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="size-8" aria-label={t.next} disabled={(value.index ?? 0) >= maxIndex} onClick={() => onChange(moveGridPeriod(fiscalFrom, fiscalTo, value, 1))}><ChevronRight className="size-4" /></Button></TooltipTrigger><TooltipContent>{t.next}</TooltipContent></Tooltip> : null}
  </div></TooltipProvider>;
}

function PeriodGrid({ label, count, active, columns, render, onSelect }: { label: string; count: number; active?: number; columns: number; render: (index: number) => string; onSelect: (index: number) => void }) {
  return <div><div className="mb-1 text-sm font-medium">{label}</div><div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{Array.from({ length: count }, (_, index) => <Button key={index} type="button" size="sm" variant={active === index ? "secondary" : "ghost"} className="justify-center" onClick={() => onSelect(index)}>{render(index)}</Button>)}</div></div>;
}

export function GridBookSelect<Row = unknown>({ books, value, onChange, allowAll = true, allBooksLabel = "Všechny knihy" }: GridBookConfig<Row>) {
  const active = books.filter((book) => book.active !== false);
  const selected = active.find((book) => book.id === value);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  if (active.length === 1) return <TooltipProvider><Tooltip><TooltipTrigger asChild><strong className="block max-w-[16rem] truncate text-sm">{active[0]?.name}</strong></TooltipTrigger><TooltipContent>{active[0]?.code}</TooltipContent></Tooltip></TooltipProvider>;
  const options = active.filter((book) => `${book.name} ${book.code}`.toLocaleLowerCase("cs").includes(query.toLocaleLowerCase("cs")));
  return <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><Button type="button" variant="outline" size="sm" className="max-w-[16rem] justify-between gap-2 font-semibold"><span className="truncate">{value === "all" ? allBooksLabel : selected?.name ?? allBooksLabel}</span><ChevronDown className="size-3.5 shrink-0" /></Button></PopoverTrigger><PopoverContent align="end" className="w-72 p-1"><div className="relative mb-1"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Hledat knihu…" className="pl-8" autoFocus /></div>{allowAll ? <BookOptionButton selected={value === "all"} label={allBooksLabel} onSelect={() => { onChange("all"); setOpen(false); }} /> : null}{options.map((book) => <BookOptionButton key={book.id} selected={value === book.id} label={`${book.name} (${book.code})`} onSelect={() => { onChange(book.id); setOpen(false); }} />)}</PopoverContent></Popover>;
}
function BookOptionButton({ selected, label, onSelect }: { selected: boolean; label: string; onSelect: () => void }) { return <button type="button" role="option" aria-selected={selected} className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring" onClick={onSelect}><span className="size-4">{selected ? <Check className="size-4" /> : null}</span><span className="truncate">{label}</span></button>; }

export const GridContextBar = React.forwardRef<HTMLDivElement, GridContextBarProps>(function GridContextBar({ period, book, className, ...props }, ref) {
  if (!period && !book) return null;
  return <div ref={ref} data-slot="grid-context-bar" className={cn("zoom-filters flex min-h-11 min-w-0 flex-wrap items-center gap-2 border bg-card px-2 py-1.5", className)} {...props}>{period ? <GridPeriodFilter {...period} /> : null}{book ? <div className="ml-auto flex min-w-0 items-center justify-end"><GridBookSelect {...book} /></div> : null}</div>;
});

export const GRID_BOOK_COLUMN_ID = "__grid_book__";
export function createGridBookColumn<Row>(book: GridBookConfig<Row>) {
  const names = new Map(book.books.map((item) => [item.id, item.name]));
  return { id: GRID_BOOK_COLUMN_ID, label: "Kniha", value: (row: Row) => names.get(book.getRowBookId?.(row) ?? "") ?? "", locked: true, fitContent: true, transient: true } as const;
}
