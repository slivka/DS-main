/**
 * Typy bankovních komponent.
 * Vlastní: veřejné datové kontrakty rozpisu, napojení, pravidel a plateb.
 * Nesmí: obsahovat doménovou logiku rozpoznání ani párování.
 */
import type { BookkeepingMode } from "../tax-records/tax-record-types";

/** Stav rozpoznání pohybu. */
export type BankReconcileStatus = "certain" | "suggestion" | "unrecognized" | "filed";

/** Zdroj rozpoznání pohybu. */
export type BankReconcileSource = "openItem" | "ownAccount" | "partnerAccount" | "rule";

/** Kandidát úhrady dodaný aplikací. */
export interface BankReconcileCandidate {
  /** Stabilní klíč. */
  id: string;
  /** Popisek, např. číslo dokladu. */
  label: string;
  /** Částka kandidáta. */
  amount: number;
  /** Zbývající část k úhradě. */
  remaining: number;
  /** Splatnost v ISO formátu. */
  dueDate?: string | null;
}

/** Návrh rozpoznání pohybu. */
export interface BankReconcileSuggestion {
  /** Navržený účet / položka (kód). */
  accountCode?: string | null;
  /** Navržený partner (id). */
  partnerId?: string | null;
  /** Kandidáti úhrady. */
  candidates?: readonly BankReconcileCandidate[];
  /** Předvybraný kandidát. */
  candidateId?: string | null;
}

/** Pohyb výpisu – převzaté údaje jsou neměnné, uživatel doplňuje účetnictví. */
export interface BankMovementRow {
  /** Stabilní klíč. */
  id: string;
  /** Pořadí na výpise. */
  order: number;
  /** Datum pohybu v ISO formátu. */
  date: string;
  /** Směr pohybu. */
  direction: "in" | "out";
  /** Částka v měně výpisu, kladná. */
  amount: number;
  /** Měna pohybu. */
  currency: string;
  /** Protiúčet (formátovaný). */
  counterAccount?: string | null;
  /** Název protistrany. */
  counterpartyName?: string | null;
  /** Variabilní symbol. */
  vs?: string | null;
  /** Konstantní symbol. */
  ks?: string | null;
  /** Specifický symbol. */
  ss?: string | null;
  /** Zpráva pro příjemce / název. */
  message?: string | null;
  /** Druh pohybu. */
  kind?: "normal" | "fee" | "interest" | "card" | "reversal";
  /** Stav rozpoznání. */
  status: BankReconcileStatus;
  /** Zdroj rozpoznání. */
  source?: BankReconcileSource | null;
  /** Návrh rozpoznání. */
  suggestion?: BankReconcileSuggestion | null;
  /** Doplněný účet / položka. */
  accountCode?: string | null;
  /** Doplněný partner. */
  partnerId?: string | null;
  /** Doplněná kategorie. */
  categoryId?: string | null;
  /** Doplněný popis. */
  description?: string | null;
  /** Id zařazeného dokladu (pro Otevřít doklad). */
  documentId?: string | null;
}

/** Pruh importu nad gridem. */
export type BankImportInfo =
  | {
      kind: "file";
      /** Datum importu (zobrazený text). */
      date: string;
      /** Název souboru. */
      file: string;
      /** Stažení originálu. */
      onDownload?: () => void;
      /** Zrušení importu (potvrzení s důvodem řeší aplikace). */
      onCancel?: () => void;
    }
  | {
      kind: "api";
      /** Datum a čas stažení (zobrazený text). */
      date: string;
      /** Počet nových pohybů. */
      newCount: number;
    };

/** Souhrn výpisu ve spodní liště. */
export interface BankReconcileSummary {
  /** Počáteční zůstatek. */
  opening: number;
  /** Příjmy. */
  income: number;
  /** Výdaje (kladné). */
  expense: number;
  /** Konečný zůstatek. */
  closing: number;
  /** Zůstatek na výpise dle banky. */
  bankClosing: number;
  /** Značka měny. */
  currencySymbol: string;
}

/** Stav spojení s bankou. */
export type BankConnectionStatus = "active" | "tokenError" | "error" | "paused" | "disconnected";

