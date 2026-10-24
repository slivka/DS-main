/** Řádky zápisu · vlastní veřejný kontrakt a převody DB · bez persistence. */
import { dimensionsToRow, dimensionsFromRow, type JournalDimensions, type JournalDimensionsRow } from "./journal-dimensions-model";
import { normalizeCategoryLine } from "./journal-category-model";
export type JournalLineColumn =
  | "debitAccount"
  | "creditAccount"
  | "counterAccount"
  | "amount"
  | "text"
  | "categoryId"
  | "dimensionId"
  | "vs"
  | "partnerId"
  | "debitCategoryId"
  | "debitDimensionId"
  | "creditCategoryId"
  | "creditDimensionId"
  | "debitVs"
  | "creditVs"
  | "debitPartnerId"
  | "creditPartnerId"
  | "nonTax"
  | "currency"
  | "foreignAmount"
  | "rate"
  | "quantity"
  | "unitId"
  | "unitPrice"
  | "vatCodeId"
  | "vatRate"
  | "vatAmount"
  | "grossAmount"
  | "vatDeduction"
  | "vatDeductionShare"
  | "khLimitExcluded"
  | "pdpSubjectCode";

/** Nárok na odpočet DPH u vstupního kódu. */
export type VatDeduction = "full" | "none" | "partial";
/** Druh řádku daně vytvořeného databází. */
export type VatLineKind = "deductible" | "non_deductible";
/**
 * Režim zadání částky.
 * @deprecated 2.109.0 – řádky jsou vždy bez DPH. Odstraní se ve 3.0.0.
 */
export type VatCalcMode = "net" | "gross";
/** Kód DPH použitelný pro doklad – filtruje aplikace (směr, aktivní, platnost k Datu DPH). */
export type VatCodeOption = {
  id: string;
  code: string;
  name: string;
  direction: "out" | "in";
  hasTax: boolean;
  /** Sazba k Datu DPH; null u kódu bez daně. */
  rate: number | null;
  selfAssessment: boolean;
  requiresPdpSubject: boolean;
  /** Čísla účtů pro období; null = účet chybí (daň se nezaúčtuje). */
  taxOutAccount?: string | null;
  taxInAccount?: string | null;
  inactive?: boolean;
  /**
   * Skupina nabídky z dat (`menu_group`, 2.118.0): s daní / osvobozená a zvláštní režimy /
   * mimo DPH. Bez hodnoty rozhodne `hasTax`. Kód sám není unikátní – klíčem je `id` (kód + směr).
   */
  menuGroup?: "taxed" | "exempt" | "outside";
  /** Oddíl kontrolního hlášení (A1, A2, A4, A5, B1, B2, B3) pro štítek v rekapitulaci. */
  khSection?: string;
};
/** Předmět plnění v režimu přenesení daňové povinnosti. */
export type VatPdpSubject = { code: string; name: string };

/** Strana, na kterou se zapisují společné údaje (VS, partner, kategorie). */
export type JournalSharedSide = "debit" | "credit" | "both";

export type JournalLine = {
  id: string;
  /** Účinné hodnoty dimenzí; inherited=false je ruční výjimka. */
  dimensions?: JournalDimensions;
  /** Automatický řádek zálohy dodaný APP, pouze prezentační štítek. */
  autoKind?: "advance" | "advance_fx";
  debitAccount?: string | null;
  creditAccount?: string | null;
  /** Protiúčet u knih s pevným hlavním účtem. */
  counterAccount?: string | null;
  amount?: number;
  text?: string;
  /** Společné hodnoty (režim sideFields="shared"). */
  /** Ekonomická kategorie. */
  categoryId?: string | null;
  /** @deprecated Od 2.138.0 categoryId; odstranění ve 3.0.0. */
  dimensionId?: string | null;
  vs?: string;
  partnerId?: string | null;
  /** Hodnoty jednotlivých stran (režim sideFields="split"). */
  /** Ekonomická kategorie. */
  debitCategoryId?: string | null;
  /** @deprecated Od 2.138.0 debitCategoryId; odstranění ve 3.0.0. */
  debitDimensionId?: string | null;
  /** Ekonomická kategorie. */
  creditCategoryId?: string | null;
  /** @deprecated Od 2.138.0 creditCategoryId; odstranění ve 3.0.0. */
  creditDimensionId?: string | null;
  debitVs?: string;
  creditVs?: string;
  debitPartnerId?: string | null;
  creditPartnerId?: string | null;
  nonTax?: boolean;
  isRounding?: boolean;
  /** Databází vytvořený rozdíl přepočtu celého dokladu a jednotlivých řádků. */
  isFxRounding?: boolean;
  quantity?: number;
  unitId?: string | null;
  unitPrice?: number;
  currency?: string;
  foreignAmount?: number;
  rate?: number;
  /** Nedotčený prázdný řádek, který aplikace při ukládání vynechá. */
  isBlank?: boolean;
  /** DPH – kód, sazba (jen čtení z DB) a daň v měně dokladu. */
  vatCodeId?: string | null;
  vatRate?: number | null;
  vatAmount?: number;
  /** Jen čtení z DB: daň a základ v domácí měně kurzem DPH. */
  vatAmountHome?: number;
  vatBaseHome?: number;
  /**
   * Pevná systémová daň z DB (odpočet zálohy, import) – jen zobrazení se zámkem.
   * Od 2.109.0 ji klient nezadává ani neposílá.
   */
  vatManual?: boolean;
  vatDeduction?: VatDeduction;
  vatDeductionShare?: number;
  /** Mimo plnění – nezapočítávat do limitu KH; hodnotu a pravidla dodává APP. */
  khLimitExcluded?: boolean;
  pdpSubjectCode?: string | null;
  /** Zadaná částka s DPH (režim „s DPH“), v měně dokladu. */
  grossAmount?: number;
  /** Řádek daně vytvořený databází – v gridu se nezobrazuje a neukládá se. */
  isVatLine?: boolean;
  vatParentLineId?: string | null;
  vatLineKind?: VatLineKind;
  /** Předběžný řádek daně spočtený v editoru (neukládá se). */
  isVatPreview?: boolean;
  /** Řádek daně, který se nedotýká hlavního účtu (samovyměření) – nevstupuje do celku. */
  excludeFromTotal?: boolean;
};

