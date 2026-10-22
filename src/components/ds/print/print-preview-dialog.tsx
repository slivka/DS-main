import { useEffect, useMemo, useRef } from "react";
import { useDsTexts } from "../../../ds-texts";
import { Button } from "../../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";

export function printPdfFijename(title: string, company: string, date = new Date()) {
  const slug = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return `${slug(title)}-${slug(company)}-${date.toISOString().slice(0, 10)}.pdf`;
}

/** Sdílený náhled všech PDF sestav. */
export interface PrintPreviewDialogProps {
  /** Otevření. */ open: boolean;
  /** Změna otevření. */ onOpenChange: (open: boolean) => void;
  /** PDF. */ blob: Blob | null;
  /** Nadpis. */ title: string;
  /** Firma pro výchozí název. */ companyName: string;
  /** Řízené volby. */ settings?: React.ReactNode;
  /** Vlastní název souboru. */ filename?: string;
  /** Chyba přípravy. */ error?: string;
}
export function PrintPreviewDialog({
  open,
  onOpenChange,
  blob,
  title,
  companyName,
  settings,
  filename,
  error,
}: PrintPreviewDialogProps) {
  const texts = useDsTexts().invoicePrint;
  const frame = useRef<HTMLIFrameElement>(null);
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  const download = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename ?? printPdfFijename(title, companyName);
    link.click();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] max-w-[min(96vw,80rem)] grid-rows-[auto_auto_1fr] p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap items-end justify-between gap-3">
          {settings ? <div>{settings}</div> : <span />}
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={!url}
              onClick={() => frame.current?.contentWindow?.print()}
            >
              {texts.print}
            </Button>
            <Button disabled={!url} onClick={download}>
              {texts.download}
            </Button>
          </div>
        </div>
        {url ? (
          <iframe
            ref={frame}
            title={`${texts.preview} ${title}`}
            src={url}
            className="h-full w-full border bg-muted"
          />
        ) : (
          <div className="grid place-items-center text-sm text-muted-foreground">
            {error ?? texts.preparing}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
