import { exactSum, mulDivRound, roundHalfAwayFromZero } from "../../../lib/decimal-round";
import type { JournalLine, VatCalcMode, VatCodeOption } from "./journal-lines";

/**
 * Předběžný výpočet DPH v editoru řádků dokladu.
 * Řádky daně zakládá výhradně databáze; DS je jen zobrazuje (jen ke čtení)
 * nebo je počítá předběžně, aby součty seděly ještě před uložením.
 */

/** Přesný součet zaokrouhlený na haléře. */
const sum2 = (values: number[]) => roundHalfAwayFromZero(exactSum(values), 2);
/** Kurz jako dvojice kurz / množství – převod se počítá přesně jako DB `round(x × kurz, 2)`. */
type Fx = { rate: number; unit: number };
const toHome = (value: number, fx: Fx) => mulDivRound(value, fx.rate, fx.unit || 1);
/** Kurz DPH (bez něj kurz dokladu) pro převod daně do měny firmy. */
const vatFx = (config: VatPreviewConfig): Fx =>
  config.foreign
    ? {
        rate: config.vatRate || config.rate || 0,
        unit: (config.vatRate ? config.vatRateAmount : config.rateAmount) || 1,
      }
    : { rate: 1, unit: 1 };

/** Daň ze základu: round(základ × sazba / 100, 2). */
export const calculateVatFromBase = (base: number, rate: number | null | undefined) =>
  rate ? mulDivRound(base, rate, 100) : 0;
/**
 * Daň z částky s DPH: round(celkem × sazba / (100 + sazba), 2).
 * @deprecated 2.109.0 – použijte `taxFromGrossTotal`. Odstraní se ve 3.0.0.
 */
export const calculateVatFromGross = (gross: number, rate: number | null | undefined) =>
  rate ? mulDivRound(gross, rate, 100 + rate) : 0;

/** Kód se samovyměřením (PDP, pořízení z EU, dovoz) – daň se počítá navrch ze základu a celek dokladu nemění. */
export const isSelfAssessed = (code: VatCodeOption | null | undefined) =>
  Boolean(code?.hasTax && code.selfAssessment);

export type ResolvedLineVat = {
  code?: VatCodeOption;
  rate: number | null;
  /** Základ v měně dokladu. */
  base: number;
  /** Vypočtená daň v měně dokladu. */
  calculated: number;
  /** Platná daň (ruční nebo vypočtená) v měně dokladu. */
  vat: number;
  /** Základ + daň v měně dokladu. */
  gross: number;
  /** Odchylka ruční daně od vypočtené (0 bez ruční daně). */
  deviation: number;
};

export type ResolveVatOptions = { calcMode?: VatCalcMode; foreign?: boolean };

/** Základ, daň a celkem jednoho řádku základu v měně dokladu. */
export function resolveLineVat(
  line: JournalLine,
  codes: VatCodeOption[] | Map<string, VatCodeOption>,
  options: ResolveVatOptions = {},
): ResolvedLineVat {
  const code = line.vatCodeId
    ? codes instanceof Map
      ? codes.get(line.vatCodeId)
      : codes.find((item) => item.id === line.vatCodeId)
    : undefined;
  const rate = code?.hasTax ? (code.rate ?? line.vatRate ?? null) : null;
  const manual = Boolean(line.vatManual && line.vatAmount != null && code?.hasTax);
  const storedBase = Number(options.foreign ? line.foreignAmount : line.amount) || 0;
  const selfAssessed = isSelfAssessed(code);
  if (options.calcMode === "gross" && line.grossAmount != null && selfAssessed) {
    // Dodavatel DPH neúčtuje: zadaná částka je základ, daň navrch, celek = základ.
    const base = Number(line.grossAmount) || 0;
    const calculated = calculateVatFromBase(base, rate);
    const vat = manual ? Number(line.vatAmount) : calculated;
    return {
      code,
      rate,
      base,
      calculated,
      vat,
      gross: base,
      deviation: manual ? sum2([vat, -calculated]) : 0,
    };
  }
  if (options.calcMode === "gross" && line.grossAmount != null) {
    const gross = Number(line.grossAmount) || 0;
    const calculated = calculateVatFromGross(gross, rate);
    const vat = manual ? Number(line.vatAmount) : calculated;
    return {
      code,
      rate,
      base: sum2([gross, -vat]),
      calculated,
      vat,
      gross,
      deviation: manual ? sum2([vat, -calculated]) : 0,
    };
  }
  const calculated = calculateVatFromBase(storedBase, rate);
  const vat = manual ? Number(line.vatAmount) : calculated;
  return {
    code,
    rate,
    base: storedBase,
    calculated,
    vat,
    gross: selfAssessed ? storedBase : sum2([storedBase, vat]),
    deviation: manual ? sum2([vat, -calculated]) : 0,
  };
}

