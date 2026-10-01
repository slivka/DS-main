/**
 * Součtový řádek mřížky dokladu.
 * Vlastní: součty základu, domácí částky, DPH a částky s DPH pod příslušnými sloupci.
 * Nesmí: počítat součty – hodnoty dodává useJournalTotals.
 */
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { TableCell, TableFooter, TableRow } from "../../ui/table";
import { useJournalEditor } from "./journal-editor-context";

const TOTAL_SLOTS: Record<string, string> = {
  amount: "journal-lines-total-base",
  homeAmount: "journal-lines-total-base-home",
  vatAmount: "journal-lines-total-vat",
  grossAmount: "journal-lines-total-gross",
};

/** Patička mřížky se součty. */
export function JournalFooter() {
  const { editor } = useJournalEditor();
  const { totals, vatOn, foreign, t } = editor;
  const value = (id: string) => {
    if (id === "row") return t.total;
    if (id === "amount")
      return formatAmount(
        vatOn ? totals.documentBaseTotal : foreign ? totals.documentLinesTotal : totals.total,
        2,
      );
    if (id === "homeAmount") return formatAmount(vatOn ? totals.baseTotal : totals.total, 2);
    if (id === "vatAmount") return formatAmount(totals.documentVatTotal, 2);
    if (id === "grossAmount") return formatAmount(totals.documentGrossTotal, 2);
    return null;
  };
  return (
    <TableFooter>
      <TableRow>
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
    </TableFooter>
  );
}
