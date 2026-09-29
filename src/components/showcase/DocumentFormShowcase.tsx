import { useState } from "react";

import { ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import { DocumentForm, SegmentedField, type DocumentHeaderValue } from "@/components/ds";
import { Button } from "@/components/ui/button";
import { MOCK_ACCOUNTS, MOCK_BOOKS, MOCK_DIMENSIONS, MOCK_PARTNERS } from "@/lib/mock/accounting";

const CURRENCIES = [
  { code: "CZK", label: "Česká koruna", symbol: "Kč" },
  { code: "EUR", label: "Euro", symbol: "€" },
];

const BASE: DocumentHeaderValue = {
  bookId: "b-fv", number: "FV2026000420", accountingDate: "2026-09-29", issueDate: "2026-09-29",
  taxDate: "2026-09-29", dueDate: "2026-10-13", currency: "CZK", rate: 1, amountTotal: 24200,
  totalMode: "entered", mainAccountId: "311001", partnerId: "p1", description: "Konzultační služby",
};

const SCENARIOS = [
  { id: "po", title: "PO CZK – příjem", type: "PO", identity: { variant: "cashBank", book: "PO - Pokladna", period: "2026", account: { side: "MD", label: "211.001 - Pokladna CZK" }, number: "PO2026000118" }, value: { ...BASE, bookId: "b-pd", number: "PO2026000118", direction: "in", mainAccountId: "211001" }, directionBadge: "in", mainSide: "MD", mainAccountLocked: true },
  { id: "ba", title: "BA EUR – výdej", type: "BA", identity: { variant: "cashBank", book: "BA - Banka EUR", period: "2026", account: { side: "DAL", label: "221.002 - Běžný účet EUR" }, number: "BA2026000091" }, value: { ...BASE, bookId: "b-bv", number: "BA2026000091", direction: "out", currency: "EUR", rate: 24.38, rateManual: true, rateNote: "Kurz dle výpisu", amountTotal: 180, mainAccountId: "221002" }, directionBadge: "out", mainSide: "D", mainAccountLocked: true },
  { id: "fv", title: "FV CZK – účet lze změnit", type: "FV", identity: { variant: "invoice", book: "FV - Vydané faktury", period: "2026", account: { side: "MD", label: "311.001 - Odběratelé", editable: true }, number: "FV2026000420" }, value: BASE, mainSide: "MD" },
  { id: "fv-eur", title: "FV EUR – kurz a přepočet", type: "FV", identity: { variant: "invoice", book: "FV - Vydané faktury", period: "2026", account: { side: "MD", label: "311.001 - Odběratelé", editable: true }, number: "FV2026000421" }, value: { ...BASE, number: "FV2026000421", currency: "EUR", rate: 24.285, rateManual: true, rateNote: "Kurz dle smlouvy", amountTotal: 174.7 }, mainSide: "MD" },
  { id: "paired", title: "FV spárovaná – účet i měna zamčené", type: "FV", identity: { variant: "invoice", book: "FV - Vydané faktury", period: "2026", account: { side: "MD", label: "311.001 - Odběratelé", editable: true, disabledReason: "Doklad je spárovaný, nejdřív zrušte párování" }, number: "FV2026000419" }, value: { ...BASE, number: "FV2026000419" }, mainSide: "MD", currencyDisabledReason: "Doklad je spárovaný, nejdřív zrušte párování" },
  { id: "fp", title: "FP – pevný účet", type: "FP", identity: { variant: "invoice", book: "FP - Přijaté faktury", period: "2026", account: { side: "DAL", label: "321.001 - Dodavatelé" }, number: "FP2026000712" }, value: { ...BASE, bookId: "b-fp", number: "FP2026000712", mainAccountId: "321001" }, mainSide: "D", mainAccountLocked: true },
  { id: "zfv", title: "ZFV – bez hlavního účtu", type: "ZFV", identity: { variant: "invoice", book: "ZFV - Zálohové faktury vydané", period: "2026", number: "ZFV2026000018" }, value: { ...BASE, number: "ZFV2026000018", mainAccountId: null }, mainSide: "MD" },
  { id: "id", title: "ID – interní doklad", type: "ID", identity: { variant: "internal", book: "ID - Interní doklady", period: "2026", number: "ID2026000031" }, value: { ...BASE, bookId: "b-id", number: "ID2026000031", mainAccountId: null, amountTotal: 0, totalMode: "sum" } },
] as const;

export function DocumentFormShowcase() {
  const [fontSize, setFontSize] = useState<"0.8125" | "1" | "1.125">("1");
  const [narrow, setNarrow] = useState(false);
  const [values, setValues] = useState<Record<string, DocumentHeaderValue>>(() => Object.fromEntries(SCENARIOS.map((scenario) => [scenario.id, scenario.value])));
  const common = { books: MOCK_BOOKS, accounts: MOCK_ACCOUNTS, mainAccountOptions: MOCK_ACCOUNTS, partners: MOCK_PARTNERS, dimensions: MOCK_DIMENSIONS, currencies: CURRENCIES, homeCurrency: "CZK", homeCurrencySymbol: "Kč", lines: [], onLinesChange: () => {} };

  return <ShowcaseSection title="Jednotný identifikační řádek dokladů" description="Osm stavů dokladu při běžné i úzké šířce a při osobním nastavení velikosti písma.">
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="w-[18rem]"><SegmentedField ariaLabel="Velikost písma" label="Velikost písma" value={fontSize} onChange={setFontSize} options={[{ value: "0.8125", label: "0,8125" }, { value: "1", label: "1" }, { value: "1.125", label: "1,125" }]} /></div>
      <Button type="button" variant={narrow ? "default" : "outline"} onClick={() => setNarrow((current) => !current)}>Úzká šířka</Button>
    </div>
    <div className={narrow ? "grid grid-cols-1 gap-6 @min-[75rem]:grid-cols-3" : "space-y-8"} style={{ fontSize: `${fontSize}rem` }}>
      {SCENARIOS.map((scenario) => <DocumentForm key={scenario.id} {...common} title={scenario.title} documentType={scenario.type} identity={scenario.identity} directionBadge={scenario.directionBadge} mainSide={scenario.mainSide} mainAccountLocked={scenario.mainAccountLocked} currencyDisabledReason={scenario.currencyDisabledReason} value={values[scenario.id] ?? scenario.value} onChange={(next) => setValues((current) => ({ ...current, [scenario.id]: next }))} />)}
    </div>
  </ShowcaseSection>;
}