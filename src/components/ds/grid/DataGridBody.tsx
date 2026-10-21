/**
 * Tělo a součtový řádek DataGrid.
 * Vlastní: řádky dat (klik, dvojklik, výběr, aktivní řádek, editor vybraných), záhlaví skupin,
 * řádky součtů skupin, ukotvený součtový řádek a vykreslení jen okna řádků při virtualizaci
 * (výšku zbytku drží prázdné řádky, hlavička a součty zůstávají ukotvené).
 * Nesmí: počítat výběr, skupiny ani součty – dostává je hotové od DataGrid nad celou množinou.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { Checkbox } from "../../ui/checkbox";
import { TableCell, TableFooter, TableRow } from "../../ui/table";
import { fmtAmount } from "../../../lib/format";
import { IcoLink } from "../form/ico-link";
import { fixedWidthStyle } from "./grid-column-presets";
import { GroupHeaderRow, type GroupedItem } from "./grid-grouping";
import { isInteractiveTarget, type GroupTotalItem } from "./grid-selection";
import type { GridTexts } from "./grid-texts";
import { VirtualPad, type GridVirtual } from "./grid-virtual";
import { cellText } from "./data-grid-model";
import type { DataGridLayout } from "./DataGridHead";
import type { DataGridColumn } from "./data-grid-types";
import { RecordPanelTriggers } from "../layout/record-panel-triggers";

/** Položka těla: řádek, záhlaví skupiny nebo součet skupiny. */
export type DataGridItem<Row> = GroupedItem<Row> | GroupTotalItem;

const cellAlign = (c: { align?: string | undefined; numeric?: boolean | undefined }) =>
  c.align === "right" || (c.numeric && !c.align)
    ? "text-right num"
    : c.align === "center"
      ? "text-center"
      : "text-left";

/** Props těla DataGrid. */
export interface DataGridRowsProps<Row> {
  /** Otevření obecného indikátoru záznamu. */
  onIndicatorClick?: ((row: Row, id: string) => void) | undefined;
  /** Rozložení sloupců. */
  layout: DataGridLayout<Row>;
  /** Položky k zobrazení (všechny; okno vybere `virtual`). */
  items: DataGridItem<Row>[];
  /** Okno virtualizace. */
  virtual: GridVirtual;
  /** Texty gridu. */
  texts: GridTexts;
  /** Klíč řádku. */
  rowKey: (row: Row) => string;
  /** Vybrané klíče. */
  keySet: ReadonlySet<string>;
  /** Přepnutí výběru řádku. */
  onToggleKey: (key: string) => void;
  /** Součty skupin jako řádek pod skupinou. */
  groupTotals: "header" | "row";
  /** Index sloupce s popiskem „Celkem {skupina}“. */
  groupTotalLabelIndex: number;
  /** Sbalení / rozbalení skupiny. */
  onToggleGroup: (key: string) => void;
  /** Klik na řádek. */
  onRowClick?: ((row: Row) => void) | undefined;
  /** Dvojklik: úprava, jinak klik. */
  onRowOpen?: ((row: Row) => void) | undefined;
  /** Jen explicitní veřejné onRowOpen se uplatní také při výběru a zapne roving fokus řádků. */
  openInSelectMode?: boolean;
  /** Řádek je klikací (kurzor). */
  clickable: boolean;
  /** Klíč aktivního řádku (otevřený boční panel). */
  activeRowKey?: string | null | undefined;
  /** Doplňková třída řádku. */
  rowClassName?: ((row: Row) => string | undefined) | undefined;
  /** Obsah buňky akcí. */
  renderActions: (row: Row) => ReactNode;
}

/** Obsah datové buňky: editor vybraného řádku, vlastní vykreslení, IČO, částka, nebo text. */
function cellContent<Row>(
  c: DataGridColumn<Row>,
  row: Row,
  editing: boolean,
  onIndicatorClick?: (row: Row, id: string) => void,
) {
  if (c.type === "record-indicators")
    return (
      <RecordPanelTriggers
        size="compact"
        indicators={(c.indicators ?? []).map((item) => ({ ...item, count: item.count(row) }))}
        onIndicatorClick={(id) => onIndicatorClick?.(row, id)}
      />
    );
  if (editing && c.editor) return c.editor(row);
  if (c.render) return c.render(row);
  const v = c.value?.(row);
  if ((c.format === "ico" || c.id === "ico") && v !== null && v !== undefined) {
    if (cellText(v).trim() !== "") return <IcoLink value={cellText(v)} />;
  }
  if (c.format === "vs")
    return <span className="font-mono tabular-nums text-left">{cellText(v)}</span>;
  if (c.numeric && typeof v === "number") return fmtAmount(v, c.decimals ?? 0);
  return cellText(v);
}

