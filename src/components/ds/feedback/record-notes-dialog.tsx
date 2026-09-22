import { MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GridAction } from "@/components/ds/grid/grid-action";
import { RecordNotes, type RecordNote } from "@/components/ds/feedback/record-notes";

/** Boční panel poznámek k záznamu. */
export function NotesPanel({
  notes,
  onClose,
  title,
  heading = "Poznámky",
  closeLabel = "Zavřít",
  onAdd,
  onUpdate,
  onRemove,
}: {
  notes: RecordNote[];
  onClose: () => void;
  title?: string;
  heading?: string;
  closeLabel?: string;
  onAdd?: (body: string) => void | Promise<void>;
  onUpdate?: (id: string, body: string) => void | Promise<void>;
  onRemove?: (id: string) => void | Promise<void>;
}) {
  return (
    <div
      className="flex flex-col gap-4"
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 border-b pb-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase">{heading}</h2>
          {title ? <p className="truncate text-sm text-muted-foreground">{title}</p> : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onClose}
        >
          {closeLabel}
        </Button>
      </div>
      <RecordNotes notes={notes} onAdd={onAdd} onUpdate={onUpdate} onRemove={onRemove} />
    </div>
  );
}

/** Buňka sloupce „Poznámky“ – počet poznámek, kliknutím se otevře panel. */
export function NotesCountCell({
  count = 0,
  onOpen,
  emptyLabel = "Přidat",
  title = "Poznámky",
}: {
  count?: number;
  onOpen: () => void;
  emptyLabel?: string;
  title?: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded px-1 text-sm underline-offset-2 hover:underline"
      title={title}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <MessageSquare className="size-3.5 opacity-70" />
      {count > 0 ? (
        <span className="font-medium">{count}</span>
      ) : (
        <span className="text-muted-foreground">{emptyLabel}</span>
      )}
    </button>
  );
}

/** Ikonová akce v řádku gridu – otevře panel poznámek. */
export function NotesGridAction({
  count = 0,
  onOpen,
  label = "Poznámky",
}: {
  count?: number;
  onOpen: () => void;
  label?: string;
}) {
  return (
    <GridAction
      aria-label={label}
      title={label}
      className="relative"
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
    >
      <MessageSquare className="size-4" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground">
          {count}
        </span>
      ) : null}
    </GridAction>
  );
}
