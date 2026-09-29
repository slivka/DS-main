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
  handedOverBy: boolean;
};

/** Kódy typů dokladů s předvolbou polí. */
export type DocumentTypeCode = "ID" | "FV" | "FP" | "PO" | "BA" | "ZFV" | "ZFP" | "DDPZ" | "DDPOZ" | "KR" | "ZAP" | "UZ";

/** Popisek hlavního účtu podle druhu dokladu. */
export function mainAccountLabelForType(code: DocumentTypeCode | string): string {
  const labels: Partial<Record<DocumentTypeCode, string>> = {
    PO: "Účet pokladny",
    BA: "Účet banky",
    FV: "Účet pohledávky",
    FP: "Účet závazku",
    ZFV: "Účet přijaté zálohy",
    ZFP: "Účet poskytnuté zálohy",
    DDPZ: "Účet pohledávky",
    DDPOZ: "Účet závazku",
  };
  return labels[code.toUpperCase() as DocumentTypeCode] ?? "Hlavní účet";
}

/** Popisek partnera podle druhu a směru dokladu. */
export function partnerLabelForType(code: DocumentTypeCode | string, _direction?: "in" | "out" | null): string {
  const normalized = code.toUpperCase();
  if (normalized === "FV" || normalized === "ZFV") return "Odběratel";
  if (normalized === "FP" || normalized === "ZFP") return "Dodavatel";
  return "Partner";
}

const NONE: DocumentFields = {
  taxDate: false, dueDate: false, externalNumber: false, partner: false, symbols: false,
  bankAccount: false, mainAccount: false, direction: false, rounding: false, paymentOrders: false, handedOverBy: false,
};

const PRESETS: Record<DocumentTypeCode, DocumentFields> = {
  ID: NONE,
  UZ: NONE,
  KR: NONE,
  ZAP: NONE,
  FV: { ...NONE, taxDate: true, dueDate: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, rounding: true },
  FP: { ...NONE, taxDate: true, dueDate: true, externalNumber: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, rounding: true, paymentOrders: true },
  ZFV: { ...NONE, dueDate: true, partner: true, symbols: true, bankAccount: true, mainAccount: true },
  ZFP: { ...NONE, dueDate: true, externalNumber: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, paymentOrders: true },
  DDPZ: { ...NONE, taxDate: true, dueDate: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, rounding: true },
  DDPOZ: { ...NONE, taxDate: true, dueDate: true, externalNumber: true, partner: true, symbols: true, bankAccount: true, mainAccount: true, rounding: true, paymentOrders: true },
  PO: { ...NONE, taxDate: true, externalNumber: true, partner: true, mainAccount: true, direction: true, rounding: true, handedOverBy: true },
  BA: { ...NONE, symbols: true, bankAccount: true, partner: true, mainAccount: true, direction: true },
};

/** Výchozí viditelné skupiny polí pro typ dokladu (neznámý kód = interní doklad). */
export function documentFieldsForType(code: DocumentTypeCode | (string & {})): DocumentFields {
  return { ...(PRESETS[code.toUpperCase() as DocumentTypeCode] ?? NONE) };
}
