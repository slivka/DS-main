import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered) GlobalRegistrator.register({ url: "http://localhost/", width: 1600, height: 1000 });
const { act, cleanup, render } = await import("@testing-library/react");
const { APP_WHEEL_INTERVAL, createAppWheelZoom, getAppZoom, isAppZoomShortcut, resetAppZoomCacheForTests, setAppZoom } = await import("../../src/lib/app-zoom");
const { AppShell } = await import("../../src/components/ds/layout/AppShell");
const { ZoomGrid } = await import("../../src/components/ds/grid/grid-zoom");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
const { resolveJournalZoomLayout } = await import("../../src/components/ds/accounting/journal-lines-editor");
const { calculateAutoGridZoom } = await import("../../src/components/ds/grid/grid-auto-zoom");
const { readFileSync } = await import("node:fs");

const setPlatform = (platform: string) => Object.defineProperty(navigator, "platform", { value: platform, configurable: true });

beforeEach(() => { localStorage.clear(); resetAppZoomCacheForTests(); setPlatform("Win32"); });
afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

type K = { key: string; code: string; ctrl?: boolean; meta?: boolean; alt?: boolean; shift?: boolean; altGraph?: boolean };
const key = ({ key, code, ctrl = false, meta = false, alt = false, altGraph = false }: K) => ({ key, code, ctrlKey: ctrl, metaKey: meta, altKey: alt, getModifierState: (m: string) => m === "AltGraph" && altGraph });

describe("DS 2.70 – zkratky zoomu aplikace", () => {
  it("US rozložení", () => {
    expect(isAppZoomShortcut(key({ key: "=", code: "Equal", ctrl: true }), false)).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", ctrl: true, shift: true }), false)).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "-", code: "Minus", ctrl: true }), false)).toBe("decrease");
    expect(isAppZoomShortcut(key({ key: "0", code: "Digit0", ctrl: true }), false)).toBe("reset");
  });
  it("CZ rozložení", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "Digit1", ctrl: true }), false)).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "-", code: "Slash", ctrl: true }), false)).toBe("decrease");
    expect(isAppZoomShortcut(key({ key: "0", code: "Digit0", ctrl: true, shift: true }), false)).toBe("reset");
    // „=“ na CZ je na Minus – musí zvětšit, ne zmenšit.
    expect(isAppZoomShortcut(key({ key: "=", code: "Minus", ctrl: true }), false)).toBe("increase");
  });
  it("numerická klávesnice", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "NumpadAdd", ctrl: true }), false)).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "-", code: "NumpadSubtract", ctrl: true }), false)).toBe("decrease");
    expect(isAppZoomShortcut(key({ key: "Insert", code: "Numpad0", ctrl: true }), false)).toBe("reset");
  });
  it("Mac: Cmd funguje, Ctrl nic", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", meta: true }), true)).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", ctrl: true }), true)).toBeNull();
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", meta: true }), false)).toBeNull();
  });
  it("Alt i AltGr ignoruje (Ctrl+Alt zrušeno)", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", ctrl: true, alt: true }), false)).toBeNull();
    expect(isAppZoomShortcut(key({ key: "+", code: "Digit1", ctrl: true, altGraph: true }), false)).toBeNull();
  });
});

describe("DS 2.70 – kolečko zoomu aplikace", () => {
  it("sčítá delty, jeden krok za trhnutí, limit 80 ms, deltaMode", () => {
    let time = 1000;
    const steps: number[] = [];
    const wheel = createAppWheelZoom((d) => steps.push(d), () => time);
    wheel({ deltaY: -40, deltaMode: 0 });
    wheel({ deltaY: -40, deltaMode: 0 });
    expect(steps).toEqual([]);
    wheel({ deltaY: -40, deltaMode: 0 });
    expect(steps).toEqual([1]);
    wheel({ deltaY: -500, deltaMode: 0 });
    expect(steps).toEqual([1]);
    time += APP_WHEEL_INTERVAL;
    wheel({ deltaY: 3, deltaMode: 1 });
    wheel({ deltaY: 5, deltaMode: 1 });
    expect(steps).toEqual([1, -1]);
  });
});

function Shell() {
  const [gridZoom, setGridZoom] = React.useState(1);
  return (
    <TooltipProvider>
      <AppShell navGroups={[]} navSearch={false}>
        <input aria-label="Pole" />
        <div data-testid="outside">mimo grid</div>
        <ZoomGrid zoom={gridZoom} setZoom={setGridZoom}><table><tbody><tr><td data-testid="cell">A</td></tr></tbody></table></ZoomGrid>
        <output data-testid="grid-zoom">{gridZoom}</output>
      </AppShell>
    </TooltipProvider>
  );
}

