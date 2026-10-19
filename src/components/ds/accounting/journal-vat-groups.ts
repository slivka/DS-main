/**
 * Skupiny DPH dokladu (kód DPH × sazba) – stejný výpočet jako databáze.
 * Vlastní: daň skupiny (přepis „dle dokladu“ nebo round(Σ základů × sazba / 100, 2)), rozpočet daně
 *   na řádky poměrem základů, toleranci přepisu, pomocné výpočty z částky s DPH a návrh dorovnání.
 * Nesmí: ukládat – výsledek je náhled; skutečné řádky daně vytváří databáze.
 */
import type { JournalLine, VatCodeOption } from "./journal-lines";

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Zaokrouhlí na zadaný počet desetinných míst (výchozí 2). */
export const roundTo = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((value + Math.sign(value) * Number.EPSILON) * factor) / factor;
};

/** Přepis daně skupiny „DPH dle dokladu“ – ukládá se spolu s řádky (`_vat_overrides`). */
export interface JournalVatOverride {
  /** Id kódu DPH skupiny. */
  vatCodeId: string;
  /** Sazba skupiny v procentech. */
  vatRate: number;
  /** Daň skupiny dle dokladu v měně dokladu. */
  taxAmount: number;
}

/** Podíl řádku na dani skupiny. */
export interface VatGroupLineShare {
  /** Id řádku. */
  lineId: string;
  /** Základ řádku v měně dokladu. */
  base: number;
  /** Rozpočtená daň řádku v měně dokladu. */
  tax: number;
}

/** Skupina DPH kód × sazba. */
export interface VatGroup {
  /** Klíč skupiny `kód|sazba`. */
  key: string;
  /** Id kódu DPH. */
  vatCodeId: string;
  /** Zkratka kódu. */
  code: string;
  /** Název kódu. */
  name: string;
  /** Sazba v procentech. */
  rate: number;
  /** Součet základů v měně dokladu. */
  base: number;
  /** Vypočtená daň round(Σ základů × sazba / 100, 2). */
  calculatedTax: number;
  /** Platná daň (přepis nebo vypočtená). */
  tax: number;
  /** Základ + daň. */
  gross: number;
  /** Skupina má přepis „dle dokladu“. */
  overridden: boolean;
  /** Přepis − vypočtená daň v měně dokladu (0 bez přepisu). */
  difference: number;
  /** Rozdíl v měně firmy kurzem DPH. */
  differenceHome: number;
  /** Rozdíl je v toleranci. */
  withinTolerance: boolean;
  /** Základ v měně firmy kurzem DPH. */
  baseHome: number;
  /** Daň v měně firmy kurzem DPH. */
  taxHome: number;
  /** Rozpočet daně na řádky. */
  lines: VatGroupLineShare[];
}

/** Řádek s pevnou systémovou daní (odpočet zálohy, import) – do skupin nevstupuje. */
export interface VatFixedTax {
  /** Id řádku. */
  lineId: string;
  /** Id kódu DPH. */
  vatCodeId: string;
  /** Základ v měně dokladu. */
  base: number;
  /** Pevná daň v měně dokladu. */
  tax: number;
}

/** Volby výpočtu skupin. */
export interface ComputeVatGroupsOptions {
  /** Doklad v cizí měně – základ se bere z `foreignAmount`. */
  foreign?: boolean;
  /** Kurz DPH (měna firmy za 1 jednotku měny dokladu); výchozí 1. */
  exchangeRate?: number | null;
  /** Tolerance přepisu v měně firmy (výchozí 1,00). */
  tolerance?: number;
}

/** Výsledek výpočtu skupin. */
export interface VatGroupsResult {
  /** Skupiny v pořadí prvního výskytu. */
  groups: VatGroup[];
  /** Řádky s pevnou daní. */
  fixed: VatFixedTax[];
  /** Daň skupin + pevné daně v měně dokladu. */
  taxTotal: number;
}

/** Výchozí tolerance přepisu daně skupiny v měně firmy. */
export const VAT_OVERRIDE_TOLERANCE = 1;

