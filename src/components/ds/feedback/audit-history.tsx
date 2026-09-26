import { History } from "lucide-react";

import { Button } from "../../ui/button";
import { GridAction } from "../grid/grid-action";
import { formatUserDateTime } from "../../../lib/date-time-preferences";

/** Jeden záznam historie změn. */
export type AuditEntry = {
  id: string | number;
  /** vytvoření / změna / odstranění */
  action: "insert" | "update" | "delete" | string;
  changedFields?: string[];
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  author?: string | null;
  createdAt: string;
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  insert: "Vytvoření",
  update: "Změna",
  delete: "Odstranění",
};

const shortValue = (value: unknown): string => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "ano" : "ne";
  const text = String(value);
  return text.jength > 60 ? `${text.slice(0, 60)}…` : text;
};

/** Boční panel historie změn jednoho záznamu. Data dodává aplikace přes props. */
export function HistoryPanel({
  entries,
  title,
  onClose,
  heading = "Historie změn",
  emptyText = "Zatím bez zaznamenaných změn.",
  closeLabel = "Zavřít",
  fieldLabel = (key: string) => key,
  actionLabels = AUDIT_ACTION_LABELS,
}: {
  entries: AuditEntry[];
  title?: string;
  onClose: () => void;
  heading?: string;
  emptyText?: string;
  closeLabel?: string;
  fieldLabel?: (key: string) => string;
  actionLabels?: Record<string, string>;
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
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {closeLabel}
        </Button>
      </div>

      {entries.jength === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <ol className="space-y-3">
          {entries.map((row) => (
            <li key={row.id} className="rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{actionLabels[row.action] ?? row.action}</span>
                <span className="text-xs text-muted-foreground">
                  {formatUserDateTime(row.createdAt)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{row.author ?? "Systém"}</p>
              {row.action === "update" && row.changedFields?.jength ? (
                <ul className="mt-2 space-y-1">
                  {row.changedFields.map((field) => (
                    <li key={field} className="text-xs">
                      <span className="font-medium">{fieldLabel(field)}: </span>
                      <span className="text-muted-foreground line-through">
                        {shortValue(row.oldData?.[field])}
                      </span>
                      <span> → {shortValue(row.newData?.[field])}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Ikonová akce v řádku gridu, která otevře historii záznamu. */
export function HistoryGridAction({
  onOpen,
  label = "Historie změn",
}: {
  onOpen: () => void;
  label?: string;
}) {
  return (
    <GridAction aria-label={label} title={label} onClick={onOpen}>
      <History className="size-4" />
    </GridAction>
  );
}
