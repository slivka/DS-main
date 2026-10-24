/** Výkazy · vlastní jazykový kontrakt · nesmí počítat hodnoty výkazů. */
export interface StatementTexts {
  kinds: Record<"balance" | "income", string>;
  /** Jednotky; `{currency}` nahradí měna z dat APP. */
  units: Record<"full" | "thousands", string>;
  unitsLabel: string;
  mark: string;
  name: string;
  rounded: string;
  checksLabel: string;
  checks: Record<"balance" | "profit", string>;
  checkOk: string;
  checkFailed: string;
  difference: string;
  editValue: string;
  savedTitle: string;
  newFromLedger: string;
  open: string;
  rename: string;
  duplicate: string;
  deleteConfirm: string;
  kind: string;
  period: string;
  savedBy: string;
  savedAt: string;
  emptySaved: string;
  saveTitle: string;
  templateTitle: string;
  addRow: string;
  removeRow: string;
  moveUp: string;
  moveDown: string;
  dragHandle: string;
  rowType: string;
  rowTypes: Record<"sum" | "mapped", string>;
  mapping: string;
  mappingAll: string;
  mappingItems: string;
  parent: string;
  noParent: string;
}
