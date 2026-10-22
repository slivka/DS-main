/** Evidence záloh se záložkami · vlastní typy obálky dat z APP · DS nic nepočítá ani nepáruje. */
import type { AdvanceTaxStatus } from "./advance-types";

/** Záložky evidence. */
export type AdvanceRegisterTab = "balance" | "payments" | "settlements";
/** Druh řádku z DB: položka, mezisoučet partnera, mezisoučet účtu, kontrola účtu. */
export type AdvanceRegisterRowKind =
  | "detail"
  | "partner_total"
  | "account_total"
  | "account_control";
/** Filtr stavu záložky Platby záloh. */
export type AdvancePaymentsFilter = "all" | "unsettled" | "withoutTaxDocument" | "overdue";
/** Filtr stavu záložky Vyúčtování záloh. */
export type AdvanceSettlementsFilter = "all" | "unmatched";

/** Řádek obálky z APP; skupiny drží pořadí z dat, součty jsou hotové hodnoty. */
export interface AdvanceRegisterViewRow {
  /** Stálý klíč. */ id: string;
  /** Druh řádku z DB. */ rowKind: AdvanceRegisterRowKind;
  /** Číslo účtu (uložená podoba, např. 324100). */ account: string;
  /** Název účtu. */ accountName?: string;
  /** Partner (u partner_total klíč skupiny). */ partner?: string;
  /** Zůstatek: platba nebo odečet. */ kind?: "payment" | "deduction";
  /** Číslo dokladu. */ document?: string;
  /** VS. */ vs?: string;
  /** ISO datum (platby nebo účetního případu). */ date?: string;
  /** Měna z dat. */ currency?: string;
  /** Částka v měně. */ amount?: number;
  /** Částka v domácí měně. */ amountHome?: number;
  /** Zůstatek v měně. */ balance?: number;
  /** Zůstatek v domácí měně. */ balanceHome?: number;
  /** Důvod. */ reason?: string;
  /** Uhrazený ZL. */ paidList?: number;
  /** Pokryto DD. */ coveredTaxDocument?: number;
  /** Vyúčtováno. */ deducted?: number;
  /** Vráceno. */ refunded?: number;
  /** Zbývá. */ remaining?: number;
  /** Stav DD. */ taxStatus?: AdvanceTaxStatus;
  /** ISO lhůta. */ deadline?: string;
  /** Po lhůtě podle APP. */ overdue?: boolean;
  /** Základ. */ base?: number;
  /** DPH. */ vat?: number;
  /** Spárováno. */ matched?: number;
  /** Nespárováno. */ unmatched?: number;
  /** Kontrola: zůstatek účtu z deníku. */ ledgerBalance?: number;
  /** Kontrola: součet evidence. */ registerBalance?: number;
  /** Kontrola: rozdíl (nenulový = varování). */ difference?: number;
}

/** Obálka dat jedné záložky z DB. */
export interface AdvanceRegisterData {
  /** Řádky aktuální stránky včetně součtových řádků. */ rows: AdvanceRegisterViewRow[];
  /** Celkový součet nezávislý na stránce. */ totals?: Partial<AdvanceRegisterViewRow>;
  /** Počet položek pro stránkování. */ total_count: number;
}

/** Řízené filtry všech záložek. */
export interface AdvanceRegisterViewFilters {
  /** Platby záloh. */ payments: AdvancePaymentsFilter;
  /** Vyúčtování záloh. */ settlements: AdvanceSettlementsFilter;
  /** Vybrané účty; prázdné = všechny. */ accounts: string[];
}

/** Řízené stránkování podle total_count. */
export interface AdvanceRegisterPagination {
  /** Aktuální stránka od 1. */ page: number;
  /** Velikost stránky (0 = vše). */ pageSize: number;
  /** APP přenačte stránku. */ onPageChange: (page: number) => void;
  /** APP změní velikost stránky. */ onPageSizeChange: (size: number) => void;
}

/** Účet nabízený ve filtru. */
export interface AdvanceRegisterAccountOption {
  /** Uložená podoba. */ value: string;
  /** Název účtu. */ name: string;
}
