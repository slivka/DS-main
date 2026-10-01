import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { formatAmount } from "../../../lib/format";
import type { AccountOption } from "./account-select";
import type { DimensionOption } from "./dimension-select";
import type { JournalLine } from "./journal-lines";
import type { VatSummaryRow } from "./journal-vat";
import { DataGrid, type DataGridColumn } from "../grid/DataGrid";
import { accountColumns } from "./account-columns";
import { useDsTexts } from "../../../ds-texts";
import { formatAccountCode } from "./account-code";
import { formatCodeName } from "../../../lib/code-format";

export interface JournalRecapTab {
  id: string;
  label: string;
  content: React.ReactNode | ((lines: JournalLine[]) => React.ReactNode);
}

export interface JournalLinesRecapProps {
  lines: JournalLine[];
  accounts: AccountOption[];
  dimensions?: DimensionOption[];
  documentCurrency: string;
  documentCurrencySymbol?: string;
  homeCurrency: string;
  homeCurrencySymbol?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tab?: string;
  onTabChange?: (tab: string) => void;
  recapTabs?: JournalRecapTab[];
  zoom?: number;
  /** Samostatný klíč rozložení sloupců rekapitulace. */
  storageKey?: string;
  texts?: Partial<JournalLinesRecapTexts>;
  /** Rekapitulace DPH po kódech – s ní se zobrazí vestavěná záložka „DPH“. */
  vatSummary?: VatSummaryRow[];
}

export interface JournalLinesRecapTexts {
  accounting: string;
  jobs: string;
  debitShort: string;
  creditShort: string;
  debitAccount: string;
  creditAccount: string;
  total: string;
  dimension: string;
  side: string;
  rounding: string;
  fxRounding: string;
  collapse: string;
  expand: string;
  vat: string;
  vatCode: string;
  vatRate: string;
  vatBase: string;
  vatAmount: string;
  selfAssessmentNote: string;
  deductible: string;
  nonDeductible: string;
}

export const DEFAULT_JOURNAL_LINES_RECAP_TEXTS: JournalLinesRecapTexts = {
  accounting: "Účtování",
  jobs: "Zakázky",
  debitShort: "MD",
  creditShort: "DAL",
  debitAccount: "MD účet",
  creditAccount: "DAL účet",
  total: "Celkem",
  dimension: "Zakázka",
  side: "Strana",
  rounding: "Zaokrouhlení",
  fxRounding: "Kurzové zaokrouhlení",
  collapse: "Sbalit rekapitulaci",
  expand: "Rozbalit rekapitulaci",
  vat: "DPH",
  vatCode: "Kód",
  vatRate: "Sazba",
  vatBase: "Základ",
  vatAmount: "DPH",
  selfAssessmentNote: "daň na výstupu i odpočet – celek dokladu nemění",
  deductible: "s nárokem",
  nonDeductible: "bez nároku",
};

const money = (value: number) => formatAmount(value, 2);

