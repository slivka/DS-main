/** Data záloh · vlastní typované vstupy APP · nesmí počítat účetní ani daňové vztahy. */
import type { LinkedRecordsPanelProps } from "../../data-display/linked-records-panel";
import type { SettlementRow } from "../../data-display/linked-record-types";
/** Stav pokrytí daňovým dokladem, určený aplikací. */
export type AdvanceTaxStatus = "missing" | "partial" | "issued" | "notIssued";
/** Jednotlivé oprávnění akce. */
export interface AdvancePermission {
  /** Akce je povolena. */ can: boolean;
  /** Vysvětlení zakázání. */ reason?: string;
}
/** Jedna řízená akce. */
export interface AdvanceCommand extends AdvancePermission {
  /** Aplikace otevře příslušný postup. */ onClick: () => void;
}
/** Roviny zálohy používají původní seznam vazeb a jeho navigaci. */
export interface AdvancePaymentPlane {
  /** Již zmapované souhrny měn. */ settlement: SettlementRow[];
  /** Řízené vazby, oprávnění a otevření. */ links: Omit<LinkedRecordsPanelProps, "settlement">;
}
/** Částky souhrnu, v jedné měně, připravené APP. */
export interface AdvancePaymentTotals {
  /** Platba. */ amount: number;
  /** Přiřazeno ZL. */ listAmount: number;
  /** Stornovaný zbytek ZL. */ cancelled: number;
  /** Část bez ZL. */ withoutList: number;
  /** Pokrytí DD. */ taxAmount: number;
  /** DD nebude. */ noTaxDocument: number;
  /** Chybějící DD. */ withoutTaxDocument: number;
  /** Vyúčtování. */ deducted: number;
  /** Vrácení. */ refunded: number;
  /** Zbývající část. */ remaining: number;
}
/** Důvod a doplňující text bez daňového rozhodování v DS. */
export interface AdvanceReasonValue {
  /** Klíč důvodu. */ reason: string;
  /** Vysvětlení. */ note: string;
}
/** Kandidát přiřazení připravený aplikací. */
export interface AdvanceAllocationCandidate {
  /** Stálý klíč. */ id: string;
  /** Titulek dokladu. */ document: string;
  /** Zbývající dostupná částka cíle. */ remaining: number;
  /** Výchozí min(zbývá platby, zbývá cíle) dodává APP. */ defaultAmount: number;
}
/** Řízená přiřazovaná částka. */
export interface AdvanceAllocation {
  /** Klíč kandidáta. */ id: string;
  /** Potvrzená částka. */ amount: number | null;
}
/** Akce odečtu. */
export type AdvanceDeductionAction = "linkTaxDocument" | "matchPayment" | "remove";
/** Zmapovaný odečet; stav, daň a platbu určuje APP. */
export interface AdvanceDeductionRow {
  /** Stálé id. */ id: string;
  /** Variabilní symbol. */ vs: string;
  /** Formátovaný kód DPH. */ vatCode: string;
  /** Základ. */ base: number;
  /** Daň. */ vat: number;
  /** Celkem. */ total: number;
  /** Popisek stavu párování. */ payment: string;
  /** Navázaný DD. */ taxDocument?: string;
  /** Stav odečtu. */ status: "open" | "closed";
  /** Proč je odečet otevřený. */ openReason?: string;
  /** Práva jednotlivých akcí. */ permissions?: Partial<
    Record<AdvanceDeductionAction, AdvancePermission>
  >;
}
/** Položka evidence, včetně zůstatků a lhůty z APP. */
export interface AdvanceRegisterRow {
  /** Stálý klíč. */ id: string;
  /** Partner. */ partner: string;
  /** VS. */ vs: string;
  /** ISO datum. */ paidAt: string;
  /** Měna z dat. */ currency: string;
  /** Částka. */ amount: number;
  /** Uhrazený ZL. */ paidList: number;
  /** Pokryto DD. */ coveredTaxDocument: number;
  /** Odečteno. */ deducted: number;
  /** Zbývá. */ remaining: number;
  /** Stav DD. */ taxStatus: AdvanceTaxStatus;
  /** ISO lhůta. */ deadline: string;
  /** Po lhůtě podle APP. */ overdue: boolean;
  /** Bez DD podle APP. */ withoutDD: boolean;
}
/** Návrh řádku opravného DD z APP. */
export interface AdvanceCorrectionRow {
  /** Klíč. */ id: string;
  /** Popis. */ document: string;
  /** Základ. */ base: number;
  /** DPH. */ vat: number;
}
