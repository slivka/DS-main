import { describe, expect, test } from "bun:test";
import {
  isPaneLayoutVisible,
  shouldRegisterPaneLayout,
} from "../../src/components/ds/panes/pane-layout";

const el = (rects: number, w: number, h: number) => ({
  getClientRects: () => ({ length: rects }),
  getBoundingClientRect: () => ({ width: w, height: h }),
});

describe("PaneLayout – registrace v AppShellu", () => {
  test("(a) skrytý PaneLayout (hidden) main neblokuje", () => {
    expect(isPaneLayoutVisible(el(0, 0, 0))).toBe(false);
    expect(shouldRegisterPaneLayout(false, isPaneLayoutVisible(el(0, 0, 0)))).toBe(false);
  });
  test("(b) embedded se neregistruje ani zobrazený", () => {
    expect(shouldRegisterPaneLayout(true, isPaneLayoutVisible(el(1, 800, 600)))).toBe(false);
  });
  test("(c) zobrazený PaneLayout jako obsah AppShellu se registruje", () => {
    expect(shouldRegisterPaneLayout(false, isPaneLayoutVisible(el(1, 1200, 900)))).toBe(true);
  });
});
