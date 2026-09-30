import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { Settings } from "lucide-react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/", width: 1440, height: 1000 });
const realRouter = await import("@tanstack/react-router");
mock.module("@tanstack/react-router", () => ({
  ...realRouter,
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => <a href={to} {...rest}>{children}</a>,
}));
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { AppZoomProvider } = await import("../../src/lib/app-zoom");
const { LayoutMenu } = await import("../../src/components/ds/panes/layout-menu");
const { UserMenu } = await import("../../src/components/ds/layout/user-menu");
const { buildTabMenuActions } = await import("../../src/components/ds/panes/pane-context");
const { createPaneTabsState, createTab } = await import("../../src/components/ds/panes/pane-state");

afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

describe("podmenu DS 2.75.0", () => {
  it("LayoutMenu má nové pořadí, správu vpravo a žádné ikony panelů ani hvězdičku", () => {
    const view = render(<LayoutMenu items={[{ id: "a", name: "Velmi dlouhé uložené rozložení účetního pracoviště", panes: 2 }]} onSave={() => undefined} onApply={() => undefined} onUpdate={() => undefined} onDelete={() => undefined} />);
    fireEvent.click(view.getByRole("button", { name: "Rozložení" }));
    const menu = view.getByRole("menu");
    const save = view.getByRole("menuitem", { name: "Uložit aktuální jako nové…" });
    const manage = view.getByRole("menuitem", { name: "Spravovat rozložení" });
    const saved = view.getByRole("menuitem", { name: "Velmi dlouhé uložené rozložení účetního pracoviště" });
    const overwrite = view.getByRole("menuitem", { name: /Přepsat uložené aktuálním/ });
    expect(save.compareDocumentPosition(manage) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(manage.compareDocumentPosition(saved) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(saved.compareDocumentPosition(overwrite) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(menu.querySelectorAll("svg")).toHaveLength(2);
    expect(menu.textContent).not.toContain("Uložená rozložení");
    expect(menu.textContent).not.toContain("Výchozí");
  });

  it("LayoutMenu bez uložených rozložení zakáže správu i přepsání", () => {
    const view = render(<LayoutMenu items={[]} onSave={() => undefined} onApply={() => undefined} onUpdate={() => undefined} onDelete={() => undefined} />);
    fireEvent.click(view.getByRole("button", { name: "Rozložení" }));
    expect(view.getByRole("menuitem", { name: "Spravovat rozložení" }).getAttribute("data-disabled")).not.toBeNull();
    expect(view.getByRole("menuitem", { name: /Přepsat uložené aktuálním/ }).getAttribute("data-disabled")).not.toBeNull();
    expect(view.getByText("Zatím žádné uložené rozložení")).toBeTruthy();
  });

  it("menu záložky má jen povolené skupiny a bezpečné oddělovače", () => {
    const state = createPaneTabsState(3);
    const list = createTab({ route: "/list", kind: "list" });
    state.panes[0] = { ...state.panes[0], tabs: [list], activeTab: list.id };
    const api = { state, closeTab() {}, closeOtherTabs() {}, moveTab() {}, duplicateTab() {}, closePane() {}, maximized: null, closedTabCount: 0, reopenClosedTab() {}, toggleMaximize() {} } as never;
    const actions = buildTabMenuActions(api, list.id);
    expect(actions.map((action) => action.label)).toEqual(["Zavřít záložku", "Přesunout záložku do panelu 2", "Přesunout záložku do panelu 3", "Duplikovat záložku", "Zavřít panel"]);
    expect(actions.map((action) => !!action.separatorBefore)).toEqual([false, true, false, false, true]);
    expect(actions.some((action) => /ostatní|Maximalizovat|Obnovit rozložení|Znovu otevřít/.test(action.label))).toBe(false);
  });

  it("jeden panel se záznamem má právě jeden oddělovač", () => {
    const state = createPaneTabsState(1);
    const record = createTab({ route: "/record", kind: "record" });
    state.panes[0] = { ...state.panes[0], tabs: [record], activeTab: record.id };
    const api = { state, closeTab() {}, closeOtherTabs() {}, moveTab() {}, duplicateTab() {}, closePane() {}, maximized: null, closedTabCount: 0, reopenClosedTab() {}, toggleMaximize() {} } as never;
    const actions = buildTabMenuActions(api, record.id);
    expect(actions.map((action) => action.label)).toEqual(["Zavřít záložku", "Zavřít panel"]);
    expect(actions.map((action) => !!action.separatorBefore)).toEqual([false, true]);
  });

  it("UserMenu má položky hned pod záhlavím, jedinou značku prostoru a akci prostoru", () => {
    const view = render(<AppZoomProvider><UserMenu name="petr@example.cz" email="petr@example.cz" items={[{ label: "Můj profil" }]} workspaces={[{ id: "w", name: "Hlavní prostor" }]} activeWorkspaceId="w" workspaceAction={{ label: "Spravovat pracovní prostory", icon: Settings }} onSignOut={() => undefined} /></AppZoomProvider>);
    fireEvent.click(view.getByRole("button", { name: "Uživatelská nabídka" }));
    const email = view.getByText("petr@example.cz");
    const profile = view.getByRole("menuitem", { name: "Můj profil" });
    const zoom = view.getByText("Velikost zobrazení");
    expect(email.compareDocumentPosition(profile) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(profile.compareDocumentPosition(zoom) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(view.getByRole("button", { name: "Spravovat pracovní prostory" })).toBeTruthy();
    expect(view.getByRole("menuitemradio", { name: "Hlavní prostor" }).querySelectorAll("svg")).toHaveLength(1);
    expect(email.parentElement?.querySelectorAll("span")).toHaveLength(1);
  });
});