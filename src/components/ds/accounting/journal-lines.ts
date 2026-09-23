export type JournalLineColumn =
  | "debitAccount"
  | "creditAccount"
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
  | "rate";

/** Strana, na kterou se zapisují společné údaje (VS, partner, zakázka). */
export type JournalSharedSide = "debit" | "credit" | "both";

export type JournalLine = {
  id: string;
  /** @deprecated Databáze ukládá předkontaci jako jeden řádek, párování už není potřeba. */
  pairNo?: number;
  debitAccount?: string | null;
  creditAccount?: string | null;
  /** Protiúčet u knih s pevným hlavním účtem. */
  counterAccount?: string | null;
  amount: number;
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
  currency?: string;
  foreignAmount?: number;
  rate?: number;
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
};

export type JournalRowOptions = {
  /** Na kterou stranu se zapisují společné údaje (výchozí "both"). */
  sharedSide?: JournalSharedSide;
  /** Strana hlavního účtu knihy – protiúčtem je pak druhá strana. */
  mainSide?: "MD" | "DAL";
};

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
    (options.mainSide === "MD" ? credit : options.mainSide === "DAL" ? debit : null);

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
  };
}

/** @deprecated Model rozpadu na dva účty se už nepoužívá. */
export type JournalDbLine = {
  id?: string;
  pairNo?: number;
  account: string;
  debit: number;
  credit: number;
  text?: string;
  dimensionId?: string | null;
  vs?: string;
  partnerId?: string | null;
  currency?: string;
  foreignAmount?: number;
  rate?: number;
};

const sharedValues = (line: JournalLine, pairNo: number) => ({
  pairNo,
  text: line.text,
  dimensionId: line.dimensionId,
  vs: line.vs,
  partnerId: line.partnerId,
  currency: line.currency,
  foreignAmount: line.foreignAmount,
  rate: line.rate,
});

/** @deprecated Použijte `toJournalRow`. */
export function toDbLines(lines: JournalLine[]): JournalDbLine[] {
  return lines.flatMap((line, index) => {
    const pairNo = line.pairNo ?? index + 1;
    const common = sharedValues(line, pairNo);
    const amount = Math.abs(Number(line.amount) || 0);
    return [
      { id: `${line.id}-debit`, ...common, account: line.debitAccount ?? "", debit: amount, credit: 0 },
      { id: `${line.id}-credit`, ...common, account: line.creditAccount ?? "", debit: 0, credit: amount },
    ];
  });
}

const fromSingleDbLine = (line: JournalDbLine, index: number): JournalLine => ({
  id: line.id ?? `db-line-${index + 1}`,
  pairNo: line.pairNo,
  debitAccount: line.debit !== 0 ? line.account : null,
  creditAccount: line.credit !== 0 ? line.account : null,
  amount: Math.abs(line.debit || line.credit || 0),
  text: line.text,
  dimensionId: line.dimensionId,
  vs: line.vs,
  partnerId: line.partnerId,
  currency: line.currency,
  foreignAmount: line.foreignAmount,
  rate: line.rate,
});

/** @deprecated Použijte `fromJournalRow`. */
export function fromDbLines(dbLines: JournalDbLine[]): JournalLine[] {
  const paired = new Map<number, { line: JournalDbLine; index: number }[]>();
  const result: { line: JournalLine; index: number }[] = [];

  dbLines.forEach((line, index) => {
    if (line.pairNo === undefined) {
      result.push({ line: fromSingleDbLine(line, index), index });
      return;
    }
    const group = paired.get(line.pairNo) ?? [];
    group.push({ line, index });
    paired.set(line.pairNo, group);
  });

  for (const [pairNo, group] of paired) {
    const debit = group.find(({ line }) => line.debit !== 0);
    const credit = group.find(({ line }) => line.credit !== 0);
    if (!debit || !credit) {
      result.push(...group.map(({ line, index }) => ({ line: fromSingleDbLine(line, index), index })));
      continue;
    }
    result.push({
      index: Math.min(debit.index, credit.index),
      line: {
        id: `pair-${pairNo}`,
        pairNo,
        debitAccount: debit.line.account,
        creditAccount: credit.line.account,
        amount: Math.abs(debit.line.debit || credit.line.credit),
        text: debit.line.text,
        dimensionId: debit.line.dimensionId,
        vs: debit.line.vs,
        partnerId: debit.line.partnerId,
        currency: debit.line.currency,
        foreignAmount: debit.line.foreignAmount,
        rate: debit.line.rate,
      },
    });
    result.push(
      ...group
        .filter(({ index }) => index !== debit.index && index !== credit.index)
        .map(({ line, index }) => ({ line: fromSingleDbLine(line, index), index })),
    );
  }

  return result.sort((a, b) => a.index - b.index).map(({ line }) => line);
}
