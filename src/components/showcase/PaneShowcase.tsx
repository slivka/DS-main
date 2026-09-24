import { useMemo, useState } from "react";
import { BookOpen, FileText, LayoutGrid, ReceiptText, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  DataGrid,
  DocumentForm,
  documentFieldsForType,
  LayoutSwitcher,
  PaneLayout,
  PaneLink,
  PaneTabsProvider,
  PinnedBar,
  maxPaneLayout,
  requiredPaneWidth,
  usePane,
  usePaneTabs,
  useTabDirty,
  useTabDraft,
  type DataGridColumn,
  type DocumentHeaderValue,
  type JournalLine,
  type PaneTab,
  type PaneTabsState,
  type TabKind,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { formatAmount, formatDate } from "@/lib/format";
import {
  MOCK_ACCOUNTS,
  MOCK_BOOKS,
  MOCK_DIMENSIONS,
  MOCK_JOURNAL,
  MOCK_PARTNERS,
  type JournalEntry,
} from "@/lib/mock/accounting";

const PREVIEW_WIDTHS = [1100, 1440, 1920] as const;
const MIN_PANE_WIDTH = 420;

const ICONS = { issued: FileText, received: ReceiptText, journal: BookOpen, partners: Users, cash: Wallet, document: LayoutGrid } as const;
type IconName = keyof typeof ICONS;

const PAGES: { route: string; title: string; icon: IconName }[] = [
  { route: "/faktury-vydane", title: "Vydané faktury", icon: "issued" },
  { route: "/faktury-prijate", title: "Přijaté faktury", icon: "received" },
  { route: "/denik", title: "Účetní deník", icon: "journal" },
  { route: "/partneri", title: "Partneři", icon: "partners" },
  { route: "/pokladna", title: "Pokladna", icon: "cash" },
];

/** Záložka s pevným id (kvůli shodě při vykreslení na serveru). */
function fixedTab(id: string, route: string, title: string, icon: IconName, kind: TabKind = "list", params?: Record<string, unknown>): PaneTab {
  return { id, route, params, kind, title, icon, history: [{ route, params, title }], historyIndex: 0, lastUsed: 0 };
}

const INITIAL: PaneTabsState = {
  version: 2,
  layout: 3,
  widths: [1 / 3, 1 / 3, 1 / 3],
  active: "pane-a",
  hiddenPanes: null,
  panes: [
    {
      id: "pane-a",
      activeTab: "tab-doc",
      tabs: [
        fixedTab("tab-issued", "/faktury-vydane", "Vydané faktury", "issued"),
        fixedTab("tab-doc", "/doklad", "Přijatá faktura FP2026000012", "document", "record", { id: "FP2026000012" }),
      ],
    },
    {
      id: "pane-b",
      activeTab: "tab-journal",
      tabs: [
        fixedTab("tab-journal", "/denik", "Účetní deník", "journal"),
        fixedTab("tab-partners", "/partneri", "Partneři", "partners"),
        fixedTab("tab-received", "/faktury-prijate", "Přijaté faktury", "received"),
      ],
    },
    {
      id: "pane-c",
      activeTab: "tab-cash",
      tabs: [fixedTab("tab-cash", "/pokladna", "Pokladna", "cash")],
    },
  ],
};

function PaneGrid({ title, storageKey }: { title: string; storageKey: string }) {
  const columns = useMemo<DataGridColumn<JournalEntry>[]>(
    () => [
      { id: "date", label: "Datum", width: 110, value: (row) => row.date, render: (row) => formatDate(row.date) },
      { id: "document", label: "Doklad", width: 130, value: (row) => row.document },
      { id: "amount", label: "Částka", numeric: true, width: 140, value: (row) => row.debit, render: (row) => formatAmount(row.debit, 2) },
    ],
    [],
  );
  return <DataGrid<JournalEntry> storageKey={storageKey} title={title} rows={MOCK_JOURNAL.slice(0, 25)} columns={columns} rowKey={(row) => row.id} paginated />;
}

const INITIAL_HEADER: DocumentHeaderValue = {
  bookId: "b-fp",
  number: "FP2026000012",
  issueDate: "2026-01-15",
  taxDate: "2026-01-15",
  dueDate: "2026-01-29",
  partnerId: "p1",
  variableSymbol: "2026000012",
  description: "Servisní práce za leden 2026",
  accountingDate: "2026-01-15",
  currency: "CZK",
  rate: 1,
  amountTotal: 4800,
  totalMode: "sum",
};
const INITIAL_LINES: JournalLine[] = [{ id: "l1", debitAccount: "518001", creditAccount: "321001", amount: 4800, text: "Servisní práce" }];

/** Doklad, jehož rozepsaný stav přežije přepnutí i přesun záložky do jiného panelu. */
function PaneDocument() {
  const pane = usePane();
  const [header, setHeader] = useTabDraft(pane?.tabId, INITIAL_HEADER, "header");
  const [lines, setLines] = useTabDraft(pane?.tabId, INITIAL_LINES, "lines");
  const dirty = JSON.stringify(header) !== JSON.stringify(INITIAL_HEADER) || JSON.stringify(lines) !== JSON.stringify(INITIAL_LINES);
  useTabDirty(dirty);

  return (
    <DocumentForm
      title="Přijatá faktura FP2026000012"
      description={dirty ? "Doklad má neuložené změny – přetáhněte záložku do jiného panelu, změny zůstanou." : "Změňte popis a přetáhněte záložku do jiného panelu."}
      value={header}
      onChange={setHeader}
      lines={lines}
      onLinesChange={setLines}
      books={MOCK_BOOKS}
      accounts={MOCK_ACCOUNTS}
      partners={MOCK_PARTNERS}
      dimensions={MOCK_DIMENSIONS}
      fields={documentFieldsForType("FP")}
      status="filed"
    />
  );
}

/** Ukázkové menu – odkazy otevírají záložky (Cmd/Ctrl + klik, prostřední tlačítko, Cmd/Ctrl + Shift + klik). */
function DemoMenu() {
  const tabs = usePaneTabs();
  const Doc = ICONS.document;
  return (
    <nav aria-label="Ukázkové menu" className="flex w-48 shrink-0 flex-col gap-0.5 border-r bg-card p-2 text-sm">
      {PAGES.map((page) => {
        const Icon = ICONS[page.icon];
        return (
          <PaneLink
            key={page.route}
            route={page.route}
            options={{ title: page.title, icon: page.icon, kind: "list" }}
            className="flex h-8 items-center gap-2 rounded-md px-2 hover-surface"
          >
            <Icon className="size-4" />
            {page.title}
          </PaneLink>
        );
      })}
      <PaneLink
        route="/doklad"
        params={{ id: "FP2026000012" }}
        options={{ title: "Přijatá faktura FP2026000012", shortTitle: "FP2026000012", icon: "document", kind: "record" }}
        className="flex h-8 items-center gap-2 rounded-md px-2 hover-surface"
      >
        <Doc className="size-4" />
        Doklad FP2026000012
      </PaneLink>
      <div className="mt-auto space-y-1 border-t pt-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => {
            for (let index = 1; index <= 11; index += 1) {
              tabs?.openTab("/denik", { strana: index }, { target: "newTab", title: `Účetní deník – strana ${index}`, shortTitle: `Deník ${index}`, icon: "journal" });
            }
          }}
        >
          Test limitu záložek
        </Button>
      </div>
    </nav>
  );
}

