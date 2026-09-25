import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { hasOverflowRight } from "../../src/components/ds/grid/grid-zoom";

const dataGridSource = readFileSync(new URL("../../src/components/ds/grid/DataGrid.tsx", import.meta.url), "utf8");
const treeGridSource = readFileSync(new URL("../../src/components/ds/grid/TreeGrid.tsx", import.meta.url), "utf8");
const toolbarSource = readFileSync(new URL("../../src/components/ds/grid/grid-toolbar.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");
const moreMenuSource = readFileSync(new URL("../../src/components/ds/grid/grid-more-menu.tsx", import.meta.url), "utf8");

describe.each([
  ["DataGrid", dataGridSource],
  ["TreeGrid", treeGridSource],
])("adaptivní lišta %s", (_name, source) => {
  it("používá jednu nabídku řízenou skutečnou šířkou", () => {
    expect(source).toContain("<GridMoreMenu responsiveOverflow");
    expect(source.match(/<GridMoreMenu/g)?.length).toBe(1);
    expect(source.match(/grid-toolbar-overflow-menu/g)?.length).toBe(1);
  });

  it("drží široké skupiny v požadovaném pořadí", () => {
    const display = source.indexOf("grid-toolbar-display-group");
    const data = source.indexOf("grid-toolbar-data-group");
    expect(display).toBeGreaterThan(-1);
    expect(data).toBeGreaterThan(display);
  });

  it("drží Obnovit mimo nabídku a úplně vpravo", () => {
    expect(source).not.toContain("footer={onRefresh");
    expect(source).toContain("grid-toolbar-refresh-group");
    expect(source.indexOf("grid-toolbar-refresh-group")).toBeGreaterThan(source.indexOf("<GridMoreMenu responsiveOverflow"));
  });
});

describe("GridToolbar měření", () => {
  it("používá ResizeObserver a úrovně přetečení", () => {
    expect(toolbarSource).toContain("ResizeObserver");
    expect(toolbarSource).toContain("MutationObserver");
    expect(toolbarSource).toContain("dataset.overflowLevel");
    expect(toolbarSource).toContain("GridToolbarOverflowContext");
    expect(toolbarSource).toContain("node.scrollWidth > node.clientWidth");
    expect(toolbarSource).toContain("[1, 2, 3]");
    expect(toolbarSource).toContain("}, []);");
  });

  it("zobrazí jedinou nabídku pro přesunuté nástroje i pod 640 px", () => {
    expect(stylesSource).toContain('@container (width < 640px)');
    expect(stylesSource).toContain('.grid-toolbar-row .grid-toolbar-overflow-menu');
    expect(stylesSource).toContain('.grid-toolbar-row[data-overflow-level] .grid-toolbar-overflow-menu');
    expect(stylesSource).toContain('display: inline-flex !important');
    expect(moreMenuSource).not.toContain("footer");
  });

  it("zachovává oddělovače jen mezi skupinami", () => {
    expect(moreMenuSource).toContain("shownSecondary || shownItems.length");
    expect(moreMenuSource).toContain('shownItems.length ? "mb-[0.35em] border-b');
    expect(stylesSource).not.toContain("GridToolbarSeparator + GridToolbarSeparator");
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
