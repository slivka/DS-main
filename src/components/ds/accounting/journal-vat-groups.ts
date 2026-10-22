/**
 * Skupiny DPH dokladu (kód DPH × sazba) – stejný výpočet jako databáze.
 * Vlastní: daň skupiny (přepis „dle dokladu“ nebo round(Σ základů × sazba / 100, 2)), rozpočet daně
 *   na řádky poměrem základů, toleranci přepisu, pomocné výpočty z částky s DPH a návrh dorovnání.
 * Nesmí: ukládat – výsledek je náhled; skutečné řádky daně vytváří databáze.
 */
import {
  exactSum,
  mulDivExceeds,
  mulDivRound,
  roundHalfAwayFromZero,
} from "../../../lib/decimal-round";
import type { JournalLine, VatCodeOption } from "./journal-lines";

// Vždy polovina od nuly jako Postgres round(numeric, 2) – nikdy Math.round.
const round2 = (value: number) => roundHalfAwayFromZero(value, 2);

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
  /** Rozdíl je v toleranci (|rozdíl| × kurz ≤ tolerance na nezaokrouhleném součinu, jako DB). */
  withinTolerance: boolean;
  /** Přepis ≠ 0 při nulovém součtu základů – DB ho odmítne (`vat_override_zero_base`). */
  zeroBaseOverride: boolean;
  /** Základ v měně firmy kurzem DPH. */
  baseHome: number;
  /** Daň v měně firmy kurzem DPH. */
  taxHome: number;
  /** Rozpočet daně na řádky. */
  lines: VatGroupLineShare[];
  /** Samovyměření (PDP, EU) – skupinuje se jako ostatní, ale přepis daně nemá. */
  selfAssessment: boolean;
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
  /**
   * Kurz DPH (měna firmy za 1 jednotku měny dokladu); bez zadání 1. `null` nebo 0 = platný
   * kurz chybí: tolerance se nehodnotí a částky v měně firmy jsou 0.
   */
  exchangeRate?: number | null;
  /** Jednotka kurzu DPH (výchozí 1); kurz se před dělením nezaokrouhluje. */
  exchangeRateAmount?: number;
  /** Doklad vstupuje do DPH (výchozí ano); jinak žádné skupiny ani pevné daně. */
  vatEnabled?: boolean;
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

/** Platný kurz, nebo null (0 / prázdný); bez zadání 1 (domácí měna). */
const validFx = (rate: number | null | undefined) =>
  rate === undefined ? 1 : rate != null && rate > 0 ? rate : null;

/** Klíč skupiny. */
export const vatGroupKey = (vatCodeId: string, rate: number) => `${vatCodeId}|${rate}`;

