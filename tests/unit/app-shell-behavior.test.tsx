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
const { act, cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { AppShell } = await import("../../src/components/ds/layout/AppShell");

const NAV = [
  {
    id: "main",
    label: "Účetnictví",
    items: [
      { to: "/journal", label: "Deník" },
      { to: "/invoices", label: "Faktury", badge: 3 },
    ],
  },
];

function Shell({
  panelOpen = false,
  scope = "company" as "company" | "workspace",
  onPanel,
}: {
  panelOpen?: boolean;
  scope?: "company" | "workspace";
  onPanel?: (id: string | null) => void;
}) {
  const [active, setActive] = React.useState<string | null>(panelOpen ? "settings" : null);
  return (
    <AppShell
      appName="Účetnictví"
      showBrand
      navGroups={NAV}
      contextLeft={<button type="button">Firma a období</button>}
      actions={<button type="button">Akce</button>}
      userMenu={<button type="button">Uživatel</button>}
      subHeader={<div>Podlišta</div>}
      panels={[
        {
          id: "settings",
          title: "Nastavení",
          icon: Settings,
          tooltip: "Nastavení",
          scope,
          context: "Slivka Group",
          badge: { label: "Provozovatel", tone: "warning" },
          accent: "warning",
          nav: [{ id: "s", label: "", items: [{ to: "/users", label: "Uživatelé" }] }],
        },
      ]}
      activePanel={active}
      onActivePanelChange={(id) => {
        setActive(id);
        onPanel?.(id);
      }}
    >
      <div>Obsah stránky</div>
    </AppShell>
  );
}

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

describe("AppShell – vykreslení", () => {
  it("vykreslí horní lištu, menu a obsah", () => {
    const view = render(<Shell />);
    const header = view.container.querySelector("header")!;
    expect(header.textContent).toContain("Účetnictví");
    expect(header.textContent).toContain("Firma a období");
    expect(header.textContent).toContain("Akce");
    expect(header.textContent).toContain("Uživatel");
    const aside = view.container.querySelector("aside")!;
    expect(aside.getAttribute("data-sidebar-tone")).toBe("app");
    expect(aside.textContent).toContain("Deník");
    expect(aside.textContent).toContain("Faktury");
    expect(view.getByText("Podlišta")).toBeTruthy();
    expect(view.container.querySelector('[data-slot="app-shell-main"]')?.textContent).toBe(
      "Obsah stránky",
    );
    expect(view.getByRole("separator", { name: "Změnit šířku menu" })).toBeTruthy();
  });

  it("otevřený panel nahradí menu, ukáže nadpis, štítek, kontext a skryje podlištu", () => {
    const view = render(<Shell panelOpen />);
    const panelHeader = view.container.querySelector('[data-slot="app-shell-panel-header"]')!;
    expect(panelHeader.className).toContain("bg-warning/10");
    expect(panelHeader.textContent).toContain("Nastavení");
    expect(panelHeader.textContent).toContain("Provozovatel");
    expect(panelHeader.textContent).toContain("Slivka Group");
    const aside = view.container.querySelector("aside")!;
    expect(aside.getAttribute("data-sidebar-tone")).toBe("panel");
    expect(aside.textContent).toContain("Uživatelé");
    expect(aside.textContent).not.toContain("Deník");
    expect(view.queryByText("Podlišta")).toBeNull();
    expect(view.getByRole("button", { name: "Nastavení", pressed: true })).toBeTruthy();
  });

  it("rozsah workspace zakáže kontext firmy a období", () => {
    const view = render(<Shell panelOpen scope="workspace" />);
    expect(view.getByText("Firma a období").closest("[aria-disabled=true]")).toBeTruthy();
  });

  it("tlačítko Zavřít i tlačítko panelu panel zavřou", () => {
    const calls: (string | null)[] = [];
    const view = render(<Shell onPanel={(id) => calls.push(id)} />);
    fireEvent.click(view.getByRole("button", { name: "Nastavení" }));
    expect(calls).toEqual(["settings"]);
    fireEvent.click(view.getByRole("button", { name: "Zavřít" }));
    expect(calls).toEqual(["settings", null]);
  });
});

describe("AppShell – klávesové zkratky", () => {
  it("Ctrl+B sbalí a znovu rozbalí menu; v poli formuláře ne", () => {
    const view = render(
      <>
        <Shell />
        <input aria-label="Pole" />
      </>,
    );
    expect(view.getByRole("button", { name: "Sbalit menu" })).toBeTruthy();
    fireEvent.keyDown(view.getByLabelText("Pole"), { key: "b", ctrlKey: true });
    expect(view.getByRole("button", { name: "Sbalit menu" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(view.getByRole("button", { name: "Rozbalit menu" })).toBeTruthy();
    expect(localStorage.getItem("app:menu-collapsed")).toBe("true");
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(view.getByRole("button", { name: "Sbalit menu" })).toBeTruthy();
  });

  it("„/“ zaměří hledání v menu", async () => {
    const view = render(<Shell />);
    await act(async () => {
      fireEvent.keyDown(window, { key: "/" });
    });
    const input = view.getByRole("textbox", { name: "Hledat v menu…" });
    await waitFor(() => expect(document.activeElement).toBe(input));
  });

  it("Escape zavře otevřený panel", () => {
    const calls: (string | null)[] = [];
    render(<Shell panelOpen onPanel={(id) => calls.push(id)} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(calls).toEqual([null]);
  });

  it("zkratky zoomu aplikace fungují dál", () => {
    render(<Shell />);
    const size = () => document.documentElement.style.fontSize;
    const before = size();
    fireEvent.keyDown(window, { key: "+", ctrlKey: true });
    if (size() === before) fireEvent.keyDown(window, { key: "+", metaKey: true });
    expect(size()).not.toBe(before);
    fireEvent.keyDown(window, { key: "0", ctrlKey: true });
    fireEvent.keyDown(window, { key: "0", metaKey: true });
    expect(size()).toBe("16px");
  });

  it("registruje jediný posluchač keydown a při odpojení ho odebere", () => {
    const added: EventListenerOrEventListenerObject[] = [];
    const removed: EventListenerOrEventListenerObject[] = [];
    const originalAdd = window.addEventListener.bind(window);
    const originalRemove = window.removeEventListener.bind(window);
    window.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions | boolean,
    ) => {
      if (type === "keydown") added.push(listener);
      originalAdd(type, listener, options);
    }) as typeof window.addEventListener;
    window.removeEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: EventListenerOptions | boolean,
    ) => {
      if (type === "keydown") removed.push(listener);
      originalRemove(type, listener, options);
    }) as typeof window.removeEventListener;
    try {
      const view = render(<Shell panelOpen />);
      // Otevření a zavření panelu ani rerender posluchače nepřepojují.
      fireEvent.keyDown(window, { key: "b", ctrlKey: true });
      view.rerender(<Shell panelOpen />);
      expect(added).toHaveLength(1);
      expect(removed).toHaveLength(0);
      view.unmount();
      expect(removed).toEqual(added);
    } finally {
      window.addEventListener = originalAdd;
      window.removeEventListener = originalRemove;
    }
  });
});

describe("AppShell – části panelu", () => {
  function ViewsShell({ views }: { views: number }) {
    const [view, setView] = React.useState("company");
    const all = [
      {
        id: "company",
        label: "Firma",
        title: "Nastavení firmy",
        context: "Alfa s.r.o.",
        nav: [{ id: "c", label: "Firma", items: [{ to: "/company", label: "Údaje firmy" }] }],
      },
      {
        id: "workspace",
        label: "Prostor",
        title: "Nastavení prostoru",
        scope: "workspace" as const,
        context: "Prostor Slivka",
        nav: [{ id: "w", label: "Prostor", items: [{ to: "/members", label: "Členové" }] }],
      },
    ].slice(0, views);
    return (
      <AppShell
        navGroups={NAV}
        contextLeft={<button type="button">Firma a období</button>}
        panels={[
          {
            id: "settings",
            title: "Nastavení",
            icon: Settings,
            tooltip: "Nastavení",
            views: all,
            activeView: view,
            onViewChange: setView,
          },
        ]}
        activePanel="settings"
      >
        <div>Obsah</div>
      </AppShell>
    );
  }

  it("část řídí nadpis, kontext, menu i rozsah; přepínač stojí před nadpisem", () => {
    const view = render(<ViewsShell views={2} />);
    const header = view.container.querySelector('[data-slot="app-shell-panel-header"]')!;
    const views = header.querySelector('[data-slot="app-shell-panel-views"]')!;
    const heading = header.querySelector('[data-slot="app-shell-panel-heading"]')!;
    expect(views.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(heading.textContent).toContain("Nastavení firmy");
    expect(heading.textContent).toContain("Alfa s.r.o.");
    expect(view.container.querySelector("aside")!.textContent).toContain("Údaje firmy");
    expect(view.getByText("Firma a období").closest("[aria-disabled=true]")).toBeNull();
    fireEvent.keyDown(view.getByRole("radio", { name: "Firma" }), { key: "ArrowRight" });
    expect(heading.textContent).toContain("Nastavení prostoru");
    expect(view.container.querySelector("aside")!.textContent).toContain("Členové");
    expect(view.getByText("Firma a období").closest("[aria-disabled=true]")).toBeTruthy();
    expect(document.activeElement).toBe(view.getByRole("radio", { name: "Prostor" }));
  });

  it("jedna část nezobrazuje přepínač", () => {
    const view = render(<ViewsShell views={1} />);
    expect(view.container.querySelector('[data-slot="app-shell-panel-views"]')).toBeNull();
  });
});

describe("AppShell – šířka menu", () => {
  it("uložená šířka nad maximem se jen omezí a v úložišti zůstane", () => {
    localStorage.setItem("app:menu-width", "40");
    const view = render(<Shell />);
    const separator = view.getByRole("separator", { name: "Změnit šířku menu" });
    expect(separator.getAttribute("aria-valuenow")).toBe("26.25");
    expect(localStorage.getItem("app:menu-width")).toBe("40");
    fireEvent.keyDown(separator, { key: "ArrowLeft" });
    expect(localStorage.getItem("app:menu-width")).toBe("25.75");
  });
});
