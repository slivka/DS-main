import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { Settings } from "lucide-react";

if (!GlobalRegistrator.isRegistered)
  GlobalRegistrator.register({ url: "http://localhost/", width: 1440, height: 1000 });
const realRouter = await import("@tanstack/react-router");
mock.module("@tanstack/react-router", () => ({
  ...realRouter,
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
const { act, cleanup, fireEvent, render } = await import("@testing-library/react");
const { LayoutMenu } = await import("../../src/components/ds/panes/layout-menu");
const { UserMenu } = await import("../../src/components/ds/layout/user-menu");
const { buildTabMenuActions, PaneTabsProvider, usePaneTabs } =
  await import("../../src/components/ds/panes/pane-context");
const { createPaneTabsState, createTab, reopenClosedTabInState, setLayoutInState } =
  await import("../../src/components/ds/panes/pane-state");
const { setTabDirty } = await import("../../src/components/ds/panes/pane-tab-store");
const { DsTextsProvider, DS_TEXTS_SK } = await import("../../src/ds-texts");
const { toast } = await import("sonner");

afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

describe("podmenu DS 2.75.0", () => {
  it("LayoutMenu má nové pořadí, správu vpravo a žádné ikony panelů ani hvězdičku", () => {
    const view = render(
      <LayoutMenu
        items={[{ id: "a", name: "Velmi dlouhé uložené rozložení účetního pracoviště", panes: 2 }]}
        onSave={() => undefined}
        onApply={() => undefined}
        onUpdate={() => undefined}
        onDelete={() => undefined}
      />,
    );
    fireEvent.pointerDown(view.getByRole("button", { name: "Rozložení" }), {
      button: 0,
      ctrlKey: false,
    });
    const menu = view.getByRole("menu");
    const save = view.getByRole("menuitem", { name: "Uložit aktuální jako nové…" });
    const manage = view.getByRole("menuitem", { name: "Spravovat rozložení" });
    const saved = view.getByRole("menuitem", {
      name: "Velmi dlouhé uložené rozložení účetního pracoviště",
    });
    const overwrite = view.getByRole("menuitem", { name: /Přepsat uložené aktuálním/ });
    expect(save.compareDocumentPosition(manage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(manage.compareDocumentPosition(saved) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      saved.compareDocumentPosition(overwrite) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(menu.querySelectorAll("svg")).toHaveLength(2);
    expect(menu.textContent).not.toContain("Uložená rozložení");
    expect(menu.textContent).not.toContain("Výchozí");
  });

  it("LayoutMenu bez uložených rozložení zakáže správu i přepsání", () => {
    const view = render(
      <LayoutMenu
        items={[]}
        onSave={() => undefined}
        onApply={() => undefined}
        onUpdate={() => undefined}
        onDelete={() => undefined}
      />,
    );
    fireEvent.pointerDown(view.getByRole("button", { name: "Rozložení" }), {
      button: 0,
      ctrlKey: false,
    });
    expect(
      view.getByRole("menuitem", { name: "Spravovat rozložení" }).getAttribute("data-disabled"),
    ).not.toBeNull();
    expect(
      view
        .getByRole("menuitem", { name: /Přepsat uložené aktuálním/ })
        .getAttribute("data-disabled"),
    ).not.toBeNull();
    expect(view.getByText("Zatím žádné uložené rozložení")).toBeTruthy();
  });

  it("menu záložky má jen povolené skupiny a bezpečné oddělovače", () => {
    const state = createPaneTabsState(3);
    const list = createTab({ route: "/list", kind: "list" });
    state.panes[0] = { ...state.panes[0], tabs: [list], activeTab: list.id };
    const api = {
      state,
      closeTab() {},
      moveTab() {},
      duplicateTab() {},
      closePane() {},
    };
    const actions = buildTabMenuActions(api, list.id);
    expect(actions.map((action) => action.label)).toEqual([
      "Zavřít záložku",
      "Přesunout záložku do panelu 2",
      "Přesunout záložku do panelu 3",
      "Duplikovat záložku",
      "Zavřít panel",
    ]);
    expect(actions.map((action) => !!action.separatorBefore)).toEqual([
      false,
      true,
      false,
      false,
      true,
    ]);
    expect(
      actions.some((action) =>
        /ostatní|Maximalizovat|Obnovit rozložení|Znovu otevřít/.test(action.label),
      ),
    ).toBe(false);
  });

  it("jeden panel se záznamem má právě jeden oddělovač", () => {
    const state = createPaneTabsState(1);
    const record = createTab({ route: "/record", kind: "record" });
    state.panes[0] = { ...state.panes[0], tabs: [record], activeTab: record.id };
    const api = {
      state,
      closeTab() {},
      moveTab() {},
      duplicateTab() {},
      closePane() {},
    };
    const actions = buildTabMenuActions(api, record.id);
    expect(actions.map((action) => action.label)).toEqual(["Zavřít záložku", "Zavřít panel"]);
    expect(actions.map((action) => !!action.separatorBefore)).toEqual([false, true]);
  });

  it("UserMenu má položky hned pod záhlavím, jedinou značku prostoru a akci prostoru", () => {
    const view = render(
      <UserMenu
        name="petr@example.cz"
        email="petr@example.cz"
        items={[{ label: "Můj profil" }]}
        workspaces={[{ id: "w", name: "Hlavní prostor" }]}
        activeWorkspaceId="w"
        workspaceAction={{ label: "Spravovat pracovní prostory", icon: Settings }}
        onSignOut={() => undefined}
      />,
    );
    fireEvent.pointerDown(view.getByRole("button", { name: "Uživatelská nabídka" }), {
      button: 0,
      ctrlKey: false,
    });
    const email = view.getByText("petr@example.cz");
    const profile = view.getByRole("menuitem", { name: "Můj profil" });
    const zoom = view.getByText("Velikost zobrazení");
    expect(email.compareDocumentPosition(profile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(profile.compareDocumentPosition(zoom) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(view.getByRole("menuitem", { name: "Spravovat pracovní prostory" })).toBeTruthy();
    expect(
      view.getByRole("menuitemradio", { name: "Hlavní prostor" }).querySelectorAll("svg"),
    ).toHaveLength(1);
    expect(email.parentElement?.querySelectorAll("span")).toHaveLength(1);
  });

  it("Zavřít panel odstraní všechny jeho záložky, uloží je pro obnovu a aktivuje souseda", () => {
    let initial = setLayoutInState(createPaneTabsState(1), 3);
    const tabs = [createTab({ route: "/a" }), createTab({ route: "/b" })];
    initial.panes[1] = { ...initial.panes[1], tabs, activeTab: tabs[1].id };
    initial = { ...initial, active: initial.panes[1].id };
    let api: ReturnType<typeof usePaneTabs> = null;
    function Capture() {
      api = usePaneTabs();
      return null;
    }
    function Host() {
      const [state, setState] = React.useState(initial);
      return (
        <PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
          <Capture />
        </PaneTabsProvider>
      );
    }
    render(<Host />);
    act(() => api?.closePane(initial.panes[1].id));
    expect(api?.state.panes).toHaveLength(2);
    expect(api?.state.panes.flatMap((pane) => pane.tabs)).toHaveLength(0);
    expect(api?.state.active).toBe(initial.panes[2].id);
    expect(api?.closedTabCount).toBe(2);
    act(() => api?.reopenClosedTab());
    act(() => api?.reopenClosedTab());
    expect(
      api?.state.panes
        .flatMap((pane) => pane.tabs)
        .map((tab) => tab.route)
        .sort(),
    ).toEqual(["/a", "/b"]);
  });

  it("rozepsaná záložka při zavření panelu zobrazí dotaz a Zrušit nic nezmění", () => {
    const initial = setLayoutInState(createPaneTabsState(1), 2);
    const tab = createTab({ route: "/dirty" });
    initial.panes[0] = { ...initial.panes[0], tabs: [tab], activeTab: tab.id };
    let api: ReturnType<typeof usePaneTabs> = null;
    function Capture() {
      api = usePaneTabs();
      return null;
    }
    function Host() {
      const [state, setState] = React.useState(initial);
      return (
        <PaneTabsProvider state={state} onChange={setState} shortcuts={false}>
          <Capture />
        </PaneTabsProvider>
      );
    }
    const view = render(<Host />);
    act(() => setTabDirty(tab.id, true));
    act(() => api?.closePane(initial.panes[0].id));
    expect(view.getByRole("alertdialog")).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: "Zrušit" }));
    expect(api?.state.panes).toHaveLength(2);
    expect(api?.state.panes[0].tabs[0].id).toBe(tab.id);
  });

  const mount = (initial: ReturnType<typeof createPaneTabsState>, shortcuts = false) => {
    let api: ReturnType<typeof usePaneTabs> = null;
    function Capture() {
      api = usePaneTabs();
      return null;
    }
    function Host() {
      const [state, setState] = React.useState(initial);
      return (
        <PaneTabsProvider state={state} onChange={setState} shortcuts={shortcuts}>
          <Capture />
        </PaneTabsProvider>
      );
    }
    const view = render(<Host />);
    return {
      view,
      get api() {
        return api!;
      },
    };
  };

  it("Alt+Shift+W zavře aktivní panel i jeho záložky", () => {
    let initial = setLayoutInState(createPaneTabsState(1), 2);
    const tab = createTab({ route: "/a" });
    initial.panes[1] = { ...initial.panes[1], tabs: [tab], activeTab: tab.id };
    initial = { ...initial, active: initial.panes[1].id };
    const host = mount(initial, true);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { altKey: true, shiftKey: true, code: "KeyW" }),
      );
    });
    expect(host.api.state.panes).toHaveLength(1);
    expect(host.api.closedTabCount).toBe(1);
  });

  it("zavření jediného panelu nechá prázdný panel a záložky uloží pro obnovu", () => {
    const initial = createPaneTabsState(1);
    const tabs = [createTab({ route: "/a" }), createTab({ route: "/b" })];
    initial.panes[0] = { ...initial.panes[0], tabs, activeTab: tabs[0].id };
    const host = mount(initial);
    act(() => host.api.closePane(initial.panes[0].id));
    expect(host.api.state.panes).toHaveLength(1);
    expect(host.api.state.panes[0].tabs).toHaveLength(0);
    expect(host.api.closedTabCount).toBe(2);
  });

  it("zavření panelu zruší maximalizaci", () => {
    const initial = setLayoutInState(createPaneTabsState(1), 2);
    const host = mount(initial);
    act(() => host.api.toggleMaximize(1));
    expect(host.api.maximized).toBe(1);
    act(() => host.api.closePane(host.api.state.panes[1].id));
    expect(host.api.maximized).toBeNull();
  });

  it("slučování přepínačem zavře nejstarší nerozepsané neaktivní záložky a vrátí je Alt+Shift+T", () => {
    const initial = setLayoutInState(createPaneTabsState(1), 2);
    const left = Array.from({ length: 7 }, (_, i) => ({
      ...createTab({ route: `/a-${i}` }),
      lastUsed: i + 1,
    }));
    const right = Array.from({ length: 7 }, (_, i) => ({
      ...createTab({ route: `/b-${i}` }),
      lastUsed: i + 20,
    }));
    initial.panes[0] = { ...initial.panes[0], tabs: left, activeTab: left[0].id };
    initial.panes[1] = { ...initial.panes[1], tabs: right, activeTab: right[6].id };
    const host = mount(initial);
    act(() => setTabDirty(left[1].id, true));
    act(() => host.api.setLayout(1));
    const routes = host.api.state.panes[0].tabs.map((tab) => tab.route);
    expect(routes).toHaveLength(10);
    expect(routes).toContain("/a-0");
    expect(routes).toContain("/a-1");
    expect(routes).not.toContain("/a-2");
    expect(host.api.closedTabCount).toBe(4);
    act(() => setTabDirty(left[1].id, false));
  });

  it("Alt+L otevře nabídku rozložení", () => {
    const view = render(
      <LayoutMenu
        items={[]}
        onSave={() => undefined}
        onApply={() => undefined}
        onUpdate={() => undefined}
        onDelete={() => undefined}
      />,
    );
    expect(view.queryByRole("menu")).toBeNull();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, code: "KeyL" }));
    });
    expect(view.getByRole("menu")).toBeTruthy();
  });

  it("UserMenu bez jména ukáže jen e-mail", () => {
    const view = render(<UserMenu email="jen@example.cz" onSignOut={() => undefined} />);
    fireEvent.pointerDown(view.getByRole("button", { name: "Uživatelská nabídka" }), {
      button: 0,
      ctrlKey: false,
    });
    const email = view.getByText("jen@example.cz");
    expect(email.parentElement?.querySelectorAll("span")).toHaveLength(1);
  });

  it("UserMenu ukáže sekci Pracovní prostor jen s workspaceAction bez prostorů", () => {
    const view = render(
      <UserMenu
        email="a@example.cz"
        workspaceAction={{ label: "Spravovat pracovní prostory", icon: Settings }}
        onSignOut={() => undefined}
      />,
    );
    fireEvent.pointerDown(view.getByRole("button", { name: "Uživatelská nabídka" }), {
      button: 0,
      ctrlKey: false,
    });
    expect(view.getByText("Pracovní prostor")).toBeTruthy();
    expect(view.getByRole("menuitem", { name: "Spravovat pracovní prostory" })).toBeTruthy();
    cleanup();
    const plain = render(<UserMenu email="a@example.cz" onSignOut={() => undefined} />);
    fireEvent.pointerDown(plain.getByRole("button", { name: "Uživatelská nabídka" }), {
      button: 0,
      ctrlKey: false,
    });
    expect(plain.queryByText("Pracovní prostor")).toBeNull();
  });

  it("UserMenu zkrátí dlouhý název prostoru i vlastní položky (truncate + title)", () => {
    const longName = "Velmi dlouhý název pracovního prostoru, který se nemá zalomit";
    const longLabel = "Velmi dlouhý popisek vlastní položky nabídky, který se nemá zalomit";
    const view = render(
      <UserMenu
        email="a@example.cz"
        items={[{ label: longLabel }]}
        workspaces={[{ id: "w", name: longName }]}
        activeWorkspaceId="w"
        onSignOut={() => undefined}
      />,
    );
    fireEvent.pointerDown(view.getByRole("button", { name: "Uživatelská nabídka" }), {
      button: 0,
      ctrlKey: false,
    });
    for (const text of [longName, longLabel]) {
      const span = view.getByText(text);
      expect(span.className).toContain("truncate");
      expect(span.getAttribute("title")).toBe(text);
    }
  });

  it("limitClosed bere text z DsTexts (SK) a prop texts má přednost", () => {
    const originalInfo = toast.info;
    const infoSpy = mock(originalInfo);
    toast.info = infoSpy;
    const makeState = () => {
      const state = setLayoutInState(createPaneTabsState(1), 2);
      for (const pane of state.panes) {
        const tabs = Array.from({ length: 7 }, (_, index) =>
          createTab({ route: `/${pane.id}/${index}` }),
        );
        Object.assign(pane, { tabs, activeTab: tabs[0].id });
      }
      return state;
    };
    let api: ReturnType<typeof usePaneTabs> = null;
    function Capture() {
      api = usePaneTabs();
      return null;
    }
    function Host({ texts }: { texts?: { limitClosed: string } }) {
      const [state, setState] = React.useState(makeState);
      return (
        <DsTextsProvider texts={DS_TEXTS_SK} locale="sk">
          <PaneTabsProvider state={state} onChange={setState} shortcuts={false} texts={texts}>
            <Capture />
          </PaneTabsProvider>
        </DsTextsProvider>
      );
    }
    render(<Host />);
    act(() => api?.setLayout(1));
    expect(infoSpy).toHaveBeenCalledWith(
      "Zavreté karty: 4 – v paneli môže byť najviac 10. Alt+Shift+T ich vráti.",
    );
    cleanup();
    infoSpy.mockClear();
    render(<Host texts={{ limitClosed: "Vlastní {count}/{max}" }} />);
    act(() => api?.setLayout(1));
    expect(infoSpy).toHaveBeenCalledWith("Vlastní 4/10");
    toast.info = originalInfo;
  });
});

