import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export type SortDir = "asc" | "desc";

export type SortState<Id extends string> = { key: Id | null; dir: SortDir };

/**
 * Sdílené řazení gridů. Stav se ukládá do prohlížeče pod `sort:<storageKey>`,
 * takže si každý grid pamatuje poslední zvolený sloupec i směr.
 */
export function useGridSort<Id extends string>(
  storageKey: string,
  defaultKey: Id | null = null,
  defaultDir: SortDir = "asc",
) {
  const [state, setState] = useState<SortState<Id>>({ key: defaultKey, dir: defaultDir });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`sort:${storageKey}`);
      if (!raw) return;
      const saved = JSON.parse(raw) as SortState<Id>;
      if (saved && (saved.dir === "asc" || saved.dir === "desc")) setState(saved);
    } catch {
      /* poškozené nastavení ignorujeme */
    }
  }, [storageKey]);

  const toggle = useCallback(
    (key: Id) => {
      setState((prev) => {
        const next: SortState<Id> =
          prev.key === key
            ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
            : { key, dir: "asc" };
        try {
          localStorage.setItem(`sort:${storageKey}`, JSON.stringify(next));
        } catch {
          /* úložiště není dostupné */
        }
        return next;
      });
    },
    [storageKey],
  );

  return { key: state.key, dir: state.dir, toggle };
}

/**
 * Sdílený collator – `localeCompare` si jinak při každém porovnání staví nový,
 * což u desetitisíců řádků řazení výrazně zpomaluje.
 */
const collator = new Intl.Collator("cs", { numeric: true, sensitivity: "base" });

/** Porovnání dvou hodnot – čísla číselně, text česky, prázdné hodnoty nakonec. */
export function compareValues(a: unknown, b: unknown): number {
  const empty = (v: unknown) => v === null || v === undefined || v === "";
  if (empty(a) && empty(b)) return 0;
  if (empty(a)) return 1;
  if (empty(b)) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Seřadí kopii pole podle hodnoty vrácené `accessor` pro aktuálně zvolený sloupec.
 */
export function useSortedRows<T, Id extends string>(
  rows: T[],
  sort: { key: Id | null; dir: SortDir },
  accessor: (row: T, key: Id) => unknown,
) {
  return useMemo(() => {
    const key = sort.key;
    if (!key) return rows;
    const factor = sort.dir === "asc" ? 1 : -1;
    // Hodnoty pro řazení se spočítají jen jednou na řádek (ne při každém porovnání).
    const decorated = rows.map((row, index) => ({ row, index, value: accessor(row, key) }));
    decorated.sort((x, y) => {
      const cmp = compareValues(x.value, y.value);
      return cmp !== 0 ? factor * cmp : x.index - y.index;
    });
    return decorated.map((d) => d.row);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort.key, sort.dir]);
}

type SortHeadProps<Id extends string> = {
  id: Id;
  label: string;
  sort: { key: Id | null; dir: SortDir; toggle: (key: Id) => void };
  align?: "left" | "right" | "center";
  className?: string;
  /** Ukotvit sloupec vlevo (zůstane viditelný při horizontálním rolování). */
  pin?: boolean;
  /** Ukotvit sloupec vpravo (zůstane viditelný při horizontálním rolování). */
  pinRight?: boolean;
  /** Umožní přetáhnout záhlaví do lišty seskupení (viz `groupDragProps`). */
  dragProps?: React.HTMLAttributes<HTMLElement> & { draggable?: boolean };
  /** Ruční šířka sloupce (viz `ColumnResizeHandle`). */
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** Hlavička sloupce s přepínáním řazení (klik = asc → desc). */
export function SortHead<Id extends string>({
  id,
  label,
  sort,
  align = "left",
  className = "",
  pin = false,
  pinRight = false,
  dragProps,
  style,
  children,
}: SortHeadProps<Id>) {
  const active = sort.key === id;
  return (
    <TableHead
      className={`${align === "right" ? "text-right" : align === "center" ? "text-center" : ""} ${className}`}
      data-pin={pin ? "" : undefined}
      data-pin-right={pinRight ? "" : undefined}
      {...dragProps}
      {...(style ? { style } : {})}
    >
      <span
        className={align === "right" || align === "center" ? "block" : "inline-flex items-center gap-1"}
        style={{ textAlign: align === "right" ? "right" : align === "center" ? "center" : "left" }}
      >
        <button
          type="button"
          onClick={() => sort.toggle(id)}
          className={`typo-action inline-flex items-center gap-1 hover:text-foreground ${
            active ? "text-foreground" : ""
          }`}
          aria-label={`Seřadit podle ${label}`}
        >
          {label.toLocaleUpperCase("sk-SK")}
          {active &&
            (sort.dir === "asc" ? (
              <ArrowUp className="size-3 shrink-0" />
            ) : (
              <ArrowDown className="size-3 shrink-0" />
            ))}
        </button>
        {children}
      </span>
    </TableHead>
  );
}
