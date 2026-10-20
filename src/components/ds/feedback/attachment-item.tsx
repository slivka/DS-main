/** Položka přílohy · vlastní metadata a akce · nesmí rozhodovat oprávnění podle stavu dokladu. */
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Progress } from "../../ui/progress";
import { formatFileSize } from "../../../lib/file-size";
import { formatUserDateTime } from "../../../lib/date-time-preferences";
import { DisabledReasonTooltip } from "./disabled-reason-tooltip";
import { NoticeBar } from "./notice-bar";
import type { AttachmentListProps, RecordAttachment } from "./attachment-types";
import type { AttachmentTexts } from "../../../ds-texts";
/** Vnitřní zobrazení přílohy. */
export interface AttachmentItemProps {
  /** Příloha. */
  attachment: RecordAttachment;
  /** Zdroj je pouze nahraditelný. */
  source?: boolean;
  /** Aplikační operace. */
  options: AttachmentListProps;
  /** Přeložené texty. */
  texts: AttachmentTexts;
  /** Otevření společného potvrzení. */
  onRequestRemove: (attachment: RecordAttachment, kind: "delete" | "remove") => void;
}
/** Zdroj i příloha sdílejí jedinou prezentaci metadat. */
export function AttachmentItem({
  attachment: a,
  source = false,
  options: p,
  texts: t,
  onRequestRemove,
}: AttachmentItemProps) {
  const kind = source || a.removedAt ? null : p.removeKind?.(a);
  const permitted = p.canRemove?.(a) ?? false;
  const preview = a.previewUrl ?? a.url;
  return (
    <li className="space-y-2 border-b border-border py-3">
      <div className="flex min-w-0 items-center gap-2">
        {source ? <Badge variant="secondary">{t.source}</Badge> : null}
        <span
          className={`min-w-0 truncate text-sm font-medium ${a.removedAt ? "line-through text-muted-foreground" : ""}`}
          title={a.name}
        >
          {a.name}
        </span>
      </div>
      <p className="break-words text-xs text-muted-foreground">
        {a.type} · {formatFileSize(a.size)} · {a.uploadedBy ?? "—"} ·{" "}
        {formatUserDateTime(a.uploadedAt)}
      </p>
      {a.removedAt ? (
        <p className="break-words text-xs text-muted-foreground">
          {t.removed} · {a.removedBy ?? "—"} · {formatUserDateTime(a.removedAt)}
          {a.removalReason ? ` · ${a.removalReason}` : ""}
        </p>
      ) : null}
      {source && preview ? (
        a.type === "application/pdf" ? (
          <iframe
            src={preview}
            title={a.name}
            className="h-[var(--attachment-preview-height)] w-full border border-border"
          />
        ) : a.type.startsWith("image/") ? (
          <img
            src={preview}
            alt={a.name}
            className="max-h-[var(--attachment-preview-height)] w-full object-contain"
          />
        ) : null
      ) : null}
      {a.progress !== undefined ? (
        <div aria-label={a.name}>
          <Progress value={a.progress} aria-label={a.name} />
          <span className="text-xs tabular-nums">{a.progress} %</span>
        </div>
      ) : null}
      {a.error ? <NoticeBar tone="danger">{a.error}</NoticeBar> : null}
      <div className="flex flex-wrap gap-2">
        {source && p.onReplaceSource ? (
          <DisabledReasonTooltip
            blocked={p.canReplaceSource === false}
            content={p.replaceDisabledReason ?? t.denied}
          >
            <Button
              type="button"
              size="sm"
              variant="outline"
              aria-disabled={p.canReplaceSource === false}
              onClick={() => {
                if (p.canReplaceSource !== false) void p.onReplaceSource?.(a);
              }}
            >
              {t.replace}
            </Button>
          </DisabledReasonTooltip>
        ) : null}
        {!source && (p.onDownload || a.url) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild={!p.onDownload}
            onClick={p.onDownload ? () => p.onDownload?.(a) : undefined}
          >
            {p.onDownload ? (
              t.download
            ) : (
              <a href={a.url} download={a.name} target="_blank" rel="noopener noreferrer">
                {t.download}
              </a>
            )}
          </Button>
        ) : null}
        {!source && (p.onOpen || a.url) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild={!p.onOpen}
            onClick={p.onOpen ? () => p.onOpen?.(a) : undefined}
          >
            {p.onOpen ? (
              t.open
            ) : (
              <a href={a.url} target="_blank" rel="noopener noreferrer">
                {t.open}
              </a>
            )}
          </Button>
        ) : null}
        {kind && p.onRemove ? (
          <DisabledReasonTooltip
            blocked={!permitted}
            content={p.removeDisabledReason?.(a) ?? t.denied}
          >
            <Button
              type="button"
              size="sm"
              variant="outline-destructive"
              aria-disabled={!permitted}
              onClick={() => {
                if (permitted) onRequestRemove(a, kind);
              }}
            >
              {kind === "delete" ? t.delete : t.remove}
            </Button>
          </DisabledReasonTooltip>
        ) : null}
      </div>
    </li>
  );
}
