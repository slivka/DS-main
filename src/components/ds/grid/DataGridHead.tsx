/**
 * Šířky sloupců a záhlaví DataGrid.
 * Vlastní: `colgroup` (šířky podle typu sloupce), řádek sekcí, záhlaví s řazením, autofiltrem,
 * změnou šířky a přetažením, zaškrtnutí všech řádků a záhlaví sloupce akcí.
 * Nesmí: počítat data ani filtry – nabídky a stav filtrů dostává od DataGrid.
 */
import type { CSSProperties } from "react";

import { Checkbox } from "../../ui/checkbox";
import { TableHead, TableHeader, TableRow } from "../../ui/table";
import { ColumnFilter } from "./ColumnFilter";
import { ColumnResizeHandle } from "./grid-column-resize";
import type { useGridColumns } from "./grid-columns";
import { GRID_BOOK_COLUMN_ID } from "./grid-context-bar";
import {
  BRANCH_COLUMN_WIDTH,
  fixedWidthStyle,
  isBranchColumn,
  pinnedColumnWidth,
  zoomedWidth,
} from "./grid-column-presets";
import { SortHead, type useGridSort } from "./grid-sort";
import type { GridTexts } from "./grid-texts";
import type { DataGridColumn } from "./data-grid-types";
import type { FilterOption } from "./data-grid-model";
import type { useColumnDrag } from "./useColumnDrag";

/** Stav sloupců z `useGridColumns`. */
export type GridColumnsState = ReturnType<typeof useGridColumns>;

/** Rozložení sloupců sdílené záhlavím a tělem. */
export interface DataGridLayout<Row> {
  /** Zobrazené sloupce v pořadí. */
  shown: DataGridColumn<Row>[];
  /** Stav sloupců (šířky, sekce). */
  cols: GridColumnsState;
  /** Id připnutých sloupců. */
  pinned: ReadonlySet<string>;
  /** Id kompaktních sloupců. */
  compact: ReadonlySet<string>;
  /** Režim výběru (sloupec zaškrtnutí). */
  selectMode: boolean;
  /** Sloupec akcí řádku. */
  hasRowActions: boolean;
}

/** Šířka sloupce v px; null = kompaktní (šířka podle obsahu). */
export function columnWidth<Row>(layout: DataGridLayout<Row>, c: DataGridColumn<Row>) {
  if (isBranchColumn(c)) return BRANCH_COLUMN_WIDTH;
  if (layout.compact.has(c.id)) return null;
  if (layout.pinned.has(c.id)) return pinnedColumnWidth(c.id);
  return layout.cols.widths[c.id] ?? c.width;
}

const NOWRAP_1PX: CSSProperties = { width: "1px", whiteSpace: "nowrap" };

/** Props záhlaví DataGrid. */
export interface DataGridHeadProps<Row> {
  /** Rozložení sloupců. */
  layout: DataGridLayout<Row>;
  /** Texty gridu. */
  texts: GridTexts;
  /** Zoom gridu (měřítko tažení šířky). */
  zoom: number;
  /** Stav řazení. */
  sort: ReturnType<typeof useGridSort<string>>;
  /** Zobrazit autofiltry v záhlaví. */
  columnFilters: boolean;
  /** Nabídky autofiltru podle sloupce. */
  filterOptions: Map<string, FilterOption[]>;
  /** Vybrané hodnoty autofiltru podle sloupce. */
  colFilters: Record<string, string[]>;
  /** Změna autofiltru sloupce. */
  onColFilterChange: (id: string, next: Set<string>) => void;
  /** Přetažení záhlaví. */
  drag: ReturnType<typeof useColumnDrag>;
  /** Zaškrtnuté všechny viditelné řádky. */
  allSelected: boolean;
  /** Zaškrtnutí / zrušení všech. */
  onToggleAll: () => void;
  /** Popis sloupce akcí. */
  actionsLabel?: string | undefined;
  /** Vzhled bez horní hrany záhlaví. */
  plain?: boolean | undefined;
}

/** `colgroup` se šířkami sloupců. */
export function DataGridColGroup<Row>({ layout }: { layout: DataGridLayout<Row> }) {
  return (
    <colgroup>
      {layout.selectMode ? <col style={{ width: zoomedWidth(40) }} /> : null}
      {layout.shown.map((c) => {
        const w = columnWidth(layout, c);
        return w === null ? (
          <col key={c.id} style={NOWRAP_1PX} />
        ) : (
          <col key={c.id} {...(w ? { style: { width: zoomedWidth(w) } } : {})} />
        );
      })}
      {layout.hasRowActions ? <col style={{ width: "auto", whiteSpace: "nowrap" }} /> : null}
    </colgroup>
  );
}

