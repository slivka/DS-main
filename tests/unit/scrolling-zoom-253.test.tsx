import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { DataGrid } from "../../src/components/ds/grid/DataGrid";
import { PageLayout } from "../../src/components/ds/layout/page-layout";

const grid = (height?: "fill" | "auto") => <DataGrid storageKey="height-test" height={height} rows={[{ id: "1", name: "A" }]} columns={[{ id: "name", label: "Název", value: (row) => row.name }]} rowKey={(row) => row.id} />;

describe("DS 2.53 – výška gridu", () => {
  it("převezme fill z PageLayout list", () => {
    expect(renderToStaticMarkup(<PageLayout variant="list">{grid()}</PageLayout>)).toContain('data-grid-height="fill"');
  });

  it("použije auto mimo list a respektuje explicitní hodnotu", () => {
    expect(renderToStaticMarkup(grid())).toContain('data-grid-height="auto"');
    expect(renderToStaticMarkup(grid("fill"))).toContain('data-grid-height="fill"');
  });
});

describe("DS 2.53 – izolace zoomu a obnova rolování", () => {
  it("nepoužívá globální grid-zoom-change a ukládá preference do záložky", () => {
    const source = readFileSync("src/components/ds/grid/grid-zoom.tsx", "utf8");
    expect(source).not.toContain("grid-zoom-change");
    expect(source).toContain('useTabDraft<Record<string, Required<GridPreferenceValues>>>(pane?.tabId');
    expect(source).toContain("preferences?.getDefaults(storageKey)");
    expect(source).toContain('localStorage.getItem(`zoom:${storageKey}`)');
  });

  it("obnovuje scroll podle tabId i po reloadu", () => {
    const source = readFileSync("src/components/ds/panes/pane-tab-store.ts", "utf8");
    expect(source).toContain('`paneScroll:${tabId}:${key}`');
    expect(source).toContain("localStorage.setItem(storageKey, JSON.stringify(next))");
    expect(source).toContain("node.scrollTo({ top: saved.top, left: saved.left })");
  });
});