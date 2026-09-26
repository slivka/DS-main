import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { formatAmount } from "../../../lib/format";
import { cn } from "../../../lib/utils";
import { SectionHeading } from "../layout/section-heading";
import { formatAccountCode } from "./account-code";
import type { AccountOption } from "./account-select";
import type { DimensionOption } from "./dimension-select";
import type { JournalLine } from "./journal-lines";

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
  homeCurrency: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tab?: string;
  onTabChange?: (tab: string) => void;
  recapTabs?: JournalRecapTab[];
  zoom?: number;
  heading?: string;
}

const money = (value: number) => formatAmount(value, 2);
const currencyLabel = (code: string) => code === "CZK" ? "Kč" : code;

/** Řízená nebo lokálně řízená rekapitulace aktuálních účetních řádků. */
export function JournalLinesRecap({
  lines,
  accounts,
  dimensions = [],
  documentCurrency,
  homeCurrency,
  open,
  onOpenChange,
  tab,
  onTabChange,
  recapTabs = [],
  zoom = 1,
  heading = "Rekapitulace",
}: JournalLinesRecapProps) {
  const [localOpen, setLocalOpen] = React.useState(true);
  const [localTab, setLocalTab] = React.useState("accounting");
  const shown = open ?? localOpen;
  const activeTab = tab ?? localTab;
  const changeOpen = (next: boolean) => onOpenChange ? onOpenChange(next) : setLocalOpen(next);
  const changeTab = (next: string) => onTabChange ? onTabChange(next) : setLocalTab(next);
  const accountMap = React.useMemo(() => new Map(accounts.map((item) => [item.code, item.name])), [accounts]);
  const dimensionMap = React.useMemo(() => new Map(dimensions.map((item) => [item.id, item])), [dimensions]);
  const foreign = documentCurrency !== homeCurrency;
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
        const label = line.isFxRounding ? "Zaokrouhlení přepočtu" : "Haléřové vyrovnání";
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
  }, [lines]);
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
  const tabs = React.useMemo(() => [{ id: "accounting", label: "Účtování" }, { id: "jobs", label: "Zakázky" }, ...recapTabs], [recapTabs]);
  React.useEffect(() => { if (!tabs.some((item) => item.id === activeTab)) changeTab("accounting"); }, [activeTab, tabs]);

  return <section data-slot="journal-lines-recap" className="bg-card" style={{ fontSize: `${0.875 * zoom}rem` }}>
    <SectionHeading className="m-0 p-0">
      <Button type="button" variant="ghost" onClick={() => changeOpen(!shown)} aria-expanded={shown} className="h-auto w-full justify-between rounded-none px-0 py-2 text-[0.8125rem] font-semibold uppercase tracking-wide">
        {heading}{shown ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </Button>
    </SectionHeading>
    {shown ? <Tabs value={activeTab} onValueChange={changeTab}>
      <TabsList className="h-9 rounded-none bg-transparent px-2">{tabs.map((item) => <TabsTrigger key={item.id} value={item.id} className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">{item.label}</TabsTrigger>)}</TabsList>
      <TabsContent value="accounting" className="m-0 overflow-x-auto"><table className="w-full min-w-[44rem] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 text-left">Účet MD</th><th className="p-2 text-left">Název</th><th className="p-2 text-left">Účet DAL</th><th className="p-2 text-left">Název</th><th className="p-2 text-right">{`Celkem (${currencyLabel(homeCurrency)})`}</th>{foreign ? <th className="p-2 text-right">{`Celkem v ${documentCurrency}`}</th> : null}</tr></thead><tbody>{accounting.map((row) => <tr key={row.key} className={cn("border-t", row.label && "bg-muted/40")}><td className="p-2 font-mono">{row.debit ? formatAccountCode(row.debit) : "—"}</td><td className="p-2">{row.label ?? (row.debit ? accountMap.get(row.debit) ?? "—" : "—")}</td><td className="p-2 font-mono">{row.credit ? formatAccountCode(row.credit) : "—"}</td><td className="p-2">{row.credit ? accountMap.get(row.credit) ?? "—" : "—"}</td><td className="p-2 text-right tabular-nums">{money(row.amount)}</td>{foreign ? <td className="p-2 text-right tabular-nums">{money(row.foreignAmount)}</td> : null}</tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={4} className="p-2">Celkem</td><td className="p-2 text-right tabular-nums">{money(accounting.reduce((sum, row) => sum + row.amount, 0))}</td>{foreign ? <td className="p-2 text-right tabular-nums">{money(accounting.reduce((sum, row) => sum + row.foreignAmount, 0))}</td> : null}</tr></tfoot></table></TabsContent>
      <TabsContent value="jobs" className="m-0 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 text-left">Zakázka</th><th className="p-2 text-left">Strana</th><th className="p-2 text-right">{`Celkem (${currencyLabel(homeCurrency)})`}</th></tr></thead><tbody>{jobs.map((row) => <tr key={`${row.id}|${row.side}`} className="border-t"><td className="p-2">{dimensionLabel(row.id)}</td><td className="p-2 font-mono">{row.side}</td><td className="p-2 text-right tabular-nums">{money(row.amount)}</td></tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={2} className="p-2">Celkem</td><td className="p-2 text-right tabular-nums">{money(jobs.reduce((sum, row) => sum + row.amount, 0))}</td></tr></tfoot></table></TabsContent>
      {recapTabs.map((item) => <TabsContent key={item.id} value={item.id} className="m-0 border-t p-3">{typeof item.content === "function" ? item.content(lines) : item.content}</TabsContent>)}
    </Tabs> : null}
  </section>;
}
