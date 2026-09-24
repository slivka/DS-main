import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, FileText, LayoutGrid, ReceiptText, Search, Users, Wallet } from "lucide-react";
import { toast } from "sonner";

import {
  DataGrid,
  DraftRestoredBanner,
  LayoutMenu,
  LayoutSwitcher,
  PageHeader,
  PaneLayout,
  PaneLink,
  PaneTabsProvider,
  PinnedBar,
  createTab,
  maxPaneLayout,
  parsePaneTabs,
  persistDrafts,
  requiredPaneWidth,
  serializePaneTabs,
  setTabDirty,
  usePane,
  usePaneTabs,
  useTabDirty,
  useTabDraft,
  type DataGridColumn,
  type LayoutSnapshot,
  type PaneTab,
  type PaneTabsState,
  type SavedLayoutItem,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAmount, formatDate } from "@/lib/format";
import { MOCK_JOURNAL, type JournalEntry } from "@/lib/mock/accounting";

const PREVIEW_WIDTHS = [1100, 1440, 1920] as const;
const MIN_PANE_WIDTH = 420;
const STATE_KEY = "ds-showcase:pane-tabs:v216";
const LAYOUTS_KEY = "ds-showcase:layouts:v216";

const ICONS = { issued: FileText, received: ReceiptText, journal: BookOpen, partners: Users, cash: Wallet, document: LayoutGrid } as const;
type IconName = keyof typeof ICONS;

const PAGES: { route: string; title: string; icon: IconName }[] = [
  { route: "/faktury-vydane", title: "Vydané faktury", icon: "issued" },
  { route: "/faktury-prijate", title: "Přijaté faktury", icon: "received" },
  { route: "/denik", title: "Účetní deník", icon: "journal" },
  { route: "/partneri", title: "Partneři", icon: "partners" },
  { route: "/pokladna", title: "Pokladna", icon: "cash" },
];

/** Výchozí stav: 1 panel s jednou záložkou (pevné id kvůli vykreslení na serveru). */
function initialState(): PaneTabsState {
  const tab: PaneTab = { ...createTab({ route: "/faktury-vydane", title: "Vydané faktury", icon: "issued" }, 0), id: "tab-start" };
  return { version: 2, layout: 1, widths: [1], active: "pane-a", hiddenPanes: null, panes: [{ id: "pane-a", activeTab: tab.id, tabs: [tab] }] };
}

type Invoice = { id: string; number: string; date: string; partner: string; amount: number; text: string; updatedAt: string };

const INVOICES: Invoice[] = MOCK_JOURNAL.slice(0, 30).map((row: JournalEntry, index) => ({
  id: `FV${String(2026000100 + index)}`,
  number: `FV${String(2026000100 + index)}`,
  date: row.date,
  partner: row.partner,
  amount: row.debit,
  text: row.text,
  updatedAt: "2026-09-01T08:00:00Z",
}));

const detailTitle = (id: string) => (id.startsWith("new-") ? "Nová faktura" : `Faktura ${id}`);

/** Seznam faktur: klik = openRecord, Cmd/Ctrl = nová záložka, Cmd/Ctrl+Shift = sousední panel. */
function InvoiceList({ title }: { title: string }) {
  const pane = usePane();
  const tabs = usePaneTabs();
  const modifiers = useRef({ metaKey: false, ctrlKey: false, shiftKey: false });
  const counter = useRef(1);

  useEffect(() => {
    if (!pane || !tabs) return;
    return tabs.registerRecordNav(pane.tabId, () => INVOICES.map((invoice) => ({ route: "/faktura", params: { id: invoice.id }, title: detailTitle(invoice.id), icon: "document" })));
  }, [pane?.tabId]);

  const columns = useMemo<DataGridColumn<Invoice>[]>(
    () => [
      { id: "number", label: "Doklad", width: 140, value: (row) => row.number, render: (row) => <span className="font-mono">{row.number}</span> },
      { id: "date", label: "Datum", width: 110, value: (row) => row.date, render: (row) => formatDate(row.date) },
      { id: "partner", label: "Partner", width: 180, value: (row) => row.partner },
      { id: "amount", label: "Částka", numeric: true, width: 130, value: (row) => row.amount, render: (row) => formatAmount(row.amount, 2) },
    ],
    [],
  );

  const open = (id: string, isNew = false) =>
    tabs?.openRecord("/faktura", { id }, { fromTabId: pane?.tabId, isNew, modifiers: modifiers.current, title: detailTitle(id), shortTitle: id.startsWith("new-") ? "Nová" : id, icon: "document" });

  return (
    <div
      className="space-y-3"
      onPointerDownCapture={(event) => {
        modifiers.current = { metaKey: event.metaKey, ctrlKey: event.ctrlKey, shiftKey: event.shiftKey };
      }}
    >
      <PageHeader
        title={title}
        menuActions={[{ label: "Výkazy", onClick: () => toast.info("Ukázková akce stránky") }]}
      />
      <DataGrid<Invoice> storageKey="pane-showcase-invoices" rows={INVOICES} columns={columns} rowKey={(row) => row.id} onRowClick={(row) => open(row.id)} addAction={{ label: "Přidat", onClick: () => open(`new-${counter.current++}`, true) }} paginated />
    </div>
  );
}