export type VatPreviewConfig = {
  codes: VatCodeOption[];
  calcMode?: VatCalcMode;
  /** Kurz dokladu (cizí měna). */
  rate?: number | null;
  rateAmount?: number;
  /** Kurz DPH – bez něj se použije kurz dokladu. */
  vatRate?: number | null;
  vatRateAmount?: number;
  foreign?: boolean;
};

export type VatPreviewPlacement = { mainAccount?: string | null; mainSide?: "MD" | "D" };

export type VatPreviewResult = {
  /** Předběžné řádky daně (`isVatPreview`, `isVatLine`). */
  lines: JournalLine[];
  /** Řádky základu, u kterých kód nemá účty – daň se spočte, ale nezaúčtuje. */
  missingAccounts: { lineId: string; code: string }[];
};

const isBaseLine = (line: JournalLine) =>
  !line.isVatLine && !line.isVatPreview && !line.isRounding && !line.isFxRounding;

/** Sestaví předběžné řádky daně podle stejného pravidla zaúčtování jako databáze. */
export function buildVatPreviewLines(
  lines: JournalLine[],
  config: VatPreviewConfig,
  placement: VatPreviewPlacement = {},
): VatPreviewResult {
  const codes = new Map(config.codes.map((code) => [code.id, code]));
  const result: JournalLine[] = [];
  const missingAccounts: VatPreviewResult["missingAccounts"] = [];
  const fx = vatFx(config);
  for (const line of lines.filter(isBaseLine)) {
    const resolved = resolveLineVat(line, codes, {
      calcMode: config.calcMode,
      foreign: config.foreign,
    });
    const code = resolved.code;
    if (!code?.hasTax || !resolved.vat) continue;
    const push = (
      debit: string | null | undefined,
      credit: string | null | undefined,
      vatForeign: number,
      kind: JournalLine["vatLineKind"],
      suffix: string,
    ) => {
      const amount = toHome(vatForeign, fx);
      const touchesMain = placement.mainAccount
        ? debit === placement.mainAccount || credit === placement.mainAccount
        : !code.selfAssessment;
      result.push({
        id: `${line.id}:vat:${suffix}`,
        debitAccount: debit ?? null,
        creditAccount: credit ?? null,
        amount,
        foreignAmount: config.foreign ? vatForeign : undefined,
        currency: config.foreign ? line.currency : undefined,
        text: line.text,
        vatCodeId: code.id,
        isVatLine: true,
        isVatPreview: true,
        vatParentLineId: line.id,
        vatLineKind: kind,
        excludeFromTotal: !touchesMain,
        categoryId: kind === "non_deductible" ? line.categoryId : undefined,
        debitCategoryId: kind === "non_deductible" ? line.debitCategoryId : undefined,
        creditCategoryId: kind === "non_deductible" ? line.creditCategoryId : undefined,
      });
    };
    if (code.selfAssessment) {
      const rcDeduction = line.vatDeduction ?? "full";
      if (!code.taxOutAccount || (rcDeduction !== "none" && !code.taxInAccount)) {
        missingAccounts.push({ lineId: line.id, code: code.code });
        continue;
      }
      if (rcDeduction === "none") {
        push(line.debitAccount, code.taxOutAccount, resolved.vat, "non_deductible", "rc-nd");
        continue;
      }
      if (rcDeduction === "partial") {
        const share = Math.min(100, Math.max(0, Number(line.vatDeductionShare) || 0));
        const deductible = mulDivRound(resolved.vat, share, 100);
        if (deductible) push(code.taxInAccount, code.taxOutAccount, deductible, "deductible", "rc");
        const rest = sum2([resolved.vat, -deductible]);
        if (rest) push(line.debitAccount, code.taxOutAccount, rest, "non_deductible", "rc-nd");
        continue;
      }
      push(code.taxInAccount, code.taxOutAccount, resolved.vat, "deductible", "rc");
      continue;
    }
    if (code.direction === "out") {
      if (!code.taxOutAccount) {
        missingAccounts.push({ lineId: line.id, code: code.code });
        continue;
      }
      push(line.debitAccount, code.taxOutAccount, resolved.vat, "deductible", "out");
      continue;
    }
    const deduction = line.vatDeduction ?? "full";
    if (deduction === "none") {
      push(line.debitAccount, line.creditAccount, resolved.vat, "non_deductible", "nd");
      continue;
    }
    if (!code.taxInAccount) {
      missingAccounts.push({ lineId: line.id, code: code.code });
      continue;
    }
    if (deduction === "partial") {
      const share = Math.min(100, Math.max(0, Number(line.vatDeductionShare) || 0));
      const deductible = mulDivRound(resolved.vat, share, 100);
      if (deductible) push(code.taxInAccount, line.creditAccount, deductible, "deductible", "in");
      const rest = sum2([resolved.vat, -deductible]);
      if (rest) push(line.debitAccount, line.creditAccount, rest, "non_deductible", "nd");
      continue;
    }
    push(code.taxInAccount, line.creditAccount, resolved.vat, "deductible", "in");
  }
  // Cizí měna s kurzem DPH odlišným od kurzu dokladu: předběžné Kurzové zaokrouhlení (DB ho dopočítá při uložení).
  const docFx: Fx = { rate: config.rate || 0, unit: config.rateAmount || 1 };
  if (config.foreign && config.vatRate && fx.rate * docFx.unit !== docFx.rate * fx.unit) {
    const base = lines.filter(isBaseLine);
    const counted = [...base, ...result.filter((item) => !item.excludeFromTotal)];
    const docTotal = sum2(counted.map((item) => Number(item.foreignAmount) || 0));
    const home = sum2(counted.map((item) => Number(item.amount) || 0));
    const diff = sum2([toHome(docTotal, docFx), -home]);
    if (diff)
      result.push({
        id: "fx-rounding:preview",
        debitAccount: null,
        creditAccount: null,
        amount: diff,
        foreignAmount: 0,
        isFxRounding: true,
        isVatPreview: true,
      });
  }
  return { lines: result, missingAccounts };
}