/** Rozpočet daně poměrem základů; zbytek dostane řádek s největším |základem| (při shodě dřívější). */
export function allocateVatGroupTax(
  items: { lineId: string; base: number }[],
  tax: number,
): VatGroupLineShare[] {
  if (items.length === 0) return [];
  const sum = exactSum(items.map((item) => item.base));
  let target = 0;
  items.forEach((item, index) => {
    if (Math.abs(item.base) > Math.abs(items[target].base)) target = index;
  });
  const shares = items.map((item) => ({
    ...item,
    tax: sum === 0 ? 0 : mulDivRound(tax, item.base, sum, 2),
  }));
  const others = exactSum(shares.filter((_, index) => index !== target).map((sh) => sh.tax));
  shares[target].tax = round2(exactSum([tax, -others]));
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
  const fx = validFx(options.exchangeRate);
  const fxAmount = options.exchangeRateAmount ?? 1;
  const tolerance = options.tolerance ?? VAT_OVERRIDE_TOLERANCE;
  const buckets = new Map<
    string,
    { code: VatCodeOption; rate: number; items: VatGroupLineShare[] }
  >();
  const fixed: VatFixedTax[] = [];
  // Jako DB in_grp: kód má daň, doklad vstupuje do DPH, sazba známa, ne pevná daň.
  const included = options.vatEnabled === false ? [] : lines.filter(isBase);
  for (const line of included) {
    const code = line.vatCodeId ? codes.get(line.vatCodeId) : undefined;
    if (!code?.hasTax) continue;
    const base = baseOf(line, options.foreign);
    if (line.vatManual) {
      fixed.push({ lineId: line.id, vatCodeId: code.id, base, tax: Number(line.vatAmount) || 0 });
      continue;
    }
    const rate = code.rate ?? line.vatRate;
    if (rate == null) continue;
    const key = vatGroupKey(code.id, rate);
    const bucket = buckets.get(key) ?? { code, rate, items: [] };
    bucket.items.push({ lineId: line.id, base, tax: 0 });
    buckets.set(key, bucket);
  }
  const groups = [...buckets.entries()].map(([key, { code, rate, items }]): VatGroup => {
    const base = round2(exactSum(items.map((item) => item.base)));
    const calculatedTax = mulDivRound(base, rate, 100, 2);
    const selfAssessment = Boolean(code.selfAssessment);
    // Samovyměření přepis mít nesmí (DB vat_override_self_assessment) – ignoruje se.
    const override = selfAssessment
      ? undefined
      : overrides?.find((item) => vatGroupKey(item.vatCodeId, item.vatRate) === key);
    const tax = override ? round2(override.taxAmount) : calculatedTax;
    const difference = round2(exactSum([tax, -calculatedTax]));
    // Tolerance jako DB document_vat_validate: nezaokrouhlený součin rozdílu a kurzu.
    const differenceHome = fx === null ? 0 : mulDivRound(difference, fx, fxAmount);
    return {
      key,
      vatCodeId: code.id,
      code: code.code,
      name: code.name,
      rate,
      base,
      calculatedTax,
      tax,
      gross: round2(exactSum([base, tax])),
      overridden: Boolean(override),
      difference,
      differenceHome,
      withinTolerance: fx === null || !mulDivExceeds(difference, fx, fxAmount, tolerance),
      zeroBaseOverride: Boolean(override) && base === 0 && tax !== 0,
      baseHome: fx === null ? 0 : mulDivRound(base, fx, fxAmount, 2),
      taxHome: fx === null ? 0 : mulDivRound(tax, fx, fxAmount, 2),
      lines: allocateVatGroupTax(items, tax),
      selfAssessment,
    };
  });
  const taxTotal = round2(
    exactSum([...groups.map((group) => group.tax), ...fixed.map((item) => item.tax)]),
  );
  return { groups, fixed, taxTotal };
}

/**
 * Skupiny zaúčtovaného dokladu z uložených řádků: základy z řádků základu, daň skupiny ze
 * skutečných řádků daně DB (`isVatLine`), přepisy se ukážou jako „dle dokladu“. Bez řádků
 * daně (starší data) zůstane daň z výpočtu, který je s DB shodný.
 */
