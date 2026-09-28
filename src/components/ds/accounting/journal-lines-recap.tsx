import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { formatAccountCode } from "./account-code";
import type { AccountOption } from "./account-select";
import type { DimensionOption } from "./dimension-select";
import type { JournalLine } from "./journal-lines";
import type { VatSummaryRow } from "./journal-vat";

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
      <TabsContent value="accounting" className="m-0 overflow-x-auto"><table className="w-full min-w-[36rem] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 text-left">{t.debitAccount}</th><th className="p-2 text-left">{t.creditAccount}</th><th className="p-2 text-right">{`${t.total} (${homeMark})`}</th>{foreign ? <th className="p-2 text-right">{`${t.total} (${documentMark})`}</th> : null}</tr></thead><tbody>{accounting.map((row) => <tr key={row.key} className={cn("border-t", row.label && "bg-muted text-muted-foreground")}><td className="p-2"><span className="font-mono">{row.debit ? formatAccountCode(row.debit) : "—"}</span>{row.debit ? ` - ${accountMap.get(row.debit) ?? "—"}` : ""}{row.label ? <span className="ml-2">{row.label}</span> : null}</td><td className="p-2"><span className="font-mono">{row.credit ? formatAccountCode(row.credit) : "—"}</span>{row.credit ? ` - ${accountMap.get(row.credit) ?? "—"}` : ""}</td><td className="p-2 text-right tabular-nums">{money(row.amount)}</td>{foreign ? <td className="p-2 text-right tabular-nums">{money(row.foreignAmount)}</td> : null}</tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={2} className="p-2">{t.total}</td><td className="p-2 text-right tabular-nums">{money(accounting.reduce((sum, row) => sum + row.amount, 0))}</td>{foreign ? <td className="p-2 text-right tabular-nums">{money(accounting.reduce((sum, row) => sum + row.foreignAmount, 0))}</td> : null}</tr></tfoot></table></TabsContent>
      <TabsContent value="jobs" className="m-0 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 text-left">{t.dimension}</th><th className="p-2 text-left">{t.side}</th><th className="p-2 text-right">{`${t.total} (${homeMark})`}</th></tr></thead><tbody>{jobs.map((row) => <tr key={`${row.id}|${row.side}`} className="border-t"><td className="p-2">{dimensionLabel(row.id)}</td><td className="p-2 font-mono">{row.side}</td><td className="p-2 text-right tabular-nums">{money(row.amount)}</td></tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={2} className="p-2">{t.total}</td><td className="p-2 text-right tabular-nums">{money(jobs.reduce((sum, row) => sum + row.amount, 0))}</td></tr></tfoot></table></TabsContent>
      {vatSummary ? <TabsContent value="vat" className="m-0 overflow-x-auto"><table data-slot="journal-vat-recap" className="w-full min-w-[36rem] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr className="whitespace-nowrap"><th className="p-2 text-left">{t.vatCode}</th><th className="p-2 text-right">{t.vatRate}</th><th className="p-2 text-right">{`${t.vatBase} (${documentMark})`}</th><th className="p-2 text-right">{`${t.vatAmount} (${documentMark})`}</th><th className="p-2 text-right">{`${t.total} (${documentMark})`}</th>{foreign ? <><th className="p-2 text-right">{`${t.vatBase} (${homeMark})`}</th><th className="p-2 text-right">{`${t.vatAmount} (${homeMark})`}</th></> : null}</tr></thead><tbody>{vatSummary.map((row) => <tr key={row.codeId} className="border-t"><td className="p-2"><span className="font-mono">{row.code}</span>{row.name ? ` – ${row.name}` : ""}{row.selfAssessment ? <span className="block text-xs text-muted-foreground">{t.selfAssessmentNote}</span> : null}{row.nonDeductible ? <span className="block text-xs text-muted-foreground">{`${t.deductible} ${money(row.deductible)} · ${t.nonDeductible} ${money(row.nonDeductible)}`}</span> : null}</td><td className="p-2 text-right tabular-nums">{row.rate == null ? "—" : `${row.rate} %`}</td><td className="p-2 text-right tabular-nums">{money(row.base)}</td><td className="p-2 text-right tabular-nums">{money(row.vat)}</td><td className="p-2 text-right tabular-nums">{money(row.gross)}</td>{foreign ? <><td className="p-2 text-right tabular-nums">{money(row.baseHome)}</td><td className="p-2 text-right tabular-nums">{money(row.vatHome)}</td></> : null}</tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={2} className="p-2">{t.total}</td><td className="p-2 text-right tabular-nums">{money(vatSummary.reduce((sum, row) => sum + row.base, 0))}</td><td className="p-2 text-right tabular-nums">{money(vatSummary.reduce((sum, row) => sum + row.vat, 0))}</td><td className="p-2 text-right tabular-nums">{money(vatSummary.reduce((sum, row) => sum + row.gross, 0))}</td>{foreign ? <><td className="p-2 text-right tabular-nums">{money(vatSummary.reduce((sum, row) => sum + row.baseHome, 0))}</td><td className="p-2 text-right tabular-nums">{money(vatSummary.reduce((sum, row) => sum + row.vatHome, 0))}</td></> : null}</tr></tfoot></table></TabsContent> : null}
      {recapTabs.map((item) => <TabsContent key={item.id} value={item.id} className="m-0 border-t p-3">{typeof item.content === "function" ? item.content(lines) : item.content}</TabsContent>)}
      </> : null}
    </Tabs>
  </section>;
}
