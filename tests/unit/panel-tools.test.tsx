import { afterEach, describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Paperclip } from "lucide-react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { PanelToggleButton } from "../../src/components/ds/layout/panel-toggle-button";
import { RecordSidePanel } from "../../src/components/ds/layout/record-side-panel";
import {
  PanelResize,
  panelSizeBounds,
} from "../../src/components/ds/layout/record-side-panel/panel-resize";
import { RecordNotes } from "../../src/components/ds/feedback/record-notes";
import { AttachmentList } from "../../src/components/ds/feedback/attachment-list";
import { DataGrid } from "../../src/components/ds/grid/DataGrid";
import type { DataGridColumn } from "../../src/components/ds/grid/data-grid-types";
afterEach(cleanup);
const wrap = (children: React.ReactNode) => <TooltipProvider>{children}</TooltipProvider>;
describe("PanelToggleButton", () => {
  it("otevřený stav je stisknutý a klik vyvolá změnu", () => {
    const toggle = mock();
    const ui = render(wrap(<PanelToggleButton open tooltip="Panel" onToggle={toggle} />));
    const button = ui.getByRole("button", { name: "Panel" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
  it("panel jinde pouze zaměří jiné okno", () => {
    const toggle = mock();
    const focus = mock();
    const ui = render(
      wrap(
        <PanelToggleButton
          open={false}
          state="elsewhere"
          tooltip="Panel jinde"
          onToggle={toggle}
          onFocusElsewhere={focus}
        />,
      ),
    );
    const button = ui.getByRole("button", { name: "Panel" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(focus).toHaveBeenCalledTimes(1);
    expect(toggle).not.toHaveBeenCalled();
  });
});
describe("PanelResize", () => {
  function ResizeDemo() {
    const [size, setSize] = useState(400);
    return (
      <PanelResize
        host={{ current: null }}
        size={size}
        defaultSize={384}
        min={320}
        max={900}
        onSizeChange={setSize}
      />
    );
  }
  it("minimum je 20 rem, maximum 75 procent hostitele", () => {
    expect(panelSizeBounds(1200, 16)).toEqual({ min: 320, max: 900 });
    expect(panelSizeBounds(1200, 32)).toEqual({ min: 640, max: 900 });
  });
  it("klávesy mění po 16 px, Home/End mez a dvojklik výchozí velikost", () => {
    const ui = render(<ResizeDemo />);
    const bar = ui.getByRole("separator");
    fireEvent.keyDown(bar, { key: "ArrowLeft" });
    expect(bar.getAttribute("aria-valuenow")).toBe("416");
    fireEvent.keyDown(bar, { key: "ArrowRight" });
    expect(bar.getAttribute("aria-valuenow")).toBe("400");
    fireEvent.keyDown(bar, { key: "Home" });
    expect(bar.getAttribute("aria-valuenow")).toBe("320");
    fireEvent.keyDown(bar, { key: "ArrowRight" });
    expect(bar.getAttribute("aria-valuenow")).toBe("320");
    fireEvent.keyDown(bar, { key: "End" });
    expect(bar.getAttribute("aria-valuenow")).toBe("900");
    fireEvent.keyDown(bar, { key: "ArrowLeft" });
    expect(bar.getAttribute("aria-valuenow")).toBe("900");
    fireEvent.doubleClick(bar);
    expect(bar.getAttribute("aria-valuenow")).toBe("384");
  });
  it("tažení vlevo rozšíří a respektuje obě meze", () => {
    const ui = render(<ResizeDemo />);
    const bar = ui.getByRole("separator");
    fireEvent.pointerDown(bar, { clientX: 800, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 700, pointerId: 1 });
    expect(bar.getAttribute("aria-valuenow")).toBe("500");
    fireEvent.pointerMove(bar, { clientX: 0, pointerId: 1 });
    expect(bar.getAttribute("aria-valuenow")).toBe("900");
    fireEvent.pointerMove(bar, { clientX: 1200, pointerId: 1 });
    expect(bar.getAttribute("aria-valuenow")).toBe("320");
    fireEvent.pointerUp(bar, { pointerId: 1 });
  });
});
describe("RecordSidePanel nástroje", () => {
  it("bez záhlaví má panel název, ikonová záložka přístupný počet a změnu", () => {
    const change = mock();
    const ui = render(
      wrap(
        <RecordSidePanel
          open
          onOpenChange={() => {}}
          activeTab="files"
          onActiveTabChange={change}
          tabs={[{ id: "files", label: "Přílohy", icon: Paperclip, count: 2, content: "Obsah" }]}
        />,
      ),
    );
    const tab = ui.getByRole("tab", { name: "Přílohy: 2" });
    expect(tab.textContent).toBe("2");
    expect(ui.getByRole("dialog", { name: "Panel" })).toBeTruthy();
  });
  it("rozepsaný obsah blokuje přesun do sousedního okna", () => {
    const move = mock();
    const ui = render(
      wrap(
        <RecordSidePanel
          open
          onOpenChange={() => {}}
          activeTab="files"
          onActiveTabChange={() => {}}
          tabs={[]}
          blockedReason="Rozepsaná poznámka"
          onOpenInAdjacentPane={move}
        />,
      ),
    );
    fireEvent.click(ui.getByRole("button", { name: "Otevřít v sousedním okně" }));
    expect(move).not.toHaveBeenCalled();
  });
});
describe("RecordNotes klávesnice", () => {
  for (const modifier of ["ctrlKey", "metaKey"] as const) {
    it(`${modifier} s Enter přidá a vyčistí pole`, async () => {
      const add = mock();
      const ui = render(wrap(<RecordNotes notes={[]} onAdd={add} />));
      const input = ui.getByRole("textbox");
      input.focus();
      fireEvent.change(input, { target: { value: " Nová poznámka " } });
      await act(async () => fireEvent.keyDown(input, { key: "Enter", [modifier]: true }));
      expect(add).toHaveBeenCalledWith("Nová poznámka");
      expect((input as HTMLTextAreaElement).value).toBe("");
      expect(document.activeElement).toBe(input);
    });
  }
  it("Ctrl+Enter uloží úpravu přes původní onUpdate", async () => {
    const update = mock();
    const ui = render(
      wrap(
        <RecordNotes
          notes={[{ id: "n", body: "Původní", createdAt: "2026-10-21" }]}
          onUpdate={update}
        />,
      ),
    );
    fireEvent.click(ui.getByRole("button", { name: "Upravit" }));
    const input = ui.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Upravená" } });
    await act(async () => fireEvent.keyDown(input, { key: "Enter", ctrlKey: true }));
    expect(update).toHaveBeenCalledWith("n", "Upravená");
    expect(ui.queryByRole("textbox")).toBeNull();
  });
});
describe("AttachmentList použití jako zdroj", () => {
  it("bez source nemá náhled a nabídka předá přílohu", async () => {
    const setSource = mock();
    const attachment = {
      id: "a",
      name: "Soubor.pdf",
      size: 1200,
      type: "application/pdf",
      uploadedAt: "2026-10-21",
      previewUrl: "https://example.invalid/source.pdf",
    };
    const ui = render(
      wrap(
        <AttachmentList
          attachments={[attachment]}
          accept={[]}
          maxSize={10000}
          onSetSource={setSource}
          canSetSource={() => true}
        />,
      ),
    );
    expect(ui.container.querySelector("iframe")).toBeNull();
    fireEvent.pointerDown(ui.getByRole("button", { name: "Použít jako zdroj" }), {
      button: 0,
      ctrlKey: false,
    });
    await act(async () => {});
    fireEvent.click(ui.getByRole("menuitem", { name: "Použít jako zdroj" }));
    expect(setSource).toHaveBeenCalledWith(attachment);
  });
});
describe("DataGrid výchozí indikátory", () => {
  const rows = [{ id: "1" }];
  const columns: DataGridColumn<(typeof rows)[number]>[] = [
    { id: "name", label: "Název", value: (row) => row.id },
    {
      id: "signals",
      label: "Signály",
      type: "record-indicators",
      indicators: [{ id: "files", label: "Přílohy", icon: Paperclip, count: () => 2 }],
    },
  ];
  it("nové rozložení indikátory skryje", () => {
    const ui = render(
      wrap(
        <DataGrid
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          storageKey="new-panel-layout"
        />,
      ),
    );
    expect(ui.queryByRole("button", { name: "Přílohy: 2" })).toBeNull();
  });
  it("uložené rozložení s indikátory se nemění", () => {
    localStorage.setItem(
      "columns:saved-panel-layout",
      JSON.stringify({ name: true, signals: true }),
    );
    const ui = render(
      wrap(
        <DataGrid
          rows={rows}
          columns={columns}
          rowKey={(row) => row.id}
          storageKey="saved-panel-layout"
        />,
      ),
    );
    expect(ui.getByRole("button", { name: "Přílohy: 2" })).toBeTruthy();
    localStorage.removeItem("columns:saved-panel-layout");
  });
});
