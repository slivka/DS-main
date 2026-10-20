/** Velikost souboru · vlastní jednotný formát · nesmí upravovat limit aplikace. */
/** Desetinné jednotky a český/slovenský formát s oddělenými tisíci. */
export function formatFileSize(bytes: number, locale = "cs-CZ"): string {
  const safe = Math.max(0, bytes);
  const units = ["B", "kB", "MB", "GB", "TB"];
  const exponent = Math.min(4, safe > 0 ? Math.floor(Math.log10(safe) / 3) : 0);
  const index = Math.max(0, exponent);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: index ? 1 : 0 }).format(
    safe / 1000 ** index,
  );
  return `${number} ${units[index]}`;
}
