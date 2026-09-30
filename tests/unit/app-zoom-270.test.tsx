import { GlobalRegistrator } from "@happy-dom/global-registrator";
import { afterAll, afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";

if (!GlobalRegistrator.isRegistered)
  GlobalRegistrator.register({ url: "http://localhost/", width: 1600, height: 1000 });
// Navigace není předmětem testu; AppShell potřebuje jen aktuální cestu a Link.
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
const { act, cleanup, render } = await import("@testing-library/react");
const {
  APP_WHEEL_INTERVAL,
  createAppWheelZoom,
  getAppZoom,
  isAppZoomShortcut,
  resetAppZoomCacheForTests,
  setAppZoom,
} = await import("../../src/lib/app-zoom");
const { AppShell } = await import("../../src/components/ds/layout/AppShell");
const { ZoomGrid } = await import("../../src/components/ds/grid/grid-zoom");
const { TooltipProvider } = await import("../../src/components/ui/tooltip");
const { resolveJournalZoomLayout } =
  await import("../../src/components/ds/accounting/journal-lines-editor");
const { calculateAutoGridZoom } = await import("../../src/components/ds/grid/grid-auto-zoom");
const { readFileSync } = await import("node:fs");
async function renderShell() {
  const view = render(<Shell />);
  await view.findByLabelText("Pole");
  return view;
}

const setPlatform = (platform: string) =>
  Object.defineProperty(navigator, "platform", { value: platform, configurable: true });

beforeEach(() => {
  localStorage.clear();
  resetAppZoomCacheForTests();
  setPlatform("Win32");
});
afterEach(() => cleanup());
afterAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  if (GlobalRegistrator.isRegistered) await GlobalRegistrator.unregister();
});

type K = {
  key: string;
  code: string;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  altGraph?: boolean;
};
const key = ({ key, code, ctrl = false, meta = false, alt = false, altGraph = false }: K) => ({
  key,
  code,
  ctrlKey: ctrl,
  metaKey: meta,
  altKey: alt,
  getModifierState: (m: string) => m === "AltGraph" && altGraph,
});

describe("DS 2.70 – zkratky zoomu aplikace", () => {
  it("US rozložení", () => {
    expect(isAppZoomShortcut(key({ key: "=", code: "Equal", ctrl: true }), false)).toBe("increase");
    expect(
      isAppZoomShortcut(key({ key: "+", code: "Equal", ctrl: true, shift: true }), false),
    ).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "-", code: "Minus", ctrl: true }), false)).toBe("decrease");
    expect(isAppZoomShortcut(key({ key: "0", code: "Digit0", ctrl: true }), false)).toBe("reset");
  });
  it("CZ rozložení", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "Digit1", ctrl: true }), false)).toBe(
      "increase",
    );
    expect(isAppZoomShortcut(key({ key: "-", code: "Slash", ctrl: true }), false)).toBe("decrease");
    expect(
      isAppZoomShortcut(key({ key: "0", code: "Digit0", ctrl: true, shift: true }), false),
    ).toBe("reset");
    // „=“ na CZ je na Minus – musí zvětšit, ne zmenšit.
    expect(isAppZoomShortcut(key({ key: "=", code: "Minus", ctrl: true }), false)).toBe("increase");
  });
  it("numerická klávesnice", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "NumpadAdd", ctrl: true }), false)).toBe(
      "increase",
    );
    expect(isAppZoomShortcut(key({ key: "-", code: "NumpadSubtract", ctrl: true }), false)).toBe(
      "decrease",
    );
    expect(isAppZoomShortcut(key({ key: "Insert", code: "Numpad0", ctrl: true }), false)).toBe(
      "reset",
    );
  });
  it("Mac: Cmd funguje, Ctrl nic", () => {
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", meta: true }), true)).toBe("increase");
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", ctrl: true }), true)).toBeNull();
    expect(isAppZoomShortcut(key({ key: "+", code: "Equal", meta: true }), false)).toBeNull();
  });
  it("Alt i AltGr ignoruje (Ctrl+Alt zrušeno)", () => {
    expect(
      isAppZoomShortcut(key({ key: "+", code: "Equal", ctrl: true, alt: true }), false),
    ).toBeNull();
    expect(
      isAppZoomShortcut(key({ key: "+", code: "Digit1", ctrl: true, altGraph: true }), false),
    ).toBeNull();
  });
});

