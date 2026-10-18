/** Datumové posuny · vlastní kalendářní výpočet · nesmí používat čas UTC pro místní datum. */
import { addDays, addMonths, format, isValid, parseISO } from "date-fns";

/** Posune ISO datum o dny nebo kalendářní měsíce se zachováním posledního dne měsíce. */
export function shiftDocumentDate(
  base: string,
  amount: number,
  unit: "days" | "months" = "days",
): string {
  const date = parseISO(base);
  if (!isValid(date)) return "";
  return format(unit === "months" ? addMonths(date, amount) : addDays(date, amount), "yyyy-MM-dd");
}
