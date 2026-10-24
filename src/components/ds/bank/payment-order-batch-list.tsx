/**
 * Seznam platebních dávek (I7) a štítek „Odesláno do banky“.
 * Vlastní: grid dávek se stavy a akcemi; stav a akce dodává aplikace.
 * Nesmí: stahovat soubory ani rušit dávky – jen volá callbacky.
 */
import type { ComponentPropsWithoutRef } from "react";
import { DataGrid } from "../grid/DataGrid";
import type { DataGridColumn } from "../grid/data-grid-types";
import { StatusBadge } from "../data-display/status-badge";
import { GridAction } from "../grid/grid-action";
import { Badge } from "../../ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { useConfirmDialog } from "../feedback/confirm-dialog";
import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { Ban, Download } from "lucide-react";
import type { PaymentBatch, PaymentBatchStatus } from "./bank-types";

/** Props seznamu dávek. */
export interface PaymentOrderBatchListProps extends ComponentPropsWithoutRef<"div"> {
  /** Klíč uložení nastavení gridu. */
  storageKey: string;
  /** Dávky. */
  batches: PaymentBatch[];
  /** Otevření dávky. */
  onOpen?: (id: string) => void;
  /** Opětovné stažení souboru. */
  onDownload?: (id: string) => void;
  /** Zrušení dávky s důvodem (potvrzení je součástí). */
  onCancel?: (id: string, reason: string) => void;
  /** Jen pro čtení. */
  readOnly?: boolean;
}

/** Grid dávek plateb. */
export function PaymentOrderBatchList({
  storageKey,
  batches,
  onOpen,
  onDownload,
  onCancel,
  readOnly,
  ...rest
}: PaymentOrderBatchListProps) {
  const t = useDsTexts().bankPayments;
  const { confirm, confirmDialog } = useConfirmDialog();
  const statusConfig: Record<PaymentBatchStatus, { label: string; tone: "neutral" | "info" | "success" | "warning" | "danger" }> = {
    created: { label: t.statusCreated, tone: "neutral" },
    downloaded: { label: t.statusDownloaded, tone: "info" },
    sent: { label: t.statusSent, tone: "info" },
    partial: { label: t.statusPartial, tone: "warning" },
    paid: { label: t.statusPaid, tone: "success" },
    cancelled: { label: t.statusCancelled, tone: "danger" },
  };
  const columns: DataGridColumn<PaymentBatch>[] = [
    { id: "date", label: t.listDate, value: (b) => b.date, fitContent: true },
    { id: "author", label: t.listAuthor, value: (b) => b.author },
    { id: "target", label: t.listTarget, value: (b) => b.target },
    { id: "count", label: t.listCount, value: (b) => b.count, numeric: true, width: 80 },
    { id: "amount", label: t.listAmount, value: (b) => b.amount, align: "right" },
    {
      id: "status",
      label: t.listStatus,
      value: (b) => statusConfig[b.status].label,
      render: (b) => <StatusBadge status={b.status} config={statusConfig} />,
      width: 160,
    },
  ];
  return (
    <div {...rest} data-slot="payment-order-batch-list" className="min-w-0">
      <DataGrid
        storageKey={storageKey}
        title={t.listTitle}
        showTitle
        rows={batches}
        columns={columns}
        rowKey={(b) => b.id}
        onRowOpen={onOpen ? (b) => onOpen(b.id) : undefined}
        rowActions={
          readOnly
            ? undefined
            : (b) => (
                <>
                  {onDownload && (b.status === "downloaded" || b.status === "created") ? (
                    <GridAction
                      title={t.downloadAgain}
                      aria-label={t.downloadAgain}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDownload(b.id);
                      }}
                    >
                      <Download className="size-3.5" />
                    </GridAction>
                  ) : null}
                  {onCancel && b.status !== "cancelled" && b.status !== "paid" ? (
                    <GridAction
                      tone="destructive"
                      title={t.cancelBatch}
                      aria-label={t.cancelBatch}
                      onClick={(event) => {
                        event.stopPropagation();
                        confirm({
                          title: t.cancelBatch,
                          confirmLabel: t.cancelBatch,
                          destructive: true,
                          reason: { label: t.cancelReason, required: true },
                          onConfirm: (reason) => onCancel(b.id, reason),
                        });
                      }}
                    >
                      <Ban className="size-3.5" />
                    </GridAction>
                  ) : null}
                </>
              )
        }
      />
      {confirmDialog}
    </div>
  );
}

/** Props štítku „Odesláno do banky“. */
export interface PaymentSentBadgeProps extends ComponentPropsWithoutRef<"span"> {
  /** Vlastní popisek; výchozí z DsTexts. */
  label?: string;
}

/** Štítek u dokladu: úhrada se potvrdí až pohybem z výpisu. */
export function PaymentSentBadge({ label, className, ...rest }: PaymentSentBadgeProps) {
  const t = useDsTexts().bankPayments;
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            {...rest}
            data-slot="payment-sent-badge"
            className={cn("cursor-help", className)}
          >
            {label ?? t.sentBadge}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{t.sentBadgeHint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
