/**
 * Interní: souhrn DPH spodní rekapitulace s daní ze skupin (stejný výpočet jako DB,
 * u zaúčtovaného dokladu z uložených řádků daně). Nepatří do barelu.
 */
import { exactSum, mulDivRound } from "../../../lib/decimal-round";
import type { VatSummaryRow } from "./journal-vat";
import type { VatGroupsResult } from "./journal-vat-groups";

export function vatSummaryWithGroupTax(
  rows: VatSummaryRow[],
  result: VatGroupsResult,
  exchangeRate: number,
): VatSummaryRow[] {
  return rows.map((row) => {
    const taxes = [
      ...result.groups.filter((group) => group.vatCodeId === row.codeId).map((g) => g.tax),
      ...result.fixed.filter((fixed) => fixed.vatCodeId === row.codeId).map((f) => f.tax),
    ];
    if (taxes.length === 0) return row;
    const vat = exactSum(taxes);
    if (vat === row.vat) return row;
    const deductible =
      row.vat === 0
        ? row.nonDeductible === 0
          ? vat
          : 0
        : mulDivRound(row.deductible, vat, row.vat, 2);
    return {
      ...row,
      vat,
      gross: row.selfAssessment ? row.gross : exactSum([row.base, vat]),
      vatHome: mulDivRound(vat, exchangeRate, 1, 2),
      deductible,
      nonDeductible: exactSum([vat, -deductible]),
    };
  });
}