/** Součet řádků, které vstupují do celku dokladu (v domácí měně a v měně dokladu). */
export function sumJournalTotal(lines: JournalLine[]) {
  const counted = lines.filter((line) => !line.excludeFromTotal);
  return {
    amount: sum2(counted.map((line) => Number(line.amount) || 0)),
    foreignAmount: sum2(counted.map((line) => Number(line.foreignAmount) || 0)),
  };
}

export type VatSummaryRow = {
  codeId: string;
  code: string;
  name: string;
  rate: number | null;
  base: number;
  vat: number;
  gross: number;
  /** Základ a daň v domácí měně kurzem DPH (u cizí měny). */
  baseHome: number | null;
  vatHome: number | null;
  selfAssessment: boolean;
  deductible: number;
  nonDeductible: number;
};

/** Rekapitulace DPH po kódech v měně dokladu (a v domácí měně kurzem DPH). */
export function summarizeVat(lines: JournalLine[], config: VatPreviewConfig): VatSummaryRow[] {
  const codes = new Map(config.codes.map((code) => [code.id, code]));
  const fx = vatFx(config);
  const rows = new Map<string, VatSummaryRow>();
  for (const line of lines.filter(isBaseLine)) {
    if (!line.vatCodeId) continue;
    const resolved = resolveLineVat(line, codes, {
      calcMode: config.calcMode,
      foreign: config.foreign,
    });
    const code = resolved.code;
    const row = rows.get(line.vatCodeId) ?? {
      codeId: line.vatCodeId,
      code: code?.code ?? line.vatCodeId,
      name: code?.name ?? "",
      rate: resolved.rate,
      base: 0,
      vat: 0,
      gross: 0,
      baseHome: 0,
      vatHome: 0,
      selfAssessment: Boolean(code?.selfAssessment),
      deductible: 0,
      nonDeductible: 0,
    };
    row.base = sum2([row.base, resolved.base]);
    row.vat = sum2([row.vat, resolved.vat]);
    row.gross = sum2([row.gross, code?.selfAssessment ? resolved.base : resolved.gross]);
    row.baseHome = sum2([row.baseHome ?? 0, line.vatBaseHome ?? toHome(resolved.base, fx)]);
    row.vatHome = sum2([row.vatHome ?? 0, line.vatAmountHome ?? toHome(resolved.vat, fx)]);
    if (code?.direction === "in" || code?.selfAssessment) {
      const deduction = line.vatDeduction ?? "full";
      const share = Math.min(100, Math.max(0, Number(line.vatDeductionShare) || 0));
      const deductible =
        deduction === "none"
          ? 0
          : deduction === "partial"
            ? mulDivRound(resolved.vat, share, 100)
            : resolved.vat;
      row.deductible = sum2([row.deductible, deductible]);
      row.nonDeductible = sum2([row.nonDeductible, resolved.vat, -deductible]);
    }
    rows.set(line.vatCodeId, row);
  }
  return [...rows.values()];
}

