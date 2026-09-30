import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { DataGrid } from "../../src/components/ds/grid/DataGrid";
import { PageLayout } from "../../src/components/ds/layout/page-layout";

const squashSrc = (s: string) => s.replace(/\s+/g, " ");

const grid = (height?: "fill" | "auto") => (
  <DataGrid
    storageKey="height-test"
    height={height}
    rows={[{ id: "1", name: "A" }]}
    columns={[{ id: "name", label: "Název", value: (row) => row.name }]}
    rowKey={(row) => row.id}
  />
);

describe("DS 2.53 – výška gridu", () => {
  it("převezme fill z PageLayout list", () => {
    expect(renderToStaticMarkup(<PageLayout variant="list">{grid()}</PageLayout>)).toContain(
      'data-grid-height="fill"',
    );
  });

  it("použije auto mimo list a respektuje explicitní hodnotu", () => {
    expect(renderToStaticMarkup(grid())).toContain('data-grid-height="auto"');
    expect(renderToStaticMarkup(grid("fill"))).toContain('data-grid-height="fill"');
  });
});

describe("DS 2.53 – izolace zoomu a obnova rolování", () => {
  it("zoom a hustotu gridu drží jen koncept záložky v paměti (bez localStorage a IndexedDB)", () => {
    const source = squashSrc(readFileSync("src/components/ds/grid/grid-zoom.tsx", "utf8"));
    expect(source).toContain("`gridPreferences:${storageKey}`, { persist: false }");
    expect(source).not.toContain("localStorage");
    expect(source).toContain('density: "normal"');
  });

  it("obnovuje scroll podle tabId i po reloadu", () => {
    const source = squashSrc(readFileSync("src/components/ds/panes/pane-tab-store.ts", "utf8"));
    expect(source).toContain("`paneScroll:${tabId}:${key}`");
    expect(source).toContain("localStorage.setItem(storageId, JSON.stringify(value))");
    expect(source).toContain("element.scrollTop = saved?.top ?? 0");
  });
});
