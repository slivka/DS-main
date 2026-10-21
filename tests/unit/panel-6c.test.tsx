/** Chování veřejného napojení panelu 6C. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { PaneTabsProvider, usePaneTabs, useLinkedPanel } from "../../src/components/ds/panes/pane-context";
import { PaneLayout } from "../../src/components/ds/panes/pane-layout";
import { createPaneTabsState, openTabInState } from "../../src/components/ds/panes/pane-state";
import { findLinkedPanel } from "../../src/components/ds/panes/linked-panel";
import { PanelResize } from "../../src/components/ds/layout/record-side-panel/panel-resize";
import { DocumentFormTop } from "../../src/components/ds/accounting/document-form/document-form-top";
import { DEFAULT_DOCUMENT_FORM_TEXTS } from "../../src/components/ds/accounting/document-form/document-form-types";
import { DS_TEXTS_CS } from "../../src/ds-texts/cs";
import type { DocumentFormProps } from "../../src/components/ds/accounting/document-form/document-form-types";

afterEach(cleanup);
type Api = NonNullable<ReturnType<typeof usePaneTabs>>;
function mount(kind: "list" | "record" = "list", renderer?: React.ComponentProps<typeof PaneLayout>["renderLinkedPanel"]) {
  const initial = openTabInState(createPaneTabsState(1), {
    route: "/records", kind, title: "Doklady", recordKey: kind === "record" ? "A" : undefined,
  }).state;
  const sourceId = initial.panes[0].tabs[0].id;
  const capture: { api?: Api; handle?: ReturnType<typeof useLinkedPanel> } = {};
  function Capture() {
    const api = usePaneTabs();
    if (api) capture.api = api;
    capture.handle = useLinkedPanel(sourceId);
    return null;
  }
  function Host() {
    const [state, setState] = useState(initial);
    return <TooltipProvider><PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
      <Capture />
      {renderer ? <PaneLayout renderTab={() => "Běžná záložka"} renderLinkedPanel={renderer} /> : null}
    </PaneTabsProvider></TooltipProvider>;
  }
  const ui = render(<Host />);
  const api = () => { if (!capture.api) throw new Error("Provider missing"); return capture.api; };
  const handle = () => { if (!capture.handle) throw new Error("Hook missing"); return capture.handle; };
  return { ui, sourceId, api, handle, panel: () => findLinkedPanel(api().state, sourceId)?.tab };
}

describe("veřejný navázaný panel 6C", () => {
  it("hook otevře panel, zaměří bez duplikace, změní sekci a zavře", () => {
    const { api, handle, panel, sourceId } = mount();
    expect(handle().state).toBe("closed");
    act(() => handle().open({ recordKey: "A", recordTitle: "Doklad A", section: "history" }));
    expect(handle().state).toBe("elsewhere");
    const tab = panel();
    if (!tab) throw new Error("Panel missing");
    expect(tab.linked?.kind).toBe("panel");
    expect(tab.recordKey).toBe("A");
    expect(tab.title).toBe("Doklad A – Panel");
    act(() => api().setLinkedPanelSection(tab.id, "notes"));
    expect(panel()?.linked?.activeSection).toBe("notes");
    act(() => api().activatePane(api().state.panes[0].id));
    act(() => handle().focus());
    expect(api().state.active).toBe(api().state.panes[1].id);
    act(() => handle().open({ recordKey: "A", recordTitle: "Doklad A", section: "history" }));
    expect(api().state.panes.flatMap((pane) => pane.tabs).filter((entry) => entry.linked?.kind === "panel")).toHaveLength(1);
    act(() => api().closeLinkedPanel(sourceId));
    expect(handle().state).toBe("closed");
  });
  it("blockedReason zabrání otevření i změně výběru", () => {
    const { api, handle, sourceId } = mount();
    const before = api().state;
    act(() => handle().open({ recordKey: "A", recordTitle: "A", section: "source", blockedReason: "Rozepsaná poznámka" }));
    expect(api().state).toBe(before);
    expect(findLinkedPanel(api().state, sourceId)).toBeNull();
  });
  it("seznam sleduje výběr, špendlík zamkne, zavření zdroje zachová záznam", () => {
    const { api, handle, panel, sourceId } = mount();
    act(() => handle().open({ recordKey: "A", recordTitle: "A", section: "history" }));
    act(() => api().updateLinkedPanelRecord(sourceId, "B", "Doklad B"));
    expect(panel()?.recordKey).toBe("B");
    expect(panel()?.title).toBe("Doklad B – Panel");
    const tab = panel();
    if (!tab) throw new Error("Panel missing");
    act(() => api().setLinkedPinned(tab.id, true));
    act(() => api().updateLinkedPanelRecord(sourceId, "C", "Doklad C"));
    expect(panel()?.recordKey).toBe("B");
    act(() => api().setLinkedPinned(tab.id, false));
    expect(panel()?.recordKey).toBe("C");
    act(() => api().closeTab(sourceId));
    expect(panel()?.recordKey).toBe("C");
    expect(panel()?.linked?.pinned).toBe(true);
  });
  it("aktualizace dokladu sleduje titul i klíč", () => {
    const { api, handle, panel, sourceId } = mount("record");
    act(() => handle().open({ recordKey: "A", recordTitle: "Doklad A", section: "history" }));
    act(() => api().updateLinkedPanelRecord(sourceId, "B", "Doklad B"));
    expect(panel()?.recordKey).toBe("B");
    expect(panel()?.title).toBe("Doklad B – Panel");
  });
  it("PaneLayout předá klíč/sekci registru a callback zapamatuje sekci", () => {
    const renderer = mock((key: string, section: string, setSection: (value: string) => void) =>
      <button onClick={() => setSection("notes")}>{key}/{section}</button>);
    const { ui, handle, panel } = mount("list", renderer);
    act(() => handle().open({ recordKey: "A", recordTitle: "A", section: "history" }));
    fireEvent.click(ui.getByRole("button", { name: "A/history" }));
    expect(panel()?.linked?.activeSection).toBe("notes");
    expect(ui.getByRole("button", { name: "A/notes" })).toBeTruthy();
  });
});

describe("onSizeCommit", () => {
  it("během tažení jen change, puštění právě jednou commit poslední omezené šířky", () => {
    const change = mock(); const commit = mock();
    const ui = render(<PanelResize host={{ current: null }} size={400} defaultSize={384} min={320} max={900} onSizeChange={change} onSizeCommit={commit} />);
    const bar = ui.getByRole("separator");
    fireEvent.pointerDown(bar, { clientX: 800, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 700, pointerId: 1 });
    fireEvent.pointerMove(bar, { clientX: 0, pointerId: 1 });
    expect(commit).not.toHaveBeenCalled();
    expect(change).toHaveBeenLastCalledWith(900);
    fireEvent.pointerUp(bar, { pointerId: 1 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenCalledWith(900);
  });
  it("klávesa i dvojklik jeden commit, nesouvisející klávesa žádný", () => {
    const change = mock(); const commit = mock();
    const ui = render(<PanelResize host={{ current: null }} size={400} defaultSize={384} min={320} max={900} onSizeChange={change} onSizeCommit={commit} />);
    const bar = ui.getByRole("separator");
    fireEvent.keyDown(bar, { key: "ArrowLeft" });
    expect(commit).toHaveBeenCalledTimes(1);
    expect(commit).toHaveBeenLastCalledWith(416);
    fireEvent.keyDown(bar, { key: "a" });
    expect(commit).toHaveBeenCalledTimes(1);
    fireEvent.doubleClick(bar);
    expect(commit).toHaveBeenCalledTimes(2);
    expect(commit).toHaveBeenLastCalledWith(384);
  });
});

it("DocumentForm předaný ovladač panelu volá APP", () => {
  const toggle = mock();
  const props = { status: "draft", panelToggle: <button onClick={toggle}>Panel</button> } as DocumentFormProps;
  const ui = render(<TooltipProvider><DocumentFormTop props={props} title="Doklad" moreActions={[]} issues={[]} notices={null} vatRelevant={false} onVatRelevantChange={() => {}} t={{ ...DS_TEXTS_CS.documentForm, ...DEFAULT_DOCUMENT_FORM_TEXTS }} /></TooltipProvider>);
  fireEvent.click(ui.getByRole("button", { name: "Panel" }));
  expect(toggle).toHaveBeenCalledTimes(1);
});