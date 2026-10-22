/** Náhled zdroje · vlastní vykreslení a nástroje · nesmí určovat oprávnění ani ukládat. */
import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef } from "react";
import { Download, ExternalLink, FileText, Replace, Upload } from "lucide-react";
import { Button } from "../../ui/button";
import { cn } from "../../../lib/utils";
import { useDsTexts } from "../../../ds-texts";
import { formatFileSize } from "../../../lib/file-size";
import { useFileDrop, validateFiles, type RejectedFile } from "../../../hooks/use-file-drop";
import { RecordPanelToolbar } from "../layout/record-panel-toolbar";
import { PanelToolButton } from "../layout/record-panel-tools";
import type { RecordAttachment } from "./attachment-types";
/** Odkaz na záznam, ze kterého zdroj pochází. */
export interface SourceInheritedFrom {
  /** Popisek zdrojového záznamu. */
  label: string;
  /** Otevření zdrojového záznamu. */
  onOpen: () => void;
}
/** Props náhledu zdroje; data, adresy i oprávnění dodává aplikace. */
export interface SourcePreviewProps extends ComponentPropsWithoutRef<"div"> {
  /** Zdroj záznamu; null vykreslí prázdný stav s nahráním. */
  source: RecordAttachment | null;
  /** Povolené MIME typy a přípony pro nahrání. */
  accept: readonly string[];
  /** Limit jednoho souboru v bytech. */
  maxSize: number;
  /** Právo nahradit; false ponechá zablokovanou akci s důvodem. */
  canReplace?: boolean;
  /** Důvod zákazu náhrady. */
  replaceDisabledReason?: string;
  /** Náhrada zdroje přes aplikaci. */
  onReplace?: () => void;
  /** Přijaté a odmítnuté soubory prázdného stavu. */
  onUpload?: (files: File[], rejected: RejectedFile[]) => void;
  /** Stažení přes aplikaci; jinak odkaz z url. */
  onDownload?: (attachment: RecordAttachment) => void;
  /** Otevření v novém okně přes aplikaci; jinak odkaz z url. */
  onOpen?: (attachment: RecordAttachment) => void;
  /** Zděděný zdroj je jen ke čtení s odkazem na původ. */
  inheritedFrom?: SourceInheritedFrom;
  /** Vypršení podepsané adresy – aplikace dodá novou. */
  onUrlExpired?: () => void;
}
/** Druh náhledu podle typu a názvu souboru. */
function previewKind(source: RecordAttachment): "pdf" | "image" | "none" {
  const name = source.name.toLowerCase();
  if (source.type === "application/pdf" || name.endsWith(".pdf")) return "pdf";
  if (source.type.startsWith("image/")) return "image";
  return "none";
}
/** Náhled zdroje přes celou výšku záložky s jednotným řádkem nástrojů. */
export const SourcePreview = forwardRef<HTMLDivElement, SourcePreviewProps>(function SourcePreview(
  {
    source,
    accept,
    maxSize,
    canReplace = true,
    replaceDisabledReason,
    onReplace,
    onUpload,
    onDownload,
    onOpen,
    inheritedFrom,
    onUrlExpired,
    className,
    ...props
  },
  ref,
) {
  const t = useDsTexts();
  const dropHost = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(0);
  const [failed, setFailed] = useState(false);
  const [rejected, setRejected] = useState<RejectedFile[]>([]);
  const reported = useRef(false);
  useEffect(() => {
    setFailed(false);
    reported.current = false;
  }, [source?.id, source?.previewUrl, source?.url]);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    // Nativní PDF prohlížeč musí po změně šířky znovu použít FitH, nikoli staré přiblížení.
    const observer = new ResizeObserver(() => {
      setPreviewWidth(Math.round(element.clientWidth));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [source?.id]);
  const expire = () => {
    setFailed(true);
    if (!reported.current) {
      reported.current = true;
      onUrlExpired?.();
    }
  };
  const upload = (files: File[], refused: RejectedFile[]) => {
    setRejected(refused);
    onUpload?.(files, refused);
  };
  const { dragging } = useFileDrop(dropHost, {
    accept,
    maxSize,
    disabled: !onUpload,
    onFiles: upload,
  });
  if (!source) {
    return (
      <div ref={ref} {...props} className={cn("flex h-full min-h-0 flex-1 flex-col gap-2", className)}>
        <div
          ref={dropHost}
          className={cn(
            "flex flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center",
            dragging ? "border-accent bg-accent/10" : "border-border",
          )}
        >
          <Upload className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">{t.attachments.drop}</p>
          {onUpload ? (
            <>
              <Button type="button" onClick={() => input.current?.click()}>
                {t.sourcePreview.upload}
              </Button>
              <input
                ref={input}
                type="file"
                className="hidden"
                accept={accept.join(",")}
                aria-label={t.sourcePreview.upload}
                onChange={(event) => {
                  const files = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  const result = validateFiles(files, accept, maxSize);
                  upload(result.files, result.rejected);
                }}
              />
            </>
          ) : null}
        </div>
        <RejectedNotes rejected={rejected} />
      </div>
    );
  }
  const url = source.previewUrl ?? source.url;
  const kind = failed ? "none" : previewKind(source);
  const readOnly = Boolean(inheritedFrom);
  const replaceBlock = !canReplace ? (replaceDisabledReason ?? t.attachments.denied) : undefined;
  return (
    <div ref={ref} {...props} data-slot="source-preview" className={cn("flex h-full min-h-0 flex-1 flex-col gap-2", className)}>
      <RecordPanelToolbar
        start={
          <span className="min-w-0 truncate text-sm font-medium" title={source.name}>
            {source.name}
          </span>
        }
        end={
          <>
            {!readOnly && onReplace ? (
              <PanelToolButton
                label={t.attachments.replace}
                icon={Replace}
                blockedReason={replaceBlock}
                onClick={onReplace}
              />
            ) : null}
            <PanelToolButton
              label={t.attachments.download}
              icon={Download}
              onClick={() => (onDownload ? onDownload(source) : openUrl(url, source.name))}
            />
            <PanelToolButton
              label={t.attachments.open}
              icon={ExternalLink}
              onClick={() => (onOpen ? onOpen(source) : openUrl(url))}
            />
          </>
        }
      />
      {inheritedFrom ? (
        <p className="text-xs text-muted-foreground">
          {t.sourcePreview.inherited}{" "}
          <button
            type="button"
            className="text-accent underline underline-offset-2"
            onClick={inheritedFrom.onOpen}
          >
            {inheritedFrom.label}
          </button>
        </p>
      ) : null}
      {failed ? (
        <p className="text-xs text-muted-foreground" role="status">
          {t.sourcePreview.expired}
        </p>
      ) : null}
      <div ref={viewport} data-slot="source-preview-viewport" className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-muted/30">
        {kind === "pdf" && url ? (
          <iframe
            key={previewWidth}
            src={`${url.split("#")[0]}#view=FitH&zoom=page-width&toolbar=0&navpanes=0`}
            title={source.name}
            className="absolute inset-0 h-full w-full border-0"
            onError={expire}
          />
        ) : kind === "image" && url ? (
          <img
            src={url}
            alt={source.name}
            className="absolute inset-0 h-full w-full object-contain"
            onError={expire}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">{source.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(source.size)} · {t.sourcePreview.noPreview}
            </p>
          </div>
        )}
      </div>
    </div>
  );
});
/** Odkazové otevření či stažení, když aplikace nedodá vlastní obsluhu. */
function openUrl(url: string | undefined, download?: string) {
  if (!url) return;
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener,noreferrer";
  if (download) anchor.download = download;
  anchor.click();
}
/** Důvody odmítnutých souborů prázdného stavu. */
function RejectedNotes({ rejected }: { rejected: RejectedFile[] }) {
  const t = useDsTexts();
  if (!rejected.length) return null;
  return (
    <ul className="text-xs text-destructive">
      {rejected.map((item) => (
        <li key={item.file.name}>
          {item.file.name}:{" "}
          {item.reasons
            .map((reason) =>
              reason === "type" ? t.attachments.invalidType : t.attachments.tooLarge,
            )
            .join(", ")}
        </li>
      ))}
    </ul>
  );
}
