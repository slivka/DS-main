/** Poznámky záznamu · vlastní editor a řazení · nesmí načítat data ani vynucovat jediné připnutí. */
import { forwardRef, useMemo, useState, type ComponentPropsWithoutRef } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Pencil, Pin, PinOff, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { Badge } from "../../ui/badge";
import { formatUserDateTime } from "../../../lib/date-time-preferences";
import { useDsTexts } from "../../../ds-texts";
import type { RecordNotesTexts as NotesTexts } from "../../../ds-texts/record-panel-texts";
import { cn } from "../../../lib/utils";
import { useConfirmDialog } from "./confirm-dialog";
import { NoticeBar } from "./notice-bar";
/** Poznámka uživatele k záznamu. */
export interface RecordNote {
  /** Klíč poznámky. */
  id: string;
  /** Obsah poznámky. */
  body: string;
  /** Autor. */
  author?: string | null;
  /** Čas vytvoření. */
  createdAt: string;
  /** Záložní oprávnění pro úpravu a odstranění, zachováno pro kompatibilitu. */
  editable?: boolean;
  /** Explicitní oprávnění upravit. */
  canEdit?: boolean;
  /** Explicitní oprávnění odstranit. */
  canRemove?: boolean;
  /** Stav připnutí dodaný aplikací. */
  pinned?: boolean;
  /** Čas poslední úpravy. */
  editedAt?: string | null;
}
/** Původní textový kontrakt s volitelnými novými texty pro zpětnou kompatibilitu. */
export type RecordNotesTexts = Omit<NotesTexts, "pin" | "unpin" | "pinned" | "edited" | "failed"> &
  Partial<Pick<NotesTexts, "pin" | "unpin" | "pinned" | "edited" | "failed">>;
/** Vlastnosti panelu poznámek. */
export interface RecordNotesProps extends ComponentPropsWithoutRef<"div"> {
  /** Poznámky dodané aplikací. */
  notes: RecordNote[];
  /** Uložení nové poznámky. */
  onAdd?: (body: string) => void | Promise<void>;
  /** Uložení změny. */
  onUpdate?: (id: string, body: string) => void | Promise<void>;
  /** Odstranění. */
  onRemove?: (id: string) => void | Promise<void>;
  /** Lokální přepisy textů. */
  texts?: Partial<RecordNotesTexts>;
  /** Právo přidat; výchozí zachovává přítomnost onAdd. */
  canAdd?: boolean;
  /** Právo připnout; může záviset na poznámce. */
  canPin?: boolean | ((note: RecordNote) => boolean);
  /** Právo upravit; má přednost před editable. */
  canEdit?: boolean | ((note: RecordNote) => boolean);
  /** Právo odstranit; má přednost před editable. */
  canRemove?: boolean | ((note: RecordNote) => boolean);
  /** Změna připnutí; jedinou připnutou hlídá aplikace. */
  onPin?: (id: string, pinned: boolean) => void | Promise<void>;
}
function allowed(
  rule: boolean | ((note: RecordNote) => boolean) | undefined,
  note: RecordNote,
  fallback: boolean,
) {
  return typeof rule === "function" ? rule(note) : (rule ?? fallback);
}
/** Existující poznámky, rozšířené o připnutí a oddělená oprávnění. */
export const RecordNotes = forwardRef<HTMLDivElement, RecordNotesProps>(function RecordNotes(
  {
    notes,
    onAdd,
    onUpdate,
    onRemove,
    texts,
    canAdd = true,
    canPin = false,
    canEdit,
    canRemove,
    onPin,
    className,
    ...props
  },
  ref,
) {
  const t = { ...useDsTexts().recordNotes, ...texts };
  const { confirm, confirmDialog } = useConfirmDialog();
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sorted = useMemo(
    () =>
      [...notes].sort((a, b) => {
        if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
        const order = a.createdAt.localeCompare(b.createdAt);
        return sortDesc ? -order : order;
      }),
    [notes, sortDesc],
  );
  const run = async (operation: () => void | Promise<void>, done?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await operation();
      done?.();
    } catch {
      setError(t.failed);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div ref={ref} {...props} className={cn("flex flex-col gap-3", className)}>
      {error ? <NoticeBar tone="danger">{error}</NoticeBar> : null}
      {onAdd && canAdd ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            rows={3}
            disabled={busy}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={busy || !body.trim()}
              onClick={() =>
                void run(
                  () => onAdd(body.trim()),
                  () => setBody(""),
                )
              }
            >
              {t.add}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSortDesc((value) => !value)}
          title={sortDesc ? t.sortNewest : t.sortOldest}
          aria-label={sortDesc ? t.sortNewest : t.sortOldest}
        >
          {sortDesc ? (
            <ArrowDownWideNarrow className="size-4" />
          ) : (
            <ArrowUpWideNarrow className="size-4" />
          )}
        </Button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((note) => (
            <li key={note.id} className="rounded-md border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{note.author ?? "—"}</span>
                <span>
                  {formatUserDateTime(note.createdAt)}
                  {note.editedAt ? ` · ${t.edited} ${formatUserDateTime(note.editedAt)}` : ""}
                </span>
                {note.pinned ? <Badge variant="secondary">{t.pinned}</Badge> : null}
              </div>
              {editingId === note.id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <Textarea
                    value={editBody}
                    onChange={(event) => setEditBody(event.target.value)}
                    aria-label={t.edit}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setEditingId(null)}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy || !editBody.trim()}
                      onClick={() =>
                        void run(
                          () => onUpdate?.(note.id, editBody.trim()),
                          () => setEditingId(null),
                        )
                      }
                    >
                      {t.save}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap break-words">{note.body}</p>
              )}
              {editingId !== note.id ? (
                <div className="mt-2 flex justify-end gap-1">
                  {onPin && allowed(canPin, note, false) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      aria-label={note.pinned ? t.unpin : t.pin}
                      title={note.pinned ? t.unpin : t.pin}
                      onClick={() => void run(() => onPin(note.id, !note.pinned))}
                    >
                      {note.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                    </Button>
                  ) : null}
                  {onUpdate && allowed(canEdit, note, note.canEdit ?? note.editable !== false) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      aria-label={t.edit}
                      title={t.edit}
                      onClick={() => {
                        setEditingId(note.id);
                        setEditBody(note.body);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  ) : null}
                  {onRemove &&
                  allowed(canRemove, note, note.canRemove ?? note.editable !== false) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      aria-label={t.remove}
                      title={t.remove}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        confirm({
                          title: t.confirmRemove,
                          destructive: true,
                          confirmLabel: t.remove,
                          onConfirm: () => void run(() => onRemove(note.id)),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  ) : null}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {confirmDialog}
    </div>
  );
});
