/**
 * Odečty záloh v editoru řádků · vlastní řádky pod položkami (oddělené čarou), detail,
 * split akci lišty, tři součty a řádky rekapitulace · nesmí počítat zálohy ani DPH (data APP).
 */
import * as React from "react";
import { ChevronDown, ChevronRight, Unlink } from "lucide-react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { TableCell, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { DecimalInput } from "../form/decimal-input";
import { GridAction, GridActions } from "../grid/grid-action";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalDeductionRow } from "./journal-deductions-types";
import { isAccountColumn, isAccountNameColumn, roundJournalAmount } from "./journal-lines-model";

const money = (value: number) => formatAmount(value, 2);
const totalOf = (row: { base: number; vat: number; total?: number }) =>
  row.total ?? roundJournalAmount(row.base + row.vat);
const AMOUNT = "text-right font-mono tabular-nums";

/** Text detailu (stav · platba · DD) pro bublinu i rozbalení. */
function detailItems(
  row: JournalDeductionRow,
  t: { status: string; payment: string; taxDocument: string },
) {
  return [
    [t.status, row.status],
    [t.payment, row.payment],
    [t.taxDocument, row.taxDocument],
  ].filter((item): item is [string, string] => Boolean(item[1]));
}

/** Obsah jedné buňky řádku odečtu. */
function DeductionCell({
  row,
  columnId,
  accountId,
}: {
  row: JournalDeductionRow;
  columnId: string;
  accountId?: string;
}) {
  const { editor } = useJournalEditor();
  const deductions = editor.props.deductions;
  const t = editor.dsTexts.advances;
  const amount = (value: number) => (
    <span className={cn(value < 0 && "text-destructive")}>{money(value)}</span>
  );
  if (columnId === "text") {
    const items = detailItems(row, t);
    if (items.length === 0) return <span className="truncate">{row.text}</span>;
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block truncate">{row.text}</span>
        </TooltipTrigger>
        <TooltipContent>
          {items.map(([label, value]) => `${label}: ${value}`).join(" · ")}
        </TooltipContent>
      </Tooltip>
    );
  }
  if (columnId === "vatCode") return <>{row.vatCode}</>;
  if (columnId === "amount") {
    if (row.kind === "manual" && deductions?.onAmountChange)
      return (
        <DecimalInput
          aria-label={`${row.text} – ${t.base}`}
          data-slot="journal-deduction-amount"
          value={row.base}
          onChange={(value) => {
            if (value !== "") deductions.onAmountChange?.(row, Number(value));
          }}
          className="h-[calc(var(--control-h)-0.25rem)]"
        />
      );
    return amount(row.base);
  }
  if (columnId === "vatAmount") return amount(row.vat);
  if (columnId === "grossAmount") return amount(totalOf(row));
  if (columnId === accountId) return <>{row.account}</>;
  return null;
}

/** Jeden řádek odečtu s rozbalitelným detailem. */
function DeductionRow({
  row,
  first,
  onRemove,
}: {
  row: JournalDeductionRow;
  first: boolean;
  onRemove: (row: JournalDeductionRow) => void;
}) {
  const { editor } = useJournalEditor();
  const t = editor.dsTexts.advances;
  const [open, setOpen] = React.useState(false);
  const columns = editor.layout.visibleColumns;
  const accountId = columns.find((c) => isAccountColumn(c.id) && !isAccountNameColumn(c.id))?.id;
  const items = detailItems(row, t);
  return (
    <>
      <TableRow
        data-slot="journal-deduction-row"
        data-kind={row.kind}
        className={cn("bg-muted/20", first && "border-t-2 border-t-border")}
      >
        {columns.map((column) => (
          <TableCell
            key={column.id}
            data-pin-right={column.id === "actions" || undefined}
            className={cn(
              column.id === "row" && "journal-row-cell",
              column.align === "right" && AMOUNT,
              column.id === "actions" && "sticky right-0 z-10 bg-card",
            )}
          >
            {column.id === "row" && items.length > 0 ? (
              <button
                type="button"
                aria-expanded={open}
                aria-label={t.deductionDetail}
                data-slot="journal-deduction-toggle"
                onClick={() => setOpen((value) => !value)}
                className="inline-flex size-[1.4em] items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {open ? (
                  <ChevronDown className="size-[1em]" />
                ) : (
                  <ChevronRight className="size-[1em]" />
                )}
              </button>
            ) : column.id === "actions" && row.remove ? (
              <GridActions>
                <GridAction
                  aria-label={`${t.remove}: ${row.text}`}
                  data-slot="journal-deduction-remove"
                  tone="destructive"
                  disabled={!row.remove.can}
                  disabledReason={row.remove.reason}
                  onClick={() => onRemove(row)}
                >
                  <Unlink />
                </GridAction>
              </GridActions>
            ) : (
              <DeductionCell row={row} columnId={column.id} accountId={accountId} />
            )}
          </TableCell>
        ))}
      </TableRow>
      {open ? (
        <TableRow data-slot="journal-deduction-detail" className="bg-muted/20">
          <TableCell colSpan={columns.length} className="text-muted-foreground">
            {items.map(([label, value]) => (
              <span key={label} className="mr-4">
                {label}: <span className="text-foreground">{value}</span>
              </span>
            ))}
          </TableCell>
        </TableRow>
      ) : null}
    </>
  );
}

/** Řádky odečtů pod položkami; první je oddělen čarou. */
export function JournalDeductionRows() {
  const { editor } = useJournalEditor();
  const deductions = editor.props.deductions;
  const t = editor.dsTexts.advances;
  const { confirm, confirmDialog } = useConfirmDialog();
  if (!deductions || deductions.rows.length === 0) return null;
  const remove = (row: JournalDeductionRow) => {
    if (!row.remove?.can) return;
    if (deductions.confirmRemove === false) return deductions.onRemove?.(row, "");
    const reason = deductions.removeReason;
    confirm({
      title: t.remove,
      description: row.text,
      confirmLabel: t.remove,
      destructive: true,
      reason: reason
        ? {
            label: reason.label ?? t.removeReason,
            required: reason.required,
            placeholder: reason.placeholder,
          }
        : undefined,
      onConfirm: (text) => deductions.onRemove?.(row, text),
    });
  };
  return (
    <>
      {deductions.rows.map((row, index) => (
        <DeductionRow key={row.id} row={row} first={index === 0} onRemove={remove} />
      ))}
      {confirmDialog ? (
        <tr hidden>
          <td>{confirmDialog}</td>
        </tr>
      ) : null}
    </>
  );
}
