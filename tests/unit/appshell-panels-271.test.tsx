import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { Settings } from "lucide-react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/", width: 1440, height: 1000 });
const realRouter = await import("@tanstack/react-router");
mock.module("@tanstack/react-router", () => ({
  ...realRouter,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) => select({ location: { pathname: "/" } }),
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => <a href={to} {...rest}>{children}</a>,
}));
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { AppShell } = await import("../../src/components/ds/layout/AppShell");

const companyNav = [{ id: "company", label: "Firma", items: [{ to: "/", label: "Firemní údaje" }] }];
const workspaceNav = [{ id: "workspace", label: "Prostor", items: [{ to: "/", label: "Uživatelé" }] }];

function Shell({ oneView = false }: { oneView?: boolean }) {
  const [view, setView] = React.useState("company");
  const views = [
    { id: "company", label: "Firma", title: "Nastavení firmy", context: "Slivka Accounting", scope: "company" as const, nav: companyNav },
    ...(!oneView ? [{ id: "workspace", label: "Prostor", title: "Nastavení prostoru", context: "Slivka Group", scope: "workspace" as const, nav: workspaceNav }] : []),
  ];
  return <AppShell navGroups={[]} navSearch={false} contextLeft={<button type="button">Firma a období</button>} panels={[{ id: "settings", title: "Nastavení", icon: Settings, tooltip: "Nastavení", activeView: view, onViewChange: setView, views }]} activePanel="settings" onActivePanelChange={() => undefined}><div>Obsah</div></AppShell>;
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

describe("AppShell panely 2.71.0", () => {
  it("přepnutí části změní nadpis, kontext, navigaci a rozsah", () => {
    const view = render(<Shell />);
    expect(view.getByText("Nastavení firmy")).toBeTruthy();
    expect(view.getByText("Slivka Accounting")).toBeTruthy();
    expect(view.getByText("Firemní údaje")).toBeTruthy();
    const context = view.getByText("Firma a období").closest("[aria-disabled]");
    expect(context).toBeNull();
    fireEvent.click(view.getByRole("radio", { name: "Prostor" }));
    expect(view.getByText("Nastavení prostoru")).toBeTruthy();
    expect(view.getByText("Slivka Group")).toBeTruthy();
    expect(view.getByText("Uživatelé")).toBeTruthy();
    expect(view.getByText("Firma a období").closest("[aria-disabled=true]")).toBeTruthy();
  });

  it("přepínač je v DOM před nadpisem a panelové menu má panel tone", () => {
    const view = render(<Shell />);
    const segment = view.getByRole("radiogroup", { name: "Část panelu" });
    const heading = view.getByText("Nastavení firmy").closest('[data-slot="app-shell-panel-heading"]');
    expect(segment.compareDocumentPosition(heading as Node) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(document.querySelector("aside")?.getAttribute("data-sidebar-tone")).toBe("panel");
  });

  it("jedna část nemá přepínač", () => {
    const view = render(<Shell oneView />);
    expect(view.queryByRole("radiogroup", { name: "Část panelu" })).toBeNull();
  });
});