/** Epsilon pro normalizaci záporné nuly. */
const EPS = 1e-9;

/** Normalizuje hodnotu blízkou nule na skutečnou nulu, aby se nezobrazovala -0. */
export function nzero(value: number): number {
  if (!Number.isFinite(value)) return 0;
  // `+ 0` navíc převede -0 na 0, aby se nikam nedostala záporná nula.
  return Math.abs(value) < EPS ? 0 : value + 0;
}

const czk2 = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const czk0 = new Intl.NumberFormat("sk-SK", {
  style: "decimal",
  maximumFractionDigits: 0,
});

const pct2 = new Intl.NumberFormat("sk-SK", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pct1 = new Intl.NumberFormat("sk-SK", {
  maximumFractionDigits: 1,
});

const pct3 = new Intl.NumberFormat("sk-SK", {
  maximumFractionDigits: 3,
});

const hourFmt = new Intl.NumberFormat("sk-SK", {
  maximumFractionDigits: 1,
});

const compact1 = new Intl.NumberFormat("sk-SK", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Měna aplikace – všechny částky se evidují a zobrazují v EUR. */
export const CURRENCY = "EUR" as const;
/** Symbol měny aplikace. */
export const CURRENCY_SYMBOL = "€";

const eur2 = new Intl.NumberFormat("sk-SK", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formát částky včetně symbolu měny (EUR). Nula -> pomlčka. */
export function fmtEur(value: number | null | undefined): string {
  if (value == null) return "–";
  const n = roundMoney(value);
  return n === 0 ? "–" : eur2.format(n);
}

/** Formát částky se 2 desetinnými místy. Nula nebo hodnota blízká nule -> pomlčka. */
export function fmtMoney(value: number | null | undefined): string {
  if (value == null) return "–";
  const n = roundMoney(value);
  return n === 0 ? "–" : czk2.format(n);
}

/** Zobrazované jméno kontaktu – u fyzické osoby je příjmení velkými písmeny. */
export function formatContactName(
  contact?: {
    type?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    display_name?: string | null;
  } | null,
): string {
  if (!contact) return "—";
  if (contact.type === "company") return contact.display_name?.trim() || "—";
  if (contact.last_name?.trim() && contact.first_name?.trim()) {
    return `${contact.last_name.trim().toUpperCase()} ${contact.first_name.trim()}`;
  }
  const name = contact.display_name?.trim();
  if (!name) return "—";
  const parts = name.split(/\s+/);
  if (parts.length >= 2) {
    parts[0] = parts[0].toUpperCase();
    return parts.join(" ");
  }
  return name.toUpperCase();
}

/** Zobrazované meno používateľa (operátora) – priezvisko kapitálkami. */
export function formatWorkerName(
  profile?: {
    first_name?: string | null;
    last_name?: string | null;
    full_name?: string | null;
    email?: string | null;
  } | null,
): string {
  if (!profile) return "—";
  const first = profile.first_name?.trim();
  const last = profile.last_name?.trim();
  if (last && first) return `${last.toUpperCase()} ${first}`;
  if (last) return last.toUpperCase();
  const full = profile.full_name?.trim();
  if (full) {
    const parts = full.split(/\s+/);
    if (parts.length >= 2) {
      const surname = parts.pop()!;
      return `${surname.toUpperCase()} ${parts.join(" ")}`;
    }
    return full;
  }
  return profile.email?.trim() || "—";
}


/** Formát částky bez desetinných míst. Nula nebo hodnota blízká nule -> pomlčka. */
export function fmtMoney0(value: number | null | undefined): string {
  if (value == null) return "–";
  const n = roundTo(value, 0);
  return n === 0 ? "–" : czk0.format(n);
}

/** Formát procent se 2 desetinnými místy. */
export function fmtPct(value: number | null | undefined): string {
  if (value == null) return "–";
  return pct2.format(nzero(value));
}

/** Formát procent s 1 desetinným místem. */
export function fmtPct1(value: number | null | undefined): string {
  if (value == null) return "–";
  const v = nzero(value);
  if (v >= 999) return "≥999";
  if (v <= -999) return "≤−999";
  return pct1.format(v);
}

/** Formát procent s 3 desetinnými místy. */
export function fmtPct3(value: number | null | undefined): string {
  if (value == null) return "–";
  return pct3.format(roundRate(value));
}

/** Kompaktní formát částky (např. pro osy grafů). */
export function fmtCompact(value: number | null | undefined): string {
  if (value == null) return "–";
  return compact1.format(nzero(value));
}

/** Formát částky se zadaným počtem desetinných míst (pro inputy apod.). */
export function fmtAmount(value: number | null | undefined, decimals = 2): string {
  if (value == null) return "";
  const n = roundTo(value, decimals);
  return n === 0
    ? "0"
    : new Intl.NumberFormat("sk-SK", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(n);
}

/** Formát počtu hodin s jednotkou „h“ (např. 8 h, 4,5 h). */
export function fmtHours(value: number | null | undefined): string {
  if (value == null) return "";
  const n = roundTo(value, 1);
  if (n === 0) return "";
  return `${hourFmt.format(n)} h`;
}

/* ---------------------------------------------------------------------------
 * Jednotné zaokrouhlování částek napříč aplikací.
 * Všechny peněžní výpočty se zaokrouhlují na MONEY_DECIMALS desetinných míst
 * a hodnoty pod MONEY_EPS se považují za nulu (shoda výpočtu i zobrazení).
 * ------------------------------------------------------------------------ */

/** Počet desetinných míst pro částky. */
export const MONEY_DECIMALS = 2;
/** Práh, pod kterým je částka považována za nulovou (půl posledního zobrazeného místa). */
export const MONEY_EPS = 0.5 / 10 ** MONEY_DECIMALS;
/** Počet desetinných míst pro sazby v procentech. */
export const RATE_DECIMALS = 3;

/** Zaokrouhlení na zadaný počet desetinných míst (bez artefaktů plovoucí čárky). */
export function roundTo(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return 0;
  const f = 10 ** decimals;
  const rounded = Math.round((value + Number.EPSILON * Math.sign(value || 1)) * f) / f;
  // Object.is(-0, 0) je false, proto -0 explicitně normalizujeme na 0.
  return Object.is(rounded, -0) ? 0 : nzero(rounded);
}

/** Zaokrouhlení částky na jednotný počet desetinných míst. */
export function roundMoney(value: number): number;
export function roundMoney(value: number | null | undefined): number | null;
export function roundMoney(value: number | null | undefined): number | null {
  return value == null ? null : roundTo(value, MONEY_DECIMALS);
}

/** Zaokrouhlení sazby (v procentech) na jednotný počet desetinných míst. */
export function roundRate(value: number): number {
  return roundTo(value, RATE_DECIMALS);
}

/** Je částka nulová v rámci jednotného prahu? */
export function isZeroMoney(value: number | null | undefined): boolean {
  return value == null || Math.abs(value) < MONEY_EPS;
}

/** Je částka nenulová v rámci jednotného prahu? */
export function isNonZeroMoney(value: number | null | undefined): boolean {
  return !isZeroMoney(value);
}

/* ------------------------------------------------------------------ */
/* Sdílené formátování pro celý design systém                          */
/* ------------------------------------------------------------------ */

/** Nastavení zobrazení čísel a měny pro aplikaci postavenou na tomto DS. */
export type FormatSettings = {
  /** Kód měny, např. "CZK" nebo "EUR". */
  currency: string;
  /** Jazyk pro názvy měsíců apod. */
  locale: string;
  /** Počet desetinných míst u částek. */
  decimals: number;
};

let settings: FormatSettings = { currency: "CZK", locale: "cs-CZ", decimals: 2 };

export function setFormatSettings(next: Partial<FormatSettings>) {
  settings = { ...settings, ...next };
}

export function getFormatSettings(): FormatSettings {
  return settings;
}

const NBSP = "\u00a0";

/** Částka s tisíci oddělenými mezerou a pevným počtem desetinných míst. */
export function formatAmount(
  value: number | null | undefined,
  decimals = settings.decimals,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  const n = nzero(value);
  const [int, dec] = Math.abs(n).toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${n < 0 ? "−" : ""}${grouped}${dec ? `,${dec}` : ""}`;
}

/** Částka včetně měny podle nastavení aplikace. */
export function formatCurrency(
  value: number | null | undefined,
  currency = settings.currency,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  const symbols: Record<string, string> = { CZK: "Kč", EUR: "€", USD: "$" };
  const symbol = symbols[currency] ?? currency;
  return `${formatAmount(value)}${NBSP}${symbol}`;
}

/** Třída pro červené zobrazení záporných částek. */
export function amountClass(value: number | null | undefined): string {
  return value != null && value < 0 ? "text-destructive" : "";
}

/** Datum ve tvaru dd.MM.yyyy. */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(`${value.slice(0, 10)}T12:00:00`) : value;
  if (Number.isNaN(d.getTime())) return String(value);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
