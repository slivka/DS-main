import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ShowcaseSection } from "./ShowcaseLayout";
import {
  AccountSelect,
  BarBreakdownChart,
  FilterChips,
  TreeGrid,
  formatAccountCode,
  type AccountCatalogItem,
  type FilterChip,
  type TreeGridColumn,
  type TreeGridExpandLevel,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MOCK_ACCOUNTS, MOCK_CHART_TREE, type ChartNode } from "@/lib/mock/accounting";

const LEVELS: TreeGridExpandLevel[] = [
  { id: "classes", label: "Třídy", depth: 0 },
  { id: "groups", label: "Skupiny", depth: 1 },
  { id: "accounts", label: "Účty", depth: 2 },
  { id: "all", label: "Vše", depth: 99 },
];

const COLUMNS: TreeGridColumn<ChartNode>[] = [
  { id: "account", label: "Účet", width: 360, value: (row) => `${formatAccountCode(row.code)} – ${row.name}` },
  { id: "debit", label: "MD částka", numeric: true, width: 160, value: (row) => row.debit },
  { id: "credit", label: "DAL částka", numeric: true, width: 160, value: (row) => row.credit },
  {
    id: "balance",
    label: "Zůstatek",
    numeric: true,
    width: 160,
    hiddenByDefault: true,
    value: (row) => row.debit - row.credit,
  },
];

const CATALOG: AccountCatalogItem[] = [
  { code: "2", name: "Finanční účty" },
  { code: "21", name: "Peníze" },
  { code: "22", name: "Účty v bankách" },
  { code: "3", name: "Zúčtovací vztahy" },
  { code: "31", name: "Pohledávky" },
  { code: "32", name: "Závazky" },
  { code: "5", name: "Náklady" },
  { code: "50", name: "Spotřebované nákupy" },
  { code: "51", name: "Služby" },
  { code: "52", name: "Osobní náklady" },
  { code: "54", name: "Jiné provozní náklady" },
];

const COSTS = [
  { id: "50", label: "Spotřebované nákupy", hint: "50", value: 184250.4 },
  { id: "51", label: "Služby", hint: "51", value: 412880 },
  { id: "52", label: "Osobní náklady", hint: "52", value: 1265400 },
  { id: "54", label: "Jiné provozní náklady", hint: "54", value: 38215.75 },
  { id: "55", label: "Odpisy a opravné položky", hint: "55", value: -12500 },
];

/** Ukázky pro výkazy: osnova s úrovněmi, výběr prefixu, graf rozboru a štítky filtrů. */
export function ReportsShowcase() {
  const [depth, setDepth] = useState(1);
  const [prefix, setPrefix] = useState<string>("51");
  const [group, setGroup] = useState<string | null>("51");
  const [onlyActive, setOnlyActive] = useState(true);

  const chips = useMemo<FilterChip[]>(() => {
    const list: FilterChip[] = [{ id: "period", label: "Období", value: "01–09/2026" }];
    if (group) {
      const item = COSTS.find((cost) => cost.id === group);
      list.push({ id: "group", label: "Skupina", value: `${group} – ${item?.label ?? ""}`, onRemove: () => setGroup(null) });
    }
    if (onlyActive) list.push({ id: "active", label: "Jen účty s pohybem", onRemove: () => setOnlyActive(false) });
    return list;
  }, [group, onlyActive]);

  return (
    <>
      <ShowcaseSection
        title="Stromová mřížka (TreeGrid)"
        description="Úrovně rozbalení Třídy · Skupiny · Účty · Vše, zvýraznění naposledy rozbaleného uzlu, výběr sloupců (Zůstatek je skrytý), zoom, akce Nový vpravo od zoomu a export do Excelu se souhrnem pod dětmi."
      >
        <TreeGrid
          title="Účtová osnova"
          storageKey="showcase-chart-tree"
          rows={MOCK_CHART_TREE}
          columns={COLUMNS}
          expandLevels={LEVELS}
          expandDepth={depth}
          onExpandDepthChange={setDepth}
          exportName="uctova-osnova"
          exportMeta={{ company: "Slivka Accounting s.r.o.", period: "Rok 2026" }}
          onRowOpen={(row) => toast.info(`Otevřít účet ${formatAccountCode(row.code)}`)}
          actions={
            <Button size="sm" onClick={() => toast.info("Nový účet")}>
              Nový účet
            </Button>
          }
        />
      </ShowcaseSection>

      <ShowcaseSection
        title="Výběr účtu včetně třídy a skupiny"
        description="AccountSelect s allowLevels vrací i prefix třídy („5“) nebo skupiny („51“) s názvem z číselníku."
      >
        <div className="grid max-w-md gap-1.5">
          <Label>Účet nebo skupina</Label>
          <AccountSelect
            accounts={MOCK_ACCOUNTS}
            catalog={CATALOG}
            allowLevels={["class", "group", "synthetic", "analytic"]}
            value={prefix}
            onChange={setPrefix}
          />
          <p className="text-sm text-muted-foreground">Vybraná hodnota: {prefix || "—"}</p>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title="Rozbor nákladů (BarBreakdownChart) a štítky filtrů (FilterChips)"
        description="Klik na pruh vybere skupinu jako filtr, opakovaný klik výběr zruší. Záporné hodnoty jsou červené a šrafované."
      >
        <div className="flex flex-col gap-3">
          <FilterChips
            chips={chips}
            onClearAll={() => {
              setGroup(null);
              setOnlyActive(false);
            }}
          />
          <BarBreakdownChart items={COSTS} variant="cost" selectedId={group} onSelect={(id) => setGroup(id)} />
        </div>
      </ShowcaseSection>
    </>
  );
}
