import * as React from "react";

export type GridPeriodKind = "all" | "month" | "quarter" | "half" | "ytd" | "custom";
export type GridPeriodValue = { kind: GridPeriodKind; index?: number; from: string; to: string };

const DAY = 86_400_000;
const parse = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1));
};
const iso = (date: Date) => date.toISOString().slice(0, 10);
const addMonths = (value: string, count: number) => {
  const date = parse(value);
  date.setUTCMonth(date.getUTCMonth() + count);
  return iso(date);
};
const endBefore = (value: string) => iso(new Date(parse(value).getTime() - DAY));
const clamp = (value: string, min: string, max: string) => value < min ? min : value > max ? max : value;
const formatDate = (value: string) => new Intl.DateTimeFormat("cs-CZ", { timeZone: "UTC" }).format(parse(value));
const monthName = (value: string, short = false) => new Intl.DateTimeFormat("cs-CZ", { month: short ? "short" : "long", year: short ? undefined : "numeric", timeZone: "UTC" }).format(parse(value));

export function gridPeriodRange(fiscalFrom: string, fiscalTo: string, kind: GridPeriodKind, index = 0, today = iso(new Date())): GridPeriodValue {
  if (kind === "all") return { kind, from: fiscalFrom, to: fiscalTo };
  if (kind === "ytd") return { kind, from: fiscalFrom, to: clamp(today, fiscalFrom, fiscalTo) };
  if (kind === "custom") return { kind, from: fiscalFrom, to: fiscalTo };
  const span = kind === "month" ? 1 : kind === "quarter" ? 3 : 6;
  const start = parse(fiscalFrom);
  const end = parse(fiscalTo);
  const fiscalMonths = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1;
  const maxIndex = Math.max(0, Math.ceil(fiscalMonths / span) - 1);
  const safeIndex = Math.max(0, Math.min(index, maxIndex));
  const from = addMonths(fiscalFrom, safeIndex * span);
  const to = clamp(endBefore(addMonths(from, span)), fiscalFrom, fiscalTo);
  return { kind, index: safeIndex, from, to };
}

export function gridPeriodLabel(value: GridPeriodValue): string {
  if (value.kind === "all") return "Celé období";
  if (value.kind === "month") return monthName(value.from);
  if (value.kind === "quarter") return `${(value.index ?? 0) + 1}. čtvrtletí ${parse(value.from).getUTCFullYear()}`;
  if (value.kind === "half") return `${(value.index ?? 0) + 1}. pololetí ${parse(value.from).getUTCFullYear()}`;
  if (value.kind === "ytd") {
    const from = parse(value.from);
    const to = parse(value.to);
    const shortFrom = `${from.getUTCDate()}. ${from.getUTCMonth() + 1}.`;
    return from.getUTCFullYear() === to.getUTCFullYear()
      ? `${shortFrom} – ${formatDate(value.to)}`
      : `${formatDate(value.from)} – ${formatDate(value.to)}`;
  }
  return `${formatDate(value.from)} – ${formatDate(value.to)}`;
}

export function filterByGridPeriod<Row>(rows: Row[], value: GridPeriodValue, dateOf: (row: Row) => string | null | undefined): Row[] {
  if (value.kind === "all") return rows;
  return rows.filter((row) => {
    const date = dateOf(row);
    return Boolean(date && date >= value.from && date <= value.to);
  });
}

export function moveGridPeriod(fiscalFrom: string, fiscalTo: string, value: GridPeriodValue, delta: -1 | 1): GridPeriodValue {
  if (!(["month", "quarter", "half"] as GridPeriodKind[]).includes(value.kind)) return value;
  return gridPeriodRange(fiscalFrom, fiscalTo, value.kind, (value.index ?? 0) + delta);
}

export function useGridPeriod(fiscalFrom: string, fiscalTo: string, initial?: GridPeriodValue) {
  const [value, setValue] = React.useState<GridPeriodValue>(() => initial ?? gridPeriodRange(fiscalFrom, fiscalTo, "all"));
  React.useEffect(() => {
    setValue((current) => current.from < fiscalFrom || current.to > fiscalTo ? gridPeriodRange(fiscalFrom, fiscalTo, "all") : current);
  }, [fiscalFrom, fiscalTo]);
  return [value, setValue] as const;
}