/** Databázový řádek zápisu – jedna předkontace = jeden řádek. */
export type JournalRow = {
  /** Jen ruční hodnoty při zápisu, obě strany. */
  dimensions?: JournalDimensionsRow;
  debit_account_id: string | null;
  credit_account_id: string | null;
  counter_account_id: string | null;
  amount: number;
  description: string | null;
  debit_variable_symbol: string | null;
  credit_variable_symbol: string | null;
  debit_partner_id: string | null;
  credit_partner_id: string | null;
  debit_category_id?: string | null;
  credit_category_id?: string | null;
  /** @deprecated Od 2.138.0 debit_category_id; odstranění ve 3.0.0. */
  debit_dimension_id?: string | null;
  /** @deprecated Od 2.138.0 credit_category_id; odstranění ve 3.0.0. */
  credit_dimension_id?: string | null;
  non_tax: boolean;
  is_rounding: boolean;
  currency_code: string | null;
  amount_foreign: number | null;
  exchange_rate: number | null;
  quantity: number | null;
  unit_id: string | null;
  unit_price: number | null;
  is_fx_rounding: boolean;
  /** DPH – posílá se jen při zapnutém DPH. */
  vat_code_id?: string | null;
  vat_manual?: boolean;
  vat_amount_foreign?: number | null;
  vat_deduction?: VatDeduction | null;
  vat_deduction_share?: number | null;
  kh_limit_excluded?: boolean;
  pdp_subject_code?: string | null;
  /** Zadaná částka s DPH v režimu „s DPH“. */
  amount_gross?: number | null;
  /** Jen čtení z DB – klient je nikdy neposílá. */
  vat_rate?: number | null;
  vat_amount?: number | null;
  vat_base_dom?: number | null;
  vat_gross_foreign?: number | null;
  is_vat_line?: boolean;
  vat_parent_line_id?: string | null;
  vat_line_kind?: VatLineKind | null;
};

export type JournalRowOptions = {
  /** Staré názvy DB jen na výslovnou volbu; výchozí category. */
  categoryFormat?: "category" | "dimension";
  /** Na kterou stranu se zapisují společné údaje (výchozí "both"). */
  sharedSide?: JournalSharedSide;
  /** Strana hlavního účtu knihy – protiúčtem je pak druhá strana. */
  mainSide?: "MD" | "D";
  /** Zapnuté DPH – přidá DPH sloupce; v režimu „gross“ i `amount_gross`. */
  vat?: { calcMode: VatCalcMode };
};

/** Kategorie účtu z osnovy (sloupec `accounts.category`). */
export type AccountCategory =
  | "pohledavky"
  | "zavazky"
  | "poskytnute_zalohy"
  | "prijate_zalohy"
  | "saldokonto"
  | "ekonomicka_kategorie"
  | "bilance"
  | (string & {});

/** Typ účtu z osnovy (sloupec `accounts.account_type`). */
export type AccountTypeCode = "nakladovy" | "vynosovy" | "rozvahovy" | (string & {});

export type AccountLike = {
  category?: AccountCategory | null;
  accountType?: AccountTypeCode | null;
};

