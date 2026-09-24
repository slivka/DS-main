import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  GripVertical,
  Layers,
  X,
} from "lucide-react";
import { Button } from "../../ui/button";
import { TableCell, TableRow } from "../../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { gridFontSize } from "./grid-zoom";
import { compareValues } from "./grid-sort";
import { fmtAmount } from "../../../lib/format";
import { formatUserDate } from "../../../lib/date-time-preferences";
import { resolveGridTexts, type GridTexts } from "./grid-texts";

/** Granularita seskupení podle data. */
export type GroupGranularity = "day" | "month" | "quarter" | "year";

export const GROUP_GRANULARITIES: { value: GroupGranularity; label: string }[] = [
  { value: "day", label: "Den" },
  { value: "month", label: "Měsíc" },
  { value: "quarter", label: "Čtvrtletí" },
  { value: "year", label: "Rok" },
];

export type GroupSpec = { id: string; granularity: GroupGranularity };

export type GroupingApi = {
  /** Je seskupování zapnuté (zobrazuje se lišta nad gridem)? */
  enabled: boolean;
  setEnabled: (on: boolean) => void;
  groups: GroupSpec[];
  add: (id: string) => void;
  remove: (id: string) => void;
  move: (id: string, delta: number) => void;
  /** Přesune sloupec seskupení na danou pozici. */
  moveTo: (id: string, index: number) => void;

  setGranularity: (id: string, g: GroupGranularity) => void;
  clear: () => void;
  collapsed: string[];
  toggleKey: (key: string) => void;
  collapseAll: (keys: string[]) => void;
  expandAll: () => void;
  /** Aktivní seskupení (zapnuté a alespoň jeden sloupec). */
  active: boolean;
};

const MIME = "application/x-grid-column";
const CHIP_MIME = "application/x-grid-group-chip";

/**
 * Sdílené seskupování řádků gridu podle sloupců.
 * Volba se ukládá do prohlížeče pod `grouping:<storageKey>`.
 */
export function useGridGrouping(
  storageKey: string,
  opts?: { disabled?: boolean; defaultGroups?: GroupSpec[] },
): GroupingApi {
  const disabled = opts?.disabled ?? false;
  const defaultGroups = opts?.defaultGroups ?? [];
  const defaultGroupsKey = defaultGroups.map((group) => `${group.id}:${group.granularity}`).join("|");
  const [enabled, setEnabledState] = useState(defaultGroups.length > 0);
  const [groups, setGroups] = useState<GroupSpec[]>(defaultGroups);
  const [collapsed, setCollapsed] = useState<string[]>([]);

  useEffect(() => {
    setCollapsed([]);
    if (disabled) {
      setEnabledState(false);
      setGroups([]);
      return;
    }
    try {
      const raw = localStorage.getItem(`grouping:${storageKey}`);
      if (!raw) {
        setEnabledState(defaultGroups.length > 0);
        setGroups(defaultGroups);
        return;
      }
      const saved = JSON.parse(raw) as { enabled?: boolean; groups?: GroupSpec[] };
      setEnabledState(!!saved.enabled);
      setGroups(Array.isArray(saved.groups) ? saved.groups.filter((g) => g && g.id) : []);
    } catch {
      setEnabledState(false);
      setGroups([]);
    }
  }, [storageKey, disabled, defaultGroupsKey]);

  const persist = useCallback(
    (next: { enabled: boolean; groups: GroupSpec[] }) => {
      if (disabled) return;
      setEnabledState(next.enabled);
      setGroups(next.groups);
      try {
        localStorage.setItem(`grouping:${storageKey}`, JSON.stringify(next));
      } catch {
        /* úložiště není dostupné */
      }
    },
    [storageKey, disabled],
  );

  const setEnabled = useCallback(
    (on: boolean) => persist({ enabled: on, groups }),
    [persist, groups],
  );

  const add = useCallback(
    (id: string) => {
      if (groups.some((g) => g.id === id)) return;
      persist({ enabled: true, groups: [...groups, { id, granularity: "month" }] });
    },
    [persist, groups],
  );

  const remove = useCallback(
    (id: string) => persist({ enabled, groups: groups.filter((g) => g.id !== id) }),
    [persist, enabled, groups],
  );

  const move = useCallback(
    (id: string, delta: number) => {
      const from = groups.findIndex((g) => g.id === id);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= groups.length) return;
      const next = [...groups];
      next.splice(to, 0, next.splice(from, 1)[0]!);
      persist({ enabled, groups: next });
    },
    [persist, enabled, groups],
  );

  /** Přesune sloupec na konkrétní pozici (drag & drop v seskupovacím pruhu). */
  const moveTo = useCallback(
    (id: string, index: number) => {
      const from = groups.findIndex((g) => g.id === id);
      if (from < 0) return;
      const to = Math.max(0, Math.min(groups.length - 1, index));
      if (to === from) return;
      const next = [...groups];
      next.splice(to, 0, next.splice(from, 1)[0]!);
      persist({ enabled, groups: next });
    },
    [persist, enabled, groups],
  );

  const setGranularity = useCallback(
    (id: string, g: GroupGranularity) =>
      persist({
        enabled,
        groups: groups.map((x) => (x.id === id ? { ...x, granularity: g } : x)),
      }),
    [persist, enabled, groups],
  );

  const clear = useCallback(() => persist({ enabled, groups: [] }), [persist, enabled]);

  const toggleKey = useCallback(
    (key: string) =>
      setCollapsed((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key])),
    [],
  );

  return {
    enabled,
    setEnabled,
    groups,
    add,
    remove,
    move,
    moveTo,

    setGranularity,
    clear,
    collapsed,
    toggleKey,
    collapseAll: setCollapsed,
    expandAll: () => setCollapsed([]),
    active: enabled && groups.length > 0,
  };
}

