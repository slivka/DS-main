import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const companySource = readFileSync(new URL("../../src/components/ds/layout/company-switcher.tsx", import.meta.url), "utf8");
const periodSource = readFileSync(new URL("../../src/components/ds/layout/period-switcher.tsx", import.meta.url), "utf8");
const contextSource = readFileSync(new URL("../../src/components/ds/layout/context-pill.tsx", import.meta.url), "utf8");
const navigationSource = readFileSync(new URL("../../src/routes/components.navigation.tsx", import.meta.url), "utf8");

describe("CompanySwitcher 2.22.0", () => {
  it("nemá poslední firmy ani nadpis jediného seznamu", () => {
    expect(companySource).not.toMatch(/recentIds|recentLabel|allLabel|Poslední|Všechny firmy/u);
    expect(companySource).toContain("<CommandGroup>{items.map(row)}</CommandGroup>");
  });

  it("zavírá nabídku po výběru i založení", () => {
    expect(companySource).toContain("onChange(item.id); close();");
    expect(companySource).toContain("close(); onCreate();");
  });

  it("používá neutrální obrys, budovu a řízený stav", () => {
    expect(companySource).toContain("icon={Building2}");
    expect(companySource).toContain("border-grid-chrome bg-background");
    expect(companySource).toContain("open?: boolean");
    expect(companySource).toContain("onOpenChange?: (open: boolean) => void");
  });
});

describe("PeriodSwitcher 2.22.0", () => {
  it("zavírá nabídku po výběru i založení a podporuje řízený stav", () => {
    expect(periodSource).toContain("onChange(period.id); close();");
    expect(periodSource).toContain("close(); onCreate();");
    expect(periodSource).toContain("open?: boolean");
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
    for (const label of ["Otevřené", "V uzávěrce", "Uzavřené", "Bez výběru", "Firma bez období", "Světlý režim", "Tmavý režim"]) {
      expect(navigationSource).toContain(label);
    }
    expect(navigationSource).toContain("PREVIEW_WIDTHS = [1440, 1100, 390]");
    expect(navigationSource).toContain("open={companyPreviewOpen} onOpenChange={setCompanyPreviewOpen}");
  });

  it("ContextPill předává řízený stav popoveru", () => {
    expect(contextSource).toContain("<Popover open={resolvedOpen} onOpenChange={setOpen}>");
  });
});