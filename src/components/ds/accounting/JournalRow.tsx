/**
 * Řádek mřížky dokladu včetně rozbaleného detailu.
 * Vlastní: úchyt přesunu, číslo řádku, rozbalení detailu, akce řádku a připnuté řádky zaokrouhlení.
 * Nesmí: měnit pořadí řádků jinak než přes akce stavu editoru.
 */
import type * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  GripVertical,
  Pin,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { cn } from "../../../lib/utils";
import { TableCell, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { GridAction, GridActions } from "../grid/grid-action";
import { JournalCell } from "./JournalCell";
import { JournalRowDetail } from "./JournalRowDetail";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalLine } from "./journal-lines";
import { isPinnedLine } from "./journal-lines-model";

const AMOUNT_COLUMNS = new Set([
  "amount",
  "quantity",
  "unitPrice",
  "vatRate",
  "vatAmount",
  "grossAmount",
]);

/** Řádek s podporou přetažení; `children` dostane úchyt, styl a ref. */
function SortableRow({
  id,
  disabled,
  label,
  children,
}: {
  id: string;
  disabled: boolean;
  label: string;
  children: (
    handle: React.ReactNode,
    style: React.CSSProperties,
    setNodeRef: (node: HTMLElement | null) => void,
  ) => React.ReactNode;
}) {
  const sortable = useSortable({ id, disabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
    opacity: sortable.isDragging ? 0.65 : 1,
  };
  const handle = disabled ? null : (
    <button
      type="button"
      aria-label={label}
      className="cursor-grab text-muted-foreground active:cursor-grabbing"
      {...sortable.attributes}
      {...sortable.listeners}
    >
      <GripVertical className="size-[1em]" />
    </button>
  );
  return <>{children(handle, style, sortable.setNodeRef)}</>;
}

/** Buňka Ř.: úchyt nebo špendlík, číslo řádku a rozbalení detailu. */
function RowNumberCell({
  line,
  rowIndex,
  handle,
}: {
  line: JournalLine;
  rowIndex: number;
  handle: React.ReactNode;
}) {
  const { editor } = useJournalEditor();
  const { t, expanded } = editor;
  const pinned = isPinnedLine(line);
  return (
    <TableCell key="row" className="journal-row-cell text-muted-foreground">
      <div className="flex items-center justify-center gap-[0.125rem]">
        {pinned ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Pin className="size-[1em]" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {line.isFxRounding ? t.fxRoundingHint : (editor.props.rounding?.label ?? t.rounding)}
            </TooltipContent>
          </Tooltip>
        ) : (
          handle
        )}
        <span className="min-w-[2ch] text-center tabular-nums">{pinned ? "" : rowIndex + 1}</span>
        {!pinned ? (
          <button
            type="button"
            aria-label={expanded[line.id] ? t.hideDetail : t.showDetail}
            onClick={() =>
              editor.setExpanded((state) => ({ ...state, [line.id]: !state[line.id] }))
            }
          >
            {expanded[line.id] ? (
              <ChevronDown className="size-[0.95em]" />
            ) : (
              <ChevronRight className="size-[0.95em]" />
            )}
          </button>
        ) : null}
      </div>
    </TableCell>
  );
}

/** Akce řádku: vrátit ruční daň, duplikovat, odebrat; zaokrouhlení jen odebrat. */
function RowActions({ line }: { line: JournalLine }) {
  const { editor } = useJournalEditor();
  const { t } = editor;
  const rounding = editor.props.rounding;
  if (line.isFxRounding) return null;
  if (line.isRounding)
    return rounding?.onChange && !rounding.readOnly ? (
      <GridAction tone="destructive" aria-label={t.removeLine} onClick={() => editor.remove(line)}>
        <Trash2 />
      </GridAction>
    ) : null;
  if (!editor.editable.size) return null;
  return (
    <GridActions>
      {editor.vatOn && !editor.vatReadOnly && line.vatManual ? (
        <GridAction
          aria-label={t.resetVat}
          onClick={() => editor.patchVat(line, { vatManual: false, vatAmount: undefined })}
        >
          <RotateCcw />
        </GridAction>
      ) : null}
      <GridAction aria-label={t.duplicateLine} onClick={() => editor.duplicate(line)}>
        <Copy />
      </GridAction>
      <GridAction tone="destructive" aria-label={t.removeLine} onClick={() => editor.remove(line)}>
        <Trash2 />
      </GridAction>
    </GridActions>
  );
}

/** Řádek mřížky a pod ním případný detail. */
export function JournalRow({ line, rowIndex }: { line: JournalLine; rowIndex: number }) {
  const { editor } = useJournalEditor();
  const { t, layout } = editor;
  const pinned = isPinnedLine(line);
  const span = layout.visibleColumns.length;
  const pinnedText = line.isFxRounding
    ? line.isVatPreview
      ? t.fxRoundingPreview
      : t.fxRounding
    : (editor.props.rounding?.label ?? t.rounding);
  return (
    <>
      <SortableRow id={line.id} disabled={!editor.canReorder || pinned} label={t.moveRow}>
        {(handle, style, setNodeRef) => (
          <TableRow
            ref={setNodeRef}
            style={style}
            data-grid-row
            data-rounding={line.isRounding ? "" : undefined}
            data-fx-rounding={line.isFxRounding ? "" : undefined}
            className={cn("group/row", pinned && "bg-muted/40 text-muted-foreground")}
          >
            {layout.visibleColumns.map((column) => {
              if (column.id === "row")
                return <RowNumberCell key="row" line={line} rowIndex={rowIndex} handle={handle} />;
              if (column.id === "actions")
                return (
                  <TableCell
                    key="actions"
                    data-pin-right
                    className="grid-actions-cell sticky right-0 z-10 bg-card text-right group-hover/row:bg-muted/50"
                  >
                    <RowActions line={line} />
                  </TableCell>
                );
              if (column.id === "homeAmount")
                return (
                  <TableCell key="homeAmount" className="amount-cell text-right tabular-nums">
                    {editor.displayValue(line, "homeAmount")}
                  </TableCell>
                );
              const id = column.id;
              return (
                <TableCell
                  key={id}
                  className={cn(AMOUNT_COLUMNS.has(id) && "amount-cell text-right tabular-nums")}
                >
                  {id === "text" && pinned ? (
                    pinnedText
                  ) : (
                    <JournalCell line={line} rowIndex={rowIndex} column={id} />
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        )}
      </SortableRow>
      {!pinned && editor.expanded[line.id] ? (
        <TableRow>
          <TableCell colSpan={span} className="p-0">
            <JournalRowDetail line={line} />
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}
