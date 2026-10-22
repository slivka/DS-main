/** Seznam příloh · vlastní výběr souborů, filtry a potvrzení · nesmí načítat ani ukládat data. */
import { forwardRef, useRef, useState } from "react";
import { useDsTexts } from "../../../ds-texts";
import { useFileDrop, validateFiles, type RejectedFile } from "../../../hooks/use-file-drop";
import { Input } from "../../ui/input";
import { Filter, Plus } from "lucide-react";
import { RecordPanelToolbar } from "../layout/record-panel-toolbar";
import { PanelToolButton } from "../layout/record-panel-tools";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "../../ui/dropdown-menu";
import { cn } from "../../../lib/utils";
import { AttachmentItem } from "./attachment-item";
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
      onSetSource: _setSource,
      canSetSource: _canSetSource,
      setSourceDisabledReason: _sourceReason,
      ...dom
    } = rest;
    return (
      <div ref={ref} {...dom} className={cn("min-w-0", className)}>
        <div
          ref={dropRef}
          data-slot="attachment-drop-zone"
          className={cn("min-w-0", dragging && "bg-primary/10 ring-2 ring-ring")}
        >
          <RecordPanelToolbar
            start={
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <PanelToolButton
                    label={t.filter}
                    icon={Filter}
                    aria-pressed={showRemoved}
                    className={showRemoved ? "text-filter-active" : undefined}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuCheckboxItem checked={showRemoved} onCheckedChange={setShowRemoved}>
                    {t.showRemoved}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            }
            action={
              onFiles
                ? {
                    label: t.add,
                    icon: Plus,
                    disabled: !canAdd,
                    disabledReason: p.addDisabledReason ?? t.denied,
                    onClick: () => fileInput.current?.click(),
                  }
                : undefined
            }
          />
          {onFiles ? (
            <>
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
              <div className="my-2 border border-dashed border-border px-2 py-1 text-xs text-muted-foreground">
                {t.drop}
              </div>
            </>
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
            <>
              <ul>
                <AttachmentItem
                  source
                  attachment={source}
                  options={p}
                  texts={t}
                  onRequestRemove={requestRemove}
                />
              </ul>
              {source.previewUrl || source.url ? (
                source.type === "application/pdf" ? (
                  <iframe
                    src={source.previewUrl ?? source.url}
                    title={source.name}
                    className="h-[var(--attachment-preview-height)] w-full border border-border"
                  />
                ) : source.type.startsWith("image/") ? (
                  <img
                    src={source.previewUrl ?? source.url}
                    alt={source.name}
                    className="max-h-[var(--attachment-preview-height)] w-full object-contain"
                  />
                ) : null
              ) : null}
            </>
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
