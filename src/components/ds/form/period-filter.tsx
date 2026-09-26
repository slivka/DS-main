import { useState } from "react";

import { Button } from "../../ui/button";
import { DateField } from "./date-field";
import { PERIOD_LABEL, periodRange, type PeriodKey } from "../../../lib/period";

export type GridPeriodKey = PeriodKey | "all";

export type PeriodFilterValue = {
  period: GridPeriodKey;
  /** ISO datumy (yyyy-mm-dd); pri období „all“ sú null. */
  from: string | null;
  to: string | null;
};

const PERIODS: GridPeriodKey[] = ["all", "day", "week", "month", "year", "custom"];

const LABELS: Record<GridPeriodKey, string> = {
  all: "Vše",
  ...PERIOD_LABEL,
};

/** Sdílený filtr období pro gridy – stejné ovládání jako v přehledech. */
export function usePeriodFilter(initial: GridPeriodKey = "all"): PeriodFilterValue & {
  setPeriod: (p: GridPeriodKey) => void;
  setFrom: (v: string) => void;
  setTo: (v: string) => void;
} {
  const [period, setPeriodState] = useState<GridPeriodKey>(initial);
  const initialRange =
    initial === "all" || initial === "custom" ? { from: null, to: null } : periodRange(initial);
  const [from, setFromState] = useState<string | null>(initialRange.from);
  const [to, setToState] = useState<string | null>(initialRange.to);

  const setPeriod = (p: GridPeriodKey) => {
    setPeriodState(p);
    if (p === "all") {
      setFromState(null);
      setToState(null);
    } else if (p !== "custom") {
      const r = periodRange(p);
      setFromState(r.from);
      setToState(r.to);
    }
  };

  return {
    period,
    from,
    to,
    setPeriod,
    setFrom: (v) => {
      setFromState(v);
      setPeriodState("custom");
    },
    setTo: (v) => {
      setToState(v);
      setPeriodState("custom");
    },
  };
}

/** Panel filtra obdobia – tlačidlá obdobia + vlastný rozsah Od/Do. */
export function PeriodFilter({ value }: { value: ReturnType<typeof usePeriodFilter> }) {
  const { period, from, to, setPeriod, setFrom, setTo } = value;
  return (
    <div className="flex flex-wrap items-center gap-1">
      {PERIODS.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={period === p ? "default" : "outline"}
          onClick={() => setPeriod(p)}
        >
          {LABELS[p]}
        </Button>
      ))}
      <DateField
        value={from ?? ""}
        onChange={(v) => setFrom(v ?? "")}
        className="w-36"
        inputClassName="h-9"
        placeholder="Od"
      />
      <DateField
        value={to ?? ""}
        onChange={(v) => setTo(v ?? "")}
        className="w-36"
        inputClassName="h-9"
        placeholder="Do"
      />
    </div>
  );
}

/** Vyfiltruje řádky podľa datumového pole a zvojeného obdobia (vrátane hraníc). */
export function filterByPeriod<Row>(
  rows: Row[],
  value: Pick<PeriodFilterValue, "from" | "to">,
  dateOf: (row: Row) => string | null | undefined,
): Row[] {
  const { from, to } = value;
  if (!from && !to) return rows;
  return rows.filter((r) => {
    const d = dateOf(r)?.slice(0, 10);
    if (!d) return false;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  });
}

/** Textový popis zvojeného obdobia pre exporty. */
export function periodLabel(value: PeriodFilterValue): string {
  if (value.period === "all") return "Vše";
  if (value.period === "custom") return `${value.from ?? "…"} – ${value.to ?? "…"}`;
  return LABELS[value.period];
}
