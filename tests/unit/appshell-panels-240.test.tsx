import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

import { StatusBadge } from "../../src/components/ds/data-display/status-badge";

const dialogSource = readFileSync(new URL("../../src/components/ds/layout/RecordDialog.tsx", import.meta.url), "utf8");

describe("AppShell panely 2.40.0", () => {
  it("podporuje výrazný accent tón provozovatele", () => {
    const html = renderToStaticMarkup(<StatusBadge status="operator" config={{ operator: { label: "Provozovatel", tone: "accent" } }} />);
    expect(html).toContain("Provozovatel");
    expect(html).toContain("bg-operator-accent");
    expect(html).not.toContain("destructive");
  });

  it("detail jen pro čtení vykresluje záložky a skrývá Uložit", () => {
    expect(dialogSource).toContain("readOnly?: boolean");
    expect(dialogSource).toContain("tabs?: RecordDialogTab[]");
    expect(dialogSource).toContain("tabs.map((tab) => <TabsContent");
    expect(dialogSource).toContain("{readOnly ? closeLabel : cancelLabel}");
    expect(dialogSource).toContain("{!readOnly ? <Button type=\"submit\"");
  });

  it("editační dialog bez nových props zachová Zrušit a Uložit", () => {
    expect(dialogSource).toContain('readOnly = false');
    expect(dialogSource).toContain('submitLabel = "Uložit"');
    expect(dialogSource).toContain('onSubmit?.()');
  });
});