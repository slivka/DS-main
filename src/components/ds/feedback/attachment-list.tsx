/** Seznam příloh · vlastní výběr souborů, filtry a potvrzení · nesmí načítat ani ukládat data. */
import { forwardRef, useRef, useState } from "react";
import { useDsTexts } from "../../../ds-texts";
import { useFileDrop, validateFiles, type RejectedFile } from "../../../hooks/use-file-drop";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Checkbox } from "../../ui/checkbox";
import { cn } from "../../../lib/utils";
import { AttachmentItem } from "./attachment-item";
import { DisabledReasonTooltip } from "./disabled-reason-tooltip";
import { NoticeBar } from "./notice-bar";
import { useConfirmDialog } from "./confirm-dialog";
import type { AttachmentListProps, RecordAttachment } from "./attachment-types";
export type { AttachmentListProps, RecordAttachment } from "./attachment-types";
/** Přílohy se zdrojem a společnou validací výběru/přetažení. */
export const AttachmentList = forwardRef<HTMLDivElement, AttachmentListProps>(
  function AttachmentList(p, ref) {
    const {
      attachments,
      source,
      accept,
      maxSize,
      canAdd = false,
      onFiles,
      texts,
      className,
      onRemove,
      allowRemovalReason = false,
      ...rest
    } = p;
    const t = { ...useDsTexts().attachments, ...texts };
    const dropRef = useRef<HTMLDivElement>(null);
    const fileInput = useRef<HTMLInputElement>(null);
    const reasonRef = useRef<HTMLInputElement>(null);
    const [showRemoved, setShowRemoved] = useState(false);
    const [rejected, setRejected] = useState<RejectedFile[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { confirm, confirmDialog } = useConfirmDialog();
    const receive = (files: File[], refused: RejectedFile[]) => {
      setRejected(refused);
      onFiles?.(files, refused);
    };
    const { dragging } = useFileDrop(dropRef, {
      accept,
      maxSize,
      disabled: !canAdd || !onFiles,
      onFiles: receive,
    });
    const requestRemove = (a: RecordAttachment, kind: "delete" | "remove") =>
      confirm({
        title: kind === "delete" ? t.confirmDelete : t.confirmRemove,
        confirmLabel: kind === "delete" ? t.delete : t.remove,
        destructive: true,
        description: (
          <span className="block space-y-2">
            <span className="block break-words">{a.name}</span>
            {kind === "remove" && allowRemovalReason ? (
              <Input ref={reasonRef} aria-label={t.reason} placeholder={t.reason} />
            ) : null}
          </span>
        ),
        onConfirm: () => {
          const reason =
            kind === "remove" ? reasonRef.current?.value.trim() || undefined : undefined;
          setError(null);
          void Promise.resolve()
            .then(() => onRemove?.(a, kind, reason))
            .catch(() => setError(t.failed));
        },
      });
    // Oddělit aplikační props od DOM atributů bez jejich propouštění do elementu.
    const {
      canRemove: _canRemove,
      removeKind: _removeKind,
      removeDisabledReason: _removeReason,
      addDisabledReason: _addReason,
      onReplaceSource: _replace,
      canReplaceSource: _canReplace,
      replaceDisabledReason: _replaceReason,
      onDownload: _download,
      onOpen: _open,
      ...dom
    } = rest;
    return (
      <div ref={ref} {...dom} className={cn("min-w-0", className)}>
        <div
          ref={dropRef}
          data-slot="attachment-drop-zone"
          className={cn("min-w-0", dragging && "bg-primary/10 ring-2 ring-ring")}
        >
          {onFiles ? (
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border border-dashed border-border p-3">
              <span className="text-sm text-muted-foreground">{t.drop}</span>
              <input
                ref={fileInput}
                type="file"
                multiple
                accept={accept.join(",")}
                aria-label={t.add}
                className="hidden"
                onChange={(event) => {
                  if (!canAdd) return;
                  const result = validateFiles(
                    Array.from(event.target.files ?? []),
                    accept,
                    maxSize,
                  );
                  receive(result.files, result.rejected);
                  event.target.value = "";
                }}
              />
              <DisabledReasonTooltip blocked={!canAdd} content={p.addDisabledReason ?? t.denied}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  aria-disabled={!canAdd}
                  onClick={() => {
                    if (canAdd) fileInput.current?.click();
                  }}
                >
                  {t.add}
                </Button>
              </DisabledReasonTooltip>
            </div>
          ) : null}
          {rejected.length ? (
            <NoticeBar tone="danger">
              <ul>
                {rejected.map((item, index) => (
                  <li key={index} className="break-words">
                    {item.file.name}:{" "}
                    {item.reasons
                      .map((reason) => (reason === "size" ? t.tooLarge : t.invalidType))
                      .join(" · ")}
                  </li>
                ))}
              </ul>
            </NoticeBar>
          ) : null}
          {error ? <NoticeBar tone="danger">{error}</NoticeBar> : null}
          {source ? (
            <ul>
              <AttachmentItem
                source
                attachment={source}
                options={p}
                texts={t}
                onRequestRemove={requestRemove}
              />
            </ul>
          ) : null}
          {attachments.some((a) => a.removedAt) ? (
            <label className="my-3 flex items-center gap-2 text-sm">
              <Checkbox
                checked={showRemoved}
                onCheckedChange={(checked) => setShowRemoved(checked === true)}
              />
              {t.showRemoved}
            </label>
          ) : null}
          <ul>
            {attachments
              .filter((a) => showRemoved || !a.removedAt)
              .map((a) => (
                <AttachmentItem
                  key={a.id}
                  attachment={a}
                  options={p}
                  texts={t}
                  onRequestRemove={requestRemove}
                />
              ))}
          </ul>
          {!attachments.some((a) => showRemoved || !a.removedAt) ? (
            <p className="py-3 text-sm text-muted-foreground">{t.empty}</p>
          ) : null}
        </div>
        {confirmDialog}
      </div>
    );
  },
);
