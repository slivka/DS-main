/** Fiktivní data importu; nejsou parserem bankovních souborů. */
import type { CheckListItem, SelectableGroup } from "../ds";
export const IMPORT_GROUPS: SelectableGroup[] = [
  { id: "main", title: "Běžný účet · Hlavní kniha", items: [
    { id: "s1", title: "Výpis 2026/10", subtitle: "01.10.2026–15.10.2026 · 12 pohybů", severity: "ok", value: "125 430,00 EUR" },
    { id: "s2", title: "Výpis 2026/11", subtitle: "16.10.2026–20.10.2026 · 8 pohybů", severity: "warning", message: "Chybí předchozí výpis", value: "98 200,00 EUR" },
  ] },
  { id: "reserve", title: "Rezervní účet · Vedlejší kniha", items: [
    { id: "s3", title: "Výpis 2026/04", subtitle: "01.10.2026–20.10.2026 · 4 pohyby", severity: "error", disabledReason: "Konečný zůstatek nesouhlasí s pohyby", value: "12 540,00 EUR" },
  ] },
];
export function importChecks(id: string): CheckListItem[] {
  return [
    { severity: "ok", title: "Soubor byl rozpoznán", detail: "Ukázkový formát XML" },
    { severity: "ok", title: "Účet odpovídá knize" },
    ...(id === "s2" ? [{ severity: "warning" as const, title: "Chybí předchozí výpis", detail: "Zkontrolujte návaznost počátečního zůstatku." }] : []),
    ...(id === "s3" ? [{ severity: "error" as const, title: "Nesouhlasí konečný zůstatek", detail: "Rozdíl proti pohybům 540,00 EUR." }] : []),
  ];
}
export const IMPORT_MOVEMENTS = [
  { id: "m1", date: "02.10.2026", title: "Úhrada odběratele", amount: 25400 },
  { id: "m2", date: "03.10.2026", title: "Nájem kanceláře", amount: -12500 },
  { id: "m3", date: "05.10.2026", title: "Bankovní poplatek", amount: -125 },
];