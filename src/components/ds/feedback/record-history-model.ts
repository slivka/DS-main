/**
 * Model historie záznamu · vlastní typy událostí, filtr a seskupení po dnech
 * · nesmí načítat data ani formátovat doménové hodnoty (dodává je aplikace).
 */
import { isoDateInTimeZone, shiftIsoDate } from "../../../lib/date-time-preferences";
import type { StatusTone } from "../data-display/status-badge";

/** Typ události historie; řídí filtr. */
export type HistoryKind = "status" | "change" | "attachment" | "note" | "link";

/** Pořadí typů ve filtru. */
export const HISTORY_KINDS: HistoryKind[] = ["status", "change", "attachment", "note", "link"];

/** Režim zobrazení historie. */
export type HistoryMode = "basic" | "detailed";

/** Jedna zmapovaná změna pole – hodnoty už zformátované aplikací. */
export interface HistoryChange {
  /** Popisek pole v jazyce uživatele. */
  label: string;
  /** Původní zobrazená hodnota; prázdná = „—“. */
  before?: string;
  /** Nová zobrazená hodnota; prázdná = „—“. */
  after?: string;
}

/** Změna řádku dokladu. */
export interface HistoryLineChange {
  /** Označení řádku (např. „řádek 3“). */
  label: string;
  /** Druh změny řádku. */
  kind: "added" | "removed" | "changed";
  /** Zmapovaný souhrn řádku (např. „Servis 1 500,00“). */
  summary?: string;
  /** Změny polí změněného řádku. */
  changes?: HistoryChange[];
}

/** Změna stavu – popisky už přeložené aplikací. */
export interface HistoryStatusChange {
  /** Předchozí stav. */
  from?: string;
  /** Nový stav. */
  to: string;
  /** Významový tón nového stavu. */
  tone?: StatusTone;
}

/** Jedna zmapovaná událost historie. */
export interface HistoryEvent {
  /** Stabilní identifikátor. */
  id: string;
  /** Okamžik události (ISO). */
  at: string;
  /** Autor; bez autora = systém. */
  author?: string;
  /** Typ události. */
  kind: HistoryKind;
  /** Nadpis události (např. „Upraveno – 5 polí“). */
  title: string;
  /** Změna stavu. */
  statusChange?: HistoryStatusChange;
  /** Změny polí hlavičky. */
  changes?: HistoryChange[];
  /** Změny řádků. */
  lines?: HistoryLineChange[];
  /** Automatické přepočty. */
  auto?: HistoryChange[];
  /** Text poznámky. */
  note?: string;
}

/** Skupina událostí jednoho kalendářního dne. */
export interface HistoryDayGroup {
  /** Den YYYY-MM-DD v časové zóně uživatele. */
  day: string;
  /** Druh popisku skupiny. */
  relative: "today" | "yesterday" | "date";
  /** Události od nejnovější. */
  events: HistoryEvent[];
}

/** Prázdný filtr = všechny typy. */
export function filterHistory(events: HistoryEvent[], filter: HistoryKind[]): HistoryEvent[] {
  return filter.length ? events.filter((event) => filter.includes(event.kind)) : events;
}

/** Seřadí od nejnovější a seskupí po dnech vůči `now`. */
export function groupHistoryByDay(events: HistoryEvent[], now: Date = new Date()) {
  const today = isoDateInTimeZone(now);
  const yesterday = shiftIsoDate(today, -1);
  const sorted = [...events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  const groups: HistoryDayGroup[] = [];
  for (const event of sorted) {
    const day = isoDateInTimeZone(event.at);
    let group = groups[groups.length - 1];
    if (!group || group.day !== day) {
      const relative = day === today ? "today" : day === yesterday ? "yesterday" : "date";
      group = { day, relative, events: [] };
      groups.push(group);
    }
    group.events.push(event);
  }
  return groups;
}

/** Počet zobrazitelných změn události (pole, řádky, přepočty). */
export function countHistoryChanges(event: HistoryEvent): number {
  return (event.changes?.length ?? 0) + (event.lines?.length ?? 0) + (event.auto?.length ?? 0);
}
