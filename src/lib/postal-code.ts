/**
 * Formátování a validace PSČ podle státu.
 *
 * Pravidla jsou záměrně "měkká": neznámý stát nikdy neblokuje uložení,
 * u známých států se hodnota průběžně formátuje do obvyklého tvaru
 * (CZ "12345" → "123 45") a při odeslání se ověří vzor.
 */

type Rule = {
  /** Povojené znaky (vše ostatní se při psaní zahazuje). */
  allow: "digits" | "alnum";
  /** Kanonický vzor po odstranění mezer/pomlček. */
  pattern: RegExp;
  /** Doformátuje surovou (očištěnou) hodnotu do zobrazované podoby. */
  format?: (raw: string) => string;
  /** Ukázka správného tvaru pro placeholder a chybovou hlášku. */
  example: string;
  /** Maximální délka očištěné hodnoty. */
  maxLength: number;
};

const group =
  (at: number, sep = " ") =>
  (raw: string) =>
    raw.length > at ? `${raw.slice(0, at)}${sep}${raw.slice(at)}` : raw;

const digits5: Rule = { allow: "digits", pattern: /^\d{5}$/, example: "12345", maxLength: 5 };
const digits4: Rule = { allow: "digits", pattern: /^\d{4}$/, example: "1234", maxLength: 4 };

const RULES: Record<string, Rule> = {
  CZ: { allow: "digits", pattern: /^\d{5}$/, format: group(3), example: "123 45", maxLength: 5 },
  SK: { allow: "digits", pattern: /^\d{5}$/, format: group(3), example: "811 01", maxLength: 5 },
  PL: {
    allow: "digits",
    pattern: /^\d{5}$/,
    format: group(2, "-"),
    example: "00-001",
    maxLength: 5,
  },
  DE: digits5,
  AT: digits4,
  CH: digits4,
  LI: digits4,
  HU: digits4,
  SI: digits4,
  BE: digits4,
  DK: digits4,
  LU: digits4,
  NO: digits4,
  BG: digits4,
  HR: digits5,
  RS: digits5,
  IT: digits5,
  ES: digits5,
  FR: digits5,
  FI: digits5,
  TR: digits5,
  MX: digits5,
  US: {
    allow: "digits",
    pattern: /^(\d{5}|\d{9})$/,
    format: group(5, "-"),
    example: "12345 nebo 12345-6789",
    maxLength: 9,
  },
  SE: { allow: "digits", pattern: /^\d{5}$/, format: group(3), example: "114 51", maxLength: 5 },
  RO: { allow: "digits", pattern: /^\d{6}$/, example: "010101", maxLength: 6 },
  UA: digits5,
  RU: { allow: "digits", pattern: /^\d{6}$/, example: "101000", maxLength: 6 },
  LT: digits5,
  LV: { allow: "alnum", pattern: /^(LV)?\d{4}$/i, example: "LV-1010", maxLength: 6 },
  EE: digits5,
  GR: digits5,
  PT: {
    allow: "digits",
    pattern: /^\d{7}$/,
    format: group(4, "-"),
    example: "1000-001",
    maxLength: 7,
  },
  NL: {
    allow: "alnum",
    pattern: /^\d{4}[A-Z]{2}$/i,
    format: group(4),
    example: "1012 AB",
    maxLength: 6,
  },
  GB: {
    allow: "alnum",
    pattern: /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/i,
    format: (r) => (r.length > 3 ? `${r.slice(0, r.length - 3)} ${r.slice(-3)}` : r),
    example: "SW1A 1AA",
    maxLength: 7,
  },
  IE: {
    allow: "alnum",
    pattern: /^[A-Z]\d{2}[A-Z\d]{4}$/i,
    format: group(3),
    example: "D02 AF30",
    maxLength: 7,
  },
  CA: {
    allow: "alnum",
    pattern: /^[A-Z]\d[A-Z]\d[A-Z]\d$/i,
    format: group(3),
    example: "K1A 0B1",
    maxLength: 6,
  },
  MT: {
    allow: "alnum",
    pattern: /^[A-Z]{3}\d{4}$/i,
    format: group(3),
    example: "VLT 1117",
    maxLength: 7,
  },
  CY: digits4,
  IS: { allow: "digits", pattern: /^\d{3}$/, example: "101", maxLength: 3 },
  JP: {
    allow: "digits",
    pattern: /^\d{7}$/,
    format: group(3, "-"),
    example: "100-0001",
    maxLength: 7,
  },
  CN: { allow: "digits", pattern: /^\d{6}$/, example: "100000", maxLength: 6 },
  IN: { allow: "digits", pattern: /^\d{6}$/, example: "110001", maxLength: 6 },
  AU: digits4,
  NZ: digits4,
  BR: {
    allow: "digits",
    pattern: /^\d{8}$/,
    format: group(5, "-"),
    example: "01310-100",
    maxLength: 8,
  },
};