describe("DS 2.70 – kolečko zoomu aplikace", () => {
  it("sčítá delty, jeden krok za trhnutí, limit 80 ms, deltaMode", () => {
    let time = 1000;
    const steps: number[] = [];
    const wheel = createAppWheelZoom(
      (d) => steps.push(d),
      () => time,
    );
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
        <ZoomGrid zoom={gridZoom} setZoom={setGridZoom}>
          <table>
            <tbody>
              <tr>
                <td data-testid="cell">A</td>
              </tr>
            </tbody>
          </table>
        </ZoomGrid>
        <output data-testid="grid-zoom">{gridZoom}</output>
      </AppShell>
    </TooltipProvider>
  );
}

const keydown = (target: Element, init: KeyboardEventInit) => {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
};
const wheel = (target: Element, init: WheelEventInit) => {
  const event = new WheelEvent("wheel", { bubbles: true, cancelable: true, ...init });
  // happy-dom nepřenáší modifikátory do WheelEvent.
  Object.defineProperty(event, "ctrlKey", { value: Boolean(init.ctrlKey) });
  Object.defineProperty(event, "metaKey", { value: Boolean(init.metaKey) });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
};

describe("DS 2.70 – AppShell: skutečné události", () => {
  it("Ctrl + „+“ v poli změní zoom aplikace a potlačí prohlížeč", async () => {
    const view = await renderShell();
    setAppZoom(1);
    const input = view.getByLabelText("Pole");
    input.focus();
    const event = keydown(input, { key: "+", code: "Digit1", ctrlKey: true });
    expect(event.defaultPrevented).toBe(true);
    expect(getAppZoom()).toBe(1.05);
    keydown(input, { key: "-", code: "Slash", ctrlKey: true });
    expect(getAppZoom()).toBe(1);
  });

  it("na Macu Cmd + „+“ v poli", async () => {
    setPlatform("MacIntel");
    const view = await renderShell();
    setAppZoom(1);
    const input = view.getByLabelText("Pole");
    expect(keydown(input, { key: "+", code: "Equal", ctrlKey: true }).defaultPrevented).toBe(false);
    expect(getAppZoom()).toBe(1);
    expect(keydown(input, { key: "+", code: "Equal", metaKey: true }).defaultPrevented).toBe(true);
    expect(getAppZoom()).toBe(1.05);
  });

  it("kolečko nad gridem mění jen grid, mimo grid aplikaci", async () => {
    const view = await renderShell();
    setAppZoom(1);
    wheel(view.getByTestId("cell"), { deltaY: -200, ctrlKey: true });
    expect(Number(view.getByTestId("grid-zoom").textContent)).toBeGreaterThan(1);
    expect(getAppZoom()).toBe(1);
    const outside = wheel(view.getByTestId("outside"), { deltaY: -200, ctrlKey: true });
    expect(outside.defaultPrevented).toBe(true);
    expect(getAppZoom()).toBe(1.05);
  });

  it("kolečko bez Ctrl/Cmd nic nemění", async () => {
    const view = await renderShell();
    setAppZoom(1);
    expect(wheel(view.getByTestId("outside"), { deltaY: -200 }).defaultPrevented).toBe(false);
    expect(getAppZoom()).toBe(1);
  });
});

describe("DS 2.70 – automat gridů a zoom aplikace", () => {
  const ids = [
    "row",
    "text",
    "debitAccount",
    "creditAccount",
    "quantity",
    "unitId",
    "unitPrice",
    "amount",
    "debitDimensionId",
    "creditDimensionId",
    "actions",
  ] as const;
  const full = resolveJournalZoomLayout({
    availableWidthRem: 1000,
    mode: "internal",
    visibleColumnIds: [...ids],
  }).fullRequiredWidthRem;
  const at = (appZoom: number, width = full + 1, manualZoom: number | null = null) =>
    resolveJournalZoomLayout({
      availableWidthRem: width,
      appZoom,
      manualZoom,
      mode: "internal",
      visibleColumnIds: [...ids],
    });

  it("1 panel: nejdřív kaskáda, po jejím vyčerpání auto zoom", () => {
    expect(at(1.1).autoZoom).toBe(1);
    expect(at(1.3).layout.hiddenColumnIds.length).toBeGreaterThan(0);
    const minimumIds = [
      "row",
      "text",
      "debitAccount",
      "creditAccount",
      "amount",
      "actions",
    ] as const;
    const minimumFull = resolveJournalZoomLayout({
      availableWidthRem: 1000,
      mode: "internal",
      visibleColumnIds: [...minimumIds],
    }).fullRequiredWidthRem;
    const extreme = resolveJournalZoomLayout({
      availableWidthRem: minimumFull + 1,
      appZoom: 2,
      mode: "internal",
      visibleColumnIds: [...minimumIds],
    });
    expect(extreme.autoZoom).toBeLessThan(1);
    expect(extreme.zoom).toBe(0.75);
    expect(extreme.scroll).toBe(true);
  });
  it("stejná šířka v px, zoom aplikace 1,0 → 1,4: kaskáda skryje sloupce", () => {
    const base = at(1);
    const big = at(1.4);
    expect(base.layout.hiddenColumnIds).toEqual([]);
    expect(big.layout.hiddenColumnIds.length).toBeGreaterThan(0);
  });
  it("úzký panel dál dává 0,75", () => {
    expect(at(1, 20).autoZoom).toBe(0.75);
    expect(at(1.3, 20).autoZoom).toBe(0.75);
  });
  it("ruční zoom zůstává a běžný grid započítá zoom aplikace", () => {
    expect(at(1.3, full, 1.2).zoom).toBe(1.2);
    expect(calculateAutoGridZoom(850, 1000)).toBe(0.85);
    expect(calculateAutoGridZoom(850, 1000, 1.3)).toBe(0.75);
    const source = readFileSync("src/components/ds/grid/grid-auto-zoom.ts", "utf8");
    expect(source).toContain('querySelector<HTMLElement>(".zoom-grid")?.clientWidth');
    expect(source).toContain("initialized.current && !fromAppZoom");
  });

  it("DataGrid a TreeGrid zmenší auto zoom až při hrozícím přetečení", () => {
    expect(calculateAutoGridZoom(560, 500, 1)).toBe(1);
    expect(calculateAutoGridZoom(560, 500, 1.1)).toBe(1);
    expect(calculateAutoGridZoom(560, 500, 1.3)).toBe(0.85);
    expect(calculateAutoGridZoom(560, 500, 1.6)).toBe(0.75);
    expect(calculateAutoGridZoom(560, 500, 2)).toBe(0.75);
  });

  it("bez rolování se editor vejde i s rezervou zaokrouhlení", () => {
    for (const widthPx of [560, 600, 700, 800, 1100])
      for (const appZoom of [1, 1.1, 1.3, 1.6, 2]) {
        const result = resolveJournalZoomLayout({
          availableWidthRem: widthPx / 16,
          appZoom,
          mode: "internal",
          visibleColumnIds: [...ids],
        });
        if (!result.scroll)
          expect(result.layout.requiredWidthRem).toBeLessThanOrEqual(widthPx / 16 - 1 / 16);
        if (result.scroll) {
          expect(result.zoom).toBe(0.75);
          expect(result.layout.hiddenColumnIds.length).toBeGreaterThan(0);
        }
      }
  });
});
