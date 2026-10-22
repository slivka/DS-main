/** Chování navázaného panelu v sousedním okně (useLinkedPanel, PaneLayout). */
import { afterEach, describe, expect, it, mock } from "bun:test";
import { useState } from "react";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import { PaneTabsProvider, usePaneTabs, useLinkedPanel } from "../../src/components/ds/panes/pane-context";
import { PaneLayout } from "../../src/components/ds/panes/pane-layout";
import { createPaneTabsState, openTabInState } from "../../src/components/ds/panes/pane-state";
import { findLinkedPanel } from "../../src/components/ds/panes/linked-panel";
import { syncLinkedTabsInState } from "../../src/components/ds/panes/linked-tabs";

afterEach(cleanup);
type Api = NonNullable<ReturnType<typeof usePaneTabs>>;
function mount(
  kind: "list" | "record" = "list",
  renderer?: React.ComponentProps<typeof PaneLayout>["renderLinkedPanel"],
) {
  const initial = openTabInState(createPaneTabsState(1), {
    route: "/records",
    kind,
    title: "Doklady",
    recordKey: kind === "record" ? "A" : undefined,
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
    return (
      <TooltipProvider>
        <PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
          <Capture />
          {renderer ? (
            <PaneLayout renderTab={() => "Běžná záložka"} renderLinkedPanel={renderer} />
          ) : null}
        </PaneTabsProvider>
      </TooltipProvider>
    );
  }
  const ui = render(<Host />);
  const api = () => {
    if (!capture.api) throw new Error("Provider missing");
    return capture.api;
  };
  const handle = () => {
    if (!capture.handle) throw new Error("Hook missing");
    return capture.handle;
  };
  return { ui, sourceId, api, handle, panel: () => findLinkedPanel(api().state, sourceId)?.tab };
}

describe("navázaný panel", () => {
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
    expect(
      api()
        .state.panes.flatMap((pane) => pane.tabs)
        .filter((entry) => entry.linked?.kind === "panel"),
    ).toHaveLength(1);
    act(() => api().closeLinkedPanel(sourceId));
    expect(handle().state).toBe("closed");
  });
  it("blockedReason zabrání otevření i změně výběru", () => {
    const { api, handle, sourceId } = mount();
    const before = api().state;
    act(() =>
      handle().open({
        recordKey: "A",
        recordTitle: "A",
        section: "source",
        blockedReason: "Rozepsaná poznámka",
      }),
    );
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
    const renderer = mock((key: string, section: string, setSection: (value: string) => void) => (
      <button onClick={() => setSection("notes")}>
        {key}/{section}
      </button>
    ));
    const { ui, handle, panel } = mount("list", renderer);
    act(() => handle().open({ recordKey: "A", recordTitle: "A", section: "history" }));
    fireEvent.click(ui.getByRole("button", { name: "A/history" }));
    expect(panel()?.linked?.activeSection).toBe("notes");
    expect(ui.getByRole("button", { name: "A/notes" })).toBeTruthy();
  });
});

describe("navázaný panel – záznam hlášený APP", () => {
  it("seznam: nový klíč bez cesty nepřenese parametry starého výběru", () => {
    const { api, handle, panel, sourceId } = mount();
    act(() =>
      handle().open({
        recordKey: "A",
        recordTitle: "A",
        section: "history",
        route: "/doc",
        params: { id: "A" },
      }),
    );
    expect(panel()?.params).toEqual({ id: "A" });
    act(() => api().updateLinkedPanelRecord(sourceId, "B", "B"));
    expect(panel()?.recordKey).toBe("B");
    expect(panel()?.params).toBeUndefined();
    act(() =>
      api().updateLinkedPanelRecord(sourceId, "C", "C", { route: "/doc", params: { id: "C" } }),
    );
    expect(panel()?.route).toBe("/doc");
    expect(panel()?.params).toEqual({ id: "C" });
  });
  it("záznam: zdrojová záložka zůstane beze změny, mění se jen panel", () => {
    const { api, handle, panel, sourceId } = mount("record");
    const source = () => api().state.panes[0].tabs.find((tab) => tab.id === sourceId);
    act(() => handle().open({ recordKey: "B", recordTitle: "Doklad B", section: "history" }));
    expect(source()?.recordKey).toBe("A");
    expect(source()?.title).toBe("Doklady");
    expect(panel()?.recordKey).toBe("B");
    act(() => api().updateLinkedPanelRecord(sourceId, "C", "Doklad C"));
    expect(source()?.recordKey).toBe("A");
    expect(source()?.title).toBe("Doklady");
    expect(panel()?.title).toBe("Doklad C – Panel");
  });
  it("záznam: po navigaci zdroje na jiný záznam panel zahodí hlášený záznam a ukáže nový", () => {
    const { api, handle, panel, sourceId } = mount("record");
    act(() => handle().open({ recordKey: "A", recordTitle: "Doklad A", section: "history" }));
    act(() =>
      api().updateLinkedPanelRecord(sourceId, "A", "Doklad A", {
        route: "/doc",
        params: { id: "A" },
      }),
    );
    expect(panel()?.recordKey).toBe("A");
    const moved = {
      ...api().state,
      panes: api().state.panes.map((pane) => ({
        ...pane,
        tabs: pane.tabs.map((tab) =>
          tab.id === sourceId ? { ...tab, recordKey: "Z", title: "Doklad Z" } : tab,
        ),
      })),
    };
    const next = syncLinkedTabsInState(moved);
    const tab = findLinkedPanel(next, sourceId)?.tab;
    expect(tab?.recordKey).toBe("Z");
    expect(tab?.title).toBe("Doklad Z – Panel");
    expect(tab?.linked?.record).toBeUndefined();
  });
});
