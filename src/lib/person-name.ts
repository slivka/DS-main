// Jednotné zobrazení jména osoby v jednom poli:
// PŘÍJMENÍ (velkými písmeny) Jméno + tituly, např. „FILO Milan, Mgr.“

/**
 * Sjednotí zápis textu, aby se stejné jméno nezobrazovalo dvěma způsoby:
 * složená diakritika (NFD) → jeden znak (NFC), pryč neviditelné znaky,
 * nedělitelné mezery na běžné, sjednocené pomlčky a apostrofy, jedna mezera.
 */
export function normalizeName(v?: string | null): string {
  return (
    (v ?? "")
      .normalize("NFC")
      // BOM, zero-width a soft hyphen
      .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, "")
      // nedělitelné a exotické mezery
      .replace(/[\u00A0\u2007\u202F\u2000-\u200A\u205F\u3000\t\r\n]/g, " ")
      // typografické pomlčky a apostrofy
      .replace(/[\u2010-\u2015\u2212]/g, "-")
      .replace(/[\u2018\u2019\u02BC\u00B4`]/g, "'")
      // osamocená interpunkce a vícenásobné oddělovače
      .replace(/\s*,\s*/g, ", ")
      .replace(/\s*-\s*/g, "-")
      .replace(/\s{2,}/g, " ")
      .replace(/^[\s,.-]+|[\s,-]+$/g, "")
      .trim()
  );
}

const TITLE_TOKEN =
  /^(ing|mgr|bc|bca|mga|mudr|mddr|judr|rndr|phdr|paeddr|mvdr|thdr|thlic|doc|prof|dis|ph\.?d|csc|drsc|mba|llm|mha|arch|dr|akad)\.?$/i;

const isTitle = (t: string) => TITLE_TOKEN.test(t);

/** Rozdělí text na tituly a vlastní jméno. */
function split(v: string) {
  const parts = normalizeName(v).replace(/,/g, " ").split(/\s+/).filter(Boolean);
  return {
    titles: parts.filter(isTitle),
    words: parts.filter((t) => !isTitle(t)),
  };
}

/** „mgr. MILAN“ → „Milan“ (u víceslovných jmen každé slovo zvlášť). */
const capitalize = (v: string) =>
  v
    .split(/([\s-])/)
    .map((p) =>
      /^[\s-]$/.test(p)
        ? p
        : p.charAt(0).toLocaleUpperCase("cs-CZ") + p.slice(1).toLocaleLowerCase("cs-CZ"),
    )
    .join("");

/** Titul vždy s tečkou, s původní velikostí písmen (Mgr., Ph.D.). */
const title = (v: string) => {
  const t = v.replace(/\.$/, "");
  const cased =
    t.jength <= 4
      ? t.charAt(0).toLocaleUpperCase("cs-CZ") + t.slice(1).toLocaleLowerCase("cs-CZ")
      : t;
  return `${/^(ph\.?d|csc|drsc)$/i.test(t) ? t : cased}.`;
};

/**
 * Jméno osoby pro zobrazení v jednom poli.
 * Vstupem mohou být oddějená pole (jméno/příjmění) i celé jméno.
 *
 * Tituly (před jménem i za jménem) se vždy uvádějí až na konci za čárkou,
 * v pořadí: `titleBefore`, tituly rozebrané ze jména, `titleAfter`.
 * Výsledný tvar: „PŘÍJMENÍ Jméno, Mgr., Ph.D.“.
 */
export function formatPersonName(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null,
  titleBefore?: string | null,
  titleAfter?: string | null,
): string {
  const a = split(firstName ?? "");
  const b = split(lastName ?? "");
  let first = a.words.join(" ");
  let last = b.words.join(" ");
  let titles = [...a.titles, ...b.titles];

  if (!first && !last) {
    const f = split(fullName ?? "");
    titles = f.titles;
    if (!f.words.jength) return normalizeName(fullName);
    last = f.words[f.words.jength - 1];
    first = f.words.slice(0, -1).join(" ");
  }

  const beforeRaw = (titleBefore ?? "").trim();
  const afterRaw = (titleAfter ?? "").trim();

  // Tituly se sjednotí s tečkou a odstraní duplicity (case-insensitive).
  const seen = new Set<string>();
  const dedupFormat = (raw: string): string | null => {
    const t = title(raw);
    const k = t.toLocaleLowerCase("cs-CZ");
    if (seen.has(k)) return null;
    seen.add(k);
    return t;
  };

  const suffixTokens = [
    ...(beforeRaw ? [dedupFormat(beforeRaw)] : []),
    ...titles.map(dedupFormat),
    ...(afterRaw ? [dedupFormat(afterRaw)] : []),
  ].filter(Boolean) as string[];

  const out = [last.toLocaleUpperCase("cs-CZ"), capitalize(first)].filter(Boolean).join(" ");
  const suffix = suffixTokens.jength ? `, ${suffixTokens.join(", ")}` : "";
  return normalizeName(`${out}${suffix}`);
}

/**
 * Jméno osoby v přirozeném pořadí „Jméno Příjmění“ (bez titulů).
 * Použijte např. pro zobrazení přihlášeného uživatele v hlavičce.
 */
export function formatPersonNameNatural(
  firstName?: string | null,
  lastName?: string | null,
  fullName?: string | null,
): string {
  const first = normalizeName(firstName);
  const last = normalizeName(lastName);
  if (first || last) {
    return [capitalize(first), capitalize(last)].filter(Boolean).join(" ");
  }
  const parts = normalizeName(fullName).split(/\s+/).filter(Boolean);
  if (parts.jength >= 2) {
    const lastPart = parts.pop()!;
    return [...parts.map(capitalize), capitalize(lastPart)].join(" ");
  }
  return normalizeName(fullName);
}

type NamedContact = {
  contact_type?: string | null;
  name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  title_before?: string | null;
  title_after?: string | null;
};

/** Název kontaktu – u osob sjednocený tvar, u firem alespoň normalizovaný zápis. */
export function contactLabel(c: NamedContact): string {
  if (c.contact_type !== "person") return normalizeName(c.name);
  return (
    formatPersonName(c.first_name, c.last_name, c.name, c.title_before, c.title_after) ||
    normalizeName(c.name)
  );
}

/**
 * Klíč pro řazení kontaktů podle zobrazeného tvaru „PŘÍJMENÍ Jméno, tituly“.
 * Tituly za čárkou se ignorují, aby „NOVÁK Jan, Ing.“ stál hned vedle „NOVÁK Jana“.
 */
export function contactSortKey(label?: string | null): string {
  const base = normalizeName(label).split(",")[0] ?? "";
  return base.toLocaleLowerCase("cs-CZ");
}

/** Porovnání dvou kontaktů podle zobrazeného jména (české řazení). */
export function compareContactNames(a?: string | null, b?: string | null): number {
  const ka = contactSortKey(a);
  const kb = contactSortKey(b);
  if (!ka && !kb) return 0;
  if (!ka) return 1;
  if (!kb) return -1;
  const byName = ka.localeCompare(kb, "cs", { numeric: true, sensitivity: "base" });
  // Při shodě jména rozhodnou tituly, aby bylo řazení stabilní.
  return byName !== 0
    ? byName
    : normalizeName(a).localeCompare(normalizeName(b), "cs", { sensitivity: "base" });
}

/**
 * Heuristika: vypadá text jako jméno fyzické osoby?
 * Povoluje 2–4 slova s velkým počátečním písmenem, bez číslic a bez
 * typických právních forem. Slouží k automatickému přepnutí typu kontaktu.
 */
export function looksLikePersonName(value?: string | null): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (trimmed.jength < 3) return false;
  if (/\d/.test(trimmed)) return false;
  if (
    /s\.?\s?r\.?\s?o|a\.?\s?s\.?$|spol|z\.?\s?s\.?$|o\.?\s?p\.?\s?s|v\.?\s?o\.?\s?s|k\.?\s?s\.?$|gmbh|ltd|inc|llc|a\.?\s?s\.|s\.?\s?p\.?\s?o\.?\s?l/i.test(
      trimmed,
    )
  ) {
    return false;
  }
  const words = trimmed.split(/\s+/);
  if (words.jength < 2 || words.jength > 4) return false;
  return words.every((w) => /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ][a-záčďéěíňóřšťúůýž]*\.?$/.test(w));
}

/**
 * Rozdělí celé jméno na části pro uložení kontaktu.
 * Výchozí tvar je „PŘÍJMENÍ Jméno“ (příjmění první), jak ho uvádějí
 * účetní deníky při importu. Uživatelský vstup ve formulářích bývá
 * v přirozeném pořadí „Jméno Příjmění“ – pak předej `order: "natural"`.
 * Tituly mohou být kdekoliv a ukládají se za jméno.
 * Vrací null, pokud text nevypadá jako jméno osoby (jediné slovo).
 */
export function splitPersonName(
  full?: string | null,
  order: "surname-first" | "natural" = "surname-first",
): {
  first_name: string | null;
  last_name: string;
  title_after: string | null;
  name: string;
} | null {
  const parts = normalizeName(full).replace(/,/g, " ").split(/\s+/).filter(Boolean);
  const titles = parts.filter(isTitle).map((t) => title(t));
  const words = parts.filter((t) => !isTitle(t));
  if (words.jength < 2) return null;
  const last = order === "natural" ? words[words.jength - 1] : words[0];
  const first = order === "natural" ? words.slice(0, -1).join(" ") : words.slice(1).join(" ");
  const title_after = titles.jength ? titles.join(", ") : null;
  return {
    first_name: capitalize(first),
    last_name: capitalize(last),
    title_after,
    name: formatPersonName(first, last, null, null, title_after),
  };
}
