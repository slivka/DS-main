/**
 * Platnost řádků editoru dokladu.
 * Vlastní: povinné účty a částku, pravidla stran (VS, zakázka), kontroly DPH a varování.
 * Nesmí: používat React ani DOM; texty dostává hotové z DsTexts.
 */
import type { AccountOption } from "./account-select";
import type {
  JournalLine,
  JournalLineColumn,
  JournalSharedSide,
  SideFieldRulesFn,
  VatCalcMode,
  VatCodeOption,
} from "./journal-lines";
import { isGridLine, isPinnedLine } from "./journal-lines-model";
import { resolveLineVat } from "./journal-vat";
import { formatAmount } from "../../../lib/format";
import type { JournalEditorTexts } from "../../../ds-texts";

/** Chyby jednoho řádku podle sloupce. */
export type JournalLineErrors = Partial<Record<JournalLineColumn, string>>;

/** Vše, co validace řádků potřebuje znát o dokladu. */
export interface JournalValidationContext {
  /** Texty hlášek. */
  texts: JournalEditorTexts;
  /** Účty podle čísla. */
  accountByCode: Map<string, AccountOption>;
  /** Režim polí stran. */
  sideFields: "shared" | "split";
  /** Strana sdílených polí. */
  sharedSide: JournalSharedSide;
  /** Pravidla stran podle účtu. */
  sideFieldRules: SideFieldRulesFn;
  /** Zakázka povinná pro celou knihu. */
  dimensionRequired: boolean;
  /** DPH zapnuto a editovatelné. */
  vatActive: boolean;
  /** Kódy DPH podle id. */
  vatCodeMap: Map<string, VatCodeOption>;
  /** Režim zadání částky. */
  calcMode: VatCalcMode;
  /** Doklad v cizí měně. */
  foreign: boolean;
  /** Značka měny dokladu pro hlášku odchylky. */
  documentMark: string;
  /** Výjimka z povinného kódu DPH. */
  isCodeRequired?: (line: JournalLine) => boolean;
  /** Řádky, jejichž kód DPH nemá účty (id řádku → kód). */
  missingVatAccounts: Map<string, string>;
}

/** Chybějící VS nebo zakázka podle pravidel účtů na stranách MD / DAL. */
export function journalSideIssues(line: JournalLine, ctx: JournalValidationContext) {
  const { texts: t, sideFields } = ctx;
  const issues: JournalLineErrors = {};
  (["debit", "credit"] as const).forEach((side) => {
    if (sideFields === "shared" && ctx.sharedSide !== "both" && ctx.sharedSide !== side) return;
    const code = side === "debit" ? line.debitAccount : line.creditAccount;
    const account = code ? ctx.accountByCode.get(code) : undefined;
    if (!account) return;
    const rules = ctx.sideFieldRules(account, { dimensionRequired: ctx.dimensionRequired });
    const sideLabel = side === "debit" ? t.sideDebit : t.sideCredit;
    const shared = sideFields === "shared";
    const vsColumn = shared ? "vs" : side === "debit" ? "debitVs" : "creditVs";
    const dimensionColumn = shared
      ? "dimensionId"
      : side === "debit"
        ? "debitDimensionId"
        : "creditDimensionId";
    if (rules.vsRequired && !line[vsColumn])
      issues[vsColumn] = t.missingVs.replace("{side}", sideLabel);
    if (rules.dimensionRequired && !line[dimensionColumn])
      issues[dimensionColumn] = t.missingDimension.replace("{side}", sideLabel);
  });
  return issues;
}

/** Chyby a varování DPH řádku (kód, ruční daň, PDP, poměrný nárok, chybějící účty). */
export function journalVatIssues(line: JournalLine, ctx: JournalValidationContext) {
  const { texts: t } = ctx;
  const errors: JournalLineErrors = {};
  const warnings: JournalLineErrors = {};
  if (!ctx.vatActive) return { errors, warnings };
  const code = line.vatCodeId ? ctx.vatCodeMap.get(line.vatCodeId) : undefined;
  if (!code) {
    if (ctx.isCodeRequired?.(line) ?? true) errors.vatCodeId = t.vatCodeRequired;
    return { errors, warnings };
  }
  const resolved = resolveLineVat(line, ctx.vatCodeMap, {
    calcMode: ctx.calcMode,
    foreign: ctx.foreign,
  });
  const deviation = Math.abs(resolved.deviation);
  const message = t.vatDeviation.replace(
    "{amount}",
    `${formatAmount(deviation, 2)} ${ctx.documentMark}`,
  );
  if (deviation > 1) errors.vatAmount = message;
  else if (deviation > 0) warnings.vatAmount = message;
  if (code.requiresPdpSubject && !line.pdpSubjectCode) errors.pdpSubjectCode = t.pdpRequired;
  if (
    (code.direction === "in" || code.selfAssessment) &&
    code.hasTax &&
    line.vatDeduction === "partial"
  ) {
    const share = Number(line.vatDeductionShare);
    if (!(share >= 1 && share <= 99)) errors.vatDeductionShare = t.deductionShareRange;
  }
  const missing = ctx.missingVatAccounts.get(line.id);
  if (missing) warnings.vatCodeId = t.vatMissingAccounts.replace("{code}", missing);
  return { errors, warnings };
}

/** Volby, které řádky se validují. */
export interface JournalValidationScope {
  /** Validovat i nedotčené prázdné řádky. */
  showAllErrors: boolean;
  /** Řádky, na které už uživatel sáhl. */
  touched: ReadonlySet<string>;
  /** Doplňková validace volajícího. */
  validate?: (line: JournalLine) => JournalLineErrors;
}

/** Chyby všech řádků (id → chyby); připnuté a nedotčené prázdné řádky jsou bez chyb. */
export function validateJournalLines(
  lines: JournalLine[],
  ctx: JournalValidationContext,
  scope: JournalValidationScope,
) {
  return new Map(
    lines.map((line): [string, JournalLineErrors] => {
      const validateLine = scope.showAllErrors || !line.isBlank || scope.touched.has(line.id);
      if (!validateLine || !isGridLine(line) || isPinnedLine(line)) return [line.id, {}];
      const errors: JournalLineErrors = {};
      if (!line.debitAccount) errors.debitAccount = ctx.texts.debitRequired;
      if (!line.creditAccount) errors.creditAccount = ctx.texts.creditRequired;
      if (!Number(line.amount)) errors.amount = ctx.texts.amountRequired;
      Object.assign(errors, journalSideIssues(line, ctx));
      Object.assign(errors, journalVatIssues(line, ctx).errors);
      return [line.id, { ...errors, ...scope.validate?.(line) }];
    }),
  );
}
