/** Sloupce a řádky evidence se záložkami · vlastní skládání zobrazení · nesmí nic sčítat ani párovat. */
import { AlertTriangle } from "lucide-react";
import type { AdvanceTexts } from "../../../../ds-texts/advance-texts";
import { formatCodeName } from "../../../../lib/code-format";
import { fmtAmount, formatDate } from "../../../../lib/format";
import { formatAccountCode } from "../account-code";
import type { DataGridColumn } from "../../grid/DataGrid";
import { StatusBadge } from "../../data-display/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../ui/tooltip";
import type {
  AdvanceRegisterRowKind,
  AdvanceRegisterTab,
  AdvanceRegisterViewRow,
} from "./advance-register-view-types";

/** Řádek zobrazení: data APP doplněná o záhlaví skupin a celkový součet. */
export type AdvanceRegisterDisplayRow = Omit<AdvanceRegisterViewRow, "rowKind"> & {
  rowKind: AdvanceRegisterRowKind | "account_header" | "partner_header" | "grand_total";
};

/** Vloží záhlaví účtu (a v Zůstatku partnera) podle pořadí z dat; součty nepočítá. */
export function buildAdvanceRegisterRows(
  rows: AdvanceRegisterViewRow[],
  tab: AdvanceRegisterTab,
  hideControl: boolean,
  totals?: Partial<AdvanceRegisterViewRow>,
): AdvanceRegisterDisplayRow[] {
  const out: AdvanceRegisterDisplayRow[] = [];
  let account: string | null = null;
  let partner: string | null = null;
  for (const row of rows) {
    if (hideControl && row.rowKind === "account_control") continue;
    if (row.account !== account) {
      account = row.account;
      partner = null;
      out.push({
        id: `account:${row.account}`,
        rowKind: "account_header",
        account: row.account,
        ...(row.accountName ? { accountName: row.accountName } : {}),
      });
    }
    if (tab === "balance" && row.rowKind === "detail" && (row.partner ?? "") !== partner) {
      partner = row.partner ?? "";
      out.push({
        id: `partner:${row.account}:${partner}`,
        rowKind: "partner_header",
        account: row.account,
        partner,
      });
    }
    if (row.rowKind !== "detail") partner = null;
    out.push(row);
  }
  if (totals) out.push({ ...totals, id: "grand-total", rowKind: "grand_total", account: "" });
  return out;
}

/** Klíč úseku řazení: položky jen uvnitř své skupiny, ostatní řádky stojí. */
export const advanceRegisterSegment = (row: AdvanceRegisterDisplayRow) =>
  row.rowKind === "detail" ? `${row.account}|${row.partner ?? ""}` : null;

/** Kontrolní rozdíl je nenulový (hodnota z APP). */
export const hasAdvanceDifference = (row: AdvanceRegisterDisplayRow) =>
  row.rowKind === "account_control" && Boolean(row.difference);

const amount = (value?: number) => (typeof value === "number" ? fmtAmount(value, 2) : "");

function labelOf(row: AdvanceRegisterDisplayRow, t: AdvanceTexts): string | undefined {
  const account = formatAccountCode(row.account);
  switch (row.rowKind) {
    case "account_header":
      return formatCodeName(account, row.accountName);
    case "partner_header":
      return row.partner;
    case "partner_total":
      return t.partnerTotal(row.partner ?? "");
    case "account_total":
      return t.accountTotal(account);
    case "account_control":
      return t.controlLabel(account);
    case "grand_total":
      return t.grandTotal;
    default:
      return undefined;
  }
}

function ControlCell({ row, t }: { row: AdvanceRegisterDisplayRow; t: AdvanceTexts }) {
  const warn = hasAdvanceDifference(row);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap" data-slot="advance-control">
      {warn && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              role="img"
              aria-label={t.differenceWarning}
              data-slot="advance-difference-warning"
              className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <AlertTriangle className="h-4 w-4" aria-hidden />
            </span>
          </TooltipTrigger>
          <TooltipContent>{t.differenceWarning}</TooltipContent>
        </Tooltip>
      )}
      <span>{labelOf(row, t)}</span>
      <span className="font-normal tabular-nums">
        {`${t.ledgerBalance} ${amount(row.ledgerBalance)} · ${t.registerSum} ${amount(row.registerBalance)} · ${t.difference} ${amount(row.difference)}`}
      </span>
    </span>
  );
}

