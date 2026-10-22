/**
 * Odečty záloh v editoru řádků · vlastní řádky pod položkami (oddělené čarou), detail,
 * split akci lišty, tři součty a řádky rekapitulace · nesmí počítat zálohy ani DPH (data APP).
 */
import * as React from "react";
import { ChevronDown, ChevronRight, Unlink } from "lucide-react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { TableCell, TableRow } from "../../ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
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

/** Split tlačítko „Odečet zálohy ▾“ v liště: Vybrat zálohu… / Ruční odečet…. */
export function JournalDeductionAdd() {
  const { editor } = useJournalEditor();
  const deductions = editor.props.deductions;
  const t = editor.dsTexts.advances;
  if (!deductions?.onAdd) return null;
  const add = deductions.onAdd;
  const reason = deductions.addDisabledReason;
  const blocked = Boolean(reason);
  const main = (
    <Button
      type="button"
      variant="outline"
      data-slot="journal-deduction-add"
      aria-disabled={blocked || undefined}
      onClick={() => !blocked && add("advance")}
      className="grid-toolbar-control h-[var(--control-h)] rounded-r-none px-[0.75em]"
    >
      {t.deductionAdd}
    </Button>
  );
  return (
    <div className="inline-flex shrink-0" data-slot="journal-deduction-split">
      {blocked ? (
        <DisabledReasonTooltip blocked content={reason}>
          {main}
        </DisabledReasonTooltip>
      ) : (
        main
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={blocked}>
          <Button
            type="button"
            variant="outline"
            aria-label={`${t.deductionAdd} – ${t.actions}`}
            data-slot="journal-deduction-menu"
            className="grid-toolbar-control h-[var(--control-h)] w-[calc(var(--control-h)*0.8)] rounded-l-none border-l-0 px-0"
          >
            <ChevronDown className="size-[1em]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={() => add("advance")}>{t.deductionPick}</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => add("manual")}>{t.deductionManual}</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Součty pod mřížkou: Položky celkem · Odečteno záloh · K úhradě. */
export function JournalDeductionTotals() {
  const { editor } = useJournalEditor();
  const totals = editor.props.deductions?.totals;
  const t = editor.dsTexts.advances;
  if (!totals) return null;
  const items: [string, string, number][] = [
    ["journal-deduction-items", t.itemsTotal, totals.items],
    ["journal-deduction-deducted", t.deductedTotal, totals.deducted],
    ["journal-deduction-to-pay", t.toPayTotal, totals.toPay],
  ];
  return (
    <div
      data-slot="journal-deduction-totals"
      className="flex min-h-[var(--control-h)] flex-wrap items-center justify-end gap-x-4 gap-y-1 border-t bg-muted/40 px-3 py-1 text-sm"
    >
      {items.map(([slot, label, value]) => (
        <span key={slot} data-slot={slot} className="inline-flex items-baseline gap-1.5">
          <span className="text-muted-foreground">{label}</span>
          <span
            className={cn(
              "font-mono tabular-nums",
              value < 0 && "text-destructive",
              slot.endsWith("pay") && "font-semibold",
            )}
          >
            {`${money(value)} ${editor.documentMark}`}
          </span>
        </span>
      ))}
    </div>
  );
}

/** Řádky odečtů a součty podle kódu v rekapitulaci DPH (tbody). */
export function JournalDeductionRecapBody({ span }: { span: number }) {
  const { editor } = useJournalEditor();
  const recap = editor.props.deductions?.recap;
  const t = editor.dsTexts.advances;
  if (!recap) return null;
  const cell = "px-2 py-1 text-right font-mono tabular-nums whitespace-nowrap";
  const tail = span - 4;
  const values = (row: { base: number; vat: number; total?: number }) =>
    [row.base, row.vat, totalOf(row)].map((value, index) => (
      <td key={index} className={cn(cell, value < 0 && "text-destructive")}>
        {money(value)}
      </td>
    ));
  return (
    <tbody data-slot="journal-vat-deductions">
      {recap.deductionRows.map((row) => (
        <tr
          key={row.id}
          data-slot="journal-vat-deduction-row"
          className="h-[var(--control-h)] border-t"
        >
          <td className="truncate px-2 py-1">{row.label}</td>
          {values(row)}
          <td colSpan={tail} />
        </tr>
      ))}
      {recap.totalsByCode.map((row, index) => (
        <tr
          key={row.vatCode}
          data-slot="journal-vat-total-by-code"
          className={cn(
            "h-[var(--control-h)] font-semibold",
            index === 0 ? "border-t-2" : "border-t",
          )}
        >
          <td className="truncate px-2 py-1">{`${t.totalByCode} ${row.vatCode}`}</td>
          {values(row)}
          <td colSpan={tail} />
        </tr>
      ))}
    </tbody>
  );
}
