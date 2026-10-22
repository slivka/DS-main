/** Formát tisku · vlastní zobrazení hotových hodnot · žádné daňové výpočty. */
import type { InvoicePrintData } from "./invoice-types";
/** Datum bez mezer, nezávislé na časovém pásmu. */
export function formatInvoiceDate(value?: string | null): string {
  if (!value) return "";
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : value.replace(/\s/g, "");
}
/** Černé částky, pravé mínus a oddělené tisíce. */
export function formatInvoiceAmount(value?: number | null): string {
  if (value == null) return "";
  return `${value < 0 ? "−" : ""}${Math.abs(value).toLocaleString("cs-CZ", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
/** Platební popisek; nejde o odvozování účetního stavu. */
export function invoiceUsesTotal(data: InvoicePrintData): boolean {
  return ["card", "cash", "offset"].includes(data.payment.method_kind);
}
/** Bezpečný název souboru bez adresářů. */
export function invoicePdfFilename(data: InvoicePrintData): string {
  const slug = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  return data.is_draft
    ? `koncept-${slug(data.title)}.pdf`
    : `${slug(data.title)}-${slug(data.number ?? "")}.pdf`;
}

/** Množství bez zbytečných nul; null je prázdné, zachová až čtyři desetinná místa. */
export function formatInvoiceQuantity(value: number | null, locale: "cs" | "sk" = "cs"): string {
  return value == null
    ? ""
    : value.toLocaleString(locale === "sk" ? "sk-SK" : "cs-CZ", { maximumFractionDigits: 4 });
}
/** Kurz má v obou tiskových sekcích stejný místní formát. */
export function formatInvoiceRate(value?: number | null, locale: "cs" | "sk" = "cs"): string {
  return value == null
    ? ""
    : value.toLocaleString(locale === "sk" ? "sk-SK" : "cs-CZ", { maximumFractionDigits: 6 });
}
