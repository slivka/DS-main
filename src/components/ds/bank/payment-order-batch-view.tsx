/**
 * Výběr úhrad do platební dávky (I7).
 * Vlastní: grid závazků, výběr účtu partnera z číselníku, kontroly a akce dávky.
 * Nesmí: sestavovat soubor ani odesílat do banky – formáty a limity dodává aplikace.
 */
import { useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { OptionSelect } from "../form/option-select";
import { DateField } from "../form/date-field";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { FileSeverityIcon } from "../feedback/file-severity";
import { DisabledReasonTooltip } from "../feedback/disabled-reason-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useDsTexts } from "../../../ds-texts";
import { formatAmount, formatDate } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import type { PaymentOrderRow, PaymentPartnerAccount } from "./bank-types";

/** Formát souboru příkazu. */
export interface PaymentFileFormat {
  /** Stabilní klíč, např. „abo“. */
  id: string;
  /** Popisek formátu. */
  label: string;
}

/** Props dávky plateb. */
export interface PaymentOrderBatchViewProps extends ComponentPropsWithoutRef<"div"> {
  /** Klíč uložení nastavení gridu. */
  storageKey: string;
  /** Závazky k úhradě. */
  rows: PaymentOrderRow[];
  /** Účty partnerů v číselníku podle řádku (ručně psaný účet nelze). */
  partnerAccounts: (row: PaymentOrderRow) => PaymentPartnerAccount[];
  /** Změna řádku. */
  onPatch: (rowId: string, patch: Partial<PaymentOrderRow>) => void;
  /** Dostupné formáty souboru podle banky. */
  formats: PaymentFileFormat[];
  /** Vytvoření souboru příkazu ve formátu. */
  onCreateFile: (ids: string[], formatId: string) => void;
  /** Odeslání do Fio; bez hodnoty nebo false se akce nenabízí. */
  canSendFio?: boolean;
  /** Důvod zákazu odeslání do Fio. */
  sendDisabledReason?: string;
  /** Odeslání do Fio. */
  onSendFio?: (ids: string[]) => void;
  /** Uložení dávky. */
  onSave?: (ids: string[]) => void;
  /** Dnešní datum (ISO) – datum úhrady nejdříve dnes. */
  today: string;
  /** Filtr splatnosti (slot, např. DateRangeField). */
  dueFilter?: React.ReactNode;
  /** Filtr knihy (slot). */
  bookFilter?: React.ReactNode;
  /** Jen pro čtení. */
  readOnly?: boolean;
  /** Probíhá operace. */
  busy?: boolean;
}

/** Grid závazků k úhradě s kontrolami a akcemi dávky. */
export function PaymentOrderBatchView({
  storageKey,
  rows,
  partnerAccounts,
  onPatch,
  formats,
  onCreateFile,
  canSendFio,
  sendDisabledReason,
  onSendFio,
  onSave,
  today,
  dueFilter,
  bookFilter,
  readOnly,
  busy,
  className,
  ...rest
}: PaymentOrderBatchViewProps) {
  const t = useDsTexts().bankPayments;
  const [selected, setSelected] = useState<string[]>([]);
  const [formatId, setFormatId] = useState(formats[0]?.id ?? "");

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.includes(r.id)),
    [rows, selected],
  );
  const totalsByCurrency = useMemo(() => {
    const map = new Map<string, { sum: number; symbol: string }>();
    for (const row of selectedRows) {
      const entry = map.get(row.currency) ?? { sum: 0, symbol: row.currencySymbol };
      entry.sum += row.remaining;
      map.set(row.currency, entry);
    }
    return [...map.values()];
  }, [selectedRows]);
  const hasBlockingCheck = (row: PaymentOrderRow) =>
    row.checks?.some((check) => check.severity === "error") ?? false;
  const blockedSelected = selectedRows.some((r) => hasBlockingCheck(r) || !r.partnerAccountId);

  const columns: DataGridColumn<PaymentOrderRow>[] = [
    { id: "partner", label: t.partner, value: (r) => r.partnerName },
    { id: "document", label: t.document, value: (r) => r.documentNumber, fitContent: true },
    {
      id: "dueDate",
      label: t.dueDate,
      value: (r) => formatDate(r.dueDate),
      sortValue: (r) => r.dueDate,
      fitContent: true,
      render: (r) => (
        <span className={cn(r.overdue && "font-semibold text-destructive")}>
          {formatDate(r.dueDate)}
          {r.overdue ? (
            <span className="ml-1 text-xs">({t.overdue})</span>
          ) : null}
        </span>
      ),
    },
    { id: "amount", label: t.amount, numeric: true, value: (r) => r.amount },
    { id: "remaining", label: t.remaining, numeric: true, value: (r) => r.remaining, total: "sum" },
    { id: "currency", label: t.currency, value: (r) => r.currency, width: 64 },
    {
      id: "partnerAccount",
      label: t.partnerAccount,
      value: (r) =>
        partnerAccounts(r).find((a) => a.id === r.partnerAccountId)?.label ?? null,
      render: (r) =>
        readOnly ? (
          (partnerAccounts(r).find((a) => a.id === r.partnerAccountId)?.label ?? "")
        ) : (
          <OptionSelect
            ariaLabel={t.partnerAccount}
            value={r.partnerAccountId ?? ""}
            onChange={(partnerAccountId) => onPatch(r.id, { partnerAccountId })}
            options={partnerAccounts(r).map((a) => ({ value: a.id, label: a.label }))}
            searchable
          />
        ),
    },
    {
      id: "symbols",
      label: t.symbols,
      value: (r) => [r.vs, r.ks, r.ss].filter(Boolean).join(" / ") || null,
      render: (r) => (
        <span className="font-mono tabular-nums">
          {[r.vs, r.ks, r.ss].filter(Boolean).join(" / ")}
        </span>
      ),
    },
    { id: "message", label: t.message, value: (r) => r.message ?? null, defaultVisible: false },
    {
      id: "paymentDate",
      label: t.paymentDate,
      value: (r) => formatDate(r.paymentDate),
      render: (r) =>
        readOnly ? (
          formatDate(r.paymentDate)
        ) : (
          <DateField
            aria-label={t.paymentDate}
            value={r.paymentDate}
            min={today}
            onChange={(paymentDate) => onPatch(r.id, { paymentDate })}
          />
        ),
    },
    {
      id: "checks",
      label: t.checks,
      value: (r) => r.checks?.map((check) => check.title).join(", ") || null,
      render: (r) => {
        if (!r.checks?.length) return null;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-1" tabIndex={0}>
                {r.checks.map((check) => (
                  <FileSeverityIcon key={check.id} severity={check.severity} />
                ))}
                <Badge variant={hasBlockingCheck(r) ? "destructive" : "outline"}>
                  {r.checks.length}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {r.checks.map((check) => (
                <div key={check.id}>{check.title}</div>
              ))}
            </TooltipContent>
          </Tooltip>
        );
      },
      width: 88,
    },
  ];

  return (
    <div {...rest} data-slot="payment-order-batch-view" className={cn("min-w-0 space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {dueFilter}
        {bookFilter}
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <OptionSelect
            ariaLabel={t.fileFormat}
            value={formatId}
            onChange={setFormatId}
            options={formats.map((f) => ({ value: f.id, label: f.label }))}
            allowEmpty={false}
            className="w-44"
          />
          <DisabledReasonTooltip
            blocked={!selected.length || blockedSelected}
            content={
              blockedSelected ? t.accountManualForbidden : !selected.length ? t.empty : undefined
            }
          >
            <Button
              type="button"
              size="sm"
              disabled={!selected.length || blockedSelected || busy || readOnly}
              onClick={() => onCreateFile(selected, formatId)}
            >
              {t.createFile}
            </Button>
          </DisabledReasonTooltip>
          {onSendFio ? (
            <DisabledReasonTooltip
              blocked={!canSendFio}
              content={!canSendFio ? (sendDisabledReason ?? t.sendDisabled) : undefined}
            >
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!canSendFio || !selected.length || blockedSelected || busy || readOnly}
                onClick={() => onSendFio(selected)}
              >
                {t.sendFio}
              </Button>
            </DisabledReasonTooltip>
          ) : null}
          {onSave ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!selected.length || busy || readOnly}
              onClick={() => onSave(selected)}
            >
              {t.saveBatch}
            </Button>
          ) : null}
        </span>
      </div>
      <DataGrid
        storageKey={storageKey}
        title={t.title}
        rows={rows}
        columns={columns}
        rowKey={(r) => r.id}
        selectable
        selectedKeys={selected}
        onSelectedKeysChange={setSelected}
        emptyTitle={t.empty}
        selectionSummary={() => (
          <span className="flex items-center gap-2 text-sm">
            {t.selectedTotal}:{" "}
            {totalsByCurrency.map((entry, i) => (
              <strong key={i} className="font-mono tabular-nums">
                {formatAmount(entry.sum)} {entry.symbol}
              </strong>
            ))}
          </span>
        )}
      />
    </div>
  );
}
