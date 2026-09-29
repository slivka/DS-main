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
  accounting: string; jobs: string; debitAccount: string; creditAccount: string; total: string;
  dimension: string; side: string; rounding: string; fxRounding: string; collapse: string; expand: string;
  vat: string; vatCode: string; vatRate: string; vatBase: string; vatAmount: string; selfAssessmentNote: string; deductible: string; nonDeductible: string;
}

export const DEFAULT_JOURNAL_LINES_RECAP_TEXTS: JournalLinesRecapTexts = {
  accounting: "Účtování", jobs: "Zakázky", debitAccount: "MD účet", creditAccount: "DAL účet", total: "Celkem",
  dimension: "Zakázka", side: "Strana", rounding: "Zaokrouhlení", fxRounding: "Kurzové zaokrouhlení", collapse: "Sbalit rekapitulaci", expand: "Rozbalit rekapitulaci",
  vat: "DPH", vatCode: "Kód", vatRate: "Sazba", vatBase: "Základ", vatAmount: "DPH", selfAssessmentNote: "daň na výstupu i odpočet – celek dokladu nemění", deductible: "s nárokem", nonDeductible: "bez nároku",
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
  const t = { ...DEFAULT_JOURNAL_LINES_RECAP_TEXTS, ...texts };
  const [localOpen, setLocalOpen] = React.useState(true);
  const [localTab, setLocalTab] = React.useState("accounting");
  const shown = open ?? localOpen;
  const activeTab = tab ?? localTab;
  const changeOpen = (next: boolean) => onOpenChange ? onOpenChange(next) : setLocalOpen(next);
  const changeTab = (next: string) => onTabChange ? onTabChange(next) : setLocalTab(next);
  const accountMap = React.useMemo(() => new Map(accounts.map((item) => [item.code, item.name])), [accounts]);
  const dimensionMap = React.useMemo(() => new Map(dimensions.map((item) => [item.id, item])), [dimensions]);
  const foreign = documentCurrency !== homeCurrency;
  const documentMark = documentCurrencySymbol ?? documentCurrency;
  const homeMark = homeCurrencySymbol ?? homeCurrency;
  const dimensionLabel = (id: string) => {
    const parts: string[] = [];
    let current = dimensionMap.get(id);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) {
      visited.add(current.id);
      parts.unshift(`${current.code ? `${current.code} - ` : ""}${current.name}`);
      current = current.parentId ? dimensionMap.get(current.parentId) : undefined;
    }
    return parts.join(" / ");
  };
  const accounting = React.useMemo(() => {
    const grouped = new Map<string, { key: string; label?: string; debit: string; credit: string; amount: number; foreignAmount: number }>();
    for (const line of lines) {
      if (line.isRounding || line.isFxRounding) {
        const label = line.text ? line.text : line.isFxRounding ? t.fxRounding : t.rounding;
        grouped.set(`${line.id}|pinned`, { key: line.id, label, debit: line.debitAccount ?? "", credit: line.creditAccount ?? "", amount: Number(line.amount) || 0, foreignAmount: Number(line.foreignAmount) || 0 });
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
      const entries: [string | null | undefined, "MD" | "DAL"][] = [[line.debitDimensionId ?? line.dimensionId, "MD"], [line.creditDimensionId ?? line.dimensionId, "DAL"]];
      for (const [id, side] of entries) if (id) {
        const key = `${id}|${side}`;
        const row = grouped.get(key) ?? { id, side, amount: 0 };
        row.amount += Number(line.amount) || 0;
        grouped.set(key, row);
      }
    }
    return [...grouped.values()];
  }, [lines]);
  const accountingColumns = React.useMemo(() => [
    ...accountColumns<(typeof accounting)[number]>({ getDebit: (row) => row.debit, getCredit: (row) => row.credit, accountName: (code) => accountMap.get(code) }).map((column) => column.id === "debitAccountName" ? { ...column, render: (row: (typeof accounting)[number]) => <>{column.render?.(row)}{row.label ? <span className="ml-2 text-muted-foreground">{row.label}</span> : null}</> } : column),
    { id: "amount", label: `${t.total} (${homeMark})`, value: (row: (typeof accounting)[number]) => row.amount, numeric: true, decimals: 2, total: "sum" as const },
    ...(foreign ? [{ id: "foreignAmount", label: `${t.total} (${documentMark})`, value: (row: (typeof accounting)[number]) => row.foreignAmount, numeric: true, decimals: 2, total: "sum" as const }] : []),
  ], [accountMap, accounting, documentMark, foreign, homeMark, t.total]);
  const jobColumns = React.useMemo<DataGridColumn<(typeof jobs)[number]>[]>(() => [
    { id: "dimension", label: t.dimension, value: (row) => dimensionLabel(row.id), total: () => t.total },
    { id: "side", label: t.side, value: (row) => row.side },
    { id: "amount", label: `${t.total} (${homeMark})`, value: (row) => row.amount, numeric: true, decimals: 2, total: "sum" },
  ], [homeMark, jobs, t.dimension, t.side, t.total]);
  const vatColumns = React.useMemo<DataGridColumn<VatSummaryRow>[]>(() => [
    { id: "code", label: t.vatCode, value: (row) => `${row.code}${row.name ? ` – ${row.name}` : ""}`, total: () => t.total, render: (row) => <>{row.code}{row.name ? ` – ${row.name}` : ""}{row.selfAssessment ? <span className="block text-xs text-muted-foreground">{t.selfAssessmentNote}</span> : null}{row.nonDeductible ? <span className="block text-xs text-muted-foreground">{`${t.deductible} ${money(row.deductible)} · ${t.nonDeductible} ${money(row.nonDeductible)}`}</span> : null}</> },
    { id: "rate", label: t.vatRate, value: (row) => row.rate, numeric: true, render: (row) => row.rate == null ? "—" : `${row.rate} %` },
    { id: "base", label: `${t.vatBase} (${documentMark})`, value: (row) => row.base, numeric: true, decimals: 2, total: "sum" },
    { id: "vat", label: `${t.vatAmount} (${documentMark})`, value: (row) => row.vat, numeric: true, decimals: 2, total: "sum" },
    { id: "gross", label: `${t.total} (${documentMark})`, value: (row) => row.gross, numeric: true, decimals: 2, total: "sum" },
    ...(foreign ? [
      { id: "baseHome", label: `${t.vatBase} (${homeMark})`, value: (row: VatSummaryRow) => row.baseHome, numeric: true, decimals: 2, total: "sum" as const },
      { id: "vatHome", label: `${t.vatAmount} (${homeMark})`, value: (row: VatSummaryRow) => row.vatHome, numeric: true, decimals: 2, total: "sum" as const },
    ] : []),
  ], [documentMark, foreign, homeMark, t]);
  const tabs = React.useMemo(() => [{ id: "accounting", label: t.accounting }, { id: "jobs", label: t.jobs }, ...(vatSummary ? [{ id: "vat", label: t.vat }] : []), ...recapTabs], [recapTabs, t.accounting, t.jobs, t.vat, vatSummary]);
  React.useEffect(() => {
    if (!tabs.some((item) => item.id === activeTab)) {
      if (onTabChange) onTabChange("accounting");
      else setLocalTab("accounting");
    }
  }, [activeTab, onTabChange, tabs]);

  return <section data-slot="journal-lines-recap" className="bg-card" style={{ fontSize: `${0.875 * zoom}rem` }}>
    <Tabs value={activeTab} onValueChange={(next) => { changeTab(next); if (!shown) changeOpen(true); }}>
      <div className="flex items-center border-b"><TabsList className="h-9 flex-1 justify-start rounded-none bg-transparent px-2">{tabs.map((item) => <TabsTrigger key={item.id} value={item.id} onClick={() => { if (!shown && item.id === activeTab) changeOpen(true); }} className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">{item.label}</TabsTrigger>)}</TabsList><Button type="button" variant="ghost" size="icon" onClick={() => changeOpen(!shown)} aria-label={shown ? t.collapse : t.expand} aria-expanded={shown} className="mr-1 size-8">{shown ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</Button></div>
      {shown ? <>
       <TabsContent value="accounting" className="m-0"><DataGrid storageKey={`${storageKey}:accounting`} exportName="journal-recap-accounting" rows={accounting} columns={accountingColumns} rowKey={(row) => row.key} paginated={false} showTotalRow plain /></TabsContent>
       <TabsContent value="jobs" className="m-0"><DataGrid storageKey={`${storageKey}:jobs`} exportName="journal-recap-jobs" rows={jobs} columns={jobColumns} rowKey={(row) => `${row.id}|${row.side}`} paginated={false} showTotalRow plain /></TabsContent>
       {vatSummary ? <TabsContent value="vat" className="m-0" data-slot="journal-vat-recap"><DataGrid storageKey={`${storageKey}:vat`} exportName="journal-recap-vat" rows={vatSummary} columns={vatColumns} rowKey={(row) => row.codeId} paginated={false} showTotalRow plain /></TabsContent> : null}
      {recapTabs.map((item) => <TabsContent key={item.id} value={item.id} className="m-0 border-t p-3">{typeof item.content === "function" ? item.content(lines) : item.content}</TabsContent>)}
      </> : null}
    </Tabs>
  </section>;
}
