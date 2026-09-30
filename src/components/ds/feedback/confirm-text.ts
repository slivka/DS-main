/** Shoda opsaného textu: po oříznutí mezer, rozlišuje velikost písmen. Interní – není součástí balíku. */
export function matchesConfirmText(value: string, confirmText: string) {
  return value.trim().length > 0 && value.trim() === confirmText.trim();
}
