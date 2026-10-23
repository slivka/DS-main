/** Návrhy buněk · vlastní veřejné klíče a mapování sloupců · nesmí měnit data APP. */
import { useRef } from "react";
import type { FieldSuggestion } from "../form/field-feedback";
import type { JournalLine } from "./journal-lines";
import { isAccountColumn, DIMENSION_COLUMNS } from "./journal-lines-model";

/** Klíče návrhů buněk, nezávislé na režimu MD/DAL/protiúčet. */
export type JournalSuggestionKey = "account" | "dimension" | "vatCode" | "amount" | "text";
/** Návrhy podle id řádku; vlastníkem je aplikace. */
export type JournalRowSuggestions = Record<
  string,
  Partial<Record<JournalSuggestionKey, FieldSuggestion>>
>;

/** Klíč návrhu odpovídající sloupci editoru. */
export function journalSuggestionKey(column: string): JournalSuggestionKey | undefined {
  if (isAccountColumn(column)) return "account";
  if (DIMENSION_COLUMNS.has(column)) return "dimension";
  if (column === "vatCodeId") return "vatCode";
  if (column === "amount" || column === "foreignAmount") return "amount";
  if (column === "text") return "text";
  return undefined;
}

/** První skutečná ruční změna buňky oznamuje návrh, další psaní jej znovu nehlásí. */
export function useJournalSuggestionClear(
  suggestions: JournalRowSuggestions | undefined,
  onCleared: ((key: string, rowId?: string) => void) | undefined,
) {
  const cleared = useRef(new Map<string, string>());
  for (const [id, signature] of cleared.current) {
    const [rowId, key] = JSON.parse(id) as [string, JournalSuggestionKey];
    if (JSON.stringify(suggestions?.[rowId]?.[key]) !== signature) cleared.current.delete(id);
  }
  return (line: JournalLine, values: Partial<JournalLine>) => {
    for (const column of Object.keys(values) as (keyof JournalLine)[]) {
      const key = journalSuggestionKey(column);
      const suggestion = key ? suggestions?.[line.id]?.[key] : undefined;
      if (!key || !suggestion || values[column] === line[column]) continue;
      const id = JSON.stringify([line.id, key]);
      const signature = JSON.stringify(suggestion);
      if (cleared.current.get(id) === signature) continue;
      cleared.current.set(id, signature);
      onCleared?.(key, line.id);
    }
  };
}