/** Tlačítko v liště gridu, které seskupování zapíná a vypíná. */
export function GroupControl({
  grouping,
  hidden = false,
  texts: textOverrides,
}: {
  grouping: GroupingApi;
  /** Skryje tlačítko, např. když je grid přepnutý do stromového zobrazení. */
  hidden?: boolean;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  if (hidden) return null;
  // Skrytá lišta, ale seskupení stále platí → oranžový stav zužující pohled na data.
  const hiddenActive = !grouping.enabled && grouping.groups.length > 0;
  const label = grouping.enabled
    ? texts.groupingDisable
    : hiddenActive
      ? `Skrytý pruh se seskupením (${grouping.groups.length}) – zobrazit`
      : texts.groupingEnable;
  return (
    <Button
      type="button"
      size={hiddenActive ? "sm" : "icon"}
      variant="outline"
      className={`grid-toolbar-control ${
        hiddenActive
          ? "grid-toolbar-active gap-1"
          : `grid-toolbar-icon-control ${grouping.enabled ? "grid-toolbar-active" : ""}`
      }`}
      title={label}
      aria-label={label}
      aria-pressed={grouping.enabled}
      onClick={() => grouping.setEnabled(!grouping.enabled)}
    >
      <Layers className="size-[1.2em]" />
      {hiddenActive && <span className="typo-action">Seskupeno ({grouping.groups.length})</span>}
    </Button>
  );
}

/** Rozpozná datum ve formátu ISO (YYYY-MM-DD…). */
function isoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value : null;
}

const MONTHS = [
  "leden",
  "únor",
  "březen",
  "duben",
  "květen",
  "červen",
  "červenec",
  "srpen",
  "září",
  "říjen",
  "listopad",
  "prosinec",
];

/** Klíč a popisek skupiny pro jednu hodnotu podle zvolené granularity. */
function bucket(value: unknown, granularity: GroupGranularity, emptyLabel = "(nevyplněno)"): { key: string; label: string } {
  const iso = isoDate(value);
  if (iso) {
    const [y, m] = iso.slice(0, 10).split("-") as [string, string, string];
    const month = Number(m);
    switch (granularity) {
      case "year":
        return { key: y, label: y };
      case "quarter": {
        const q = Math.floor((month - 1) / 3) + 1;
        return { key: `${y}-Q${q}`, label: `${q}. čtvrtletí ${y}` };
      }
      case "day":
        return { key: iso.slice(0, 10), label: formatUserDate(iso.slice(0, 10)) };
      default:
        return { key: `${y}-${m}`, label: `${MONTHS[month - 1] ?? m} ${y}` };
    }
  }
  const text = value === null || value === undefined || value === "" ? "" : String(value);
  return { key: text || "\u0000", label: text || emptyLabel };
}

/** Vrátí id sloupců, jejichž hodnoty jsou datumy (podle prvního vyplněného řádku). */
export function detectDateColumns<T>(
  rows: T[],
  columns: { id: string }[],
  getValue: (row: T, id: string) => unknown,
): string[] {
  return columns
    .map((c) => c.id)
    .filter((id) => {
      const found = rows.find((r) => {
        const v = getValue(r, id);
        return v !== null && v !== undefined && v !== "";
      });
      return found ? isoDate(getValue(found, id)) !== null : false;
    });
}

export type GroupSum = { id: string; label: string; total: number };

export type GroupedItem<T> =
  | {
      type: "group";
      key: string;
      label: string;
      column: string;
      level: number;
      count: number;
      sums: GroupSum[];
      collapsed: boolean;
    }
  | { type: "row"; row: T };