/**
 * Při přepnutí na „S DPH“ doplní celkem s DPH tak, aby se celek dokladu nezměnil.
 * @deprecated 2.109.0 – režim s DPH zrušen. Odstraní se ve 3.0.0.
 */
export function applyVatCalcMode(
  lines: JournalLine[],
  mode: VatCalcMode,
  config: VatPreviewConfig,
): JournalLine[] {
  if (mode !== "gross") return lines;
  const codes = new Map(config.codes.map((code) => [code.id, code]));
  return lines.map((line) =>
    isBaseLine(line)
      ? {
          ...line,
          grossAmount: resolveLineVat(line, codes, { calcMode: "net", foreign: config.foreign })
            .gross,
        }
      : line,
  );
}

/**
 * Z celkem s DPH dopočítá základ (v měně dokladu i domácí).
 * @deprecated 2.109.0 – použijte `baseFromGrossAmount` (pomocník „Cena s DPH“). Odstraní se ve 3.0.0.
 */
export function baseFromGross(
  line: JournalLine,
  codes: VatCodeOption[],
  config: Pick<VatPreviewConfig, "foreign" | "rate" | "rateAmount">,
): Partial<JournalLine> {
  const resolved = resolveLineVat(line, codes, { calcMode: "gross", foreign: config.foreign });
  if (line.grossAmount == null) return {};
  if (config.foreign)
    return {
      foreignAmount: resolved.base,
      amount: mulDivRound(resolved.base, config.rate || 0, config.rateAmount || 1),
    };
  return { amount: resolved.base };
}

export type JournalTotalsOptions = {
  /** DPH editoru; bez něj nebo s `enabled: false` se počítá jako dříve (součet řádků). */
  vat?: {
    enabled: boolean;
    codes: VatCodeOption[];
    calcMode?: VatCalcMode;
    vatRate?: number | null;
    vatRateAmount?: number;
    readOnly?: boolean;
  } | null;
  /** Doklad je jen ke čtení – použijí se uložené řádky daně z DB. */
  readOnly?: boolean;
  mainAccount?: string | null;
  mainSide?: "MD" | "D";
  foreign?: boolean;
  rate?: number | null;
  rateAmount?: number;
};

