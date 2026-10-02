/**
 * Veřejné typy a výchozí texty formuláře dokladu.
 * Vlastní: datový kontrakt formuláře a kompatibilní české výchozí texty.
 * Nesmí: vykreslovat UI ani obsahovat stav formuláře.
 */
import type { ReactNode } from "react";
import type {
  RecordMoreAction,
  RecordPrimaryAction,
  RecordSaveAction,
} from "../../layout/record-action-bar";
import type { VatStatus } from "../../data-display/vat-status-badge";
import type { AccountOption } from "../account-select";
import type { BankAccountOption } from "../bank-account-field";
import type { BookOption } from "../book-select";
import type { CurrencyOption } from "../currency-amount";
import type { DimensionOption } from "../dimension-select";
import type { DocumentFields, DocumentIdentityVariant, DocumentTypeCode } from "../document-fields";
import type { JournalLinesEditorProps } from "../journal-lines-editor";
import type { DocumentStatus } from "../document-status-badge";
import type { JournalLine } from "../journal-lines";
import type { PartnerOption } from "../partner-select";
import type { CounterpartySeed } from "../counterparty-field";
import type {
  ManualBankAccountErrors,
  ManualBankAccountValue,
} from "../received-bank-account-field";
import type { IcoLinkTarget } from "../../form/ico-link";
import type {
  DocumentCounterpartyTabProps,
  DocumentPrintTabProps,
  DocumentPrintValue,
} from "../document-detail-tabs";

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
  partnerId?: string | null;
  counterpartyName?: string | null;
  counterpartyIco?: string | null;
  counterpartyDic?: string | null;
  handedOverBy?: string | null;
  variableSymbol?: string | null;
  constantSymbol?: string | null;
  specificSymbol?: string | null;
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
export type DocumentFormError = { title?: string; message: ReactNode; onClose?: () => void };
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
};
export type DocumentDateField = "issueDate" | "accountingDate" | "taxDate" | "dueDate" | "vatDate";
export type DocumentVatConfig = {
  visible: boolean;
  relevantReadOnly?: boolean;
  periodLabel?: string;
  periodFiled?: boolean;
  dateLink?: {
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

export type DocumentFormTexts = {
  headerSection: string;
  datesSection: string;
  paymentSection: string;
  propertiesSection: string;
  rateSection: string;
  currencySection: string;
  periodHint: string;
  amountSection: string;
  amountOnlySection: string;
  book: string;
  period: string;
  number: string;
  numberPending: string;
  direction: string;
  directionIn: string;
  directionOut: string;
  status: string;
  approved: string;
  yes: string;
  no: string;
  accountingDate: string;
  issueDate: string;
  taxDate: string;
  vatRelevant: string;
  vatDate: string;
  dueDate: string;
  externalNumber: string;
  supplierNumber: string;
  supplierTaxDocumentNumber: string;
  documentNumberTooLongForVs: string;
  partner: string;
  ico: string;
  dic: string;
  handedOverByIn: string;
  handedOverByOut: string;
  invalidIco: string;
  variableSymbol: string;
  constantSymbol: string;
  specificSymbol: string;
  bankAccount: string;
  description: string;
  currency: string;
  rate: string;
  vatRate: string;
  vatRateSameAsDocument: string;
  vatRateNote: string;
  vatRateMissing: string;
  amountTotal: string;
  totalHome: string;
  amountSum: string;
  sumFromLines: string;
  rounding: string;
  vatDateLockedHint: string;
  filedWarning: string;
  excludeFromPaymentOrders: string;
  linesTab: string;
  changedBy: string;
  changedAt: string;
  settings: string;
  rateNote: string;
  manualRate: string;
  rateNoteRequired: string;
  errorTitle: string;
  closeError: string;
  changeAccount: string;
  currencyDisabled: string;
  mainAccountSelect: string;
  bankAccountInvalid: string;
  bankCodeInvalid: string;
  otherBankAccount: string;
  selectFromDirectory: string;
  enterManually: string;
  replaceManualCounterparty: string;
  payByOrder: string;
  paymentOrderDisabled: string;
  payToBankAccount: string;
};

export const DEFAULT_DOCUMENT_FORM_TEXTS: DocumentFormTexts = {
  headerSection: "Základní údaje",
  datesSection: "Datumy",
  paymentSection: "Platební údaje",
  propertiesSection: "Vlastnosti dokladu",
  rateSection: "Kurz dokladu",
  currencySection: "Měna",
  periodHint: "Období se řídí datem účetního případu",
  amountSection: "Částka dokladu",
  amountOnlySection: "Částka",
  book: "Kniha",
  period: "Období",
  number: "Číslo dokladu",
  numberPending: "Koncept – číslo při zařazení",
  direction: "Směr",
  directionIn: "Příjem",
  directionOut: "Výdej",
  status: "Stav",
  approved: "Schváleno",
  yes: "Ano",
  no: "Ne",
  accountingDate: "Datum účetního případu",
  issueDate: "Datum vystavení",
  taxDate: "DUZP",
  vatRelevant: "Vstupuje do DPH",
  vatDate: "Datum DPH",
  dueDate: "Splatnost",
  externalNumber: "Externí číslo",
  supplierNumber: "Číslo dokladu dodavatele",
  supplierTaxDocumentNumber: "Číslo daňového dokladu",
  documentNumberTooLongForVs: "Číslo má víc než 10 číslic – VS doplňte ručně",
  partner: "Partner",
  ico: "IČO",
  dic: "DIČ",
  handedOverByIn: "Přijato od",
  handedOverByOut: "Vyplaceno komu",
  invalidIco: "IČO neprošlo kontrolou CZ – zkontrolujte ho.",
  variableSymbol: "Variabilní symbol",
  constantSymbol: "Konstantní symbol",
  specificSymbol: "Specifický symbol",
  bankAccount: "Bankovní účet",
  description: "Popis",
  currency: "Měna",
  rate: "Kurz",
  vatRate: "Kurz DPH",
  vatRateSameAsDocument: "stejný jako kurz dokladu",
  vatRateNote: "Důvod ručního kurzu DPH",
  vatRateMissing: "Kurz ČNB k DUZP není k dispozici – zadejte ruční kurz s důvodem.",
  amountTotal: "Celkem za doklad",
  totalHome: "Celkem v {symbol}",
  amountSum: "Celkem za doklad",
  sumFromLines: "Sčítá se z rozpisu",
  rounding: "Zaokrouhlení",
  vatDateLockedHint: "Daň na výstupu patří do období DUZP",
  filedWarning: "Období je podané – doklad půjde do dodatečného přiznání",
  excludeFromPaymentOrders: "Nezahrnovat do platebních příkazů",
  linesTab: "Řádky",
  changedBy: "Změnil",
  changedAt: "Změněno",
  settings: "Nastavení…",
  rateNote: "Důvod ručního kurzu",
  manualRate: "Ruční kurz",
  rateNoteRequired: "Uveďte důvod ručního kurzu.",
  errorTitle: "Doklad nelze uložit",
  closeError: "Zavřít chybovou hlášku",
  changeAccount: "Změnit účet",
  currencyDisabled: "Měnu nelze změnit",
  mainAccountSelect: "Hlavní účet",
  bankAccountInvalid: "Číslo účtu není platné.",
  bankCodeInvalid: "Kód banky není platný.",
  otherBankAccount: "Jiný účet",
  selectFromDirectory: "Vybrat z adresáře",
  enterManually: "Zadat ručně",
  replaceManualCounterparty: "Ručně zadané údaje budou nahrazeny údaji partnera",
  payByOrder: "Platit příkazem",
  paymentOrderDisabled: "Doklad se nezahrnuje do platebních příkazů",
  payToBankAccount: "Uhradit na bankovní účet",
};

/** Kurz DPH – stejný prvek jako kurz dokladu (automatický / ruční s důvodem). */
export interface DocumentVatRateField {
  value: number | null;
  onChange: (next: { rate?: number | null; manual?: boolean; note?: string | null }) => void;
  manual?: boolean;
  note?: string | null;
  suggestedRate?: number | null;
  suggestedInfo?: string;
  rateAmount?: number;
  readOnly?: boolean;
  /** Kurz DPH je stejný jako kurz dokladu – zobrazí se jen text. */
  sameAsDocument?: boolean;
}

export interface DocumentFormProps {
  title: string;
  /** Další stavové štítky bezprostředně za stavem dokladu. */
  titleBadges?: ReactNode;
  description?: ReactNode;
  identity?: DocumentIdentity;
  directionBadge?: DocumentDirection;
  value: DocumentHeaderValue;
  onChange: (value: DocumentHeaderValue) => void;
  lines: JournalLine[];
  onLinesChange: (lines: JournalLine[]) => void;
  books: BookOption[];
  accounts: AccountOption[];
  /** Účty povolené pro změnu hlavního účtu přímo v identifikačním řádku. */
  mainAccountOptions?: AccountOption[];
  partners?: PartnerOption[];
  dimensions?: DimensionOption[];
  currencies?: CurrencyOption[];
  /** Účty nabídnuté aplikací. Pole samo výchozí účet nikdy nepředvyplňuje. */
  bankAccountOptions?: BankAccountOption[];
  /** Konstantní symboly nabídnuté bez volného zadání. */
  constantSymbolOptions?: Array<{ value: string; label: string }>;
  /** Způsoby platby; bez propu se pole nezobrazí. */
  paymentMethodOptions?: Array<{ value: string; label: string }>;
  /** Firemní účty vydaných dokladů. */
  companyBankAccountOptions?: Array<{
    id: string;
    label: string;
    account: string;
    currency: string;
    isDefault?: boolean;
  }>;
  /** Založí nový účet partnera z výběru přijatého dokladu. */
  onAddBankAccount?: () => void;
  /** Zvolený způsob zadání protistrany. */
  counterpartyInput?: "partner" | "manual";
  /** Změna způsobu zadání protistrany. */
  onCounterpartyInputChange?: (mode: "partner" | "manual") => void;
  /** Důvod zamčení způsobu zadání protistrany. */
  counterpartyInputLockedReason?: string;
  /** Zda se přijatý doklad zahrne do platebních příkazů. */
  paymentOrderEnabled?: boolean;
  /** Změna zahrnutí přijatého dokladu do platebních příkazů. */
  onPaymentOrderEnabledChange?: (enabled: boolean) => void;
  /** Doklad používá domácí měnu. */
  isHomeCurrency?: boolean;
  /** Hlášení chyb ručně zadaného účtu. */
  onManualBankAccountValidationChange?: (errors: ManualBankAccountErrors) => void;
  /** Důvod zakázání firemního účtu; hodnota se v tomto stavu nezobrazuje. */
  companyBankAccountDisabledReason?: string;
  /** Stav plátce DPH zobrazený v pruhu akcí. */
  vatPartnerStatus?: {
    status: VatStatus;
    checkedAt?: string;
    unreliableSince?: string | Date | null;
  };
  /** Hotová záložka odběratele; zobrazí se jen u vydaného dokladu. */
  counterpartyTab?: Omit<DocumentCounterpartyTabProps, "partnerId" | "readOnly">;
  /** Hotová záložka tiskových údajů; zobrazí se jen u vydaného dokladu. */
  printTab?: Omit<DocumentPrintTabProps, "readOnly">;
  /** Povolené čtyřmístné kódy bank pro kontrolu ručně zadaného účtu. */
  bankCodes?: string[];
  documentType?: DocumentTypeCode | string;
  fields?: Partial<DocumentFields>;
  editableFields?: DocumentHeaderField[];
  isNew?: boolean;
  mainSide?: "MD" | "D";
  mainAccountLocked?: boolean;
  rateAmount?: number;
  homeCurrency: string;
  homeCurrencySymbol?: string;
  currencyLocked?: boolean;
  /** Důvod, proč měnu nelze změnit; zobrazí se v tooltipu zakázaného výběru. */
  currencyDisabledReason?: string;
  onCreatePartner?: (seed: CounterpartySeed) => void;
  icoLinkTarget?: IcoLinkTarget;
  handedOverBySuggest?: DocumentSuggestConfig;
  descriptionSuggest?: DocumentSuggestConfig;
  accountingDateLink?: DocumentAccountingDateLink;
  dateWarnings?: Partial<Record<DocumentDateField, string>>;
  vat?: DocumentVatConfig;
  /** Kurz DPH pod kurzem dokladu (jen u cizí měny, jen když jej aplikace předá). */
  vatRateField?: DocumentVatRateField;
  linesEditorProps?: Partial<
    Omit<
      JournalLinesEditorProps,
      | "lines"
      | "onChange"
      | "accounts"
      | "partners"
      | "dimensions"
      | "mode"
      | "mainSide"
      | "mainAccount"
    >
  >;
  roundingLimit?: number;
  roundingLabel?: string;
  tabs?: DocumentFormTab[];
  status: DocumentStatus;
  approved?: boolean;
  changedBy?: string;
  changedAt?: string;
  saveAction?: DocumentSaveAction;
  primaryAction?: DocumentPrimaryAction;
  moreActions?: DocumentMoreAction[];
  settings?: DocumentSettingsAction;
  error?: DocumentFormError;
  /** Provozní informace pod chybou a nad bannerem jen pro čtení. */
  notices?: ReactNode;
  readOnly?: boolean;
  readOnlyReason?: ReactNode;
  readOnlyTitle?: ReactNode;
  readOnlyActions?: ReactNode;
  texts?: Partial<DocumentFormTexts>;
  className?: string;
}
