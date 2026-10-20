/**
 * Varianta zálohového listu (2.118.0, Zálohové listy B) – jen konfigurace sdíleného formuláře.
 * Vydaný ZL (ZFV) je varianta vydané faktury, přijatý ZL (ZFP) varianta přijaté faktury.
 * Vlastní: které sekce, pole a části DPH varianta skrývá, informativní text rekapitulace,
 *   stavy, které varianta nabízí, a konfiguraci štítku stavu úhrady.
 * Nesmí: kopírovat formulář ani počítat – rozdíly jsou jen props pro DocumentForm a editor řádků.
 */
import type { VatFiveTexts } from "../../../ds-texts/vat-five-texts";
import type { StatusConfig } from "../data-display/status-badge";
import { documentFieldsForType, type DocumentFields } from "./document-fields";
import type { JournalLinesVat } from "./journal-editor-types";

/** Typ zálohového listu. */
export type AdvanceListType = "ZFV" | "ZFP";

/** Stav úhrady zálohového listu. */
export type AdvancePaymentStatus = "unpaid" | "partial" | "paid" | "remainderCancelled";

/** Vstup varianty. */
export interface AdvanceListVariantInput {
  /** Typ dokladu. */
  type: AdvanceListType;
  /**
   * Plátce DPH: u ZFV firma, u ZFP dodavatel. `false` skryje údaje DPH úplně – řádky bez
   * kódu DPH a bez rekapitulace kódů.
   */
  vatPayer: boolean;
  /** Informativní text pod rekapitulací („Nejde o daňový doklad“). */
  recapNote: string;
}

/** Konfigurace varianty pro DocumentForm a JournalLinesEditor. */
export interface AdvanceListVariant {
  /** Viditelná pole hlavičky – bez DUZP / Data DPH a zaokrouhlení. */
  fields: DocumentFields;
  /** „Vstupuje do DPH“ ani Datum DPH se nezobrazí. */
  vatSectionVisible: false;
  /** Datum účetního případu se nezobrazí. */
  accountingDateVisible: false;
  /** Záložka Zaúčtování se nepřidává. */
  postingTab: false;
  /** Řádky bez MD / DAL. */
  withoutAccounts: true;
  /** Doplnění DPH editoru řádků (bez KH, s informativním textem); `null` = bez DPH. */
  linesVat: Pick<JournalLinesVat, "showKhSection" | "recapNote" | "overrideInMenu"> | null;
  /** Stavy, které varianta nabízí: Koncept → Zařazen a storno (zbytek se nenabízí). */
  statuses: readonly ["draft", "filed", "cancelled"];
}

/** Sestaví variantu zálohového listu ze sdílené konfigurace faktur. */
export function advanceListVariant(input: AdvanceListVariantInput): AdvanceListVariant {
  return {
    fields: { ...documentFieldsForType(input.type), taxDate: false, rounding: false },
    vatSectionVisible: false,
    accountingDateVisible: false,
    postingTab: false,
    withoutAccounts: true,
    linesVat: input.vatPayer
      ? { showKhSection: false, recapNote: input.recapNote, overrideInMenu: input.type === "ZFV" }
      : null,
    statuses: ["draft", "filed", "cancelled"],
  };
}

/** Konfigurace StatusBadge pro stav úhrady zálohového listu. */
export function advancePaymentStatusConfig(
  texts: Pick<
    VatFiveTexts,
    "paymentUnpaid" | "paymentPartial" | "paymentPaid" | "paymentRemainderCancelled"
  >,
): StatusConfig<AdvancePaymentStatus> {
  return {
    unpaid: { label: texts.paymentUnpaid, tone: "neutral" },
    partial: { label: texts.paymentPartial, tone: "warning" },
    paid: { label: texts.paymentPaid, tone: "success" },
    remainderCancelled: { label: texts.paymentRemainderCancelled, tone: "danger" },
  };
}
