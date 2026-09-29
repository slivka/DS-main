import { describe, expect, it } from "bun:test";

import { clampAppZoom, effectiveViewportWidth, estimateAppZoom, isAppZoomShortcut } from "../../src/lib/app-zoom";
import { calculateAutoGridZoom } from "../../src/components/ds/grid/grid-auto-zoom";
import { maxPaneLayout } from "../../src/components/ds/panes/pane-layout";

describe("DS 2.64 – zoom aplikace", () => {
  it("odhaduje zoom podle šířky zařízení", () => {
    expect([1365, 1366, 1919, 1920, 2559, 2560].map(estimateAppZoom)).toEqual([0.9, 1, 1, 1.1, 1.1, 1.25]);
  });

  it("omezuje a zaokrouhluje rozsah 70–200 % po 5 %", () => {
    expect(clampAppZoom(0.2)).toBe(0.7);
    expect(clampAppZoom(1.124)).toBe(1.1);
    expect(clampAppZoom(4)).toBe(2);
  });

  it("rozpoznává klávesy podle code a ignoruje AltGraph", () => {
    const key = (code: string, altGraph = false) => ({ code, ctrlKey: true, altKey: true, metaKey: false, getModifierState: () => altGraph });
    expect(isAppZoomShortcut(key("Equal"))).toBe("increase");
    expect(isAppZoomShortcut(key("Minus"))).toBe("decrease");
    expect(isAppZoomShortcut(key("Digit0"))).toBe("reset");
    expect(isAppZoomShortcut(key("Equal", true))).toBeNull();
  });

  it("používá efektivní šířku pro panely", () => {
    expect(effectiveViewportWidth(1536, 1.2)).toBe(1280);
    expect(maxPaneLayout(1536, 560, 1.2)).toBe(2);
  });
});

describe("DS 2.64 – automatický zoom gridu", () => {
  it("zaokrouhluje dolů po 5 % a drží 75–100 %", () => {
    expect(calculateAutoGridZoom(850, 1000)).toBe(0.85);
    expect(calculateAutoGridZoom(749, 1000)).toBe(0.75);
    expect(calculateAutoGridZoom(1200, 1000)).toBe(1);
    expect(calculateAutoGridZoom(0, 1000)).toBeNull();
  });
});