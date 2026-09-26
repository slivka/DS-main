import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Pencil, Trash2 } from "lucide-react";

import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { formatUserDateTime } from "../../../lib/date-time-preferences";
import { useConfirmDialog } from "./confirm-dialog";

/** Poznámka uživatele k záznamu. */
export type RecordNote = {
  id: string;
  body: string;
  author?: string | null;
  createdAt: string;
  /** Může přihlášený uživatel poznámku upravit nebo odstranit? */
  editable?: boolean;
};

export type RecordNotesTexts = {
  placeholder: string;
  add: string;
  save: string;
  cancel: string;
  edit: string;
  remove: string;
  empty: string;
  sortNewest: string;
  sortOldest: string;
  confirmRemove: string;
};

const DEFAULT_TEXTS: RecordNotesTexts = {
  placeholder: "Nová poznámka…",
  add: "Přidat",
  save: "Uložit",
  cancel: "Zrušit",
  edit: "Upravit",
  remove: "Odstranit",
  empty: "Zatím bez poznámek.",
  sortNewest: "Nejnovější nahoře",
  sortOldest: "Nejstarší nahoře",
  confirmRemove: "Opravdu odstranit poznámku?",
};

/**
 * Sdílený panel poznámek k záznamu. Data i ukládání dodává aplikace přes props,
 * komponenta sama nic nenačítá.
 */
export function RecordNotes({
  notes,
  onAdd,
  onUpdate,
  onRemove,
  texts,
}: {
  notes: RecordNote[];
  onAdd?: (body: string) => void | Promise<void>;
  onUpdate?: (id: string, body: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
  texts?: Partial<RecordNotesTexts>;
}) {
  const t = { ...DEFAULT_TEXTS, ...texts };
  const { confirm, confirmDialog } = useConfirmDialog();
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = useMemo(() => {
    const list = [...notes];
    list.sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));
    return sortDesc ? list.reverse() : list;
  }, [notes, sortDesc]);

  return (
    <div className="flex flex-col gap-3">
      {onAdd ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t.placeholder}
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={!body.trim()}
              onClick={async () => {
                await onAdd(body.trim());
                setBody("");
              }}
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
          onClick={() => setSortDesc((v) => !v)}
          title={sortDesc ? t.sortNewest : t.sortOldest}
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
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{note.author ?? "—"}</span>
                <span>{formatUserDateTime(note.createdAt)}</span>
              </div>
              {editingId === note.id ? (
                <div className="mt-2 flex flex-col gap-2">
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(null)}
                    >
                      {t.cancel}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        await onUpdate?.(note.id, editBody.trim());
                        setEditingId(null);
                      }}
                    >
                      {t.save}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-wrap">{note.body}</p>
              )}
              {note.editable !== false && editingId !== note.id ? (
                <div className="mt-2 flex justify-end gap-1">
                  {onUpdate ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      title={t.edit}
                      onClick={() => {
                        setEditingId(note.id);
                        setEditBody(note.body);
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  ) : null}
                  {onRemove ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      title={t.remove}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        confirm({
                          title: t.confirmRemove,
                          destructive: true,
                          confirmLabel: t.remove,
                          onConfirm: () => void onRemove(note.id),
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
}