export function vatGroupsFromStored(
  lines: JournalLine[],
  overrides: JournalVatOverride[] | undefined,
  rates: VatCodeOption[] | Map<string, VatCodeOption>,
  options: ComputeVatGroupsOptions = {},
): VatGroupsResult {
  const result = computeVatGroups(
    lines.filter((line) => !line.isVatLine),
    overrides,
    rates,
    options,
  );
  const taxLines = lines.filter((line) => line.isVatLine && !line.isFxRounding);
  if (taxLines.length === 0) return result;
  const fx = validFx(options.exchangeRate);
  const fxAmount = options.exchangeRateAmount ?? 1;
  const groups = result.groups.map((group) => {
    const ids = new Set(group.lines.map((share) => share.lineId));
    const own = taxLines.filter((line) =>
      line.vatParentLineId
        ? ids.has(line.vatParentLineId)
        : line.vatCodeId === group.vatCodeId && (line.vatRate ?? group.rate) === group.rate,
    );
    if (own.length === 0) return group;
    const tax = round2(exactSum(own.map((line) => baseOf(line, options.foreign))));
    return {
      ...group,
      tax,
      gross: round2(exactSum([group.base, tax])),
      taxHome: fx === null ? 0 : mulDivRound(tax, fx, fxAmount, 2),
    };
  });
  const taxTotal = round2(
    exactSum([...groups.map((group) => group.tax), ...result.fixed.map((item) => item.tax)]),
  );
  return { groups, fixed: result.fixed, taxTotal };
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

/**
 * Zaúčtovaný doklad: daň řádku základu = Σ uložených řádků daně DB se stejným
 * `vatParentLineId` (jako pevná hodnota), aby mřížka i patička ukazovaly daň z DB.
 * Řádky bez uložené daně zůstanou beze změny.
 */
export function storedVatAllocation(lines: JournalLine[], foreign?: boolean): JournalLine[] {
  const byParent = new Map<string, number[]>();
  for (const line of lines)
    if (line.isVatLine && !line.isFxRounding && line.vatParentLineId)
      byParent.set(line.vatParentLineId, [
        ...(byParent.get(line.vatParentLineId) ?? []),
        baseOf(line, foreign),
      ]);
  if (byParent.size === 0) return lines;
  return lines.map((line) => {
    const taxes = byParent.get(line.id);
    return taxes && isBase(line)
      ? { ...line, vatManual: true, vatAmount: round2(exactSum(taxes)) }
      : line;
  });
}

/** Základ z částky s DPH: round(s DPH × 100 / (100 + sazba)) na přesnost sloupce. */
export const baseFromGrossAmount = (gross: number, rate: number, precision = 2) =>
  mulDivRound(gross, 100, exactSum([100, rate]), precision);

/** Daň z celkem s DPH: round(celkem × sazba / (100 + sazba), 2). */
export const taxFromGrossTotal = (total: number, rate: number) =>
  mulDivRound(total, rate, exactSum([100, rate]), 2);

/**
 * Posun základu řádku s největším základem, po kterém Rozdíl patičky klesne na 0.
 * Skupina s přepisem (pevná daň) nebo řádek mimo skupinu: celý rozdíl. Bez přepisu se hledá
 * posun d (± haléře kolem odhadu), pro který d + round((Σ + d) × sazba / 100) − daň = rozdíl;
 * když neexistuje, vrací null (nabízí se jen Dorovnat DPH / Zaokrouhlení).
 */
export function baseDeltaForDifference(
  group: Pick<VatGroup, "base" | "rate" | "calculatedTax" | "overridden"> | undefined,
  difference: number,
): number | null {
  if (!group || group.overridden || group.rate === 0) return round2(difference);
  const estimate = mulDivRound(difference, 100, exactSum([100, group.rate]), 2);
  for (const step of [0, 1, -1, 2, -2, 3, -3]) {
    const delta = round2(exactSum([estimate, step / 100]));
    const tax = mulDivRound(exactSum([group.base, delta]), group.rate, 100, 2);
    if (round2(exactSum([delta, tax, -group.calculatedTax, -difference])) === 0) return delta;
  }
  return null;
}

/** Nastaví (nebo nahradí) přepis skupiny. */
export function upsertVatOverride(
  overrides: JournalVatOverride[] | undefined,
  group: Pick<VatGroup, "vatCodeId" | "rate"> & Partial<Pick<VatGroup, "selfAssessment">>,
  taxAmount: number,
): JournalVatOverride[] {
  if (group.selfAssessment) return overrides ?? [];
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
  /** Limit zaokrouhlení v měně Rozdílu (u cizí měny přepočtený); bez něj se Zaokrouhlení nenabízí. */
  roundingLimit?: number;
  /** Stávající zaokrouhlení – limit platí pro |zaokrouhlení + rozdíl|. */
  currentRounding?: number;
  /** Lze dorovnat základ tak, aby Rozdíl byl 0 (výsledek `baseDeltaForDifference` ≠ null). */
  baseBalanceable?: boolean;
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
  if (input.lineCount > 0 && input.baseBalanceable !== false) actions.push("base");
  const resulting = Math.abs(round2(exactSum([input.currentRounding ?? 0, input.difference])));
  const roundingOk = input.roundingLimit !== undefined && resulting <= input.roundingLimit;
  if (roundingOk) actions.push("rounding");
  const vatPreferred =
    input.groups.length === 1 && diff <= round2(0.01 * Math.max(1, input.lineCount));
  const preferred = vatPreferred ? "vat" : roundingOk ? "rounding" : null;
  return { actions, preferred };
}