export type JournalTotals = {
  /** Součet základů (domácí měna / měna dokladu). */
  baseHome: number;
  base: number;
  /** Daň vstupující do celku v měně dokladu. */
  vat: number;
  /** Celek řádků včetně daně bez zaokrouhlení (domácí měna / měna dokladu). */
  grossHome: number;
  gross: number;
  /** Počet řádků zobrazených v gridu (bez řádků daně a prázdných). */
  visibleLineCount: number;
};

/** Jediný výpočet celku řádků dokladu – editor (patička, lišta) i DocumentForm („Celkem za doklad“). */
export function computeJournalTotals(
  lines: JournalLine[],
  options: JournalTotalsOptions = {},
): JournalTotals {
  const regular = lines.filter(isBaseLine);
  const vatOn = Boolean(options.vat?.enabled);
  const readOnly = Boolean(options.readOnly || options.vat?.readOnly);
  let tax: JournalLine[] = [];
  if (vatOn && options.vat) {
    const codes = new Map(options.vat.codes.map((code) => [code.id, code]));
    if (readOnly) {
      const main = options.mainAccount;
      tax = lines
        .filter((line) => line.isVatLine && !line.isVatPreview)
        .map((line) => ({
          ...line,
          excludeFromTotal:
            line.excludeFromTotal ??
            (main
              ? line.debitAccount !== main && line.creditAccount !== main
              : Boolean(codes.get(line.vatCodeId ?? "")?.selfAssessment)),
        }));
    } else {
      tax = buildVatPreviewLines(
        regular,
        {
          codes: options.vat.codes,
          calcMode: options.vat.calcMode ?? "net",
          rate: options.rate ?? undefined,
          rateAmount: options.rateAmount,
          vatRate: options.vat.vatRate,
          vatRateAmount: options.vat.vatRateAmount,
          foreign: options.foreign,
        } as VatPreviewConfig,
        { mainAccount: options.mainAccount, mainSide: options.mainSide },
      ).lines;
    }
  }
  const counted = tax.filter((line) => !line.excludeFromTotal);
  const sumHome = (items: JournalLine[]) => sum2(items.map((line) => Number(line.amount) || 0));
  const sumDoc = (items: JournalLine[]) =>
    options.foreign ? sum2(items.map((line) => Number(line.foreignAmount) || 0)) : sumHome(items);
  return {
    baseHome: sumHome(regular),
    base: sumDoc(regular),
    vat: sumDoc(counted),
    grossHome: sumHome([...regular, ...counted]),
    gross: sumDoc([...regular, ...counted]),
    visibleLineCount: lines.filter((line) => !line.isVatLine && !line.isVatPreview && !line.isBlank)
      .length,
  };
}

/** Doplní výchozí kód DPH do neupraveného počátečního prázdného řádku bez kódu; jinak vrátí null. */
export function fillInitialVatCode(
  lines: JournalLine[],
  codeId: string | null | undefined,
  codes: VatCodeOption[],
  touched: ReadonlySet<string> = new Set(),
): JournalLine[] | null {
  const first = lines[0];
  if (!codeId || lines.length !== 1 || !first?.isBlank || first.vatCodeId || touched.has(first.id))
    return null;
  return [
    {
      ...first,
      vatCodeId: codeId,
      vatRate: codes.find((code) => code.id === codeId)?.rate ?? null,
    },
  ];
}

/**
 * Řádky pro grid a rekapitulaci: vznikne-li předběžné Kurzové zaokrouhlení, nahradí uložený řádek `isFxRounding` z DB
 * (DB ho při uložení přepočítá). Bez předběžného (jen ke čtení, rozdíl 0) zůstane uložený.
 */
export function mergeFxRoundingPreview(
  lines: JournalLine[],
  previewLines: JournalLine[],
  text?: string,
): JournalLine[] {
  const preview = previewLines.find((line) => line.isFxRounding && line.isVatPreview);
  if (!preview) return lines;
  return [...lines.filter((line) => !line.isFxRounding), text ? { ...preview, text } : preview];
}
