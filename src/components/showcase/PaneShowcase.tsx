import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DataGrid,
  DocumentForm,
  documentFieldsForType,
  LayoutSwitcher,
  PaneLayout,
  maxPaneLayout,
  requiredPaneWidth,
  usePaneDirty,
  type DataGridColumn,
  type DocumentHeaderValue,
  type JournalLine,
  type PaneLayoutState,
  type PaneState,
} from "@/components/ds";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
const FONT_SCALES = [1, 1.25] as const;
const MIN_PANE_WIDTH = 560;

const INITIAL: PaneLayoutState = {
  layout: 3,
  activePaneId: "p1",
  panes: [
    { id: "p1", route: "/faktury-vydane", title: "Vydané faktury" },
    { id: "p2", route: "/faktury-prijate", title: "Přijaté faktury" },
    { id: "p3", route: "/doklad", params: { id: "FP2026000012" }, title: "Doklad FP2026000012", uniqueKey: true },
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
  return (
    <DataGrid<JournalEntry>
      storageKey={storageKey}
      title={title}
      rows={MOCK_JOURNAL.slice(0, 25)}
      columns={columns}
      rowKey={(row) => row.id}
      paginated
    />
  );
}

function PaneDocument({ dirty }: { dirty: boolean }) {
  const [header, setHeader] = useState<DocumentHeaderValue>({
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
  });
  const [lines, setLines] = useState<JournalLine[]>([
    { id: "l1", debitAccount: "518001", creditAccount: "321001", amount: 4800, text: "Servisní práce" },
  ]);
  usePaneDirty(dirty);

  return (
    <DocumentForm
      title="Přijatá faktura FP2026000012"
      description={dirty ? "Doklad má neuložené změny." : undefined}
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

/** Ukázka režimu více oken – tři panely, přepínač 1/2/3 a simulace šířky i měřítka písma. */
export function PaneShowcase() {
  const [state, setState] = useState<PaneLayoutState>(INITIAL);
  const [previewWidth, setPreviewWidth] = useState<(typeof PREVIEW_WIDTHS)[number]>(1440);
  const [fontScale, setFontScale] = useState<(typeof FONT_SCALES)[number]>(1);
  const [dirty, setDirty] = useState(false);

  const maxLayout = maxPaneLayout(previewWidth, MIN_PANE_WIDTH, fontScale);

  const openDocumentAgain = () => {
    const existing = state.panes.find((pane) => pane.route === "/doklad");
    if (existing) {
      setState((value) => ({ ...value, activePaneId: existing.id }));
      toast.info("Doklad je již otevřený – přepnuto na jeho panel");
      return;
    }
    const pane: PaneState = { id: `p${state.panes.length + 1}`, route: "/doklad", params: { id: "FP2026000012" }, title: "Doklad FP2026000012", uniqueKey: true };
    setState((value) => ({ ...value, panes: [...value.panes, pane], activePaneId: pane.id, widths: undefined }));
  };

  const renderPane = (pane: PaneState) => {
    if (pane.route === "/doklad") return <PaneDocument dirty={dirty} />;
    return (
      <PaneGrid
        title={pane.title ?? "Doklady"}
        storageKey={`pane-${pane.route.replace(/\W+/g, "-")}`}
      />
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <LayoutSwitcher
          value={state.layout}
          maxLayout={maxLayout}
          requiredWidths={{ 2: requiredPaneWidth(2, MIN_PANE_WIDTH, fontScale), 3: requiredPaneWidth(3, MIN_PANE_WIDTH, fontScale) }}
          onChange={(layout) => setState((value) => ({ ...value, layout, widths: undefined }))}
        />
        <div className="flex items-center gap-1">
          {PREVIEW_WIDTHS.map((width) => (
            <Button key={width} type="button" size="sm" variant={previewWidth === width ? "default" : "outline"} onClick={() => setPreviewWidth(width)}>
              {width.toLocaleString("cs-CZ")} px
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {FONT_SCALES.map((scale) => (
            <Button key={scale} type="button" size="sm" variant={fontScale === scale ? "default" : "outline"} onClick={() => setFontScale(scale)}>
              {`${scale * 100} %`}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Switch id="pane-dirty" checked={dirty} onCheckedChange={setDirty} />
          <Label htmlFor="pane-dirty">Neuložené změny v dokladu</Label>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={openDocumentAgain}>
          Otevřít stejný doklad znovu
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => { setState(INITIAL); toast.info("Rozložení obnoveno"); }}>
          Obnovit ukázku
        </Button>
      </div>

      <div className="overflow-auto rounded-lg border bg-muted p-3">
        <div
          className="mx-auto flex h-[520px] overflow-hidden rounded-md border bg-card"
          style={{ width: `${previewWidth}px`, maxWidth: "100%", fontSize: `${fontScale * 16}px` }}
        >
          <PaneLayout
            panes={state.panes}
            activePaneId={state.activePaneId}
            layout={state.layout}
            widths={state.widths}
            onChange={setState}
            minPaneWidth={MIN_PANE_WIDTH}
            defaultRoute="/faktury-vydane"
            defaultTitle="Vydané faktury"
            renderPane={renderPane}
          />
        </div>
      </div>
    </div>
  );
}
