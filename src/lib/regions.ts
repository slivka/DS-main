/** Číselník krajov (Slovensko + susedné krajiny podľa potreby). */
export const SK_REGIONS = [
  "Bratislavský",
  "Trnavský",
  "Trenčiansky",
  "Nitriansky",
  "Žilinský",
  "Banskobystrický",
  "Prešovský",
  "Košický",
] as const;

export function regionsForCountry(country?: string | null): string[] {
  if (!country || country === "SK") return [...SK_REGIONS];
  return [];
}
