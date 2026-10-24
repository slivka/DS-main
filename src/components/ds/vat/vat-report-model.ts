/** Přehledy DPH · vlastní prezentační rozdíly a nabídku · nesmí počítat přiznání. */
import type { VatFilingForm, VatFilingKind, VatReturnRow } from "./vat-report-types";
/** Dostupné názvy druhů podání; oprávnění a platnost dodává APP. */
export function vatFilingKinds(
  form: VatFilingForm,
  allowed?: readonly VatFilingKind[],
): VatFilingKind[] {
  const kinds: VatFilingKind[] =
    form === "oss"
      ? ["regular", "corrective"]
      : ["regular", "corrective", form === "return" ? "additional" : "subsequent"];
  return allowed ? kinds.filter((kind) => allowed.includes(kind)) : kinds;
}
/** Rozdíl pouze existujících srovnatelných částek. */
export function vatRowDifference(row: VatReturnRow, compare?: { base?: number; tax?: number }) {
  return {
    base: compare?.base === undefined ? undefined : (row.base ?? 0) - compare.base,
    tax: compare?.tax === undefined ? undefined : (row.tax ?? 0) - compare.tax,
  };
}
/** Stabilní klíč období bez parsování data. */
export function vatPeriodKey(period: { from: string; to: string }) {
  return `${period.from}/${period.to}`;
}
