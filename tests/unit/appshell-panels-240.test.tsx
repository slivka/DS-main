import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { StatusBadge } from "../../src/components/ds/data-display/status-badge";
import { badgeTotal } from "../../src/components/ds/layout/AppShell";

const dialogSource = readFileSync(
  new URL("../../src/components/ds/layout/RecordDialog.tsx", import.meta.url),
  "utf8",
);
const shellSource = readFileSync(
  new URL("../../src/components/ds/layout/AppShell.tsx", import.meta.url),
  "utf8",
);

describe("AppShell panely 2.40.0", () => {
  it("podporuje výrazný accent tón provozovatele", () => {
    const html = renderToStaticMarkup(
      <StatusBadge
        status="operator"
        config={{ operator: { label: "Provozovatel", tone: "accent" } }}
      />,
    );
    expect(html).toContain("Provozovatel");
    expect(html).toContain("bg-operator-accent");
    expect(html).not.toContain("destructive");
  });

  it("detail jen pro čtení vykresluje záložky a skrývá Uložit", () => {
    expect(dialogSource).toContain("readOnly?: boolean");
    expect(dialogSource).toContain("tabs?: RecordDialogTab[]");
    expect(dialogSource).toContain("tabs.map((tab) => <TabsContent");
    expect(dialogSource).toContain("{readOnly ? closeLabel : cancelLabel}");
    expect(dialogSource).toContain('{!readOnly ? <Button type="submit"');
  });

  it("editační dialog bez nových props zachová Zrušit a Uložit", () => {
    expect(dialogSource).toContain("readOnly = false");
    expect(dialogSource).toContain('submitLabel = "Uložit"');
    expect(dialogSource).toContain("onSubmit?.()");
  });

  it("část panelu řídí nadpis, kontext, menu a má přepínač před nadpisem", () => {
    expect(shellSource).toContain("currentView?.title ?? currentPanel?.title");
    expect(shellSource).toContain("currentView?.context ?? currentPanel?.context");
    expect(shellSource).toContain("currentView?.nav ?? currentPanel.nav ?? []");
    expect(shellSource.indexOf("{panelViewSwitch}")).toBeLessThan(
      shellSource.lastIndexOf("{panelHeading}"),
    );
  });

  it("jedna část nezobrazuje přepínač", () => {
    expect(shellSource).toContain("currentPanel.views.length >= 2");
  });

  it("workspace a platform zakážou kontext bez změny jeho měření", () => {
    expect(shellSource).toContain('currentScope !== "company"');
    expect(shellSource).toContain("aria-disabled={contextDisabled || undefined}");
    expect(shellSource).toContain("inert={contextDisabled || undefined}");
    expect(shellSource).toContain("const contextWidth = context.getBoundingClientRect().width");
  });

  it("panelové menu má šedý tón a běžné menu app tón", () => {
    expect(shellSource).toContain('(currentPanel ? "panel" : "app")');
    expect(shellSource).toContain("data-sidebar-tone={sidebarTone}");
  });

  it("prázdná skupina se nesbalí a view odděluje uložený stav", () => {
    expect(shellSource).toContain("const canCollapse = collapsible && Boolean(group.label)");
    expect(shellSource).toContain("${currentView.id}");
  });

  it("nečíselný odznak se nepočítá do součtu skupiny", () => {
    expect(
      badgeTotal({
        id: "vehicles",
        label: "Vozidla",
        items: [
          { to: "/", label: "Vozidla", badge: "Připravujeme" },
          { to: "/", label: "Aktivní", badge: "3" },
        ],
      }),
    ).toBe(3);
  });
});
