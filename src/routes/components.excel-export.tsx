import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { ShowcaseLayout, ShowcaseSection } from "@/components/showcase/ShowcaseLayout";
import {
  AmountCell,
  DataGrid,
  ExcelExportButton,
  accountColumns,
  type DataGridColumn,
  type GridExportData,
} from "@/components/ds";

export const Route = createFileRoute("/components/excel-export")({
  head: () => ({
    meta: [
      { title: "Export do Excelu – Slivka Design System" },
      {
        name: "description",
        content: "Vzor standardního Excel exportu účetních dat včetně tabulky, součtů, formátů a tisku.",
      },
      { property: "og:title", content: "Export do Excelu – Slivka Design System" },
      {
        property: "og:description",
        content: "Vzor standardního Excel exportu účetních dat včetně tabulky, součtů, formátů a tisku.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExcelExportPage,
});

type ExportRow = {
  id: string;
  document: string;
  date: string;
  partner: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  count: number;
  year: number;
  vat: number;
  project: string;
};

const PARTNERS = [
  "Alfa stavební společnost, s.r.o. – dlouhý popis partnera pro ověření automatické šířky a zalamování textu v exportu do Excelu nad hranicí jednoho sta znaků",
  "Moravská obchodní a distribuční, a.s.",
  "Technické služby Nové Město",
  "Kancelářské potřeby Vltava spol. s r.o.",
  "Energetika severní Moravy, a.s.",
];
const PROJECTS = ["Administrativa", "Rekonstrukce Brno", "Expedice Praha", "Vývoj ERP"];
const AMOUNTS = [1250.5, 24890, -3490.75, 0, 9_876_543.21, 87_450.22, -12_000, 8_765_432.1];
const ACCOUNT_NAMES = new Map([
  ["311001", "Odběratelé"],
  ["321001", "Dodavatelé"],
  ["321100", "Závazky"],
  ["518001", "Ostatní služby"],
  ["602001", "Tržby z prodeje služeb"],
]);

const ROWS: ExportRow[] = Array.from({ length: 40 }, (_, index) => {
  const month = String((index % 3) + 1).padStart(2, "0");
  const day = String((index % 27) + 1).padStart(2, "0");
  return {
    id: `journal-${index + 1}`,
    document: `ID${String(index + 1).padStart(6, "0")}`,
    date: `2026-${month}-${day}`,
    partner: PARTNERS[index % PARTNERS.length],
    debitAccount: index % 3 === 0 ? "321100" : index % 2 ? "518001" : "311001",
    creditAccount: index % 2 ? "321001" : "602001",
    amount: AMOUNTS[index % AMOUNTS.length],
    count: (index % 7) + 1,
    year: 2026,
    vat: [0, 0.12, 0.21][index % 3],
    project: PROJECTS[index % PROJECTS.length],
  };
});

const META = {
  company: "Slivka Accounting, s.r.o.",
  period: "01–03/2026",
  user: "Petr Slivka",
  filters: ["Stav: Zaúčtován", "Období: 1. čtvrtletí 2026"],
};

const COLUMNS: DataGridColumn<ExportRow>[] = [
  { id: "document", label: "Doklad", section: "Doklad", value: (row) => row.document },
  { id: "date", label: "Datum", section: "Doklad", value: (row) => row.date, exportType: "date" },
  { id: "partner", label: "Partner", section: "Protistrana", value: (row) => row.partner, width: 240 },
  ...accountColumns<ExportRow>({
    debit: (row) => row.debitAccount,
    credit: (row) => row.creditAccount,
    accountName: (code) => ACCOUNT_NAMES.get(code),
    section: "Zaúčtování",
  }),
  {
    id: "amount",
    label: "Částka",
    section: "Hodnoty",
    value: (row) => row.amount,
    render: (row) => <AmountCell value={row.amount} />,
    numeric: true,
    decimals: 2,
    total: "sum",
  },
  {
    id: "count",
    label: "Počet",
    section: "Hodnoty",
    value: (row) => row.count,
    numeric: true,
    decimals: 0,
    exportType: "integer",
    total: "count",
    width: 90,
  },
  {
    id: "year",
    label: "Rok",
    section: "Hodnoty",
    value: (row) => row.year,
    numeric: true,
    decimals: 0,
    exportType: "year",
    total: "none",
    width: 84,
  },
  {
    id: "vat",
    label: "DPH %",
    section: "Hodnoty",
    value: (row) => row.vat,
    numeric: true,
    decimals: 2,
    exportType: "percent",
    total: "none",
    width: 90,
  },
  { id: "project", label: "Zakázka", section: "Zařazení", value: (row) => row.project, width: 160 },
];

function sampleExportData(): GridExportData {
  return {
    columns: COLUMNS.map((column) => column.label),
    headerRows: [COLUMNS.map((column) => column.section ?? ""), COLUMNS.map((column) => column.label)],
    rows: ROWS.map((row) => COLUMNS.map((column) => column.value?.(row) ?? "")),
    columnMeta: COLUMNS.map((column) => ({
      type: column.exportType ?? (column.numeric ? "number" : "text"),
      align: column.align ?? (column.numeric ? "right" : "left"),
      total: column.total === "sum" || column.total === "count" ? column.total : "none",
    })),
  };
}

const RULES = [
  "Data jsou vždy ve skutečné tabulce Excelu; sekce a názvy tvoří jednořádkové záhlaví.",
  "Součty a počty jsou vzorce tabulky a po filtrování se přepočítají.",
  "Čísla mají oddělené tisíce, dvě desetinná místa a záporné hodnoty jsou červené.",
  "Šedé záhlaví se automaticky zalamuje; všechny buňky jsou výškově vystředěné.",
  "Šířky se minimalizují podle obsahu; texty delší než 100 znaků mají šířku přibližně 100 znaků a zalamují se.",
  "Výjimky formátů určuje pouze metadata sloupce, nikoli jeho název.",
  "Parametry sestavy jsou přehledně uvedené na samostatném listu Parametry exportu.",
  "Tisk je nastaven na A4, přizpůsobený šířce a s opakovaným záhlavím.",
  "Sešit obsahuje název, autora, firmu a datum vytvoření.",
  "Tabulka používá jednoduchý styl s šedým záhlavím a bez střídání barev řádků.",
];

function ExcelExportPage() {
  const columns = useMemo(() => COLUMNS, []);
  return (
    <ShowcaseLayout
      breadcrumbs={[{ label: "Komponenty", to: "/" }, { label: "Export do Excelu" }]}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="typo-title text-primary">Export do Excelu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Účetní sestava se standardním formátováním, součty, seskupením a tiskem.
          </p>
        </div>
        <ExcelExportButton
          getData={sampleExportData}
          exportName="vzorovy-ucetni-export"
          title="Účetní deník – vzorový export"
          meta={META}
        />
      </div>

      <DataGrid<ExportRow>
        storageKey="ds-showcase-excel-export"
        exportTitle="Účetní deník – vzorový export"
        exportName="ucetni-denik"
        exportMeta={META}
        rows={ROWS}
        columns={columns}
        rowKey={(row) => row.id}
        defaultSort="date"
        defaultGroupBy="project"
        groupable
        columnFilters
        paginated={false}
        showTotalRow
      />

      <ShowcaseSection title="Kontrolní seznam exportu">
        <ol className="grid gap-2 sm:grid-cols-2">
          {RULES.map((rule, index) => (
            <li key={rule} className="flex gap-3 border-b py-2 text-sm">
              <span className="font-mono font-semibold text-success">✓</span>
              <span><strong>{index + 1}.</strong> {rule}</span>
            </li>
          ))}
        </ol>
      </ShowcaseSection>
    </ShowcaseLayout>
  );
}