const isBase = (line: JournalLine) =>
  !line.isVatLine && !line.isVatPreview && !line.isRounding && !line.isFxRounding && !line.isBlank;

const baseOf = (line: JournalLine, foreign?: boolean) =>
  Number(foreign ? line.foreignAmount : line.amount) || 0;

/** Klíč skupiny. */
export const vatGroupKey = (vatCodeId: string, rate: number) => `${vatCodeId}|${rate}`;

/** Rozpočet daně poměrem základů; zbytek dostane řádek s největším |základem| (při shodě dřívější). */
export function allocateVatGroupTax(
  items: { lineId: string; base: number }[],
  tax: number,
): VatGroupLineShare[] {
  if (items.length === 0) return [];
  const sum = round2(items.reduce((acc, item) => acc + item.base, 0));
  let target = 0;
  items.forEach((item, index) => {
    if (Math.abs(item.base) > Math.abs(items[target].base)) target = index;
  });
  const shares = items.map((item) => ({
    ...item,
    tax: sum === 0 ? 0 : round2((tax * item.base) / sum),
  }));
  const others = shares.reduce(
    (acc, share, index) => (index === target ? acc : acc + share.tax),
    0,
  );
  shares[target].tax = round2(tax - others);
  return shares;
}

/** Daň skupin kód × sazba se stejným výsledkem jako databáze, včetně rozpočtu na řádky. */
export function computeVatGroups(
  lines: JournalLine[],
  overrides: JournalVatOverride[] | undefined,
  rates: VatCodeOption[] | Map<string, VatCodeOption>,
  options: ComputeVatGroupsOptions = {},
): VatGroupsResult {
  const codes = rates instanceof Map ? rates : new Map(rates.map((code) => [code.id, code]));
  const fx = options.exchangeRate || 1;
  const tolerance = options.tolerance ?? VAT_OVERRIDE_TOLERANCE;
  const buckets = new Map<
    string,
    { code: VatCodeOption; rate: number; items: VatGroupLineShare[] }
  >();
  const fixed: VatFixedTax[] = [];
  for (const line of lines.filter(isBase)) {
    const code = line.vatCodeId ? codes.get(line.vatCodeId) : undefined;
    if (!code?.hasTax || code.selfAssessment) continue;
    const base = baseOf(line, options.foreign);
    if (line.vatManual) {
      fixed.push({ lineId: line.id, vatCodeId: code.id, base, tax: Number(line.vatAmount) || 0 });
      continue;
    }
    const rate = code.rate ?? line.vatRate ?? 0;
    const key = vatGroupKey(code.id, rate);
    const bucket = buckets.get(key) ?? { code, rate, items: [] };
    bucket.items.push({ lineId: line.id, base, tax: 0 });
    buckets.set(key, bucket);
  }
  const groups = [...buckets.entries()].map(([key, { code, rate, items }]): VatGroup => {
    const base = round2(items.reduce((acc, item) => acc + item.base, 0));
    const calculatedTax = round2((base * rate) / 100);
    const override = overrides?.find((item) => vatGroupKey(item.vatCodeId, item.vatRate) === key);
    const tax = override ? round2(override.taxAmount) : calculatedTax;
    const difference = round2(tax - calculatedTax);
    const differenceHome = round2(difference * fx);
    return {
      key,
      vatCodeId: code.id,
      code: code.code,
      name: code.name,
      rate,
      base,
      calculatedTax,
      tax,
      gross: round2(base + tax),
      overridden: Boolean(override),
      difference,
      differenceHome,
      withinTolerance: Math.abs(differenceHome) <= tolerance + 1e-9,
      baseHome: round2(base * fx),
      taxHome: round2(tax * fx),
      lines: allocateVatGroupTax(items, tax),
    };
  });
  const taxTotal = round2(
    groups.reduce((acc, group) => acc + group.tax, 0) +
      fixed.reduce((acc, item) => acc + item.tax, 0),
  );
  return { groups, fixed, taxTotal };
}

/**
 * Řádky s rozpočtenou daní skupin pro náhled (interně jako pevná daň řádku);
 * náhled řádků daně, rekapitulace i součty pak dají stejný výsledek jako databáze.
 */
