import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { StatusBadge } from "../../src/components/ds/data-display/status-badge";
import { badgeTotal } from "../../src/components/ds/layout/AppShell";

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
