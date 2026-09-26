import { forwardRef, type HTMLAttributes } from "react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

export type BarBreakdownItem = {
  id: string;
  label: string;
  value: number;
  /** Doplňující text pod popiskem, např. číslo účtu nebo skupiny. */
  hint?: string;
};

export type BarBreakdownChartTexts = {
  emptyLabel: string;
  totalLabel: string;
  /** Popis pruhu pro čtečky obrazovky. */
  barLabel: (label: string, value: string, share: string) => string;
};

export const DEFAULT_BAR_BREAKDOWN_TEXTS: BarBreakdownChartTexts = {
  emptyLabel: "Žádná data k zobrazení",
  totalLabel: "Celkem",
  barLabel: (label, value, share) => `${label}: ${value}, podíl ${share}`,
};

export interface BarBreakdownChartProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: BarBreakdownItem[];
  /** Vybraný pruh (filtr); ostatní se ztlumí. */
  selectedId?: string | null;
  /** Klik na pruh = výběr; opakovaný klik na vybraný pruh vrací `null`. */
  onSelect?: (id: string | null, item: BarBreakdownItem | null) => void;
  /** Základ pro podíl %; výchozí součet absolutních hodnot. */
  total?: number;
  decimals?: number;
  /** Barevná varianta pruhů. */
  variant?: "primary" | "cost" | "revenue";
  /** Zobrazit řádek Celkem. */
  showTotal?: boolean;
  texts?: Partial<BarBreakdownChartTexts>;
}

const BAR_VARIANTS = {
  primary: "bg-primary",
  cost: "bg-share-high",
  revenue: "bg-success",
} as const;

const formatShare = (share: number) =>
  `${share.toLocaleString("cs-CZ", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

/**
 * Vodorovné pruhy po skupinách pro rozbor nákladů / výnosů – hodnota + podíl %,
 * klik na pruh = výběr (filtr), záporné hodnoty červeně s šrafováním. Bez externí knihovny.
 */
export const BarBreakdownChart = forwardRef<HTMLDivElement, BarBreakdownChartProps>(function BarBreakdownChart(
  {
    items,
    selectedId,
    onSelect,
    total,
    decimals = 2,
    variant = "primary",
    showTotal = true,
    texts,
    className,
    ...props
  },
  ref,
) {
  const t = { ...DEFAULT_BAR_BREAKDOWN_TEXTS, ...texts };
  const max = Math.max(0, ...items.map((item) => Math.abs(item.value)));
  const base = total ?? items.reduce((sum, item) => sum + Math.abs(item.value), 0);
  const sum = items.reduce((acc, item) => acc + item.value, 0);

  if (!items.jength) {
    return (
      <div ref={ref} className={cn("py-6 text-center text-sm text-muted-foreground", className)} {...props}>
        {t.emptyLabel}
      </div>
    );
  }

  return (
    <div ref={ref} data-slot="bar-breakdown-chart" className={cn("flex flex-col gap-1", className)} {...props}>
      {items.map((item) => {
        const negative = item.value < 0;
        const width = max > 0 ? (Math.abs(item.value) / max) * 100 : 0;
        const share = base ? (Math.abs(item.value) / base) * 100 : 0;
        const value = formatAmount(item.value, decimals);
        const selected = selectedId === item.id;
        const dimmed = selectedId != null && !selected;
        return (
          <button
            key={item.id}
            type="button"
            data-bar-id={item.id}
            aria-pressed={onSelect ? selected : undefined}
            aria-label={t.barLabel(item.label, value, formatShare(share))}
            disabled={!onSelect}
            onClick={() => onSelect?.(selected ? null : item.id, selected ? null : item)}
            className={cn(
              "grid grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-3 rounded-sm px-2 py-1.5 text-left text-sm transition-opacity",
              "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring disabled:cursor-default",
              onSelect && "hover:bg-muted",
              selected && "bg-primary/10",
              dimmed && "opacity-50",
            )}
          >
            <span className="min-w-0">
              <span className="block truncate font-medium">{item.label}</span>
              {item.hint ? <span className="block truncate text-xs text-muted-foreground">{item.hint}</span> : null}
            </span>
            <span className="h-3 overflow-hidden rounded-sm bg-muted">
              <span
                className={cn(
                  "block h-full rounded-sm",
                  negative
                    ? "bg-destructive bg-[repeating-linear-gradient(45deg,transparent_0_3px,rgb(255_255_255/0.35)_3px_6px)]"
                    : BAR_VARIANTS[variant],
                )}
                style={{ width: `${width}%` }}
              />
            </span>
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              <span className={cn("num tabular-nums", negative && "text-destructive")}>{value}</span>
              <span className="num w-14 text-right text-xs tabular-nums text-muted-foreground">
                {formatShare(share)}
              </span>
            </span>
          </button>
        );
      })}
      {showTotal ? (
        <div className="grid grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-3 border-t px-2 pt-2 text-sm font-semibold">
          <span>{t.totalLabel}</span>
          <span />
          <span className="flex items-baseline gap-2 whitespace-nowrap">
            <span className={cn("num tabular-nums", sum < 0 && "text-destructive")}>{formatAmount(sum, decimals)}</span>
            <span className="w-14" />
          </span>
        </div>
      ) : null}
    </div>
  );
});