/**
 * Sestaví plochý seznam řádků se záhlavími skupin (víceúrovňový strom).
 * Číselné sloupce se v záhlaví skupiny sečtou.
 */
export function useGroupedRows<T>(
  rows: T[],
  grouping: GroupingApi,
  columns: { id: string; label: string }[],
  getValue: (row: T, id: string) => unknown,
): GroupedItem<T>[] {
  const { active, groups, collapsed } = grouping;
  return useMemo(() => {
    if (!active) return rows.map((row) => ({ type: "row", row }) as GroupedItem<T>);

    const numericIds = columns
      .map((c) => c.id)
      .filter(
        (id) =>
          !groups.some((g) => g.id === id) &&
          rows.some((r) => typeof getValue(r, id) === "number") &&
          rows.every((r) => {
            const v = getValue(r, id);
            return v === null || v === undefined || v === "" || typeof v === "number";
          }),
      );
    const labelOf = (id: string) => columns.find((c) => c.id === id)?.label ?? id;

    const out: GroupedItem<T>[] = [];

    const walk = (items: T[], level: number, parentKey: string, hidden: boolean) => {
      const spec = groups[level];
      if (!spec) {
        if (!hidden) for (const row of items) out.push({ type: "row", row });
        return;
      }
      const map = new Map<string, { label: string; items: T[] }>();
      for (const row of items) {
        const b = bucket(getValue(row, spec.id), spec.granularity);
        const entry = map.get(b.key) ?? { label: b.label, items: [] };
        entry.items.push(row);
        map.set(b.key, entry);
      }
      const keys = [...map.keys()].sort(compareValues);
      for (const key of keys) {
        const entry = map.get(key)!;
        const fullKey = parentKey ? `${parentKey}»${key}` : key;
        const isCollapsed = collapsed.includes(fullKey);
        if (!hidden) {
          out.push({
            type: "group",
            key: fullKey,
            label: entry.label,
            column: labelOf(spec.id),
            level,
            count: entry.items.length,
            sums: numericIds.map((id) => ({
              id,
              label: labelOf(id),
              total: entry.items.reduce((sum, r) => {
                const v = getValue(r, id);
                return sum + (typeof v === "number" ? v : 0);
              }, 0),
            })),
            collapsed: isCollapsed,
          });
        }
        walk(entry.items, level + 1, fullKey, hidden || isCollapsed);
      }
    };

    walk(rows, 0, "", false);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, active, groups, collapsed, columns]);
}

