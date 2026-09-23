export type JournalLineColumn =
  | "debitAccount"
  | "creditAccount"
  | "amount"
  | "text"
  | "dimensionId"
  | "vs"
  | "partnerId"
  | "currency"
  | "foreignAmount"
  | "rate";

export type JournalLine = {
  id: string;
  pairNo?: number;
  debitAccount?: string | null;
  creditAccount?: string | null;
  amount: number;
  text?: string;
  dimensionId?: string | null;
  vs?: string;
  partnerId?: string | null;
  currency?: string;
  foreignAmount?: number;
  rate?: number;
};

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

/** Rozloží předkontace na dva databázové řádky s jedním účtem. */
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

/** Složí databázové řádky podle pairNo; nespárovatelné řádky zachová samostatně. */
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