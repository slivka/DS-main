/** Meze přiřazení · vlastní kontrolu ovladačů · nesmí rozhodovat o účetní přípustnosti. */
import { exactSum } from "../../../../lib/decimal-round";
import { exceedsMax } from "../../grid/grid-amount-editor";
import type { AdvanceAllocation, AdvanceAllocationCandidate } from "./advance-types";
/** Součet potvrzených částek v jedné měně. */
export function allocationTotal(value: AdvanceAllocation[]): number {
  return exactSum(value.map((item) => item.amount ?? 0));
}
/** Kontrola nezáporné částky, existence cíle a zbývajících částek. */
export function allocationInvalid(
  value: AdvanceAllocation[],
  candidates: AdvanceAllocationCandidate[],
  remaining: number,
): boolean {
  const targets = new Map(candidates.map((item) => [item.id, item]));
  return (
    new Set(value.map((item) => item.id)).size !== value.length ||
    exceedsMax(allocationTotal(value), remaining) ||
    value.some((item) => {
      const target = targets.get(item.id);
      return (
        !target ||
        item.amount === null ||
        !Number.isFinite(item.amount) ||
        item.amount <= 0 ||
        exceedsMax(item.amount, target.remaining)
      );
    })
  );
}
