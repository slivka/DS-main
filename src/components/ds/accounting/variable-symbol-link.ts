/**
 * Odvození variabilního symbolu z čísla daňového dokladu · vlastní čisté pravidlo vazby ·
 * nesmí zapisovat VS (autoritou je databáze, DS hodnotu jen zobrazuje jako náhled).
 */

/** Výsledek odvození VS. */
export interface DerivedVariableSymbol {
  /** Odvozený VS; null, když ho nelze odvodit. */
  value: string | null;
  /** Důvod: ok = 1–10 číslic, tooLong = víc než 10, noDigits = žádná, pending = bez čísla. */
  reason: "ok" | "tooLong" | "noDigits" | "pending";
}

/** Druhy dokladů, u nichž se VS váže na číslo daňového dokladu. */
export const VS_RECEIVED_CODES = ["FP", "ZFP", "DDPOZ"] as const;
/** Vydané doklady s vazbou VS. */
export const VS_ISSUED_CODES = ["FV", "ZFV", "DDPZ"] as const;

/** Vrátí, zda druh dokladu podporuje vazbu VS. */
export function supportsVariableSymbolLink(code: string): boolean {
  const upper = code.toUpperCase();
  return (
    (VS_RECEIVED_CODES as readonly string[]).includes(upper) ||
    (VS_ISSUED_CODES as readonly string[]).includes(upper)
  );
}

/** Číslice zdrojového čísla → VS; nikdy nezkracuje. Prázdný zdroj = pending. */
export function deriveVariableSymbol(source: string | null | undefined): DerivedVariableSymbol {
  const text = (source ?? "").trim();
  if (!text) return { value: null, reason: "pending" };
  const digits = text.replace(/\D/g, "");
  if (!digits) return { value: null, reason: "noDigits" };
  if (digits.length > 10) return { value: null, reason: "tooLong" };
  return { value: digits, reason: "ok" };
}

/** Vstup pro zdroj VS podle směru dokladu. */
export interface VariableSymbolSourceInput {
  /** Druh dokladu. */
  code: string;
  /** Číslo dokladu dodavatele (přijaté). */
  externalNumber?: string | null;
  /** Číslo dokladu (vydané). */
  number?: string | null;
  /** Vlastní číslo daňového dokladu. */
  taxDocumentNumber?: string | null;
  /** Číslo daňového dokladu je svázané s číslem dokladu. */
  taxDocumentNumberLinked?: boolean;
}

/** Číslo daňového dokladu, ze kterého se VS odvozuje. */
export function variableSymbolSource(input: VariableSymbolSourceInput): string {
  const upper = input.code.toUpperCase();
  if ((VS_RECEIVED_CODES as readonly string[]).includes(upper)) return input.externalNumber ?? "";
  const own = input.taxDocumentNumberLinked === false ? input.taxDocumentNumber : null;
  return (own || input.number) ?? "";
}

/**
 * Efektivní stav vazby: výslovná hodnota, jinak svázáno, když je VS prázdný nebo shodný
 * s odvozeným (nový doklad), a nikdy u dokladu bez podpory vazby.
 */
export function effectiveVariableSymbolLinked(
  code: string,
  linked: boolean | undefined,
  variableSymbol: string | null | undefined,
  derived: DerivedVariableSymbol,
): boolean {
  if (!supportsVariableSymbolLink(code)) return false;
  if (linked !== undefined) return linked;
  return !variableSymbol || variableSymbol === derived.value;
}
