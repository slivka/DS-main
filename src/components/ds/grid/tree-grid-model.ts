/**
 * Čisté výpočty TreeGrid.
 * Vlastní: sestavení stromu z `parentId`, úrovně uzlů, součty za uzel včetně potomků,
 * hledání se zachováním cesty, zploštění rozbalených uzlů a data exportu se souhrnem pod dětmi.
 * Nesmí: používat React ani stav – vstup → výstup.
 */
import { formatAmount } from "../../../lib/format";
import type { ExportCell, GridExportData } from "../../../lib/excel-export";
import type { TreeGridColumn, TreeGridRow } from "./tree-grid-types";

/** Text buňky stromu (čísla s oddělením tisíců). */
export const treeCellText = <Row extends TreeGridRow>(column: TreeGridColumn<Row>, row: Row) => {
  const raw = column.value?.(row);
  if (raw === null || raw === undefined) return "";
  return typeof raw === "number" ? formatAmount(raw, column.decimals ?? 2) : String(raw);
};

/** Číselná hodnota buňky; nečíselná = 0. */
export const treeNumericValue = <Row extends TreeGridRow>(
  column: TreeGridColumn<Row>,
  row: Row,
) => {
  const raw = column.value?.(row);
  return typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
};

/** Sestavený strom. */
export type TreeStructure<Row> = {
  childrenOf: Map<string, Row[]>;
  roots: Row[];
  byId: Map<string, Row>;
  levelOf: Map<string, number>;
};

/** Strom z plochého seznamu; řádek bez existujícího rodiče je kořen. */
export function buildTree<Row extends TreeGridRow>(rows: Row[]): TreeStructure<Row> {
  const byId = new Map<string, Row>();
  const childrenOf = new Map<string, Row[]>();
  const roots: Row[] = [];
  for (const row of rows) byId.set(row.id, row);
  for (const row of rows) {
    const parent = row.parentId ? byId.get(row.parentId) : null;
    if (parent && parent.id !== row.id) {
      const list = childrenOf.get(parent.id) ?? [];
      list.push(row);
      childrenOf.set(parent.id, list);
    } else roots.push(row);
  }
  const levelOf = new Map<string, number>();
  const walk = (list: Row[], level: number) => {
    for (const row of list) {
      levelOf.set(row.id, level);
      walk(childrenOf.get(row.id) ?? [], level + 1);
    }
  };
  walk(roots, 0);
  return { childrenOf, roots, byId, levelOf };
}

/** Součty číselných sloupců za uzel včetně všech potomků. */
export function treeNodeTotals<Row extends TreeGridRow>(
  columns: TreeGridColumn<Row>[],
  tree: Pick<TreeStructure<Row>, "childrenOf" | "roots">,
) {
  const result = new Map<string, Map<string, number>>();
  const visit = (row: Row): Map<string, number> => {
    const own = new Map<string, number>();
    for (const column of columns) {
      if (column.total === "none" || !column.numeric) continue;
      own.set(column.id, treeNumericValue(column, row));
    }
    for (const child of tree.childrenOf.get(row.id) ?? []) {
      for (const [id, value] of visit(child)) own.set(id, (own.get(id) ?? 0) + value);
    }
    result.set(row.id, own);
    return own;
  };
  for (const root of tree.roots) visit(root);
  return result;
}

/** Nalezené uzly i všichni jejich předci; prázdné hledání = null. */
export function matchTree<Row extends TreeGridRow>(
  rows: Row[],
  columns: TreeGridColumn<Row>[],
  byId: Map<string, Row>,
  query: string,
) {
  const needle = query.trim().toLocaleLowerCase("cs");
  if (!needle) return null;
  const keep = new Set<string>();
  for (const row of rows) {
    const hit = columns.some((column) =>
      treeCellText(column, row).toLocaleLowerCase("cs").includes(needle),
    );
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
}

/** Viditelné uzly v pořadí stromu (sbalené uzly bez potomků, jen nalezené). */
export function flattenTree<Row extends TreeGridRow>(
  list: Row[],
  childrenOf: Map<string, Row[]>,
  isCollapsed: (id: string) => boolean,
  matched: Set<string> | null,
  level = 0,
): { row: Row; level: number }[] {
  return list
    .filter((row) => !matched || matched.has(row.id))
    .flatMap((row) => [
      { row, level },
      ...(isCollapsed(row.id)
        ? []
        : flattenTree(childrenOf.get(row.id) ?? [], childrenOf, isCollapsed, matched, level + 1)),
    ]);
}

/** Vstup exportu stromu. */
export interface TreeExportInput<Row extends TreeGridRow> {
  tree: TreeStructure<Row>;
  shown: TreeGridColumn<Row>[];
  hierarchyColumnId: string | undefined;
  matched: Set<string> | null;
  isCollapsed: (id: string) => boolean;
  nodeTotal: (column: TreeGridColumn<Row>, row: Row) => number | null;
  onlyExpanded: boolean;
}

/** Export: děti nad rodičem (summaryBelow), rodič = SUBTOTAL z rozsahu potomků. */
export function buildTreeExport<Row extends TreeGridRow>({
  tree,
  shown,
  hierarchyColumnId,
  matched,
  isCollapsed,
  nodeTotal,
  onlyExpanded,
}: TreeExportInput<Row>): GridExportData {
  const out: { row: Row; level: number }[] = [];
  const subtotalRows: { row: number; from: number; to: number }[] = [];
  const visit = (row: Row, level: number) => {
    const start = out.length;
    const children =
      onlyExpanded && isCollapsed(row.id)
        ? []
        : (tree.childrenOf.get(row.id) ?? []).filter((child) => !matched || matched.has(child.id));
    for (const child of children) visit(child, level + 1);
    if (out.length > start || (onlyExpanded && (tree.childrenOf.get(row.id)?.length ?? 0) > 0))
      subtotalRows.push({ row: out.length, from: start, to: out.length - 1 });
    out.push({ row, level });
  };
  for (const root of tree.roots) if (!matched || matched.has(root.id)) visit(root, 0);
  return {
    columns: shown.map((column) => column.label),
    rows: out.map(({ row, level }) =>
      shown.map((column): ExportCell => {
        if (column.id === hierarchyColumnId)
          return `${"    ".repeat(level)}${treeCellText(column, row)}`;
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
}
