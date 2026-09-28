import type { JournalLine, VatCalcMode, VatCodeOption } from "./journal-lines";

/**
 * Předběžný výpočet DPH v editoru řádků dokladu.
 * Řádky daně zakládá výhradně databáze; DS je jen zobrazuje (jen ke čtení)
 * nebo je počítá předběžně, aby součty seděly ještě před uložením.
 */

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Daň ze základu: round(základ × sazba / 100, 2). */
export const calculateVatFromBase = (base: number, rate: number | null | undefined) => rate ? round2(base * rate / 100) : 0;
/** Daň z částky s DPH: round(celkem × sazba / (100 + sazba), 2). */
export const calculateVatFromGross = (gross: number, rate: number | null | undefined) => rate ? round2(gross * rate / (100 + rate)) : 0;

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
export function resolveLineVat(line: JournalLine, codes: VatCodeOption[] | Map<string, VatCodeOption>, options: ResolveVatOptions = {}): ResolvedLineVat {
  const code = line.vatCodeId ? (codes instanceof Map ? codes.get(line.vatCodeId) : codes.find((item) => item.id === line.vatCodeId)) : undefined;
  const rate = code?.hasTax ? code.rate ?? line.vatRate ?? null : null;
  const manual = Boolean(line.vatManual && line.vatAmount != null && code?.hasTax);
  const storedBase = Number(options.foreign ? line.foreignAmount : line.amount) || 0;
  if (options.calcMode === "gross" && line.grossAmount != null) {
    const gross = Number(line.grossAmount) || 0;
    const calculated = calculateVatFromGross(gross, rate);
    const vat = manual ? Number(line.vatAmount) : calculated;
    return { code, rate, base: round2(gross - vat), calculated, vat, gross, deviation: manual ? round2(vat - calculated) : 0 };
  }
  const calculated = calculateVatFromBase(storedBase, rate);
  const vat = manual ? Number(line.vatAmount) : calculated;
  return { code, rate, base: storedBase, calculated, vat, gross: round2(storedBase + vat), deviation: manual ? round2(vat - calculated) : 0 };
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

const isBaseLine = (line: JournalLine) => !line.isVatLine && !line.isVatPreview && !line.isRounding && !line.isFxRounding;

/** Sestaví předběžné řádky daně podle stejného pravidla zaúčtování jako databáze. */
export function buildVatPreviewLines(lines: JournalLine[], config: VatPreviewConfig, placement: VatPreviewPlacement = {}): VatPreviewResult {
  const codes = new Map(config.codes.map((code) => [code.id, code]));
  const result: JournalLine[] = [];
  const missingAccounts: VatPreviewResult["missingAccounts"] = [];
  const conversion = config.foreign ? (config.vatRate || config.rate || 0) / ((config.vatRate ? config.vatRateAmount : config.rateAmount) || 1) : 1;
  for (const line of lines.filter(isBaseLine)) {
    const resolved = resolveLineVat(line, codes, { calcMode: config.calcMode, foreign: config.foreign });
    const code = resolved.code;
    if (!code?.hasTax || !resolved.vat) continue;
    const push = (debit: string | null | undefined, credit: string | null | undefined, vatForeign: number, kind: JournalLine["vatLineKind"], suffix: string) => {
      const amount = round2(vatForeign * conversion);
      const touchesMain = placement.mainAccount ? debit === placement.mainAccount || credit === placement.mainAccount : !code.selfAssessment;
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
        dimensionId: kind === "non_deductible" ? line.dimensionId : undefined,
        debitDimensionId: kind === "non_deductible" ? line.debitDimensionId : undefined,
        creditDimensionId: kind === "non_deductible" ? line.creditDimensionId : undefined,
      });
    };
    if (code.selfAssessment) {
      const rcDeduction = line.vatDeduction ?? "full";
      if (!code.taxOutAccount || (rcDeduction !== "none" && !code.taxInAccount)) { missingAccounts.push({ lineId: line.id, code: code.code }); continue; }
      if (rcDeduction === "none") { push(line.debitAccount, code.taxOutAccount, resolved.vat, "non_deductible", "rc-nd"); continue; }
      if (rcDeduction === "partial") {
        const share = Math.min(100, Math.max(0, Number(line.vatDeductionShare) || 0));
        const deductible = round2(resolved.vat * share / 100);
        if (deductible) push(code.taxInAccount, code.taxOutAccount, deductible, "deductible", "rc");
        const rest = round2(resolved.vat - deductible);
        if (rest) push(line.debitAccount, code.taxOutAccount, rest, "non_deductible", "rc-nd");
        continue;
      }
      push(code.taxInAccount, code.taxOutAccount, resolved.vat, "deductible", "rc");
      continue;
    }
    if (code.direction === "out") {
      if (!code.taxOutAccount) { missingAccounts.push({ lineId: line.id, code: code.code }); continue; }
      push(line.debitAccount, code.taxOutAccount, resolved.vat, "deductible", "out");
      continue;
    }
    const deduction = line.vatDeduction ?? "full";
    if (deduction === "none") { push(line.debitAccount, line.creditAccount, resolved.vat, "non_deductible", "nd"); continue; }
    if (!code.taxInAccount) { missingAccounts.push({ lineId: line.id, code: code.code }); continue; }
    if (deduction === "partial") {
      const share = Math.min(100, Math.max(0, Number(line.vatDeductionShare) || 0));
      const deductible = round2(resolved.vat * share / 100);
      if (deductible) push(code.taxInAccount, line.creditAccount, deductible, "deductible", "in");
      const rest = round2(resolved.vat - deductible);
      if (rest) push(line.debitAccount, line.creditAccount, rest, "non_deductible", "nd");
      continue;
    }
    push(code.taxInAccount, line.creditAccount, resolved.vat, "deductible", "in");
  }
  return { lines: result, missingAccounts };
}

