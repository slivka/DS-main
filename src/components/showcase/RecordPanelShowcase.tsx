/** Ukázka panelu · vlastní demo kompozici · nesmí se distribuovat aplikacím. */
import { useEffect, useMemo, useRef, useState } from "react";
import { MessageSquare, Paperclip } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button, DataGrid, DocumentForm, MultiSelectionPanel, OptionSelect, PageHeader, PinnedNoteBar, RecordDialog, RecordPanelTriggers, PanelToggleButton, RecordNotes, RecordSidePanel, type DataGridColumn } from "../ds";
import { useFollowSelection } from "../../hooks/use-follow-selection";
import { useFileDrop } from "../../hooks/use-file-drop";
import { NoticeBar } from "../ds/feedback/notice-bar";
import { ACCEPT, DOCUMENTS, LIMIT } from "./record-panel-data";
import { useRecordPanelContent, type DemoPermission } from "./record-panel-content";
import { PURCHASE_INVOICE_HEADER } from "./document-form-showcase-data";
import { MOCK_ACCOUNTS, MOCK_PARTNERS } from "../../lib/mock/accounting";
import { LinkedListShowcase } from "./LinkedListShowcase";

type DemoRow = (typeof DOCUMENTS)[number];
const columns: DataGridColumn<DemoRow>[] = [
  { id: "number", label: "Doklad", value: (row) => row.number },
  { id: "name", label: "Popis", value: (row) => row.name },
  {
    id: "signals",
    label: "Indikátory",
    type: "record-indicators",
    defaultVisible: true,
    indicators: [
      { id: "attachments", label: "Přílohy", icon: Paperclip, count: (row) => row.files },
      { id: "notes", label: "Poznámky", icon: MessageSquare, count: (row) => row.notes },
    ],
  },
];
export function RecordPanelShowcase() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("attachments");
  const [pinned, setPinned] = useState(false);
  const [size, setSize] = useState(384);
  const [status, setStatus] = useState<DemoPermission>("draft");
  const [narrow, setNarrow] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [adjacent, setAdjacent] = useState(false);
  const [sourceUrl, setSourceUrl] = useState("");
  const [value, setValue] = useState(PURCHASE_INVOICE_HEADER);
  const [selected, setSelected] = useState<DemoRow[]>([]);
  const [gridOpen, setGridOpen] = useState(false);
  const [gridTab, setGridTab] = useState("attachments");
  const [explicit, setExplicit] = useState<DemoRow | null>(null);
  const [pinnedRow, setPinnedRow] = useState<DemoRow | null>(null);
  const [bulkNotes, setBulkNotes] = useState(false);
  const follow = useFollowSelection(selected);
  const followed = follow.kind === "single" ? follow.record : null;
  const active = pinned ? pinnedRow : (followed ?? explicit);
  const content = useRecordPanelContent(status, sourceUrl);
  const form = useRef<HTMLDivElement>(null);
  const [rejection, setRejection] = useState<string[]>([]);
  useFileDrop(form, {
    accept: ACCEPT,
    maxSize: LIMIT,
    disabled: status === "read",
    onFiles: (files, refused) => {
      content.addFiles(files);
      setRejection(refused.map((item) => `${item.file.name}: ${item.reasons.join(", ")}`));
      setTab("attachments");
      setOpen(true);
    },
  });
  useEffect(() => {
    // PDF ukázky je v paměti, URL se při odpojení vždy uvolní.
    const pdf = new jsPDF();
    pdf.setTextColor(18, 48, 74);
    pdf.setFontSize(20);
    pdf.text("FAKTURA 2026/0142", 20, 25);
    pdf.setFontSize(12);
    pdf.text("Kancelarske potreby", 20, 50);
    pdf.text("Celkem: 12 100,00", 20, 65);
    const url = URL.createObjectURL(pdf.output("blob"));
    setSourceUrl(url);
    return () => URL.revokeObjectURL(url);
  }, []);
  const indicators = useMemo(
    () => content.tabs.map(({ id, label, icon, count }) => ({ id, label, icon, count })),
    [content.tabs],
  );
  const trigger = (
    <RecordPanelTriggers
      indicators={indicators}
      activeTab={open ? tab : undefined}
      onIndicatorClick={(id) => {
        setTab(id);
        setOpen(true);
      }}
    />
  );
  return (
    <div data-testid="record-panel-showcase" data-ready={Boolean(sourceUrl)} className="space-y-6">
      <PageHeader
        title="Panel záznamu"
        panelToggle={
          <PanelToggleButton
            open={open}
            indicator
            tooltip="Panel · Přílohy 2 · Poznámky 2"
            onToggle={() => setOpen(!open)}
          />
        }
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <OptionSelect
            value={status}
            onChange={(next) => setStatus(next as DemoPermission)}
            options={[
              { value: "read", label: "Jen Číst" },
              { value: "draft", label: "Koncept" },
              { value: "filed", label: "Zařazen" },
              { value: "posted", label: "Zaúčtován" },
              { value: "locked", label: "Uzamčen" },
            ]}
          />
        </div>
        <Button variant="outline" aria-pressed={narrow} onClick={() => setNarrow(!narrow)}>
          Úzký panel
        </Button>
        <Button variant="outline" aria-pressed={zoom} onClick={() => setZoom(!zoom)}>
          Zoom 200 %
        </Button>
        <Button variant="outline" onClick={() => setDialog(true)}>
          Dialog záznamu
        </Button>
      </div>
      <div className={narrow ? "max-w-[35rem]" : ""} data-testid="document-panel-example">
        <div className={zoom ? "record-panel-demo-zoom" : ""}>
          <RecordSidePanel
            open={open}
            onOpenChange={setOpen}
            activeTab={tab}
            onActiveTabChange={setTab}
            tabs={content.tabs}
            pinned={pinned}
            onPinnedChange={setPinned}
            size={size}
            defaultSize={384}
            onSizeChange={setSize}
            onOpenInAdjacentPane={() => setAdjacent(!adjacent)}
          >
            <div ref={form} className="min-w-0 p-3" data-testid="document-panel-form">
              <DocumentForm
                title="Přijatá faktura"
                documentType="FP"
                status={status === "read" ? "filed" : status}
                readOnly={status === "read" || status === "posted" || status === "locked"}
                value={value}
                onChange={setValue}
                lines={[]}
                onLinesChange={() => undefined}
                books={[]}
                accounts={MOCK_ACCOUNTS}
                partners={MOCK_PARTNERS}
                homeCurrency={value.currency}
                identity={{
                  variant: "invoice",
                  book: "Faktury přijaté",
                  period: "2026",
                  number: "FP 2026/0142",
                }}
                actionBarContent={trigger}
                saveAction={{ dirty: false, onSave: () => undefined }}
                notices={
                  content.pinnedNote ? (
                    <PinnedNoteBar
                      text={content.pinnedNote.body}
                      onOpen={() => {
                        setTab("notes");
                        setOpen(true);
                      }}
                    />
                  ) : undefined
                }
              />
              {rejection.length ? (
                <NoticeBar tone="danger">{rejection.join(" · ")}</NoticeBar>
              ) : null}
            </div>
          </RecordSidePanel>
        </div>
      </div>
      {adjacent ? (
        <section className="border-l border-border p-3" data-testid="adjacent-panel-example">
          <PageHeader title="FP 2026/0142 – panel" />
          <p className="pb-2 text-xs text-muted-foreground">
            Navázané okno s celým panelem – sekce si okno pamatuje, zdroj hlásí stav „panel jinde“.
          </p>
          {content.tabs.find((item) => item.id === tab)?.content}
        </section>
      ) : null}
      <section data-testid="grid-panel-example">
        <PageHeader title="Doklady" />
        <RecordSidePanel
          open={gridOpen}
          onOpenChange={setGridOpen}
          activeTab={gridTab}
          onActiveTabChange={setGridTab}
          header={
            follow.kind === "multi" && !pinned ? "Výběr dokladů" : (active?.number ?? "Doklady")
          }
          pinned={pinned}
          onPinnedChange={(next) => {
            setPinnedRow(next ? active : null);
            setPinned(next);
          }}
          tabs={
            follow.kind === "multi" && !pinned
              ? [
                  {
                    id: "notes",
                    label: "Poznámky",
                    icon: MessageSquare,
                    content: (
                      <MultiSelectionPanel count={follow.count}>
                        <Button variant="outline" onClick={() => setBulkNotes(true)}>
                          Přidat poznámku
                        </Button>
                        {bulkNotes ? (
                          <RecordNotes
                            notes={[]}
                            onAdd={(body) => {
                              content.addNote(body);
                              setBulkNotes(false);
                            }}
                          />
                        ) : null}
                      </MultiSelectionPanel>
                    ),
                  },
                ]
              : content.tabs
          }
        >
          <DataGrid
            rows={DOCUMENTS}
            columns={columns}
            rowKey={(row) => row.id}
            storageKey="record-panel-demo"
            onRefresh={() => undefined}
            panelToggle={
              <PanelToggleButton
                open={gridOpen}
                tooltip="Panel"
                onToggle={() => setGridOpen(!gridOpen)}
              />
            }
            paginated={false}
            selectable
            selectMode
            selectedKeys={selected.map((row) => row.id)}
            onSelectedKeysChange={(keys) => {
              setSelected(DOCUMENTS.filter((row) => keys.includes(row.id)));
              setGridOpen(true);
              setGridTab("notes");
            }}
            onIndicatorClick={(row, id) => {
              setExplicit(row);
              if (pinned) setPinnedRow(row);
              setGridTab(id);
              setGridOpen(true);
            }}
            activeRowKey={active?.id}
          />
        </RecordSidePanel>
      </section>
      <LinkedListShowcase />
      <RecordDialog
        open={dialog}
        onOpenChange={setDialog}
        size="lg"
        title="FP 2026/0142"
        headerExtra={trigger}
      >
        <RecordSidePanel
          open={open}
          onOpenChange={setOpen}
          activeTab={tab}
          onActiveTabChange={setTab}
          header="FP 2026/0142"
          tabs={content.tabs}
        >
          <p className="p-4">Kancelářské potřeby</p>
        </RecordSidePanel>
      </RecordDialog>
    </div>
  );
}
