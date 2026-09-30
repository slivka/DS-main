import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/", width: 1440, height: 1000 });
const navigateCalls: unknown[] = [];
const realRouter = await import("@tanstack/react-router");
mock.module("@tanstack/react-router", () => ({
  ...realRouter,
  useRouterState: ({ select }: { select: (state: unknown) => unknown }) => select({ location: { pathname: "/ws/firmy" } }),
  useNavigate: () => (options: unknown) => { navigateCalls.push(options); },
  Link: ({ to, children, ...rest }: { to?: string; children?: React.ReactNode }) => <a href={to} {...rest}>{children}</a>,
}));
const { act, cleanup, fireEvent, render, waitFor } = await import("@testing-library/react");
const { StandaloneShell } = await import("../../src/components/ds/layout/standalone-shell");
const { StandaloneNav } = await import("../../src/components/ds/layout/standalone-nav");
const { ContextSwitcher } = await import("../../src/components/ds/layout/context-switcher");
const { ConfirmByTypingDialog } = await import("../../src/components/ds/feedback/confirm-by-typing-dialog");
const { matchesConfirmText } = await import("../../src/components/ds/feedback/confirm-text");
const { CompanySwitcher } = await import("../../src/components/ds/layout/company-switcher");
const { DangerZone } = await import("../../src/components/ds/feedback/danger-zone");
const { NoticeBar } = await import("../../src/components/ds/feedback/notice-bar");
const { setAppZoom } = await import("../../src/lib/app-zoom");
const { AppShell } = await import("../../src/components/ds/layout/AppShell");
const { Dialog, DialogContent, DialogTitle } = await import("../../src/components/ui/dialog");

const originalMatchMedia = window.matchMedia;
const setMobile = (mobile: boolean) => {
  window.innerWidth = mobile ? 500 : 1440;
  window.matchMedia = ((query: string) => ({ matches: mobile && query.includes("max-width"), media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })) as never;
};

beforeEach(() => { localStorage.clear(); document.documentElement.style.fontSize = ""; setMobile(false); });
afterEach(() => { cleanup(); window.matchMedia = originalMatchMedia; });
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

const items = [{ id: "a", label: "Slivka Group", current: true }, { id: "b", label: "Test", trailing: "2 firmy" }];
const escape = () => act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })); });

describe("StandaloneShell – Esc", () => {
  it("bez otevřeného překryvu zavře, s dialogem ne", () => {
    let closed = 0;
    const view = render(<StandaloneShell brand="S" title="Nastavení prostoru" onClose={() => { closed += 1; }}><Dialog open><DialogContent><DialogTitle>X</DialogTitle></DialogContent></Dialog></StandaloneShell>);
    escape();
    expect(closed).toBe(0);
    view.unmount();
    render(<StandaloneShell brand="S" title="Nastavení prostoru" onClose={() => { closed += 1; }}>Obsah</StandaloneShell>);
    escape();
    expect(closed).toBe(1);
  });

  it("zpracovanou událost (defaultPrevented) ignoruje a bez onClose Zavřít nezobrazí", () => {
    let closed = 0;
    const view = render(<StandaloneShell brand="S" title="T" onClose={() => { closed += 1; }}>x</StandaloneShell>);
    const event = new KeyboardEvent("keydown", { key: "Escape", cancelable: true });
    event.preventDefault();
    act(() => { window.dispatchEvent(event); });
    expect(closed).toBe(0);
    expect(view.getByRole("button", { name: "Zavřít" })).toBeTruthy();
    cleanup();
    const bare = render(<StandaloneShell brand="S" title="T">x</StandaloneShell>);
    expect(bare.queryByRole("button", { name: "Zavřít" })).toBeNull();
    expect(bare.container.querySelector("header")).toBeTruthy();
    expect(bare.container.querySelector("main")).toBeTruthy();
    expect(bare.container.querySelector("[data-slot=standalone-sidebar]")).toBeNull();
  });

  it("Esc v otevřeném ContextSwitcheru zavře jen popover", async () => {
    let closed = 0;
    const view = render(<StandaloneShell brand="S" title="T" onClose={() => { closed += 1; }} sidebar={<ContextSwitcher label="Test" items={items} value="b" onValueChange={() => undefined} />}>x</StandaloneShell>);
    fireEvent.click(view.getByRole("button", { name: /Test/ }));
    await waitFor(() => expect(view.getByText("Slivka Group")).toBeTruthy());
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(closed).toBe(0);
    await waitFor(() => expect(view.queryByText("Slivka Group")).toBeNull());
    escape();
    expect(closed).toBe(1);
  });
});

