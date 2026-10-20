/**
 * Detail události historie · vlastní tabulku „Pole – Bylo → Je“, řádky a sbalené přepočty
 * · nesmí formátovat hodnoty (zobrazuje jen zmapované texty aplikace).
 */
import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { useDsTexts } from "../../../ds-texts";
import { cn } from "../../../lib/utils";
import { TruncatedText } from "../data-display/truncated-text";
import type { HistoryChange, HistoryEvent, HistoryLineChange } from "./record-history-model";

const EMPTY = "—";

/** Vlastnosti tabulky změn. */
export interface HistoryChangeTableProps {
  /** Zmapované změny. */
  changes: HistoryChange[];
  /** Předpona popisku pole (např. „řádek 1 – “). */
  prefix?: string;
}

/** Tabulka „Pole – Bylo → Je“; dlouhé hodnoty zkracuje s bublinou. */
export function HistoryChangeTable({ changes, prefix = "" }: HistoryChangeTableProps) {
  const texts = useDsTexts().recordHistory;
  return (
    <table className="w-full table-fixed text-xs">
      <thead className="sr-only">
        <tr>
          <th>{texts.field}</th>
          <th>{texts.before}</th>
          <th aria-hidden>→</th>
          <th>{texts.after}</th>
        </tr>
      </thead>
      <tbody>
        {changes.map((change, index) => (
          <tr key={`${change.label}-${index}`} data-history-change>
            <td className="w-[38%] py-0.5 pr-2 text-muted-foreground">
              <TruncatedText text={`${prefix}${change.label}`} />
            </td>
            <td className="py-0.5 text-muted-foreground line-through">
              <TruncatedText text={change.before || EMPTY} />
            </td>
            <td aria-hidden className="w-[1.5em] text-center text-muted-foreground">
              →
            </td>
            <td className="py-0.5 font-medium">
              <TruncatedText text={change.after || EMPTY} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LineChange({ line }: { line: HistoryLineChange }) {
  const texts = useDsTexts().recordHistory;
  if (line.kind === "changed")
    return <HistoryChangeTable changes={line.changes ?? []} prefix={`${line.label} – `} />;
  const head = line.kind === "added" ? texts.lineAdded(line.label) : texts.lineRemoved(line.label);
  return (
    <TruncatedText
      className={cn("text-xs", line.kind === "removed" && "text-muted-foreground")}
      text={line.summary ? `${head}: ${line.summary}` : head}
    />
  );
}

/** Rozšířený detail jedné události. */
export function HistoryEventDetail({ event }: { event: HistoryEvent }) {
  const texts = useDsTexts().recordHistory;
  const [autoOpen, setAutoOpen] = useState(false);
  const auto = event.auto ?? [];
  return (
    <div className="mt-1 min-w-0 space-y-1" data-testid="history-detail">
      {event.changes?.length ? <HistoryChangeTable changes={event.changes} /> : null}
      {event.lines?.map((line, index) => (
        <LineChange key={`${line.label}-${index}`} line={line} />
      ))}
      {event.note ? (
        <p className="whitespace-pre-wrap break-words text-xs text-muted-foreground">
          {event.note}
        </p>
      ) : null}
      {auto.length ? (
        <div>
          <button
            type="button"
            aria-expanded={autoOpen}
            onClick={() => setAutoOpen(!autoOpen)}
            className="flex max-w-full items-center gap-1 rounded-sm text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronRight
              aria-hidden
              className={cn("size-3.5 shrink-0 transition-transform", autoOpen && "rotate-90")}
            />
            <span className="truncate">{texts.autoSummary(String(auto.length))}</span>
          </button>
          {autoOpen ? <HistoryChangeTable changes={auto} /> : null}
        </div>
      ) : null}
    </div>
  );
}
