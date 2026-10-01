/**
 * Jednotné skládání kódů a názvů v celé knihovně.
 * Vlastní: typografický oddělovač a čistou funkci pro výsledný text.
 * Nesmí: formátovat samotný kód ani rozhodovat o jeho zdroji.
 */

/** Oddělovač kódu a názvu: mezera, pomlčka en dash, mezera. */
export const CODE_SEPARATOR = " – ";

/** Spojí neprázdný kód a název jednotným oddělovačem. */
export function formatCodeName(
  code: string | null | undefined,
  name: string | null | undefined,
): string {
  const normalizedCode = code?.trim() ?? "";
  const normalizedName = name?.trim() ?? "";
  if (!normalizedCode) return normalizedName;
  if (!normalizedName) return normalizedCode;
  return `${normalizedCode}${CODE_SEPARATOR}${normalizedName}`;
}