describe("ContextSwitcher", () => {
  it("hledání až od prahu, tečka u aktuálního, akce", async () => {
    let action = 0;
    const view = render(<ContextSwitcher label="Test" description="2 firmy" items={items} value="b" onValueChange={() => undefined} actions={[{ id: "new", label: "Nový prostor…", onSelect: () => { action += 1; } }]} />);
    expect(view.getByText("TE".slice(0, 1))).toBeTruthy();
    fireEvent.click(view.getByRole("button", { name: /Test/ }));
    await waitFor(() => expect(view.getByText("Nový prostor…")).toBeTruthy());
    expect(document.querySelector("[cmdk-input]")).toBeNull();
    expect(view.getByRole("img", { name: "Aktuální" })).toBeTruthy();
    cleanup();
    const many = Array.from({ length: 6 }, (_, i) => ({ id: String(i), label: `Prostor ${i}` }));
    const big = render(<ContextSwitcher label="P" items={many} value="0" onValueChange={() => undefined} />);
    fireEvent.click(big.getByRole("button", { name: /P/ }));
    await waitFor(() => expect(document.querySelector("[cmdk-input]")).toBeTruthy());
  });
});

describe("ConfirmByTypingDialog", () => {
  it("shoda po trim, rozlišuje velikost písmen", () => {
    expect(matchesConfirmText("  Test ", "Test")).toBe(true);
    expect(matchesConfirmText("test", "Test")).toBe(false);
    expect(matchesConfirmText("", "")).toBe(false);
  });

  it("tlačítko aktivní jen při shodě a zaškrtnutí; chyba nechá dialog otevřený", async () => {
    let open = true;
    const onOpenChange = (next: boolean) => { open = next; };
    const view = render(<ConfirmByTypingDialog open onOpenChange={onOpenChange} title="Odstranit prostor" description="Nevratné" confirmText="Test" acknowledgement="Rozumím" confirmLabel="Odstranit" onConfirm={() => Promise.reject(new Error("Nepodařilo se"))} />);
    const button = () => view.getByRole("button", { name: "Odstranit" }) as HTMLButtonElement;
    const input = view.getByRole("textbox") as HTMLInputElement;
    expect(input.getAttribute("autocomplete")).toBe("off");
    expect(input.getAttribute("spellcheck")).toBe("false");
    expect(button().disabled).toBe(true);
    fireEvent.change(input, { target: { value: "Test " } });
    expect(button().disabled).toBe(true);
    fireEvent.click(view.getByRole("checkbox"));
    expect(button().disabled).toBe(false);
    await act(async () => { fireEvent.submit(input.closest("form")!); await new Promise((resolve) => setTimeout(resolve, 0)); });
    await waitFor(() => expect(view.getByText("Nepodařilo se")).toBeTruthy(), { timeout: 3000 });
    expect(open).toBe(true);
  });

  it("bez acknowledgement stačí shoda; úspěch zavře; Enter bez shody nic", async () => {
    let open = true;
    let calls = 0;
    const view = render(<ConfirmByTypingDialog open onOpenChange={(next) => { open = next; }} title="Obnovit" description="d" confirmText="obnovit" confirmLabel="Obnovit" onConfirm={async () => { calls += 1; }} />);
    const input = view.getByRole("textbox");
    fireEvent.submit(input.closest("form")!);
    expect(calls).toBe(0);
    fireEvent.change(input, { target: { value: "obnovit" } });
    fireEvent.submit(input.closest("form")!);
    await waitFor(() => expect(open).toBe(false));
    expect(calls).toBe(1);
  });
});

