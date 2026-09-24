import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Button } from "../../ui/button";
import { GridSearch } from "./grid-search";
import { ExcelExportButton } from "./grid-export";
import { ColumnPicker } from "./column-picker";
import { useGridColumns } from "./grid-columns";
import { ZoomControl, gridFontSize, useGridZoom } from "./grid-zoom";
import { amountClass, formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import type { ExcelColumnType, ExcelExportMeta, ExportCell, GridExportData } from "../../../lib/excel-export";

export type TreeGridRow = { id: string; parentId?: string | null };

export type TreeGridColumn<Row extends TreeGridRow> = {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Číselný sloupec – vpravo, tisíce mezerou, se součtem za uzel. */
  numeric?: boolean;
  decimals?: number;
  /** Souhrn za uzel a za celou tabulku; u číselných sloupců výchozí „sum“. */
  total?: "sum" | "none";
  /** Hodnota pro zobrazení, hledání i export. */
  value?: (row: Row) => string | number | null | undefined;
  /** Vlastní vykreslení buňky; `total` je souhrn za uzel včetně potomků. */
  render?: (row: Row, total: number | null) => ReactNode;
  exportType?: ExcelColumnType;
  width?: number;
  /** Sloupec je ve výchozím stavu skrytý (lze zapnout ve výběru sloupců). */
  hiddenByDefault?: boolean;
};

/** Úroveň rozbalení – `depth` = počet rozbalených úrovní (0 = jen kořeny). */
export type TreeGridExpandLevel = { id: string; label: string; depth: number };

export type TreeGridTexts = {
  searchPlaceholder: string;
  expandAll: string;
  collapseAll: string;
  expandNode: string;
  collapseNode: string;
  levelsLabel: string;
  emptyLabel: string;
  totalLabel: string;
  exportLabel: string;
  columnsTitle: string;
};

export const DEFAULT_TREE_GRID_TEXTS: TreeGridTexts = {
  searchPlaceholder: "Hledat…",
  expandAll: "Rozbalit vše",
  collapseAll: "Sbalit vše",
  expandNode: "Rozbalit",
  collapseNode: "Sbalit",
  levelsLabel: "Úroveň rozbalení",
  emptyLabel: "Zatím zde nejsou žádné položky",
  totalLabel: "Celkem",
  exportLabel: "Export do Excelu",
  columnsTitle: "Sloupce",
};

export interface TreeGridProps<Row extends TreeGridRow> {
  rows: Row[];
  columns: TreeGridColumn<Row>[];
  title: string;
  /** Klíč pro uložení zoomu a viditelnosti sloupců (výchozí z `exportName` / `title`). */
  storageKey?: string;
  /** Základ názvu souboru exportu; bez něj se tlačítko exportu nezobrazí. */
  exportName?: string;
  exportMeta?: ExcelExportMeta;
  defaultCollapsed?: boolean;
  /** Tlačítka úrovní rozbalení v liště, např. Třídy · Skupiny · Účty · Vše. */
  expandLevels?: TreeGridExpandLevel[];
  /** Řízená úroveň rozbalení (hloubka). */
  expandDepth?: number;
  onExpandDepthChange?: (depth: number) => void;
  /** Zvýrazněný uzel; bez zadání se zvýrazní naposledy rozbalený / vybraný uzel. */
  highlightedRowId?: string | null;
  /** Klik na řádek (výběr). */
  onRowClick?: (row: Row) => void;
  onRowOpen?: (row: Row) => void;
  /** Akce „Nový“ a další – v liště vpravo od zoomu. */
  actions?: ReactNode;
  texts?: Partial<TreeGridTexts>;
  className?: string;
}

const cellText = <Row extends TreeGridRow>(column: TreeGridColumn<Row>, row: Row) => {
  const raw = column.value?.(row);
  if (raw === null || raw === undefined) return "";
  return typeof raw === "number" ? formatAmount(raw, column.decimals ?? 2) : String(raw);
};

const numericValue = <Row extends TreeGridRow>(column: TreeGridColumn<Row>, row: Row) => {
  const raw = column.value?.(row);
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
};

/**
 * Stromová varianta datové mřížky – úrovně rozbalení, zvýraznění uzlu, součty za uzel,
 * hledání se zachováním cesty, výběr sloupců, zoom a export do Excelu
 * se souhrnným řádkem pod dětmi (vzorce SUBTOTAL). Pro osnovu, výkazy a zakázky.
 */
export function TreeGrid<Row extends TreeGridRow>({
  rows,
  columns,
  title,
  storageKey,
  exportName,
  exportMeta,
  defaultCollapsed = false,
  expandLevels,
  expandDepth,
  onExpandDepthChange,
  highlightedRowId,
  onRowClick,
  onRowOpen,
  actions,
  texts,
  className,
}: TreeGridProps<Row>) {
  const t = { ...DEFAULT_TREE_GRID_TEXTS, ...texts };
  const key = storageKey ?? `tree:${exportName ?? title}`;
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [ownDepth, setOwnDepth] = useState<number | null>(null);
  const [autoHighlight, setAutoHighlight] = useState<string | null>(null);
  const { zoom, setZoom, density, setDensity } = useGridZoom(key);

  const colDefs = useMemo(
    () =>
      columns.map((column, index) => ({
        id: column.id,
        label: column.label,
        ...(index === 0 ? { locked: true } : {}),
        ...(column.hiddenByDefault ? { defaultVisible: false } : {}),
      })),
    [columns],
  );
  const cols = useGridColumns(key, colDefs);
  const byColumnId = useMemo(() => new Map(columns.map((c) => [c.id, c])), [columns]);
  const shown = useMemo(
    () => cols.columns.filter((c) => cols.visible[c.id]).map((c) => byColumnId.get(c.id)!).filter(Boolean),
    [cols.columns, cols.visible, byColumnId],
  );

  const { childrenOf, roots, byId, levelOf } = useMemo(() => {
    const map = new Map<string, Row>();
    const children = new Map<string, Row[]>();
    const rootRows: Row[] = [];
    for (const row of rows) map.set(row.id, row);
    for (const row of rows) {
      const parent = row.parentId ? map.get(row.parentId) : null;
      if (parent && parent.id !== row.id) {
        const list = children.get(parent.id) ?? [];
        list.push(row);
        children.set(parent.id, list);
      } else rootRows.push(row);
    }
    const levels = new Map<string, number>();
    const walk = (list: Row[], level: number) => {
      for (const row of list) {
        levels.set(row.id, level);
        walk(children.get(row.id) ?? [], level + 1);
      }
    };
    walk(rootRows, 0);
    return { childrenOf: children, roots: rootRows, byId: map, levelOf: levels };
  }, [rows]);

  const applyDepth = (depth: number) => {
    setCollapsed(Object.fromEntries(rows.map((row) => [row.id, (levelOf.get(row.id) ?? 0) >= depth])));
  };

  useEffect(() => {
    if (expandDepth !== undefined) applyDepth(expandDepth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandDepth, levelOf]);

  const activeDepth = expandDepth ?? ownDepth;
  const selectDepth = (depth: number) => {
    setOwnDepth(depth);
    if (expandDepth === undefined) applyDepth(depth);
    onExpandDepthChange?.(depth);
  };

  /** Součty za uzel včetně všech potomků. */
  const totals = useMemo(() => {
    const result = new Map<string, Map<string, number>>();
    const visit = (row: Row): Map<string, number> => {
      const own = new Map<string, number>();
      for (const column of columns) {
        if (column.total === "none" || !column.numeric) continue;
        own.set(column.id, numericValue(column, row));
      }
      for (const child of childrenOf.get(row.id) ?? []) {
        for (const [id, value] of visit(child)) own.set(id, (own.get(id) ?? 0) + value);
      }
      result.set(row.id, own);
      return own;
    };
    for (const root of roots) visit(root);
    return result;
  }, [columns, childrenOf, roots]);

  /** Hledání zachová cestu – zobrazí nalezené uzly i všechny jejich předky. */
  const matched = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("cs");
    if (!needle) return null;
    const keep = new Set<string>();
    for (const row of rows) {
      const hit = columns.some((column) => cellText(column, row).toLocaleLowerCase("cs").includes(needle));
      if (!hit) continue;
      keep.add(row.id);
      let parentId = row.parentId ?? null;
      let guard = 0;
      while (parentId && guard++ < 50) {
        keep.add(parentId);
        parentId = byId.get(parentId)?.parentId ?? null;
      }
    }
    return keep;
  }, [byId, columns, query, rows]);

  const isCollapsed = (id: string) => (matched ? false : (collapsed[id] ?? defaultCollapsed) === true);

  const toggleNode = (id: string) => {
    const willExpand = isCollapsed(id);
    setCollapsed({ ...collapsed, [id]: !willExpand });
    setOwnDepth(null);
    if (willExpand) setAutoHighlight(id);
  };

  const flatten = (list: Row[], level: number): { row: Row; level: number }[] =>
    list
      .filter((row) => !matched || matched.has(row.id))
      .flatMap((row) => [
        { row, level },
        ...(isCollapsed(row.id) ? [] : flatten(childrenOf.get(row.id) ?? [], level + 1)),
      ]);

  const visible = flatten(roots, 0);
  const highlighted = highlightedRowId !== undefined ? highlightedRowId : autoHighlight;

  const grandTotals = new Map<string, number>();
  for (const root of roots) {
    if (matched && !matched.has(root.id)) continue;
    for (const [id, value] of totals.get(root.id) ?? []) grandTotals.set(id, (grandTotals.get(id) ?? 0) + value);
  }

  const hasTotals = shown.some((column) => column.numeric && column.total !== "none");
  const nodeTotal = (column: TreeGridColumn<Row>, row: Row) =>
    column.numeric && column.total !== "none" ? (totals.get(row.id)?.get(column.id) ?? null) : null;

  /** Export: děti nad rodičem (summaryBelow), rodič = SUBTOTAL z rozsahu potomků. */
  const exportData = (): GridExportData => {
    const out: { row: Row; level: number }[] = [];
    const subtotalRows: { row: number; from: number; to: number }[] = [];
    const visit = (row: Row, level: number) => {
      const start = out.length;
      const children = (childrenOf.get(row.id) ?? []).filter((child) => !matched || matched.has(child.id));
      for (const child of children) visit(child, level + 1);
      if (out.length > start) subtotalRows.push({ row: out.length, from: start, to: out.length - 1 });
      out.push({ row, level });
    };
    for (const root of roots) if (!matched || matched.has(root.id)) visit(root, 0);
    return {
      columns: shown.map((column) => column.label),
      rows: out.map(({ row, level }) =>
        shown.map((column, index): ExportCell => {
          if (index === 0) return `${"    ".repeat(level)}${cellText(column, row)}`;
          const total = nodeTotal(column, row);
          if (total !== null) return total;
          const raw = column.value?.(row);
          return raw === undefined ? null : raw;
        }),
      ),
      rowLevels: out.map(({ level }) => level),
      outlineSummaryBelow: true,
      subtotalRows,
      columnMeta: shown.map((column) => ({
        type: column.exportType ?? (column.numeric ? "number" : "text"),
        align: column.align ?? (column.numeric ? "right" : "left"),
        total: column.numeric && column.total !== "none" ? "sum" : "none",
      })),
    };
  };

  const alignClass = (column: TreeGridColumn<Row>) =>
    cn(
      column.align === "center" && "text-center",
      (column.align === "right" || (column.numeric && !column.align)) && "text-right tabular-nums",
    );

  return (
    <div className={cn("rounded-lg border bg-card", className)} data-slot="tree-grid">
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <span className="font-semibold">{title}</span>
        {expandLevels?.length ? (
          <div
            role="group"
            aria-label={t.levelsLabel}
            className="grid-toolbar-control flex items-center rounded-md border bg-card p-0.5"
          >
            {expandLevels.map((level) => (
              <Button
                key={level.id}
                type="button"
                size="sm"
                variant={activeDepth === level.depth ? "secondary" : "ghost"}
                aria-pressed={activeDepth === level.depth}
                disabled={Boolean(matched)}
                className="h-7 px-2.5"
                onClick={() => selectDepth(level.depth)}
              >
                {level.label}
              </Button>
            ))}
          </div>
        ) : null}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <GridSearch value={query} onChange={setQuery} placeholder={t.searchPlaceholder} zoom={zoom} />
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(matched)}
            onClick={() => {
              setCollapsed(Object.fromEntries(rows.map((row) => [row.id, false])));
              setOwnDepth(null);
            }}
          >
            {t.expandAll}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={Boolean(matched)}
            onClick={() => {
              setCollapsed(Object.fromEntries(rows.map((row) => [row.id, true])));
              setOwnDepth(null);
            }}
          >
            {t.collapseAll}
          </Button>
          {exportName ? (
            <ExcelExportButton
              getData={exportData}
              exportName={exportName}
              title={title}
              meta={{ ...exportMeta, ...(query.trim() ? { filters: [...(exportMeta?.filters ?? []), `Hledání: ${query.trim()}`] } : {}) }}
              label={t.exportLabel}
            />
          ) : null}
          <ColumnPicker
            columns={cols.columns.map((c) => ({ id: c.id, label: c.label, ...(c.locked ? { locked: true } : {}) }))}
            visible={cols.columnVisible}
            onToggle={cols.toggle}
            onReorder={cols.reorder}
            onReset={cols.reset}
            zoom={zoom}
            title={t.columnsTitle}
          />
          <ZoomControl zoom={zoom} setZoom={setZoom} density={density} setDensity={setDensity} />
          {actions}
        </div>
      </div>

      <div style={{ fontSize: gridFontSize(zoom) }}>
        <Table className={cn(density === "compact" && "[&_td]:py-1 [&_th]:h-8")}>
          <TableHeader>
            <TableRow>
              {shown.map((column) => (
                <TableHead
                  key={column.id}
                  style={column.width ? { width: `${column.width / 13}em` } : undefined}
                  className={alignClass(column)}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={shown.length} className="py-8 text-center text-muted-foreground">
                  {t.emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              visible.map(({ row, level }) => {
                const canExpand = (childrenOf.get(row.id)?.length ?? 0) > 0;
                const isHighlighted = highlighted === row.id;
                return (
                  <TableRow
                    key={row.id}
                    data-row-id={row.id}
                    data-highlighted={isHighlighted || undefined}
                    aria-selected={isHighlighted}
                    onClick={() => {
                      setAutoHighlight(row.id);
                      onRowClick?.(row);
                    }}
                    onDoubleClick={() => onRowOpen?.(row)}
                    className={cn(canExpand && "font-medium", isHighlighted && "bg-primary/10 hover:bg-primary/15")}
                  >
                    {shown.map((column, index) => {
                      const total = nodeTotal(column, row);
                      const numericShown = column.numeric ? (total ?? numericValue(column, row)) : null;
                      return (
                        <TableCell
                          key={column.id}
                          className={cn("whitespace-nowrap", alignClass(column), column.numeric && amountClass(numericShown))}
                          style={index === 0 ? { paddingLeft: `${level * 1.5 + 0.9}em` } : undefined}
                        >
                          {index === 0 ? (
                            <span className="flex items-center gap-1">
                              {canExpand ? (
                                <button
                                  type="button"
                                  aria-label={isCollapsed(row.id) ? t.expandNode : t.collapseNode}
                                  aria-expanded={!isCollapsed(row.id)}
                                  className="flex size-5 shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    toggleNode(row.id);
                                  }}
                                >
                                  {isCollapsed(row.id) ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
                                </button>
                              ) : (
                                <span className="size-5 shrink-0" />
                              )}
                              {column.render ? column.render(row, total) : cellText(column, row)}
                            </span>
                          ) : column.render ? (
                            column.render(row, total)
                          ) : column.numeric ? (
                            formatAmount(numericShown ?? 0, column.decimals ?? 2)
                          ) : (
                            cellText(column, row)
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
          {hasTotals && visible.length > 0 ? (
            <TableFooter>
              <TableRow>
                {shown.map((column, index) => (
                  <TableCell key={column.id} className={cn("whitespace-nowrap font-semibold", column.numeric && "text-right tabular-nums")}>
                    {index === 0
                      ? t.totalLabel
                      : column.numeric && column.total !== "none"
                        ? formatAmount(grandTotals.get(column.id) ?? 0, column.decimals ?? 2)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>
    </div>
  );
}
