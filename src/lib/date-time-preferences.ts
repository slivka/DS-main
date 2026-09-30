import { useMemo } from "react";

export type DateFormat = "dd.MM.yyyy" | "d.M.yyyy" | "yyyy-MM-dd" | "dd/MM/yyyy";
export type TimeFormat = "HH:mm" | "HH:mm:ss" | "h:mm a";

export type DateTimePreferences = {
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  timeZone: string;
};

const DATE_FORMATS = ["dd.MM.yyyy", "d.M.yyyy", "yyyy-MM-dd", "dd/MM/yyyy"] as const;
const TIME_FORMATS = ["HH:mm", "HH:mm:ss", "h:mm a"] as const;

export const DEFAULT_DATE_TIME_PREFERENCES: DateTimePreferences = {
  dateFormat: "dd.MM.yyyy",
  timeFormat: "HH:mm",
  timeZone: "Europe/Prague",
};

let activePreferences = DEFAULT_DATE_TIME_PREFERENCES;

function validDate(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateParts(date: Date, timeZone: string) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
}

export function getDateTimePreferences() {
  return activePreferences;
}

export function formatUserDate(
  value: Date | string | number | null | undefined,
  preferences = activePreferences,
) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") {
    const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      if (preferences.dateFormat === "yyyy-MM-dd") return `${year}-${month}-${day}`;
      if (preferences.dateFormat === "dd/MM/yyyy") return `${day}/${month}/${year}`;
      if (preferences.dateFormat === "d.M.yyyy") return `${Number(day)}.${Number(month)}.${year}`;
      return `${day}.${month}.${year}`;
    }
  }
  const date = validDate(value);
  if (!date) return String(value);
  const { day, month, year } = dateParts(date, preferences.timeZone);
  if (preferences.dateFormat === "yyyy-MM-dd") return `${year}-${month}-${day}`;
  if (preferences.dateFormat === "dd/MM/yyyy") return `${day}/${month}/${year}`;
  if (preferences.dateFormat === "d.M.yyyy") return `${Number(day)}.${Number(month)}.${year}`;
  return `${day}.${month}.${year}`;
}

export function formatUserTime(
  value: Date | string | number | null | undefined,
  preferences = activePreferences,
) {
  if (value === null || value === undefined || value === "") return "";
  const date = validDate(value);
  if (!date) return String(value);
  return new Intl.DateTimeFormat(preferences.timeFormat === "h:mm a" ? "en-US" : "cs-CZ", {
    timeZone: preferences.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: preferences.timeFormat === "HH:mm:ss" ? "2-digit" : undefined,
    hour12: preferences.timeFormat === "h:mm a",
  }).format(date);
}

export function formatUserDateTime(
  value: Date | string | number | null | undefined,
  preferences = activePreferences,
) {
  const date = formatUserDate(value, preferences);
  return date ? `${date} ${formatUserTime(value, preferences)}` : "";
}

/** Převede datum z uživatelského formátu na kanonické YYYY-MM-DD. */
export function parseUserDate(value: string, preferences = activePreferences): string | null {
  const raw = value.trim();
  if (!raw) return "";

  let year: number;
  let month: number;
  let day: number;
  const iso = raw.match(/^(\d{4})[-/.\s](\d{1,2})[-/.\s](\d{1,2})$/);
  if (iso) {
    year = Number(iso[1]);
    month = Number(iso[2]);
    day = Number(iso[3]);
  } else {
    const compact = raw.replace(/\D/g, "");
    const parts = raw.match(/^(\d{1,2})[.\-/\s]+(\d{1,2})[.\-/\s]+(\d{2,4})$/);
    if (parts) {
      const first = Number(parts[1]);
      const second = Number(parts[2]);
      year = Number(parts[3]);
      // České zadání d. m. rrrr přijímáme vždy, nezávisle na zvojeném
      // zobrazovacím formátu profilu. ISO bylo rozpoznáno výše.
      day = first;
      month = second;
    } else if (/^\d{8}$/.test(compact)) {
      if (preferences.dateFormat === "yyyy-MM-dd") {
        year = Number(compact.slice(0, 4));
        month = Number(compact.slice(4, 6));
        day = Number(compact.slice(6, 8));
      } else {
        day = Number(compact.slice(0, 2));
        month = Number(compact.slice(2, 4));
        year = Number(compact.slice(4, 8));
      }
    } else {
      return null;
    }
  }

  if (year < 100) year += year > 30 ? 1900 : 2000;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
    return null;
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Převede český nebo 12hodinový zápis času na kanonické HH:mm[:ss]. */
export function parseUserTime(value: string, preferences = activePreferences): string | null {
  const raw = value.trim();
  if (!raw) return "";
  const match = /^(\d{1,2})(?:[.:\s])(\d{1,2})(?:[.:\s](\d{1,2}))?\s*(AM|PM)?$/i.exec(raw);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = match[3] === undefined ? 0 : Number(match[3]);
  const meridiem = match[4]?.toUpperCase();
  if (meridiem) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (meridiem === "PM" ? 12 : 0);
  }
  if (hour > 23 || minute > 59 || second > 59) return null;
  const base = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return preferences.timeFormat === "HH:mm:ss" || match[3] !== undefined
    ? `${base}:${String(second).padStart(2, "0")}`
    : base;
}

