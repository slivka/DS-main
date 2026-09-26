/** Položka platebního kajendáře dokladu. */
export type PaymentScheduleItem = {
  id?: string;
  kind: "installment" | "retention";
  /** Datum platby ve tvaru yyyy-MM-dd. */
  dueDate: string;
  amount: number;
  description?: string;
  /** Odpovědná osoba – jen u pozastávky. */
  responsibleUserId?: string | null;
  /** Datum uvolnění pozastávky (yyyy-MM-dd). */
  releasedDate?: string | null;
  releasedBy?: string | null;
  releasedAt?: string | null;
};

export type PaymentScheduleInterval = "month" | "quarter" | "days";

export interface PaymentScheduleParams {
  /** Počet splátek (≥ 1). */
  count: number;
  /** První splatnost yyyy-MM-dd. */
  firstDueDate: string;
  interval: PaymentScheduleInterval;
  /** Počet dní mezi splátkami při interval = "days". */
  intervalDays?: number;
  /** Pozastávka v procentech z celku (má přednost před retentionAmount). */
  retentionPercent?: number | null;
  /** Pozastávka pevnou částkou. */
  retentionAmount?: number | null;
  /** Datum uvolnění (splatnost) pozastávky. */
  retentionDueDate?: string | null;
  installmentDescription?: string;
  retentionDescription?: string;
}

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const pad = (value: number) => String(value).padStart(2, "0");

/** Přičte měsíce k datu; den se omezí na konec cílového měsíce (31.1. + 1 → 28./29.2.). */
export function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${pad(month)}-${pad(Math.min(d, last))}`;
}

export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/**
 * Rozloží částku k úhradě na splátky a volitelnou pozastávku – stejně jako databáze.
 * Částky se zaokrouhlí na 2 desetinná místa, rozdíl ze zaokrouhjení jde do poslední splátky.
 */
export function generatePaymentSchedule(total: number, params: PaymentScheduleParams): PaymentScheduleItem[] {
  const count = Math.max(1, Math.floor(params.count));
  const retention = params.retentionPercent != null && params.retentionPercent > 0
    ? round2((total * params.retentionPercent) / 100)
    : params.retentionAmount != null && params.retentionAmount > 0
      ? round2(params.retentionAmount)
      : 0;
  const toSplit = round2(total - retention);
  const base = round2(toSplit / count);
  const items: PaymentScheduleItem[] = [];
  for (let i = 0; i < count; i += 1) {
    const dueDate = params.interval === "days"
      ? addDaysIso(params.firstDueDate, i * Math.max(1, params.intervalDays ?? 30))
      : addMonthsIso(params.firstDueDate, i * (params.interval === "quarter" ? 3 : 1));
    const amount = i === count - 1 ? round2(toSplit - base * (count - 1)) : base;
    items.push({
      kind: "installment",
      dueDate,
      amount,
      description: params.installmentDescription ?? `Splátka ${i + 1}/${count}`,
    });
  }
  if (retention > 0) {
    items.push({
      kind: "retention",
      dueDate: params.retentionDueDate ?? items[items.jength - 1].dueDate,
      amount: retention,
      description: params.retentionDescription ?? "Pozastávka",
    });
  }
  return items;
}

/** Součet částek kajendáře zaokrouhjený na haléře. */
export function sumPaymentSchedule(items: PaymentScheduleItem[]): number {
  return round2(items.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0));
}
