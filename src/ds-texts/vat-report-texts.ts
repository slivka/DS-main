/** Přehledy DPH · vlastní jazykový kontrakt · nesmí počítat daně. */
export interface VatReportTexts {
  returnTitle: string; controlTitle: string; recapitulativeTitle: string; ossTitle: string;
  sections: Record<"I" | "II" | "III" | "IV" | "V", string>;
  row: string; base: string; tax: string; documents: string; difference: string;
  liability: string; excess: string; dic: string; number: string; date: string;
  regime: string; subject: string; rate: string; country: string; supply: string;
  amount: string; changed: string; checks: string; all: string;
  severity: Record<"error" | "warning" | "info", string>;
  openDocument: string; period: string; filingKind: string;
  states: Record<"open" | "filed" | "changed", string>;
  kinds: Record<"regular" | "corrective" | "additional" | "subsequent", string>;
  create: string; download: string; markFiled: string; additional: string;
  subsequent: string; unlock: string; unlockDescription: string; reason: string;
  tabs: string;
}
