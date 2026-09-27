export type JournalLineColumn =
  | "debitAccount"
  | "creditAccount"
  | "counterAccount"
  | "amount"
  | "text"
  | "dimensionId"
  | "vs"
  | "partnerId"
  | "debitDimensionId"
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
  | "unitPrice";

/** Strana, na kterou se zapisují společné údaje (VS, partner, zakázka). */
export type JournalSharedSide = "debit" | "credit" | "both";

export type JournalLine = {
  id: string;
  debitAccount?: string | null;
  creditAccount?: string | null;
  /** Protiúčet u knih s pevným hlavním účtem. */
  counterAccount?: string | null;
  amount?: number;
  text?: string;
  /** Společné hodnoty (režim sideFields="shared"). */
  dimensionId?: string | null;
  vs?: string;
  partnerId?: string | null;
  /** Hodnoty jednotlivých stran (režim sideFields="split"). */
  debitDimensionId?: string | null;
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
};

/** Databázový řádek zápisu – jedna předkontace = jeden řádek. */
export type JournalRow = {
  debit_account_id: string | null;
  credit_account_id: string | null;
  counter_account_id: string | null;
  amount: number;
  description: string | null;
  debit_variable_symbol: string | null;
  credit_variable_symbol: string | null;
  debit_partner_id: string | null;
  credit_partner_id: string | null;
  debit_dimension_id: string | null;
  credit_dimension_id: string | null;
  non_tax: boolean;
  is_rounding: boolean;
  currency_code: string | null;
  amount_foreign: number | null;
  exchange_rate: number | null;
  quantity: number | null;
  unit_id: string | null;
  unit_price: number | null;
  is_fx_rounding: boolean;
};

export type JournalRowOptions = {
  /** Na kterou stranu se zapisují společné údaje (výchozí "both"). */
  sharedSide?: JournalSharedSide;
  /** Strana hlavního účtu knihy – protiúčtem je pak druhá strana. */
  mainSide?: "MD" | "D";
};

/** Kategorie účtu z osnovy (sloupec `accounts.category`). */
export type AccountCategory =
  | "pohledavky"
  | "zavazky"
  | "poskytnute_zalohy"
  | "prijate_zalohy"
  | "saldokonto"
  | "bilance"
  | (string & {});

/** Typ účtu z osnovy (sloupec `accounts.account_type`). */
export type AccountTypeCode = "nakladovy" | "vynosovy" | "rozvahovy" | (string & {});

export type AccountLike = { category?: AccountCategory | null; accountType?: AccountTypeCode | null };

const VS_REQUIRED_CATEGORIES = new Set<string>([
  "pohledavky", "zavazky", "poskytnute_zalohy", "prijate_zalohy", "saldokonto",
]);
const SALDO_CATEGORIES = new Set<string>([
  "pohledavky", "zavazky", "poskytnute_zalohy", "prijate_zalohy", "saldokonto",
]);

export type SideFieldRules = { vsRequired: boolean; dimensionRequired: boolean; partnerOffered: boolean };
export type SideFieldRulesFn = (
  account: AccountLike | undefined,
  options?: { dimensionRequired?: boolean },
) => SideFieldRules;

/** Která stranová pole jsou pro daný účet povinná nebo nabízená. */
export function sideFieldRules(
  account: AccountLike | undefined,
  options: { dimensionRequired?: boolean } = {},
): SideFieldRules {
  const category = account?.category ?? undefined;
  return {
    vsRequired: !!category && VS_REQUIRED_CATEGORIES.has(category),
    dimensionRequired: Boolean(options.dimensionRequired) && category === "bilance",
    partnerOffered: !!category && SALDO_CATEGORIES.has(category),
  };
}

/** Nákladový nebo výnosový účet – tam má příznak Nedaňový smysl. */
export function isResultAccountType(account?: AccountLike, code?: string | null): boolean {
  if (account?.accountType) return account.accountType === "nakladovy" || account.accountType === "vynosovy";
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

/** Převede řádek editoru na databázový řádek (1:1). */
export function toJournalRow(line: JournalLine, options: JournalRowOptions = {}): JournalRow {
  const sharedSide = options.sharedSide ?? "both";
  const debit = emptyToNull(line.debitAccount);
  const credit = emptyToNull(line.creditAccount);
  const counter =
    emptyToNull(line.counterAccount) ??
    (options.mainSide === "MD" ? credit : options.mainSide === "D" ? debit : null);

  return {
    debit_account_id: debit,
    credit_account_id: credit,
    counter_account_id: counter,
    amount: Math.abs(Number(line.amount) || 0),
    description: emptyToNull(line.text),
    debit_variable_symbol: sideValue(emptyToNull(line.debitVs), emptyToNull(line.vs), "debit", sharedSide),
    credit_variable_symbol: sideValue(emptyToNull(line.creditVs), emptyToNull(line.vs), "credit", sharedSide),
    debit_partner_id: sideValue(emptyToNull(line.debitPartnerId), emptyToNull(line.partnerId), "debit", sharedSide),
    credit_partner_id: sideValue(emptyToNull(line.creditPartnerId), emptyToNull(line.partnerId), "credit", sharedSide),
    debit_dimension_id: sideValue(emptyToNull(line.debitDimensionId), emptyToNull(line.dimensionId), "debit", sharedSide),
    credit_dimension_id: sideValue(emptyToNull(line.creditDimensionId), emptyToNull(line.dimensionId), "credit", sharedSide),
    non_tax: Boolean(line.nonTax),
    is_rounding: Boolean(line.isRounding),
    currency_code: emptyToNull(line.currency),
    amount_foreign: line.foreignAmount ?? null,
    exchange_rate: line.rate ?? null,
    quantity: line.quantity ?? null,
    unit_id: emptyToNull(line.unitId),
    unit_price: line.unitPrice ?? null,
    is_fx_rounding: Boolean(line.isFxRounding),
  };
}

/** Převede databázový řádek na řádek editoru (1:1). */
export function fromJournalRow(row: JournalRow, id?: string): JournalLine {
  return {
    id: id ?? `row-${Math.random().toString(36).slice(2, 10)}`,
    debitAccount: row.debit_account_id,
    creditAccount: row.credit_account_id,
    counterAccount: row.counter_account_id,
    amount: Number(row.amount) || 0,
    text: row.description ?? undefined,
    debitVs: row.debit_variable_symbol ?? undefined,
    creditVs: row.credit_variable_symbol ?? undefined,
    debitPartnerId: row.debit_partner_id,
    creditPartnerId: row.credit_partner_id,
    debitDimensionId: row.debit_dimension_id,
    creditDimensionId: row.credit_dimension_id,
    vs: row.debit_variable_symbol ?? row.credit_variable_symbol ?? undefined,
    partnerId: row.debit_partner_id ?? row.credit_partner_id,
    dimensionId: row.debit_dimension_id ?? row.credit_dimension_id,
    nonTax: row.non_tax,
    isRounding: row.is_rounding,
    currency: row.currency_code ?? undefined,
    foreignAmount: row.amount_foreign ?? undefined,
    rate: row.exchange_rate ?? undefined,
    quantity: row.quantity ?? undefined,
    unitId: row.unit_id,
    unitPrice: row.unit_price ?? undefined,
    isFxRounding: row.is_fx_rounding,
  };
}
