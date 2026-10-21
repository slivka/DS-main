import { afterEach, describe, expect, it, mock } from "bun:test";
import * as React from "react";
const { render, cleanup, fireEvent, screen, within } = await import("@testing-library/react");
const { GridAddActions } = await import("../../src/components/ds/grid/grid-add-actions");
const { GridToolbarOverflowContext } =
  await import("../../src/components/ds/grid/grid-toolbar-context");
const { DropdownMenuItem } = await import("../../src/components/ui/dropdown-menu");
afterEach(cleanup);

const splitMenu = (onPick: () => void) => (
  <DropdownMenuItem onSelect={onPick}>Prázdný doklad</DropdownMenuItem>
);

describe("split primární akce lišty gridu", () => {
  it("zakázaná šipka neotevře nabídku a klik ukáže důvod", () => {
    const primary = mock();
    const pick = mock();
    const view = render(<GridAddActions actions={{ label: "Nový", disabled: true,
      disabledReason: "Chybí oprávnění", onClick: primary, menu: splitMenu(pick) }} />);
    const arrow = view.getByRole("button", { name: "Nový – Nabídka" });
    fireEvent.pointerDown(arrow, { button: 0, pointerType: "mouse" });
    fireEvent.click(arrow);
    expect(view.queryByRole("menu")).toBeNull();
    expect(view.getByRole("tooltip").textContent).toBe("Chybí oprávnění");
    for (const key of ["Enter", " ", "ArrowDown"]) fireEvent.keyDown(arrow, { key });
    expect(view.queryByRole("menuitem")).toBeNull();
    expect(primary).not.toHaveBeenCalled();
    expect(pick).not.toHaveBeenCalled();
  });
  it("hlavní klik a šipka mají vlastní přístupné názvy a zkratka N spustí hlavní akci", () => {
    const primary = mock();
    const pick = mock();
    render(<GridAddActions actions={{ label: "Nový", onClick: primary, menu: splitMenu(pick) }} />);
    const main = screen.getByRole("button", { name: "Nový (N)" });
    const chevron = screen.getByRole("button", { name: "Nový – Nabídka" });
    fireEvent.click(main);
    expect(primary).toHaveBeenCalledTimes(1);
    expect(pick).not.toHaveBeenCalled();
    fireEvent.keyDown(chevron, { key: "Enter" });
    fireEvent.click(screen.getByRole("menuitem", { name: "Prázdný doklad" }));
    expect(pick).toHaveBeenCalledTimes(1);
    expect(primary).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: "n" });
    expect(primary).toHaveBeenCalledTimes(2);
  });

  it("dvě split tlačítka Příjem / Výdaj mají nezávislé hlavní kliky i nabídky", () => {
    const income = mock();
    const expense = mock();
    render(
      <GridAddActions
        actions={[
          { label: "Příjem", onClick: income, menu: splitMenu(() => {}) },
          { label: "Výdaj", onClick: expense, menu: splitMenu(() => {}) },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Příjem (N)" }));
    expect(income).toHaveBeenCalledTimes(1);
    expect(expense).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Výdaj" }));
    expect(expense).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document.body, { key: "N" });
    expect(income).toHaveBeenCalledTimes(2);
    expect(expense).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(screen.getByRole("button", { name: "Výdaj – Nabídka" }), { key: "Enter" });
    expect(screen.getByRole("menu")).toBeTruthy();
  });

  it("v úzkém podokně se split akce sloučí do „+ ▾“ jako podnabídka", () => {
    const primary = mock();
    render(
      <GridToolbarOverflowContext.Provider value={3}>
        <GridAddActions
          actions={[
            {
              label: "Nový příjem",
              shortLabel: "Příjem",
              onClick: primary,
              menu: splitMenu(() => {}),
            },
            { label: "Nový výdaj", shortLabel: "Výdaj", onClick: () => {} },
          ]}
        />
      </GridToolbarOverflowContext.Provider>,
    );
    // Split tlačítka zůstávají v DOM skrytá (zkratka N), viditelné je jen „+ ▾“.
    expect(screen.getByRole("button", { name: "Nový příjem (N)" }).className).toContain("hidden");
    expect(screen.getByRole("button", { name: "Nový příjem – Nabídka" }).className).toContain(
      "hidden",
    );
    const merged = screen.getByRole("button", { name: "Nový – vyberte druh" });
    expect(merged.className).not.toContain("hidden");
    fireEvent.keyDown(merged, { key: "Enter" });
    const menu = screen.getByRole("menu");
    const sub = within(menu).getByRole("menuitem", { name: "Příjem" });
    fireEvent.keyDown(sub, { key: "ArrowRight" });
    // Zkratka N funguje i ve sloučeném stavu.
    fireEvent.keyDown(document.body, { key: "n" });
    expect(primary).toHaveBeenCalledTimes(1);
  });
});
