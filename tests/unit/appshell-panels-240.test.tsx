import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { RecordDialog } from "../../src/components/ds/layout/RecordDialog";
import { StatusBadge } from "../../src/components/ds/data-display/status-badge";

describe("AppShell panely 2.40.0", () => {
  it("podporuje výrazný accent tón provozovatele", () => {
    const html = renderToStaticMarkup(<StatusBadge status="operator" config={{ operator: { label: "Provozovatel", tone: "accent" } }} />);
    expect(html).toContain("Provozovatel");
    expect(html).toContain("bg-operator-accent");
    expect(html).not.toContain("destructive");
  });

  it("detail jen pro čtení ukazuje záložky a pouze Zavřít", () => {
    const html = renderToStaticMarkup(
      <RecordDialog
        open
        onOpenChange={() => undefined}
        title="Slivka Holding"
        readOnly
        tabs={[
          { value: "members", label: "Členové", content: <div>Obsah členů</div> },
          { value: "invitations", label: "Pozvánky", content: <div>Obsah pozvánek</div> },
          { value: "companies", label: "Firmy", content: <div>Obsah firem</div> },
        ]}
      />,
    );
    expect(html).toContain("Členové");
    expect(html).toContain("Pozvánky");
    expect(html).toContain("Firmy");
    expect(html).toContain("Zavřít");
    expect(html).not.toContain("Uložit");
    expect(html).not.toContain("Zrušit");
  });

  it("editační dialog bez nových props zachová Zrušit a Uložit", () => {
    const html = renderToStaticMarkup(<RecordDialog open onOpenChange={() => undefined} title="Editace" onSubmit={() => undefined}>Obsah</RecordDialog>);
    expect(html).toContain("Zrušit");
    expect(html).toContain("Uložit");
  });
});