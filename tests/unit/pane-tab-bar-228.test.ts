import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

describe("PaneTabBar 2.28.0", () => {
  const source = readFileSync("src/components/ds/panes/pane-tab-bar.tsx", "utf8");

  it("má křížek a dirty tečku měněnou při hoveru", () => {
    expect(source).toContain('dirty && "hidden group-hover:block"');
    expect(source).toContain("group-hover:hidden");
    expect(source).toContain("size-3.5");
  });

  it("zavírá prostředním tlačítkem a popisuje neuložené změny", () => {
    expect(source).toContain("event.button !== 1");
    expect(source).toContain("api.closeTab(tab.id)");
    expect(source).toContain('`${texts.closeTab} (${texts.unsaved})`');
  });
});