type Field = keyof AdvanceRegisterViewRow;
const num = (id: Field, label: string): DataGridColumn<AdvanceRegisterDisplayRow> => ({
  id,
  label,
  numeric: true,
  decimals: 2,
  total: "none",
  value: (row) => (row.rowKind === "account_control" ? undefined : (row[id] as number)),
});
const text = (id: Field, label: string): DataGridColumn<AdvanceRegisterDisplayRow> => ({
  id,
  label,
  value: (row) => (row.rowKind === "detail" ? (row[id] as string | undefined) : undefined),
});
const dateCol = (label: string): DataGridColumn<AdvanceRegisterDisplayRow> => ({
  id: "date",
  label,
  value: (row) => (row.rowKind === "detail" ? row.date : undefined),
  render: (row) => (row.rowKind === "detail" && row.date ? formatDate(row.date) : ""),
  exportType: "date",
});

/** Sloupce záložky; `vatPayer=false` skryje sloupce DD. */
export function advanceRegisterColumns(
  tab: AdvanceRegisterTab,
  t: AdvanceTexts,
  homeCurrency: string,
  vatPayer: boolean,
): DataGridColumn<AdvanceRegisterDisplayRow>[] {
  const label = (id: "document" | "partner", title: string) => ({
    id,
    label: title,
    value: (row: AdvanceRegisterDisplayRow) => labelOf(row, t) ?? row[id],
    render: (row: AdvanceRegisterDisplayRow) =>
      row.rowKind === "account_control" ? (
        <ControlCell row={row} t={t} />
      ) : (
        (labelOf(row, t) ?? row[id])
      ),
  });
  const account: DataGridColumn<AdvanceRegisterDisplayRow> = {
    id: "account",
    label: t.account,
    value: (row) => (row.rowKind === "detail" ? formatAccountCode(row.account) : undefined),
  };
  if (tab === "balance")
    return [
      {
        id: "kind",
        label: t.kind,
        value: (row) =>
          row.rowKind === "detail" && row.kind
            ? row.kind === "payment"
              ? t.kindPayment
              : t.kindDeduction
            : undefined,
      },
      label("document", t.document),
      text("partner", t.partner),
      { ...text("vs", t.vs), format: "vs" },
      dateCol(t.date),
      text("currency", t.currency),
      num("amount", t.amount),
      num("amountHome", t.amountHome(homeCurrency)),
      num("balance", t.balance),
      num("balanceHome", t.balanceHome(homeCurrency)),
      text("reason", t.reason),
      account,
    ];
  if (tab === "payments") {
    const status: DataGridColumn<AdvanceRegisterDisplayRow> = {
      id: "taxStatus",
      label: t.taxStatus,
      value: (row) => (row.taxStatus ? t[row.taxStatus] : undefined),
      render: (row) =>
        row.taxStatus ? (
          <StatusBadge
            status={row.taxStatus}
            config={{
              missing: { label: t.missing, tone: "warning" },
              partial: { label: t.partial, tone: "warning" },
              issued: { label: t.issued, tone: "success" },
              notIssued: { label: t.notIssued, tone: "neutral" },
            }}
          />
        ) : null,
    };
    const deadline: DataGridColumn<AdvanceRegisterDisplayRow> = {
      id: "deadline",
      label: t.deadline,
      value: (row) => (row.rowKind === "detail" ? row.deadline : undefined),
      render: (row) => (row.rowKind === "detail" && row.deadline ? formatDate(row.deadline) : ""),
      exportType: "date",
    };
    return [
      label("partner", t.partner),
      { ...text("vs", t.vs), format: "vs" },
      dateCol(t.paidAt),
      text("currency", t.currency),
      num("amount", t.amount),
      num("amountHome", t.amountHome(homeCurrency)),
      num("paidList", t.paidList),
      ...(vatPayer ? [num("coveredTaxDocument", t.coveredTaxDocument)] : []),
      num("deducted", t.deducted),
      num("refunded", t.refunded),
      num("remaining", t.remaining),
      ...(vatPayer ? [status, deadline] : []),
      account,
    ];
  }
  return [
    label("document", t.document),
    text("partner", t.partner),
    dateCol(t.accountingDate),
    num("base", t.base),
    num("vat", t.vat),
    num("matched", t.matched),
    num("unmatched", t.unmatched),
    text("reason", t.reason),
    account,
  ];
}
