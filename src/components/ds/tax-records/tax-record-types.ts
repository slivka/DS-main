/** Kontrakty DE; APP dodává hotové zápisy, souhrny a kontrolní výsledky. */
export type BookkeepingMode = "accrual" | "tax_records";
export type TaxMovementKind = "non_cash_income" | "non_cash_expense" | "transfer";
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
  paragraph: "7" | "8" | "9" | "10";
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