/** Záhlaví jedné skupiny v tabulce. */
export function GroupHeaderRow<T>({
  item,
  colSpan,
  onToggle,
}: {
  item: Extract<GroupedItem<T>, { type: "group" }>;
  colSpan: number;
  onToggle: (key: string) => void;
}) {
  return (
    <TableRow className="bg-muted/50 hover:bg-muted/70">
      <TableCell colSpan={colSpan} className="py-1">
        <div
          className="flex flex-wrap items-center gap-2"
          style={{ paddingLeft: `${item.level * 1.25}rem` }}
        >
          <button
            type="button"
            onClick={() => onToggle(item.key)}
            className="typo-action inline-flex items-center gap-1 font-semibold text-foreground"
            aria-expanded={!item.collapsed}
          >
            {item.collapsed ? (
              <ChevronRight className="size-4 shrink-0" />
            ) : (
              <ChevronDown className="size-4 shrink-0" />
            )}
            <span className="text-muted-foreground">{item.column}:</span>
            <span>{item.label}</span>
          </button>
          <span className="text-muted-foreground">({item.count})</span>
          {item.sums.length > 0 && (
            <span className="flex flex-wrap items-center gap-3 text-muted-foreground">
              {item.sums.map((s) => (
                <span key={s.id}>
                  {s.label}:{" "}
                  <span className="num font-medium text-foreground">{fmtAmount(s.total, 2)}</span>
                </span>
              ))}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Lišta nad gridem, do které se sloupce přetahují (nebo přidávají z nabídky).
 * Zobrazuje se jen se zapnutým seskupováním.
 */
export function GroupBar({
  grouping,
  columns,
  dateColumns,
  zoom = 1,
  texts: textOverrides,
}: {
  grouping: GroupingApi;
  columns: { id: string; label: string }[];
  /** Sloupce s datem – jen u nich se nabízí volba den/měsíc/čtvrtletí/rok. */
  dateColumns?: string[];
  zoom?: number;
  texts?: Partial<GridTexts>;
}) {
  const texts = resolveGridTexts(textOverrides);
  const [over, setOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  if (!grouping.enabled) return null;
  const label = (id: string) => columns.find((c) => c.id === id)?.label ?? id;
  const available = columns.filter((c) => !grouping.groups.some((g) => g.id === c.id));

  return (
    <div
      className={`zoom-filters flex flex-wrap items-center gap-2 rounded-none border border-y-0 border-dashed bg-card p-2 shadow-panel ${
        over ? "bg-primary/5" : ""
      }`}
      style={{ fontSize: gridFontSize(zoom) }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        setOverIndex(null);
        const chip = e.dataTransfer.getData(CHIP_MIME);
        if (chip) {
          grouping.moveTo(chip, grouping.groups.length - 1);
          setDragId(null);
          return;
        }
        const id = e.dataTransfer.getData(MIME) || e.dataTransfer.getData("text/plain");
        if (id && columns.some((c) => c.id === id)) grouping.add(id);
      }}
    >
      {grouping.groups.length === 0 && (
        <span className="typo-label text-muted-foreground">
          {texts.groupingDropHint}
        </span>
      )}
      {grouping.groups.map((g, i) => (
        <span
          key={g.id}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(CHIP_MIME, g.id);
            e.dataTransfer.effectAllowed = "move";
            setDragId(g.id);
          }}
          onDragEnd={() => {
            setDragId(null);
            setOverIndex(null);
          }}
          onDragOver={(e) => {
            if (!dragId || dragId === g.id) return;
            e.preventDefault();
            e.stopPropagation();
            setOverIndex(i);
          }}
          onDrop={(e) => {
            const chip = e.dataTransfer.getData(CHIP_MIME);
            if (!chip) return;
            e.preventDefault();
            e.stopPropagation();
            grouping.moveTo(chip, i);
            setDragId(null);
            setOverIndex(null);
            setOver(false);
          }}
          className={`grid-toolbar-control inline-flex items-center gap-1 rounded-md border border-primary bg-primary px-2 py-0.5 text-primary-foreground ${
            dragId === g.id ? "opacity-50" : ""
          } ${overIndex === i && dragId && dragId !== g.id ? "border-primary ring-1 ring-primary" : ""}`}
        >
          <span className="typo-label text-primary-foreground/70">{i + 1}.</span>
          <GripVertical className="size-[1em] cursor-grab text-primary-foreground/70" aria-hidden />
          <span className="typo-action">{label(g.id)}</span>
          {grouping.groups.length > 1 && (
            <span className="inline-flex items-center">
              <button
                type="button"
                title="Posunout doleva"
                aria-label="Posunout doleva"
                disabled={i === 0}
                onClick={() => grouping.move(g.id, -1)}
                className="text-primary-foreground/70 hover:text-primary-foreground disabled:opacity-30"
              >
                <ChevronLeft className="size-[1em]" />
              </button>
              <button
                type="button"
                title="Posunout doprava"
                aria-label="Posunout doprava"
                disabled={i === grouping.groups.length - 1}
                onClick={() => grouping.move(g.id, 1)}
                className="text-primary-foreground/70 hover:text-primary-foreground disabled:opacity-30"
              >
                <ChevronRightIcon className="size-[1em]" />
              </button>
            </span>
          )}

          {(dateColumns ? dateColumns.includes(g.id) : true) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-primary-foreground/70 hover:text-primary-foreground"
                  title="Seskupit datum podle"
                >
                  {GROUP_GRANULARITIES.find((x) => x.value === g.granularity)?.label}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={g.granularity}
                  onValueChange={(v) => grouping.setGranularity(g.id, v as GroupGranularity)}
                >
                  {GROUP_GRANULARITIES.map((x) => (
                    <DropdownMenuRadioItem key={x.value} value={x.value}>
                      {x.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <button
            type="button"
            onClick={() => grouping.remove(g.id)}
            title="Zrušit seskupení podle sloupce"
            className="text-primary-foreground/70 hover:text-primary-foreground"
          >
            <X className="size-[1em]" />
          </button>
        </span>
      ))}
      {available.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="grid-toolbar-control border-primary text-primary hover:bg-primary/10 hover:text-primary"
            >
              {texts.groupingAddColumn}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-80 overflow-y-auto">
            {available.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => grouping.add(c.id)}>
                {c.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {grouping.groups.length > 0 && (
        <button
          type="button"
          className="ml-auto text-destructive hover:text-destructive/80 font-medium"
          onClick={grouping.clear}
        >
          {texts.groupingClear}
        </button>
      )}
    </div>
  );
}

/** Props pro záhlaví sloupce, aby šlo sloupec přetáhnout do lišty seskupení. */
export function groupDragProps(id: string, enabled: boolean) {
  if (!enabled) return {};
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.setData(MIME, id);
      e.dataTransfer.setData("text/plain", id);
      e.dataTransfer.effectAllowed = "copy";
    },
  } as const;
}
