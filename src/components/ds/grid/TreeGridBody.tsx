/**
 * Řádky a součtový řádek TreeGrid.
 * Vlastní: řádek uzlu (odsazení podle úrovně, tlačítko rozbalení, zvýraznění, výběr, akce),
 * prázdný stav a celkový součet.
 * Nesmí: počítat strom ani součty – dostává je hotové od TreeGrid.
 */
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Checkbox } from "../../ui/checkbox";
import { TableCell, TableFooter, TableRow } from "../../ui/table";
import { amountClass, formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { treeCellText, treeNumericValue } from "./tree-grid-model";
import type { TreeGridColumn, TreeGridRow } from "./tree-grid-types";

/** Zarovnání buňky stromu. */
export const treeAlignClass = <Row extends TreeGridRow>(column: TreeGridColumn<Row>) =>
  cn(
    column.align === "center" && "text-center",
    (column.align === "right" || (column.numeric && !column.align)) && "text-right tabular-nums",
  );

/** Props řádků stromu. */
export interface TreeGridRowsProps<Row extends TreeGridRow> {
  /** Viditelné uzly. */
  visible: { row: Row; level: number }[];
  /** Zobrazené sloupce. */
  shown: TreeGridColumn<Row>[];
  /** Sloupec s hierarchií. */
  hierarchyColumnId: string | undefined;
  /** Potomci uzlu. */
  childrenOf: Map<string, Row[]>;
  /** Uzel je sbalený. */
  isCollapsed: (id: string) => boolean;
  /** Přepnutí uzlu. */
  onToggleNode: (id: string) => void;
  /** Součet uzlu ve sloupci (null = sloupec bez součtu). */
  nodeTotal: (column: TreeGridColumn<Row>, row: Row) => number | null;
  /** Zvýrazněný uzel. */
  highlighted: string | null;
  /** Klik na řádek. */
  onRowClick: (row: Row) => void;
  /** Dvojklik na řádek. */
  onRowDoubleClick: (row: Row) => void;
  /** Režim výběru. */
  selectMode: boolean;
  /** Vybrané uzly. */
  selectedIds: ReadonlySet<string>;
  /** Přepnutí výběru uzlu. */
  onToggleRow: (id: string) => void;
  /** Sloupec akcí. */
  hasRowActions: boolean;
  /** Obsah buňky akcí. */
  renderActions: (row: Row) => ReactNode;
  /** Text prázdného stromu. */
  emptyLabel: string;
  /** Přístupný název zaškrtnutí řádku. */
  selectRowLabel: string;
  /** Přístupné názvy tlačítka uzlu. */
  nodeLabels: { expand: string; collapse: string };
}

/** Obsah buňky uzlu (hierarchie s tlačítkem, vlastní vykreslení, částka, text). */
function TreeCell<Row extends TreeGridRow>({
  column,
  row,
  level,
  props,
}: {
  column: TreeGridColumn<Row>;
  row: Row;
  level: number;
  props: TreeGridRowsProps<Row>;
}) {
  const total = props.nodeTotal(column, row);
  const numericShown = column.numeric ? (total ?? treeNumericValue(column, row)) : null;
  const isHierarchy = column.id === props.hierarchyColumnId;
  const canExpand = (props.childrenOf.get(row.id)?.length ?? 0) > 0;
  const collapsed = props.isCollapsed(row.id);
  const content = column.render
    ? column.render(row, total)
    : column.numeric && !isHierarchy
      ? formatAmount(numericShown ?? 0, column.decimals ?? 2)
      : treeCellText(column, row);
  return (
    <TableCell
      className={cn(
        "whitespace-nowrap",
        treeAlignClass(column),
        column.numeric && amountClass(numericShown),
      )}
      style={isHierarchy ? { paddingLeft: `${level * 1.5 + 0.9}em` } : undefined}
    >
      {isHierarchy ? (
        <span className="flex items-center gap-1">
          {canExpand ? (
            <button
              type="button"
              aria-label={collapsed ? props.nodeLabels.expand : props.nodeLabels.collapse}
              aria-expanded={!collapsed}
              className="flex size-5 shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-ring"
              onClick={(event) => {
                event.stopPropagation();
                props.onToggleNode(row.id);
              }}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}
          {content}
        </span>
      ) : (
        content
      )}
    </TableCell>
  );
}

/** Řádky stromu nebo prázdný stav. */
export function TreeGridRows<Row extends TreeGridRow>(props: TreeGridRowsProps<Row>) {
  const { visible, shown, selectMode, hasRowActions } = props;
  if (visible.length === 0)
    return (
      <TableRow>
        <TableCell
          colSpan={shown.length + (selectMode ? 1 : 0) + (hasRowActions ? 1 : 0)}
          className="py-8 text-center text-muted-foreground"
        >
          {props.emptyLabel}
        </TableCell>
      </TableRow>
    );
  return (
    <>
      {visible.map(({ row, level }) => {
        const canExpand = (props.childrenOf.get(row.id)?.length ?? 0) > 0;
        const isHighlighted = props.highlighted === row.id;
        return (
          <TableRow
            key={row.id}
            data-row-id={row.id}
            data-highlighted={isHighlighted || undefined}
            aria-selected={isHighlighted}
            onClick={() => props.onRowClick(row)}
            onDoubleClick={() => props.onRowDoubleClick(row)}
            className={cn(
              canExpand && "font-medium",
              isHighlighted && "bg-primary/10 hover:bg-primary/15",
            )}
          >
            {selectMode ? (
              <TableCell className="w-10 text-center">
                <Checkbox
                  checked={props.selectedIds.has(row.id)}
                  onCheckedChange={() => props.onToggleRow(row.id)}
                  aria-label={props.selectRowLabel}
                  onClick={(event) => event.stopPropagation()}
                />
              </TableCell>
            ) : null}
            {shown.map((column) => (
              <TreeCell key={column.id} column={column} row={row} level={level} props={props} />
            ))}
            {hasRowActions ? (
              <TableCell className="sticky right-0 z-[1] !min-w-0 whitespace-nowrap border-l bg-card px-0.5 py-0">
                {props.renderActions(row)}
              </TableCell>
            ) : null}
          </TableRow>
        );
      })}
    </>
  );
}

/** Celkový součet stromu pod tabulkou. */
export function TreeGridTotals<Row extends TreeGridRow>({
  shown,
  hierarchyColumnId,
  totals,
  label,
  selectMode,
  hasRowActions,
}: {
  shown: TreeGridColumn<Row>[];
  hierarchyColumnId: string | undefined;
  totals: Map<string, number>;
  label: string;
  selectMode: boolean;
  hasRowActions: boolean;
}) {
  return (
    <TableFooter>
      <TableRow>
        {selectMode ? <TableCell /> : null}
        {shown.map((column) => (
          <TableCell
            key={column.id}
            className={cn(
              "whitespace-nowrap font-semibold",
              column.numeric && "text-right tabular-nums",
            )}
          >
            {column.id === hierarchyColumnId
              ? label
              : column.numeric && column.total !== "none"
                ? formatAmount(totals.get(column.id) ?? 0, column.decimals ?? 2)
                : null}
          </TableCell>
        ))}
        {hasRowActions ? (
          <TableCell className="grid-actions-footer sticky right-0 z-[9] !min-w-0 whitespace-nowrap border-l px-0.5 py-2" />
        ) : null}
      </TableRow>
    </TableFooter>
  );
}
