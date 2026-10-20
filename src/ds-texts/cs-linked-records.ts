import type { LinkedRecordTexts } from "./linked-record-texts";
export const LINKED_RECORDS_CS: LinkedRecordTexts = {
  mode: "Zobrazení propojených dokladů", list: "Seznam", flow: "Tok dokladů",
  link: "Propojit", empty: "Žádné propojené doklady.", remove: "Odebrat",
  removeTitle: "Odebrat vazbu?", removeDescription: name => `Odebrat vazbu na „${name}“?`,
  removeBlocked: "Vazbu nelze odebrat.",
  count: n => `${n.toLocaleString("cs-CZ")} ${n === 1 ? "vazba" : n >= 2 && n <= 4 ? "vazby" : "vazeb"}`,
  of: "z", remaining: "zbývá", search: "Hledat podle čísla, partnera nebo částky",
  suggestions: "Návrhy", results: "Výsledky hledání", searching: "Hledám…",
  noResults: "Žádné doklady nenalezeny.", relationType: "Typ vazby", note: "Poznámka",
  selectRequired: "Vyberte doklad k propojení.", typeRequired: "Vyberte typ vazby.",
  searchFailed: "Doklady se nepodařilo vyhledat.", saveFailed: "Vazbu se nepodařilo uložit.",
};