const alignClass = (c: { align?: string | undefined; numeric?: boolean | undefined }) =>
  c.align === "right" || (c.numeric && !c.align)
    ? "text-right"
    : c.align === "center"
      ? "text-center"
      : "";

/** Ukotvené záhlaví DataGrid. */
export function DataGridHead<Row>(props: DataGridHeadProps<Row>) {
  const { layout, texts, zoom, sort, drag, actionsLabel, plain } = props;
  const { shown, cols, pinned, selectMode, hasRowActions } = layout;
  const scale = () =>
    (typeof document === "undefined"
      ? 1
      : Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 16) * zoom;
  return (
    <TableHeader
      className={`grid-column-header sticky top-0 z-10 ${plain ? "[&_th]:border-t-0" : ""}`}
    >
      {cols.groups.some((g) => g.section) && (
        <TableRow>
          {selectMode ? <TableHead className="w-10" /> : null}
          {cols.groups.map((g, i) => (
            <TableHead
              key={`${g.section}-${i}`}
              colSpan={g.span}
              className="border-l text-center font-semibold text-muted-foreground first:border-l-0"
            >
              {g.section}
            </TableHead>
          ))}
          {hasRowActions ? (
            <TableHead className="grid-actions-header sticky right-0 z-20 w-px border-l px-px py-0" />
          ) : null}
        </TableRow>
      )}
      <TableRow>
        {selectMode ? (
          <TableHead className="w-10 text-center">
            <Checkbox
              checked={props.allSelected}
              onCheckedChange={() => props.onToggleAll()}
              aria-label={texts.selectAllRows}
            />
          </TableHead>
        ) : null}
        {shown.map((c) => {
          const isPinned = pinned.has(c.id);
          const isBook = c.id === GRID_BOOK_COLUMN_ID;
          const isBranch = isBranchColumn(c);
          const width = columnWidth(layout, c);
          const headStyle = width === null ? NOWRAP_1PX : fixedWidthStyle(width);
          const resize =
            isPinned || isBranch || isBook || width === null ? null : (
              <ColumnResizeHandle
                onResize={(w) => cols.setWidth(c.id, w)}
                scale={scale()}
                onReset={() => cols.clearWidth(c.id)}
                texts={texts}
              />
            );
          const headClass = `relative ${isPinned ? (c.align === "left" ? "" : "text-center") : c.align === "center" ? "text-center" : "cursor-grab"} select-none ${drag.dropClass(c.id)} ${c.className ?? ""}`;
          const filter = c.filter ?? (
            <ColumnFilter
              options={props.filterOptions.get(c.id) ?? []}
              selected={new Set(props.colFilters[c.id] ?? [])}
              onChange={(next) => props.onColFilterChange(c.id, next)}
              label={c.label}
              texts={texts}
            />
          );
          const dragProps = drag.dragProps(c.id);
          return c.sortable === false ? (
            <TableHead
              key={c.id}
              data-pin-right={c.pinRight || undefined}
              className={`${alignClass(c)} ${headClass}`}
              {...(headStyle ? { style: headStyle } : {})}
              {...(isPinned || isBook ? {} : dragProps)}
            >
              <span
                className={
                  c.align === "right" || (c.numeric && !c.align)
                    ? "flex w-full items-center justify-end"
                    : c.align === "center"
                      ? "flex w-full items-center justify-center"
                      : "inline-flex items-center gap-1"
                }
              >
                {c.label}
                {props.columnFilters ? filter : null}
              </span>
              {resize}
            </TableHead>
          ) : (
            <SortHead
              key={c.id}
              id={c.id}
              label={c.label}
              sort={sort}
              align={c.align ?? (c.numeric ? "right" : "left")}
              className={headClass}
              pinRight={c.pinRight}
              {...(headStyle ? { style: headStyle } : {})}
              dragProps={isPinned ? {} : dragProps}
              texts={texts}
            >
              {props.columnFilters ? filter : null}
              {resize}
            </SortHead>
          );
        })}
        {hasRowActions ? (
          <TableHead
            className="grid-actions-header sticky right-0 z-20 w-px whitespace-nowrap border-l px-2 py-0 text-center"
            aria-label={actionsLabel ?? texts.actions}
            title={actionsLabel ?? texts.actions}
          >
            {actionsLabel ?? texts.actions}
          </TableHead>
        ) : null}
      </TableRow>
    </TableHeader>
  );
}
