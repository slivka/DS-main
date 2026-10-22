/** Texty záloh · vlastní veřejný textový kontrakt · nesmí obsahovat výpočty. */
/** Překlady sdílených částí záloh. */
export interface AdvanceTexts {
  /** Popisek breakdown. */
  breakdown: string;
  /** Popisek amount. */
  amount: string;
  /** Popisek lists. */
  lists: string;
  /** Popisek listAmount. */
  listAmount: string;
  /** Popisek cancelled. */
  cancelled: string;
  /** Popisek withoutList. */
  withoutList: string;
  /** Popisek taxDocuments. */
  taxDocuments: string;
  /** Popisek taxAmount. */
  taxAmount: string;
  /** Popisek noTaxDocument. */
  noTaxDocument: string;
  /** Popisek withoutTaxDocument. */
  withoutTaxDocument: string;
  /** Popisek deducted. */
  deducted: string;
  /** Popisek refunded. */
  refunded: string;
  /** Popisek remaining. */
  remaining: string;
  /** Popisek assignList. */
  assignList: string;
  /** Popisek cancelRemainder. */
  cancelRemainder: string;
  /** Popisek issueTaxDocument. */
  issueTaxDocument: string;
  /** Popisek markNoTaxDocument. */
  markNoTaxDocument: string;
  /** Popisek reason. */
  reason: string;
  /** Popisek note. */
  note: string;
  /** Popisek confirm. */
  confirm: string;
  /** Popisek missing. */
  missing: string;
  /** Popisek partial. */
  partial: string;
  /** Popisek issued. */
  issued: string;
  /** Popisek notIssued. */
  notIssued: string;
  /** Popisek deadline. */
  deadline: string;
  /** Popisek overdue. */
  overdue: string;
  /** Popisek allocate. */
  allocate: string;
  /** Popisek allocation. */
  allocation: string;
  /** Popisek document. */
  document: string;
  /** Popisek available. */
  available: string;
  /** Popisek assigned. */
  assigned: string;
  /** Popisek allocationExceeded. */
  allocationExceeded: string;
  /** Popisek deductions. */
  deductions: string;
  /** Popisek vs. */
  vs: string;
  /** Popisek vatCode. */
  vatCode: string;
  /** Popisek base. */
  base: string;
  /** Popisek vat. */
  vat: string;
  /** Popisek total. */
  total: string;
  /** Popisek payment. */
  payment: string;
  /** Popisek taxDocument. */
  taxDocument: string;
  /** Popisek status. */
  status: string;
  /** Popisek open. */
  open: string;
  /** Popisek closed. */
  closed: string;
  /** Popisek addAdvance. */
  addAdvance: string;
  /** Popisek manualDeduction. */
  manualDeduction: string;
  /** Popisek linkTaxDocument. */
  linkTaxDocument: string;
  /** Popisek matchPayment. */
  matchPayment: string;
  /** Popisek remove. */
  remove: string;
  /** Popisek register. */
  register: string;
  /** Popisek partner. */
  partner: string;
  /** Popisek paidAt. */
  paidAt: string;
  /** Popisek currency. */
  currency: string;
  /** Popisek paidList. */
  paidList: string;
  /** Popisek coveredTaxDocument. */
  coveredTaxDocument: string;
  /** Popisek taxStatus. */
  taxStatus: string;
  /** Popisek withoutDD. */
  withoutDD: string;
  /** Popisek corrective. */
  corrective: string;
  /** Popisek create. */
  create: string;
  /** Popisek doNotCreate. */
  doNotCreate: string;
  /** Popisek empty. */
  empty: string;
  /** Popisek blocked. */
  blocked: string;
  /** Popisek actions. */
  actions: string;
  /** Split tlačítko odečtu v liště řádků. */
  deductionAdd: string;
  /** Položka nabídky výběru zálohy. */
  deductionPick: string;
  /** Položka nabídky ručního odečtu. */
  deductionManual: string;
  /** Rozbalit detail odečtu. */
  deductionDetail: string;
  /** Součet položek bez odečtů. */
  itemsTotal: string;
  /** Součet odečtených záloh. */
  deductedTotal: string;
  /** Částka k úhradě. */
  toPayTotal: string;
  /** Řádek součtu podle kódu DPH v rekapitulaci. */
  totalByCode: string;
  /** Důvod odebrání odečtu v potvrzení. */
  removeReason: string;
  /** Souhrn přiřazení již formátovaných částek. */
  allocationSummary: (assigned: string, total: string) => string;
  /** Lhůta dodaná aplikací. */
  deadlineDays: (days: number) => string;
}
