import type { DataGridColumn } from "../grid/DataGrid";
import { formatAccountCode, normalizeAccountCode } from "./account-code";

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

function accountText(code: string | null, accountName: (code: string) => string | undefined) {
  const normalized = normalizeAccountCode(code);
  if (!normalized) return "";
  const formatted = formatAccountCode(normalized);
  const name = accountName(normalized);
  return name ? `${formatted} - ${name}` : formatted;
}

function AccountColumnValue({ value }: { value: string }) {
  return (
    <span className="block truncate font-mono tabular-nums" title={value}>
      {value}
    </span>
  );
}

/**
 * Standardní čtveřice sloupců účtů MD / DAL pro gridy se zaúčtováním.
 * Krátké kódy jsou výchozí skryté, úplné názvy účtů výchozí viditelné.
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
  const codeValue = (getCode: (row: Row) => string | null) => (row: Row) =>
    formatAccountCode(getCode(row));
  const nameValue = (getCode: (row: Row) => string | null) => (row: Row) =>
    accountText(getCode(row), accountName);
  const numericSortValue = (getCode: (row: Row) => string | null) => (row: Row) => {
    const normalized = normalizeAccountCode(getCode(row));
    return normalized || null;
  };

  return [
    {
      id: debitId,
      label: debitLabel,
      section,
      defaultVisible: false,
      fitContent: true,
      exportType: "text",
      value: codeValue(debit),
      sortValue: numericSortValue(debit),
    },
    {
      id: creditId,
      label: creditLabel,
      section,
      defaultVisible: false,
      fitContent: true,
      exportType: "text",
      value: codeValue(credit),
      sortValue: numericSortValue(credit),
    },
    {
      id: debitNameId,
      label: debitNameLabel,
      section,
      width: 220,
      exportType: "text",
      value: nameValue(debit),
      sortValue: numericSortValue(debit),
      render: (row) => <AccountColumnValue value={accountText(debit(row), accountName)} />,
    },
    {
      id: creditNameId,
      label: creditNameLabel,
      section,
      width: 220,
      exportType: "text",
      value: nameValue(credit),
      sortValue: numericSortValue(credit),
      render: (row) => <AccountColumnValue value={accountText(credit(row), accountName)} />,
    },
  ];
}