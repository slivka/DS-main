import { AmountCell } from "./amount";
import type { DataGridColumn } from "../grid/DataGrid";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";

/**
 * Dvojice částkových sloupců Má dáti / Dal pro grid.
 * V součtovém řádku se obě strany sečtou; pokud se liší, rozdíl se zvýrazní červeně.
 */
export function debitCreditColumns<Row>({
  debit,
  credit,
  debitLabel = "MD částka",
  creditLabel = "DAL částka",
  debitId = "debit",
  creditId = "credit",
  decimals = 2,
  width,
}: {
  debit: (row: Row) => number | null | undefined;
  credit: (row: Row) => number | null | undefined;
  debitLabel?: string;
  creditLabel?: string;
  debitId?: string;
  creditId?: string;
  decimals?: number;
  width?: number;
}): DataGridColumn<Row>[] {
  const sum = (rows: Row[], get: (row: Row) => number | null | undefined) =>
    rows.reduce((acc, r) => acc + (get(r) ?? 0), 0);

  const totalCell = (rows: Row[], side: "debit" | "credit") => {
    const d = sum(rows, debit);
    const c = sum(rows, credit);
    const balanced = Math.abs(d - c) < 0.005;
    const value = side === "debit" ? d : c;
    return (
      <span
        className={cn("block text-right tabular-nums font-semibold", !balanced && "text-destructive")}
        title={balanced ? undefined : `Rozdíl MD/DAL: ${formatAmount(d - c, decimals)}`}
      >
        {formatAmount(value, decimals)}
      </span>
    );
  };

  return [
    {
      id: debitId,
      label: debitLabel,
      align: "right",
      numeric: true,
      decimals,
      width,
      value: (row) => debit(row) ?? null,
      render: (row) => <AmountCell value={debit(row) ?? null} decimals={decimals} />,
      total: (rows) => totalCell(rows, "debit"),
    },
    {
      id: creditId,
      label: creditLabel,
      align: "right",
      numeric: true,
      decimals,
      width,
      value: (row) => credit(row) ?? null,
      render: (row) => <AmountCell value={credit(row) ?? null} decimals={decimals} />,
      total: (rows) => totalCell(rows, "credit"),
    },
  ];
}
