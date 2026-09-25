import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "../../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { formatAmount } from "../../../lib/format";
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
  rounding?: number;
  foreign?: boolean;
  currency?: string;
  storageKey: string;
  recapTabs?: JournalRecapTab[];
  zoom?: number;
}

const money = (value: number) => formatAmount(value, 2);

/** Sbalitelná rekapitulace aktuálních účetních řádků. */
export function JournalLinesRecap({ lines, accounts, dimensions = [], rounding = 0, foreign, currency, storageKey, recapTabs = [], zoom = 1 }: JournalLinesRecapProps) {
  const openKey = `journalRecapOpen:${storageKey}`;
  const tabKey = `journalRecapTab:${storageKey}`;
  const [open, setOpen] = React.useState(true);
  const [tab, setTab] = React.useState("accounting");
  React.useEffect(() => {
    try { setOpen(localStorage.getItem(openKey) !== "false"); setTab(localStorage.getItem(tabKey) || "accounting"); } catch { /* storage unavailable */ }
  }, [openKey, tabKey]);
  const changeOpen = (next: boolean) => { setOpen(next); try { localStorage.setItem(openKey, String(next)); } catch { /* storage unavailable */ } };
  const changeTab = (next: string) => { setTab(next); try { localStorage.setItem(tabKey, next); } catch { /* storage unavailable */ } };
  const accountMap = React.useMemo(() => new Map(accounts.map((item) => [item.code, item.name])), [accounts]);
  const dimensionMap = React.useMemo(() => new Map(dimensions.map((item) => [item.id, item])), [dimensions]);
  const dimensionLabel = (id: string) => {
    const parts: string[] = [];
    let current = dimensionMap.get(id);
    const visited = new Set<string>();
    while (current && !visited.has(current.id)) { visited.add(current.id); parts.unshift(`${current.code ? `${current.code} - ` : ""}${current.name}`); current = current.parentId ? dimensionMap.get(current.parentId) : undefined; }
    return parts.join(" / ");
  };
  const accounting = React.useMemo(() => {
    const map = new Map<string, { debit: string; credit: string; amount: number; foreignAmount: number }>();
    for (const line of lines.filter((item) => !item.isRounding)) {
      const debit = line.debitAccount ?? ""; const credit = line.creditAccount ?? ""; const key = `${debit}|${credit}`;
      const row = map.get(key) ?? { debit, credit, amount: 0, foreignAmount: 0 };
      row.amount += Number(line.amount) || 0; row.foreignAmount += Number(line.foreignAmount) || 0; map.set(key, row);
    }
    const rows = [...map.values()];
    if (rounding) rows.push({ debit: "", credit: "", amount: rounding, foreignAmount: 0 });
    return rows;
  }, [lines, rounding]);
  const jobs = React.useMemo(() => {
    const map = new Map<string, { id: string; side: "MD" | "DAL"; amount: number }>();
    for (const line of lines.filter((item) => !item.isRounding)) {
      const entries: [string | null | undefined, "MD" | "DAL"][] = [[line.debitDimensionId ?? line.dimensionId, "MD"], [line.creditDimensionId ?? line.dimensionId, "DAL"]];
      for (const [id, side] of entries) if (id) { const key = `${id}|${side}`; const row = map.get(key) ?? { id, side, amount: 0 }; row.amount += Number(line.amount) || 0; map.set(key, row); }
    }
    return [...map.values()];
  }, [lines]);
  const tabs = [{ id: "accounting", label: "Účtování" }, { id: "jobs", label: "Zakázky" }, ...recapTabs];
  React.useEffect(() => { if (!tabs.some((item) => item.id === tab)) setTab("accounting"); }, [tab, tabs]);
  return <section data-slot="journal-lines-recap" className="border-t bg-card" style={{ fontSize: `${14 * zoom}px` }}>
    <Button type="button" variant="ghost" onClick={() => changeOpen(!open)} className="h-9 w-full justify-start rounded-none px-3 text-sm font-semibold">{open ? <ChevronDown /> : <ChevronRight />}Rekapitulace</Button>
    {open ? <Tabs value={tab} onValueChange={changeTab} className="border-t">
      <TabsList className="h-9 rounded-none bg-transparent px-2">{tabs.map((item) => <TabsTrigger key={item.id} value={item.id} className="h-9 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">{item.label}</TabsTrigger>)}</TabsList>
      <TabsContent value="accounting" className="m-0 overflow-x-auto"><table className="w-full min-w-[44rem] text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 text-left">Účet MD</th><th className="p-2 text-left">Název</th><th className="p-2 text-left">Účet DAL</th><th className="p-2 text-left">Název</th><th className="p-2 text-right">Celkem (Kč)</th>{foreign ? <th className="p-2 text-right">Celkem v měně</th> : null}</tr></thead><tbody>{accounting.map((row, index) => <tr key={`${row.debit}|${row.credit}|${index}`} className="border-t"><td className="p-2 font-mono">{row.debit ? formatAccountCode(row.debit) : "—"}</td><td className="p-2">{row.debit ? accountMap.get(row.debit) ?? "—" : "Haléřové vyrovnání"}</td><td className="p-2 font-mono">{row.credit ? formatAccountCode(row.credit) : "—"}</td><td className="p-2">{row.credit ? accountMap.get(row.credit) ?? "—" : "—"}</td><td className="p-2 text-right font-mono tabular-nums">{money(row.amount)}</td>{foreign ? <td className="p-2 text-right font-mono tabular-nums">{money(row.foreignAmount)}</td> : null}</tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={4} className="p-2">Celkem</td><td className="p-2 text-right font-mono">{money(accounting.reduce((sum, row) => sum + row.amount, 0))}</td>{foreign ? <td className="p-2 text-right font-mono">{`${money(accounting.reduce((sum, row) => sum + row.foreignAmount, 0))} ${currency ?? ""}`}</td> : null}</tr></tfoot></table></TabsContent>
      <TabsContent value="jobs" className="m-0 overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted/50 text-muted-foreground"><tr><th className="p-2 text-left">Zakázka</th><th className="p-2 text-left">Strana</th><th className="p-2 text-right">Celkem (Kč)</th></tr></thead><tbody>{jobs.map((row) => <tr key={`${row.id}|${row.side}`} className="border-t"><td className="p-2">{dimensionLabel(row.id)}</td><td className="p-2 font-mono">{row.side}</td><td className="p-2 text-right font-mono">{money(row.amount)}</td></tr>)}</tbody><tfoot className="border-t bg-muted/50 font-bold"><tr><td colSpan={2} className="p-2">Celkem</td><td className="p-2 text-right font-mono">{money(jobs.reduce((sum, row) => sum + row.amount, 0))}</td></tr></tfoot></table></TabsContent>
      {recapTabs.map((item) => <TabsContent key={item.id} value={item.id} className="m-0 border-t p-3">{typeof item.content === "function" ? item.content(lines) : item.content}</TabsContent>)}
    </Tabs> : null}
  </section>;
}