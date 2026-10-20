/**
 * Popisky a seskupení kódů DPH (2.118.0, DPH 5 B).
 * Vlastní: text kódu ve výběru („Z – Tuzemsko základní (21 %)“), v buňce („Z 21 %“,
 *   u dokladu bez pevného směru „Z 21 % (vstup)“) a skupiny nabídky podle `menuGroup` nebo směru.
 * Nesmí: filtrovat kódy podle dokladu (to dělá aplikace) ani je řadit uvnitř skupiny.
 */
import type { JournalLine, VatCodeOption } from "./journal-lines";
import { roundJournalAmount } from "./journal-lines-model";
import type { VatFiveTexts } from "../../../ds-texts/vat-five-texts";

/** Směr kódu DPH. */
export type VatDirection = "out" | "in";

/** Režim nabídky kódů: podle skupin dat, nebo podle směru u dokladu bez pevného směru. */
export interface VatCodeMenuMode {
  /** Doklad bez pevného směru (interní doklad, pokladna, banka) – skupiny Výstup / Vstup. */
  bidirectional?: boolean;
  /** Výchozí směr – jeho skupina je první, druhá níž. */
  defaultDirection?: VatDirection;
}

/** Skupina nabídky. */
export interface VatCodeGroup {
  /** Stálý klíč skupiny. */
  key: string;
  /** Nadpis skupiny. */
  label: string;
  /** Kódy ve skupině v pořadí z dat. */
  codes: VatCodeOption[];
}

const percent = (rate: number) => `${new Intl.NumberFormat("cs-CZ").format(rate)} %`;

/** Text kódu ve výběru: „Z – Tuzemsko základní (21 %)“. */
export function vatCodeMenuLabel(code: VatCodeOption): string {
  const rate = code.rate == null ? "" : ` (${percent(code.rate)})`;
  return code.name ? `${code.code} – ${code.name}${rate}` : `${code.code}${rate}`;
}

/** Text kódu v buňce: „Z 21 %“, u dokladu bez pevného směru „Z 21 % (vstup)“. */
export function vatCodeCellLabel(
  code: VatCodeOption,
  texts: Pick<VatFiveTexts, "directionInShort" | "directionOutShort">,
  bidirectional = false,
): string {
  const base = code.rate == null ? code.code : `${code.code} ${percent(code.rate)}`;
  if (!bidirectional) return base;
  return `${base} (${code.direction === "in" ? texts.directionInShort : texts.directionOutShort})`;
}

const MENU_GROUPS = ["taxed", "exempt", "outside"] as const;

/** Skupina z dat; bez `menuGroup` rozhodne, zda kód nese daň. */
export function vatCodeMenuGroup(code: VatCodeOption): (typeof MENU_GROUPS)[number] {
  return code.menuGroup ?? (code.hasTax ? "taxed" : "exempt");
}

/** Skupiny nabídky; prázdné skupiny vynechá. */
export function groupVatCodes(
  codes: VatCodeOption[],
  texts: Pick<VatFiveTexts, "groupTaxed" | "groupExempt" | "groupOutside" | "groupOut" | "groupIn">,
  mode: VatCodeMenuMode = {},
): VatCodeGroup[] {
  if (mode.bidirectional) {
    const order: VatDirection[] = mode.defaultDirection === "in" ? ["in", "out"] : ["out", "in"];
    return order
      .map((direction) => ({
        key: direction,
        label: direction === "in" ? texts.groupIn : texts.groupOut,
        codes: codes.filter((code) => code.direction === direction),
      }))
      .filter((group) => group.codes.length > 0);
  }
  const labels = {
    taxed: texts.groupTaxed,
    exempt: texts.groupExempt,
    outside: texts.groupOutside,
  };
  return MENU_GROUPS.map((key) => ({
    key,
    label: labels[key],
    codes: codes.filter((code) => vatCodeMenuGroup(code) === key),
  })).filter((group) => group.codes.length > 0);
}

/** Základ kódu bez daně (osvobozená plnění, mimo DPH) pro řádek rekapitulace. */
export interface VatNonTaxBase {
  /** Kód DPH. */
  code: VatCodeOption;
  /** Součet základů v měně dokladu. */
  base: number;
}

/**
 * Součty základů kódů bez daně v pořadí prvního výskytu (náhled; daňové skupiny počítá
 * `computeVatGroups` stejně jako DB a tyto kódy daň nemají).
 */
export function nonTaxVatBases(
  lines: JournalLine[],
  codes: ReadonlyMap<string, VatCodeOption>,
  foreign: boolean,
): VatNonTaxBase[] {
  const result = new Map<string, VatNonTaxBase>();
  for (const line of lines) {
    const code = line.vatCodeId ? codes.get(line.vatCodeId) : undefined;
    if (!code || code.hasTax || line.isRounding || line.isFxRounding || line.isVatLine) continue;
    const value = Number(foreign ? line.foreignAmount : line.amount) || 0;
    const item = result.get(code.id) ?? { code, base: 0 };
    item.base = roundJournalAmount(item.base + value);
    result.set(code.id, item);
  }
  return [...result.values()];
}
