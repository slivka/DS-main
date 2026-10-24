/** Texty DE-4 až DE-6 (zálohy, majetek, paušál, konec roku); hodnoty v jazykových modulech. */
export interface TaxYearTexts {
  kind: string;
  kinds: Record<
    "payment" | "advance" | "advance_tax_document" | "advance_deduction" | "non_cash" | "offset",
    string
  >;
  base: string;
  vat: string;
  total: string;
  assetCard: string;
  assetName: string;
  inventoryNumber: string;
  acquisitionDate: string;
  acquisitionPrice: string;
  depreciationGroup: string;
  depreciationMethod: string;
  methods: Record<"straight" | "accelerated", string>;
  lowValue: string;
  lowValueNote: string;
  taxSeries: string;
  year: string;
  depreciation: string;
  residualValue: string;
  posted: string;
  internalMovement: string;
  amount: string;
  reason: string;
  transportAllowance: string;
  month: string;
  unitDays: string;
  unitMonths: string;
  createDocuments: string;
  documentCreated: string;
  yearClose: string;
  checks: string;
  confirm: string;
  confirmLabel: string;
  closeYear: string;
  blockedReason: string;
  result: string;
  resultSuccess: string;
  resultError: string;
  returnOutput: string;
  returnLine: string;
  description: string;
  carryForward: string;
  carryForwardStatus: Record<"not_started" | "ready" | "done" | "blocked", string>;
  carryForwardAction: string;
}
