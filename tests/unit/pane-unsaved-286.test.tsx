/** Testy chování: dialog neuložených změn, otevírání z menu a vzhled aktivní záložky. */
import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

const { act, cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { DndContext } = await import("@dnd-kit/core");
const { PaneTabsProvider, usePaneTabs } =
  await import("../../src/components/ds/panes/pane-context");
const { PaneTabBar } = await import("../../src/components/ds/panes/pane-tab-bar");
const { resolvePaneTabVisibility } = await import("../../src/components/ds/panes/pane-tab-bar");
const { createPaneTabsState, createTab, setLayoutInState } =
  await import("../../src/components/ds/panes/pane-state");
const { isTabDirty, setTabDirty } = await import("../../src/components/ds/panes/pane-tab-store");

afterEach(cleanup);

type Api = NonNullable<ReturnType<typeof usePaneTabs>>;

/** Dva panely: rozepsaný doklad v panelu 1, fokus v panelu 2. */
function twoPanes() {
  const base = setLayoutInState(createPaneTabsState(1), 2);
  const dirty = createTab({ route: "/doklad", title: "FP 2026/15" });
  const other = createTab({ route: "/seznam", title: "Seznam" });
  base.panes[0] = { ...base.panes[0], tabs: [dirty], activeTab: dirty.id };
  base.panes[1] = { ...base.panes[1], tabs: [other], activeTab: other.id };
  return { state: { ...base, active: base.panes[1].id }, dirty, other };
}

function mount(
  initial: ReturnType<typeof createPaneTabsState>,
  props: Partial<React.ComponentProps<typeof PaneTabsProvider>> = {},
  withBar = false,
) {
  const ref: { api: Api | null } = { api: null };
  function Capture() {
    ref.api = usePaneTabs();
    return null;
  }
  function Host() {
    const [state, setState] = React.useState(initial);
    return (
      <PaneTabsProvider state={state} onChange={setState} shortcuts={false} {...props}>
        <Capture />
        {withBar ? <Bars /> : null}
      </PaneTabsProvider>
    );
  }
  const view = render(<Host />);
  return { view, api: () => ref.api as Api };
}
/** Lišty všech panelů nad aktuálním rozhraním záložek. */
function Bars() {
  const api = usePaneTabs() as Api;
  return (
    <DndContext>
      {api.state.panes.map((pane, index) => (
        <PaneTabBar
          key={pane.id}
          pane={pane}
          paneIndex={index}
          paneCount={api.state.panes.length}
          api={api}
        />
      ))}
    </DndContext>
  );
}

describe("neuložené změny v panelech (2.86.0)", () => {
  it("při kapacitě šesti ponechá aktivní a předposlední rozepsanou záložku viditelné", () => {
    const tabs = Array.from({ length: 8 }, (_, index) => ({
      ...createTab({ route: `/t-${index}`, title: `T ${index}` }, index),
      id: `t-${index}`,
      lastUsed: index,
    }));
    const pane = { id: "pane", activeTab: "t-7", tabs };
    const result = resolvePaneTabVisibility(pane, 6, (id) => id === "t-6");
    expect(result.visible.map((tab) => tab.id)).toContain("t-6");
    expect(result.visible.map((tab) => tab.id)).toContain("t-7");
    expect(result.hidden.map((tab) => tab.id)).not.toContain("t-6");
  });

  it("při dvou rozepsaných a aktivní ponechá nejnověji použité priority viditelné", () => {
    const tabs = Array.from({ length: 8 }, (_, index) => ({
      ...createTab({ route: `/t-${index}`, title: `T ${index}` }, index),
      id: `t-${index}`,
      lastUsed: index,
    }));
    const result = resolvePaneTabVisibility(
      { id: "pane", activeTab: "t-7", tabs },
      6,
      (id) => id === "t-5" || id === "t-6",
    );
    expect(result.visible.map((tab) => tab.id)).toEqual(["t-3", "t-4", "t-5", "t-6", "t-7"]);
    expect(result.hidden.map((tab) => tab.id)).toEqual(["t-0", "t-1", "t-2"]);
  });

  it("Uložit a zavřít volá obsluhu pro dotčenou záložku, ne aktivní panel", async () => {
    const { state, dirty, other } = twoPanes();
    const onSaveTab = mock(async () => true);
    const { view, api } = mount(state, { onSaveTab });
    act(() => setTabDirty(dirty.id, true));
    act(() => api().closeTab(dirty.id));
    const dialog = view.getByRole("alertdialog");
    expect(dialog.textContent).toContain("Zavřít záložku s neuloženými změnami?");
    expect(dialog.textContent).toContain("FP 2026/15 – Změny zatím nejsou uložené.");
    fireEvent.click(view.getByRole("button", { name: "Uložit a zavřít" }));
    await waitFor(() => expect(onSaveTab).toHaveBeenCalledWith(dirty.id));
    await waitFor(() => expect(view.queryByRole("alertdialog")).toBeNull());
    expect(api().state.panes[0].tabs).toHaveLength(0);
    expect(api().state.panes[1].tabs[0].id).toBe(other.id);
  });

  it("Zavřít bez uložení zavře dotčenou záložku a nechá druhý panel", () => {
    const { state, dirty, other } = twoPanes();
    const { view, api } = mount(state);
    act(() => setTabDirty(dirty.id, true));
    act(() => api().closeTab(dirty.id));
    fireEvent.click(view.getByRole("button", { name: "Zavřít bez uložení" }));
    expect(api().state.panes[0].tabs).toHaveLength(0);
    expect(api().state.panes[1].tabs.map((tab) => tab.id)).toEqual([other.id]);
  });

  it("neúspěšné uložení dialog zavře a nic nezahodí", async () => {
    const { state, dirty } = twoPanes();
    const { view, api } = mount(state, { onSaveTab: async () => false });
    act(() => setTabDirty(dirty.id, true));
    act(() => api().closeTab(dirty.id));
    fireEvent.click(view.getByRole("button", { name: "Uložit a zavřít" }));
    await waitFor(() => expect(view.queryByRole("alertdialog")).toBeNull());
    expect(api().state.panes[0].tabs[0].id).toBe(dirty.id);
    expect(isTabDirty(dirty.id)).toBe(true);
  });

  it("položka menu rozepsanou záložku nenahradí: nová záložka v témže panelu a oznámení", () => {
    const { state, dirty } = twoPanes();
    const onNotice = mock((message: string) => message);
    const { view, api } = mount({ ...state, active: state.panes[0].id }, { onNotice });
    act(() => setTabDirty(dirty.id, true));
    act(() => api().openTab("/faktury", undefined, { title: "Faktury" }));
    expect(view.queryByRole("alertdialog")).toBeNull();
    const pane = api().state.panes[0];
    expect(pane.tabs.map((tab) => tab.id)).toContain(dirty.id);
    expect(pane.tabs).toHaveLength(2);
    expect(onNotice).toHaveBeenCalledWith(
      "Faktury otevřeno v nové záložce – FP 2026/15 má neuložené změny",
    );
  });

  it("při limitu nabídne aplikací předanou akci otevření v nové záložce", () => {
    const { state, dirty } = twoPanes();
    state.panes[0].tabs = Array.from({ length: 10 }, (_, index) =>
      index === 0
        ? dirty
        : { ...createTab({ route: `/x-${index}`, title: `X ${index}` }), id: `x-${index}` },
    );
    state.panes[0].activeTab = dirty.id;
    const open = mock();
    const { view, api } = mount({ ...state, active: state.panes[0].id });
    act(() => state.panes[0].tabs.forEach((tab) => setTabDirty(tab.id, true)));
    act(() => api().openTab("/novy", undefined, { title: "Nový", onOpenInNewTab: open }));
    fireEvent.click(view.getByRole("button", { name: "Otevřít v nové záložce" }));
    expect(open).toHaveBeenCalledTimes(1);
    expect(view.queryByRole("alertdialog")).toBeNull();
  });

  it("dotčená záložka se po dobu dialogu zvýrazní; aktivní panel výrazně, ostatní tlumeně", () => {
    const { state, dirty, other } = twoPanes();
    const { view, api } = mount(state, {}, true);
    act(() => setTabDirty(dirty.id, true));
    const dirtyTab = () => view.container.querySelector(`[data-tab-id="${dirty.id}"]`);
    const otherTab = view.container.querySelector(`[data-tab-id="${other.id}"]`);
    expect(otherTab?.hasAttribute("data-active-pane")).toBe(true);
    expect(dirtyTab()?.hasAttribute("data-active-pane")).toBe(false);
    expect(view.getByRole("img", { name: "neuložené změny" })).toBeTruthy();
    act(() => api().closeTab(dirty.id));
    expect(dirtyTab()?.hasAttribute("data-attention")).toBe(true);
    fireEvent.click(view.getByRole("button", { name: "Zpět k dokladu" }));
    expect(dirtyTab()?.hasAttribute("data-attention")).toBe(false);
  });

  it("prostřední tlačítko zavře záložku", () => {
    const { state, other } = twoPanes();
    const { view, api } = mount(state, {}, true);
    const tab = view.container.querySelector(`[data-tab-id="${other.id}"]`) as Element;
    fireEvent(tab, new MouseEvent("auxclick", { bubbles: true, button: 1 }));
    expect(api().state.panes[1].tabs).toHaveLength(0);
  });
});
