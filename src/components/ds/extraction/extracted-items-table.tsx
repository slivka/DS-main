/**
 * Tabulka vytěžených položek pod náhledem zdroje.
 * Vlastní: grid jen pro čtení se souhrnným řádkem, výchozí sbalený.
 * Nesmí: počítat součty ani upravovat řádky; hodnoty dodává aplikace.
 */
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { CollapsibleSection } from "../layout/collapsible-section";
import { formatAmount } from "../../../lib/format";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import type { ExtractedItem, ExtractedItemsTotals } from "./extraction-types";

/** Vlastnosti tabulky vytěžených položek. */
export interface ExtractedItemsTableProps {
  /** Vytěžené řádky. */
  items: ExtractedItem[];
  /** Souhrnný řádek; hodnoty dodává aplikace. */
  totals: ExtractedItemsTotals;
  /** Výchozí rozbalení; výchozí je sbaleno. */
  defaultOpen?: boolean;
  /** Doplňkové třídy obalu. */
  className?: string;
}

/** Množství s až čtyřmi desetinnými místy bez zbytečných nul; null = prázdná buňka. */
function formatQuantity(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "";
  const fixed = value.toFixed(4);
  const trimmed = fixed.replace(/\.?0+$/, "").replace(".", ",");
  const [int, dec] = trimmed.split(",");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${grouped},${dec}` : grouped;
}

const NUMERIC = "text-right tabular-nums whitespace-nowrap";

/** Sbalitelná tabulka vytěžených položek se souhrnným řádkem od aplikace. */
export function ExtractedItemsTable({
  items,
  totals,
  defaultOpen = false,
  className,
}: ExtractedItemsTableProps) {
  const texts = useDsTexts().extraction;
  return (
    <div data-slot="extracted-items" className={cn(className)}>
      <CollapsibleSection title={texts.itemsTitle(items.length)} defaultOpen={defaultOpen}>
        <Table data-slot="extracted-items-table">
        <TableHeader>
          <TableRow>
            <TableHead>{texts.itemText}</TableHead>
            <TableHead className={NUMERIC}>{texts.itemQuantity}</TableHead>
            <TableHead>{texts.itemUnit}</TableHead>
            <TableHead className={NUMERIC}>{texts.itemUnitPrice}</TableHead>
            <TableHead>{texts.itemVatRate}</TableHead>
            <TableHead className={NUMERIC}>{texts.itemBase}</TableHead>
            <TableHead className={NUMERIC}>{texts.itemTax}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="max-w-64 truncate" title={item.text}>
                {item.text}
              </TableCell>
              <TableCell className={NUMERIC}>{formatQuantity(item.quantity)}</TableCell>
              <TableCell>{item.unit ?? ""}</TableCell>
              <TableCell className={NUMERIC}>{formatAmount(item.unitPrice)}</TableCell>
              <TableCell>{item.vatRate}</TableCell>
              <TableCell className={NUMERIC}>{formatAmount(item.base)}</TableCell>
              <TableCell className={NUMERIC}>{formatAmount(item.tax)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5} className="font-semibold">
              {texts.itemsTotal}
            </TableCell>
            <TableCell className={cn(NUMERIC, "font-semibold")}>
              {formatAmount(totals.base)}
            </TableCell>
            <TableCell className={cn(NUMERIC, "font-semibold")}>
              {formatAmount(totals.tax)}
            </TableCell>
          </TableRow>
        </TableFooter>
        </Table>
      </CollapsibleSection>
    </div>
  );
}
