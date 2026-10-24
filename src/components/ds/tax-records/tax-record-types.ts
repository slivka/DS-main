/** Kontrakty DE; APP dodává hotové zápisy, souhrny a kontrolní výsledky. */
export type BookkeepingMode = "accrual" | "tax_records";
export type TaxMovementKind = "non_cash_income" | "non_cash_expense" | "transfer";
export type TaxBookEntryKind =
  | "payment"
  | "advance"
  | "advance_tax_document"
  | "advance_deduction"
  | "non_cash"
  | "offset";
export type TaxTreatment = "taxable" | "non_tax" | "transit";
export interface TaxBookEntry {
  id: string;
  date: string;
  paymentDocumentId: string;
  paymentDocument: string;
  invoiceId?: string;
  invoice?: string;
  itemId?: string;
  item: string;
  treatment: TaxTreatment;
  taxCategoryId?: string;
  taxCategory?: string;
  categoryId?: string;
  category?: string;
  amount: number;
  currency: string;
  movementAmount: number;
  vat: number;
  nonCash?: boolean;
  unassigned?: boolean;
  /** Typ zápisu (DE-4); bez hodnoty se sloupec nezobrazí. */
  kind?: TaxBookEntryKind;
  /** Základ rozpočtené úhrady od APP; s `vat` tvoří Celkem = `amount`. */
  base?: number;
}
export interface TaxBookFilters {
  from?: string;
  to?: string;
  itemId?: string;
  treatment?: TaxTreatment;
  categoryId?: string;
}
export interface TaxCategoryRow {
  id: string;
  label: string;
  paragraph: "7" | "8" | "9" | "10" | "";
  income: number;
  expense: number;
  /** Výsledek, procento a strop dodává APP; DS je nepřepočítává. */
  percentage?: number;
  cap?: number;
  calculatedExpense?: number;
}
export interface CashCheckRow {
  id: string;
  label: string;
  currency: string;
  opening: number;
  movements: number;
  closing: number;
  difference: number;
}
/** Položka DE pro výběr; technické účty se vyřadí. */
export interface TaxItemOption {
  id: string;
  label: string;
  displayCode?: string;
  technical?: boolean;
}
/** Daňová řada majetku DE (DE-5); hodnoty počítá APP. */
export interface TaxAssetYear {
  year: number;
  depreciation: number;
  residualValue: number;
  posted?: boolean;
  documentId?: string;
}
export interface TaxAsset {
  name: string;
  inventoryNumber?: string;
  acquisitionDate?: string;
  acquisitionPrice: number;
  depreciationGroup?: string;
  method?: "straight" | "accelerated";
  lowValue?: boolean;
  series: TaxAssetYear[];
}
export interface TaxInternalMovementValue {
  kind: TaxMovementKind;
  itemId?: string | null;
  fromItemId?: string | null;
  toItemId?: string | null;
  amount?: string | number | null;
  reason?: string;
}
/** Buňka paušálu (měsíc × vozidlo); částku dodává APP. */
export interface TransportAllowanceCell {
  monthId: string;
  vehicleId: string;
  count?: number | null;
  amount?: number | null;
  documentId?: string;
}
export interface TaxYearCheck {
  id: string;
  title: string;
  detail?: string;
  /** blocking = brání uzavření, info = jen informuje, ok = splněno. */
  severity: "blocking" | "info" | "ok";
  actionLabel?: string;
  onAction?: () => void;
}
export interface TaxReturnLine {
  id: string;
  line: string;
  label: string;
  amount: number;
  itemIds?: string[];
}
export type TaxCarryForwardStatus = "not_started" | "ready" | "done" | "blocked";
