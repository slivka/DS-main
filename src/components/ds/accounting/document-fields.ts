/** Skupiny polí hlavičky dokladu, které se ukazují podle typu dokladu. */
export type DocumentFields = {
  taxDate: boolean;
  dueDate: boolean;
  externalNumber: boolean;
  partner: boolean;
  symbols: boolean;
  bankAccount: boolean;
  mainAccount: boolean;
  direction: boolean;
  rounding: boolean;
  paymentOrders: boolean;
};

/** Kódy typů dokladů s předvolbou polí. */
export type DocumentTypeCode = "ID" | "FV" | "FP" | "PO" | "BA" | "ZFV" | "ZFP" | "UZ";

const NONE: DocumentFields = {
  taxDate: false, dueDate: false, externalNumber: false, partner: false, symbols: false,
  bankAccount: false, mainAccount: false, direction: false, rounding: false, paymentOrders: false,
};

const PRESETS: Record<DocumentTypeCode, DocumentFields> = {
  ID: NONE,
  UZ: NONE,
  FV: { ...NONE, taxDate: true, dueDate: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, rounding: true },
  FP: { ...NONE, taxDate: true, dueDate: true, externalNumber: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, rounding: true, paymentOrders: true },
  ZFV: { ...NONE, dueDate: true, partner: true, symbols: true, bankAccount: true, mainAccount: true },
  ZFP: { ...NONE, dueDate: true, externalNumber: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, paymentOrders: true },
  PO: { ...NONE, taxDate: true, externalNumber: true, partner: true, mainAccount: true, direction: true, rounding: true },
  BA: { ...NONE, symbols: true, bankAccount: true, mainAccount: true, direction: true },
};

/** Výchozí viditelné skupiny polí pro typ dokladu (neznámý kód = interní doklad). */
export function documentFieldsForType(code: DocumentTypeCode | (string & {})): DocumentFields {
  return { ...(PRESETS[code.toUpperCase() as DocumentTypeCode] ?? NONE) };
}
