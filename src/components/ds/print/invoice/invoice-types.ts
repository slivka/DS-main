/** Faktura z APP · vlastní datový kontrakt · nesmí počítat daně ani platby. */
import type { InvoicePrintTexts } from "../../../../ds-texts/invoice-print-texts";
/** Pět volitelných voleb předlohy tisku se společnými výchozími hodnotami. */
export interface InvoicePrintOptions {
  /** Platební kalendář. */ showPaymentSchedule?: boolean;
  /** Podrobný seznam záloh. */ showAdvanceDetail?: boolean;
  /** QR Platba. */ showQr?: boolean;
  /** Převzetí a razítko. */ showSignature?: boolean;
  /** Vystavující osoba v zápatí. */ showIssuedBy?: boolean;
  /** @deprecated Od 2.133.0 ignorováno; sekce určuje obsah dat. Odstranění v 3.0.0. */
  showHeader?: boolean;
  /** @deprecated Od 2.133.0 ignorováno; sekce určuje obsah dat. Odstranění v 3.0.0. */
  showFooter?: boolean;
  /** @deprecated Od 2.133.0 ignorováno; sekce určuje obsah dat. Odstranění v 3.0.0. */
  showVatRecap?: boolean;
  /** @deprecated Od 2.133.0 ignorováno; sekce určuje obsah dat. Odstranění v 3.0.0. */
  showNote?: boolean;
  /** @deprecated Od 2.133.0 ignorováno; sekce určuje obsah dat. Odstranění v 3.0.0. */
  showColumnHeadings?: boolean;
  /** @deprecated Od 2.133.0 ignorováno; sekce určuje obsah dat. Odstranění v 3.0.0. */
  showTotalsRow?: boolean;
}
/** Poštovní údaje snímku záznamu. */
export interface InvoicePrintAddress {
  /** Název. */ name: string;
  /** Ulice. */ street?: string | null;
  /** Číslo domu. */ house_number?: string | null;
  /** PSČ. */ zip?: string | null;
  /** Město. */ city?: string | null;
  /** Země. */ country?: string | null;
  /** IČO. */ ico?: string | null;
  /** DIČ. */ dic?: string | null;
}
/** Dodavatel včetně nahraného loga. */
export interface InvoicePrintIssuer extends InvoicePrintAddress {
  /** Právní forma dodaná APP. */ legal_form?: string | null;
  /** Spisová značka. */ registry_court_note?: string | null;
  /** Telefon. */ phone?: string | null;
  /** E-mail. */ email?: string | null;
  /** Web. */ website?: string | null;
  /** URL vyřešené aplikací; nikdy cesta k privátnímu úložišti bez oprávnění. */ logo_path?:
    | string
    | null;
  /** Data URI nebo URL nahraného obrázku. */ logo_image?: string | null;
  /** Logo již obsahuje název firmy. */ logo_contains_name?: boolean;
}
/** Platební údaje; APP dodá IBAN i konečnou částku. */
export interface InvoicePrintPayment {
  /** Popisek. */ method_name: string;
  /** Druh. */ method_kind: "transfer" | "card" | "cash" | "cod" | "offset";
  /** Zobrazit účet. */ uses_bank_account: boolean;
  /** Text značky platby. */ print_text?: string | null;
  /** VS. */ variable_symbol?: string | null;
  /** KS. */ constant_symbol?: string | null;
  /** SS. */ specific_symbol?: string | null;
  /** Číslo účtu. */ account_number?: string | null;
  /** Kód banky. */ bank_code?: string | null;
  /** IBAN. */ iban?: string | null;
  /** BIC. */ swift?: string | null;
  /** Měna dokladu. */ currency_code: string;
}
/** Položka s hotovým základem a daňovým režimem. */
export interface InvoicePrintLine {
  /** Popis. */ description: string;
  /** Množství; null vytiskne prázdnou buňku. */ quantity: number | null;
  /** MJ. */ unit?: string | null;
  /** Cena za MJ; null vytiskne prázdnou buňku. */ unit_price: number | null;
  /** Kód DPH. */ vat_code?: string | null;
  /** Sazba, null pro textový režim. */ vat_rate?: number | null;
  /** Text režimu. */ regime_text?: string | null;
  /** Základ. */ base: number;
}
/** Hotové součty, bez přepočtu v DS. */
export interface InvoicePrintTotals {
  /** Celkem. */ doc_total: number;
  /** Zaokrouhlení. */ rounding: number;
  /** Odečtené zálohy. */ advances_deducted: number;
  /** K úhradě. */ to_pay: number;
  /** Celkem před zálohami. */ total_before_advances: number;
  /** Celkem v domácí měně. */ total_home?: number | null;
  /** Kurz. */ rate?: number | null;
  /** Datum kurzu. */ rate_date?: string | null;
  /** Zdroj kurzu. */ rate_source?: string | null;
  /** Volitelný hotový součet základů před odečty; DS jej neodvozuje. */ base_total?: number | null;
  /** Volitelný hotový součet DPH před odečty; DS jej neodvozuje. */ vat_total?: number | null;
  /** Hotový text součtu DPH, např. odvede odběratel. */ vat_total_text?: string | null;
  /** Hotový součet daně v domácí měně pro větu přepočtu. */ vat_home?: number | null;
}
/** Rekapitulace dodaná APP, včetně odečtů. */
export interface InvoicePrintVatRow {
  /** Sazba. */ rate?: number | null;
  /** Režim. */ regime_text?: string | null;
  /** Základ. */ base: number;
  /** Daň. */ vat: number;
  /** Celkem. */ total: number;
  /** Základ domácí. */ base_home?: number | null;
  /** Daň domácí. */ vat_home?: number | null;
  /** Celkem domácí. */ total_home?: number | null;
}
/** Odečtená záloha včetně všech čísel; znaménka dodává APP. */
export interface InvoicePrintAdvance {
  /** Všechna čísla ZL. */ advance_list_numbers: string[];
  /** Číslo DD. */ tax_document_number: string | null;
  /** Datum úhrady. */ paid_on: string;
  /** VS. */ variable_symbol?: string | null;
  /** Základ nebo null bez DD. */ base: number | null;
  /** DPH nebo null bez DD. */ vat: number | null;
  /** Částka odečtu. */ amount: number;
}
/** Splátka hotového kalendáře. */
export interface InvoicePrintScheduleRow {
  /** Splatnost. */ due: string;
  /** Částka. */ amount: number;
}
/** Tiskové texty ze snímku dokladu. */
export interface InvoicePrintSettings {
  /** Úplné volby. */ options: InvoicePrintOptions;
  /** Nad položkami. */ header_text?: string | null;
  /** Pod položkami. */ footer_text?: string | null;
  /** Poznámka. */ note?: string | null;
  /** Vystavil. */ issued_by_name?: string | null;
  /** Telefon. */ issued_by_phone?: string | null;
  /** E-mail. */ issued_by_email?: string | null;
}
/** Výstup document_print_data, pouze vykreslení hotových hodnot. */
export interface InvoicePrintData {
  /** Druh dokumentu. */ kind:
    | "invoice"
    | "invoice_non_vat"
    | "advance"
    | "advance_tax"
    | "correction";
  /** Koncept. */ is_draft: boolean;
  /** Název z APP. */ title: string;
  /** Podnadpis. */ subtitle?: string | null;
  /** Číslo nebo null. */ number: string | null;
  /** Vystavení. */ date_issued: string;
  /** DUZP. */ date_tax?: string | null;
  /** Splatnost. */ date_due?: string | null;
  /** Objednávka odběratele. */ customer_order_ref?: string | null;
  /** Původní doklad opravy. */ original_number?: string | null;
  /** Důvod opravy. */ correction_reason?: string | null;
  /** Přijatá platba. */ payment_received_date?: string | null;
  /** Dodavatel. */ issuer: InvoicePrintIssuer;
  /** Odběratel. */ customer: InvoicePrintAddress;
  /** Dodání. */ delivery: (InvoicePrintAddress & { contact?: string | null }) | null;
  /** Platba. */ payment: InvoicePrintPayment;
  /** Položky. */ lines: InvoicePrintLine[];
  /** Součty. */ totals: InvoicePrintTotals;
  /** Rekapitulace. */ vat_recap: InvoicePrintVatRow[];
  /** Informativní DPH. */ informative: boolean;
  /** Povinné texty režimů. */ vat_texts: string[];
  /** Odečty. */ advances: InvoicePrintAdvance[];
  /** Splátky. */ schedule: InvoicePrintScheduleRow[];
  /** Tiskové údaje. */ print: InvoicePrintSettings;
}
/** Nastavení vykreslení, bez změny dat dokladu. */
export interface BuildInvoicePdfOptions {
  /** Jazyk tiskových popisků. */ locale?: "cs" | "sk";
  /** Překladové přepisy. */ texts?: Partial<InvoicePrintTexts>;
  /** Domácí měna pro tisk přepočtu. */ homeCurrency?: { code: string; symbol: string };
  /** Vyřešený nahraný obrázek (nikdy se negeneruje). */ logoImage?: string | null;
  /** Získání počtu stran pro ověření/APP. */ onPageCount?: (pages: number) => void;
}
