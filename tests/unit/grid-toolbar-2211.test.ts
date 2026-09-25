import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { hasOverflowRight } from "../../src/components/ds/grid/grid-zoom";

const dataGridSource = readFileSync(new URL("../../src/components/ds/grid/DataGrid.tsx", import.meta.url), "utf8");
const treeGridSource = readFileSync(new URL("../../src/components/ds/grid/TreeGrid.tsx", import.meta.url), "utf8");
const toolbarSource = readFileSync(new URL("../../src/components/ds/grid/grid-toolbar.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");

describe.each([
  ["DataGrid", dataGridSource],
  ["TreeGrid", treeGridSource],
])("adaptivní lišta %s", (_name, source) => {
  it("používá jednu nabídku řízenou skutečnou šířkou", () => {
    expect(source).toContain("<GridMoreMenu responsiveOverflow");
    expect(source.match(/grid-toolbar-overflow-menu/g)?.length).toBe(1);
  });

  it("drží široké skupiny v požadovaném pořadí", () => {
    const display = source.indexOf("grid-toolbar-display-group");
    const data = source.indexOf("grid-toolbar-data-group");
    expect(display).toBeGreaterThan(-1);
    expect(data).toBeGreaterThan(display);
  });
});

describe("GridToolbar měření", () => {
  it("používá ResizeObserver a úrovně přetečení", () => {
    expect(toolbarSource).toContain("ResizeObserver");
    expect(toolbarSource).toContain("dataset.overflowLevel");
    expect(toolbarSource).toContain("GridToolbarOverflowContext");
  });
});

describe("pravý stín gridu", () => {
  it("počítá přetečení až do pravého okraje", () => {
    expect(hasOverflowRight({ scrollLeft: 0, clientWidth: 500, scrollWidth: 800 })).toBe(true);
    expect(hasOverflowRight({ scrollLeft: 300, clientWidth: 500, scrollWidth: 800 })).toBe(false);
  });
  it("používá stav data-overflow-right ve stylech", () => {
    expect(stylesSource).toContain('[data-overflow-right="true"]');
  });
});
