/** Sloupce knihy: exportuje skutečné hodnoty, peníze dodává APP. */
import { Button } from "../../ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../ui/tooltip";
import type { DataGridColumn } from "../grid/data-grid-types";
import type { TaxRecordTexts } from "../../../ds-texts/tax-record-texts";
import type { TaxYearTexts } from "../../../ds-texts/tax-year-texts";
import type { TaxBookEntry } from "./tax-record-types";
import { StatusBadge, type StatusConfig } from "../data-display/status-badge";
import { formatDate } from "../../../lib/format";
export function taxBookColumns(
  t: TaxRecordTexts,
  currency: string,
  onDocumentOpen?: (id: string) => void,
  onUnassignedOpen?: (row: TaxBookEntry) => void,
  extra?: { y: TaxYearTexts; showKind: boolean; showBase: boolean },
): DataGridColumn<TaxBookEntry>[] {
  const kinds = extra?.y.kinds;
  const kindConfig: StatusConfig = kinds
    ? {
        payment: { label: kinds.payment, tone: "neutral" },
        advance: { label: kinds.advance, tone: "info" },
        advance_tax_document: { label: kinds.advance_tax_document, tone: "accent" },
        advance_deduction: { label: kinds.advance_deduction, tone: "warning" },
        non_cash: { label: kinds.non_cash, tone: "neutral" },
        offset: { label: kinds.offset, tone: "neutral" },
      }
    : {};
  const money = (
    id: "amount" | "movementAmount" | "vat" | "base",
    label: string,
  ): DataGridColumn<TaxBookEntry> => ({
    id,
    label,
    value: (r) => r[id],
    numeric: true,
    decimals: 2,
  });
  return [
    {
      id: "date",
      label: t.date,
      value: (r) => r.date,
      render: (r) => formatDate(r.date),
      exportType: "date",
    },
    {
      id: "payment",
      label: t.payment,
      value: (r) => r.paymentDocument,
      render: (r) =>
        onDocumentOpen ? (
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDocumentOpen(r.paymentDocumentId);
            }}
          >
            {r.paymentDocument}
          </Button>
        ) : (
          r.paymentDocument
        ),
    },
    {
      id: "invoice",
      label: t.invoice,
      value: (r) => r.invoice,
      render: (r) =>
        r.invoiceId && onDocumentOpen ? (
          <Button
            variant="link"
            className="h-auto p-0"
            onClick={(e) => {
              e.stopPropagation();
              if (r.invoiceId) onDocumentOpen(r.invoiceId);
            }}
          >
            {r.invoice}
          </Button>
        ) : (
          r.invoice
        ),
    },
    {
      id: "item",
      label: t.item,
      value: (r) => (r.unassigned ? t.unassigned : r.item),
      render: (r) =>
        r.unassigned ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="text-warning-strong">
                {t.unassigned}
              </span>
            </TooltipTrigger>
            <TooltipContent>{t.unassignedWarning}</TooltipContent>
          </Tooltip>
        ) : (
          r.item
        ),
    },
    ...(extra?.showKind && kinds
      ? [
          {
            id: "kind",
            label: extra.y.kind,
            value: (r: TaxBookEntry) => (r.kind ? kinds[r.kind] : ""),
            render: (r: TaxBookEntry) =>
              r.kind ? <StatusBadge status={r.kind} config={kindConfig} /> : null,
          },
        ]
      : []),
    { id: "treatment", label: t.treatment, value: (r) => t.treatments[r.treatment] },
    { id: "taxCategory", label: t.taxCategory, value: (r) => r.taxCategory },
    { id: "category", label: t.category, value: (r) => r.category },
    ...(extra?.showBase ? [money("base", `${extra.y.base} · ${currency}`)] : []),
    money("amount", `${extra?.showBase ? extra.y.total : t.amount} · ${currency}`),
    { id: "currency", label: t.currency, value: (r) => r.currency },
    { ...money("movementAmount", t.movementAmount), total: "none" },
    money("vat", `${t.vat} · ${currency}`),
    { id: "nonCash", label: t.nonCash, value: (r) => (r.nonCash ? t.nonCash : "") },
    ...(onUnassignedOpen
      ? [
          {
            id: "resolve",
            label: t.resolve,
            render: (r: TaxBookEntry) =>
              r.unassigned ? (
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnassignedOpen(r);
                  }}
                >
                  {t.resolve}
                </Button>
              ) : null,
            sortable: false,
          },
        ]
      : []),
  ];
}
