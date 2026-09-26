import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ReportsShowcase } from "@/components/showcase/ReportsShowcase";
import { DocumentFormShowcase } from "@/components/showcase/DocumentFormShowcase";
import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  BookSelect,
  CurrencyAmount,
  DimensionSelect,
  JournalLinesEditor,
  PartnerSelect,
  VsField,
  fromJournalRow,
  toJournalRow,
  type JournalLine,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { formatAmount } from "@/lib/format";
import {
  MOCK_ACCOUNTS,
  MOCK_BOOKS,
  MOCK_DIMENSIONS,
  MOCK_PARTNERS,
} from "@/lib/mock/accounting";

export const Route = createFileRoute("/components/accounting-forms")({
  head: () => ({
    meta: [
      { title: "Účetní formuláře – Slivka Design System" },
      {
        name: "description",
        content:
          "Editor dokladu, řádky zápisu, výběr partnera, knihy a zakázky, částka v měně a stromová mřížka osnovy.",
      },
      { property: "og:title", content: "Účetní formuláře – Slivka Design System" },
      {
        property: "og:description",
        content:
          "Editor dokladu, řádky zápisu, výběr partnera, knihy a zakázky, částka v měně a stromová mřížka osnovy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AccountingFormsPage,
});

const CURRENCIES = [
  { code: "CZK", label: "Česká koruna", symbol: "Kč" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "USD", label: "Americký dolar" },
];


function AccountingFormsPage() {
  const [lines, setLines] = useState<JournalLine[]>([
    {
      id: "l1",
      debitAccount: "518001",
      creditAccount: "321001",
      amount: 3000,
      text: "Servisní práce",
      dimensionId: "d-cz-1",
      vs: "2026000012",
      partnerId: "p1",
    },
    {
      id: "l2",
      debitAccount: "518002",
      creditAccount: "321001",
      amount: 1800,
      text: "Nájem prostor",
      dimensionId: "d-rezie",
      vs: "2026000012",
      partnerId: "p1",
    },
  ]);

  const [partnerId, setPartnerId] = useState<string>("p2");
  const [bookId, setBookId] = useState<string>("b-fv");
  const [dimensionId, setDimensionId] = useState<string>("d-cz-2");
  const [vs, setVs] = useState("2026000345");
  const [amount, setAmount] = useState(125400.5);
  const [rate, setRate] = useState(24.815);
  const [currency, setCurrency] = useState("EUR");
  const [currencyLines, setCurrencyLines] = useState<JournalLine[]>([
    {
      id: "fx1", debitAccount: "518001", creditAccount: "321001",
      currency: "EUR", foreignAmount: 100, rate: 25.12, amount: 2512,
      text: "Licence v EUR", dimensionId: "d-cz-1", partnerId: "p1", vs: "2026000042",
    },
  ]);
  const [postedLines, setPostedLines] = useState<JournalLine[]>([
    { id: "posted1", debitAccount: "518002", creditAccount: "321001", amount: 9800, text: "Zaúčtovaný nájem", dimensionId: "d-rezie" },
  ]);
  const [validationLines, setValidationLines] = useState<JournalLine[]>([
    { id: "invalid1", debitAccount: "518001", creditAccount: "321001", amount: 1200, text: "Chybí povinné údaje" },
  ]);
  const [splitLines, setSplitLines] = useState<JournalLine[]>([
    {
      id: "id1", debitAccount: "518001", creditAccount: "321001", amount: 4200,
      text: "Přeúčtování služeb", debitVs: "2026000501", creditVs: "2026000777",
      debitPartnerId: "p1", creditPartnerId: "p2",
      debitDimensionId: "d-cz-1", creditDimensionId: "d-rezie", nonTax: true,
    },
    {
      id: "id2", debitAccount: "521001", creditAccount: "321001", amount: 1800,
      text: "Mzdové náklady", debitVs: "2026000502", creditVs: "2026000778",
      debitPartnerId: "p3", creditPartnerId: "p2",
      debitDimensionId: "d-cz-2", creditDimensionId: "d-rezie",
    },
  ]);
  const [cashLines, setCashLines] = useState<JournalLine[]>([
    { id: "pd1", debitAccount: "211001", creditAccount: "602001", amount: 3500, text: "Tržba v hotovosti", vs: "2026000091", partnerId: "p2", dimensionId: "d-cz-1" },
    { id: "pd-r", debitAccount: "211001", creditAccount: "648001", amount: 0.5, text: "Zaokrouhjení", isRounding: true },
  ]);
  const [internalLines, setInternalLines] = useState<JournalLine[]>([
    {
      id: "in1", debitAccount: "511001", creditAccount: "321001", amount: 12500,
      text: "Oprava výrobní haly", debitDimensionId: "d-cz-1",
      creditVs: "2026000601", creditPartnerId: "p1",
    },
    {
      id: "in2", debitAccount: "311100", creditAccount: "311200", amount: 8400,
      text: "Přeúčtování pohledávky", debitVs: "2026000602", creditVs: "2026000603",
      debitPartnerId: "p2", creditPartnerId: "p3",
    },
    {
      id: "in3", debitAccount: "513001", creditAccount: "211001", amount: 1900,
      text: "Reprezentace – obchodní jednání", nonTax: true, debitDimensionId: "d-rezie",
    },
  ]);
  const [invoiceLines, setInvoiceLines] = useState<JournalLine[]>([
    {
      id: "fp1", debitAccount: "518001", creditAccount: "321001", amount: 10000,
      text: "Servisní služby", debitDimensionId: "d-cz-2", creditVs: "2026000712", creditPartnerId: "p1",
    },
    {
      id: "fp2", debitAccount: "343001", creditAccount: "321001", amount: 2100,
      text: "DPH 21 %", creditVs: "2026000712", creditPartnerId: "p1",
    },
    {
      id: "fp3", debitAccount: "548001", creditAccount: "321001", amount: 0.4,
      text: "Haléřové vyrovnání", isRounding: true,
    },
  ]);
  const [bankLines, setBankLines] = useState<JournalLine[]>([
    {
      id: "bv1", debitAccount: "221002", creditAccount: "311200", amount: 24800,
      currency: "EUR", foreignAmount: 1000, rate: 24.8,
      text: "Úhrada faktury v EUR", creditVs: "2026000603", creditPartnerId: "p3",
    },
  ]);
  const roundtrip = fromJournalRow(toJournalRow(lines[0] ?? { id: "x", amount: 0 }));

  return (
    <ShowcaseLayout
      breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Účetní formuláře" }]}
    >
      <DocumentFormShowcase />

      <ShowcaseSection
        title="Řádky zápisu v Kč"
        description="Psaní začne úpravu, F2 nebo dvojklik zachová hodnotu. Enter a Tab uloží a pokračují, Esc vrátí původní hodnotu. Ctrl+D duplikuje a Ctrl+Delete odebere řádek."
      >
        <JournalLinesEditor
          lines={lines}
          onChange={setLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          totalAmount={4800}
          sideFields="shared"
          storageKey="showcase-journal-czk"
          defaults={{ text: "Servisní práce za leden 2026", vs: "2026000012", partnerId: "p1" }}
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
        <p className="mt-2 text-xs text-muted-foreground" data-testid="journal-roundtrip">
          {`Jedna předkontace = jeden databázový řádek; zpětný převod vrací částku ${formatAmount(roundtrip.amount, 2)}.`}
        </p>
      </ShowcaseSection>

      <ShowcaseSection
        title="Řádky v cizí měně"
        description="Částka v Kč se po změně částky v měně nebo kurzu automaticky přepočítá a lze ji následně přepsat."
      >
        <JournalLinesEditor
          lines={currencyLines}
          onChange={setCurrencyLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          documentCurrency="EUR" documentCurrencySymbol="€"
          homeCurrency="CZK" homeCurrencySymbol="Kč"
          rate={25.12}
          totalAmount={2512}
          sideFields="shared"
          storageKey="showcase-journal-currency"
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Interní doklad – oddějené strany"
        description="Režim split zobrazuje VS, partnera i zakázku zvlášť pro stranu MD a DAL."
      >
        <JournalLinesEditor
          lines={splitLines}
          onChange={setSplitLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          sideFields="split"
          totalAmount={6000}
          storageKey="showcase-journal-split"
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
      </ShowcaseSection>

      <ShowcaseSection
        title="Pokladní doklad – hlavní účet 211 na MD"
        description="Strana hlavního účtu je jen pro čtení, zadává se pouze protiúčet. Řádek zaokrouhjení je vždy poslední a bez akcí."
      >
        <JournalLinesEditor
          lines={cashLines}
          onChange={setCashLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          mode="mainAccount" mainSide="MD" mainAccount="211001"
          sharedSide="credit"
          totalAmount={3500.5}
          sideFields="shared"
          storageKey="showcase-journal-cash"
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
      </ShowcaseSection>

      <ShowcaseSection
        title="Zaúčtovaný doklad"
        description="U zaúčtovaného dokladu zůstávají upravitelné pouze text, VS, partner, zakázka a příznak Nedaňový."
      >
        <JournalLinesEditor
          lines={postedLines}
          onChange={setPostedLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          editableFields={["text", "vs", "partnerId", "dimensionId", "nonTax"]}
          totalAmount={9800}
          sideFields="shared"
          storageKey="showcase-journal-posted"
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
      </ShowcaseSection>

      <ShowcaseSection
        title="Validace buněk"
        description="Vestavěná kontrola hlídá účty a nenulovou částku; aplikace přidává vlastní účetní pravidla."
      >
        <JournalLinesEditor
          lines={validationLines}
          onChange={setValidationLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          validate={(line) => ({
            vs: line.vs ? undefined : "Variabilní symbol je pro tento doklad povinný",
            dimensionId: line.dimensionId ? undefined : "Vyberte zakázku",
          })}
          sideFields="shared"
          storageKey="showcase-journal-validation"
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
      </ShowcaseSection>

      <ShowcaseSection
        title="Interní doklad podle kategorií účtů"
        description="Na každém řádku MD i DAL účet, VS a partner zvlášť pro obě strany. Alt+↓ rozbalí detail řádku, Ctrl+N přepne Nedaňový u nákladového nebo výnosového účtu."
      >
        <JournalLinesEditor
          lines={internalLines}
          onChange={setInternalLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          dimensionRequired
          storageKey="showcase-journal-internal"
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
      </ShowcaseSection>

      <ShowcaseSection
        title="Faktura přijatá s hlavním účtem 321"
        description="Hlavní strana DAL je jen ke čtení, zadává se pouze protiúčet. Poslední řádek je haléřové vyrovnání."
      >
        <JournalLinesEditor
          lines={invoiceLines}
          onChange={setInvoiceLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          mode="mainAccount" mainSide="D" mainAccount="321001"
          totalAmount={12100.4}
          totalMode="entered"
          storageKey="showcase-journal-invoice"
        
          documentCurrency="CZK" homeCurrency="CZK" homeCurrencySymbol="Kč"/>
      </ShowcaseSection>

      <ShowcaseSection
        title="Bankovní výpis v EUR"
        description="Částka v Kč se dopočítá z kurzu; v patičce je vidět, kolik zbývá rozepsat proti částce dokladu."
      >
        <JournalLinesEditor
          lines={bankLines}
          onChange={setBankLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          documentCurrency="EUR" documentCurrencySymbol="€"
          homeCurrency="CZK" homeCurrencySymbol="Kč"
          rate={24.8}
          mode="mainAccount" mainSide="MD" mainAccount="221002"
          totalAmount={24800.3}
          totalMode="entered"
          rounding={{ value: bankLines.find((line) => line.isRounding)?.amount ?? 0, onChange: (amount) => setBankLines((current) => [
            ...current.filter((line) => !line.isRounding),
            ...(amount ? [{ id: "bv-r", debitAccount: "221002", creditAccount: "648001", amount, text: "Haléřové vyrovnání", isRounding: true }] : []),
          ]) }}
          storageKey="showcase-journal-bank"
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Jednotlivé prvky"
        description="Výběr partnera, knihy a zakázky, variabilní symbol a částka v měně dokladu."
      >
        <div className="grid gap-4 rounded-lg border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="demo-partner">Partner</Label>
            <PartnerSelect
              id="demo-partner"
              partners={MOCK_PARTNERS}
              value={partnerId}
              onChange={setPartnerId}
              onCreate={() => toast.info("Otevře se formulář nového partnera")}
              onLoadFromAres={() => toast.info("Načtení údajů z ARES")}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="demo-book">Kniha</Label>
            <BookSelect id="demo-book" books={MOCK_BOOKS} value={bookId} onChange={setBookId} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="demo-single-book">Jediná dostupná kniha</Label>
            <BookSelect id="demo-single-book" books={MOCK_BOOKS.slice(0, 1)} value={bookId} onChange={setBookId} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="demo-dimension">Zakázka</Label>
            <DimensionSelect
              id="demo-dimension"
              options={MOCK_DIMENSIONS}
              value={dimensionId}
              onChange={setDimensionId}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="demo-vs">Variabilní symbol</Label>
            <VsField id="demo-vs" value={vs} onChange={setVs} />
          </div>
        </div>

        <CurrencyAmount
          className="mt-4 rounded-lg border bg-card p-4"
          amount={amount}
          onAmountChange={setAmount}
          currency={currency}
          onCurrencyChange={setCurrency}
          currencies={CURRENCIES}
          baseCurrency="CZK" homeCurrencySymbol="Kč"
          rate={rate}
          onRateChange={setRate}
          idPrefix="demo-currency"
        />
      </ShowcaseSection>

      <ReportsShowcase />
    </ShowcaseLayout>
  );
}