const VS_REQUIRED_CATEGORIES = new Set<string>([
  "pohledavky",
  "zavazky",
  "poskytnute_zalohy",
  "prijate_zalohy",
  "saldokonto",
]);
const SALDO_CATEGORIES = new Set<string>([
  "pohledavky",
  "zavazky",
  "poskytnute_zalohy",
  "prijate_zalohy",
  "saldokonto",
]);

export type SideFieldRules = {
  vsRequired: boolean;
  categoryRequired?: boolean;
  /** @deprecated Od 2.138.0 categoryRequired; odstranění ve 3.0.0. */
  dimensionRequired: boolean;
  partnerOffered: boolean;
};
export type SideFieldRulesFn = (
  account: AccountLike | undefined,
  options?: { categoryRequired?: boolean; dimensionRequired?: boolean },
) => SideFieldRules;

/** Která stranová pole jsou pro daný účet povinná nebo nabízená. */
export function sideFieldRules(
  account: AccountLike | undefined,
  options: { categoryRequired?: boolean; dimensionRequired?: boolean } = {},
): SideFieldRules {
  const category = account?.category ?? undefined;
  const required =
    Boolean(options.categoryRequired ?? options.dimensionRequired) &&
    (category === "bilance" || category === "ekonomicka_kategorie");
  return {
    categoryRequired: required,
    vsRequired: !!category && VS_REQUIRED_CATEGORIES.has(category),
    dimensionRequired: required,
    partnerOffered: !!category && SALDO_CATEGORIES.has(category),
  };
}

/** Nákladový nebo výnosový účet – tam má příznak Nedaňový smysl. */
export function isResultAccountType(account?: AccountLike, code?: string | null): boolean {
  if (account?.accountType)
    return account.accountType === "nakladovy" || account.accountType === "vynosovy";
  return !!code && (code.startsWith("5") || code.startsWith("6"));
}

const emptyToNull = (value?: string | null) => (value ? value : null);

const sideValue = <T extends string>(
  own: T | null | undefined,
  shared: T | null | undefined,
  side: "debit" | "credit",
  sharedSide: JournalSharedSide,
) => {
  if (own) return own;
  if (sharedSide === "both" || sharedSide === side) return shared ?? null;
  return null;
};

/** Stranová kategorie s výslovným null má přednost před sdílenou hodnotou. */
const categorySideValue = (
  own: string | null | undefined,
  shared: string | null | undefined,
  side: "debit" | "credit",
  sharedSide: JournalSharedSide,
) => (own !== undefined ? emptyToNull(own) : sideValue(undefined, shared, side, sharedSide));

/** Převede řádek editoru na databázový řádek (1:1). */
export function toJournalRow(line: JournalLine, options: JournalRowOptions = {}): JournalRow {
  line = normalizeCategoryLine(line);
  const sharedSide = options.sharedSide ?? "both";
  const debit = emptyToNull(line.debitAccount);
  const credit = emptyToNull(line.creditAccount);
  const vatColumns: Partial<JournalRow> = {};
  // Skrytí DPH ani změna nároku nesmí zahodit uložené údaje.
  if (line.vatDeduction !== undefined) vatColumns.vat_deduction = line.vatDeduction;
  if (line.vatDeductionShare !== undefined) vatColumns.vat_deduction_share = line.vatDeductionShare;
  if (line.khLimitExcluded !== undefined) vatColumns.kh_limit_excluded = line.khLimitExcluded;
  if (options.vat) {
    vatColumns.vat_code_id = emptyToNull(line.vatCodeId);
    // 2.109.0: klient vat_manual ani ruční daň neposílá – pevnou daň zakládá jen systém.
    vatColumns.pdp_subject_code = emptyToNull(line.pdpSubjectCode);
  }
  const counter =
    emptyToNull(line.counterAccount) ??
    (options.mainSide === "MD" ? credit : options.mainSide === "D" ? debit : null);

  return {
    ...(line.dimensions ? { dimensions: dimensionsToRow(line.dimensions) } : {}),
    debit_account_id: debit,
    credit_account_id: credit,
    counter_account_id: counter,
    amount: Number(line.amount) || 0,
    description: emptyToNull(line.text),
    debit_variable_symbol: sideValue(
      emptyToNull(line.debitVs),
      emptyToNull(line.vs),
      "debit",
      sharedSide,
    ),
    credit_variable_symbol: sideValue(
      emptyToNull(line.creditVs),
      emptyToNull(line.vs),
      "credit",
      sharedSide,
    ),
    debit_partner_id: sideValue(
      emptyToNull(line.debitPartnerId),
      emptyToNull(line.partnerId),
      "debit",
      sharedSide,
    ),
    credit_partner_id: sideValue(
      emptyToNull(line.creditPartnerId),
      emptyToNull(line.partnerId),
      "credit",
      sharedSide,
    ),
    ...(options.categoryFormat === "dimension"
      ? {
          debit_dimension_id: categorySideValue(
            line.debitCategoryId,
            emptyToNull(line.categoryId),
            "debit",
            sharedSide,
          ),
          credit_dimension_id: categorySideValue(
            line.creditCategoryId,
            emptyToNull(line.categoryId),
            "credit",
            sharedSide,
          ),
        }
      : {
          debit_category_id: categorySideValue(
            line.debitCategoryId,
            emptyToNull(line.categoryId),
            "debit",
            sharedSide,
          ),
          credit_category_id: categorySideValue(
            line.creditCategoryId,
            emptyToNull(line.categoryId),
            "credit",
            sharedSide,
          ),
        }),
    non_tax: Boolean(line.nonTax),
    is_rounding: Boolean(line.isRounding),
    currency_code: emptyToNull(line.currency),
    amount_foreign: line.foreignAmount ?? null,
    exchange_rate: line.rate ?? null,
    quantity: line.quantity ?? null,
    unit_id: emptyToNull(line.unitId),
    unit_price: line.unitPrice ?? null,
    is_fx_rounding: Boolean(line.isFxRounding),
    ...vatColumns,
  };
}