export function applyVatAllocation(lines: JournalLine[], result: VatGroupsResult): JournalLine[] {
  const shares = new Map(result.groups.flatMap((group) => group.lines).map((s) => [s.lineId, s]));
  return lines.map((line) => {
    const share = shares.get(line.id);
    return share ? { ...line, vatManual: true, vatAmount: share.tax } : line;
  });
}

/** Základ z částky s DPH: round(s DPH × 100 / (100 + sazba)) na přesnost sloupce. */
export const baseFromGrossAmount = (gross: number, rate: number, precision = 2) =>
  roundTo((gross * 100) / (100 + rate), precision);

/** Daň z celkem s DPH: round(celkem × sazba / (100 + sazba), 2). */
export const taxFromGrossTotal = (total: number, rate: number) =>
  round2((total * rate) / (100 + rate));

/** Nastaví (nebo nahradí) přepis skupiny. */
export function upsertVatOverride(
  overrides: JournalVatOverride[] | undefined,
  group: Pick<VatGroup, "vatCodeId" | "rate">,
  taxAmount: number,
): JournalVatOverride[] {
  const rest = removeVatOverride(overrides, group);
  return [
    ...rest,
    { vatCodeId: group.vatCodeId, vatRate: group.rate, taxAmount: round2(taxAmount) },
  ];
}

/** Odebere přepis skupiny („Vrátit vypočtenou daň“). */
export function removeVatOverride(
  overrides: JournalVatOverride[] | undefined,
  group: Pick<VatGroup, "vatCodeId" | "rate">,
): JournalVatOverride[] {
  return (overrides ?? []).filter(
    (item) => !(item.vatCodeId === group.vatCodeId && item.vatRate === group.rate),
  );
}

/** Řádek s největším |základem| (při shodě dřívější) – cíl jednorázového dorovnání. */
export function largestBaseLineId(
  lines: JournalLine[],
  options: { foreign?: boolean; lineIds?: string[] } = {},
): string | null {
  const candidates = lines.filter(
    (line) => isBase(line) && (!options.lineIds || options.lineIds.includes(line.id)),
  );
  let best: JournalLine | null = null;
  for (const line of candidates)
    if (!best || Math.abs(baseOf(line, options.foreign)) > Math.abs(baseOf(best, options.foreign)))
      best = line;
  return best?.id ?? null;
}

/** Akce u Rozdílu v patičce. */
export type JournalDifferenceAction = "vat" | "base" | "rounding";

/** Vstup návrhu dorovnání Rozdílu. */
export interface DifferenceActionsInput {
  /** Rozdíl zadaná částka − součet (0 = bez akcí). */
  difference: number;
  /** Skupiny DPH (jen skupiny s daní nabízejí „Dorovnat DPH“). */
  groups: Pick<VatGroup, "key">[];
  /** Počet řádků základu. */
  lineCount: number;
  /** Limit zaokrouhlení firmy; bez něj se Zaokrouhlení nenabízí. */
  roundingLimit?: number;
  /** Doklad lze upravit. */
  editable?: boolean;
}

/** Nabízené akce a výchozí zvýrazněná volba Rozdílu. */
export function resolveDifferenceActions(input: DifferenceActionsInput): {
  actions: JournalDifferenceAction[];
  preferred: JournalDifferenceAction | null;
} {
  const diff = Math.abs(round2(input.difference));
  if (diff === 0 || input.editable === false) return { actions: [], preferred: null };
  const actions: JournalDifferenceAction[] = [];
  if (input.groups.length > 0) actions.push("vat");
  if (input.lineCount > 0) actions.push("base");
  const roundingOk = input.roundingLimit !== undefined && diff <= input.roundingLimit + 1e-9;
  if (roundingOk) actions.push("rounding");
  const vatPreferred =
    input.groups.length === 1 && diff <= round2(0.01 * Math.max(1, input.lineCount)) + 1e-9;
  const preferred = vatPreferred ? "vat" : roundingOk ? "rounding" : null;
  return { actions, preferred };
}