const ROW_NAV_KEYS = new Set(["ArrowDown", "ArrowUp", "Home", "End"]);

/**
 * Roving fokus řádků: v tabulátorovém pořadí je jen jeden řádek (0), ostatní −1;
 * šipky ↑/↓ a Home/End fokus posouvají a ve virtualizaci k cíli doscrollují.
 */
function useRowRoving<Row>(
  enabled: boolean,
  rowKeys: string[],
  activeRowKey: string | null | undefined,
  virtual: GridVirtual,
  count: number,
) {
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const pending = useRef<{ key: string; index: number } | null>(null);
  const current =
    focusKey && rowKeys.includes(focusKey)
      ? focusKey
      : activeRowKey && rowKeys.includes(activeRowKey)
        ? activeRowKey
        : (rowKeys[0] ?? null);
  useEffect(() => {
    const target = pending.current;
    const root = virtual.scrollRef.current;
    if (!target || !root) return;
    const row = root.querySelector<HTMLElement>(`[data-row-key="${CSS.escape(target.key)}"]`);
    if (row) {
      pending.current = null;
      row.focus();
      row.scrollIntoView?.({ block: "nearest" });
    } else if (virtual.enabled && count > 0) {
      root.scrollTop = (target.index / count) * root.scrollHeight;
    }
  });
  const onKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, key: string) => {
    if (!enabled || !ROW_NAV_KEYS.has(event.key) || event.target !== event.currentTarget) return;
    const at = rowKeys.indexOf(key);
    const last = rowKeys.length - 1;
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? last
          : event.key === "ArrowDown"
            ? Math.min(last, at + 1)
            : Math.max(0, at - 1);
    const nextKey = rowKeys[next];
    if (nextKey === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    pending.current = { key: nextKey, index: next };
    setFocusKey(nextKey);
  };
  return { current, onKeyDown, setFocusKey };
}

/** Řádky těla DataGrid (s okny virtualizace). */
export function DataGridRows<Row>(props: DataGridRowsProps<Row>) {
  const { layout, items, virtual, texts, rowKey, keySet } = props;
  const { shown, cols, pinned, compact, selectMode, hasRowActions } = layout;
  const colSpan = shown.length + (hasRowActions ? 1 : 0) + (selectMode ? 1 : 0);
  const windowItems = virtual.enabled ? items.slice(virtual.start, virtual.end) : items;
  const roving = Boolean(props.openInSelectMode && props.onRowOpen);
  const rowKeys = roving
    ? items.flatMap((item) => (item.type === "row" ? [rowKey(item.row)] : []))
    : [];
  const rove = useRowRoving(roving, rowKeys, props.activeRowKey, virtual, items.length);
  return (
    <>
      <VirtualPad height={virtual.padTop} colSpan={colSpan} />
      {windowItems.map((item, offset) => {
        const i = (virtual.enabled ? virtual.start : 0) + offset;
        if (item.type === "groupTotal")
          return (
            <TableRow
              key={`gt-${item.key}-${i}`}
              data-slot="grid-group-total"
              className="bg-muted/30 font-semibold hover:bg-muted/30"
            >
              {selectMode ? <TableCell /> : null}
              {shown.map((c, index) => {
                const mode = c.total ?? (c.numeric ? "sum" : "none");
                const sum = mode === "sum" ? item.sums.find((s) => s.id === c.id) : undefined;
                return (
                  <TableCell
                    key={c.id}
                    className={`${cellAlign(c)} whitespace-nowrap ${cols.sectionSeparators.has(c.id) ? "border-l" : ""}`}
                  >
                    {sum
                      ? fmtAmount(sum.total, c.decimals ?? 2)
                      : index === props.groupTotalLabelIndex
                        ? texts.groupTotal(item.label)
                        : null}
                  </TableCell>
                );
              })}
              {hasRowActions ? (
                <TableCell className="sticky right-0 z-[1] border-l bg-card" />
              ) : null}
            </TableRow>
          );
        if (item.type === "group")
          return (
            <GroupHeaderRow
              key={`g-${item.key}-${i}`}
              item={props.groupTotals === "row" ? { ...item, sums: [] } : item}
              colSpan={colSpan}
              onToggle={props.onToggleGroup}
            />
          );
        const row = item.row;
        const key = rowKey(row);
        const selected = keySet.has(key);
        const active = props.activeRowKey === key;
        return (
          <TableRow
            key={key}
            data-virtual-row=""
            data-row-key={roving ? key : undefined}
            tabIndex={roving ? (rove.current === key ? 0 : -1) : undefined}
            onFocus={
              roving
                ? (event) => event.target === event.currentTarget && rove.setFocusKey(key)
                : undefined
            }
            onKeyDown={(event) => {
              rove.onKeyDown(event, key);
              if (
                event.key !== "Enter" ||
                event.defaultPrevented ||
                event.target !== event.currentTarget
              )
                return;
              if (roving && props.onRowOpen) {
                event.preventDefault();
                props.onRowOpen(row);
              }
            }}
            onDoubleClick={
              (!selectMode || props.openInSelectMode) && props.onRowOpen
                ? (event) => {
                    if (isInteractiveTarget(event.target as HTMLElement, event.currentTarget))
                      return;
                    props.onRowOpen?.(row);
                  }
                : undefined
            }
            onClick={
              selectMode
                ? (event) => {
                    if (isInteractiveTarget(event.target as HTMLElement, event.currentTarget))
                      return;
                    props.onToggleKey(key);
                  }
                : props.onRowClick
                  ? () => props.onRowClick?.(row)
                  : undefined
            }
            data-state={selectMode && selected ? "selected" : undefined}
            aria-current={active ? "true" : undefined}
            className={`group/row focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${props.clickable ? "cursor-pointer" : ""} ${
              active
                ? "border-l-2 border-l-primary/60 bg-primary/[0.04] [&>td]:bg-primary/[0.02]"
                : ""
            } ${props.rowClassName?.(row) ?? ""}`}
          >
            {selectMode ? (
              <TableCell className="text-center">
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => props.onToggleKey(key)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={texts.selectRow}
                />
              </TableCell>
            ) : null}
            {shown.map((c) => {
              const cellStyle = compact.has(c.id)
                ? { whiteSpace: "nowrap" as const }
                : fixedWidthStyle(cols.widths[c.id] ?? c.width);
              return (
                <TableCell
                  key={c.id}
                  data-pin-right={c.pinRight || undefined}
                  className={`${cellAlign(c)} [&:has([data-slot=badge])]:text-left ${
                    pinned.has(c.id) ? (c.align === "left" ? "text-left" : "text-center") : ""
                  } ${cols.sectionSeparators.has(c.id) ? "border-l" : ""} ${c.className ?? ""}`}
                  {...(cellStyle ? { style: cellStyle } : {})}
                >
                  {cellContent(c, row, selectMode && selected, props.onIndicatorClick)}
                </TableCell>
              );
            })}
            {hasRowActions ? (
              <TableCell className="sticky right-0 z-[1] !min-w-0 whitespace-nowrap border-l bg-card px-0.5 py-0">
                {props.renderActions(row)}
              </TableCell>
            ) : null}
          </TableRow>
        );
      })}
      <VirtualPad height={virtual.padBottom} colSpan={colSpan} />
    </>
  );
}

