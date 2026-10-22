/** Náhled faktury · skládá PrintPreviewDialog · APP vlastní data a otevření. */
import { useEffect, useState, type ReactNode } from "react";
import { PrintPreviewDialog } from "../print-preview-dialog";
import { buildInvoicePdf } from "./invoice-pdf";
import { invoicePdfFilename } from "./invoice-format";
import type { BuildInvoicePdfOptions, InvoicePrintData } from "./invoice-types";
import { useDsTexts } from "../../../../ds-texts";
/** Dialog hotového tiskového snímku. */
export interface InvoicePrintDialogProps {
  /** Viditelnost. */ open: boolean;
  /** Změna otevření. */ onOpenChange: (open: boolean) => void;
  /** Data od APP. */ data: InvoicePrintData;
  /** Volitelné vykreslení tisku. */ opts?: BuildInvoicePdfOptions;
  /** Řízené volby APP. */ settings?: ReactNode;
  /** Chyba generování. */ onError?: (error: unknown) => void;
}
/** Tisk i stažení využívá jediný sdílený dialog náhledu. */
export function InvoicePrintDialog({
  open,
  onOpenChange,
  data,
  opts,
  settings,
  onError,
}: InvoicePrintDialogProps) {
  const t = useDsTexts().invoicePrint;
  const [blob, setBlob] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setBlob(null);
    setFailed(false);
    void buildInvoicePdf(data, { ...opts, texts: { ...t, ...opts?.texts } })
      .then((result) => {
        if (active) setBlob(result);
      })
      .catch((error) => {
        if (active) {
          setFailed(true);
          onError?.(error);
        }
      });
    return () => {
      active = false;
    };
  }, [open, data, opts, t, onError]);
  return (
    <PrintPreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      blob={blob}
      title={data.is_draft ? `${data.title} – ${t.draft}` : `${data.title} ${data.number ?? ""}`}
      companyName={data.issuer.name}
      filename={invoicePdfFilename(data)}
      settings={settings}
      error={failed ? t.error : undefined}
    />
  );
}
