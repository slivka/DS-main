/**
 * Řádek Součet mřížky dokladu (2.109.0: jediný součtový řádek, samostatné „Celkem“ zrušeno).
 * Vlastní: součty základu, domácí částky, DPH a částky s DPH pod příslušnými sloupci.
 * Nesmí: počítat součty – hodnoty dodává useJournalTotals.
 */
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { roundJournalAmount } from "./journal-lines-model";
import { TableCell, TableFooter, TableRow } from "../../ui/table";
import { useJournalEditor } from "./journal-editor-context";

const TOTAL_SLOTS: Record<string, string> = {
  amount: "journal-lines-total-base",
  homeAmount: "journal-lines-total-base-home",
  vatAmount: "journal-lines-total-vat",
  grossAmount: "journal-lines-total-gross",
};

/** Řádek Součet; s odečty záloh jako „Součet položek“ nad oddělovací čarou odečtů. */
export function JournalSumRow({ itemsOnly = false }: { itemsOnly?: boolean }) {
  const { editor } = useJournalEditor();
  const { totals, vatOn, foreign, t } = editor;
  const columns = editor.layout.visibleColumns;
  // Součet je bez zaokrouhlení (to má vlastní hodnotu v liště pod mřížkou).
  const homeSum = roundJournalAmount(totals.total - totals.roundingValue);
  const value = (id: string) => {
    // „Součet položek“ je delší – stojí ve sloupci Popis, aby se nevešel do úzkého Ř. jen zkrácený.
    const labelId = itemsOnly && columns.some((column) => column.id === "text") ? "text" : "row";
    if (id === labelId) return itemsOnly ? editor.dsTexts.advances.itemsSum : t.vatGroups.sum;
    if (id === "row" || id === "text") return null;
    if (id === "amount")
      return formatAmount(
        vatOn ? totals.documentBaseTotal : foreign ? totals.documentLinesTotal : homeSum,
        2,
      );
    if (id === "homeAmount") return formatAmount(vatOn ? totals.baseTotal : homeSum, 2);
    if (id === "vatAmount") return formatAmount(totals.documentVatTotal, 2);
    if (id === "grossAmount") return formatAmount(foreign ? totals.documentGrossTotal : homeSum, 2);
    return null;
  };
  return (
    <TableRow
      data-slot="journal-footer-sum"
      data-items-only={itemsOnly || undefined}
      className={cn(itemsOnly && "border-t bg-muted/50 font-medium hover:bg-muted/50")}
    >
        {editor.layout.visibleColumns.map((column) => (
          <TableCell
            key={column.id}
            data-slot={TOTAL_SLOTS[column.id]}
            data-pin-right={column.id === "actions" || undefined}
            className={cn(
              column.id === "row" && "journal-row-cell",
              column.align === "right" && "text-right",
              column.id === "actions" && "grid-actions-footer sticky right-0 z-10 bg-muted",
            )}
          >
            {value(column.id)}
          </TableCell>
        ))}
    </TableRow>
  );
}

/** Patička mřížky se součty. */
export function JournalFooter() {
  return (
    <TableFooter>
      <JournalSumRow />
    </TableFooter>
  );
}
