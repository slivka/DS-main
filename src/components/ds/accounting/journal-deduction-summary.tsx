/**
 * Lišta, součty a rekapitulace odečtů záloh · vlastní split akci „Odečet zálohy“, tři součty
 * a řádky rekapitulace DPH · nesmí počítat zálohy ani DPH (data APP).
 */
import * as React from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";

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
import { GridToolbarOverflowContext } from "../grid/grid-toolbar-context";
import { useJournalEditor } from "./journal-editor-context";
import type { JournalDeductionKind, JournalDeductionRecapRow } from "./journal-deductions-types";

const money = (value: number) => formatAmount(value, 2);

/** Položky nabídky odečtu. */
function DeductionMenuItems({ add }: { add: (kind: JournalDeductionKind) => void }) {
  const { editor } = useJournalEditor();
  const t = editor.dsTexts.advances;
  return (
    <>
      <DropdownMenuItem onSelect={() => add("advance")}>{t.deductionPick}</DropdownMenuItem>
      <DropdownMenuItem onSelect={() => add("manual")}>{t.deductionManual}</DropdownMenuItem>
    </>
  );
}

/**
 * Split tlačítko „Odečet zálohy ▾“ v liště: Vybrat zálohu… / Ruční odečet….
 * Při úzké liště (úroveň přetečení 3) se sbalí do jednoho tlačítka „…“ s toutéž nabídkou.
 */
export function JournalDeductionAdd() {
  const { editor } = useJournalEditor();
  const overflow = React.useContext(GridToolbarOverflowContext);
  const deductions = editor.props.deductions;
  const t = editor.dsTexts.advances;
  if (!deductions?.onAdd) return null;
  const add = deductions.onAdd;
  const reason = deductions.addDisabledReason;
  const blocked = Boolean(reason);
  const tip = (node: React.ComponentProps<typeof DisabledReasonTooltip>["children"]) =>
    blocked ? (
      <DisabledReasonTooltip blocked content={reason}>
        {node}
      </DisabledReasonTooltip>
    ) : (
      node
    );
  if (overflow >= 3)
    return (
      <div className="inline-flex shrink-0" data-slot="journal-deduction-split" data-toolbar-overflow-item="" data-compact="">
        <DropdownMenu>
          {tip(
            <DropdownMenuTrigger asChild disabled={blocked}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={t.deductionAdd}
                aria-disabled={blocked || undefined}
                data-slot="journal-deduction-menu"
                className="grid-toolbar-control h-[var(--control-h)] w-[var(--control-h)]"
              >
                <MoreHorizontal className="size-[1.2em]" />
              </Button>
            </DropdownMenuTrigger>,
          )}
          <DropdownMenuContent align="start">
            <DeductionMenuItems add={add} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  return (
    <div
      role="group"
      aria-label={t.deductionAdd}
      className="inline-flex shrink-0"
      data-slot="journal-deduction-split"
      data-toolbar-overflow-item=""
    >
      {tip(
        <Button
          type="button"
          variant="outline"
          data-slot="journal-deduction-add"
          aria-disabled={blocked || undefined}
          onClick={() => !blocked && add("advance")}
          className="grid-toolbar-control h-[var(--control-h)] rounded-r-none px-[0.75em]"
        >
          {t.deductionAdd}
        </Button>,
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
          <DeductionMenuItems add={add} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** Součty pod mřížkou od APP: Položky celkem · Odečteno záloh · (Zaokrouhlení) · K úhradě. */
export function JournalDeductionTotals() {
  const { editor } = useJournalEditor();
  const totals = editor.props.deductions?.totals;
  const t = editor.dsTexts.advances;
  if (!totals) return null;
  const items: [string, string, number][] = [
    ["journal-deduction-items", t.itemsTotal, totals.itemsGross],
    ["journal-deduction-deducted", t.deductedTotal, totals.deductionsGross],
  ];
  if (totals.rounding)
    items.push([
      "journal-deduction-rounding",
      editor.props.rounding?.label ?? editor.t.vatGroups.rounding,
      totals.rounding,
    ]);
  items.push(["journal-deduction-to-pay", t.toPayTotal, totals.payable]);
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

type RecapValues = Pick<JournalDeductionRecapRow, "base" | "vat" | "total" | "homeBase" | "homeVat">;

/** Řádky odečtů a „Celkem po odečtu záloh“ v rekapitulaci DPH (tbody); vše z dat APP. */
export function JournalDeductionRecapBody({ homeOn }: { homeOn: boolean }) {
  const { editor } = useJournalEditor();
  const recap = editor.props.deductions?.recap;
  const t = editor.dsTexts.advances;
  if (!recap) return null;
  const cell = "px-2 py-1 text-right font-mono tabular-nums whitespace-nowrap";
  const values = (row: RecapValues) =>
    [row.base, row.vat, row.total, ...(homeOn ? [row.homeBase, row.homeVat] : [])].map(
      (value, index) => (
        <td key={index} className={cn(cell, value !== undefined && value < 0 && "text-destructive")}>
          {value === undefined ? "" : money(value)}
        </td>
      ),
    );
  return (
    <tbody data-slot="journal-vat-deductions">
      {recap.deductionRows.map((row) => (
        <tr
          key={row.id}
          data-slot="journal-vat-deduction-row"
          title={row.label}
          className="h-[var(--control-h)] border-t"
        >
          <td className="truncate px-2 py-1">
            {row.vatCode}
            <span className="sr-only">{` – ${row.label}`}</span>
          </td>
          {values(row)}
          <td />
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
          <td className="truncate px-2 py-1">{`${t.totalAfterDeductions} ${row.vatCode}`}</td>
          {values(row)}
          <td />
        </tr>
      ))}
    </tbody>
  );
}
