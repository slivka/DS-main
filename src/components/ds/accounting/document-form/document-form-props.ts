/**
 * Veřejné typy a výchozí texty formuláře dokladu.
 * Vlastní: datový kontrakt formuláře a kompatibilní české výchozí texty.
 * Nesmí: vykreslovat UI ani obsahovat stav formuláře.
 */
import type { FormIssue } from "../../../../lib/form-issues";

import type { ReactNode } from "react";

import type { VatStatus } from "../../data-display/vat-status-badge";
import type { AccountOption } from "../account-select";
import type { BankAccountOption } from "../bank-account-field";
import type { BookOption } from "../book-select";
import type { CurrencyOption } from "../currency-amount";
import type { DimensionOption } from "../dimension-select";
import type { DocumentFields, DocumentTypeCode } from "../document-fields";
import type { JournalLinesEditorProps } from "../journal-lines-editor";
import type { DocumentStatus } from "../document-status-badge";
import type { JournalLine } from "../journal-lines";
import type { PartnerOption } from "../partner-select";
import type { CounterpartySeed } from "../counterparty-field";
import type { ManualBankAccountErrors } from "../received-bank-account-field";
import type { IcoLinkTarget } from "../../form/ico-link";
import type { DocumentCounterpartyTabProps, DocumentPrintTabProps } from "../document-detail-tabs";

import type {
  DocumentDirection,
  DocumentIdentity,
  DocumentHeaderValue,
  DocumentHeaderField,
  DocumentSuggestConfig,
  DocumentAccountingDateLink,
  DocumentDateField,
  DocumentVatConfig,
  DocumentFormTab,
  DocumentSaveAction,
  DocumentPrimaryAction,
  DocumentMoreAction,
  DocumentSettingsAction,
  DocumentFormError,
} from "./document-form-values";
import type { DocumentFormTexts } from "./document-form-texts";
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
  /** Kurz DPH je stejný jako kurz dokladu – samostatné pole se nevykreslí. */
  sameAsDocument?: boolean;
}

export interface DocumentFormProps {
  title: string;
  /** Ovládání panelu v záhlaví okna mezi nabídkou a zavřením. */
  panelToggle?: ReactNode;
  /** Další stavové štítky bezprostředně za stavem dokladu. */
  titleBadges?: ReactNode;
  /** Doplňkové ovládání vlevo v liště, například RecordPanelTriggers. */
  actionBarContent?: ReactNode;
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
  onAddBankAccount?: (searchText: string) => void;
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
  /** FV/ZFV: důvod zakázání firemního účtu i KS/SS; hodnoty se nezobrazují ani nemažou. */
  companyBankAccountDisabledReason?: string;
  /** Způsob platby nepoužívá přijatý účet; má přednost před příkazem a nemaže hodnoty. */
  receivedAccountDisabledReason?: string;
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
  /** Kódy bank s názvy (bankovní pohyb): nabídka a pole „kód – název“, hledání podle obou. */
  bankCodeOptions?: Array<{ code: string; name: string }>;
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
  /** Tužka u vybraného partnera – otevře jeho kartu. */
  onEditCounterparty?: (partnerId: string) => void;
  icoLinkTarget?: IcoLinkTarget;
  handedOverBySuggest?: DocumentSuggestConfig;
  descriptionSuggest?: DocumentSuggestConfig;
  accountingDateLink?: DocumentAccountingDateLink;
  /** Výchozí vazba účetního data na vystavení; false ponechá samostatné datum. */
  accountingDateLinked?: boolean;
  /** Řízená změna výchozí vazby účetního data. */
  onAccountingDateLinkedChange?: (linked: boolean) => void;
  /** Výstraha duplicity daňového čísla v poli i společném pruhu. */
  taxDocumentNumberWarning?: string;
  /** Chyby jednotlivých polí; společně se zobrazí nad formulářem. */
  fieldErrors?: Partial<Record<DocumentHeaderField, string>>;
  /** Výstrahy jednotlivých polí; společně se zobrazí nad formulářem. */
  fieldWarnings?: Partial<Record<DocumentHeaderField, string>>;
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
  /** Řízená aktivní záložka spodní části formuláře. */
  activeDetailTab?: string;
  /** Změna aktivní záložky spodní části; bez řízené hodnoty pouze oznamuje změnu. */
  onActiveDetailTabChange?: (tabId: string) => void;
  status: DocumentStatus;
  approved?: boolean;
  changedBy?: string;
  changedAt?: string;
  saveAction?: DocumentSaveAction;
  /**
   * Ctrl/Cmd+Enter = Uložit a zavřít (bez tlačítka v liště; platí jen při povoleném uložení).
   * Aplikace zavře formulář až po úspěšném uložení; při chybě zůstává otevřený.
   */
  onSaveAndClose?: () => void;
  primaryAction?: DocumentPrimaryAction;
  moreActions?: DocumentMoreAction[];
  settings?: DocumentSettingsAction;
  error?: DocumentFormError;
  /**
   * Položky živého pruhu od aplikace (2.108.0): serverové se zobrazí vždy, klientské až při
   * `validationActive`. DS je deduplikuje; serverové mazat při změně pole je na aplikaci.
   */
  issues?: FormIssue[];
  /** Uložení selhalo – titulek „Doklad nelze uložit (N)“; jinak „Před zařazením doplňte (N)“. */
  saveFailed?: boolean;
  /** Klientské položky a červené rámečky až po prvním pokusu o uložení / zařazení; výchozí true. */
  validationActive?: boolean;
  /** Zavření pruhu položek ✕; bez callbacku si pruh zavření drží sám do změny seznamu. */
  onIssuesClose?: () => void;
  /**
   * Změna pole (i přepínače v poli: zámek data, VS, Σ). Hlavička: `document-klíč`;
   * buňka řádku: id buňky s `rowId` a `columnId`. Aplikace podle něj maže své serverové položky.
   */
  onFieldChange?: (fieldId: string, rowId?: string, columnId?: string) => void;
  /** Provozní informace pod chybou a nad bannerem jen pro čtení. */
  notices?: ReactNode;
  /** Pruh úpravy vzoru nad identitou, společný pro faktury i zálohové listy. */
  templateEdit?: import("../../templates/template-edit-banner").TemplateEditState;
  readOnly?: boolean;
  readOnlyReason?: ReactNode;
  readOnlyTitle?: ReactNode;
  readOnlyActions?: ReactNode;
  texts?: Partial<DocumentFormTexts>;
  className?: string;
}