/** Hodnota napojení knihy na banku. */
export interface BankConnectionValue {
  /** Způsob napojení. */
  method: "manual" | "fio";
  /** Token je uložen; hodnota se nikdy nezobrazí. */
  tokenSaved: boolean;
  /** Datum uložení tokenu (zobrazený text). */
  tokenSavedAt?: string | null;
  /** Kdo token uložil. */
  tokenSavedBy?: string | null;
  /** Druh tokenu. */
  tokenKind?: "read" | "payments";
  /** Token platí do (ISO). */
  tokenValidTo?: string | null;
  /** Denní čas stahování, např. „06:00“. */
  fetchTime: string;
  /** Častěji v pracovní dny. */
  fetchWorkdays: boolean;
  /** Stahovat od (ISO). */
  fetchFrom: string;
  /** Stav spojení. */
  status: BankConnectionStatus;
  /** Poslední chyba (zobrazený text). */
  lastError?: string | null;
  /** Čas posledního úspěchu (zobrazený text). */
  lastSuccess?: string | null;
}

/** Podmínky pravidla účtování banky; vyplněné se kombinují A ZÁROVEŇ. */
export interface BankRuleConditions {
  /** Směr pohybu; prázdné = obě. */
  direction?: "in" | "out" | null;
  /** Protiúčet nebo IBAN. */
  counterAccount?: string;
  /** Variabilní symbol. */
  vs?: string;
  /** Konstantní symbol. */
  ks?: string;
  /** Specifický symbol. */
  ss?: string;
  /** Text zprávy nebo názvu obsahuje. */
  textContains?: string;
  /** Druh pohybu. */
  movementKind?: "normal" | "fee" | "interest" | "card" | "reversal" | null;
  /** Částka od. */
  amountFrom?: number | null;
  /** Částka do. */
  amountTo?: number | null;
  /** Knihy; prázdné = všechny. */
  bookIds?: readonly string[];
}

/** Výsledek pravidla. */
export interface BankRuleResult {
  /** Účet (kód). */
  accountCode?: string | null;
  /** Partner (id). */
  partnerId?: string | null;
  /** Kategorie (id). */
  categoryId?: string | null;
  /** Popis se zástupnými značkami. */
  description?: string;
  /** Nedaňový. */
  nonTax?: boolean;
  /** Jistota výsledku. */
  certainty: "certain" | "suggestion";
}

/** Pravidlo účtování banky. */
export interface BankRule {
  /** Stabilní klíč. */
  id: string;
  /** Pořadí (1..n). */
  order: number;
  /** Název. */
  name: string;
  /** Podmínky. */
  conditions: BankRuleConditions;
  /** Výsledek. */
  result: BankRuleResult;
  /** Aktivní. */
  active: boolean;
  /** Zkrácený text podmínek (dodává APP). */
  conditionsText?: string;
  /** Zkrácený text výsledku (dodává APP). */
  resultText?: string;
  /** Popisky knih (dodává APP); prázdné = všechny. */
  bookLabels?: readonly string[];
}

/** Závazek k úhradě v dávce plateb. */
export interface PaymentOrderRow {
  /** Stabilní klíč. */
  id: string;
  /** Název partnera. */
  partnerName: string;
  /** Číslo dokladu. */
  documentNumber: string;
  /** Splatnost (ISO). */
  dueDate: string;
  /** Částka dokladu. */
  amount: number;
  /** Zbývá uhradit. */
  remaining: number;
  /** Měna (kód). */
  currency: string;
  /** Značka měny. */
  currencySymbol: string;
  /** Vybraný účet partnera (id z číselníku). */
  partnerAccountId?: string | null;
  /** Variabilní symbol. */
  vs?: string | null;
  /** Konstantní symbol. */
  ks?: string | null;
  /** Specifický symbol. */
  ss?: string | null;
  /** Zpráva pro příjemce. */
  message?: string | null;
  /** Datum úhrady (ISO). */
  paymentDate: string;
  /** Účet je po splatnosti (APP). */
  overdue?: boolean;
  /** Kontroly řádku (APP; severity error blokuje). */
  checks?: readonly { id: string; severity: "error" | "warning"; title: string }[];
}

/** Účet partnera v číselníku dávky. */
export interface PaymentPartnerAccount {
  /** Stabilní klíč. */
  id: string;
  /** Popisek účtu (formátovaný). */
  label: string;
}

/** Stav dávky plateb. */
export type PaymentBatchStatus =
  | "created"
  | "downloaded"
  | "sent"
  | "partial"
  | "paid"
  | "cancelled";

/** Dávka plateb v seznamu. */
export interface PaymentBatch {
  /** Stabilní klíč. */
  id: string;
  /** Datum vytvoření (zobrazený text). */
  date: string;
  /** Kdo vytvořil. */
  author: string;
  /** Banka / název souboru. */
  target: string;
  /** Počet plateb. */
  count: number;
  /** Částka (zobrazený text včetně měny). */
  amount: string;
  /** Stav. */
  status: PaymentBatchStatus;
}

/** Režim evidence pro účetní sloupce rozpisu. */
export type BankBookkeepingMode = BookkeepingMode;