/** Součet řádků, které vstupují do celku dokladu (v domácí měně a v měně dokladu). */
export function sumJournalTotal(lines: JournalLine[]) {
  const counted = lines.filter((line) => !line.excludeFromTotal);
  return {
    amount: round2(counted.reduce((sum, line) => sum + (Number(line.amount) || 0), 0)),
    foreignAmount: round2(counted.reduce((sum, line) => sum + (Number(line.foreignAmount) || 0), 0)),
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
  baseHome: number;
  vatHome: number;
  selfAssessment: boolean;
  deductible: number;
  nonDeductible: number;
};

/** Rekapitulace DPH po kódech v měně dokladu (a v domácí měně kurzem DPH). */
export function summarizeVat(lines: JournalLine[], config: VatPreviewConfig): VatSummaryRow[] {
  const codes = new Map(config.codes.map((code) => [code.id, code]));
  const conversion = config.foreign ? (config.vatRate || config.rate || 0) / ((config.vatRate ? config.vatRateAmount : config.rateAmount) || 1) : 1;
  const rows = new Map<string, VatSummaryRow>();
  for (const line of lines.filter(isBaseLine)) {
    if (!line.vatCodeId) continue;
    const resolved = resolveLineVat(line, codes, { calcMode: config.calcMode, foreign: config.foreign });
    const code = resolved.code;
    const row = rows.get(line.vatCodeId) ?? { codeId: line.vatCodeId, code: code?.code ?? line.vatCodeId, name: code?.name ?? "", rate: resolved.rate, base: 0, vat: 0, gross: 0, baseHome: 0, vatHome: 0, selfAssessment: Boolean(code?.selfAssessment), deductible: 0, nonDeductible: 0 };
    row.base = round2(row.base + resolved.base);
    row.vat = round2(row.vat + resolved.vat);
    row.gross = round2(row.gross + (code?.selfAssessment ? resolved.base : resolved.gross));
    row.baseHome = round2(row.baseHome + (line.vatBaseHome ?? round2(resolved.base * conversion)));
    row.vatHome = round2(row.vatHome + (line.vatAmountHome ?? round2(resolved.vat * conversion)));
    if (code?.direction === "in" || code?.selfAssessment) {
      const deduction = line.vatDeduction ?? "full";
      const share = Math.min(100, Math.max(0, Number(line.vatDeductionShare) || 0));
      const deductible = deduction === "none" ? 0 : deduction === "partial" ? round2(resolved.vat * share / 100) : resolved.vat;
      row.deductible = round2(row.deductible + deductible);
      row.nonDeductible = round2(row.nonDeductible + resolved.vat - deductible);
    }
    rows.set(line.vatCodeId, row);
  }
  return [...rows.values()];
}

/** Při přepnutí na „S DPH“ doplní celkem s DPH tak, aby se celek dokladu nezměnil. */
export function applyVatCalcMode(lines: JournalLine[], mode: VatCalcMode, config: VatPreviewConfig): JournalLine[] {
  if (mode !== "gross") return lines;
  const codes = new Map(config.codes.map((code) => [code.id, code]));
  return lines.map((line) => isBaseLine(line) ? { ...line, grossAmount: resolveLineVat(line, codes, { calcMode: "net", foreign: config.foreign }).gross } : line);
}

/** Z celkem s DPH dopočítá základ (v měně dokladu i domácí), který řádek drží v amount / foreignAmount. */
export function baseFromGross(line: JournalLine, codes: VatCodeOption[], config: Pick<VatPreviewConfig, "foreign" | "rate" | "rateAmount">): Partial<JournalLine> {
  const resolved = resolveLineVat(line, codes, { calcMode: "gross", foreign: config.foreign });
  if (line.grossAmount == null) return {};
  if (config.foreign) return { foreignAmount: resolved.base, amount: round2(resolved.base * (config.rate || 0) / (config.rateAmount || 1)) };
  return { amount: resolved.base };
}

export type JournalTotalsOptions = {
  /** DPH editoru; bez něj nebo s `enabled: false` se počítá jako dříve (součet řádků). */
  vat?: { enabled: boolean; codes: VatCodeOption[]; calcMode?: VatCalcMode; vatRate?: number | null; vatRateAmount?: number; readOnly?: boolean } | null;
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
export function computeJournalTotals(lines: JournalLine[], options: JournalTotalsOptions = {}): JournalTotals {
  const regular = lines.filter(isBaseLine);
  const vatOn = Boolean(options.vat?.enabled);
  const readOnly = Boolean(options.readOnly || options.vat?.readOnly);
  let tax: JournalLine[] = [];
  if (vatOn && options.vat) {
    const codes = new Map(options.vat.codes.map((code) => [code.id, code]));
    if (readOnly) {
      const main = options.mainAccount;
      tax = lines.filter((line) => line.isVatLine && !line.isVatPreview).map((line) => ({ ...line, excludeFromTotal: line.excludeFromTotal ?? (main ? line.debitAccount !== main && line.creditAccount !== main : Boolean(codes.get(line.vatCodeId ?? "")?.selfAssessment)) }));
    } else {
      tax = buildVatPreviewLines(regular, { codes: options.vat.codes, calcMode: options.vat.calcMode ?? "net", rate: options.rate ?? undefined, rateAmount: options.rateAmount, vatRate: options.vat.vatRate, vatRateAmount: options.vat.vatRateAmount, foreign: options.foreign } as VatPreviewConfig, { mainAccount: options.mainAccount, mainSide: options.mainSide }).lines;
    }
  }
  const counted = tax.filter((line) => !line.excludeFromTotal);
  const sumHome = (items: JournalLine[]) => round2(items.reduce((sum, line) => sum + (Number(line.amount) || 0), 0));
  const sumDoc = (items: JournalLine[]) => options.foreign ? round2(items.reduce((sum, line) => sum + (Number(line.foreignAmount) || 0), 0)) : sumHome(items);
  return {
    baseHome: sumHome(regular), base: sumDoc(regular), vat: sumDoc(counted),
    grossHome: sumHome([...regular, ...counted]), gross: sumDoc([...regular, ...counted]),
    visibleLineCount: lines.filter((line) => !line.isVatLine && !line.isVatPreview && !line.isBlank).length,
  };
}
