import type { DataGridColumn } from "../grid/DataGrid";
import { formatAccountCode, normalizeAccountCode } from "./account-code";
import { formatCodeName } from "../../../lib/code-format";

export interface AccountColumnsOptions<Row> {
  debit: (row: Row) => string | null;
  credit: (row: Row) => string | null;
  accountName: (code: string) => string | undefined;
  section?: string;
  debitId?: string;
  creditId?: string;
  debitNameId?: string;
  creditNameId?: string;
  debitLabel?: string;
  creditLabel?: string;
  debitNameLabel?: string;
  creditNameLabel?: string;
}

export interface AccountColumnPairOptions<Row> {
  id: string;
  label: string;
  shortLabel: string;
  getCode: (row: Row) => string | null;
  accountName: (code: string) => string | undefined;
  section?: string;
}

function accountText(code: string | null, accountName: (code: string) => string | undefined) {
  const normalized = normalizeAccountCode(code);
  if (!normalized) return "";
  const formatted = formatAccountCode(normalized);
  const name = accountName(normalized);
  return formatCodeName(formatted, name);
}

function AccountColumnValue({ value }: { value: string }) {
  return (
    <span className="block truncate font-mono tabular-nums" title={value}>
      {value}
    </span>
  );
}

/** Jedna účetní dvojice: rozšířená forma je výchozí, krátká zůstává dostupná ve Sloupce. */
export function accountColumnPair<Row>({
  id,
  label,
  shortLabel,
  getCode,
  accountName,
  section,
}: AccountColumnPairOptions<Row>): DataGridColumn<Row>[] {
  const codeValue = (row: Row) => formatAccountCode(getCode(row));
  const nameValue = (row: Row) => accountText(getCode(row), accountName);
  const sortValue = (row: Row) => normalizeAccountCode(getCode(row)) || null;
  return [
    {
      id,
      label: shortLabel,
      section,
      defaultVisible: false,
      fitContent: true,
      exportType: "text",
      value: codeValue,
      sortValue,
    },
    {
      id: `${id}Name`,
      label,
      section,
      width: 220,
      exportType: "text",
      value: nameValue,
      sortValue,
      render: (row) => <AccountColumnValue value={nameValue(row)} />,
    },
  ];
}

/**
 * Standardní čtveřice sloupců účtů MD / DAL. Obě formy jsou ve Sloupce;
 * rozšířená je výchozí všude kromě JournalLinesEditoru.
 */
export function accountColumns<Row>({
  debit,
  credit,
  accountName,
  section,
  debitId = "debitAccount",
  creditId = "creditAccount",
  debitNameId = "debitAccountName",
  creditNameId = "creditAccountName",
  debitLabel = "MD",
  creditLabel = "DAL",
  debitNameLabel = "MD účet",
  creditNameLabel = "DAL účet",
}: AccountColumnsOptions<Row>): DataGridColumn<Row>[] {
  return [
    ...accountColumnPair({
      id: debitId,
      label: debitNameLabel,
      shortLabel: debitLabel,
      getCode: debit,
      accountName,
      section,
    }),
    ...accountColumnPair({
      id: creditId,
      label: creditNameLabel,
      shortLabel: creditLabel,
      getCode: credit,
      accountName,
      section,
    }),
  ].map((column) =>
    column.id === `${debitId}Name`
      ? { ...column, id: debitNameId }
      : column.id === `${creditId}Name`
        ? { ...column, id: creditNameId }
        : column,
  );
}