/** Převede řádky editoru na řádky k uložení – vynechá řádky daně, předběžné a nedotčené prázdné řádky. */
export function toJournalRows(lines: JournalLine[], options: JournalRowOptions = {}): JournalRow[] {
  return lines
    .filter((line) => !line.isVatLine && !line.isVatPreview && !line.isBlank)
    .map((line) => toJournalRow(line, options));
}

/** Převede databázový řádek na řádek editoru (1:1). */
export function fromJournalRow(row: JournalRow, id?: string): JournalLine {
  return {
    id: id ?? `row-${Math.random().toString(36).slice(2, 10)}`,
    ...(row.dimensions ? { dimensions: dimensionsFromRow(row.dimensions) } : {}),
    debitAccount: row.debit_account_id,
    creditAccount: row.credit_account_id,
    counterAccount: row.counter_account_id,
    amount: Number(row.amount) || 0,
    text: row.description ?? undefined,
    debitVs: row.debit_variable_symbol ?? undefined,
    creditVs: row.credit_variable_symbol ?? undefined,
    debitPartnerId: row.debit_partner_id,
    creditPartnerId: row.credit_partner_id,
    debitCategoryId:
      row.debit_category_id !== undefined ? row.debit_category_id : row.debit_dimension_id,
    debitDimensionId:
      row.debit_category_id !== undefined ? row.debit_category_id : row.debit_dimension_id,
    creditCategoryId:
      row.credit_category_id !== undefined ? row.credit_category_id : row.credit_dimension_id,
    creditDimensionId:
      row.credit_category_id !== undefined ? row.credit_category_id : row.credit_dimension_id,
    vs: row.debit_variable_symbol ?? row.credit_variable_symbol ?? undefined,
    partnerId: row.debit_partner_id ?? row.credit_partner_id,
    categoryId:
      (row.debit_category_id !== undefined ? row.debit_category_id : row.debit_dimension_id) ??
      (row.credit_category_id !== undefined ? row.credit_category_id : row.credit_dimension_id),
    dimensionId:
      (row.debit_category_id !== undefined ? row.debit_category_id : row.debit_dimension_id) ??
      (row.credit_category_id !== undefined ? row.credit_category_id : row.credit_dimension_id),
    nonTax: row.non_tax,
    isRounding: row.is_rounding,
    currency: row.currency_code ?? undefined,
    foreignAmount: row.amount_foreign ?? undefined,
    rate: row.exchange_rate ?? undefined,
    quantity: row.quantity ?? undefined,
    unitId: row.unit_id,
    unitPrice: row.unit_price ?? undefined,
    isFxRounding: row.is_fx_rounding,
    vatDeduction: row.vat_deduction ?? undefined,
    vatDeductionShare: row.vat_deduction_share ?? undefined,
    khLimitExcluded: row.kh_limit_excluded,
    ...(row.vat_code_id !== undefined || row.is_vat_line !== undefined
      ? {
          vatCodeId: row.vat_code_id ?? null,
          vatRate: row.vat_rate ?? null,
          vatAmount: row.vat_amount_foreign ?? undefined,
          vatAmountHome: row.vat_amount ?? undefined,
          vatBaseHome: row.vat_base_dom ?? undefined,
          vatManual: Boolean(row.vat_manual),
          pdpSubjectCode: row.pdp_subject_code ?? null,
          grossAmount: row.vat_gross_foreign ?? undefined,
          isVatLine: Boolean(row.is_vat_line),
          vatParentLineId: row.vat_parent_line_id ?? null,
          vatLineKind: row.vat_line_kind ?? undefined,
        }
      : {}),
  };
}
