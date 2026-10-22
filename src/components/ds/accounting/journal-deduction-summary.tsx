/**
 * Lišta, součty a rekapitulace odečtů záloh · vlastní split akci „Odečet zálohy“, tři součty
 * a řádky rekapitulace DPH · nesmí počítat zálohy ani DPH (data APP).
 */
import { ChevronDown } from "lucide-react";

import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { useJournalEditor } from "./journal-editor-context";
import { roundJournalAmount } from "./journal-lines-model";

const money = (value: number) => formatAmount(value, 2);
const totalOf = (row: { base: number; vat: number; total?: number }) =>
  row.total ?? roundJournalAmount(row.base + row.vat);

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
