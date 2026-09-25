import { describe, expect, it } from "vitest";

import { hasOverflowRight } from "../../src/components/ds/grid/grid-zoom";
import { calculateGridToolbarOverflowLevel, type GridToolbarWidths } from "../../src/components/ds/grid/grid-toolbar";

describe("výpočet úrovně řádku akcí", () => {
  const widths: GridToolbarWidths = { container: 900, leftFull: 260, leftCompact: 150, findFull: 180, findCompact: 72, display: 240, data: 180, menu: 36, refresh: 36, gap: 8, padding: 16, hasMenuItems: false };
  it("volí nejnižší úroveň podle součtu přirozených šířek", () => {
    expect(calculateGridToolbarOverflowLevel(widths)).toBe(1);
    expect(calculateGridToolbarOverflowLevel({ ...widths, container: 700 })).toBe(2);
    expect(calculateGridToolbarOverflowLevel({ ...widths, container: 500 })).toBe(3);
  });
  it("vrací nižší úroveň až s rezervou hystereze", () => {
    const nearBoundary = { ...widths, container: 748 };
    expect(calculateGridToolbarOverflowLevel(nearBoundary, 2, 0)).toBe(1);
    expect(calculateGridToolbarOverflowLevel(nearBoundary, 2, 16)).toBe(2);
    expect(calculateGridToolbarOverflowLevel({ ...widths, container: 756 }, 2, 16)).toBe(1);
  });
});

describe("pravý stín gridu", () => {
  it("počítá přetečení až do pravého okraje", () => {
    expect(hasOverflowRight({ scrollLeft: 0, clientWidth: 500, scrollWidth: 800 })).toBe(true);
    expect(hasOverflowRight({ scrollLeft: 300, clientWidth: 500, scrollWidth: 800 })).toBe(false);
  });
  it("používá stav data-overflow-right ve stylech", () => {
    expect(hasOverflowRight({ scrollLeft: 299.5, clientWidth: 500, scrollWidth: 800 })).toBe(false);
  });
});
