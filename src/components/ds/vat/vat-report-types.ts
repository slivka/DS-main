/** Přehledy DPH · vlastní datové kontrakty APP · nesmí provádět daňové výpočty. */
/** Oddíl přiznání podle tiskopisu DPHDP3. */
export type VatReturnSection = "I" | "II" | "III" | "IV" | "V" | "VI";
/** Řádek přiznání, částky hotové od APP. */
export interface VatReturnRow {
  /** Klíč řádku. */ key: string;
  /** Oddíl. */ section: VatReturnSection;
  /** Popis řádku. */ label: string;
  /** Základ. */ base?: number | null;
  /** Daň. */ tax?: number | null;
  /** Odpočet v plné výši (oddíl III). */ fullDeduction?: number | null;
  /** Krácený odpočet (oddíl III). */ reducedDeduction?: number | null;
  /** Počet dokladů. */ documentCount?: number;
}
/** Částky jedné sazby dodané APP. */
export interface VatRateAmounts {
  /** Sazba. */ rate: number;
  /** Základ. */ base: number;
  /** Daň. */ tax: number;
}
/** Oddíl KH. */
export type VatControlSection = "A1" | "A2" | "A4" | "A5" | "B1" | "B2" | "B3";
/** Doklad KH. */
export interface VatControlDocument {
  /** ID dokladu. */ id: string;
  /** DIČ ze snímku APP. */ dic: string;
  /** Evidenční číslo. */ number: string;
  /** ISO datum. */ date: string;
  /** Hotové základy a daně. */ rates: VatRateAmounts[];
  /** Kód režimu. */ regime?: string;
  /** Kód předmětu PDP. */ subjectCode?: string;
  /** Změna proti podanému snímku. */ changed?: boolean;
  /** Nesazbový základ bez sazby (oddíl A1); nikdy se nezobrazuje jako 21 %. */
  unratedBase?: number | null;
}
/** Data oddílu KH. */
export interface VatControlSectionData {
  /** Jednotlivé doklady. */ documents?: VatControlDocument[];
  /** Hotový souhrn APP. */ summary?: VatRateAmounts[];
}
/** Souhrnné hlášení. */
export interface VatRecapitulativeRow {
  /** Klíč. */ id: string;
  /** Kód země. */ country: string;
  /** DIČ. */ dic: string;
  /** Kód plnění. */ supplyCode: 0 | 1 | 2 | 3;
  /** Částka. */ amount: number;
}
/** Přehled OSS, částky v měně dodané APP. */
export interface OssReturnRow extends VatRateAmounts {
  /** Klíč. */ id: string;
  /** Stát spotřeby. */ country: string;
  /** Druh plnění dodaný APP. */ supplyLabel?: string;
  /** Období opravy, pokud jde o opravu. */ correctionPeriod?: string;
}
/** Období dodané aplikací. */
export interface VatPeriod {
  /** Počátek ISO. */ from: string;
  /** Konec ISO. */ to: string;
  /** Popisek včetně případného KH. */ label: string;
  /** Periodicita. */ kind: "month" | "quarter";
}
/** Druh formuláře. */
export type VatFilingForm = "return" | "control" | "recapitulative" | "oss";
/** Druh podání. */
export type VatFilingKind = "regular" | "corrective" | "additional" | "subsequent";
/** Údaje záhlaví exportu Excel/PDF dodané APP. */
export interface VatReportExportMeta {
  /** Období podání. */ period?: string;
  /** Firma. */ company?: string;
  /** Druh podání. */ filingKind?: string;
}
/** Společný stav přehledu: načítání, chyba a záhlaví exportu. */
export interface VatReportStateProps {
  /** Načítání – místo obsahu kostra. */ loading?: boolean;
  /** Zpráva chyby – pruh nad obsahem. */ error?: string | null;
  /** Záhlaví exportu. */ exportMeta?: VatReportExportMeta;
}