const keydown = (target: Element, init: KeyboardEventInit) => {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => { target.dispatchEvent(event); });
  return event;
};
const wheel = (target: Element, init: WheelEventInit) => {
  const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, ...init });
  act(() => { target.dispatchEvent(event); });
  return event;
};

describe("DS 2.70 – AppShell: skutečné události", () => {
  it("Ctrl + „+“ v poli změní zoom aplikace a potlačí prohlížeč", () => {
    const view = render(<Shell />);
    setAppZoom(1);
    const input = view.getByLabelText("Pole");
    input.focus();
    const event = keydown(input, { key: "+", code: "Digit1", ctrlKey: true });
    expect(event.defaultPrevented).toBe(true);
    expect(getAppZoom()).toBe(1.05);
    keydown(input, { key: "-", code: "Slash", ctrlKey: true });
    expect(getAppZoom()).toBe(1);
  });

  it("na Macu Cmd + „+“ v poli", () => {
    setPlatform("MacIntel");
    const view = render(<Shell />);
    setAppZoom(1);
    const input = view.getByLabelText("Pole");
    expect(keydown(input, { key: "+", code: "Equal", ctrlKey: true }).defaultPrevented).toBe(false);
    expect(getAppZoom()).toBe(1);
    expect(keydown(input, { key: "+", code: "Equal", metaKey: true }).defaultPrevented).toBe(true);
    expect(getAppZoom()).toBe(1.05);
  });

  it("kolečko nad gridem mění jen grid, mimo grid aplikaci", async () => {
    const view = render(<Shell />);
    setAppZoom(1);
    wheel(view.getByTestId("cell"), { deltaY: -200, ctrlKey: true });
    expect(Number(view.getByTestId("grid-zoom").textContent)).toBeGreaterThan(1);
    expect(getAppZoom()).toBe(1);
    const outside = wheel(view.getByTestId("outside"), { deltaY: -200, ctrlKey: true });
    expect(outside.defaultPrevented).toBe(true);
    expect(getAppZoom()).toBe(1.05);
  });

  it("kolečko bez Ctrl/Cmd nic nemění", () => {
    const view = render(<Shell />);
    setAppZoom(1);
    expect(wheel(view.getByTestId("outside"), { deltaY: -200 }).defaultPrevented).toBe(false);
    expect(getAppZoom()).toBe(1);
  });
});

describe("DS 2.70 – automat gridů nekompenzuje zoom aplikace", () => {
  const ids = ["row", "text", "debitAccount", "creditAccount", "quantity", "unitId", "unitPrice", "amount", "debitDimensionId", "creditDimensionId", "actions"] as const;
  const full = resolveJournalZoomLayout({ availableWidthRem: 1000, mode: "internal", visibleColumnIds: [...ids] }).fullRequiredWidthRem;
  const at = (appZoom: number, width = full + 1, manualZoom: number | null = null) => resolveJournalZoomLayout({ availableWidthRem: width, appZoom, manualZoom, mode: "internal", visibleColumnIds: [...ids] });

  it("1 panel, zoom aplikace 1,1 → 1,3: auto zoom 1,0 a kaskáda přesune sloupce", () => {
    expect(at(1.1).autoZoom).toBe(1);
    expect(at(1.3).autoZoom).toBe(1);
    expect(at(1.3).layout.hiddenColumnIds.length).toBeGreaterThan(0);
  });
  it("stejná šířka v px, zoom aplikace 1,0 → 1,4: kaskáda skryje sloupce, auto zoom zůstane 1,0", () => {
    const base = at(1);
    const big = at(1.4);
    expect(base.layout.hiddenColumnIds).toEqual([]);
    expect(big.autoZoom).toBe(1);
    expect(big.layout.hiddenColumnIds.length).toBeGreaterThan(0);
  });
  it("úzký panel dál dává 0,75", () => {
    expect(at(1, 20).autoZoom).toBe(0.75);
    expect(at(1.3, 20).autoZoom).toBe(0.75);
  });
  it("změna zoomu aplikace bez změny šířky nemění auto zoom ani ruční zoom gridu", () => {
    expect(at(1, full * 0.9).autoZoom).toBe(at(1.3, full * 0.9).autoZoom);
    expect(at(1.3, full, 1.2).zoom).toBe(1.2);
    expect(calculateAutoGridZoom(850, 1000)).toBe(0.85);
    const source = readFileSync("src/components/ds/grid/grid-auto-zoom.ts", "utf8");
    expect(source).not.toContain("rootPx / 16");
    expect(source).toContain("if (fromAppZoom && Math.abs(width - lastWidth.current) < 0.5)");
  });
});