/** Ukotvený součtový řádek pod tabulkou. */
export function DataGridTotals<Row>({
  layout,
  cells,
  labelIndex,
  label,
}: {
  layout: DataGridLayout<Row>;
  cells: (ReactNode | null)[];
  labelIndex: number;
  label: string;
}) {
  const { shown, cols, selectMode, hasRowActions } = layout;
  return (
    <TableFooter className="sticky bottom-0 z-10 font-semibold backdrop-blur">
      <TableRow className="hover:bg-transparent">
        {selectMode ? <TableCell /> : null}
        {shown.map((c, i) => (
          <TableCell
            key={c.id}
            data-pin-right={c.pinRight || undefined}
            className={`${cellAlign(c) === "text-left" ? "" : cellAlign(c)} ${
              cols.sectionSeparators.has(c.id) ? "border-l" : ""
            } ${c.className ?? ""}`}
          >
            {cells[i] ??
              (i === labelIndex ? <span className="text-muted-foreground">{label}</span> : null)}
          </TableCell>
        ))}
        {hasRowActions ? (
          <TableCell className="grid-actions-footer sticky right-0 z-[9] !min-w-0 whitespace-nowrap border-l px-0.5 py-2" />
        ) : null}
      </TableRow>
    </TableFooter>
  );
}

/** Boční panel vedle tabulky (detail aktivního řádku); bez obsahu nic. */
export function DataGridSidePanel({ label, children }: { label: string; children: ReactNode }) {
  if (!children) return null;
  return (
    <aside
      data-grid-side-panel
      className="w-[24rem] shrink-0 overflow-y-auto border border-l-0 border-t-0 bg-card p-4"
      aria-label={label}
    >
      {children}
    </aside>
  );
}

/** Pruh pod tabulkou v režimu výběru (souhrn vybraných řádků). */
export function DataGridSummary({ children }: { children: ReactNode }) {
  return (
    <div
      data-slot="grid-selection-summary"
      className="flex flex-wrap items-center gap-2 border border-t-0 bg-secondary/50 px-2 py-1.5 text-sm"
    >
      {children}
    </div>
  );
}