/** Řízená nebo lokálně řízená rekapitulace aktuálních účetních řádků. */
export function JournalLinesRecap({
  lines,
  accounts,
  dimensions = [],
  documentCurrency,
  documentCurrencySymbol,
  homeCurrency,
  homeCurrencySymbol,
  open,
  onOpenChange,
  tab,
  onTabChange,
  recapTabs = [],
  zoom = 1,
  storageKey = "journal-recap",
  texts,
  vatSummary,
}: JournalLinesRecapProps) {
  const dsTexts = useDsTexts();
  const t = { ...DEFAULT_JOURNAL_LINES_RECAP_TEXTS, ...dsTexts.journalRecap, ...texts };
  const [localOpen, setLocalOpen] = React.useState(true);
  const [localTab, setLocalTab] = React.useState("accounting");
  const shown = open ?? localOpen;
  const activeTab = tab ?? localTab;
  const changeOpen = (next: boolean) => (onOpenChange ? onOpenChange(next) : setLocalOpen(next));
  const changeTab = (next: string) => (onTabChange ? onTabChange(next) : setLocalTab(next));
  const accountMap = React.useMemo(
    () => new Map(accounts.map((item) => [item.code, item.name])),
    [accounts],
  );
  const dimensionMap = React.useMemo(
    () => new Map(dimensions.map((item) => [item.id, item])),
    [dimensions],
  );
  const foreign = documentCurrency !== homeCurrency;
  const documentMark = documentCurrencySymbol ?? documentCurrency;
  const homeMark = homeCurrencySymbol ?? homeCurrency;
  const dimensionLabel = (id: string) => {
    const parts: string[] = [];
    let current = dimensionMap.get(id);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      parts.unshift(formatCodeName(current.code, current.name));
      current = current.parentId ? dimensionMap.get(current.parentId) : undefined;
    }
    return parts.join(" / ");
  };
  const accounting = React.useMemo(() => {
    const grouped = new Map<
      string,
      {
        key: string;
        label?: string;
        debit: string;
        credit: string;
        amount: number;
        foreignAmount: number;
      }
    >();
    for (const line of lines) {
      if (line.isRounding || line.isFxRounding) {
        const label = line.text ? line.text : line.isFxRounding ? t.fxRounding : t.rounding;
        grouped.set(`${line.id}|pinned`, {
          key: line.id,
          label,
          debit: line.debitAccount ?? "",
          credit: line.creditAccount ?? "",
          amount: Number(line.amount) || 0,
          foreignAmount: Number(line.foreignAmount) || 0,
        });
        continue;
      }
      const debit = line.debitAccount ?? "";
      const credit = line.creditAccount ?? "";
      const key = `${debit}|${credit}`;
      const row = grouped.get(key) ?? { key, debit, credit, amount: 0, foreignAmount: 0 };
      row.amount += Number(line.amount) || 0;
      row.foreignAmount += Number(line.foreignAmount) || 0;
      grouped.set(key, row);
    }
    return [...grouped.values()];
  }, [lines, t.fxRounding, t.rounding]);
  const jobs = React.useMemo(() => {
    const grouped = new Map<string, { id: string; side: "MD" | "DAL"; amount: number }>();
    for (const line of lines.filter((item) => !item.isRounding && !item.isFxRounding)) {
      const entries: [string | null | undefined, "MD" | "DAL"][] = [
        [line.debitDimensionId ?? line.dimensionId, "MD"],
        [line.creditDimensionId ?? line.dimensionId, "DAL"],
      ];
      for (const [id, side] of entries)
        if (id) {
          const key = `${id}|${side}`;
          const row = grouped.get(key) ?? { id, side, amount: 0 };
          row.amount += Number(line.amount) || 0;
          grouped.set(key, row);
        }
    }
    return [...grouped.values()];
  }, [lines]);
  const accountingColumns = React.useMemo<DataGridColumn<(typeof accounting)[number]>[]>(() => {
    type Row = (typeof accounting)[number];
    // Prázdný účet se zobrazí jako „—“; popisek systémového řádku (Zaokrouhlení, DPH) je součástí hodnoty
    // u obou forem strany MD, takže je v exportu, hledání i po přepnutí na krátkou formu.
    const withLabel = (value: string, row: Row) =>
      row.label ? `${value || "—"} ${row.label}` : value || "—";
    const renderLabel = (value: string, row: Row) => (
      <span className="block truncate" title={withLabel(value, row)}>
        <span className="font-mono tabular-nums">{value || "—"}</span>
        {row.label ? <span className="ml-2">{row.label}</span> : null}
      </span>
    );
    const base = accountColumns<Row>({
      debit: (row) => row.debit,
      credit: (row) => row.credit,
      accountName: (code) => accountMap.get(code),
      debitLabel: t.debitShort,
      creditLabel: t.creditShort,
      debitNameLabel: t.debitAccount,
      creditNameLabel: t.creditAccount,
    });
    const accountValue = (id: string, row: Row) => {
      const code = id.startsWith("debit") ? row.debit : row.credit;
      if (!code) return "";
      return id.endsWith("Name")
        ? formatCodeName(formatAccountCode(code), accountMap.get(code))
        : formatAccountCode(code);
    };
    return [
      ...base.filter((column) => column.id.endsWith("Name")).map((column) =>
        column.id.startsWith("debit")
          ? {
              ...column,
              value: (row: Row) => withLabel(accountValue(column.id, row), row),
              render: (row: Row) => renderLabel(accountValue(column.id, row), row),
            }
          : {
              ...column,
              value: (row: Row) => accountValue(column.id, row) || "—",
              render: (row: Row) =>
                renderLabel(accountValue(column.id, row), { ...row, label: undefined }),
            },
      ),
      {
        id: "amount",
        label: `${t.total} (${homeMark})`,
        value: (row: Row) => row.amount,
        render: (row: Row) => money(row.amount),
        numeric: true,
        decimals: 2,
        total: "sum" as const,
        width: 140,
      },
      ...(foreign
        ? [
            {
              id: "foreignAmount",
              label: `${t.total} (${documentMark})`,
              value: (row: Row) => row.foreignAmount,
              render: (row: Row) => money(row.foreignAmount),
              numeric: true,
              decimals: 2,
              total: "sum" as const,
              width: 140,
            },
          ]
        : []),
    ];
  }, [
    accountMap,
    accounting,
    documentMark,
    foreign,
    homeMark,
    t.total,
    t.debitShort,
    t.creditShort,
    t.debitAccount,
    t.creditAccount,
  ]);
  const jobColumns = React.useMemo<DataGridColumn<(typeof jobs)[number]>[]>(
    () => [
      {
        id: "dimension",
        label: t.dimension,
        value: (row) => dimensionLabel(row.id),
        total: () => t.total,
      },
      { id: "side", label: t.side, value: (row) => row.side },
      {
        id: "amount",
        label: `${t.total} (${homeMark})`,
        value: (row) => row.amount,
        render: (row) => money(row.amount),
        numeric: true,
        decimals: 2,
        total: "sum",
      },
    ],
    [homeMark, jobs, t.dimension, t.side, t.total],
  );
  const vatColumns = React.useMemo<DataGridColumn<VatSummaryRow>[]>(
    () => [
      {
        id: "code",
        label: t.vatCode,
        value: (row) => formatCodeName(row.code, row.name),
        total: () => t.total,
        render: (row) => (
          <>
            {formatCodeName(row.code, row.name)}
            {row.selfAssessment ? (
              <span className="block text-xs text-muted-foreground">{t.selfAssessmentNote}</span>
            ) : null}
            {row.nonDeductible ? (
              <span className="block text-xs text-muted-foreground">{`${t.deductible} ${money(row.deductible)} · ${t.nonDeductible} ${money(row.nonDeductible)}`}</span>
            ) : null}
          </>
        ),
      },
      {
        id: "rate",
        label: t.vatRate,
        value: (row) => row.rate,
        numeric: true,
        render: (row) => (row.rate == null ? "—" : `${row.rate} %`),
      },
      {
        id: "base",
        label: `${t.vatBase} (${documentMark})`,
        value: (row) => row.base,
        render: (row) => money(row.base),
        numeric: true,
        decimals: 2,
        total: "sum",
      },
      {
        id: "vat",
        label: `${t.vatAmount} (${documentMark})`,
        value: (row) => row.vat,
        render: (row) => money(row.vat),
        numeric: true,
        decimals: 2,
        total: "sum",
      },
      {
        id: "gross",
        label: `${t.total} (${documentMark})`,
        value: (row) => row.gross,
        render: (row) => money(row.gross),
        numeric: true,
        decimals: 2,
        total: "sum",
      },
      ...(foreign
        ? [
            {
              id: "baseHome",
              label: `${t.vatBase} (${homeMark})`,
              value: (row: VatSummaryRow) => row.baseHome,
              render: (row: VatSummaryRow) => money(row.baseHome),
              numeric: true,
              decimals: 2,
              total: "sum" as const,
            },
            {
              id: "vatHome",
              label: `${t.vatAmount} (${homeMark})`,
              value: (row: VatSummaryRow) => row.vatHome,
              render: (row: VatSummaryRow) => money(row.vatHome),
              numeric: true,
              decimals: 2,
              total: "sum" as const,
            },
          ]
        : []),
    ],
    [documentMark, foreign, homeMark, t],
  );
  const tabs = React.useMemo(
    () => [
      { id: "accounting", label: t.accounting },
      { id: "jobs", label: t.jobs },
      ...(vatSummary ? [{ id: "vat", label: t.vat }] : []),
      ...recapTabs,
    ],
    [recapTabs, t.accounting, t.jobs, t.vat, vatSummary],
  );
  React.useEffect(() => {
    if (!tabs.some((item) => item.id === activeTab)) {
      if (onTabChange) onTabChange("accounting");
      else setLocalTab("accounting");
    }
  }, [activeTab, onTabChange, tabs]);

  return (
    <section
      data-slot="journal-lines-recap"
      className="bg-card"
      style={{ fontSize: `${0.875 * zoom}rem` }}
    >
      <Tabs
        value={activeTab}
        onValueChange={(next) => {
          changeTab(next);
          if (!shown) changeOpen(true);
        }}
      >
        <div className="flex items-center border-b">
          <TabsList className="h-9 flex-1 justify-start rounded-none bg-transparent px-2">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                onClick={() => {
                  if (!shown && item.id === activeTab) changeOpen(true);
                }}
                className="h-9 rounded-none border-b-2 border-transparent text-sm data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:font-bold"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => changeOpen(!shown)}
            aria-label={shown ? t.collapse : t.expand}
            aria-expanded={shown}
            className="mr-1 size-8"
          >
            {shown ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </Button>
        </div>
        {shown ? (
          <>
            <TabsContent value="accounting" className="m-0">
              <DataGrid
                storageKey={`${storageKey}:accounting`}
                exportName="journal-recap-accounting"
                rows={accounting}
                columns={accountingColumns}
                rowKey={(row) => row.key}
                rowClassName={(row) => (row.label ? "bg-muted text-muted-foreground" : undefined)}
                defaultSort={null}
                height="auto"
                autoZoom
                paginated={false}
                showTotalRow
                plain
                hideToolbar
              />
            </TabsContent>
            <TabsContent value="jobs" className="m-0">
              <DataGrid
                storageKey={`${storageKey}:jobs`}
                exportName="journal-recap-jobs"
                rows={jobs}
                columns={jobColumns}
                rowKey={(row) => `${row.id}|${row.side}`}
                defaultSort={null}
                height="auto"
                autoZoom
                paginated={false}
                showTotalRow
                plain
                hideToolbar
              />
            </TabsContent>
            {vatSummary ? (
              <TabsContent value="vat" className="m-0" data-slot="journal-vat-recap">
                <DataGrid
                  storageKey={`${storageKey}:vat`}
                  exportName="journal-recap-vat"
                  rows={vatSummary}
                  columns={vatColumns}
                  rowKey={(row) => row.codeId}
                  defaultSort={null}
                  height="auto"
                  autoZoom
                  paginated={false}
                  showTotalRow
                  plain
                  hideToolbar
                />
              </TabsContent>
            ) : null}
            {recapTabs.map((item) => (
              <TabsContent key={item.id} value={item.id} className="m-0 border-t p-3">
                {typeof item.content === "function" ? item.content(lines) : item.content}
              </TabsContent>
            ))}
          </>
        ) : null}
      </Tabs>
    </section>
  );
}