/** Ukázka režimu více oken se záložkami. */
export function PaneShowcase() {
  const [state, setState] = useState<PaneTabsState>(INITIAL);
  const [previewWidth, setPreviewWidth] = useState<(typeof PREVIEW_WIDTHS)[number]>(1440);
  const [pinned, setPinned] = useState<string[]>(["/faktury-vydane", "/faktury-prijate", "/denik", "/partneri"]);
  const [demoKey, setDemoKey] = useState(0);
  const maxLayout = maxPaneLayout(previewWidth - 192, MIN_PANE_WIDTH);

  const renderTab = (tab: PaneTab) => {
    if (tab.route === "/doklad") return <PaneDocument />;
    return <PaneGrid title={tab.title ?? "Doklady"} storageKey={`pane-${tab.route.replace(/\W+/g, "-")}`} />;
  };

  return (
    <PaneTabsProvider
      key={demoKey}
      state={state}
      onChange={setState}
      onSaveTab={() => {
        toast.success("Doklad uložen");
        return true;
      }}
      onNewTabRequest={() => toast.info("Alt+T otevře vyhledávání; vybraná stránka se otevře do nové záložky.")}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
          <ShowcaseLayoutSwitcher maxLayout={maxLayout} />
          <div className="flex items-center gap-1">
            {PREVIEW_WIDTHS.map((width) => (
              <Button key={width} type="button" size="sm" variant={previewWidth === width ? "default" : "outline"} onClick={() => setPreviewWidth(width)}>
                {width.toLocaleString("cs-CZ")} px
              </Button>
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => {
              setState(INITIAL);
              setDemoKey((value) => value + 1);
            }}
          >
            Obnovit ukázku
          </Button>
          <span className="text-sm text-muted-foreground">Zkratky: Alt+1/2/3 · Alt+←/→ · Alt+W · Alt+Shift+W · Alt+T</span>
        </div>

        <div className="overflow-auto rounded-lg border bg-muted p-3">
          <div className="mx-auto overflow-hidden rounded-md border bg-card" style={{ width: `${previewWidth}px` }}>
            <DemoPinnedBar pinned={pinned} setPinned={setPinned} />
            <div className="flex h-[560px]">
              <DemoMenu />
              <PaneLayout
                minPaneWidth={MIN_PANE_WIDTH}
                renderTab={renderTab}
                getTabIcon={(tab) => ICONS[tab.icon as IconName]}
                isPinned={(tab) => pinned.includes(tab.route)}
                onTogglePin={(tab) => setPinned((ids) => (ids.includes(tab.route) ? ids.filter((id) => id !== tab.route) : [...ids, tab.route]))}
              />
            </div>
          </div>
        </div>
      </div>
    </PaneTabsProvider>
  );
}

/** Připnuté stránky – klik nahradí aktivní záložku, Ctrl/Cmd nebo prostřední tlačítko otevře novou. */
function DemoPinnedBar({ pinned, setPinned }: { pinned: string[]; setPinned: (update: (ids: string[]) => string[]) => void }) {
  const tabs = usePaneTabs();
  if (!tabs) return null;
  const active = tabs.state.panes.find((pane) => pane.id === tabs.state.active);
  const activeRoute = active?.tabs.find((tab) => tab.id === active.activeTab)?.route;
  return (
    <PinnedBar
      items={PAGES.filter((page) => pinned.includes(page.route)).map((page) => ({
        id: page.route,
        title: page.title,
        icon: ICONS[page.icon],
        open: tabs.state.panes.some((pane) => pane.tabs.some((tab) => tab.route === page.route)),
        active: activeRoute === page.route,
      }))}
      onOpen={(id, { newPane }) => {
        const page = PAGES.find((item) => item.route === id);
        if (page) tabs.openTab(page.route, undefined, { target: newPane ? "newTab" : "replace", title: page.title, icon: page.icon });
      }}
      onUnpin={(id) => setPinned((ids) => ids.filter((item) => item !== id))}
      onReorder={(ids) => setPinned(() => ids)}
    />
  );
}

function ShowcaseLayoutSwitcher({ maxLayout }: { maxLayout: 1 | 2 | 3 }) {
  const tabs = usePaneTabs();
  if (!tabs) return null;
  return (
    <LayoutSwitcher
      value={tabs.state.layout}
      maxLayout={maxLayout}
      requiredWidths={{ 2: requiredPaneWidth(2, MIN_PANE_WIDTH) + 192, 3: requiredPaneWidth(3, MIN_PANE_WIDTH) + 192 }}
      onChange={tabs.setLayout}
    />
  );
}
