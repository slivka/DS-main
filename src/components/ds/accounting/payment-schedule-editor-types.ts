/** Kontrakt kalendáře · vlastní původní texty a veřejné props · nesmí renderovat ani ukládat. */
import type { PaymentScheduleItem, PaymentScheduleParams } from "./payment-schedule";
import type { PaymentScheduleSaveAction } from "./payment-schedule-toolbar";
export type PaymentScheduleUser = { id: string; name: string };

export interface PaymentScheduleEditorTexts {
  dueDate: string;
  kind: string;
  amount: string;
  description: string;
  responsible: string;
  releasedDate: string;
  releasedBy: string;
  actions: string;
  installment: string;
  retention: string;
  total: string;
  unallocated: string;
  paid: string;
  remaining: string;
  add: string;
  remove: string;
  fillRest: string;
  generate: string;
  release: string;
  unrelease: string;
  empty: string;
  generateTitle: string;
  count: string;
  firstDueDate: string;
  interval: string;
  intervalMonth: string;
  intervalQuarter: string;
  intervalDays: string;
  days: string;
  retentionMode: string;
  retentionNone: string;
  retentionPercent: string;
  retentionAmount: string;
  retentionValue: string;
  retentionDueDate: string;
  preview: string;
  apply: string;
  cancel: string;
  overwriteTitle: string;
  overwriteText: string;
  overwriteConfirm: string;
  releaseTitle: string;
  releaseDateLabel: string;
  releaseConfirm: string;
  unreleaseTitle: string;
  unreleaseConfirm: string;
}

export const DEFAULT_PAYMENT_SCHEDULE_TEXTS: PaymentScheduleEditorTexts = {
  dueDate: "Datum platby",
  kind: "Typ",
  amount: "Částka",
  description: "Popis",
  responsible: "Odpovědná osoba",
  releasedDate: "Datum uvolnění",
  releasedBy: "Uvolnil",
  actions: "Akce",
  installment: "Splátka",
  retention: "Pozastávka",
  total: "Celkem",
  unallocated: "Zbývá rozepsat",
  paid: "Uhrazeno",
  remaining: "Zbývá",
  add: "Přidat",
  remove: "Smazat",
  fillRest: "Doplnit zbytek",
  generate: "Rozložit…",
  release: "Uvolnit pozastávku",
  unrelease: "Zrušit uvolnění",
  empty: "Platební kalendář je prázdný",
  generateTitle: "Rozložit na splátky",
  count: "Počet splátek",
  firstDueDate: "První splatnost",
  interval: "Interval",
  intervalMonth: "Měsíc",
  intervalQuarter: "Čtvrtletí",
  intervalDays: "Vlastní počet dní",
  days: "Počet dní",
  retentionMode: "Pozastávka",
  retentionNone: "Bez pozastávky",
  retentionPercent: "V procentech",
  retentionAmount: "Částkou",
  retentionValue: "Výše pozastávky",
  retentionDueDate: "Datum uvolnění pozastávky",
  preview: "Náhled",
  apply: "Použít",
  cancel: "Zrušit",
  overwriteTitle: "Přepsat platební kalendář?",
  overwriteText: "Neuvolněné položky budou nahrazeny vygenerovanými. Uvolněné pozastávky zůstanou.",
  overwriteConfirm: "Přepsat",
  releaseTitle: "Uvolnit pozastávku",
  releaseDateLabel: "Datum uvolnění",
  releaseConfirm: "Uvolnit",
  unreleaseTitle: "Zrušit uvolnění pozastávky?",
  unreleaseConfirm: "Zrušit uvolnění",
};

export interface PaymentScheduleEditorProps {
  items: PaymentScheduleItem[];
  onChange: (items: PaymentScheduleItem[]) => void;
  /** Částka k úhradě dokladu. */
  totalToPay: number;
  /** Uhrazeno – dodává aplikace, jen zobrazení. */
  paid?: number;
  /** Zbývá uhradit – dodává aplikace, jen zobrazení. */
  remaining?: number;
  users?: PaymentScheduleUser[];
  currencySymbol?: string;
  readOnly?: boolean;
  canRelease?: boolean;
  canUnrelease?: boolean;
  onRelease?: (itemId: string, date: string) => void;
  onUnrelease?: (itemId: string) => void;
  /** Volá se s parametry dialogu Rozložit (např. pro audit). Řádky editor vygeneruje sám. */
  onGenerate?: (params: PaymentScheduleParams) => void;
  texts?: Partial<PaymentScheduleEditorTexts>;
  /** Zoom; bez něj převezme okolní GridZoomContext, jinak 1. */
  zoom?: number;
  /** Uložení v liště; data a zápis vlastní APP. */
  saveAction?: PaymentScheduleSaveAction;
  className?: string;
}