/** Státy bez PSČ – prázdná hodnota je zde v pořádku a nic se nevaliduje. */
const NO_POSTAL_CODE = new Set(["AE", "HK", "IE0", "PA", "QA", "SA0", "ZW"]);

const ruleFor = (countryCode?: string | null): Rule | null =>
  RULES[(countryCode ?? "").trim().toUpperCase()] ?? null;

const clean = (value: string, allow: Rule["allow"]) =>
  allow === "digits" ? value.replace(/\D/g, "") : value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

/** Průběžné formátování při psaní – nikdy nebrání dopsání zbytku hodnoty. */
export function formatPostalCode(value: string, countryCode?: string | null): string {
  const rule = ruleFor(countryCode);
  if (!rule) return value.replace(/\s{2,}/g, " ").trimStart();
  const raw = clean(value, rule.allow).slice(0, rule.maxLength);
  return rule.format ? rule.format(raw) : raw;
}

/** Kanonický tvar pro uložení a porovnávání (bez mezer a pomlček). */
export function normalizePostalCode(value: string, countryCode?: string | null): string {
  const rule = ruleFor(countryCode);
  if (!rule) return value.trim();
  return clean(value, rule.allow).slice(0, rule.maxLength);
}

/** Placeholder s ukázkou správného tvaru. */
export function postalCodePlaceholder(countryCode?: string | null): string {
  return ruleFor(countryCode)?.example ?? "PSČ";
}

const plural = (n: number, one: string, few: string, many: string) =>
  n === 1 ? one : n < 5 ? few : many;

/** Slovní popis očekávaného tvaru, např. „5 číslic ve tvaru 123 45“. */
function describeRule(rule: Rule): string {
  const unit =
    rule.allow === "digits"
      ? plural(rule.maxLength, "číslici", "číslice", "číslic")
      : plural(rule.maxLength, "znak", "znaky", "znaků");
  const count = rule.pattern.source.includes("|")
    ? `znaky ve tvaru ${rule.example}`
    : `${rule.maxLength} ${unit} ve tvaru ${rule.example}`;
  return count;
}

/** Nápověda k formátu PSČ pro daný stát (pro popisek pole a tooltip). */
export function postalCodeHint(countryCode?: string | null): string | null {
  const code = (countryCode ?? "").trim().toUpperCase();
  if (NO_POSTAL_CODE.has(code)) return "Tento stát PSČ nepoužívá.";
  const rule = ruleFor(code);
  if (!rule) return null;
  return `Očekávaný formát: ${describeRule(rule)}.`;
}

/**
 * Vrátí chybovou hlášku, nebo `null` když je hodnota v pořádku.
 * Prázdná hodnota je vždy v pořádku – povinnost PSČ řeší formulář zvlášť.
 */
export function validatePostalCode(value: string, countryCode?: string | null): string | null {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  const code = (countryCode ?? "").trim().toUpperCase();
  if (NO_POSTAL_CODE.has(code)) return null;
  const rule = ruleFor(code);
  if (!rule) {
    return trimmed.length > 12 ? "PSČ je příliš dlouhé (max. 12 znaků)." : null;
  }
  const raw = clean(trimmed, rule.allow);
  if (rule.pattern.test(raw)) return null;

  const expected = `Očekávaný tvar pro ${code}: ${describeRule(rule)}.`;
  // Konkrétní důvod, ať uživatel nemusí hádat, co je špatně.
  if (rule.allow === "digits" && /[A-Za-z]/.test(trimmed))
    return `PSČ pro ${code} smí obsahovat pouze číslice. ${expected}`;
  if (!rule.pattern.source.includes("|")) {
    if (raw.length < rule.maxLength)
      return `PSČ je příliš krátké – chybí ${rule.maxLength - raw.length} ${plural(
        rule.maxLength - raw.length,
        "znak",
        "znaky",
        "znaků",
      )}. ${expected}`;
    if (raw.length > rule.maxLength)
      return `PSČ je příliš dlouhé (max. ${rule.maxLength}). ${expected}`;
  }
  return `PSČ neodpovídá formátu státu ${code}. ${expected}`;
}

/** Má daný stát definovaný formát PSČ? */
export function hasPostalCodeRule(countryCode?: string | null): boolean {
  return ruleFor(countryCode) !== null;
}
