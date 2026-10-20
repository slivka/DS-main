import { afterEach, describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render, renderHook, within } from "@testing-library/react";
import { MessageSquare, Paperclip } from "lucide-react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { RecordSidePanel } from "../../src/components/ds/layout/record-side-panel";
import { RecordPanelTriggers } from "../../src/components/ds/layout/record-panel-triggers";
import { AttachmentList } from "../../src/components/ds/feedback/attachment-list";
import { RecordNotes } from "../../src/components/ds/feedback/record-notes";
import { DataGrid } from "../../src/components/ds/grid/DataGrid";
import { buildExportData } from "../../src/components/ds/grid/data-grid-model";
import { validateFiles } from "../../src/hooks/use-file-drop";
import { useFollowSelection } from "../../src/hooks/use-follow-selection";
import { formatFileSize } from "../../src/lib/file-size";
import { DsTextsProvider } from "../../src/ds-texts";
import type { DataGridColumn } from "../../src/components/ds/grid/data-grid-types";
import type { RecordAttachment } from "../../src/components/ds/feedback/attachment-list";
afterEach(cleanup);
const wrap = (children: React.ReactNode) => <TooltipProvider>{children}</TooltipProvider>;
const attachment: RecordAttachment = {
  id: "a",
  name: "Faktura.pdf",
  type: "application/pdf",
  size: 1_200_000,
  uploadedAt: "2026-10-19T09:00:00Z",
};
const limit = 20_000_000;
function Panel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("files");
  return (
    <RecordSidePanel
      open={open}
      onOpenChange={setOpen}
      activeTab={tab}
      onActiveTabChange={setTab}
      header="Záznam 1"
      tabs={[
        { id: "files", label: "Přílohy", icon: Paperclip, content: <p>Soubory</p> },
        { id: "notes", label: "Poznámky", icon: MessageSquare, content: <p>Obsah poznámek</p> },
      ]}
    >
      <RecordPanelTriggers
        indicators={[{ id: "notes", label: "Poznámky", icon: MessageSquare, count: 2 }]}
        onIndicatorClick={(id) => {
          setTab(id);
          setOpen(true);
        }}
      />
    </RecordSidePanel>
  );
}
describe("RecordSidePanel", () => {
  it("trigger otevře správnou záložku, Esc zavře a vrátí fokus", () => {
    const ui = render(wrap(<Panel />));
    const trigger = ui.getByRole("button", { name: "Poznámky: 2" });
    act(() => trigger.focus());
    fireEvent.click(trigger);
    expect(ui.getByRole("tab", { name: "Poznámky" }).getAttribute("aria-selected")).toBe("true");
    expect(ui.getByText("Obsah poznámek")).toBeTruthy();
    const panel = ui.container.querySelector<HTMLElement>('[data-slot="record-side-panel"]');
    expect(panel).not.toBeNull();
    if (!panel) return;
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(ui.container.querySelector('[data-slot="record-side-panel"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
  it("nulový počet zachová samotnou ikonu a přístupný název", () => {
    const click = mock();
    const ui = render(
      wrap(
        <RecordPanelTriggers
          indicators={[{ id: "a", label: "Přílohy", icon: Paperclip, count: 0 }]}
          onIndicatorClick={click}
        />,
      ),
    );
    fireEvent.click(ui.getByRole("button", { name: "Přílohy" }));
    expect(click).toHaveBeenCalledWith("a");
    expect(ui.queryByText("0")).toBeNull();
  });
});
describe("AttachmentList", () => {
  for (const kind of ["delete", "remove"] as const)
    it(`${kind} určuje text a potvrzení`, async () => {
      const remove = mock();
      const label = kind === "delete" ? "Smazat" : "Odebrat";
      const ui = render(
        wrap(
          <AttachmentList
            attachments={[attachment]}
            accept={[".pdf"]}
            maxSize={limit}
            canRemove={() => true}
            removeKind={() => kind}
            onRemove={remove}
            allowRemovalReason
          />,
        ),
      );
      fireEvent.click(ui.getByRole("button", { name: label }));
      const dialog = ui.getByRole("alertdialog");
      expect(
        within(dialog).getByText(
          kind === "delete" ? "Opravdu smazat přílohu?" : "Opravdu odebrat přílohu?",
        ),
      ).toBeTruthy();
      if (kind === "remove")
        fireEvent.change(within(dialog).getByRole("textbox"), { target: { value: "Duplicitní" } });
      fireEvent.click(within(dialog).getByRole("button", { name: label }));
      await act(async () => {
        await Promise.resolve();
      });
      expect(remove).toHaveBeenCalledWith(
        attachment,
        kind,
        kind === "remove" ? "Duplicitní" : undefined,
      );
    });
  it("soubor nad 20 MB odmítne a uvede důvod v NoticeBar i callbacku", () => {
    const receive = mock();
    const ui = render(
      wrap(
        <AttachmentList
          attachments={[]}
          accept={[".pdf"]}
          maxSize={limit}
          canAdd
          onFiles={receive}
        />,
      ),
    );
    const file = new File([new Uint8Array(limit + 1)], "velky.pdf", { type: "application/pdf" });
    const input = ui.container.querySelector('input[type="file"]');
    if (!input) throw new Error("Chybí výběr souborů");
    fireEvent.change(input, { target: { files: [file] } });
    expect(receive).toHaveBeenCalledWith([], [{ file, reasons: ["size"] }]);
    expect(ui.getByRole("alert").textContent).toContain("Soubor překračuje limit");
  });
  it("odebrané defaultně skryje a přepínač zobrazí kdo/kdy/důvod", () => {
    const ui = render(
      wrap(
        <AttachmentList
          attachments={[
            {
              ...attachment,
              removedAt: "2026-10-20T09:00:00Z",
              removedBy: "Jana",
              removalReason: "Duplicita",
            },
          ]}
          accept={[]}
          maxSize={limit}
        />,
      ),
    );
    expect(ui.queryByText("Faktura.pdf")).toBeNull();
    fireEvent.click(ui.getByRole("checkbox", { name: "Zobrazit odebrané" }));
    expect(ui.getByText("Faktura.pdf")).toBeTruthy();
    expect(ui.getByText(/Duplicita/)).toBeTruthy();
  });
  it("zdroj nabízí pouze Nahradit", () => {
    const ui = render(
      wrap(
        <AttachmentList
          source={attachment}
          attachments={[]}
          accept={[]}
          maxSize={limit}
          onReplaceSource={mock()}
          canRemove={() => true}
          removeKind={() => "delete"}
          onRemove={mock()}
        />,
      ),
    );
    expect(ui.getByRole("button", { name: "Nahradit" })).toBeTruthy();
    expect(ui.queryByRole("button", { name: "Smazat" })).toBeNull();
  });
  it("validace přijme všechny zadané přípony a vrátí oba důvody", () => {
    const extensions = ["pdf", "jpg", "png", "isdoc", "xml", "docx", "xlsx"];
    const files = extensions.map((ext) => new File(["x"], `soubor.${ext}`));
    expect(
      validateFiles(
        files,
        extensions.map((ext) => `.${ext}`),
        limit,
      ).files,
    ).toHaveLength(7);
    const invalid = new File([new Uint8Array(limit + 1)], "soubor.exe");
    expect(validateFiles([invalid], [".pdf"], limit).rejected[0]?.reasons).toEqual([
      "type",
      "size",
    ]);
  });
  it("velikost používá desetinné jednotky a čárku", () =>
    expect(formatFileSize(1_200_000)).toBe("1,2 MB"));
});
describe("RecordNotes", () => {
  const notes = [{ id: "n", body: "Původní", createdAt: "2026-10-19T09:00:00Z" }];
  it("editable bez nových props funguje jako dříve", () => {
    const ui = render(
      wrap(
        <RecordNotes
          notes={[{ ...notes[0], editable: false }]}
          onUpdate={mock()}
          onRemove={mock()}
        />,
      ),
    );
    expect(ui.queryByRole("button", { name: "Upravit" })).toBeNull();
    expect(ui.queryByRole("button", { name: "Odstranit" })).toBeNull();
    ui.rerender(
      wrap(
        <RecordNotes
          notes={[{ ...notes[0], editable: true }]}
          onUpdate={mock()}
          onRemove={mock()}
        />,
      ),
    );
    expect(ui.getByRole("button", { name: "Upravit" })).toBeTruthy();
    expect(ui.getByRole("button", { name: "Odstranit" })).toBeTruthy();
  });
  it("oddělená oprávnění a canAdd false", () => {
    const ui = render(
      wrap(
        <RecordNotes
          notes={notes}
          canEdit
          canRemove={false}
          canAdd={false}
          onAdd={mock()}
          onUpdate={mock()}
          onRemove={mock()}
        />,
      ),
    );
    expect(ui.getByRole("button", { name: "Upravit" })).toBeTruthy();
    expect(ui.queryByRole("button", { name: "Odstranit" })).toBeNull();
    expect(ui.queryByRole("textbox")).toBeNull();
  });
  it("připnutá je nahoře a aplikace dostane požadavek odepnutí", async () => {
    const pin = mock();
    const ui = render(
      wrap(
        <RecordNotes
          notes={[...notes, { id: "p", body: "Důležité", createdAt: "2020-01-01", pinned: true }]}
          canPin
          onPin={pin}
        />,
      ),
    );
    expect(ui.getAllByRole("listitem")[0]?.textContent).toContain("Důležité");
    fireEvent.click(ui.getByRole("button", { name: "Odepnout" }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(pin).toHaveBeenCalledWith("p", false);
  });
  it("slovenské výchozí texty nejsou zastíněné češtinou", () => {
    const ui = render(
      wrap(
        <DsTextsProvider locale="sk">
          <RecordNotes notes={[]} onAdd={mock()} />
        </DsTextsProvider>,
      ),
    );
    expect(ui.getByRole("button", { name: "Pridať" })).toBeTruthy();
  });
});
describe("useFollowSelection", () => {
  it("výchozích 250 ms přeskočí mezikroky", async () => {
    const ui = renderHook(({ rows }) => useFollowSelection(rows), {
      initialProps: { rows: ["a"] },
    });
    ui.rerender({ rows: ["b"] });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 80));
    });
    ui.rerender({ rows: ["c"] });
    expect(ui.result.current).toEqual({ kind: "single", record: "a" });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 270));
    });
    expect(ui.result.current).toEqual({ kind: "single", record: "c" });
  });
  it("více řádků vrátí multi a počet", () => {
    const ui = renderHook(() => useFollowSelection(["a", "b"]));
    expect(ui.result.current).toEqual({ kind: "multi", count: 2 });
  });
  it("vlastní delay=0 přečte prázdný výběr po změně", async () => {
    const ui = renderHook(({ rows }) => useFollowSelection(rows, { delay: 0 }), {
      initialProps: { rows: ["a"] },
    });
    ui.rerender({ rows: [] });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    expect(ui.result.current).toEqual({ kind: "empty" });
  });
});
describe("DataGrid record-indicators", () => {
  const rows = [{ id: "1", count: 2 }];
  const columns: DataGridColumn<(typeof rows)[number]>[] = [
    {
      id: "custom",
      label: "Signály",
      type: "record-indicators",
      indicators: [{ id: "files", label: "Přílohy", icon: Paperclip, count: (row) => row.count }],
    },
  ];
  it("klik indikátoru neoznačí řádek", () => {
    const selection = mock();
    const click = mock();
    const ui = render(
      wrap(
        <DataGrid
          storageKey="panel-test"
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          selectMode
          onSelectedKeysChange={selection}
          onIndicatorClick={click}
          paginated={false}
        />,
      ),
    );
    fireEvent.click(ui.getByRole("button", { name: "Přílohy: 2" }));
    expect(click).toHaveBeenCalledWith(rows[0], "files");
    expect(selection).not.toHaveBeenCalled();
  });
  it("Excel rozvine indikátory na číselné sloupce", () => {
    const data = buildExportData(
      columns,
      rows.map((row) => ({ type: "row" as const, row })),
      null,
      false,
    );
    expect(data.columns).toEqual(["Přílohy"]);
    expect(data.rows).toEqual([[2]]);
    expect(data.columnMeta?.[0]?.type).toBe("integer");
  });
});
