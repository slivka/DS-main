import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  AccountCode,
  BookSelect,
  CurrencyAmount,
  DimensionSelect,
  DocumentForm,
  JournalLinesEditor,
  PartnerSelect,
  TreeGrid,
  VsField,
  formatAccountCode,
  type DocumentHeaderValue,
  type JournalLine,
  type TreeGridColumn,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  MOCK_ACCOUNTS,
  MOCK_BOOKS,
  MOCK_CHART_TREE,
  MOCK_DIMENSIONS,
  MOCK_PARTNERS,
  type ChartNode,
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
  { code: "CZK", label: "Česká koruna" },
  { code: "EUR", label: "Euro" },
  { code: "USD", label: "Americký dolar" },
];

const CHART_COLUMNS: TreeGridColumn<ChartNode>[] = [
  {
    id: "account",
    label: "Účet",
    width: 360,
    value: (row) => `${formatAccountCode(row.code)} – ${row.name}`,
  },
  { id: "debit", label: "MD částka", numeric: true, width: 160, value: (row) => row.debit },
  { id: "credit", label: "DAL částka", numeric: true, width: 160, value: (row) => row.credit },
];

function AccountingFormsPage() {
  const [header, setHeader] = useState<DocumentHeaderValue>({
    bookId: "b-fp",
    number: "FP2026000012",
    issueDate: "2026-01-15",
    taxDate: "2026-01-15",
    dueDate: "2026-01-29",
    partnerId: "p1",
    vs: "2026000012",
    description: "Servisní práce za leden 2026",
    currency: "EUR",
    rate: 25.125,
    amount: 4800,
  });
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
  const [readOnly, setReadOnly] = useState(false);

  return (
    <ShowcaseLayout
      breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Účetní formuláře" }]}
    >
      <ShowcaseSection
        title="Editor dokladu"
        description="Doklady se vždy editují v DocumentForm; číselníky naopak v RecordDialog."
      >
        <div className="mb-3">
          <Button variant="outline" size="sm" onClick={() => setReadOnly((value) => !value)}>
            {readOnly ? "Povolit úpravy" : "Přepnout na jen pro čtení"}
          </Button>
        </div>
        <DocumentForm
          title="Přijatá faktura FP2026000012"
          description="Ukázka celostránkového editoru dokladu."
          value={header}
          onChange={setHeader}
          lines={lines}
          onLinesChange={setLines}
          books={MOCK_BOOKS}
          accounts={MOCK_ACCOUNTS}
          partners={MOCK_PARTNERS}
          dimensions={MOCK_DIMENSIONS}
          currencies={CURRENCIES}
          status="filed"
          approved
          changedBy="Jan Slivka"
          changedAt="15.01.2026 10:24"
          readOnly={readOnly}
          readOnlyReason="Účetní období je v uzávěrce, doklad lze pouze prohlížet."
          actions={
            <>
              <Button variant="outline" onClick={() => toast.success("Koncept uložen")}>
                Uložit koncept
              </Button>
              <Button onClick={() => toast.success("Doklad zaúčtován")}>Zaúčtovat</Button>
            </>
          }
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Řádky zápisu samostatně"
        description="Enter nebo Tab posune na další pole, na konci řádku vznikne nový řádek. Rozdíl proti částce dokladu se průběžně hlídá."
      >
        <JournalLinesEditor
          lines={lines}
          onChange={setLines}
          accounts={MOCK_ACCOUNTS}
          dimensions={MOCK_DIMENSIONS}
          partners={MOCK_PARTNERS}
          expectedTotal={header.amount}
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
          rate={rate}
          onRateChange={setRate}
          idPrefix="demo-currency"
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Stromová mřížka (TreeGrid)"
        description="Účtová osnova od třídy po analytiku se součty za uzel, hledáním se zachováním cesty a exportem do Excelu s úrovněmi."
      >
        <TreeGrid
          title="Účtová osnova"
          rows={MOCK_CHART_TREE}
          columns={CHART_COLUMNS}
          exportName="uctova-osnova"
          exportMeta={{ company: "Slivka Accounting s.r.o.", period: "Rok 2026" }}
          onRowOpen={(row) => toast.info(`Otevřít účet ${formatAccountCode(row.code)}`)}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Čísla účtů se zobrazují s tečkou, např. <AccountCode code="321100" />.
        </p>
      </ShowcaseSection>
    </ShowcaseLayout>
  );
}
