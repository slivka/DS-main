/** Navázané sekce seznamu · vlastní demo stav · nesmí se distribuovat. */
import { useState } from "react";
import { History, Link, MessageSquare, Paperclip } from "lucide-react";
import { Button, DataGrid, PageHeader, RecordSidePanel } from "../ds";
import { PaneTabsProvider, usePaneTabs } from "../ds/panes/pane-context";
import type { LinkedSourceRecord, PaneTabsState } from "../ds/panes/pane-state";
import { useLinkedSelection } from "../../hooks/use-linked-selection";
import { DOCUMENTS } from "./record-panel-data";
import { useRecordPanelContent } from "./record-panel-content";

type Row = (typeof DOCUMENTS)[number];
const toRecord = (row: Row): LinkedSourceRecord => ({
  recordKey: row.id, title: row.number, route: "/components/record-panel", params: { id: row.id },
});
const INITIAL: PaneTabsState = {
  version: 2, layout: 1, active: "list-pane",
  panes: [{ id: "list-pane", activeTab: "list-source", tabs: [{
    id: "list-source", route: "/components/record-panel", title: "Doklady", kind: "list",
    history: [], historyIndex: 0, lastUsed: 0, openerTabId: null,
  }] }],
};
const INDICATORS = [
  { id: "history", label: "Historie", icon: History, count: (_row: Row) => 0 },
  { id: "attachments", label: "Přílohy", icon: Paperclip, count: (row: Row) => row.files },
  { id: "notes", label: "Poznámky", icon: MessageSquare, count: (row: Row) => row.notes },
  { id: "linked", label: "Propojené", icon: Link, count: (_row: Row) => 0 },
];

function LinkedListContent() {
  const panes = usePaneTabs();
  const [selected, setSelected] = useState<Row[]>([]);
  const [explicit, setExplicit] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState("history");
  const follow = useLinkedSelection(selected, { sourceTabId: "list-source", toRecord });
  const active = follow.kind === "single" ? follow.record : explicit;
  const content = useRecordPanelContent("draft", "");
  const sourceExists = panes?.state.panes.some((pane) => pane.tabs.some((tab) => tab.id === "list-source"));
  const tabs = panes?.state.panes.flatMap((pane) => pane.tabs).filter((tab) => tab.kind === "linked") ?? [];
  const openLinked = (id: string, row: Row) => {
    const label = INDICATORS.find((indicator) => indicator.id === id)?.label ?? id;
    panes?.openLinkedTab("list-source", { id, label }, toRecord(row));
  };
  return <section data-testid="linked-list-showcase" className="min-w-0 space-y-3">
    <PageHeader title="Navázané okno ze seznamu" />
    <div className="grid min-w-0 gap-4 lg:grid-cols-2">
      {sourceExists ? <div className="min-w-0 space-y-2">
        <Button variant="outline" onClick={() => panes?.closeTab("list-source")}>Zavřít seznam</Button>
        <RecordSidePanel open={open} onOpenChange={setOpen} activeTab={section}
          onActiveTabChange={setSection} header={active?.number ?? "Doklady"} tabs={content.tabs}
          onOpenInAdjacentPane={active ? () => openLinked(section, active) : undefined}>
          <DataGrid rows={DOCUMENTS} rowKey={(row) => row.id} storageKey="linked-list-demo"
            paginated={false} selectable selectMode selectedKeys={selected.map((row) => row.id)}
            onSelectedKeysChange={(keys) => { setSelected(DOCUMENTS.filter((row) => keys.includes(row.id))); setOpen(true); }}
            onIndicatorClick={(row, id) => { setExplicit(row); setSection(id); openLinked(id, row); }}
            columns={[{ id: "number", label: "Doklad", value: (row) => row.number },
              { id: "signals", label: "Indikátory", type: "record-indicators", indicators: INDICATORS }]} />
        </RecordSidePanel>
      </div> : null}
      {tabs.map((tab) => <section key={tab.id} className="min-w-0 space-y-3 border-l border-border pl-3">
        <PageHeader title={tab.title ?? ""} />
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" aria-pressed={tab.linked?.pinned}
            onClick={() => panes?.setLinkedPinned(tab.id, !tab.linked?.pinned)}>
            {tab.linked?.pinned ? "Uvolnit záznam" : "Připnout záznam"}
          </Button>
          <Button variant="outline" onClick={() => panes?.returnLinkedTab(tab.id)}>Vrátit do panelu</Button>
        </div>
        {content.tabs.find((entry) => entry.id === tab.linked?.section)?.content}
      </section>)}
    </div>
  </section>;
}

export function LinkedListShowcase() {
  const [state, setState] = useState(INITIAL);
  return <PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
    <LinkedListContent />
  </PaneTabsProvider>;
}