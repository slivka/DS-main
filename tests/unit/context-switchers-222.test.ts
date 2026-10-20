import { readFileSync } from "node:fs";
import { describe, expect, it, afterEach, mock } from "bun:test";
import { createElement } from "react";
import { cleanup, render, fireEvent } from "@testing-library/react";
import { CompanySwitcher } from "../../src/components/ds/layout/company-switcher";
import { ContextPill } from "../../src/components/ds/layout/context-pill";
afterEach(cleanup);

const squashSrc = (s: string) => s.replace(/\s+/g, " ");

const companySource = squashSrc(
  readFileSync(
    new URL("../../src/components/ds/layout/company-switcher.tsx", import.meta.url),
    "utf8",
  ),
);
const periodSource = squashSrc(
  readFileSync(
    new URL("../../src/components/ds/layout/period-switcher.tsx", import.meta.url),
    "utf8",
  ),
);
const contextSource = squashSrc(
  readFileSync(new URL("../../src/components/ds/layout/context-pill.tsx", import.meta.url), "utf8"),
);
const navigationSource = squashSrc(
  readFileSync(new URL("../../src/routes/components.navigation.tsx", import.meta.url), "utf8"),
);
const showcaseSource = squashSrc(
  readFileSync(
    new URL("../../src/components/showcase/ShowcaseLayout.tsx", import.meta.url),
    "utf8",
  ),
);

describe("CompanySwitcher 2.22.0", () => {
  it("nemá poslední firmy ani nadpis jediného seznamu", () => {
    expect(companySource).not.toMatch(/recentIds|recentLabel|allLabel|Poslední|Všechny firmy/u);
    expect(companySource).toContain("<CommandGroup>{items.map(row)}</CommandGroup>");
  });

  it("zavírá nabídku po výběru i založení", () => {
    expect(companySource).toContain("onChange(item.id); close();");
    expect(companySource).toContain("close(); onCreate();");
  });

  it("řízený stav firmy oznamuje otevření a hodnotu změní až výběrem", () => {
    const opened = mock();
    const change = mock();
    const view = render(
      createElement(CompanySwitcher, {
        items: [
          { id: "a", name: "Alfa" },
          { id: "b", name: "Beta" },
        ],
        value: "a",
        onChange: change,
        open: false,
        onOpenChange: opened,
      }),
    );
    fireEvent.click(view.getByRole("combobox"));
    expect(opened).toHaveBeenCalledWith(true);
    expect(change).not.toHaveBeenCalled();
    view.rerender(
      createElement(CompanySwitcher, {
        items: [
          { id: "a", name: "Alfa" },
          { id: "b", name: "Beta" },
        ],
        value: "a",
        onChange: change,
        open: true,
        onOpenChange: opened,
      }),
    );
    fireEvent.click(view.getByRole("option", { name: "Beta" }));
    expect(change).toHaveBeenCalledWith("b");
    expect(opened).toHaveBeenCalledWith(false);
  });
});

describe("AppShell panel context 2.40.0", () => {
  it("ukázka obsahuje nové panely a všech pět stavů uživatele", () => {
    for (const label of [
      "Číselníky",
      "Administrace",
      "Nastavení prostoru",
      "Nastavení firmy",
      "Provozovatel · všechny prostory",
      "Zablokován",
      "Bez členství",
      "Nepotvrzený e-mail",
      "Archivovaný",
    ]) {
      expect(`${navigationSource}\n${showcaseSource}`).toContain(label);
    }
  });
});

describe("PeriodSwitcher 2.22.0", () => {
  it("zavírá nabídku po výběru i založení a podporuje řízený stav", () => {
    expect(periodSource).toContain("onChange(period.id); close();");
    expect(periodSource).toContain("close(); onCreate();");
    expect(periodSource).toContain("open?: boolean");
    expect(periodSource).not.toContain("useState");
  });

  it("má obrys pro všechny stavy a bez období nemá tečku", () => {
    expect(periodSource).toContain("border-success/35");
    expect(periodSource).toContain("border-warning/40");
    expect(periodSource).toContain('isEmpty ? "border-border bg-muted');
    expect(periodSource).toContain(": null;");
  });
});

describe("ukázka horní lišty", () => {
  it("obsahuje pět stavů, světlý, tmavý a kompaktní náhled", () => {
    for (const label of [
      "Otevřené",
      "V uzávěrce",
      "Uzavřené",
      "Bez výběru",
      "Firma bez období",
      "Světlý režim",
      "Tmavý režim",
    ]) {
      expect(navigationSource).toContain(label);
    }
    expect(navigationSource).toContain("PREVIEW_WIDTHS = [1440, 1100, 390]");
    expect(navigationSource).toContain(
      "open={companyPreviewOpen} onOpenChange={setCompanyPreviewOpen}",
    );
  });

  it("ContextPill předává řízený stav popoveru", () => {
    const opened = mock();
    const view = render(
      createElement(ContextPill, {
        label: "Kontext",
        value: "Alfa",
        open: false,
        onOpenChange: opened,
        children: createElement("p", null, "Obsah"),
      }),
    );
    fireEvent.click(view.getByRole("button", { name: "Kontext" }));
    expect(opened).toHaveBeenCalledWith(true);
    expect(view.queryByText("Obsah")).toBeNull();
  });
});