describe("drobnosti DS 2.77.0", () => {
  const mount = (initial: ReturnType<typeof createPaneTabsState>, shortcuts = false) => {
    let api: ReturnType<typeof usePaneTabs> = null;
    function Capture() {
      api = usePaneTabs();
      return null;
    }
    function Host() {
      const [state, setState] = React.useState(initial);
      return (
        <PaneTabsProvider state={state} onChange={setState} shortcuts={shortcuts}>
          <Capture />
        </PaneTabsProvider>
      );
    }
    render(<Host />);
    return {
      get api() {
        return api!;
      },
    };
  };

  it("opakovaný keydown při držení klávesy nic nedělá (Alt+Shift+T, Alt+W, Alt+M)", () => {
    const initial = setLayoutInState(createPaneTabsState(1), 2);
    const tab = createTab({ route: "/a" });
    initial.panes[0] = { ...initial.panes[0], tabs: [tab], activeTab: tab.id };
    const host = mount(initial, true);
    act(() => host.api.closeTab(tab.id));
    expect(host.api.closedTabCount).toBe(1);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { altKey: true, shiftKey: true, code: "KeyT", repeat: true }),
      );
    });
    expect(host.api.state.panes[0].tabs).toHaveLength(0);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { altKey: true, shiftKey: true, code: "KeyT" }),
      );
    });
    expect(host.api.state.panes[0].tabs).toHaveLength(1);
    act(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { altKey: true, code: "KeyW", repeat: true }),
      );
      window.dispatchEvent(
        new KeyboardEvent("keydown", { altKey: true, code: "KeyM", repeat: true }),
      );
    });
    expect(host.api.state.panes[0].tabs).toHaveLength(1);
    expect(host.api.maximized).toBeNull();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, code: "KeyM" }));
    });
    expect(host.api.maximized).toBe(0);
  });

  it("výchozí texty nabídek odpovídají DS_TEXTS_CS (jeden zdroj)", async () => {
    const { DEFAULT_PANE_CHROME_TEXTS } =
      await import("../../src/components/ds/panes/pane-context");
    const { DEFAULT_LAYOUT_MENU_TEXTS } = await import("../../src/components/ds/panes/layout-menu");
    const { DS_TEXTS_CS } = await import("../../src/ds-texts");
    expect(DEFAULT_PANE_CHROME_TEXTS).toEqual(DS_TEXTS_CS.paneChrome);
    expect(DEFAULT_LAYOUT_MENU_TEXTS).toEqual(DS_TEXTS_CS.layoutMenu);
  });
});