describe("StandaloneNav, DangerZone, NoticeBar", () => {
  const groups = [{ id: "s", label: "", section: "Prostor", items: [{ to: "/ws/udaje", label: "Údaje prostoru" }, { to: "/ws/firmy", label: "Firmy" }] }];

  it("na šířce vykreslí menu s aktivní položkou podle trasy", () => {
    const view = render(<StandaloneNav groups={groups} />);
    expect(view.getByRole("navigation")).toBeTruthy();
    expect(view.getByText("Firmy").closest("a")?.getAttribute("aria-current")).toBe("page");
    expect(view.container.querySelector('[data-nav-section="Prostor"]')).toBeTruthy();
  });

  it("pod md vykreslí výběr stránek", async () => {
    setMobile(true);
    const view = render(<StandaloneNav groups={groups} />);
    await waitFor(() => expect(view.container.querySelector("[data-slot=standalone-nav-select]")).toBeTruthy());
    expect(view.getByRole("navigation").querySelector("a")).toBeNull();
  });

  it("DangerZone má výchozí nadpis a NoticeBar neutrální tón s akcí", () => {
    const view = render(<><DangerZone items={[{ title: "Odstranit prostor", description: "Nevratné", action: <button type="button">Odstranit</button> }]} /><NoticeBar tone="neutral" actions={<button type="button">Pracovat v tomto prostoru</button>}>Upravujete prostor Test.</NoticeBar></>);
    expect(view.getByText("Nebezpečná zóna")).toBeTruthy();
    expect(view.container.querySelector('[data-tone="neutral"]')).toBeTruthy();
    expect(view.getByRole("button", { name: "Pracovat v tomto prostoru" })).toBeTruthy();
  });
});

describe("useAppZoomShortcuts v obou rámech", () => {
  const ctrlPlus = () => act(() => { window.dispatchEvent(new KeyboardEvent("keydown", { key: "+", ctrlKey: true, bubbles: true, cancelable: true })); });
  it("StandaloneShell i AppShell mění zoom aplikace klávesou Ctrl + plus", () => {
    localStorage.setItem("app:zoom", "1");
    const a = render(<StandaloneShell brand="S" title="T">x</StandaloneShell>);
    const before = document.documentElement.style.fontSize;
    ctrlPlus();
    const afterStandalone = document.documentElement.style.fontSize;
    expect(afterStandalone).not.toBe(before);
    a.unmount();
    render(<AppShell navGroups={[]} navSearch={false}><div>x</div></AppShell>);
    ctrlPlus();
    expect(document.documentElement.style.fontSize).not.toBe(afterStandalone);
  });

  it("dva rámy zároveň = jeden krok 5 %", () => {
    localStorage.setItem("app:zoom", "1");
    render(<><AppShell navGroups={[]} navSearch={false}><div>x</div></AppShell><StandaloneShell brand="S" title="T">x</StandaloneShell></>);
    act(() => { setAppZoom(1); });
    ctrlPlus();
    expect(localStorage.getItem("app:zoom")).toBe("1.05");
    expect(document.documentElement.style.fontSize).toBe("16.8px");
  });
});