/** Obecná stránka seznamu (menu). */
function PageList({ title }: { title: string }) {
  const columns = useMemo<DataGridColumn<JournalEntry>[]>(
    () => [
      { id: "date", label: "Datum", width: 110, value: (row) => row.date, render: (row) => formatDate(row.date) },
      { id: "document", label: "Doklad", width: 130, value: (row) => row.document },
      { id: "amount", label: "Částka", numeric: true, width: 140, value: (row) => row.debit, render: (row) => formatAmount(row.debit, 2) },
    ],
    [],
  );
  return (
    <div className="space-y-3">
      <PageHeader title={title} menuActions={[{ label: "Importovat", onClick: () => toast.info("Ukázkový import") }]} />
      <DataGrid<JournalEntry> storageKey={`pane-showcase-${title}`} rows={MOCK_JOURNAL.slice(0, 25)} columns={columns} rowKey={(row) => row.id} paginated />
    </div>
  );
}

type InvoiceForm = { partner: string; amount: string; text: string };

/** Detail faktury: rozepsaný stav se ukládá do IndexedDB a po obnovení stránky se nabídne zpět. */
function InvoiceDetail({ id }: { id: string }) {
  const pane = usePane();
  const invoice = INVOICES.find((item) => item.id === id);
  const base: InvoiceForm = { partner: invoice?.partner ?? "", amount: invoice ? String(invoice.amount) : "", text: invoice?.text ?? "" };
  const [form, setForm, draft] = useTabDraft<InvoiceForm>(pane?.tabId, base, "form", {
    route: "/faktura",
    params: { id },
    recordVersion: invoice?.updatedAt ?? null,
  });
  const dirty = JSON.stringify(form) !== JSON.stringify(base);
  useTabDirty(dirty);

  const save = () => {
    if (pane) setTabDirty(pane.tabId, false);
    draft.markSaved();
    toast.success("Faktura uložena (ukázka)");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={detailTitle(id)}
        menuActions={[{ label: "Uložit", disabled: !dirty, disabledReason: "Nejsou žádné změny", onClick: save }]}
      />
      {draft.restored ? <DraftRestoredBanner savedAt={draft.restored.savedAt} onDiscard={draft.discard} /> : null}
      {draft.conflict ? <DraftRestoredBanner variant="conflict" savedAt={draft.conflict.savedAt} onShowDraft={draft.applyConflict} onDiscard={draft.discard} /> : null}
      <div className="grid max-w-xl gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`partner-${id}`}>Partner</Label>
          <Input id={`partner-${id}`} value={form.partner} onChange={(event) => setForm({ ...form, partner: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`text-${id}`}>Popis</Label>
          <Textarea id={`text-${id}`} value={form.text} onChange={(event) => setForm({ ...form, text: event.target.value })} />
        </div>
        <p className="text-sm text-muted-foreground">Změňte popis a obnovte stránku prohlížeče – rozepsaná verze se po chvíli (1 s) uloží a po obnovení se nabídne zpět.</p>
      </div>
    </div>
  );
}

/** Ukázkové menu – klik nahrazuje aktivní záložku, Cmd/Ctrl + klik otevře novou. */
function DemoMenu({ layouts, setLayouts }: { layouts: StoredLayout[]; setLayouts: (update: (items: StoredLayout[]) => StoredLayout[]) => void }) {
  const tabs = usePaneTabs();
  return (
    <nav aria-label="Ukázkové menu" className="flex w-48 shrink-0 flex-col gap-0.5 border-r bg-card p-2 text-sm">
      <div className="mb-2 flex items-center gap-1">
        <div className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-md border px-2 text-muted-foreground"><Search className="size-4" /><span className="truncate">Hledat v menu…</span></div>
        <ShowcaseLayoutMenu layouts={layouts} setLayouts={setLayouts} icon />
      </div>
      {PAGES.map((page) => {
        const Icon = ICONS[page.icon];
        return (
          <PaneLink key={page.route} route={page.route} options={{ title: page.title, icon: page.icon, kind: "list" }} className="flex h-8 items-center gap-2 rounded-md px-2 hover-surface">
            <Icon className="size-4" />
            {page.title}
          </PaneLink>
        );
      })}
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

type StoredLayout = SavedLayoutItem & { snapshot: LayoutSnapshot | null };

/** Ukázka režimu více oken: rovnocenné záložky, maximalizace, koncepty a uložená rozložení. */
export function PaneShowcase() {
  const [state, setState] = useState<PaneTabsState>(initialState);
  const [previewWidth, setPreviewWidth] = useState<(typeof PREVIEW_WIDTHS)[number]>(1440);
  const [pinned, setPinned] = useState<string[]>(["/faktury-vydane", "/denik"]);
  const [layouts, setLayouts] = useState<StoredLayout[]>([]);
  const [demoKey, setDemoKey] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const maxLayout = maxPaneLayout(previewWidth - 192, MIN_PANE_WIDTH);

  // Stav záložek a rozložení se v ukázce drží v localStorage (v aplikaci v databázi), koncepty v IndexedDB.
  useEffect(() => {
    void persistDrafts({ userKey: "showcase", companyId: "demo", maxAgeDays: 7 });
    try {
      const saved = parsePaneTabs(window.localStorage.getItem(STATE_KEY));
      if (saved) setState(saved);
      const savedLayouts = window.localStorage.getItem(LAYOUTS_KEY);
      if (savedLayouts) setLayouts(JSON.parse(savedLayouts));
    } catch {
      /* ukázka */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) window.localStorage.setItem(STATE_KEY, serializePaneTabs(state));
  }, [state, loaded]);
  useEffect(() => {
    if (loaded) window.localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
  }, [layouts, loaded]);

  const renderTab = (tab: PaneTab) => {
    if (tab.route === "/faktura") return <InvoiceDetail id={String(tab.params?.id ?? "")} />;
    if (tab.route === "/faktury-vydane") return <InvoiceList title={tab.title ?? "Vydané faktury"} />;
    return <PageList title={tab.title ?? "Stránka"} />;
  };

  return (
    <PaneTabsProvider
      key={demoKey}
      state={state}
      onChange={setState}
      onSaveTab={() => {
        toast.success("Uloženo");
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
              setState(initialState());
              setDemoKey((value) => value + 1);
            }}
          >
            Obnovit ukázku
          </Button>
          <span className="text-sm text-muted-foreground">Alt+M maximalizace · Esc obnovit · Alt+Shift+T znovu otevřít · Alt+L rozložení · Alt+1/2/3 · Alt+W</span>
        </div>
        <ol className="grid gap-1 rounded-lg border bg-card p-3 text-sm text-muted-foreground md:grid-cols-2">
          <li>1. Lišta je viditelná i s jedinou záložkou. Klik v menu ji nahradí; ← vrátí předchozí stránku.</li>
          <li>2. Cmd/Ctrl + klik otevře novou záložku; Cmd/Ctrl + Shift + klik sousední panel.</li>
          <li>3. Ve 2 panelech další řádek nahradí čistý detail vpravo; při změně otevře nový detail.</li>
          <li>4. Maximalizujte panel ikonou nebo Alt+M, obnovte Esc.</li>
          <li>5. Rozepište popis faktury a obnovte stránku – nabídne se rozepsaná verze.</li>
          <li>6. Nabídka ⋯ vedle hledání ukládá a obnovuje rozložení.</li>
        </ol>

        <div className="overflow-auto rounded-lg border bg-muted p-3">
          <div className="mx-auto overflow-hidden rounded-md border bg-card" style={{ width: `${previewWidth}px` }}>
            <DemoPinnedBar pinned={pinned} setPinned={setPinned} />
            <div className="flex h-[600px]">
              <DemoMenu layouts={layouts} setLayouts={setLayouts} />
              <PaneLayout
                minPaneWidth={MIN_PANE_WIDTH}
                renderTab={renderTab}
                getTabIcon={(tab) => ICONS[tab.icon as IconName]}
              />
            </div>
          </div>
        </div>
      </div>
    </PaneTabsProvider>
  );
}

function ShowcaseLayoutMenu({ layouts, setLayouts, icon = false }: { layouts: StoredLayout[]; setLayouts: (update: (items: StoredLayout[]) => StoredLayout[]) => void; icon?: boolean }) {
  const tabs = usePaneTabs();
  return (
    <LayoutMenu
      items={layouts}
      trigger={icon ? "icon" : "default"}
      onSave={({ name, isDefault, snapshot }) => {
        const item: StoredLayout = { id: `layout-${Date.now()}`, name, isDefault, panes: snapshot?.layout ?? 1, snapshot };
        setLayouts((items) => [...items.map((other) => (isDefault ? { ...other, isDefault: false } : other)), item]);
        toast.success(`Rozložení „${name}“ uloženo`);
      }}
      onApply={(id) => {
        const item = layouts.find((layout) => layout.id === id);
        if (!item?.snapshot || !tabs) return;
        const skipped = tabs.applyLayout(item.snapshot, { keepDirty: true });
        if (skipped.length) toast.info(`Rozepsané záložky zůstaly na konci panelu 1: ${skipped.length.toLocaleString("cs-CZ")}`);
      }}
      onUpdate={(id, patch) =>
        setLayouts((items) =>
          items.map((item) => {
            if (item.id !== id) return patch.isDefault ? { ...item, isDefault: false } : item;
            const snapshot = patch.snapshot !== undefined ? patch.snapshot : item.snapshot;
            return { ...item, ...(patch.name ? { name: patch.name } : {}), ...(patch.isDefault !== undefined ? { isDefault: patch.isDefault } : {}), snapshot, panes: snapshot?.layout ?? item.panes };
          }),
        )
      }
      onDelete={(id) => setLayouts((items) => items.filter((item) => item.id !== id))}
      onReorder={(ids) => setLayouts((items) => ids.map((id) => items.find((item) => item.id === id)!).filter(Boolean))}
    />
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
