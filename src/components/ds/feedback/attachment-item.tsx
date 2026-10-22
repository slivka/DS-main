/** Položka přílohy · vlastní metadata a akce · nesmí rozhodovat oprávnění podle stavu dokladu. */
import { forwardRef, type ComponentPropsWithoutRef } from "react";
import { FileText, FileImage, Download, ExternalLink, Trash2, X, MoreHorizontal, Replace } from "lucide-react";
import { Button } from "../../ui/button";
import { Progress } from "../../ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { formatFileSize } from "../../../lib/file-size";
import { formatUserDateTime } from "../../../lib/date-time-preferences";
import { PanelToolButton } from "../layout/record-panel-tools";
import { DisabledReasonMenuItem } from "./disabled-reason-menu-item";
import { TruncatedText } from "../data-display/truncated-text";
import { NoticeBar } from "./notice-bar";
import type { AttachmentListProps, RecordAttachment } from "./attachment-types";
import type { AttachmentTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
/** Vnitřní zobrazení přílohy. */
export interface AttachmentItemProps extends ComponentPropsWithoutRef<"li"> {
  /** Příloha. */
  attachment: RecordAttachment;
  /** @deprecated Od 2.123.0 použijte SourcePreview. */
  source?: boolean;
  /** Aplikační operace. */
  options: AttachmentListProps;
  /** Přeložené texty. */
  texts: AttachmentTexts;
  /** Otevření společného potvrzení. */
  onRequestRemove: (attachment: RecordAttachment, kind: "delete" | "remove") => void;
}
/** Kompaktní příloha bez náhledu, s jediným potvrzením odebrání. */
export const AttachmentItem = forwardRef<HTMLLIElement, AttachmentItemProps>(
  function AttachmentItem(
    { attachment: a, source = false, options: p, texts: t, onRequestRemove, className, ...props },
    ref,
  ) {
    const kind = source || a.removedAt ? null : p.removeKind?.(a);
    const permitted = p.canRemove?.(a) ?? false;
    const Icon = a.type.startsWith("image/") ? FileImage : FileText;
    const open = () =>
      p.onOpen
        ? p.onOpen(a)
        : a.url
          ? window.open(a.url, "_blank", "noopener,noreferrer")
          : undefined;
    const download = () => {
      if (p.onDownload) {
        p.onDownload(a);
        return;
      }
      if (!a.url) return;
      const link = document.createElement("a");
      link.href = a.url;
      link.download = a.name;
      link.rel = "noopener noreferrer";
      link.click();
    };
    return (
      <li
        ref={ref}
        {...props}
        className={cn("min-w-0 space-y-1 border-b border-border py-2", className)}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <Button
              type="button"
              variant="link"
              className={cn(
                "h-auto max-w-full justify-start p-0 text-sm",
                a.removedAt && "line-through text-muted-foreground",
              )}
              onClick={open}
              aria-disabled={!p.onOpen && !a.url}
            >
              <TruncatedText text={a.name} className="min-w-0" />
            </Button>
            <TruncatedText
              text={`${formatFileSize(a.size)} · ${a.uploadedBy ?? "—"} · ${formatUserDateTime(a.uploadedAt)}`}
              className="text-xs text-muted-foreground"
            />
          </div>
          <div className="flex shrink-0 items-center">
            {source && p.onReplaceSource ? (
              <PanelToolButton
                label={t.replace}
                icon={Replace}
                blockedReason={
                  p.canReplaceSource === false ? (p.replaceDisabledReason ?? t.denied) : undefined
                }
                onClick={() => void p.onReplaceSource?.(a)}
              />
            ) : null}
            {!source && (p.onDownload || a.url) ? (
              <PanelToolButton label={t.download} icon={Download} onClick={download} />
            ) : null}
            {!source && (p.onOpen || a.url) ? (
              <PanelToolButton label={t.open} icon={ExternalLink} onClick={open} />
            ) : null}
            {kind && p.onRemove ? (
              <PanelToolButton
                label={kind === "delete" ? t.delete : t.remove}
                icon={kind === "delete" ? Trash2 : X}
                className="text-destructive"
                blockedReason={!permitted ? (p.removeDisabledReason?.(a) ?? t.denied) : undefined}
                onClick={() => onRequestRemove(a, kind)}
              />
            ) : null}
            {!source && !a.removedAt && p.onSetSource ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PanelToolButton label={t.setSource} icon={MoreHorizontal} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DisabledReasonMenuItem
                    disabled={!(p.canSetSource?.(a) ?? false)}
                    disabledReason={p.setSourceDisabledReason?.(a) ?? t.denied}
                    onSelect={() => {
                      if (p.canSetSource?.(a)) void p.onSetSource?.(a);
                    }}
                  >
                    {t.setSource}
                  </DisabledReasonMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
        {a.removedAt ? (
          <TruncatedText
            text={`${t.removed} · ${a.removedBy ?? "—"} · ${formatUserDateTime(a.removedAt)}${a.removalReason ? ` · ${a.removalReason}` : ""}`}
            className="text-xs text-muted-foreground"
          />
        ) : null}
        {a.progress !== undefined ? <Progress value={a.progress} aria-label={a.name} /> : null}
        {a.error ? <NoticeBar tone="danger">{a.error}</NoticeBar> : null}
      </li>
    );
  },
);