/** Převede české datum s volitelným časem na ISO zápis pro uložení/validaci. */
export function parseUserDateTime(value: string, preferences = activePreferences): string | null {
  const raw = value.trim();
  if (!raw) return "";
  const match = /^(.*?)(?:[,\s]+(\d{1,2}[.:\s]\d{1,2}(?:[.:\s]\d{1,2})?\s*(?:AM|PM)?))?$/i.exec(
    raw,
  );
  if (!match) return null;
  const date = parseUserDate(match[1], preferences);
  if (!date) return null;
  if (!match[2]) return date;
  const time = parseUserTime(match[2], preferences);
  return time ? `${date}T${time}` : null;
}

export function normalizeDateFormat(value: unknown): DateFormat {
  if (typeof value === "string" && DATE_FORMATS.includes(value as DateFormat))
    return value as DateFormat;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("rrrr", "yyyy");
  if (normalized === "dd.mm.yyyy" || normalized === "dd. mm. yyyy") return "dd.MM.yyyy";
  if (normalized === "d.m.yyyy" || normalized === "d. m. yyyy") return "d.M.yyyy";
  if (normalized === "yyyy-mm-dd") return "yyyy-MM-dd";
  if (normalized === "dd/mm/yyyy") return "dd/MM/yyyy";
  return DEFAULT_DATE_TIME_PREFERENCES.dateFormat;
}

export function normalizeTimeFormat(value: unknown): TimeFormat {
  if (typeof value === "string" && TIME_FORMATS.includes(value as TimeFormat))
    return value as TimeFormat;
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase();
  if (normalized === "hh:mm:ss" || normalized === "24h se sekundami") return "HH:mm:ss";
  if (normalized === "h:mm a" || normalized === "12h") return "h:mm a";
  return DEFAULT_DATE_TIME_PREFERENCES.timeFormat;
}

/**
 * Kalendářní datum (YYYY-MM-DD) daného okamžiku v časové zóně profilu.
 * Používej všude, kde jde o „den“ – UTC posun jinak večer vrací včerejšek.
 */
export function isoDateInTimeZone(
  value: Date | string | number = new Date(),
  preferences = activePreferences,
): string {
  const date = validDate(value);
  if (!date) return "";
  const { day, month, year } = dateParts(date, preferences.timeZone);
  return `${year}-${month}-${day}`;
}

/** Dnešní datum v časové zóně profilu, kanonicky YYYY-MM-DD. */
export function todayIso(preferences = activePreferences): string {
  return isoDateInTimeZone(new Date(), preferences);
}

/** Posun kalendářního dne bez vlivu časové zóny a letního času. */
export function shiftIsoDate(iso: string, days: number): string {
  const date = new Date(`${iso}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function excelDateFormat(preferences = activePreferences, withTime = false) {
  const date = preferences.dateFormat.replaceAll("M", "m");
  if (!withTime) return date;
  const time =
    preferences.timeFormat === "h:mm a" ? "h:mm AM/PM" : preferences.timeFormat.toLowerCase();
  return `${date} ${time}`;
}

/** Excel formát měsíční periody zachovávající pořadí roku a měsíce z profilu. */
export function excelMonthFormat(preferences = activePreferences) {
  return preferences.dateFormat.startsWith("yyyy") ? "yyyy mmmm" : "mmmm yyyy";
}

/** Nastaví formáty data a času pro celou aplikaci (bez vazby na databázi). */
export function setDateTimePreferences(next: Partial<DateTimePreferences>) {
  activePreferences = { ...activePreferences, ...next };
}

export function useDateTimePreferences() {
  const preferences = useMemo<DateTimePreferences>(
    () => ({ ...activePreferences }),
    // Nastavení je globální a mění se jen přes setDateTimePreferences.
    [],
  );

  // Synchronizace probíhá už během renderu nadřazeného provideru, aby i čisté
  // exportní utility a tabulkové formátovače použily nový profil bez mezisnímku.
  activePreferences = preferences;

  return {
    ...preferences,
    formatDate: (value: Date | string | number | null | undefined) =>
      formatUserDate(value, preferences),
    formatTime: (value: Date | string | number | null | undefined) =>
      formatUserTime(value, preferences),
    formatDateTime: (value: Date | string | number | null | undefined) =>
      formatUserDateTime(value, preferences),
  };
}