describe("Doplňky po kontrole 2.79.0", () => {
  it("ContextSwitcher se 3 položkami: šipky + Enter vyberou další", async () => {
    let picked = "";
    const three = [...items, { id: "c", label: "Třetí" }];
    const view = render(<ContextSwitcher label="Test" items={three} value="b" onValueChange={(id) => { picked = id; }} />);
    fireEvent.click(view.getByRole("button", { name: /Test/ }));
    await waitFor(() => expect(document.activeElement?.hasAttribute("cmdk-root")).toBe(true));
    expect(document.querySelector('[cmdk-item][data-selected="true"]')?.textContent).toContain("Test");
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    expect(picked).toBe("c");
  });

  it("dialog nejde zavřít během běhu (Esc, overlay, X) a opakovaný Enter volá onConfirm jednou", async () => {
    let calls = 0;
    let closes = 0;
    let finish!: () => void;
    const view = render(<ConfirmByTypingDialog open onOpenChange={(next) => { if (!next) closes += 1; }} title="Smazat" description="d" confirmText="ano" confirmLabel="Smazat" onConfirm={() => { calls += 1; return new Promise<void>((resolve) => { finish = resolve; }); }} />);
    const input = view.getByRole("textbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "ano" } });
    const form = input.closest("form")!;
    await act(async () => { fireEvent.submit(form); fireEvent.submit(form); });
    expect(calls).toBe(1);
    expect(input.readOnly).toBe(true);
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    const overlay = document.querySelector("[data-state=open].fixed.inset-0") as HTMLElement | null;
    if (overlay) fireEvent.pointerDown(overlay);
    const x = view.getAllByRole("button", { name: "Zavřít" })[0];
    fireEvent.click(x);
    expect(closes).toBe(0);
    await act(async () => { finish(); });
    await waitFor(() => expect(closes).toBe(1));
  });

  it("po znovuotevření je pole prázdné; výsledek po zavření zvenku se zahodí", async () => {
    let closes = 0;
    let finish!: () => void;
    const props = { onOpenChange: (next: boolean) => { if (!next) closes += 1; }, title: "T", description: "d", confirmText: "ano", confirmLabel: "OK", onConfirm: () => new Promise<void>((resolve) => { finish = resolve; }) };
    const view = render(<ConfirmByTypingDialog open {...props} />);
    fireEvent.change(view.getByRole("textbox"), { target: { value: "ano" } });
    await act(async () => { fireEvent.submit(view.getByRole("textbox").closest("form")!); });
    view.rerender(<ConfirmByTypingDialog open={false} {...props} />);
    await act(async () => { finish(); });
    expect(closes).toBe(0);
    view.rerender(<ConfirmByTypingDialog open {...props} />);
    await waitFor(() => expect((view.getByRole("textbox") as HTMLInputElement).value).toBe(""));
  });

  it("výběr stránky na mobilu volá navigate", async () => {
    setMobile(true);
    window.innerWidth = 500;
    navigateCalls.length = 0;
    const groups = [{ id: "s", label: "", section: "Prostor", items: [{ to: "/ws/udaje", label: "Údaje prostoru" }, { to: "/ws/firmy", label: "Firmy" }] }];
    const view = render(<StandaloneNav groups={groups} />);
    const trigger = await waitFor(() => view.getByRole("combobox"));
    expect(view.getByRole("navigation")).toBeTruthy();
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    const option = await waitFor(() => view.getByRole("option", { name: "Údaje prostoru" }));
    fireEvent.click(option);
    await waitFor(() => expect(navigateCalls.length).toBe(1));
    expect((navigateCalls[0] as { to: string }).to).toBe("/ws/udaje");
    window.innerWidth = 1440;
  });

  it("CompanySwitcher bez actions beze změny, s actions zobrazí akci", async () => {
    const companies = [{ id: "1", name: "Alfa" }];
    const plain = render(<CompanySwitcher items={companies} value="1" onChange={() => undefined} open onOpenChange={() => undefined} />);
    await waitFor(() => expect(plain.getAllByText("Alfa").length).toBeGreaterThan(0));
    expect(document.querySelector("[data-slot=company-switcher-actions]")).toBeNull();
    cleanup();
    let done = 0;
    const withActions = render(<CompanySwitcher items={companies} value="1" onChange={() => undefined} open onOpenChange={() => undefined} actions={[{ id: "m", label: "Spravovat firmy…", onSelect: () => { done += 1; } }]} />);
    fireEvent.click(await waitFor(() => withActions.getByRole("button", { name: "Spravovat firmy…" })));
    expect(done).toBe(1);
  });
});

describe("ContextSwitcher – diakritika", () => {
  it("„treti“ najde „Třetí“", async () => {
    const many = [...Array.from({ length: 5 }, (_, i) => ({ id: String(i), label: `Prostor ${i}` })), { id: "t", label: "Třetí" }];
    const view = render(<ContextSwitcher label="P" items={many} value="0" onValueChange={() => undefined} />);
    fireEvent.click(view.getByRole("button", { name: /P/ }));
    const input = await waitFor(() => document.querySelector("[cmdk-input]") as HTMLInputElement);
    fireEvent.change(input, { target: { value: "treti" } });
    await waitFor(() => expect(document.querySelectorAll("[cmdk-item]:not([hidden])").length).toBe(1));
    expect(view.getByText("Třetí")).toBeTruthy();
  });
});
