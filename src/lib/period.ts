/** Období pro filtry a přehledy – bez vazby na data, jen výpočet rozsahu dat. */
export type PeriodKey = "day" | "week" | "month" | "year" | "custom";

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  day: "Den",
  week: "Týden",
  month: "Měsíc",
  year: "Rok",
  custom: "Vlastní",
};

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** Rozsah dat (včetně hranic) pro zvolené období vztažené k dnešku. */
export function periodRange(
  key: PeriodKey,
  today = new Date(),
): { from: string | null; to: string | null } {
  const from = new Date(today);
  const to = new Date(today);
  switch (key) {
    case "day":
      break;
    case "week": {
      const day = (from.getDay() + 6) % 7;
      from.setDate(from.getDate() - day);
      to.setDate(from.getDate() + 6);
      break;
    }
    case "month":
      from.setDate(1);
      to.setMonth(to.getMonth() + 1, 0);
      break;
    case "year":
      from.setMonth(0, 1);
      to.setMonth(11, 31);
      break;
    default:
      return { from: null, to: null };
  }
  return { from: iso(from), to: iso(to) };
}
