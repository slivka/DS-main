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
    { id: "pd-r", debitAccount: "211001", creditAccount: "648001", amount: 0.5, text: "Zaokrouhlení", isRounding: true },
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
      text: "Zaokrouhlení", isRounding: true,
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

    </ShowcaseLayout>
  );
}
