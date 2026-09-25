import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { hasOverflowRight } from "../../src/components/ds/grid/grid-zoom";

const dataGridSource = readFileSync(new URL("../../src/components/ds/grid/DataGrid.tsx", import.meta.url), "utf8");
const treeGridSource = readFileSync(new URL("../../src/components/ds/grid/TreeGrid.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");

describe.each([
  ["DataGrid", dataGridSource],
  ["TreeGrid", treeGridSource],
])("lišta %s ve verzi 2.21.1", (_name, source) => {
  it("skrývá společnou úzkou nabídku nad 640 px", () => {
    expect(source).toContain('className="@min-[640px]:hidden"');
    expect(source).not.toContain('className="@min-[640px]:inline-flex"');
  });

  it("ponechává Stav k datu a toolbarLeft viditelné v úzkém gridu", () => {
    expect(source).toMatch(/<\/span>\{asOf \? <AsOfDateToggle/);
    expect(source).toContain("{toolbarLeft}");
  });

  it("řadí širokou nabídku dalších akcí před zoom a obnovení", () => {
    const desktop = source.match(/<div className="hidden @min-\[640px\]:contents">\{moreActions[\s\S]*?<ZoomControl[\s\S]*?<GridRefreshButton/)?.[0];
    expect(desktop).toBeTruthy();
    expect(desktop?.indexOf("<GridMoreMenu")).toBeLessThan(desktop?.indexOf("<ZoomControl") ?? 0);
    expect(desktop?.indexOf("<ZoomControl")).toBeLessThan(desktop?.indexOf("<GridRefreshButton") ?? 0);
  });
});

describe("stín pravého sloupce akcí", () => {
  it("je aktivní na začátku přetékající tabulky a zmizí úplně vpravo", () => {
    expect(hasOverflowRight({ scrollLeft: 0, clientWidth: 600, scrollWidth: 900 } as HTMLElement)).toBe(true);
    expect(hasOverflowRight({ scrollLeft: 299, clientWidth: 600, scrollWidth: 900 } as HTMLElement)).toBe(false);
  });

  it("používá výstižný atribut overflow-right", () => {
    expect(stylesSource).toContain('[data-overflow-right="true"]');
    expect(stylesSource).not.toContain("data-scrolled-x");
  });
});