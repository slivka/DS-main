/** Evidence záloh se záložkami: záložky, sdílené datum, filtry, skupiny, rozdíl, neplátce, práva. */
import { describe, expect, it } from "bun:test";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { AdvanceRegisterView } from "../../src/components/ds/accounting/advances/advance-register-view";
import { sortWithinSegments } from "../../src/components/ds/grid/grid-sort";
import {
  advanceRegisterSegment,
  buildAdvanceRegisterRows,
} from "../../src/components/ds/accounting/advances/advance-register-view-columns";
import type {
  AdvanceRegisterTab,
  AdvanceRegisterViewProps,
} from "../../src/index";
import { advanceAccounts, advanceRegisterData } from "../../src/components/showcase/advance-register-view-data";

function setup(tab: AdvanceRegisterTab, extra: Partial<AdvanceRegisterViewProps> = {}) {
  const calls = { tab: [] as string[], open: [] as string[], filters: [] as unknown[] };
  const props: AdvanceRegisterViewProps = {
    activeTab: tab,
    onTabChange: (next) => calls.tab.push(next),
    data: advanceRegisterData("provided", tab, [], "all"),
    storageKey: `t-${tab}`,
    homeCurrency: "Kč",
    asOf: { enabled: true, onEnabledChange: () => {}, value: "2026-10-20", onChange: () => {} },
    filters: { payments: "all", settlements: "all", accounts: [] },
    onFiltersChange: (next) => calls.filters.push(next),
    accountOptions: advanceAccounts("provided"),
    onOpen: (row) => calls.open.push(row.id),
    ...extra,
  };
  const view = render(<AdvanceRegisterView {...props} />);
  return { calls, view, props };
}

describe("AdvanceRegisterView", () => {
  it("má tři záložky a jeden společný Stav k datu, který přepnutí zachová", () => {
    const { calls, view, props } = setup("balance");
    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs).toEqual(["Zůstatek", "Platby záloh", "Vyúčtování záloh"]);
    fireEvent.mouseDown(screen.getByRole("tab", { name: "Platby záloh" }));
    expect(calls.tab).toEqual(["payments"]);
    view.rerender(<AdvanceRegisterView {...props} activeTab="payments" data={advanceRegisterData("provided", "payments", [], "all")} />);
    expect(screen.getAllByRole("button", { name: /Stav k datu/ })).toHaveLength(1);
    expect(view.container.querySelectorAll('[data-slot="advance-register-as-of"]')).toHaveLength(1);
  });

  it("nabízí filtr stavu podle záložky a filtr účtů ve všech", () => {
    const balance = setup("balance");
    expect(screen.queryByText("Nevyúčtováno")).toBeNull();
    expect(screen.getAllByText("Všechny účty").length).toBeGreaterThan(0);
    balance.view.unmount();
    const payments = setup("payments");
    for (const label of ["Vše", "Nevyúčtováno", "Bez daňového dokladu", "Po lhůtě"])
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    payments.view.unmount();
    setup("settlements");
    expect(screen.getAllByText("Nespárované").length).toBeGreaterThan(0);
    expect(screen.queryByText("Nevyúčtováno")).toBeNull();
  });

  it("vykreslí skupiny účtu a partnera, součtové řádky neotevře, doklad ano", () => {
    const { calls } = setup("balance");
    expect(screen.getAllByText("314.100 – Poskytnuté zálohy – tuzemsko").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Celkem Alfa s.r.o.").length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByText("Celkem účet 314.100")[0]!);
    fireEvent.click(screen.getAllByText("Celkem")[0]!);
    expect(calls.open).toEqual([]);
    fireEvent.click(screen.getAllByText("BV 2026/014")[0]!);
    expect(calls.open).toEqual(["b1"]);
  });

  it("řadí jen uvnitř skupiny, součtové řádky zůstanou na místě", () => {
    const rows = buildAdvanceRegisterRows(
      advanceRegisterData("provided", "payments", [], "all").rows,
      "payments",
      false,
    );
    const byAmountDesc = [...rows].sort((a, b) => (b.amountHome ?? 0) - (a.amountHome ?? 0));
    const result = sortWithinSegments(rows, byAmountDesc, advanceRegisterSegment).map((r) => r.id);
    expect(result).toEqual(["account:314100", "p2", "p1", "pa1", "pc1", "account:314200", "p3", "pa2", "pc2"]);
  });

  it("nenulový rozdíl proti účtu varuje ikonou s bublinou", () => {
    const { view } = setup("balance");
    const controls = view.container.querySelectorAll('[data-slot="advance-control"]');
    expect(controls.length).toBe(2);
    const warnings = view.container.querySelectorAll('[data-slot="advance-difference-warning"]');
    expect(warnings.length).toBe(1);
    expect(warnings[0]!.getAttribute("aria-label")).toBe("Evidence nesouhlasí se zůstatkem účtu v deníku.");
    expect(within(controls[1] as HTMLElement).getByText(/Rozdíl proti účtu 314.200/)).toBeTruthy();
  });

  it("vatPayer=false skryje filtry a sloupce DD", () => {
    setup("payments", { vatPayer: false });
    expect(screen.queryByText("Bez daňového dokladu")).toBeNull();
    expect(screen.queryByText("Po lhůtě")).toBeNull();
    expect(screen.queryByText("Pokryto DD")).toBeNull();
    expect(screen.queryByText("Stav DD")).toBeNull();
    expect(screen.getAllByText("Vráceno").length).toBeGreaterThan(0);
  });

  it("neúplná práva ukážou pruh a skryjí kontrolní řádky", () => {
    const { view } = setup("balance", { scopeIncomplete: "Neúplný rozsah" });
    expect(screen.getByText("Neúplný rozsah")).toBeTruthy();
    expect(view.container.querySelectorAll('[data-slot="advance-control"]').length).toBe(0);
  });
});
