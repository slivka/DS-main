/**
 * Veřejné typy a výchozí texty formuláře dokladu.
 * Vlastní: datový kontrakt formuláře a kompatibilní české výchozí texty.
 * Nesmí: vykreslovat UI ani obsahovat stav formuláře.
 */

import type { FieldErrorLink } from "../../feedback/field-error-summary";
import type { ReactNode } from "react";
import type {
  RecordMoreAction,
  RecordPrimaryAction,
  RecordSaveAction,
} from "../../layout/record-action-bar";

import type { DocumentIdentityVariant } from "../document-fields";

import type { ManualBankAccountValue } from "../received-bank-account-field";

import type { DocumentPrintValue } from "../document-detail-tabs";

export type DocumentDirection = "in" | "out";

export type DocumentHeaderValue = {
  /** Identita dokladu; při změně formulář znovu odvodí paměť automatického VS. */
  id?: string | null;
  bookId?: string | null;
  number?: string | null;
  direction?: DocumentDirection | null;
  accountingDate?: string | null;
  issueDate?: string | null;
  taxDate?: string | null;
  vatDate?: string | null;
  vatRelevant?: boolean;
  dueDate?: string | null;
  externalNumber?: string | null;
  /** Vlastní číslo daňového dokladu při vypnuté vazbě. */
  taxDocumentNumber?: string | null;
  /** Číslo daňového dokladu sleduje číslo dokladu; výchozí true. */
  taxDocumentNumberLinked?: boolean;
  /**
   * VS je svázaný s číslem daňového dokladu (FP/ZFP/DDPOZ/FV/ZFV/DDPZ). Zamčený VS DS jen
   * zobrazuje jako náhled; aplikace ho do DB neposílá (variable_symbol_auto). Výchozí: svázáno,
   * když je VS prázdný nebo shodný s odvozeným.
   */
  variableSymbolLinked?: boolean;
  /** Režim protiúčtu bankovního pohybu. */
  bankAccountKind?: "domestic" | "iban";
  /** Kód banky oddělený od českého čísla účtu. */
  bankCode?: string | null;
  /** IBAN protiúčtu pohybu. */
  bankIban?: string | null;
  /** SWIFT protiúčtu pohybu. */
  bankSwift?: string | null;
  partnerId?: string | null;
  counterpartyName?: string | null;
  counterpartyIco?: string | null;
  counterpartyDic?: string | null;
  /** Země protistrany v ručním režimu (kód ISO); řídí tvar IČO. */
  counterpartyCountry?: string | null;
  handedOverBy?: string | null;
  variableSymbol?: string | null;
  constantSymbol?: string | null;
  specificSymbol?: string | null;
  /** Reference platby (E2E) u zahraničního protiúčtu; nahrazuje KS a SS. */
  paymentReference?: string | null;
  bankAccount?: string | null;
  /** Identifikátor vybraného účtu partnera. */
  partnerBankAccountId?: string | null;
  /** Identifikátor účtu vlastní firmy. */
  companyBankAccountId?: string | null;
  /** Identifikátor způsobu platby. */
  paymentMethodId?: string | null;
  description?: string | null;
  currency: string;
  rate?: number | null;
  rateInfo?: string | null;
  rateManual?: boolean;
  /** Zdroj kurzu vyžaduje upozornění ikonou (starší nebo vlastní kurz). */
  rateSourceAttention?: boolean;
  /** Zdroj kurzu DPH vyžaduje upozornění ikonou. */
  vatRateSourceAttention?: boolean;
  rateNote?: string | null;
  suggestedRate?: number | null;
  suggestedRateInfo?: string | null;
  amountTotal: number;
  totalMode: "entered" | "sum";
  roundingAmount?: number | null;
  mainAccountId?: string | null;
  /** Ručně zadaný účet přijatého dokladu. */
  manualBankAccount?: ManualBankAccountValue;
  /** Tiskové údaje uložené s dokladem. */
  print?: DocumentPrintValue;
};

export type DocumentHeaderField = keyof DocumentHeaderValue;
export type DocumentFormTab = { id: string; label: string; content: ReactNode; badge?: ReactNode };
export type DocumentSaveAction = RecordSaveAction;
export type DocumentPrimaryAction = RecordPrimaryAction;
export type DocumentMoreAction = RecordMoreAction;
export type DocumentSettingsAction = { onOpen: () => void };
export type DocumentFormError = {
  title?: string;
  message: ReactNode;
  onClose?: () => void;
  /** Odkazy na chybná pole (max 5 + „a další N“); klik fokusuje pole i v řádku mřížky. */
  fieldErrors?: FieldErrorLink[];
  /** Vlastní výběr pole ze souhrnu. */
  onFieldErrorSelect?: (link: FieldErrorLink) => void;
};
export interface DocumentIdentity {
  variant: DocumentIdentityVariant;
  book: string;
  period: string;
  account?: { side: "MD" | "DAL"; label: string; editable?: boolean; disabledReason?: string };
  number?: string | null;
  numberPending?: string;
}
export type DocumentSuggestConfig = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  load: (query: string) => Promise<string[]>;
};
export type DocumentAccountingDateLink = {
  locked: boolean;
  onToggle: (locked: boolean) => void;
  hint?: string;
  /** Tooltip odemčeného zámku (např. „Svázat s datem pohybu“ u bankovního pohybu). */
  unlockedHint?: string;
};
export type DocumentDateField = "issueDate" | "accountingDate" | "taxDate" | "dueDate" | "vatDate";
export type DocumentVatConfig = {
  visible: boolean;
  relevantReadOnly?: boolean;
  periodLabel?: string;
  periodFiled?: boolean;
  dateLink?: {
    /** Stálý název vazby, výchozí DocumentForm.vatDateLinkLabel. */
    label?: string;
    locked: boolean;
    onToggle: (locked: boolean) => void;
    lockedHint?: string;
    unlockedHint?: string;
  };
  dateLockReadOnly?: boolean;
  filedWarning?: string;
};

/** Vytvoří VS ze všech číslic čísla dokladu; neplatná délka návrh nevytvoří. */
export function vsFromDocumentNumber(text: string): string | null {
  const digits = text.replace(/\D/g, "");
  return digits.length > 0 && digits.length <= 10 ? digits : null;
}
