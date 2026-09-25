import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { hasOverflowRight } from "../../src/components/ds/grid/grid-zoom";

const dataGridSource = readFileSync(new URL("../../src/components/ds/grid/DataGrid.tsx", import.meta.url), "utf8");
const treeGridSource = readFileSync(new URL("../../src/components/ds/grid/TreeGrid.tsx", import.meta.url), "utf8");
const stylesSource = readFileSync(new URL("../../src/styles.css", import.meta.url), "utf8");

describe.each([
  ["DataGrid", dataGridSource],
  ["TreeGrid", treeGridSource],
])("úzká lišta %s", (_name, source) => {
  it("skrývá společnou úzkou nabídku nad 640 px", () => {
    expect(source).toContain('className="@min-[640px]:hidden"');
    expect(source).not.toContain('className="@min-[640px]:inline-flex"');
  });

  it("ponechává Stav k datu a toolbarLeft viditelné v úzkém gridu", () => {
    expect(source).toMatch(/<\/span>\{asOf \? <AsOfDateToggle/);
    expect(source).toContain("{toolbarLeft}");
  });

  it("řadí nabídku po skupinách zobrazení, data a obnovení", () => {
    const narrow = source.match(/<GridMoreMenu items=\{moreActions\}[\s\S]*?className="@min-\[640px\]:hidden"/u)?.[0];
    expect(narrow).toBeTruthy();
    expect(narrow?.indexOf("tools=")).toBeLessThan(narrow?.indexOf("secondary=") ?? 0);
    expect(narrow?.indexOf("secondary=")).toBeLessThan(narrow?.indexOf("footer=") ?? 0);
  });
});

describe("široká lišta ve verzi 2.21.2", () => {
  it("řadí DataGrid jako Najít, Zobrazení, Data a Obnovit", () => {
    const desktop = dataGridSource.match(/<div className="hidden @min-\[640px\]:contents">[\s\S]*?<\/div>/u)?.[0];
    expect(desktop).toBeTruthy();
    const ordered = ["<GroupControl", "<ColumnPicker", "<ZoomControl", "<GridSelectionToggle", "{actions}", "<GridExport", "<GridMoreMenu", "<GridRefreshButton"];
    for (let index = 1; index < ordered.length; index += 1) {
      expect(desktop?.indexOf(ordered[index - 1] ?? "")).toBeLessThan(desktop?.indexOf(ordered[index] ?? "") ?? 0);
    }
    expect(desktop?.match(/<GridToolbarSeparator/g)).toHaveLength(3);
  });

  it("TreeGrid přidá oddělovač dat jen tehdy, když skupina není prázdná", () => {
    expect(treeGridSource).toContain("{(selectable || actions || exportName || moreActions.length) ? <><GridToolbarSeparator");
    expect(treeGridSource).not.toMatch(/<GridToolbarSeparator[^>]*\/>\s*<GridToolbarSeparator/u);
  });

  it("nemá krajní ani zdvojené oddělovače", () => {
    for (const source of [dataGridSource, treeGridSource]) {
      expect(source).not.toMatch(/contents">\s*<GridToolbarSeparator[^>]*\/>\s*<\/div>/u);
      expect(source).not.toMatch(/<GridToolbarSeparator[^>]*\/>\s*<GridToolbarSeparator/u);
    }
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