import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
import { Settings } from "lucide-react";

const realRouter = await import("@tanstack/react-router");
mock.module("@tanstack/react-router", () => ({
  ...realRouter,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) =>
    select({ location: { pathname: "/" } }),
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
const { cleanup, fireEvent, render } = await import("@testing-library/react");
const { AppShell } = await import("../../src/components/ds/layout/AppShell");

const companyNav = [
  { id: "company", label: "Firma", items: [{ to: "/", label: "Firemní údaje" }] },
];
const workspaceNav = [
  { id: "workspace", label: "Prostor", items: [{ to: "/", label: "Uživatelé" }] },
];

function Shell({ oneView = false }: { oneView?: boolean }) {
  const [view, setView] = React.useState("company");
  const views = [
    {
      id: "company",
      label: "Firma",
      title: "Nastavení firmy",
      context: "Slivka Accounting",
      scope: "company" as const,
      nav: companyNav,
    },
    ...(!oneView
      ? [
          {
            id: "workspace",
            label: "Prostor",
            title: "Nastavení prostoru",
            context: "Slivka Group",
            scope: "workspace" as const,
            nav: workspaceNav,
          },
        ]
      : []),
  ];
  return (
    <AppShell
      navGroups={[]}
      navSearch={false}
      contextLeft={<button type="button">Firma a období</button>}
      panels={[
        {
          id: "settings",
          title: "Nastavení",
          icon: Settings,
          tooltip: "Nastavení",
          activeView: view,
          onViewChange: setView,
          views,
        },
      ]}
      activePanel="settings"
      onActivePanelChange={() => undefined}
    >
      <div>Obsah</div>
    </AppShell>
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

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
    const heading = view
      .getByText("Nastavení firmy")
      .closest('[data-slot="app-shell-panel-heading"]');
    expect(
      segment.compareDocumentPosition(heading as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(document.querySelector("aside")?.getAttribute("data-sidebar-tone")).toBe("panel");
  });

  it("jedna část nemá přepínač", () => {
    const view = render(<Shell oneView />);
    expect(view.queryByRole("radiogroup", { name: "Část panelu" })).toBeNull();
  });
});
describe("AppShell panely 2.71.0 – chování", () => {
  const nav = (label: string) => [{ id: label, label: "", items: [{ to: "/", label }] }];

  it("šipky, Home a End v přepínači volají onViewChange a přesouvají fokus", () => {
    const calls: string[] = [];
    const views = [
      { id: "firma", label: "Firma", title: "A", nav: nav("a") },
      { id: "prostor", label: "Prostor", title: "B", nav: nav("b") },
    ];
    const view = render(
      <AppShell
        navGroups={[]}
        navSearch={false}
        panels={[
          {
            id: "s",
            title: "S",
            icon: Settings,
            tooltip: "S",
            views,
            activeView: "firma",
            onViewChange: (id) => calls.push(id),
          },
        ]}
        activePanel="s"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>,
    );
    const firma = view.getByRole("radio", { name: "Firma" });
    fireEvent.keyDown(firma, { key: "ArrowRight" });
    expect(calls).toEqual(["prostor"]);
    expect(document.activeElement?.textContent).toBe("Prostor");
    fireEvent.keyDown(firma, { key: "End" });
    fireEvent.keyDown(firma, { key: "Home" });
    expect(calls).toEqual(["prostor", "prostor", "firma"]);
  });

  it("neplatné activeView použije první část a ve vývoji varuje", () => {
    const warn = mock(() => undefined);
    const original = console.warn;
    console.warn = warn;
    const views = [
      { id: "firma", label: "Firma", title: "Nastavení firmy", nav: nav("a") },
      { id: "prostor", label: "Prostor", title: "B", nav: nav("b") },
    ];
    const shell = (
      <AppShell
        navGroups={[]}
        navSearch={false}
        panels={[{ id: "s", title: "S", icon: Settings, tooltip: "S", views, activeView: "neni" }]}
        activePanel="s"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>
    );
    const view = render(shell);
    view.rerender(shell);
    console.warn = original;
    expect(view.getByText("Nastavení firmy")).toBeTruthy();
    if (import.meta.env?.DEV) expect(warn).toHaveBeenCalledTimes(2);
  });

  it("stejné upozornění na chybějící onViewChange vypíše jen jednou", () => {
    const warn = mock(() => undefined);
    const original = console.warn;
    console.warn = warn;
    const views = [
      { id: "firma", label: "Firma", title: "A", nav: nav("a") },
      { id: "prostor", label: "Prostor", title: "B", nav: nav("b") },
    ];
    const shell = (
      <AppShell
        navGroups={[]}
        navSearch={false}
        panels={[{ id: "s", title: "S", icon: Settings, tooltip: "S", views, activeView: "firma" }]}
        activePanel="s"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>
    );
    const view = render(shell);
    view.rerender(shell);
    console.warn = original;
    if (import.meta.env?.DEV) expect(warn).toHaveBeenCalledTimes(1);
  });

  it("scope platform na úrovni panelu zašední kontext, nápověda je dostupná klávesnicí a přepsatelná", () => {
    const view = render(
      <AppShell
        navGroups={[]}
        navSearch={false}
        contextDisabledHint="Vlastní nápověda"
        contextLeft={
          <>
            <button type="button">Firma</button>
            <button type="button">Období</button>
          </>
        }
        panels={[
          {
            id: "a",
            title: "Admin",
            icon: Settings,
            tooltip: "A",
            scope: "platform",
            nav: nav("x"),
          },
        ]}
        activePanel="a"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>,
    );
    const wrapper = view.getByText("Firma").closest("[aria-disabled=true]") as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.getAttribute("tabindex")).toBe("0");
    const hint = document.getElementById(wrapper.getAttribute("aria-describedby") ?? "");
    expect(hint?.textContent).toBe("Vlastní nápověda");
  });

  it("výchozí text nápovědy a scope company bez aria-describedby", () => {
    const panel = (scope: "company" | "workspace") => [
      { id: "a", title: "A", icon: Settings, tooltip: "A", scope, nav: nav("x") },
    ];
    const ws = render(
      <AppShell
        navGroups={[]}
        navSearch={false}
        contextLeft={<button type="button">Firma</button>}
        panels={panel("workspace")}
        activePanel="a"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>,
    );
    expect(ws.getByText(/Firma a období se tady neuplatní/)).toBeTruthy();
    cleanup();
    const co = render(
      <AppShell
        navGroups={[]}
        navSearch={false}
        contextLeft={<button type="button">Firma</button>}
        panels={panel("company")}
        activePanel="a"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>,
    );
    expect(co.getByText("Firma").closest("[aria-describedby]")).toBeNull();
  });

  it("fragment v contextLeft dostane mezeru mezi pilulkami", () => {
    const view = render(
      <AppShell
        navGroups={[]}
        navSearch={false}
        contextLeft={
          <>
            <button type="button">Firma</button>
            <button type="button">Období</button>
          </>
        }
      >
        <div />
      </AppShell>,
    );
    const inner = view.getByText("Firma").parentElement as HTMLElement;
    expect(inner.getAttribute("data-slot")).toBe("app-shell-context");
    expect(inner.className).toContain("md:gap-5");
    expect(view.getByText("Období").parentElement).toBe(inner);
  });

  it("sidebarTone app ponechá tmavé menu i v panelu; panel bez nav má prázdné menu", () => {
    const view = render(
      <AppShell
        navGroups={[{ id: "m", label: "Hlavní", items: [{ to: "/", label: "Položka aplikace" }] }]}
        navSearch={false}
        panels={[{ id: "a", title: "A", icon: Settings, tooltip: "A", sidebarTone: "app" }]}
        activePanel="a"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>,
    );
    expect(document.querySelector("aside")?.getAttribute("data-sidebar-tone")).toBe("app");
    expect(view.queryByText("Položka aplikace")).toBeNull();
  });

  it("skupina bez popisku ignoruje localStorage i defaultCollapsed", () => {
    localStorage.setItem("ds:nav-groups:t:a:g", "true");
    const view = render(
      <AppShell
        navGroups={[]}
        navSearch={false}
        navStateKey="t"
        panels={[
          {
            id: "a",
            title: "A",
            icon: Settings,
            tooltip: "A",
            nav: [
              {
                id: "g",
                label: "",
                defaultCollapsed: true,
                items: [{ to: "/", label: "Zakázky" }],
              },
            ],
          },
        ]}
        activePanel="a"
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>,
    );
    expect(view.getByText("Zakázky")).toBeTruthy();
  });

  it("mobilní pořadí: nadpis → Zavřít, přepínač na dalším řádku a bez ikony panelu", () => {
    render(<Shell />);
    const header = document.querySelector('[data-slot="app-shell-panel-header"]') as HTMLElement;
    const order = (el: Element | null) =>
      (el?.getAttribute("class") ?? "").match(/(?:^|\s)order-(\d)/)?.[1];
    expect(order(header.querySelector('[data-slot="app-shell-panel-heading"]'))).toBe("2");
    expect(order(header.lastElementChild)).toBe("3");
    const views = header.querySelector('[data-slot="app-shell-panel-views"]');
    expect(order(views)).toBe("4");
    expect(views?.className).toContain("basis-full");
    expect(
      header.querySelector('[data-slot="app-shell-panel-heading"]')?.previousElementSibling,
    ).toBe(views);
    expect(header.querySelector(".lucide-settings")).toBeNull();
    expect(document.querySelector(".lucide-settings")).not.toBeNull();
  });

  it("titulek stránky mění jen při manageDocumentTitle", () => {
    document.title = "Doklady | TEMPO";
    const view = render(
      <AppShell appName="TEMPO">
        <div />
      </AppShell>,
    );
    expect(document.title).toBe("Doklady | TEMPO");
    view.rerender(
      <AppShell appName="TEMPO" manageDocumentTitle>
        <div />
      </AppShell>,
    );
    expect(document.title).toBe("TEMPO");
  });

  it("aktivní položka označí kontrastní variantu odznaku", () => {
    const view = render(
      <AppShell
        navGroups={[{ id: "g", label: "", items: [{ to: "/", label: "Doklady", badge: 12 }] }]}
      >
        <div />
      </AppShell>,
    );
    const active = view.getByText("Doklady").closest("[data-active=true]");
    const badge = active?.querySelector('[data-slot="shell-nav-badge"]');
    expect(active?.getAttribute("data-active")).toBe("true");
    expect(badge?.textContent).toBe("12");
  });

  it("tooltip kontextu jen při contextDisabled a bez přepnutí režimu", () => {
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...a: unknown[]) => {
      errors.push(a);
    };
    const panels = (scope: "company" | "workspace") => [
      { id: "a", title: "A", icon: Settings, tooltip: "A", scope, nav: [] },
    ];
    const shell = (scope: "company" | "workspace", active: string | null) => (
      <AppShell
        navGroups={[]}
        navSearch={false}
        contextLeft={<button type="button">Firma</button>}
        panels={panels(scope)}
        activePanel={active}
        onActivePanelChange={() => undefined}
      >
        <div />
      </AppShell>
    );
    const view = render(shell("company", "a"));
    expect(view.queryByText(/Firma a období se tady neuplatní/)).toBeNull();
    view.rerender(shell("workspace", "a"));
    expect(view.getByText(/Firma a období se tady neuplatní/)).toBeTruthy();
    view.rerender(shell("workspace", null));
    expect(view.queryByText(/Firma a období se tady neuplatní/)).toBeNull();
    console.error = original;
    expect(errors.filter((e) => String(e).includes("controlled"))).toHaveLength(0);
  });

  it("aktivní odznak používá token --sidebar-badge-active", async () => {
    const view = render(
      <AppShell
        navGroups={[{ id: "g", label: "", items: [{ to: "/", label: "Doklady", badge: 3 }] }]}
      >
        <div />
      </AppShell>,
    );
    const badge = view
      .getByText("Doklady")
      .closest("[data-active=true]")
      ?.querySelector('[data-slot="shell-nav-badge"]') as HTMLElement;
    const css = await Bun.file("src/styles.css").text();
    const cls = badge.className;
    const viaClass = cls.includes("sidebar-badge-active");
    const viaCss =
      /\[data-active=["']?true["']?\][^{]*shell-nav-badge[^{]*\{[^}]*--sidebar-badge-active/.test(
        css,
      );
    expect(viaClass || viaCss).toBe(true);
  });
});
